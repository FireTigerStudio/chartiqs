"use client";

import { useState } from "react";
import { useTranslation } from "@/libs/i18n";
import type { Instrument } from "@/libs/instruments";

interface Props {
  instruments: Instrument[];
  watchlist: string[];
  onAdd: (symbol: string) => void;
  onClose: () => void;
}

export default function AddInstrumentModal({ instruments, watchlist, onAdd, onClose }: Props) {
  const { t, lang } = useTranslation();
  const [search, setSearch] = useState("");

  const filtered = instruments.filter((inst) => {
    const query = search.toLowerCase();
    const name = (lang === "zh" && inst.name_zh ? inst.name_zh : inst.name).toLowerCase();
    return name.includes(query) || inst.symbol.toLowerCase().includes(query);
  });

  return (
    <div className="modal modal-open" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-lg mb-4">{t("watchlist.addTitle")}</h3>

        <input
          type="text"
          placeholder={t("watchlist.searchPlaceholder")}
          className="input input-bordered w-full mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />

        <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
          {filtered.map((inst) => {
            const inList = watchlist.includes(inst.symbol);
            const displayName = lang === "zh" && inst.name_zh ? inst.name_zh : inst.name;
            return (
              <button
                key={inst.symbol}
                className={`btn btn-outline btn-sm gap-2 justify-start ${inList ? "btn-disabled opacity-50" : ""}`}
                disabled={inList}
                onClick={() => onAdd(inst.symbol)}
              >
                <span>{inst.icon}</span>
                <span>{displayName}</span>
                {inList && <span className="ml-auto text-success">✓</span>}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-base-content/50 py-4">{t("watchlist.noResults")}</p>
        )}

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>{t("watchlist.close")}</button>
        </div>
      </div>
    </div>
  );
}
