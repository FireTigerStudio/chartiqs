import { createClient } from "@/libs/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import config from "@/config";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? config.auth.callbackUrl;

  if (token_hash && type) {
    const supabase = await createClient();

    // Sign out any existing session before verifying the new OTP.
    // This prevents stale session cookies from a previous user
    // interfering with the new sign-in.
    await supabase.auth.signOut({ scope: "local" });

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      redirect(next);
    }

    console.error("Auth confirm error:", error.message);
    redirect(`/signin?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/signin?error=" + encodeURIComponent("Invalid confirmation link"));
}
