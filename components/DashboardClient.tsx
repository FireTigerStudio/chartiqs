"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import AddInstrumentModal from "@/components/AddInstrumentModal";
import { useTranslation } from "@/libs/i18n";
import apiClient from "@/libs/api";
import type { Instrument } from "@/libs/instruments";

interface Props {
  instruments: Instrument[];
  isPaid: boolean;
  initialWatchlist: string[];
}

export default function DashboardClient({ instruments, isPaid, initialWatchlist }: Props) {
  const { t, lang } = useTranslation();
  const [watchlist, setWatchlist] = useState<string[]>(initialWatchlist);
  const [showModal, setShowModal] = useState(false);

  const watchedInstruments = watchlist.length > 0
    ? watchlist.map((s) => instruments.find((i) => i.symbol === s)).filter(Boolean) as Instrument[]
    : [];

  const hasWatchlist = watchedInstruments.length > 0;

  const handleAdd = async (symbol: string) => {
    // Optimistic update
    setWatchlist((prev) => [...prev, symbol]);
    setShowModal(false);
    try {
      await apiClient.post("/watchlist", { symbol });
    } catch {
      // Revert on failure
      setWatchlist((prev) => prev.filter((s) => s !== symbol));
      toast.error(t("watchlist.addError"));
    }
  };

  const handleRemove = async (symbol: string) => {
    // Optimistic update
    setWatchlist((prev) => prev.filter((s) => s !== symbol));
    try {
      await apiClient.delete("/watchlist", { data: { symbol } });
    } catch {
      // Revert on failure
      setWatchlist((prev) => [...prev, symbol]);
      toast.error(t("watchlist.removeError"));
    }
  };

  return (
    <main className="min-h-screen bg-base-100">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>
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

        {/* Watchlist / Instruments */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {hasWatchlist ? t("watchlist.myWatchlist") : t("dashboard.analyzeCommodity")}
            </h2>
            {hasWatchlist && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                + {t("watchlist.add")}
              </button>
            )}
          </div>

          {hasWatchlist ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {watchedInstruments.map((instrument) => {
                const displayName = lang === "zh" && instrument.name_zh ? instrument.name_zh : instrument.name;
                return (
                  <div key={instrument.symbol} className="relative group">
                    <Link
                      href={`/commodities/${instrument.symbol}`}
                      className="card bg-base-200 hover:bg-base-300 transition-colors"
                    >
                      <div className="card-body items-center text-center p-4">
                        <span className="text-3xl">{instrument.icon}</span>
                        <span className="text-sm font-medium">{displayName}</span>
                      </div>
                    </Link>
                    <button
                      className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemove(instrument.symbol)}
                      title={t("watchlist.remove")}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              <p className="text-base-content/60 mb-4">{t("watchlist.emptyHint")}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {instruments.map((instrument) => {
                  const displayName = lang === "zh" && instrument.name_zh ? instrument.name_zh : instrument.name;
                  return (
                    <button
                      key={instrument.symbol}
                      className="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer"
                      onClick={() => handleAdd(instrument.symbol)}
                    >
                      <div className="card-body items-center text-center p-4">
                        <span className="text-3xl">{instrument.icon}</span>
                        <span className="text-sm font-medium">{displayName}</span>
                        <span className="text-xs text-primary">+ {t("watchlist.add")}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
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

      {/* Add Instrument Modal */}
      {showModal && (
        <AddInstrumentModal
          instruments={instruments}
          watchlist={watchlist}
          onAdd={handleAdd}
          onClose={() => setShowModal(false)}
        />
      )}
    </main>
  );
}
