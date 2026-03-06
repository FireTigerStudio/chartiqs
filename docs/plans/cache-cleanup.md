# Cache Cleanup Strategy

## Problem
`analysis_cache` and `ai_usage` tables grow indefinitely. Expired cache rows and old usage records are never deleted, which will eventually push the project past Supabase free tier storage (500MB).

## Growth Estimates
- Each cached analysis: ~2-5KB (JSONB)
- 26 instruments x 2 languages = 52 cache rows/day (~200KB/day)
- 500 instruments = ~3MB/day without cleanup
- `ai_usage`: 1 row per user per day (~100 bytes)

## Solution: Two-Layer Cleanup

### Layer 1: Supabase pg_cron (Primary)
Runs daily at 03:00 UTC inside PostgreSQL. Zero external dependencies.

**Setup**: Run `sql/enable-cache-cleanup-cron.sql` in the Supabase SQL Editor.

**What it cleans**:
- `analysis_cache` rows where `expires_at < NOW()` (24h TTL)
- `ai_usage` rows older than 90 days

### Layer 2: API Route (Backup)
`GET /api/cron/cleanup` — callable by external cron or manually.

**Auth**: Bearer token via `CRON_SECRET` env var.

**Usage**:
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://chartiqs.com/api/cron/cleanup
```

Can be triggered by:
- Cloudflare Workers Cron Trigger
- GitHub Actions scheduled workflow
- Manual curl for debugging

### Environment Variables
| Var | Where | Purpose |
|-----|-------|---------|
| `CRON_SECRET` | Cloudflare Pages + .env.local | Protects cleanup API endpoint |

## Deployment Checklist
- [x] Updated `cleanup_expired_cache()` function to also clean ai_usage > 90 days
- [x] Created `sql/enable-cache-cleanup-cron.sql`
- [x] Created `/api/cron/cleanup` route
- [x] Excluded `/api/cron` from Supabase auth middleware
- [ ] Run SQL in Supabase dashboard to enable pg_cron
- [ ] Set `CRON_SECRET` in Cloudflare Pages env vars (optional, for backup route)
- [ ] Set `CRON_SECRET` in .env.local (optional, for local testing)

## Cost Impact
With cleanup active, the database stays bounded:
- ~52 cache rows alive at any time (26 instruments x 2 langs, 24h TTL)
- ai_usage keeps only 90 days of history
- Storage stays well under 100MB even at 500+ instruments
