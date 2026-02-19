"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import en from "./en.json";
import zh from "./zh.json";

export type Language = "en" | "zh";

const dictionaries: Record<Language, Record<string, string>> = { en, zh };

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

export const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + expires + "; path=/; SameSite=Lax";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const saved = getCookie("lang") as Language | null;
    if (saved === "en" || saved === "zh") {
      setLangState(saved);
    }
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    setCookie("lang", newLang, 365);
    document.documentElement.lang = newLang;
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      let value = dictionaries[lang][key] || dictionaries["en"][key] || key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          value = value.replace(new RegExp("\\{" + k + "\\}", "g"), v);
        });
      }
      return value;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
