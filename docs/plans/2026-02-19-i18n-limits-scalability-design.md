# Design: i18n, AI Limits, Instrument Scalability

Date: 2026-02-19

## 1. Language Switching (Chinese/English)

### Approach

Cookie-based language toggle. No locale routes (`/en`, `/zh`). Simple JSON translation dictionaries with a custom `useTranslation` hook.

### Why no locale routes

Most valuable pages (commodity analysis, AI chat) are behind auth. Search engines can't crawl them. Locale routes add routing complexity with minimal SEO benefit for a SaaS app. The landing page is translated via the same dictionary system.

### File Structure

```
/libs/i18n/
  en.json             # English translations (~150-200 keys, ~5 KB)
  zh.json             # Chinese translations (~150-200 keys, ~5 KB)
  useTranslation.ts   # Hook: reads context, returns t() function
  LanguageContext.tsx  # React context provider, reads/writes 'lang' cookie
  translations.ts     # Type-safe key definitions
```

### How It Works

1. `LanguageSwitcher` component in Header -- a simple EN/ZH toggle button
2. On click: sets `lang` cookie (value: `"en"` or `"zh"`), updates React context
3. `useTranslation()` returns `t(key)` that looks up the active language JSON
4. Server components read `lang` cookie via `cookies()` for SSR
5. AI API routes read the cookie to append language instruction to prompts
6. Default language: English (when no cookie set)

### Translation Scope

All user-visible text:
- Navigation labels
- Landing page (hero, features, CTA, FAQ)
- Commodities browse page
- Commodity detail page UI
- AI chat UI (placeholder, error messages, suggested questions)
- Pricing page
- Disclaimer text
- Auth-related messages

AI-generated content (factor analysis, chat answers) responds in the selected language via prompt instruction.

### Cookie Details

- Name: `lang`
- Values: `"en"` | `"zh"`
- Path: `/`
- Max-age: 365 days
- SameSite: Lax

### Token/Memory Cost

- JSON files: ~10 KB total (both languages). Loaded once, cached in React context.
- AI prompt overhead: ~5-10 extra tokens per request ("Respond in Chinese"). Negligible cost.
- Chinese AI responses: ~10-20% more tokens due to CJK encoding. Negligible cost difference on Gemini Flash.

---

## 2. AI Question Limits

### Changes

| Setting | Before | After |
|---------|--------|-------|
| `paidQuestionsPerDay` | 20 | 50 |
| UI remaining counter | Visible ("Questions remaining: X") | Hidden |
| Pricing feature text | "20 AI questions per day" | "Unlimited AI questions" |
| Free user display | "3 free questions per day" | Unchanged |

### UI Behavior

- **Remove** the "Questions remaining today: X" counter from `AIChat.tsx`
- **Only show a message when limit is hit**:
  - Free users: "Daily free questions used up. Upgrade for unlimited access."
  - Paid users: "You've reached today's limit. Please try again tomorrow."
- Free users still see "3 free questions per day" on the pricing page (to encourage upgrades)

### Backend

No logic change. The `ai_usage` table and `increment_question_count` RPC remain the same. Only `aiConfig.paidQuestionsPerDay` changes from 20 to 50.

---

## 3. Instrument Scalability

### Current State

6 commodities hardcoded in `config.ts` as a static array.

### Target State

Instruments stored in Supabase `instruments` table. Config array becomes seed data only. Current 6 commodities seeded into the table.

### Database Schema

```sql
CREATE TABLE instruments (
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
```

### Category Values

`'commodity'`, `'stock'`, `'future'`, `'etf'`, `'crypto'` -- extensible as needed.

### What Changes Now

1. Create the `instruments` table in Supabase
2. Seed it with the current 6 commodities (including `name_zh` for i18n)
3. Update `/app/commodities/page.tsx` to query from DB instead of config
4. Update `/app/commodities/[symbol]/page.tsx` to look up instrument from DB
5. Update `/app/api/ai/analyze/route.ts` to read instrument name from DB (remove hardcoded `commodityNames` map)
6. Update `/app/api/ai/chat/route.ts` similarly
7. Keep `config.ts` commodities array as fallback/seed reference

### What Changes Later (When Adding Hundreds)

- Admin UI for managing instruments (add/edit/deactivate)
- Browse page: categories, search bar, pagination
- ISR or on-demand revalidation for popular instrument pages
- Bulk TradingView symbol validation
- Category-based navigation (sidebar or tabs)

### Dynamic Pages at Scale

- No `generateStaticParams` -- fully dynamic server-rendered pages
- AI analysis caching: existing `analysis_cache` table with 24h TTL scales independently per instrument
- Only first visitor per instrument per day triggers a Gemini call
- DB query caching via Next.js `unstable_cache` or short TTL

### AI Cost Projections

| Scale | Factor Analysis | Chat Q&A | Monthly Total |
|-------|----------------|----------|---------------|
| 6 instruments, few users | ~$0.002/day | ~$0.06/day | <$1 |
| 100 instruments, 50 users | ~$0.04/day | ~$0.40/day | ~$15-25 |
| 1,000 instruments, 200 users | ~$0.40/day | ~$4/day | ~$80-150 |

Key cost control: 24h analysis caching + chat response caching.

### API Route Changes

The `analyze` and `chat` routes currently validate against the hardcoded `commodities` array. After migration:
- Validate against the `instruments` table (`WHERE symbol = $1 AND is_active = TRUE`)
- Read `name` and `name_zh` from the table (use appropriate name based on `lang` cookie for AI prompts)
- Remove hardcoded `commodityNames` maps

### Seed Data

```sql
INSERT INTO instruments (symbol, name, name_zh, category, tv_symbol, icon, sort_order) VALUES
  ('GOLD', 'Gold', '黄金', 'commodity', 'CMCMARKETS:GOLD', '🥇', 1),
  ('SILVER', 'Silver', '白银', 'commodity', 'CMCMARKETS:SILVER', '🥈', 2),
  ('COPPER', 'Copper', '铜', 'commodity', 'CMCMARKETS:COPPER', '🔶', 3),
  ('CRUDE_OIL', 'WTI Crude Oil', 'WTI原油', 'commodity', 'CMCMARKETS:USCRUDEOIL', '🛢️', 4),
  ('NATURAL_GAS', 'Natural Gas', '天然气', 'commodity', 'CMCMARKETS:USNATGAS', '🔥', 5),
  ('SOYBEAN', 'Soybean', '大豆', 'commodity', 'CMCMARKETS:SOYBEAN1!', '🫘', 6);
```

---

## Implementation Order

1. **Instruments table** -- Create table, seed data, update API routes and pages to read from DB
2. **AI limits** -- Change config value, remove UI counter, update pricing text
3. **i18n** -- Create translation files, hook, context, language switcher, translate all UI text
4. **i18n for AI** -- Add language parameter to AI prompts, add `name_zh` usage in prompts

Steps 1 and 2 are small, independent changes. Step 3 is the largest (touching many files for translation keys). Step 4 depends on both 1 and 3.
