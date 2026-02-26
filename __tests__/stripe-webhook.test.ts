/**
 * Payment Test Suite - Stripe Webhook Handler
 *
 * Tests TC-01 (webhook part), TC-04, TC-10, TC-13
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================================
// Shared mock state
// ============================================================
const mockState = {
  constructEventResult: null as any,
  constructEventError: null as Error | null,
  selectResult: { data: { id: "user-123", email: "test@example.com", price_id: "price_monthly_test", customer_id: "cus_test", has_access: true }, error: null },
  updateError: null as Error | null,
  fromCalls: [] as string[],
  updateCalls: [] as any[],
};

// Mock Stripe - must use class pattern for `new Stripe()`
vi.mock("stripe", () => {
  const StripeMock = function () {
    return {
      webhooks: {
        constructEvent: (...args: any[]) => {
          if (mockState.constructEventError) throw mockState.constructEventError;
          return mockState.constructEventResult;
        },
      },
      customers: {
        retrieve: async () => ({ email: "customer@example.com" }),
      },
      subscriptions: {
        retrieve: async () => ({ id: "sub_test", customer: "cus_test" }),
      },
    };
  };
  return { default: StripeMock };
});

vi.mock("@supabase/supabase-js", () => {
  class MockSupabaseClient {
    from(table: string) {
      mockState.fromCalls.push(table);
      return {
        update: (data: any) => {
          mockState.updateCalls.push(data);
          return {
            eq: async () => {
              if (mockState.updateError) throw mockState.updateError;
              return { data: null, error: null };
            },
          };
        },
        select: () => ({
          eq: (col: string, val: any) => ({
            single: async () => mockState.selectResult,
            eq: (col2: string, val2: any) => ({
              single: async () => mockState.selectResult,
            }),
          }),
        }),
      };
    }
    auth = {
      admin: {
        createUser: async () => ({ data: { user: { id: "new-user-456" } } }),
      },
    };
  }
  return { SupabaseClient: MockSupabaseClient };
});

vi.mock("@/libs/stripe", () => ({
  findCheckoutSession: vi.fn(async () => ({
    customer: "cus_test",
    line_items: {
      data: [{ price: { id: "price_monthly_test" } }],
    },
  })),
}));

vi.mock("@/config", () => ({
  default: {
    stripe: {
      plans: [
        { priceId: "price_monthly_test", name: "Monthly", price: 29 },
        { priceId: "price_yearly_test", name: "Yearly", price: 299 },
      ],
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => ({
    get: () => "test-signature",
  })),
}));

vi.mock("next/server", () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: (data: any, init?: { status?: number }) => ({
      data,
      status: init?.status || 200,
      async json() { return data; },
    }),
  },
}));

// ============================================================
// Helper
// ============================================================
function makeEvent(type: string, data: any) {
  return { type, data: { object: data } };
}

async function callWebhook(event: any) {
  mockState.constructEventResult = event;
  mockState.constructEventError = null;

  const mod = await import("@/app/api/webhook/stripe/route");
  const req = { text: async () => JSON.stringify(event) };
  return mod.POST(req as any);
}

async function callWebhookWithSignatureError() {
  mockState.constructEventError = new Error("Invalid signature");
  mockState.constructEventResult = null;

  const mod = await import("@/app/api/webhook/stripe/route");
  const req = { text: async () => "invalid-body" };
  return mod.POST(req as any);
}

// ============================================================
// Tests
// ============================================================

describe("TC-01/TC-04: checkout.session.completed webhook", () => {
  beforeEach(() => {
    mockState.fromCalls = [];
    mockState.updateCalls = [];
    mockState.updateError = null;
    mockState.selectResult = {
      data: { id: "user-123", email: "test@example.com", price_id: "price_monthly_test", customer_id: "cus_test", has_access: true },
      error: null,
    };
  });

  it("grants access when checkout completes with logged-in user", async () => {
    const event = makeEvent("checkout.session.completed", {
      id: "cs_test_123",
      client_reference_id: "user-123",
    });

    const res = await callWebhook(event);
    expect(res.status).toBe(200);
    expect(mockState.fromCalls).toContain("profiles");
    // Verify has_access: true was set
    const accessUpdate = mockState.updateCalls.find((c) => c.has_access === true);
    expect(accessUpdate).toBeTruthy();
  });

  it("grants access even when user closes browser before redirect (TC-04)", async () => {
    // Webhook fires regardless of browser redirect
    const event = makeEvent("checkout.session.completed", {
      id: "cs_test_456",
      client_reference_id: "user-123",
    });

    const res = await callWebhook(event);
    expect(res.status).toBe(200);
    const accessUpdate = mockState.updateCalls.find((c) => c.has_access === true);
    expect(accessUpdate).toBeTruthy();
  });
});

describe("TC-10: Subscription Lifecycle Webhooks", () => {
  beforeEach(() => {
    mockState.fromCalls = [];
    mockState.updateCalls = [];
    mockState.updateError = null;
    mockState.selectResult = {
      data: { id: "user-123", price_id: "price_monthly_test", customer_id: "cus_test", has_access: true },
      error: null,
    };
  });

  it("revokes access on customer.subscription.deleted", async () => {
    const event = makeEvent("customer.subscription.deleted", {
      id: "sub_test",
      customer: "cus_test",
    });

    const res = await callWebhook(event);
    expect(res.status).toBe(200);
    expect(mockState.fromCalls).toContain("profiles");
    const revokeUpdate = mockState.updateCalls.find((c) => c.has_access === false);
    expect(revokeUpdate).toBeTruthy();
  });

  it("grants access on invoice.paid for matching plan", async () => {
    const event = makeEvent("invoice.paid", {
      customer: "cus_test",
      lines: {
        data: [{ price: { id: "price_monthly_test" } }],
      },
    });

    const res = await callWebhook(event);
    expect(res.status).toBe(200);
    expect(mockState.fromCalls).toContain("profiles");
  });

  it("does NOT grant access on invoice.paid for mismatched plan", async () => {
    mockState.selectResult = {
      data: { id: "user-123", price_id: "price_monthly_test", customer_id: "cus_test", has_access: true },
      error: null,
    };

    const event = makeEvent("invoice.paid", {
      customer: "cus_test",
      lines: {
        data: [{ price: { id: "price_WRONG_ID" } }],
      },
    });

    const res = await callWebhook(event);
    expect(res.status).toBe(200);
    // The update should NOT set has_access because price doesn't match
    // With mismatched price, the code does `break` before update
    const accessUpdate = mockState.updateCalls.find((c) => c.has_access === true);
    // Since the price is wrong, no update should happen
    expect(accessUpdate).toBeUndefined();
  });

  it("handles invoice.payment_failed gracefully (no crash)", async () => {
    const event = makeEvent("invoice.payment_failed", {
      customer: "cus_test",
    });

    const res = await callWebhook(event);
    expect(res.status).toBe(200);
  });

  it("handles checkout.session.expired gracefully (no crash)", async () => {
    const event = makeEvent("checkout.session.expired", {
      id: "cs_expired",
    });

    const res = await callWebhook(event);
    expect(res.status).toBe(200);
  });
});

describe("TC-13: Webhook Error Handling", () => {
  beforeEach(() => {
    mockState.fromCalls = [];
    mockState.updateCalls = [];
    mockState.updateError = null;
  });

  it("returns 400 for invalid webhook signature", async () => {
    const res = await callWebhookWithSignatureError();
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Invalid signature");
  });

  it("ISSUE: returns 200 even when DB write fails (Stripe won't retry)", async () => {
    mockState.updateError = new Error("Database write failed");

    const event = makeEvent("checkout.session.completed", {
      id: "cs_test",
      client_reference_id: "user-123",
    });

    const res = await callWebhook(event);

    // PROBLEM: Returns 200 even though DB failed -> Stripe won't retry
    expect(res.status).toBe(200);

    console.warn(
      "WARNING [TC-13]: Webhook returns 200 even on DB failure. " +
      "Stripe will NOT retry. User paid but may not get access. " +
      "FIX: Return 500 on DB errors so Stripe retries."
    );
  });
});

describe("TC-03: Checkout expired/canceled", () => {
  beforeEach(() => {
    mockState.fromCalls = [];
    mockState.updateCalls = [];
    mockState.updateError = null;
  });

  it("checkout.session.expired does not modify user data", async () => {
    const event = makeEvent("checkout.session.expired", {
      id: "cs_expired_123",
    });

    const res = await callWebhook(event);
    expect(res.status).toBe(200);
    // No updates should have been called
    expect(mockState.updateCalls).toHaveLength(0);
  });
});
