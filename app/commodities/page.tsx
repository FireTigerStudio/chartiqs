"use client";

import Link from "next/link";
import { commodities } from "@/config";

export default function CommoditiesPage() {
  return (
    <main className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-base-200 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-4">
            Choose a Commodity to Analyze
          </h1>
          <p className="text-center text-base-content/70 max-w-2xl mx-auto">
            AI will analyze the key price impact factors for your selected commodity, helping you understand market dynamics
          </p>
        </div>
      </div>

      {/* Commodity Grid */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {commodities.map((commodity) => (
            <Link
              key={commodity.symbol}
              href={`/commodities/${commodity.symbol}`}
              className="card bg-base-100 border border-base-300 hover:border-primary hover:shadow-lg transition-all duration-200"
            >
              <div className="card-body items-center text-center">
                <span className="text-5xl mb-3">{commodity.icon}</span>
                <h2 className="card-title text-xl">{commodity.name}</h2>
                <p className="text-sm text-base-content/60">
                  {commodity.tvSymbol}
                </p>
                <div className="card-actions mt-4">
                  <span className="btn btn-primary btn-sm">View Analysis</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-base-200 py-8">
        <div className="max-w-3xl mx-auto px-4 text-center text-sm text-base-content/60">
          <p>
            Disclaimer: This platform provides educational market factor analysis only and does not constitute investment advice.
            Trading involves risk. Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </main>
  );
}
