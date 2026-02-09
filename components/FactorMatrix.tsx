"use client";

import { useMemo } from "react";

interface Factor {
  name: string;
  nameEn: string;
  impact: "high" | "medium" | "low";
  timeHorizon: "short" | "medium" | "long";
  weight: number;
  description: string;
}

interface FactorMatrixProps {
  factors: Factor[];
}

const impactColors = {
  high: "bg-red-500",
  medium: "bg-orange-400",
  low: "bg-yellow-400",
};

const impactLabels = {
  high: "High Impact",
  medium: "Medium Impact",
  low: "Low Impact",
};

const timeHorizonLabels = {
  short: "Short-term (Days-Weeks)",
  medium: "Medium-term (Months-Years)",
  long: "Long-term (5-20 Years)",
};

export default function FactorMatrix({ factors }: FactorMatrixProps) {
  // Group factors by time horizon
  const groupedFactors = useMemo(() => {
    const groups: Record<string, Factor[]> = {
      short: [],
      medium: [],
      long: [],
    };
    factors.forEach((f) => {
      groups[f.timeHorizon].push(f);
    });
    return groups;
  }, [factors]);

  return (
    <div className="space-y-6">
      {/* Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["short", "medium", "long"] as const).map((horizon) => (
          <div key={horizon} className="space-y-3">
            <h3 className="font-semibold text-center py-2 bg-base-200 rounded-lg">
              {timeHorizonLabels[horizon]}
            </h3>
            <div className="space-y-2 min-h-[200px]">
              {groupedFactors[horizon].map((factor, idx) => (
                <div
                  key={idx}
                  className="tooltip tooltip-top w-full"
                  data-tip={factor.description}
                >
                  <div
                    className={`
                      p-3 rounded-lg text-white cursor-pointer
                      transform hover:scale-105 transition-transform
                      ${impactColors[factor.impact]}
                    `}
                    style={{
                      opacity: 0.7 + (factor.weight / 10) * 0.3,
                    }}
                  >
                    <div className="font-medium text-sm">{factor.name}</div>
                    <div className="text-xs opacity-80">{factor.nameEn}</div>
                  </div>
                </div>
              ))}
              {groupedFactors[horizon].length === 0 && (
                <div className="text-center text-base-content/40 py-8">
                  No factors
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 pt-4 border-t border-base-300">
        {(["high", "medium", "low"] as const).map((impact) => (
          <div key={impact} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${impactColors[impact]}`} />
            <span className="text-sm text-base-content/70">
              {impactLabels[impact]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
