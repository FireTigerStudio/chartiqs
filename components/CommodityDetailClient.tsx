"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import apiClient from "@/libs/api";
import TradingViewChart from "@/components/TradingViewChart";
import FactorMatrix from "@/components/FactorMatrix";
import AIChat from "@/components/AIChat";
import Disclaimer from "@/components/Disclaimer";
import DisclaimerModal from "@/components/DisclaimerModal";

interface Factor {
  name: string;
  nameEn: string;
  impact: "high" | "medium" | "low";
  timeHorizon: "short" | "medium" | "long";
  weight: number;
  description: string;
}

interface AnalysisData {
  factors: Factor[];
  summary: string;
  generatedAt: string;
}

interface Props {
  symbol: string;
  name: string;
  tv_symbol: string;
  icon: string;
}

export default function CommodityDetailClient({ symbol, name, tv_symbol, icon }: Props) {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data: AnalysisData = await apiClient.post("/ai/analyze", { symbol });
      setAnalysis(data);
    } catch (err) {
      // 401 is handled by apiClient interceptor (redirects to signin)
      // Only set error for non-auth failures
      if (err?.response?.status !== 401) {
        setError(err instanceof Error ? err.message : "Analysis request failed");
      }
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  return (
    <main className="min-h-screen bg-base-100">
      <DisclaimerModal />
      {/* Header */}
      <div className="bg-base-200 py-8 border-b border-base-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{icon}</span>
            <div>
              <h1 className="text-3xl font-bold">{name}</h1>
              <p className="text-base-content/60">{tv_symbol}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Chart & Matrix */}
          <div className="lg:col-span-2 space-y-8">
            {/* TradingView Chart */}
            <section className="card bg-base-100 border border-base-300">
              <div className="card-body">
                <h2 className="card-title mb-4">Real-time Price Chart</h2>
                <div className="h-[400px]">
                  <TradingViewChart symbol={tv_symbol} />
                </div>
              </div>
            </section>

            {/* Factor Matrix */}
            <section className="card bg-base-100 border border-base-300">
              <div className="card-body">
                <h2 className="card-title mb-4">
                  Impact Factor Matrix
                  {analysis?.generatedAt && (
                    <span className="text-sm font-normal text-base-content/60">
                      Updated {new Date(analysis.generatedAt).toLocaleString("en-US")}
                    </span>
                  )}
                </h2>

                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <span className="loading loading-spinner loading-lg"></span>
                    <span className="ml-4">AI is analyzing impact factors...</span>
                  </div>
                ) : error ? (
                  <div className="alert alert-error">
                    <span>{error}</span>
                    <button className="btn btn-sm" onClick={fetchAnalysis}>
                      Retry
                    </button>
                  </div>
                ) : analysis ? (
                  <>
                    <FactorMatrix factors={analysis.factors} />
                    <div className="mt-4 p-4 bg-base-200 rounded-lg">
                      <h3 className="font-semibold mb-2">Analysis Summary</h3>
                      <p className="text-sm text-base-content/80">
                        {analysis.summary}
                      </p>
                    </div>
                  </>
                ) : null}
              </div>
            </section>
          </div>

          {/* Right Column - AI Chat */}
          <div className="lg:col-span-1">
            <section className="card bg-base-100 border border-base-300 sticky top-4">
              <div className="card-body">
                <h2 className="card-title mb-4">AI Q&A</h2>
                <AIChat
                  symbol={symbol}
                  commodityName={name}
                  factors={analysis?.factors || []}
                />
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <Disclaimer />
    </main>
  );
}
