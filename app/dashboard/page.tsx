import Link from "next/link";
import { createClient } from "@/libs/supabase/server";
import { getActiveInstruments } from "@/libs/instruments";
import ButtonAccount from "@/components/ButtonAccount";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const supabase = await createClient();
  const instruments = await getActiveInstruments();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("has_access, customer_id")
    .eq("id", user!.id)
    .single();

  const isPaid = profile?.has_access || false;

  return (
    <main className="min-h-screen bg-base-100">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <ButtonAccount />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="stat-title">AI Questions</div>
            <div className="stat-value text-lg">
              {isPaid ? "Unlimited" : "Free tier"}
            </div>
            <div className="stat-desc">
              {isPaid ? "50 questions per day" : "3 questions per day"}
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Analyze a Commodity</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {instruments.map((instrument) => (
              <Link
                key={instrument.symbol}
                href={`/commodities/${instrument.symbol}`}
                className="card bg-base-200 hover:bg-base-300 transition-colors"
              >
                <div className="card-body items-center text-center p-4">
                  <span className="text-3xl">{instrument.icon}</span>
                  <span className="text-sm font-medium">{instrument.name}</span>
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
