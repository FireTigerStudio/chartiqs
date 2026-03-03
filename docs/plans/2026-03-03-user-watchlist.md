# User Watchlist Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let each user build a personal watchlist of instruments shown on their dashboard, instead of seeing the same 6 for everyone.

**Architecture:** New `user_watchlist` join table (user_id, symbol). Dashboard fetches user's watchlist; empty watchlist shows all instruments with "add" buttons. A modal lets users browse & add instruments. Remove via "x" on each card.

**Tech Stack:** Supabase (table + RLS), Next.js API routes, React modal component, existing i18n system.

---

### Task 1: Create `user_watchlist` table in Supabase

**Files:**
- Modify: `supabase-schema.sql` (append after line 161)

**Step 1: Add the schema SQL**

Append to `supabase-schema.sql`:

```sql
-- 11. User watchlist (personal instrument tracking)
CREATE TABLE IF NOT EXISTS user_watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL REFERENCES instruments(symbol) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);

CREATE INDEX IF NOT EXISTS idx_watchlist_user ON user_watchlist(user_id);

ALTER TABLE user_watchlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own watchlist" ON user_watchlist;
CREATE POLICY "Users can read own watchlist" ON user_watchlist
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own watchlist" ON user_watchlist;
CREATE POLICY "Users can insert own watchlist" ON user_watchlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own watchlist" ON user_watchlist;
CREATE POLICY "Users can delete own watchlist" ON user_watchlist
  FOR DELETE USING (auth.uid() = user_id);
```

**Step 2: Run the SQL in Supabase Dashboard**

Go to Supabase Dashboard > SQL Editor > paste and run the SQL from Step 1.

**Step 3: Verify**

In Supabase Dashboard > Table Editor, confirm `user_watchlist` table exists with columns: `id`, `user_id`, `symbol`, `added_at`.

**Step 4: Commit**

```bash
git add supabase-schema.sql
git commit -m "feat(db): add user_watchlist table with RLS policies"
```

---

### Task 2: Create watchlist API route

**Files:**
- Create: `app/api/watchlist/route.ts`

**Step 1: Create the API route**

Create `app/api/watchlist/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

// GET /api/watchlist — returns user's watchlisted symbols
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("user_watchlist")
      .select("symbol, added_at")
      .eq("user_id", user.id)
      .order("added_at", { ascending: true });

    if (error) {
      console.error("[watchlist] GET error:", error.message);
      return NextResponse.json({ error: "Failed to fetch watchlist" }, { status: 500 });
    }

    return NextResponse.json({ symbols: (data || []).map((r) => r.symbol) });
  } catch (err) {
    console.error("[watchlist] GET unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/watchlist — add a symbol to watchlist
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }

    const { symbol } = await req.json();
    if (!symbol || typeof symbol !== "string") {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    // Verify instrument exists and is active
    const { data: instrument } = await supabase
      .from("instruments")
      .select("symbol")
      .eq("symbol", symbol)
      .eq("is_active", true)
      .single();

    if (!instrument) {
      return NextResponse.json({ error: "Instrument not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("user_watchlist")
      .insert({ user_id: user.id, symbol });

    if (error) {
      if (error.code === "23505") {
        // unique constraint — already in watchlist
        return NextResponse.json({ ok: true });
      }
      console.error("[watchlist] POST error:", error.message);
      return NextResponse.json({ error: "Failed to add" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[watchlist] POST unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/watchlist — remove a symbol from watchlist
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }

    const { symbol } = await req.json();
    if (!symbol || typeof symbol !== "string") {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("user_watchlist")
      .delete()
      .eq("user_id", user.id)
      .eq("symbol", symbol);

    if (error) {
      console.error("[watchlist] DELETE error:", error.message);
      return NextResponse.json({ error: "Failed to remove" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[watchlist] DELETE unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add app/api/watchlist/route.ts
git commit -m "feat(api): add watchlist CRUD endpoint"
```

---

### Task 3: Create AddInstrumentModal component

**Files:**
- Create: `components/AddInstrumentModal.tsx`

**Step 1: Create the modal component**

Create `components/AddInstrumentModal.tsx`:

```tsx
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
```

**Step 2: Commit**

```bash
git add components/AddInstrumentModal.tsx
git commit -m "feat(ui): add AddInstrumentModal component"
```

---

### Task 4: Update DashboardClient with watchlist logic

**Files:**
- Modify: `components/DashboardClient.tsx`
- Modify: `app/dashboard/page.tsx`

**Step 1: Update `app/dashboard/page.tsx` to fetch watchlist**

Replace contents of `app/dashboard/page.tsx`:

```tsx
import { createClient } from "@/libs/supabase/server";
import { getActiveInstruments } from "@/libs/instruments";
import DashboardClient from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const supabase = await createClient();
  const instruments = await getActiveInstruments();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("has_access, customer_id")
    .eq("id", user!.id)
    .single();

  const isPaid = profile?.has_access || false;

  // Fetch user's watchlist
  const { data: watchlistRows } = await supabase
    .from("user_watchlist")
    .select("symbol")
    .eq("user_id", user!.id)
    .order("added_at", { ascending: true });

  const watchlist = (watchlistRows || []).map((r: { symbol: string }) => r.symbol);

  return (
    <DashboardClient
      instruments={instruments}
      isPaid={isPaid}
      initialWatchlist={watchlist}
    />
  );
}
```

**Step 2: Rewrite `components/DashboardClient.tsx` with watchlist support**

Replace contents of `components/DashboardClient.tsx`:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import ButtonAccount from "@/components/ButtonAccount";
import AddInstrumentModal from "@/components/AddInstrumentModal";
import { useTranslation } from "@/libs/i18n";
import apiClient from "@/libs/api";
import type { Instrument } from "@/libs/instruments";

interface Props {
  instruments: Instrument[];
  isPaid: boolean;
  initialWatchlist: string[];
}

export default function DashboardClient({ instruments, isPaid, initialWatchlist }: Props) {
  const { t, lang } = useTranslation();
  const [watchlist, setWatchlist] = useState<string[]>(initialWatchlist);
  const [showModal, setShowModal] = useState(false);

  const watchedInstruments = watchlist.length > 0
    ? watchlist.map((s) => instruments.find((i) => i.symbol === s)).filter(Boolean) as Instrument[]
    : [];

  const hasWatchlist = watchedInstruments.length > 0;

  const handleAdd = async (symbol: string) => {
    // Optimistic update
    setWatchlist((prev) => [...prev, symbol]);
    setShowModal(false);
    try {
      await apiClient.post("/watchlist", { symbol });
    } catch {
      // Revert on failure
      setWatchlist((prev) => prev.filter((s) => s !== symbol));
      toast.error(t("watchlist.addError"));
    }
  };

  const handleRemove = async (symbol: string) => {
    // Optimistic update
    setWatchlist((prev) => prev.filter((s) => s !== symbol));
    try {
      await apiClient.delete("/watchlist", { data: { symbol } });
    } catch {
      // Revert on failure
      setWatchlist((prev) => [...prev, symbol]);
      toast.error(t("watchlist.removeError"));
    }
  };

  return (
    <main className="min-h-screen bg-base-100">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>
          <ButtonAccount />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">{t("dashboard.plan")}</div>
            <div className="stat-value text-lg">
              {isPaid ? t("dashboard.premium") : t("dashboard.free")}
            </div>
            {!isPaid && (
              <div className="stat-actions">
                <Link href="/#pricing" className="btn btn-primary btn-xs">
                  {t("dashboard.upgrade")}
                </Link>
              </div>
            )}
          </div>

          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">{t("dashboard.aiQuestions")}</div>
            <div className="stat-value text-lg">
              {isPaid ? t("dashboard.unlimited") : t("dashboard.freeTier")}
            </div>
            <div className="stat-desc">
              {isPaid ? t("dashboard.unlimitedDesc") : t("dashboard.freeDesc")}
            </div>
          </div>
        </div>

        {/* Watchlist / Instruments */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {hasWatchlist ? t("watchlist.myWatchlist") : t("dashboard.analyzeCommodity")}
            </h2>
            {hasWatchlist && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                + {t("watchlist.add")}
              </button>
            )}
          </div>

          {hasWatchlist ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {watchedInstruments.map((instrument) => {
                const displayName = lang === "zh" && instrument.name_zh ? instrument.name_zh : instrument.name;
                return (
                  <div key={instrument.symbol} className="relative group">
                    <Link
                      href={`/commodities/${instrument.symbol}`}
                      className="card bg-base-200 hover:bg-base-300 transition-colors"
                    >
                      <div className="card-body items-center text-center p-4">
                        <span className="text-3xl">{instrument.icon}</span>
                        <span className="text-sm font-medium">{displayName}</span>
                      </div>
                    </Link>
                    <button
                      className="absolute -top-2 -right-2 btn btn-circle btn-xs btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemove(instrument.symbol)}
                      title={t("watchlist.remove")}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              <p className="text-base-content/60 mb-4">{t("watchlist.emptyHint")}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {instruments.map((instrument) => {
                  const displayName = lang === "zh" && instrument.name_zh ? instrument.name_zh : instrument.name;
                  return (
                    <button
                      key={instrument.symbol}
                      className="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer"
                      onClick={() => handleAdd(instrument.symbol)}
                    >
                      <div className="card-body items-center text-center p-4">
                        <span className="text-3xl">{instrument.icon}</span>
                        <span className="text-sm font-medium">{displayName}</span>
                        <span className="text-xs text-primary">+ {t("watchlist.add")}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Info */}
        <div className="bg-base-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">{t("dashboard.howToUse")}</h2>
          <ol className="list-decimal list-inside space-y-2 text-base-content/70">
            <li>{t("dashboard.step1")}</li>
            <li>{t("dashboard.step2")}</li>
            <li>{t("dashboard.step3")}</li>
          </ol>
        </div>
      </div>

      {/* Add Instrument Modal */}
      {showModal && (
        <AddInstrumentModal
          instruments={instruments}
          watchlist={watchlist}
          onAdd={handleAdd}
          onClose={() => setShowModal(false)}
        />
      )}
    </main>
  );
}
```

**Step 3: Commit**

```bash
git add app/dashboard/page.tsx components/DashboardClient.tsx
git commit -m "feat(dashboard): integrate watchlist with add/remove UI"
```

---

### Task 5: Add i18n translation keys

**Files:**
- Modify: `libs/i18n/en.json`
- Modify: `libs/i18n/zh.json`

**Step 1: Add English translations**

Add these keys to `libs/i18n/en.json` (inside the JSON object):

```json
"watchlist.myWatchlist": "My Watchlist",
"watchlist.add": "Add",
"watchlist.remove": "Remove",
"watchlist.addTitle": "Add Instrument",
"watchlist.searchPlaceholder": "Search instruments...",
"watchlist.noResults": "No instruments found",
"watchlist.close": "Close",
"watchlist.emptyHint": "Add instruments to your watchlist to track them here",
"watchlist.addError": "Failed to add instrument",
"watchlist.removeError": "Failed to remove instrument"
```

**Step 2: Add Chinese translations**

Add these keys to `libs/i18n/zh.json` (inside the JSON object):

```json
"watchlist.myWatchlist": "我的关注列表",
"watchlist.add": "添加",
"watchlist.remove": "移除",
"watchlist.addTitle": "添加商品",
"watchlist.searchPlaceholder": "搜索商品...",
"watchlist.noResults": "未找到商品",
"watchlist.close": "关闭",
"watchlist.emptyHint": "添加商品到关注列表以在此追踪",
"watchlist.addError": "添加失败",
"watchlist.removeError": "移除失败"
```

**Step 3: Commit**

```bash
git add libs/i18n/en.json libs/i18n/zh.json
git commit -m "feat(i18n): add watchlist translation keys (en + zh)"
```

---

### Task 6: Update CLAUDE.md and memory

**Files:**
- Modify: `CLAUDE.md` — add `user_watchlist` to Database Design section
- Modify: memory `MEMORY.md` — add watchlist notes

**Step 1: Add to CLAUDE.md Database Design section**

Add after the `disclaimer_confirmations` table:

```markdown
#### 6. user_watchlist
\`\`\`sql
CREATE TABLE user_watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL REFERENCES instruments(symbol) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);

CREATE INDEX idx_watchlist_user ON user_watchlist(user_id);
\`\`\`
```

Add to API Endpoints table:

```markdown
| GET | `/api/watchlist` | User's watchlist | Required |
| POST | `/api/watchlist` | Add to watchlist | Required |
| DELETE | `/api/watchlist` | Remove from watchlist | Required |
```

Add to Component Structure:

```markdown
├── AddInstrumentModal.tsx     # Browse & add instruments to watchlist
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add watchlist table and API to architecture guide"
```

---

### Task 7: Test and push

**Step 1: Run dev server and test**

```bash
npm run dev
```

Manual test checklist:
- [ ] Dashboard shows all 6 instruments with "Add" button when watchlist is empty
- [ ] Click an instrument adds it to watchlist (card appears, "+" label gone)
- [ ] Dashboard shows only watchlisted instruments with "x" remove button
- [ ] Hover on card shows red "x" button
- [ ] Click "x" removes from watchlist (optimistic, instant)
- [ ] "+ Add" button opens modal
- [ ] Modal search filters instruments
- [ ] Already-watchlisted items show checkmark and are disabled
- [ ] Language switch (EN/ZH) shows correct translations
- [ ] Refresh page — watchlist persists (stored in DB)

**Step 2: Push to GitHub**

```bash
git push origin supabase
```
