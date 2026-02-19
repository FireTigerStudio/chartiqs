"use client";

import Link from "next/link";
import { useTranslation } from "@/libs/i18n";
import type { Instrument } from "@/libs/instruments";

interface Props {
  instruments: Instrument[];
}

export default function CommoditiesListClient({ instruments }: Props) {
  const { t, lang } = useTranslation();

  return (
    <main className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-base-200 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-4">
            {t("commodities.title")}
          </h1>
          <p className="text-center text-base-content/70 max-w-2xl mx-auto">
            {t("commodities.subtitle")}
          </p>
        </div>
      </div>

      {/* Commodity Grid */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instruments.map((instrument) => {
            const displayName = lang === "zh" && instrument.name_zh ? instrument.name_zh : instrument.name;
            return (
              <Link
                key={instrument.symbol}
                href={`/commodities/${instrument.symbol}`}
                className="card bg-base-100 border border-base-300 hover:border-primary hover:shadow-lg transition-all duration-200"
              >
                <div className="card-body items-center text-center">
                  <span className="text-5xl mb-3">{instrument.icon}</span>
                  <h2 className="card-title text-xl">{displayName}</h2>
                  <p className="text-sm text-base-content/60">
                    {instrument.tv_symbol}
                  </p>
                  <div className="card-actions mt-4">
                    <span className="btn btn-primary btn-sm">{t("commodities.viewAnalysis")}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-base-200 py-8">
        <div className="max-w-3xl mx-auto px-4 text-center text-sm text-base-content/60">
          <p>
            {t("disclaimer.title")}: {t("disclaimer.text")}
          </p>
        </div>
      </div>
    </main>
  );
}
