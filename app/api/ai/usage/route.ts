import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { aiConfig } from "@/config";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in first" }, { status: 401 });
    }

    // Check if user has paid access
    const { data: profile } = await supabase
      .from("profiles")
      .select("has_access")
      .eq("id", user.id)
      .single();

    const isPaid = profile?.has_access || false;
    const dailyLimit = isPaid ? aiConfig.paidQuestionsPerDay : aiConfig.freeQuestionsPerDay;

    // Get today's usage
    const today = new Date().toISOString().split("T")[0];
    const { data: usage } = await supabase
      .from("ai_usage")
      .select("question_count")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();

    const used = usage?.question_count || 0;
    const remaining = Math.max(0, dailyLimit - used);

    return NextResponse.json({
      used,
      remaining,
      limit: dailyLimit,
      isPaid,
    });
  } catch (error) {
    console.error("Usage error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
