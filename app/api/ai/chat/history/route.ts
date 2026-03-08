import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");

    let query = supabase
      .from("chat_messages")
      .select("role, content, symbol, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (symbol) {
      query = query.eq("symbol", symbol);
    }

    // Limit to last 50 messages per commodity to avoid huge payloads
    query = query.limit(50);

    const { data, error } = await query;
    if (error) {
      console.error("Chat history error:", error);
      return NextResponse.json({ error: "Failed to load history" }, { status: 500 });
    }

    return NextResponse.json({ messages: data || [] });
  } catch (error) {
    console.error("Chat history error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
