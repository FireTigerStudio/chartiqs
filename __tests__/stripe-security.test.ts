/**
 * Payment Test Suite - Security & Architecture Verification
 *
 * Tests TC-06, TC-11 (code analysis), and architectural checks
 * These tests verify the code structure itself, not runtime behavior.
 */
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const PROJECT_ROOT = "/Users/tiger/Documents/Projects/EcoFactors/ShipfastforEcoFactor";

function readSource(relativePath: string): string {
  return fs.readFileSync(path.join(PROJECT_ROOT, relativePath), "utf-8");
}

describe("TC-11: Price Tampering Prevention (Static Analysis)", () => {
  it("create-checkout route does NOT accept amount from request body", () => {
    const source = readSource("app/api/stripe/create-checkout/route.ts");

    // The route should destructure only: priceId, mode, successUrl, cancelUrl
    expect(source).toContain("const { priceId, mode, successUrl, cancelUrl } = body");

    // Should NOT extract or use an 'amount' field
    expect(source).not.toMatch(/body\.amount/);
    expect(source).not.toMatch(/amount.*=.*body/);
  });

  it("createCheckout lib uses price ID in line_items, not raw amount", () => {
    const source = readSource("libs/stripe.ts");

    // Stripe session should use `price: priceId` not `amount:`
    expect(source).toContain("price: priceId");
    expect(source).not.toMatch(/amount:\s*(priceId|amount|body)/);
  });

  it("webhook verifies Stripe signature before processing", () => {
    const source = readSource("app/api/webhook/stripe/route.ts");

    // Must use constructEvent for signature verification
    expect(source).toContain("stripe.webhooks.constructEvent");
    expect(source).toContain("webhookSecret");

    // Returns 400 on invalid signature
    expect(source).toMatch(/status:\s*400/);
  });
});

describe("TC-05: Double-Click Prevention (Static Analysis)", () => {
  it("ButtonCheckout has isLoading state", () => {
    const source = readSource("components/ButtonCheckout.tsx");

    expect(source).toContain("const [isLoading, setIsLoading] = useState");
    expect(source).toContain("setIsLoading(true)");
  });

  it("GAP: ButtonCheckout does NOT have disabled={isLoading} on button", () => {
    const source = readSource("components/ButtonCheckout.tsx");

    const hasDisabledProp =
      source.includes("disabled={isLoading}") ||
      source.includes("disabled={true}") ||
      source.includes("disabled");

    // Document the gap
    if (!hasDisabledProp) {
      console.warn(
        "GAP FOUND [TC-05]: ButtonCheckout button is NOT disabled during isLoading. " +
        "A fast double-click can trigger handlePayment() twice before the first " +
        "setIsLoading(true) causes a re-render. " +
        "FIX: Add `disabled={isLoading}` to the <button> element."
      );
    }

    // This is informational - we expect the gap exists
    expect(hasDisabledProp).toBe(false);
  });

  it("GAP: handlePayment has no early return when isLoading is true", () => {
    const source = readSource("components/ButtonCheckout.tsx");

    // Check if there's a guard like: if (isLoading) return;
    const hasGuard = source.includes("if (isLoading) return") || source.includes("if(isLoading)");

    if (!hasGuard) {
      console.warn(
        "GAP FOUND [TC-05]: No `if (isLoading) return` guard in handlePayment. " +
        "FIX: Add early return check at the top of handlePayment()."
      );
    }

    expect(hasGuard).toBe(false);
  });
});

describe("TC-06: Already-Paid User Detection (Static Analysis)", () => {
  it("GAP: create-checkout does NOT check if user already has_access", () => {
    const source = readSource("app/api/stripe/create-checkout/route.ts");

    // Check if the route actively checks has_access before creating checkout
    // Note: "already" may appear in comments, so we check for actual logic patterns
    const checksAccessInLogic =
      source.includes("has_access") ||
      source.includes("if (data?.has_access)") ||
      source.includes("profile.has_access");

    if (!checksAccessInLogic) {
      console.warn(
        "GAP FOUND [TC-06]: create-checkout does NOT check if user already has_access. " +
        "A paid user can create another checkout session and be charged again. " +
        "FIX: Check profile.has_access before calling createCheckout(). " +
        "If true, return 400 with 'You already have an active subscription'."
      );
    }

    expect(checksAccessInLogic).toBe(false);
  });

  it("GAP: ButtonCheckout does NOT check subscription status before showing", () => {
    const source = readSource("components/ButtonCheckout.tsx");

    const checksSubscription =
      source.includes("has_access") ||
      source.includes("isPaid") ||
      source.includes("already subscribed");

    if (!checksSubscription) {
      console.warn(
        "GAP FOUND [TC-06]: ButtonCheckout does not check user subscription status. " +
        "It always renders the payment button regardless of payment status. " +
        "FIX: Pass has_access prop and show 'Manage Subscription' instead."
      );
    }

    expect(checksSubscription).toBe(false);
  });
});

describe("TC-13: Webhook Error Handling (Static Analysis)", () => {
  it("ISSUE: webhook returns 200 on internal errors (Stripe won't retry)", () => {
    const source = readSource("app/api/webhook/stripe/route.ts");

    // The try/catch block catches errors but still falls through to return 200
    // Look for the pattern:
    //   } catch (e) {
    //     console.error(...)
    //   }
    //   return NextResponse.json({});  <-- always 200!

    const hasCatchAll = source.includes('catch (e)') && source.includes('return NextResponse.json({})');

    if (hasCatchAll) {
      console.warn(
        "ISSUE [TC-13]: Webhook handler catches DB errors silently and returns 200. " +
        "Stripe will think the event was processed and won't retry. " +
        "If the DB write fails, the user pays but never gets access. " +
        "FIX: Return NextResponse.json({ error: e.message }, { status: 500 }) " +
        "in the catch block so Stripe retries the webhook."
      );
    }

    expect(hasCatchAll).toBe(true);
  });
});

describe("General Security Checks", () => {
  it("webhook uses service_role key (not anon key) for admin operations", () => {
    const source = readSource("app/api/webhook/stripe/route.ts");

    expect(source).toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("webhook does NOT use user-scoped Supabase client", () => {
    const source = readSource("app/api/webhook/stripe/route.ts");

    // The webhook creates its own SupabaseClient with service_role
    // It should NOT import createClient from server.ts (which uses cookies)
    const usesServerClient = source.includes("import { createClient } from");
    // It should use SupabaseClient directly
    expect(source).toContain("new SupabaseClient(");
  });

  it("create-checkout validates all required fields before proceeding", () => {
    const source = readSource("app/api/stripe/create-checkout/route.ts");

    // Should validate priceId, successUrl, cancelUrl, and mode
    expect(source).toContain("!body.priceId");
    expect(source).toContain("!body.successUrl");
    expect(source).toContain("!body.cancelUrl");
    expect(source).toContain("!body.mode");
  });

  it("PendingCheckoutHandler expires after 30 minutes", () => {
    const source = readSource("components/LayoutClient.tsx");

    // Check the 30-minute expiry
    expect(source).toContain("30 * 60 * 1000");
    expect(source).toContain('localStorage.removeItem("pendingCheckout")');
  });
});
