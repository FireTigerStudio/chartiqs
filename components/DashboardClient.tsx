"use client";

import Link from "next/link";
import ButtonAccount from "@/components/ButtonAccount";
import { useTranslation } from "@/libs/i18n";
import type { Instrument } from "@/libs/instruments";

interface Props {
  instruments: Instrument[];
  isPaid: boolean;
}

export default function DashboardClient({ instruments, isPaid }: Props) {
  const { t, lang } = useTranslation();

  return (
    <main className="min-h-screen bg-base-100">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>
          <ButtonAccount />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">{t("dashboard.plan")}</div>
            <div className="stat-value text-lg">
              {isPaid ? t("dashboard.premium") : t("dashboard.free")}
            </div>
            {!isPaid && (
              <div className="stat-actions">
                <Link href="/#pricing" className="btn btn-primary btn-xs">
                  {t("dashboard.upgrade")}
                </Link>
              </div>
            )}
          </div>

          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">{t("dashboard.aiQuestions")}</div>
            <div className="stat-value text-lg">
              {isPaid ? t("dashboard.unlimited") : t("dashboard.freeTier")}
            </div>
            <div className="stat-desc">
              {isPaid ? t("dashboard.unlimitedDesc") : t("dashboard.freeDesc")}
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div>
          <h2 className="text-xl font-semibold mb-4">{t("dashboard.analyzeCommodity")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {instruments.map((instrument) => {
              const displayName = lang === "zh" && instrument.name_zh ? instrument.name_zh : instrument.name;
              return (
                <Link
                  key={instrument.symbol}
                  href={`/commodities/${instrument.symbol}`}
                  className="card bg-base-200 hover:bg-base-300 transition-colors"
                >
                  <div className="card-body items-center text-center p-4">
                    <span className="text-3xl">{instrument.icon}</span>
                    <span className="text-sm font-medium">{displayName}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Info */}
        <div className="bg-base-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">{t("dashboard.howToUse")}</h2>
          <ol className="list-decimal list-inside space-y-2 text-base-content/70">
            <li>{t("dashboard.step1")}</li>
            <li>{t("dashboard.step2")}</li>
            <li>{t("dashboard.step3")}</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
