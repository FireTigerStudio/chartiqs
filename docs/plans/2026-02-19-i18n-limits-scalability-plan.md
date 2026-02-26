# i18n, AI Limits, Instrument Scalability — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Chinese/English language switching, raise paid AI limit to 50/day (hidden), and move instruments from hardcoded config to Supabase DB.

**Architecture:** Cookie-based i18n with JSON dictionaries and React context. Instruments migrate from `config.ts` array to a Supabase `instruments` table. AI limits change is a config+UI tweak.

**Tech Stack:** Next.js 15, Supabase (PostgreSQL), React Context, cookies, Gemini API

---

### Task 1: Create `instruments` Table in Supabase

**Files:**
- Modify: `supabase-schema.sql` (append after line ~127)

**Step 1: Add instruments table and seed data to schema**

Add to `supabase-schema.sql`:

```sql
-- ============================================================
-- 5. instruments table
-- ============================================================
CREATE TABLE IF NOT EXISTS instruments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_zh TEXT,
  category TEXT NOT NULL DEFAULT 'commodity',
  tv_symbol TEXT NOT NULL,
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_instruments_category ON instruments(category);
CREATE INDEX idx_instruments_active ON instruments(is_active) WHERE is_active = TRUE;

-- RLS
ALTER TABLE instruments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active instruments"
  ON instruments FOR SELECT
  USING (is_active = TRUE);

-- Seed data
INSERT INTO instruments (symbol, name, name_zh, category, tv_symbol, icon, sort_order) VALUES
  ('GOLD',        'Gold',           '黄金',    'commodity', 'CMCMARKETS:GOLD',        '🥇', 1),
  ('SILVER',      'Silver',         '白银',    'commodity', 'CMCMARKETS:SILVER',      '🥈', 2),
  ('COPPER',      'Copper',         '铜',      'commodity', 'CMCMARKETS:COPPER',      '🔶', 3),
  ('CRUDE_OIL',   'WTI Crude Oil',  'WTI原油', 'commodity', 'CMCMARKETS:USCRUDEOIL',  '🛢️', 4),
  ('NATURAL_GAS', 'Natural Gas',    '天然气',  'commodity', 'CMCMARKETS:USNATGAS',    '🔥', 5),
  ('SOYBEAN',     'Soybean',        '大豆',    'commodity', 'CMCMARKETS:SOYBEAN1!',   '🫘', 6)
ON CONFLICT (symbol) DO NOTHING;
```

**Step 2: Run migration in Supabase**

Execute the new SQL in the Supabase SQL Editor (Dashboard > SQL Editor > paste and run). Verify with:
```sql
SELECT * FROM instruments ORDER BY sort_order;
```
Expected: 6 rows returned.

**Step 3: Commit**

```bash
git add supabase-schema.sql
git commit -m "feat: add instruments table with seed data"
```

---

### Task 2: Create Instrument DB Helper

**Files:**
- Create: `libs/instruments.ts`

**Step 1: Create the helper**

```typescript
import { createClient } from "@/libs/supabase/server";
import { commodities } from "@/config";

export interface Instrument {
  id: string;
  symbol: string;
  name: string;
  name_zh: string | null;
  category: string;
  tv_symbol: string;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
}

export async function getActiveInstruments(): Promise<Instrument[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("instruments")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) {
    // Fallback to config if DB fails
    return commodities.map((c, i) => ({
      id: "",
      symbol: c.symbol,
      name: c.name,
      name_zh: null,
      category: "commodity",
      tv_symbol: c.tvSymbol,
      icon: c.icon,
      is_active: true,
      sort_order: i,
    }));
  }

  return data;
}

export async function getInstrumentBySymbol(symbol: string): Promise<Instrument | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("instruments")
    .select("*")
    .eq("symbol", symbol)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    // Fallback to config
    const fallback = commodities.find((c) => c.symbol === symbol);
    if (!fallback) return null;
    return {
      id: "",
      symbol: fallback.symbol,
      name: fallback.name,
      name_zh: null,
      category: "commodity",
      tv_symbol: fallback.tvSymbol,
      icon: fallback.icon,
      is_active: true,
      sort_order: 0,
    };
  }

  return data;
}
```

**Step 2: Commit**

```bash
git add libs/instruments.ts
git commit -m "feat: add instrument DB helpers with config fallback"
```

---

### Task 3: Update Pages and API Routes to Use DB Instruments

**Files:**
- Modify: `app/commodities/page.tsx` (replace config import with DB query)
- Modify: `app/commodities/[symbol]/page.tsx` (replace config lookup with DB query)
- Modify: `app/dashboard/page.tsx` (replace config import with DB query)
- Modify: `app/page.tsx` (replace config import with DB query for landing page commodity grid)
- Modify: `app/api/commodities/route.ts` (replace config with DB query)
- Modify: `app/api/ai/analyze/route.ts` (replace config lookup + hardcoded `commodityNames` with DB)
- Modify: `app/api/ai/chat/route.ts` (replace config lookup + hardcoded `commodityNames` with DB)

**Step 1: Update `app/commodities/page.tsx`**

Replace:
```typescript
import { commodities } from "@/config";
```
With:
```typescript
import { getActiveInstruments } from "@/libs/instruments";
```

Make the component async and fetch instruments:
```typescript
export default async function CommoditiesPage() {
  const instruments = await getActiveInstruments();
  // ... replace commodities.map with instruments.map
  // Use instrument.name, instrument.tv_symbol, instrument.icon, instrument.symbol
```

Note: This changes the component from `"use client"` to a server component. Remove the `"use client"` directive.

**Step 2: Update `app/commodities/[symbol]/page.tsx`**

Replace commodity config lookup (line ~33) with:
```typescript
import { getInstrumentBySymbol } from "@/libs/instruments";
// ...
const instrument = await getInstrumentBySymbol(symbol);
if (!instrument) { /* show not found */ }
```

Use `instrument.name`, `instrument.tv_symbol` instead of `commodity.name`, `commodity.tvSymbol`.

**Step 3: Update `app/dashboard/page.tsx`**

Replace `commodities` import with DB query. This is a server component already — add:
```typescript
import { getActiveInstruments } from "@/libs/instruments";
// inside the component:
const instruments = await getActiveInstruments();
```

**Step 4: Update `app/page.tsx`**

The landing page uses `commodities` for the "Supported Commodities" grid at line ~248. Replace with DB query. The page is already a server component.

**Step 5: Update `app/api/commodities/route.ts`**

Replace:
```typescript
import { commodities } from "@/config";
export async function GET() {
  return NextResponse.json(commodities);
}
```
With:
```typescript
import { getActiveInstruments } from "@/libs/instruments";
export async function GET() {
  const instruments = await getActiveInstruments();
  return NextResponse.json(instruments);
}
```

**Step 6: Update `app/api/ai/analyze/route.ts`**

- Remove the hardcoded `commodityNames` map (lines 8-15)
- Remove `commodities` import from config
- Add: `import { getInstrumentBySymbol } from "@/libs/instruments";`
- Replace the commodity validation (line ~30-33) with:
```typescript
const instrument = await getInstrumentBySymbol(symbol);
if (!instrument) {
  return NextResponse.json({ error: "Invalid instrument" }, { status: 400 });
}
```
- Replace `commodityName` usage with `instrument.name`

**Step 7: Update `app/api/ai/chat/route.ts`**

Same pattern as analyze route:
- Remove `commodityNames` map (lines 9-16)
- Remove `commodities` import
- Add instrument DB lookup
- Use `instrument.name` for prompts

**Step 8: Verify the app still works**

```bash
npm run dev
```

Visit `/commodities` — should show 6 commodity cards loaded from DB.

**Step 9: Commit**

```bash
git add app/commodities/page.tsx app/commodities/\\[symbol\\]/page.tsx app/dashboard/page.tsx app/page.tsx app/api/commodities/route.ts app/api/ai/analyze/route.ts app/api/ai/chat/route.ts
git commit -m "refactor: read instruments from DB instead of hardcoded config"
```

---

### Task 4: Update AI Limits (Config + UI)

**Files:**
- Modify: `config.ts` line 15 (`paidQuestionsPerDay: 20` → `50`)
- Modify: `config.ts` lines 39, 43, 57, 61 (pricing feature text → "Unlimited AI questions")
- Modify: `components/AIChat.tsx` (remove remaining count display, update limit-hit message)
- Modify: `app/dashboard/page.tsx` (remove or hide question count display)
- Modify: `app/api/ai/usage/route.ts` (stop returning `limit` and `remaining` to frontend)
- Modify: `app/api/ai/chat/route.ts` (stop returning `remainingQuestions` in responses)

**Step 1: Update config.ts**

Change line 15:
```typescript
paidQuestionsPerDay: 50,
```

Change pricing feature arrays — replace `"20 AI questions per day"` with `"Unlimited AI questions"` in both Monthly and Yearly plan features.

Change Monthly description (line 39):
```typescript
description: "Unlimited AI questions, all commodities",
```

**Step 2: Update AIChat.tsx**

Remove the "Questions remaining today" UI block (lines 107-112). Remove the `remainingQuestions` state variable and `fetchUsage` call. Instead, only track whether the user has hit the limit (from API error responses).

Replace the remaining count logic with a simple `limitReached` boolean state. When the chat API returns 429, set `limitReached = true`.

Remove the bottom "Daily free questions exhausted" message (lines 178-182) and replace with a simpler message that only shows when `limitReached` is true:
- Free user: "Daily free questions used up. Upgrade for unlimited access."
- Paid user: "You've reached today's limit. Please try again tomorrow."

**Step 3: Update dashboard/page.tsx**

Remove or simplify the "Questions Today" and "Daily Limit" display (lines 61-69). Since we're hiding limits, replace with just showing the user's tier (Free/Premium).

**Step 4: Update api/ai/usage/route.ts**

Stop returning `remaining` and `limit`. Return only `{ used, isPaid }`. The frontend no longer needs these values.

**Step 5: Update api/ai/chat/route.ts**

Remove `remainingQuestions` from all response objects (lines 100, 124, 184). The frontend doesn't display this anymore.

**Step 6: Verify**

```bash
npm run dev
```
- Check AIChat no longer shows remaining count
- Check pricing page shows "Unlimited AI questions"
- Check dashboard doesn't show exact question limits

**Step 7: Commit**

```bash
git add config.ts components/AIChat.tsx app/dashboard/page.tsx app/api/ai/usage/route.ts app/api/ai/chat/route.ts
git commit -m "feat: raise paid limit to 50/day, hide counts from UI, show 'Unlimited'"
```

---

### Task 5: Create i18n Infrastructure

**Files:**
- Create: `libs/i18n/en.json`
- Create: `libs/i18n/zh.json`
- Create: `libs/i18n/LanguageContext.tsx`
- Create: `libs/i18n/useTranslation.ts`
- Create: `libs/i18n/index.ts`
- Create: `components/LanguageSwitcher.tsx`
- Modify: `components/LayoutClient.tsx` (~line 122, wrap children with LanguageProvider)

**Step 1: Create English translation file `libs/i18n/en.json`**

```json
{
  "nav.commodities": "Commodities",
  "nav.pricing": "Pricing",
  "nav.faq": "FAQ",

  "hero.title": "AI-Powered Commodity Impact Factor Analysis",
  "hero.subtitle": "Help beginner investors understand the logic behind futures & commodity price movements",
  "hero.cta.analyze": "Start Analysis",
  "hero.cta.pricing": "View Pricing",

  "features.title": "Core Features",
  "features.subtitle": "Professional commodity analysis tools, powered by AI",
  "features.matrix.title": "AI Impact Factor Matrix",
  "features.matrix.desc": "AI analyzes multiple price impact factors and visualizes them on a time-impact matrix",
  "features.charts.title": "Real-time Price Charts",
  "features.charts.desc": "Powered by TradingView, view real-time commodity price movements",
  "features.chat.title": "AI Q&A",
  "features.chat.desc": "Ask AI any commodity-related questions, get professional educational answers",
  "features.commodities.title": "Multiple Commodities",
  "features.commodities.desc": "Covers major commodities including gold, silver, crude oil, natural gas and more",

  "howItWorks.title": "How It Works",
  "howItWorks.subtitle": "Three simple steps to start your commodity analysis",
  "howItWorks.step1.title": "Choose a Commodity",
  "howItWorks.step1.desc": "Select the commodity you want to analyze",
  "howItWorks.step2.title": "View AI Analysis",
  "howItWorks.step2.desc": "AI generates a comprehensive impact factor matrix",
  "howItWorks.step3.title": "Ask Questions",
  "howItWorks.step3.desc": "Use AI Q&A to deepen your understanding",

  "supportedCommodities.title": "Supported Commodities",
  "supportedCommodities.subtitle": "Covering the most actively traded commodities worldwide",
  "supportedCommodities.explore": "Explore Now",

  "faq.title": "Frequently Asked Questions",
  "faq.q1": "What is an impact factor matrix?",
  "faq.a1": "An impact factor matrix is a visualization tool that maps various factors affecting commodity prices across two dimensions: time horizon (short/medium/long-term) and impact level (high/medium/low). It helps you quickly understand which factors matter most and when they are likely to affect prices.",
  "faq.q2": "How accurate is the AI analysis?",
  "faq.a2": "Our AI provides educational analysis based on widely recognized market factors and economic principles. It is designed to help you understand market dynamics, not to predict exact price movements. Always do your own research and consult financial advisors before making investment decisions.",
  "faq.q3": "What commodities are supported?",
  "faq.a3": "We currently support 6 major commodities: Gold, Silver, Copper, WTI Crude Oil, Natural Gas, and Soybean. We plan to add more commodities and other financial instruments in the future.",
  "faq.q4": "How many questions can I ask per day?",
  "faq.a4": "Free users can ask 3 questions per day. Premium subscribers enjoy unlimited AI questions across all commodities.",
  "faq.q5": "Is this investment advice?",
  "faq.a5": "No. This platform provides educational market factor analysis only and does not constitute investment advice. Trading involves risk. Past performance does not guarantee future results. Always consult a qualified financial advisor.",

  "commodities.title": "Choose a Commodity to Analyze",
  "commodities.subtitle": "AI will analyze the key price impact factors for your selected commodity, helping you understand market dynamics",
  "commodities.viewAnalysis": "View Analysis",

  "detail.notFound": "Commodity Not Found",
  "detail.backToCommodities": "Back to Commodities",
  "detail.priceChart": "Real-time Price Chart",
  "detail.factorMatrix": "Impact Factor Matrix",
  "detail.generatedAt": "Generated at",
  "detail.analyzing": "AI is analyzing impact factors...",
  "detail.retry": "Retry",
  "detail.summary": "Analysis Summary",
  "detail.aiChat": "AI Q&A",

  "matrix.highImpact": "High Impact",
  "matrix.mediumImpact": "Medium Impact",
  "matrix.lowImpact": "Low Impact",
  "matrix.shortTerm": "Short-term (Days-Weeks)",
  "matrix.mediumTerm": "Medium-term (Months-Years)",
  "matrix.longTerm": "Long-term (5-20 Years)",
  "matrix.noFactors": "No factors",
  "matrix.timeHorizon": "Time Horizon",

  "chat.placeholder": "Type your question...",
  "chat.limitReached": "Daily limit reached",
  "chat.send": "Send",
  "chat.askAI": "Have any questions about {commodity} for AI?",
  "chat.suggestedQ1": "What are the main factors affecting {commodity}?",
  "chat.suggestedQ2": "How does inflation affect commodity prices?",
  "chat.suggestedQ3": "How does supply and demand work?",
  "chat.freeLimitHit": "Daily free questions used up. Upgrade for unlimited access.",
  "chat.paidLimitHit": "You've reached today's limit. Please try again tomorrow.",
  "chat.error": "Sorry, an error occurred. Please try again later.",

  "pricing.label": "Pricing",
  "pricing.title": "Choose the plan that's right for you",
  "pricing.bestValue": "BEST VALUE",
  "pricing.currency": "USD",
  "pricing.trial": "3-day free trial, cancel anytime",
  "pricing.getApp": "Get {appName}",

  "dashboard.title": "Dashboard",
  "dashboard.plan": "Plan",
  "dashboard.premium": "Premium",
  "dashboard.free": "Free",
  "dashboard.upgrade": "Upgrade",
  "dashboard.analyzeCommodity": "Analyze a Commodity",
  "dashboard.howToUse": "How to Use",
  "dashboard.step1": "Choose a commodity from below",
  "dashboard.step2": "View the AI-generated impact factor matrix",
  "dashboard.step3": "Ask AI follow-up questions to deepen understanding",

  "signin.title": "Sign in to {appName}",
  "signin.emailPlaceholder": "Enter your email address",
  "signin.sendMagicLink": "Send Magic Link",
  "signin.linkSent": "Login link sent! Please check your email...",
  "signin.toastSent": "Login link sent to your email!",
  "signin.toastFailed": "Failed to send, please try again",

  "disclaimer.title": "Disclaimer",
  "disclaimer.text": "This platform provides educational market factor analysis only and does not constitute investment advice. Trading involves risk. Past performance does not guarantee future results.",

  "disclaimerModal.title": "Important Disclaimer",
  "disclaimerModal.confirm": "Confirm and Continue",
  "disclaimerModal.onceOnly": "This confirmation is required only once",
  "disclaimerModal.agreement": "I have read and agree to the above disclaimer",
  "disclaimerModal.riskWarning": "Investment involves risk. Please exercise caution.",

  "footer.links": "Links",
  "footer.commodities": "Commodities",
  "footer.pricing": "Pricing",
  "footer.contact": "Contact Us",
  "footer.legal": "Legal",
  "footer.tos": "Terms of Service",
  "footer.privacy": "Privacy Policy",
  "footer.copyright": "Copyright",
  "footer.allRightsReserved": "All rights reserved",

  "account.billing": "Billing",
  "account.logout": "Logout",
  "account.fallbackName": "Account",

  "common.loading": "Loading...",
  "common.error": "An error occurred",

  "lang.en": "EN",
  "lang.zh": "中文"
}
```

**Step 2: Create Chinese translation file `libs/i18n/zh.json`**

```json
{
  "nav.commodities": "商品分析",
  "nav.pricing": "价格",
  "nav.faq": "常见问题",

  "hero.title": "AI驱动的商品影响因子分析",
  "hero.subtitle": "帮助投资新手理解期货和商品价格波动背后的逻辑",
  "hero.cta.analyze": "开始分析",
  "hero.cta.pricing": "查看价格",

  "features.title": "核心功能",
  "features.subtitle": "专业的商品分析工具，由AI驱动",
  "features.matrix.title": "AI影响因子矩阵",
  "features.matrix.desc": "AI分析多种价格影响因素，并在时间-影响力矩阵上可视化展示",
  "features.charts.title": "实时价格图表",
  "features.charts.desc": "由TradingView提供支持，查看实时商品价格走势",
  "features.chat.title": "AI问答",
  "features.chat.desc": "向AI询问任何商品相关问题，获取专业的教育性解答",
  "features.commodities.title": "多种商品",
  "features.commodities.desc": "涵盖黄金、白银、原油、天然气等主要商品",

  "howItWorks.title": "使用方法",
  "howItWorks.subtitle": "三个简单步骤开始你的商品分析",
  "howItWorks.step1.title": "选择商品",
  "howItWorks.step1.desc": "选择你想要分析的商品",
  "howItWorks.step2.title": "查看AI分析",
  "howItWorks.step2.desc": "AI生成全面的影响因子矩阵",
  "howItWorks.step3.title": "提问互动",
  "howItWorks.step3.desc": "使用AI问答深入了解",

  "supportedCommodities.title": "支持的商品",
  "supportedCommodities.subtitle": "覆盖全球最活跃交易的商品",
  "supportedCommodities.explore": "立即探索",

  "faq.title": "常见问题",
  "faq.q1": "什么是影响因子矩阵？",
  "faq.a1": "影响因子矩阵是一种可视化工具，将影响商品价格的各种因素按两个维度映射：时间范围（短期/中期/长期）和影响程度（高/中/低）。它帮助你快速了解哪些因素最重要，以及它们可能在何时影响价格。",
  "faq.q2": "AI分析有多准确？",
  "faq.a2": "我们的AI基于广泛认可的市场因素和经济原理提供教育性分析。它旨在帮助你理解市场动态，而非预测精确的价格走势。在做出投资决策前，请务必自行研究并咨询财务顾问。",
  "faq.q3": "支持哪些商品？",
  "faq.a3": "我们目前支持6种主要商品：黄金、白银、铜、WTI原油、天然气和大豆。我们计划在未来添加更多商品和其他金融工具。",
  "faq.q4": "每天可以提多少个问题？",
  "faq.a4": "免费用户每天可以提3个问题。高级订阅用户享受无限AI提问，覆盖所有商品。",
  "faq.q5": "这算投资建议吗？",
  "faq.a5": "不是。本平台仅提供教育性市场因子分析，不构成投资建议。交易涉及风险。过往表现不保证未来结果。请始终咨询合格的财务顾问。",

  "commodities.title": "选择要分析的商品",
  "commodities.subtitle": "AI将分析您所选商品的关键价格影响因子，帮助您理解市场动态",
  "commodities.viewAnalysis": "查看分析",

  "detail.notFound": "未找到商品",
  "detail.backToCommodities": "返回商品列表",
  "detail.priceChart": "实时价格图表",
  "detail.factorMatrix": "影响因子矩阵",
  "detail.generatedAt": "生成时间",
  "detail.analyzing": "AI正在分析影响因子...",
  "detail.retry": "重试",
  "detail.summary": "分析摘要",
  "detail.aiChat": "AI问答",

  "matrix.highImpact": "高影响",
  "matrix.mediumImpact": "中等影响",
  "matrix.lowImpact": "低影响",
  "matrix.shortTerm": "短期（数天-数周）",
  "matrix.mediumTerm": "中期（数月-数年）",
  "matrix.longTerm": "长期（5-20年）",
  "matrix.noFactors": "暂无因子",
  "matrix.timeHorizon": "时间范围",

  "chat.placeholder": "输入你的问题...",
  "chat.limitReached": "已达每日上限",
  "chat.send": "发送",
  "chat.askAI": "有关于{commodity}的问题想问AI吗？",
  "chat.suggestedQ1": "影响{commodity}的主要因素有哪些？",
  "chat.suggestedQ2": "通货膨胀如何影响商品价格？",
  "chat.suggestedQ3": "供需关系是如何运作的？",
  "chat.freeLimitHit": "每日免费提问次数已用完。升级享受无限提问。",
  "chat.paidLimitHit": "您已达到今日上限，请明天再来。",
  "chat.error": "抱歉，发生了错误。请稍后重试。",

  "pricing.label": "价格",
  "pricing.title": "选择适合你的方案",
  "pricing.bestValue": "最超值",
  "pricing.currency": "美元",
  "pricing.trial": "3天免费试用，随时取消",
  "pricing.getApp": "获取 {appName}",

  "dashboard.title": "控制面板",
  "dashboard.plan": "方案",
  "dashboard.premium": "高级版",
  "dashboard.free": "免费版",
  "dashboard.upgrade": "升级",
  "dashboard.analyzeCommodity": "分析商品",
  "dashboard.howToUse": "使用方法",
  "dashboard.step1": "从下方选择一个商品",
  "dashboard.step2": "查看AI生成的影响因子矩阵",
  "dashboard.step3": "向AI提出后续问题以加深理解",

  "signin.title": "登录 {appName}",
  "signin.emailPlaceholder": "请输入邮箱地址",
  "signin.sendMagicLink": "发送登录链接",
  "signin.linkSent": "登录链接已发送！请查看邮箱...",
  "signin.toastSent": "登录链接已发送到您的邮箱！",
  "signin.toastFailed": "发送失败，请重试",

  "disclaimer.title": "免责声明",
  "disclaimer.text": "本平台仅提供教育性市场因子分析，不构成投资建议。交易涉及风险。过往表现不保证未来结果。",

  "disclaimerModal.title": "重要免责声明",
  "disclaimerModal.confirm": "确认并继续",
  "disclaimerModal.onceOnly": "此确认仅需一次",
  "disclaimerModal.agreement": "我已阅读并同意以上免责声明",
  "disclaimerModal.riskWarning": "投资有风险，请谨慎操作。",

  "footer.links": "链接",
  "footer.commodities": "商品分析",
  "footer.pricing": "价格",
  "footer.contact": "联系我们",
  "footer.legal": "法律",
  "footer.tos": "服务条款",
  "footer.privacy": "隐私政策",
  "footer.copyright": "版权所有",
  "footer.allRightsReserved": "保留所有权利",

  "account.billing": "账单",
  "account.logout": "退出登录",
  "account.fallbackName": "账户",

  "common.loading": "加载中...",
  "common.error": "发生了错误",

  "lang.en": "EN",
  "lang.zh": "中文"
}
```

**Step 3: Create LanguageContext `libs/i18n/LanguageContext.tsx`**

```tsx
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
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const saved = getCookie("lang") as Language | null;
    if (saved && (saved === "en" || saved === "zh")) {
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
          value = value.replace(new RegExp(`\\{${k}\\}`, "g"), v);
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
```

**Step 4: Create useTranslation hook `libs/i18n/useTranslation.ts`**

```typescript
"use client";

import { useContext } from "react";
import { LanguageContext } from "./LanguageContext";

export function useTranslation() {
  return useContext(LanguageContext);
}
```

**Step 5: Create barrel export `libs/i18n/index.ts`**

```typescript
export { LanguageProvider } from "./LanguageContext";
export type { Language } from "./LanguageContext";
export { useTranslation } from "./useTranslation";
```

**Step 6: Create LanguageSwitcher `components/LanguageSwitcher.tsx`**

```tsx
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
```

**Step 7: Wrap app with LanguageProvider in `components/LayoutClient.tsx`**

At the top, add import:
```typescript
import { LanguageProvider } from "@/libs/i18n";
```

Inside `ClientLayout`, wrap `{children}` with `<LanguageProvider>`:
```tsx
<LanguageProvider>
  {/* existing children/content */}
</LanguageProvider>
```

**Step 8: Verify infrastructure**

```bash
npm run dev
```
Open browser console, confirm no errors. The app should render identically (all keys fall back to English dict values).

**Step 9: Commit**

```bash
git add libs/i18n/ components/LanguageSwitcher.tsx components/LayoutClient.tsx
git commit -m "feat: add i18n infrastructure (context, hook, en/zh dictionaries, language switcher)"
```

---

### Task 6: Add LanguageSwitcher to Header

**Files:**
- Modify: `components/Header.tsx`

**Step 1: Add LanguageSwitcher to Header**

Import at top:
```typescript
import LanguageSwitcher from "./LanguageSwitcher";
```

Add `<LanguageSwitcher />` in the desktop CTA area (before the sign-in/account button, around line 125):
```tsx
<div className="hidden lg:flex lg:justify-end lg:flex-1 lg:gap-2 lg:items-center">
  <LanguageSwitcher />
  {user ? <ButtonAccount /> : <ButtonSignin extraStyle="btn-primary" />}
</div>
```

Add it to the mobile menu too (around line 205, before the CTA):
```tsx
<div className="flex flex-col">
  <div className="mb-4">
    <LanguageSwitcher />
  </div>
  {user ? <ButtonAccount /> : <ButtonSignin extraStyle="btn-primary" />}
</div>
```

**Step 2: Commit**

```bash
git add components/Header.tsx
git commit -m "feat: add language switcher to header (desktop + mobile)"
```

---

### Task 7: Apply i18n to All Components and Pages

This is the largest task. Apply `useTranslation()` to every component with hardcoded English text.

**Files to modify:**
- `app/page.tsx` — landing page (convert to client component or create client wrapper)
- `app/commodities/page.tsx` — commodity list
- `app/commodities/[symbol]/page.tsx` — commodity detail
- `app/dashboard/page.tsx` — dashboard
- `app/signin/page.tsx` — sign-in
- `components/Header.tsx` — nav links
- `components/AIChat.tsx` — chat UI
- `components/FactorMatrix.tsx` — matrix labels
- `components/Pricing.tsx` — pricing section
- `components/ButtonCheckout.tsx` — button text
- `components/ButtonSignin.tsx` — button text
- `components/ButtonAccount.tsx` — menu items
- `components/Disclaimer.tsx` — disclaimer text
- `components/DisclaimerModal.tsx` — modal text
- `components/Footer.tsx` — footer text

**General pattern for each client component:**

1. Add `import { useTranslation } from "@/libs/i18n";`
2. Add `const { t, lang } = useTranslation();` at top of component
3. Replace every hardcoded English string with `t("key")`
4. For instrument names: use `lang === "zh" && instrument.name_zh ? instrument.name_zh : instrument.name`

**Pattern for server components (pages that fetch from DB):**

Server components can't use hooks. Two approaches:
- **Option A**: Create a client wrapper component that receives data as props and handles translation
- **Option B**: Read the `lang` cookie server-side via `cookies()` and pass it as a prop

**Recommended: Option B for data + Option A for static text.** For pages like `app/commodities/page.tsx` which fetch from DB (server) but need translated UI text (client), split into:
- Server component: fetches data, reads `lang` cookie, passes both to client component
- Client component: renders translated UI using `useTranslation()`, receives instrument data as props

**For commodity/instrument name display:**

Wherever an instrument name is displayed, use this pattern:
```typescript
const displayName = lang === "zh" && instrument.name_zh ? instrument.name_zh : instrument.name;
```

**For the config.ts pricing features:**

The feature names in `config.stripe.plans[].features[]` are currently plain English strings. For i18n, change them to translation keys:
```typescript
features: [
  { name: "pricing.feature.unlimitedAI" },
  { name: "pricing.feature.allCommodities" },
  { name: "pricing.feature.realtimeCharts" },
  { name: "pricing.feature.factorMatrix" },
],
```
Then in `Pricing.tsx`, render as `t(feature.name)`.

Add these keys to both JSON files:
```json
"pricing.feature.unlimitedAI": "Unlimited AI questions",
"pricing.feature.allCommodities": "All commodity analysis",
"pricing.feature.realtimeCharts": "Real-time price charts",
"pricing.feature.factorMatrix": "Factor matrix visualization",
"pricing.feature.save14": "Save 14%"
```

**Step: Apply translations to each file one by one, verify in browser, commit per batch.**

Commit after each logical batch:
```bash
git commit -m "feat(i18n): translate landing page"
git commit -m "feat(i18n): translate commodities pages"
git commit -m "feat(i18n): translate dashboard and signin"
git commit -m "feat(i18n): translate all shared components"
```

---

### Task 8: Add Language to AI Prompts

**Files:**
- Modify: `app/api/ai/analyze/route.ts`
- Modify: `app/api/ai/chat/route.ts`

**Step 1: Read language from cookie in API routes**

In both routes, read the `lang` cookie from the request:
```typescript
import { cookies } from "next/headers";

// Inside the POST handler:
const cookieStore = await cookies();
const lang = cookieStore.get("lang")?.value || "en";
const languageInstruction = lang === "zh"
  ? "Respond entirely in Chinese (Simplified)."
  : "Respond entirely in English.";
```

**Step 2: Update analyze prompt**

In `analyze/route.ts`, append to the prompt (before "Important:"):
```
6. ${languageInstruction}
```

Also use the translated instrument name in the prompt:
```typescript
const promptName = lang === "zh" && instrument.name_zh ? instrument.name_zh : instrument.name;
```

**Important**: The `analysis_cache` key should include the language so Chinese and English analyses are cached separately. Modify the cache lookup to filter by a `lang` field, or append the lang to the symbol key: `${symbol}:${lang}`.

**Step 3: Update chat prompt**

In `chat/route.ts`, append language instruction to the prompt:
```
6. ${languageInstruction}
```

Similarly, include lang in the chat cache key:
```typescript
const cacheKey = `CHAT:${symbol}:${lang}:${simpleHash(normalizedQuestion)}`;
```

**Step 4: Verify**

```bash
npm run dev
```
Switch to Chinese, visit a commodity page. The AI analysis should return Chinese factor names and summary. Switch back to English — should return English.

**Step 5: Commit**

```bash
git add app/api/ai/analyze/route.ts app/api/ai/chat/route.ts
git commit -m "feat: AI responds in user's selected language (en/zh)"
```

---

### Task 9: Update `<html lang>` Attribute Dynamically

**Files:**
- Modify: `app/layout.tsx` (read `lang` cookie server-side)

**Step 1: Read cookie in root layout**

```typescript
import { cookies } from "next/headers";

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "en";

  return (
    <html lang={lang} data-theme="...">
      ...
    </html>
  );
}
```

**Step 2: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: set html lang attribute from cookie"
```

---

### Task 10: Final Verification and Cleanup

**Step 1: Run the build to check for errors**

```bash
npm run build
```

Fix any TypeScript or build errors.

**Step 2: Manual testing checklist**

- [ ] Language toggle switches all UI text between EN and ZH
- [ ] Cookie persists across page reloads
- [ ] AI analysis returns in selected language
- [ ] AI chat responds in selected language
- [ ] Pricing page shows "Unlimited AI questions" / "无限AI提问"
- [ ] AIChat no longer shows remaining question count
- [ ] Commodities load from DB (check Supabase logs)
- [ ] Landing page commodity grid works
- [ ] Instrument names display in selected language (Chinese names for ZH)

**Step 3: Run existing tests**

```bash
npm run test
```

Fix any broken tests (likely the Stripe tests should still pass since we didn't change payment logic).

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup for i18n, limits, and instrument scalability"
```
