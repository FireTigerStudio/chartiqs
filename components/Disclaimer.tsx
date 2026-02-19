"use client";

import { useTranslation } from "@/libs/i18n";

export default function Disclaimer() {
  const { t } = useTranslation();

  return (
    <div className="bg-base-200 py-6 mt-8 border-t border-base-300">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center text-sm text-base-content/60 space-y-2">
          <p className="font-medium text-base-content/80">{t("disclaimer.title")}</p>
          <p>{t("disclaimer.text")}</p>
        </div>
      </div>
    </div>
  );
}
