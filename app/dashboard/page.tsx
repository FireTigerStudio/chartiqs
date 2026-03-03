import { createClient } from "@/libs/supabase/server";
import { getActiveInstruments } from "@/libs/instruments";
import DashboardClient from "@/components/DashboardClient";

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

  // Fetch user's watchlist
  const { data: watchlistRows } = await supabase
    .from("user_watchlist")
    .select("symbol")
    .eq("user_id", user!.id)
    .order("added_at", { ascending: true });

  const watchlist = (watchlistRows || []).map((r: { symbol: string }) => r.symbol);

  return (
    <DashboardClient
      instruments={instruments}
      isPaid={isPaid}
      initialWatchlist={watchlist}
    />
  );
}
