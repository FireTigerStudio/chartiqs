import Link from "next/link";
import { createClient } from "@/libs/supabase/server";
import { commodities, aiConfig } from "@/config";
import ButtonAccount from "@/components/ButtonAccount";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("has_access, customer_id")
    .eq("id", user!.id)
    .single();

  const isPaid = profile?.has_access || false;
  const dailyLimit = isPaid ? aiConfig.paidQuestionsPerDay : aiConfig.freeQuestionsPerDay;

  const today = new Date().toISOString().split("T")[0];
  const { data: usage } = await supabase
    .from("ai_usage")
    .select("question_count")
    .eq("user_id", user!.id)
    .eq("date", today)
    .single();

  const used = usage?.question_count || 0;
  const remaining = Math.max(0, dailyLimit - used);

  return (
    <main className="min-h-screen bg-base-100">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <ButtonAccount />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Plan</div>
            <div className="stat-value text-lg">
              {isPaid ? "Premium" : "Free"}
            </div>
            {!isPaid && (
              <div className="stat-actions">
                <Link href="/#pricing" className="btn btn-primary btn-xs">
                  Upgrade
                </Link>
              </div>
            )}
          </div>

          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Questions Today</div>
            <div className="stat-value text-lg">{used} / {dailyLimit}</div>
            <div className="stat-desc">{remaining} remaining</div>
          </div>

          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Daily Limit</div>
            <div className="stat-value text-lg">{dailyLimit}</div>
            <div className="stat-desc">per day</div>
          </div>
        </div>

        {/* Quick Access */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Analyze a Commodity</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {commodities.map((c) => (
              <Link
                key={c.symbol}
                href={`/commodities/${c.symbol}`}
                className="card bg-base-200 hover:bg-base-300 transition-colors"
              >
                <div className="card-body items-center text-center p-4">
                  <span className="text-3xl">{c.icon}</span>
                  <span className="text-sm font-medium">{c.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-base-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">How to Use</h2>
          <ol className="list-decimal list-inside space-y-2 text-base-content/70">
            <li>Select a commodity above or from the <Link href="/commodities" className="link link-primary">Commodities</Link> page</li>
            <li>View the AI-generated impact factor matrix</li>
            <li>Ask follow-up questions in the AI Q&A panel</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
