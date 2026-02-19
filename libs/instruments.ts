import { createClient } from "@/libs/supabase/server";
import { commodities } from "@/config";

export interface Instrument {
  id?: string;
  symbol: string;
  name: string;
  name_zh?: string | null;
  category?: string | null;
  tv_symbol: string;
  icon: string;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Maps a config commodity entry to the Instrument interface shape.
 */
function fromConfig(c: { symbol: string; name: string; tvSymbol: string; icon: string }): Instrument {
  return {
    symbol: c.symbol,
    name: c.name,
    tv_symbol: c.tvSymbol,
    icon: c.icon,
  };
}

/**
 * Fetches all active instruments from the Supabase `instruments` table,
 * ordered by `sort_order`. Falls back to the config commodities array if
 * the DB query fails or returns no rows.
 */
export async function getActiveInstruments(): Promise<Instrument[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("instruments")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("[instruments] DB error in getActiveInstruments:", error.message);
      return commodities.map(fromConfig);
    }

    if (!data || data.length === 0) {
      return commodities.map(fromConfig);
    }

    return data as Instrument[];
  } catch (err) {
    console.error("[instruments] Unexpected error in getActiveInstruments:", err);
    return commodities.map(fromConfig);
  }
}

/**
 * Fetches a single instrument by symbol from the Supabase `instruments` table.
 * Falls back to the matching config commodity if the DB query fails or returns
 * no row.
 */
export async function getInstrumentBySymbol(symbol: string): Promise<Instrument | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("instruments")
      .select("*")
      .eq("symbol", symbol)
      .eq("is_active", true)
      .single();

    if (error) {
      // PGRST116 = no rows found; treat as fallback, not a hard error
      if (error.code !== "PGRST116") {
        console.error("[instruments] DB error in getInstrumentBySymbol:", error.message);
      }
      const fallback = commodities.find((c) => c.symbol === symbol);
      return fallback ? fromConfig(fallback) : null;
    }

    if (!data) {
      const fallback = commodities.find((c) => c.symbol === symbol);
      return fallback ? fromConfig(fallback) : null;
    }

    return data as Instrument;
  } catch (err) {
    console.error("[instruments] Unexpected error in getInstrumentBySymbol:", err);
    const fallback = commodities.find((c) => c.symbol === symbol);
    return fallback ? fromConfig(fallback) : null;
  }
}
