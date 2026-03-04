"use client";

import React from "react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/libs/supabase/client";
import toast from "react-hot-toast";
import config from "@/config";
import { useTranslation } from "@/libs/i18n";

const RESEND_COOLDOWN = 60; // seconds

export default function Login() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSent, setIsSent] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      toast.error(error);
    }
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSignup = async (e?: React.FormEvent) => {
    e?.preventDefault();

    setIsLoading(true);

    try {
      const redirectURL = window.location.origin + "/api/auth/callback";

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectURL,
        },
      });

      if (error) {
        console.error("OTP error:", error.message);
        toast.error(error.message);
        return;
      }

      toast.success(t("signin.toastSent"));
      setIsSent(true);
      startCooldown();
    } catch (error) {
      console.log(error);
      toast.error(t("signin.toastFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-8 md:p-24" data-theme={config.colors.theme}>
      <div className="text-center mb-4">
        <Link href="/" className="btn btn-ghost btn-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>
          Home
        </Link>
      </div>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center mb-12">
        {t("signin.title", { appName: config.appName })}
      </h1>

      <div className="space-y-8 max-w-xl mx-auto">
        <form
          className="form-control w-full space-y-4"
          onSubmit={handleSignup}
        >
          <input
            required
            type="email"
            value={email}
            autoComplete="email"
            placeholder={t("signin.emailPlaceholder")}
            className="input input-bordered w-full placeholder:opacity-60"
            onChange={(e) => setEmail(e.target.value)}
          />

          {!isSent ? (
            <button
              className="btn btn-primary btn-block"
              disabled={isLoading}
              type="submit"
            >
              {isLoading && (
                <span className="loading loading-spinner loading-xs"></span>
              )}
              {t("signin.sendMagicLink")}
            </button>
          ) : (
            <>
              <button
                className="btn btn-primary btn-block"
                disabled={isLoading || cooldown > 0}
                type="submit"
              >
                {isLoading && (
                  <span className="loading loading-spinner loading-xs"></span>
                )}
                {cooldown > 0
                  ? t("signin.resendIn", { seconds: String(cooldown) })
                  : t("signin.resend")}
              </button>
            </>
          )}
        </form>

        {isSent && (
          <p className="text-center text-sm text-base-content/60">
            {t("signin.linkSent")}
          </p>
        )}
      </div>
    </main>
  );
}
