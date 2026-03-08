# Freemium Conversion + Chat Persistence Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert Chartiqs to a freemium model (free factor analysis, lower pricing) and add persistent chat history with improved UI.

**Architecture:** Three independent workstreams: (A) Open up factor analysis to anonymous users + lower pricing, (B) Persist AI chat history in Supabase per user, (C) Improve chat UI styling and AI response formatting. All changes are additive — no data migration needed.

**Tech Stack:** Next.js 15, Supabase PostgreSQL, Stripe, Gemini 2.0 Flash, Tailwind/DaisyUI

---

## Workstream A: Freemium Model

### Task 1: Make Factor Analysis Available Without Login

**Files:**
- Modify: `app/api/ai/analyze/route.ts` (lines 13-16, remove auth gate)
- Modify: `components/CommodityDetailClient.tsx` (line 47, switch from `apiClient.post` to `fetch`)
- Modify: `libs/api.ts` (reference only — understand the 401 interceptor)

**Step 1: Update analyze API to allow anonymous access**

In `app/api/ai/analyze/route.ts`, replace the hard auth gate with optional auth:

```typescript
// OLD (lines 12-16):
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return NextResponse.json({ error: "Please log in first" }, { status: 401 });
}

// NEW:
const { data: { user } } = await supabase.auth.getUser();
// Auth is optional — anonymous users can view cached analysis
```

No other changes in this file — the rest of the logic (cache check, Gemini call, cache save) works fine without a user ID since it's keyed by `symbol:lang`, not by user.

**Step 2: Update CommodityDetailClient to use plain fetch instead of apiClient**

In `components/CommodityDetailClient.tsx`, the `apiClient.post` interceptor redirects 401s to `/signin`. Since we're removing the auth requirement, switch to plain `fetch`:

```typescript
// OLD (line 47):
const data: AnalysisData = await apiClient.post("/ai/analyze", { symbol });

// NEW:
const res = await fetch("/api/ai/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ symbol }),
});
if (!res.ok) {
  const err = await res.json();
  throw new Error(err.error || "Analysis request failed");
}
const data: AnalysisData = await res.json();
```

Also remove the 401 special-case in the catch block (lines 50-53) since it's no longer relevant.

**Step 3: Test manually**

- Open an incognito browser (no login)
- Navigate to `/commodities/GOLD`
- Factor matrix and summary should load without redirect to signin
- TradingView chart should display

**Step 4: Commit**

```bash
git add app/api/ai/analyze/route.ts components/CommodityDetailClient.tsx
git commit -m "feat: allow anonymous access to factor analysis (freemium)"
```

---

### Task 2: Gate AI Chat Behind Login (Keep as-is, but improve UX for logged-out users)

**Files:**
- Modify: `components/AIChat.tsx`
- Modify: `libs/i18n/en.json`
- Modify: `libs/i18n/zh.json`

**Step 1: Add login prompt when user is not authenticated**

The chat API already returns 401 for unauthenticated users. But currently, `AIChat` doesn't handle this gracefully for anonymous visitors. Add a prop to indicate auth state and show a CTA:

In `components/AIChat.tsx`, add an `isLoggedIn` prop:

```typescript
interface AIChatProps {
  symbol: string;
  commodityName: string;
  factors: Factor[];
  isLoggedIn: boolean;
}
```

When `!isLoggedIn`, show a login prompt instead of the chat input:

```tsx
{!isLoggedIn ? (
  <div className="text-center py-8">
    <p className="text-base-content/60 mb-4">{t("chat.loginToAsk")}</p>
    <a href="/signin" className="btn btn-primary btn-sm">
      {t("chat.loginButton")}
    </a>
  </div>
) : (
  // existing chat UI (messages + input form)
)}
```

**Step 2: Pass auth state from CommodityDetailClient**

In `CommodityDetailClient.tsx`, check auth status and pass it down:

```typescript
const [isLoggedIn, setIsLoggedIn] = useState(false);

useEffect(() => {
  // Check if user is logged in
  const checkAuth = async () => {
    try {
      const res = await fetch("/api/ai/usage");
      setIsLoggedIn(res.ok);
    } catch {
      setIsLoggedIn(false);
    }
  };
  checkAuth();
}, []);
```

Pass to AIChat: `<AIChat ... isLoggedIn={isLoggedIn} />`

**Step 3: Add translation keys**

In both `en.json` and `zh.json`:

```json
"chat.loginToAsk": "Sign in to ask AI questions about this commodity",  // EN
"chat.loginToAsk": "登录后即可向AI提问关于此商品的问题",  // ZH
"chat.loginButton": "Sign In",  // EN
"chat.loginButton": "登录",  // ZH
```

**Step 4: Commit**

```bash
git add components/AIChat.tsx components/CommodityDetailClient.tsx libs/i18n/en.json libs/i18n/zh.json
git commit -m "feat: show login CTA for anonymous users in AI chat"
```

---

### Task 3: Update Pricing — $9.9/month, $79/year

**Files:**
- Modify: `config.ts` (lines 34-63)
- Modify: `libs/i18n/en.json`
- Modify: `libs/i18n/zh.json`

**Important:** New Stripe Price objects must be created in the Stripe Dashboard FIRST. The `priceId` values come from environment variables, so no code change is needed for IDs — only the display prices and descriptions in `config.ts` and translations.

**Step 1: Create new prices in Stripe Dashboard**

- Go to Stripe Dashboard > Products
- Create new price: $9.90/month recurring
- Create new price: $79.00/year recurring
- Copy the new `price_xxx` IDs
- Update environment variables in `.env.local` AND Cloudflare Pages:
  - `NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=price_new_monthly_id`
  - `NEXT_PUBLIC_STRIPE_PRICE_YEARLY=price_new_yearly_id`

**Step 2: Update config.ts display prices**

```typescript
// config.ts stripe.plans
{
  priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || "price_monthly",
  name: "Monthly",
  description: "Unlimited AI questions, all commodities",
  price: 9.9,
  priceAnchor: 19,
  features: [
    { name: "pricing.feature.unlimitedAI" },
    { name: "pricing.feature.allCommodities" },
    { name: "pricing.feature.realtimeCharts" },
    { name: "pricing.feature.factorMatrix" },
  ],
},
{
  priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY || "price_yearly",
  isFeatured: true,
  name: "Yearly",
  description: "Save 33% — best value",
  price: 79,
  priceAnchor: 119,
  features: [
    { name: "pricing.feature.unlimitedAI" },
    { name: "pricing.feature.allCommodities" },
    { name: "pricing.feature.realtimeCharts" },
    { name: "pricing.feature.factorMatrix" },
    { name: "pricing.feature.save33" },
  ],
},
```

**Step 3: Update translations**

```json
// en.json
"pricing.plan.yearly.desc": "Save 33% — best value",
"pricing.feature.save33": "Save 33%",

// zh.json
"pricing.plan.yearly.desc": "节省33% — 最超值",
"pricing.feature.save33": "节省33%",
```

Remove old `pricing.feature.save14` keys from both files.

**Step 4: Verify Pricing component renders correctly**

The `Pricing.tsx` component uses `${plan.price}` directly, so $9.9 will display as `$9.9`. Check if it needs formatting. If so, add `.toFixed(2)` or change display price to `9.90` string.

**Step 5: Commit**

```bash
git add config.ts libs/i18n/en.json libs/i18n/zh.json
git commit -m "feat: lower pricing to $9.9/mo and $79/yr for early adoption"
```

---

## Workstream B: Chat History Persistence

### Task 4: Create chat_messages Table in Supabase

**Files:**
- Create: `supabase/migrations/20260308_chat_messages.sql` (or run directly in Supabase SQL editor)

**Step 1: Create the table**

Run in Supabase SQL Editor:

```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_user_symbol ON chat_messages(user_id, symbol, created_at DESC);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id, created_at DESC);

-- RLS: users can only read/write their own messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own messages"
  ON chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**Step 2: Verify in Supabase Dashboard**

- Table `chat_messages` should appear
- RLS policies should be active

**Step 3: Commit migration file**

```bash
git add supabase/migrations/20260308_chat_messages.sql
git commit -m "feat: add chat_messages table for persistent chat history"
```

---

### Task 5: Create Chat History API Endpoints

**Files:**
- Create: `app/api/ai/chat/history/route.ts`
- Modify: `app/api/ai/chat/route.ts` (save messages after successful response)

**Step 1: Create GET endpoint to load chat history**

`app/api/ai/chat/history/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");

    let query = supabase
      .from("chat_messages")
      .select("role, content, symbol, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (symbol) {
      query = query.eq("symbol", symbol);
    }

    // Limit to last 50 messages per commodity to avoid huge payloads
    query = query.limit(50);

    const { data, error } = await query;
    if (error) {
      console.error("Chat history error:", error);
      return NextResponse.json({ error: "Failed to load history" }, { status: 500 });
    }

    return NextResponse.json({ messages: data || [] });
  } catch (error) {
    console.error("Chat history error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

**Step 2: Save messages in existing chat API**

In `app/api/ai/chat/route.ts`, after a successful Gemini response (around line 180), save both user question and AI answer:

```typescript
// After: await updateUsage(serviceSupabase, user.id, today);
// Add:
await serviceSupabase.from("chat_messages").insert([
  { user_id: user.id, symbol, role: "user", content: question },
  { user_id: user.id, symbol, role: "assistant", content: answer },
]);
```

Also save messages when returning cached chat responses (around line 117):

```typescript
// After cache hit, before return:
await serviceSupabase.from("chat_messages").insert([
  { user_id: user.id, symbol, role: "user", content: question },
  { user_id: user.id, symbol, role: "assistant", content: cached.analysis_data.answer },
]);
```

**Step 3: Commit**

```bash
git add app/api/ai/chat/history/route.ts app/api/ai/chat/route.ts
git commit -m "feat: save and retrieve chat history per user per commodity"
```

---

### Task 6: Load Chat History in AIChat Component

**Files:**
- Modify: `components/AIChat.tsx`

**Step 1: Load history on mount**

Add a `useEffect` that fetches history when the component mounts:

```typescript
const [historyLoaded, setHistoryLoaded] = useState(false);

useEffect(() => {
  if (!isLoggedIn) return;
  const loadHistory = async () => {
    try {
      const res = await fetch(`/api/ai/chat/history?symbol=${symbol}`);
      if (res.ok) {
        const data = await res.json();
        if (data.messages?.length > 0) {
          setMessages(data.messages.map((m: any) => ({
            role: m.role,
            content: m.content,
          })));
        }
      }
    } catch {
      // Silent fail — just start with empty chat
    } finally {
      setHistoryLoaded(true);
    }
  };
  loadHistory();
}, [symbol, isLoggedIn]);
```

**Step 2: Show loading state while history loads**

Before the messages area, if `!historyLoaded && isLoggedIn`, show a subtle loading indicator:

```tsx
{!historyLoaded && isLoggedIn ? (
  <div className="flex items-center justify-center h-full">
    <span className="loading loading-spinner loading-sm"></span>
  </div>
) : (
  // existing messages UI
)}
```

**Step 3: Commit**

```bash
git add components/AIChat.tsx
git commit -m "feat: load chat history on component mount"
```

---

## Workstream C: Chat UI Improvements

### Task 7: White Background + Black Text for AI Responses

**Files:**
- Modify: `components/AIChat.tsx` (lines 116-128)

**Step 1: Replace DaisyUI chat-bubble styling for assistant messages**

Replace the current chat bubble styling:

```tsx
// OLD (lines 120-126):
<div
  className={`chat-bubble ${
    msg.role === "user" ? "chat-bubble-primary" : "chat-bubble-neutral"
  }`}
>
  {msg.content}
</div>

// NEW:
<div
  className={
    msg.role === "user"
      ? "chat-bubble chat-bubble-primary"
      : "bg-white text-gray-900 border border-gray-200 rounded-2xl px-4 py-3 shadow-sm max-w-[90%]"
  }
>
  {msg.role === "assistant" ? (
    <div className="prose prose-sm prose-gray max-w-none"
      dangerouslySetInnerHTML={{ __html: formatAIResponse(msg.content) }}
    />
  ) : (
    msg.content
  )}
</div>
```

Note: We use a custom div instead of `chat-bubble` for assistant messages to get full control over the background. The `prose` class from Tailwind Typography enables nice markdown rendering.

**Step 2: Add formatAIResponse helper**

At the top of `AIChat.tsx` (outside the component):

```typescript
function formatAIResponse(content: string): string {
  // Convert markdown-style formatting to HTML
  let html = content
    // Bold: **text**
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Bullet points: lines starting with - or •
    .replace(/^[-•]\s+(.+)/gm, "<li>$1</li>")
    // Numbered lists: lines starting with 1. 2. etc
    .replace(/^\d+\.\s+(.+)/gm, "<li>$1</li>");

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul class='list-disc pl-4 my-2'>$1</ul>");

  // Convert double newlines to paragraph breaks
  html = html.replace(/\n\n/g, "</p><p class='mb-2'>");
  // Convert single newlines to line breaks
  html = html.replace(/\n/g, "<br/>");

  // Wrap in paragraph
  html = `<p class="mb-2">${html}</p>`;

  return html;
}
```

**Step 3: Commit**

```bash
git add components/AIChat.tsx
git commit -m "feat: white background and structured formatting for AI chat responses"
```

---

### Task 8: Update Gemini Prompt for Structured Responses

**Files:**
- Modify: `app/api/ai/chat/route.ts` (prompt around line 125-140)

**Step 1: Update the chat prompt to request structured output**

```typescript
const prompt = `You are an educational consultant for commodity markets. The user is viewing impact factor analysis for ${commodityName}.

Current factor matrix:
${context || "No factor data available"}

User question: ${question}

Requirements:
1. Answer in clear, easy-to-understand language
2. Structure your response with clear sections:
   - Start with a brief direct answer (1-2 sentences)
   - Use **bold** for key terms
   - Use bullet points for lists of factors or reasons
   - End with a brief takeaway if appropriate
3. You may reference the currently displayed factors
4. Do not give buy/sell recommendations
5. Keep answer within 250 words
6. If the question involves specific investment advice, politely decline and guide the user to ask other questions
7. ${languageInstruction}

Tone: Professional but friendly, like a teacher educating a student`;
```

Key changes:
- Added requirement #2 for structured formatting
- Increased word limit from 200 to 250 to allow for formatting
- Requested bold, bullet points, and clear sections

**Step 2: Commit**

```bash
git add app/api/ai/chat/route.ts
git commit -m "feat: update Gemini prompt for structured sectioned responses"
```

---

### Task 9: Add Tailwind Typography Plugin (if not already installed)

**Files:**
- Modify: `package.json`
- Possibly modify: `tailwind.config.ts` or `globals.css`

**Step 1: Check if @tailwindcss/typography is installed**

```bash
npm ls @tailwindcss/typography
```

If not installed:

```bash
npm install @tailwindcss/typography
```

**Step 2: Enable the plugin**

For Tailwind v4, add to `globals.css` (or wherever Tailwind is configured):

```css
@plugin "@tailwindcss/typography";
```

Or in `tailwind.config.ts`:

```typescript
plugins: [require("@tailwindcss/typography")],
```

**Step 3: Commit**

```bash
git add package.json package-lock.json globals.css
git commit -m "chore: add tailwind typography plugin for prose styling"
```

---

## Workstream D: Translation Updates

### Task 10: Add All New Translation Keys

**Files:**
- Modify: `libs/i18n/en.json`
- Modify: `libs/i18n/zh.json`

**Step 1: Add all new keys to en.json**

```json
"chat.loginToAsk": "Sign in to ask AI questions about this commodity",
"chat.loginButton": "Sign In",
"chat.loadingHistory": "Loading chat history...",
"pricing.feature.save33": "Save 33%"
```

**Step 2: Add all new keys to zh.json**

```json
"chat.loginToAsk": "登录后即可向AI提问关于此商品的问题",
"chat.loginButton": "登录",
"chat.loadingHistory": "加载聊天记录...",
"pricing.feature.save33": "节省33%"
```

**Step 3: Remove deprecated keys from both files**

Remove: `"pricing.feature.save14"` from both files.

**Step 4: Commit**

```bash
git add libs/i18n/en.json libs/i18n/zh.json
git commit -m "feat: add translation keys for freemium and chat history"
```

---

## Task Dependency Order

```
Task 9 (typography plugin)  — independent, do first
Task 4 (DB migration)       — independent, do first
Task 10 (translations)      — independent, do first

Task 1 (free analysis)      — after nothing
Task 2 (login CTA)          — after Task 10
Task 3 (pricing)             — after Task 10, + manual Stripe setup

Task 5 (chat API)            — after Task 4
Task 6 (load history)        — after Task 5 + Task 2

Task 7 (chat UI)             — after Task 9
Task 8 (Gemini prompt)       — independent
```

**Recommended execution order:** 9 → 4 → 10 → 1 → 2 → 8 → 3 → 5 → 7 → 6

---

## Manual Steps (Not Automatable)

1. **Stripe Dashboard**: Create new $9.90/month and $79/year prices
2. **Environment Variables**: Update `NEXT_PUBLIC_STRIPE_PRICE_MONTHLY` and `NEXT_PUBLIC_STRIPE_PRICE_YEARLY` in both `.env.local` and Cloudflare Pages
3. **Supabase Dashboard**: Run the `chat_messages` SQL migration
4. **Testing**: Full E2E test of anonymous analysis → login → chat → history persists across refresh
