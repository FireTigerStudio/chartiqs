import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

// GET /api/watchlist — returns user's watchlisted symbols
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("user_watchlist")
      .select("symbol, added_at")
      .eq("user_id", user.id)
      .order("added_at", { ascending: true });

    if (error) {
      console.error("[watchlist] GET error:", error.message);
      return NextResponse.json({ error: "Failed to fetch watchlist" }, { status: 500 });
    }

    return NextResponse.json({ symbols: (data || []).map((r) => r.symbol) });
  } catch (err) {
    console.error("[watchlist] GET unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/watchlist — add a symbol to watchlist
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }

    const { symbol } = await req.json();
    if (!symbol || typeof symbol !== "string") {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    // Verify instrument exists and is active
    const { data: instrument } = await supabase
      .from("instruments")
      .select("symbol")
      .eq("symbol", symbol)
      .eq("is_active", true)
      .single();

    if (!instrument) {
      return NextResponse.json({ error: "Instrument not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("user_watchlist")
      .insert({ user_id: user.id, symbol });

    if (error) {
      if (error.code === "23505") {
        // unique constraint — already in watchlist
        return NextResponse.json({ ok: true });
      }
      console.error("[watchlist] POST error:", error.message);
      return NextResponse.json({ error: "Failed to add" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[watchlist] POST unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/watchlist — remove a symbol from watchlist
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }

    const { symbol } = await req.json();
    if (!symbol || typeof symbol !== "string") {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("user_watchlist")
      .delete()
      .eq("user_id", user.id)
      .eq("symbol", symbol);

    if (error) {
      console.error("[watchlist] DELETE error:", error.message);
      return NextResponse.json({ error: "Failed to remove" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[watchlist] DELETE unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
