import { createCheckout } from "@/libs/stripe";
import { createClient } from "@/libs/supabase/server";
import config from "@/config";
import { NextRequest, NextResponse } from "next/server";

// This function is used to create a Stripe Checkout Session (one-time payment or subscription)
// It's called by the <ButtonCheckout /> component
// Supports both authenticated and guest checkout (guest checkout allows Stripe reviewers to verify the payment flow)
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.priceId) {
    return NextResponse.json(
      { error: "Price ID is required" },
      { status: 400 }
    );
  } else if (!body.successUrl || !body.cancelUrl) {
    return NextResponse.json(
      { error: "Success and cancel URLs are required" },
      { status: 400 }
    );
  } else if (!body.mode) {
    return NextResponse.json(
      {
        error:
          "Mode is required (either 'payment' for one-time payments or 'subscription' for recurring subscription)",
      },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { priceId, mode, successUrl, cancelUrl } = body;

    // If user is logged in, look up their profile for prefill and duplicate prevention
    let profileData: { email?: string; customer_id?: string; has_access?: boolean } | null = null;
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      profileData = data;

      // Prevent duplicate purchases — already-paid users should manage via billing portal
      if (profileData?.has_access) {
        return NextResponse.json(
          { error: "You already have an active subscription. Manage it from your account settings." },
          { status: 400 }
        );
      }
    }

    const stripeSessionURL = await createCheckout({
      priceId,
      mode,
      successUrl,
      cancelUrl,
      // If user is logged in, pass user ID so the webhook can link payment to account
      clientReferenceId: user?.id,
      user: user
        ? {
            email: profileData?.email,
            customerId: profileData?.customer_id,
          }
        : undefined,
      // 3-day free trial for subscriptions
      trialDays: mode === "subscription" ? config.stripe.trialDays : undefined,
    });

    return NextResponse.json({ url: stripeSessionURL });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
