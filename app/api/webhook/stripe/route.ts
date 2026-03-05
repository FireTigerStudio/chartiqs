import { findCheckoutSession } from "@/libs/stripe";
import { SupabaseClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
  typescript: true,
  httpClient: Stripe.createFetchHttpClient(),
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// This is where we receive Stripe webhook events
// It used to update the user data, send emails, etc...
// By default, it'll store the user in the database
// See more: https://shipfa.st/docs/features/payments
export async function POST(req: NextRequest) {
  const body = await req.text();

  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  let eventType;
  let event;

  // Create a private supabase client using the secret service_role API key
  const supabase = new SupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // verify Stripe event is legit
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed. ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  eventType = event.type;

  try {
    switch (eventType) {
      case "checkout.session.completed": {
        // First payment is successful and a subscription is created (if mode was set to "subscription" in ButtonCheckout)
        // ✅ Grant access to the product
        const stripeObject: Stripe.Checkout.Session = event.data
          .object as Stripe.Checkout.Session;

        const session = await findCheckoutSession(stripeObject.id);

        const customerId = session?.customer;
        const priceId = session?.line_items?.data[0]?.price.id;
        const userId = stripeObject.client_reference_id;

        console.log("checkout.session.completed:", {
          customerId,
          priceId,
          userId,
          customerEmail: stripeObject.customer_details?.email,
        });

        if (!customerId || !priceId) {
          console.error("Missing customerId or priceId from checkout session");
          break;
        }

        const customer = (await stripe.customers.retrieve(
          customerId as string
        )) as Stripe.Customer;

        let user;
        if (!userId) {
          // check if user already exists
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("email", customer.email)
            .single();
          if (profile) {
            user = profile;
          } else {
            // create a new user using supabase auth admin
            const { data } = await supabase.auth.admin.createUser({
              email: customer.email,
            });

            user = data?.user;
          }
        } else {
          // find user by ID
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

          user = profile;
        }

        console.log("Updating profile for user:", user?.id, user?.email);

        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            customer_id: customerId,
            price_id: priceId,
            has_access: true,
          })
          .eq("id", user?.id);

        if (updateError) {
          console.error("Profile update failed:", updateError);
        } else {
          console.log("Profile updated successfully for user:", user?.id);
        }

        // Extra: send email with user link, product page, etc...
        // try {
        //   await sendEmail(...);
        // } catch (e) {
        //   console.error("Email issue:" + e?.message);
        // }

        break;
      }

      case "checkout.session.expired": {
        // User didn't complete the transaction
        // You don't need to do anything here, by you can send an email to the user to remind him to complete the transaction, for instance
        break;
      }

      case "customer.subscription.updated": {
        // Handles: plan change, reactivation ("do not cancel"), cancellation reversal
        const updatedSub: Stripe.Subscription = event.data
          .object as Stripe.Subscription;
        const updatedCustomerId = updatedSub.customer as string;
        const updatedStatus = updatedSub.status;

        console.log("customer.subscription.updated:", {
          customerId: updatedCustomerId,
          status: updatedStatus,
          cancelAtPeriodEnd: updatedSub.cancel_at_period_end,
        });

        // If subscription is active (including reactivated), restore access
        if (updatedStatus === "active" && !updatedSub.cancel_at_period_end) {
          const updatedPriceId = updatedSub.items.data[0]?.price.id;
          await supabase
            .from("profiles")
            .update({ has_access: true, price_id: updatedPriceId })
            .eq("customer_id", updatedCustomerId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        // The customer subscription stopped
        // ❌ Revoke access to the product
        const deletedSub: Stripe.Subscription = event.data
          .object as Stripe.Subscription;
        const deletedCustomerId = deletedSub.customer as string;

        console.log("customer.subscription.deleted:", { customerId: deletedCustomerId });

        const { error: deleteError } = await supabase
          .from("profiles")
          .update({ has_access: false, price_id: null })
          .eq("customer_id", deletedCustomerId);

        if (deleteError) {
          console.error("Failed to revoke access on subscription deleted:", deleteError);
        }
        break;
      }

      case "charge.refunded": {
        // A charge was refunded — revoke access
        const refundedCharge: Stripe.Charge = event.data
          .object as Stripe.Charge;
        const refundedCustomerId = refundedCharge.customer as string;

        console.log("charge.refunded:", { customerId: refundedCustomerId });

        if (refundedCustomerId) {
          const { error: refundError } = await supabase
            .from("profiles")
            .update({ has_access: false, price_id: null })
            .eq("customer_id", refundedCustomerId);

          if (refundError) {
            console.error("Failed to revoke access on refund:", refundError);
          }
        }
        break;
      }

      case "invoice.paid": {
        // Customer just paid an invoice (for instance, a recurring payment for a subscription)
        // ✅ Grant access to the product
        const stripeObject: Stripe.Invoice = event.data
          .object as Stripe.Invoice;
        const priceId = stripeObject.lines.data[0].price.id;
        const customerId = stripeObject.customer;

        // Find profile where customer_id equals the customerId (in table called 'profiles')
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("customer_id", customerId)
          .single();

        // On first payment, checkout.session.completed may not have set customer_id yet
        if (!profile) {
          console.log("invoice.paid: no profile found for customer_id:", customerId);
          break;
        }

        // Grant access and update the price_id (handles plan switches too)
        await supabase
          .from("profiles")
          .update({ has_access: true, price_id: priceId })
          .eq("customer_id", customerId);

        break;
      }

      case "invoice.payment_failed":
        // A payment failed (for instance the customer does not have a valid payment method)
        // ❌ Revoke access to the product
        // ⏳ OR wait for the customer to pay (more friendly):
        //      - Stripe will automatically email the customer (Smart Retries)
        //      - We will receive a "customer.subscription.deleted" when all retries were made and the subscription has expired

        break;

      default:
      // Unhandled event type
    }
  } catch (e) {
    console.error("stripe error: ", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  return NextResponse.json({});
}
