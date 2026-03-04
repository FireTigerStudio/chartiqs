import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/libs/supabase/server";
import config from "@/config";

export const dynamic = "force-dynamic";

// This route is called after a successful login. It exchanges the code for a session and redirects to the callback URL (see config.js).
export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");

  try {
    if (code) {
      const supabase = await createClient();
      // Clear any existing session before exchanging the new code
      await supabase.auth.signOut({ scope: "local" });
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("Auth callback error:", error.message);
        return NextResponse.redirect(
          requestUrl.origin + "/signin?error=" + encodeURIComponent(error.message)
        );
      }
    }
  } catch (e) {
    console.error("Auth callback exception:", e);
    return NextResponse.redirect(
      requestUrl.origin + "/signin?error=" + encodeURIComponent("Authentication failed")
    );
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin + config.auth.callbackUrl);
}
