# Lead Intelligence Network — Multi-Agent System

## Overview
A multi-agent lead intelligence system for the JZ Demo Leads portal. All agents run through a single cron job to stay within Vercel Hobby plan limits (1 cron/day).

## Architecture

### Single Cron Pipeline
One cron job at `/api/cron/sync-permits` (daily 8 AM UTC) chains everything:

1. Sync permits from ArcGIS
2. Run 4 agents in sequence on up to 10 unenriched permits
3. Return summary

### Agent Pipeline

**Agent 1: Permit Enrichment** (`lib/agents/permit-enrichment-agent.ts`)
- `runPermitEnrichment(permits)` — queries ArcGIS by folio for all permits at same property
- Extracts: trade types, subcontractors, primary GC, activity score (0-100)
- Writes to `permit_ecosystem` table (one row per permit, upsert on permit_id)

**Agent 2: Developer Lookup** (`lib/agents/developer-lookup-agent.ts`)
- `runDeveloperLookup(permits)` — queries Miami-Dade Property Appraiser API by folio
- Classifies owner as corporate/individual
- Optional Tavily web research for corporate owners
- Writes to `property_owners` table (upsert on folio)

**Agent 3: GC Profiler** (`lib/agents/gc-profiler-agent.ts`)
- `runGCProfiler(permits)` — reads primary_gc from permit_ecosystem, queries ArcGIS for all their permits in last 12 months
- Calculates: total permits, active in 90d, avg value, demo frequency, trade types, geo focus
- Writes to `gc_profiles` table (upsert on contractor_name)

**Agent 4: Close Probability** (`lib/agents/close-probability-agent.ts`)
- `runCloseProbability(permits)` — scores each permit 0-100:
  - Activity signals (40pts): related_permit_count + recency
  - GC signals (30pts): active_permits_90d
  - Value signals (20pts): estimated_value tier
  - Property signals (10pts): commercial flag
  - Bonus (5pts): high-value area (Brickell, Miami Beach, etc.)
- Labels: Hot (>=70), Warm (>=40), Low (<40)
- Updates `permits.close_probability_score` and `permits.close_probability_label`

## Database Tables

### permit_ecosystem
- `permit_id` (unique FK), `folio`, `related_permit_count`, `trade_types` (text[]), `sub_contractors` (text[]), `primary_gc`, `activity_score`

### gc_profiles
- `contractor_name` (unique), `total_permits_12mo`, `active_permits_90d`, `avg_project_value`, `primary_trades` (text[]), `geo_focus` (text[]), `demo_frequency`

### property_owners
- `folio` (unique), `owner_name`, `owner_type` (corporate/individual), `mailing_address`, `company_research` (jsonb)

### permits additions
- `close_probability_score` (int, default 0)
- `close_probability_label` (text, default 'Low')

## API Routes
- `POST /api/agents/enrich` — enrich single permit (runs all 4 agents)
- `POST /api/agents/enrich-batch` — enrich up to 10 permits
- `POST /api/agents/score` — recalculate close probability
- `GET /api/agents/gc-profile/[name]` — get/refresh GC profile

All require `Authorization: Bearer <CRON_SECRET>`.

## Portability
To reuse this pattern for another business:
1. Swap the ArcGIS data source for your industry's permit/listing API
2. Adjust scoring weights in close-probability-agent.ts
3. Replace Property Appraiser lookup with your owner/entity API
4. Update trade type classifications for your domain

## Design System
Colors: #0C0A09 bg, #1C1917 cards, #FF5E00 accent, #C0C0C0 text
Fonts: Bebas Neue (display), Outfit (body)
