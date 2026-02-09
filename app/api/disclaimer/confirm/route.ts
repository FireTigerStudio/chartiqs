import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in first" }, { status: 401 });
    }

    const { error } = await supabase
      .from("disclaimer_confirmations")
      .upsert({ user_id: user.id }, { onConflict: "user_id" });

    if (error) {
      console.error("Disclaimer confirm error:", error);
      return NextResponse.json({ error: "Confirmation failed" }, { status: 500 });
    }

    return NextResponse.json({ confirmed: true });
  } catch (error) {
    console.error("Disclaimer confirm error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
