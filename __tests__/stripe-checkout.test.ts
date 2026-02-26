/**
 * Payment Test Suite - Stripe Checkout API
 *
 * Tests TC-01, TC-02, TC-05, TC-11, TC-12 (automated portions)
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================================
// Mock setup - vi.mock factories cannot reference outer variables
// ============================================================

vi.mock("next/server", () => {
  class MockNextRequest {
    private body: any;
    constructor(url: string, init?: { method?: string; body?: string }) {
      this.body = init?.body ? JSON.parse(init.body) : null;
    }
    async json() {
      return this.body;
    }
  }
  return {
    NextRequest: MockNextRequest,
    NextResponse: {
      json: (data: any, init?: { status?: number }) => ({
        data,
        status: init?.status || 200,
        async json() { return data; },
      }),
    },
  };
});

// Shared state accessible to both mock factory and tests
const mockState = {
  user: { id: "user-123", email: "test@example.com" } as any,
  profile: {
    id: "user-123",
    email: "test@example.com",
    customer_id: null as string | null,
    price_id: null as string | null,
    has_access: false,
  },
  fromError: null as Error | null,
};

vi.mock("@/libs/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: mockState.user },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(async () => {
            if (mockState.fromError) throw mockState.fromError;
            return { data: mockState.profile };
          }),
        })),
      })),
    })),
  })),
}));

vi.mock("@/libs/stripe", () => ({
  createCheckout: vi.fn(async () => "https://checkout.stripe.com/test-session-123"),
}));

vi.mock("@/config", () => ({
  default: {
    appName: "Chartiqs",
    stripe: {
      trialDays: 3,
      plans: [
        { priceId: "price_monthly_test", name: "Monthly", price: 29 },
        { priceId: "price_yearly_test", name: "Yearly", price: 299, isFeatured: true },
      ],
    },
  },
}));

import { createCheckout } from "@/libs/stripe";

// ============================================================
// Helper to call the route handler
// ============================================================
async function callCreateCheckout(body: Record<string, any>) {
  const { POST } = await import("@/app/api/stripe/create-checkout/route");
  const { NextRequest } = await import("next/server");
  const req = new NextRequest("http://localhost/api/stripe/create-checkout", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return POST(req as any);
}

// ============================================================
// Tests
// ============================================================

describe("TC-01 / TC-02: Create Checkout API Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.user = { id: "user-123", email: "test@example.com" };
    mockState.profile = {
      id: "user-123",
      email: "test@example.com",
      customer_id: null,
      price_id: null,
      has_access: false,
    };
    mockState.fromError = null;
  });

  it("returns 400 when priceId is missing", async () => {
    const res = await callCreateCheckout({
      mode: "subscription",
      successUrl: "http://localhost/success",
      cancelUrl: "http://localhost/cancel",
    });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Price ID");
  });

  it("returns 400 when successUrl/cancelUrl missing", async () => {
    const res = await callCreateCheckout({
      priceId: "price_monthly_test",
      mode: "subscription",
    });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("URLs are required");
  });

  it("returns 400 when mode is missing", async () => {
    const res = await callCreateCheckout({
      priceId: "price_monthly_test",
      successUrl: "http://localhost/success",
      cancelUrl: "http://localhost/cancel",
    });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Mode is required");
  });

  it("returns 401 when user is not authenticated", async () => {
    mockState.user = null;

    const res = await callCreateCheckout({
      priceId: "price_monthly_test",
      mode: "subscription",
      successUrl: "http://localhost/success",
      cancelUrl: "http://localhost/cancel",
    });
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain("login");
  });

  it("returns checkout URL for valid request", async () => {
    const res = await callCreateCheckout({
      priceId: "price_monthly_test",
      mode: "subscription",
      successUrl: "http://localhost/success",
      cancelUrl: "http://localhost/cancel",
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.url).toBe("https://checkout.stripe.com/test-session-123");
  });

  it("passes clientReferenceId (user ID) to createCheckout", async () => {
    await callCreateCheckout({
      priceId: "price_monthly_test",
      mode: "subscription",
      successUrl: "http://localhost/success",
      cancelUrl: "http://localhost/cancel",
    });

    expect(createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        clientReferenceId: "user-123",
        priceId: "price_monthly_test",
        mode: "subscription",
      })
    );
  });

  it("passes trialDays only for subscription mode", async () => {
    await callCreateCheckout({
      priceId: "price_monthly_test",
      mode: "subscription",
      successUrl: "http://localhost/success",
      cancelUrl: "http://localhost/cancel",
    });

    expect(createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({ trialDays: 3 })
    );
  });

  it("does NOT pass trialDays for payment mode", async () => {
    await callCreateCheckout({
      priceId: "price_monthly_test",
      mode: "payment",
      successUrl: "http://localhost/success",
      cancelUrl: "http://localhost/cancel",
    });

    expect(createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({ trialDays: undefined })
    );
  });
});

describe("TC-11: Price Tampering Prevention", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.user = { id: "user-123", email: "test@example.com" };
    mockState.fromError = null;
  });

  it("backend uses priceId not raw amount - cannot tamper price", async () => {
    await callCreateCheckout({
      priceId: "price_monthly_test",
      mode: "subscription",
      successUrl: "http://localhost/success",
      cancelUrl: "http://localhost/cancel",
      amount: 1, // MALICIOUS: trying to pay $0.01
    });

    const callArgs = (createCheckout as any).mock.calls[0][0];
    expect(callArgs.priceId).toBe("price_monthly_test");
    expect(callArgs).not.toHaveProperty("amount");
  });
});

describe("TC-05: Double-Click Prevention (isLoading state)", () => {
  it("ButtonCheckout uses isLoading state to prevent re-entry", async () => {
    const fs = await import("fs");
    const source = fs.readFileSync(
      "/Users/tiger/Documents/Projects/EcoFactors/ShipfastforEcoFactor/components/ButtonCheckout.tsx",
      "utf-8"
    );
    expect(source).toContain("isLoading");
    expect(source).toContain("setIsLoading(true)");
    expect(source).toContain("setIsLoading(false)");
    expect(source).toContain("loading loading-spinner");
  });
});

describe("TC-12: API Error Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.user = { id: "user-123", email: "test@example.com" };
    mockState.fromError = null;
  });

  it("returns 500 when createCheckout throws", async () => {
    (createCheckout as any).mockRejectedValueOnce(new Error("Stripe API timeout"));

    const res = await callCreateCheckout({
      priceId: "price_monthly_test",
      mode: "subscription",
      successUrl: "http://localhost/success",
      cancelUrl: "http://localhost/cancel",
    });

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain("Stripe API timeout");
  });

  it("returns 500 when Supabase query fails", async () => {
    mockState.fromError = new Error("DB connection failed");

    const res = await callCreateCheckout({
      priceId: "price_monthly_test",
      mode: "subscription",
      successUrl: "http://localhost/success",
      cancelUrl: "http://localhost/cancel",
    });

    expect(res.status).toBe(500);
  });
});
