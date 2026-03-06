import { NextResponse } from "next/server";
import { createServiceClient } from "@/libs/supabase/server";

// Backup cache cleanup endpoint — callable by external cron or manually.
// Protected by a shared secret to prevent unauthorized access.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = process.env.CRON_SECRET;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();

    // Delete expired analysis cache
    const { count: cacheDeleted, error: cacheError } = await supabase
      .from("analysis_cache")
      .delete({ count: "exact" })
      .lt("expires_at", new Date().toISOString());

    if (cacheError) {
      console.error("Cache cleanup error:", cacheError);
      return NextResponse.json({ error: "Cache cleanup failed" }, { status: 500 });
    }

    // Delete ai_usage older than 90 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const { count: usageDeleted, error: usageError } = await supabase
      .from("ai_usage")
      .delete({ count: "exact" })
      .lt("date", cutoff.toISOString().split("T")[0]);

    if (usageError) {
      console.error("Usage cleanup error:", usageError);
      return NextResponse.json({ error: "Usage cleanup failed" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      cacheDeleted: cacheDeleted ?? 0,
      usageDeleted: usageDeleted ?? 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
