"use client";

import { useTranslation } from "@/libs/i18n";

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useTranslation();

  return (
    <button
      className="btn btn-ghost btn-sm"
      onClick={() => setLang(lang === "en" ? "zh" : "en")}
      title={lang === "en" ? "切换到中文" : "Switch to English"}
    >
      {lang === "en" ? t("lang.zh") : t("lang.en")}
    </button>
  );
}
