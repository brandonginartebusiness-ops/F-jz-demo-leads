# Lead Intelligence Network — Multi-Agent System

## Overview
A multi-agent lead intelligence system for the JZ Demo Leads portal that enriches demolition permit data with ecosystem context, contractor profiling, close probability scoring, and property owner research.

## Architecture

### Agent Pipeline
Four specialized agents run in sequence via an orchestrator:

1. **Permit Enrichment Agent** (`lib/agents/permit-enrichment-agent.ts`)
   - Queries Miami-Dade ArcGIS for all permits at the same address/folio
   - Writes to `permit_ecosystem` table
   - Provides "activity density" signal for scoring

2. **GC Profiler Agent** (`lib/agents/gc-profiler-agent.ts`)
   - Aggregates all permits by contractor name across Miami-Dade
   - Calculates total jobs, demo jobs, average value, active years
   - Writes to `gc_profiles` table
   - Identifies repeat players and big-budget GCs

3. **Close Probability Agent** (`lib/agents/close-probability-agent.ts`)
   - Scores each permit 0-100 using weighted algorithm:
     - 40pts: permit_ecosystem activity density
     - 30pts: GC profile strength (repeat demo GC)
     - 20pts: estimated value tier
     - 10pts: property owner type (developer vs individual)
   - Updates `permits.close_probability` and `permits.close_factors` JSONB

4. **Developer Lookup Agent** (`lib/agents/developer-lookup-agent.ts`)
   - Queries Miami-Dade Property Appraiser API by folio number
   - Optional Tavily web search for company research
   - Writes to `property_owners` table

### Orchestrator (`lib/agents/lead-intelligence-orchestrator.ts`)
- Runs all 4 agents in sequence for a batch of permits
- Default batch size: 10 permits
- Returns summary of enriched/failed/skipped counts
- Integrated into the daily cron sync at `/api/cron/sync-permits`

## Database Tables

### permit_ecosystem
Stores related permits found at the same address/folio.
- `id`, `permit_id` (FK), `related_permit_number`, `related_description`, `related_value`, `related_date`, `relationship_type` (same_address | same_folio | same_owner), `created_at`

### gc_profiles
Aggregated contractor intelligence.
- `id`, `contractor_name` (unique), `total_jobs`, `demo_jobs`, `total_value`, `avg_value`, `first_seen`, `last_seen`, `top_addresses` (JSONB), `updated_at`

### property_owners
Property owner research results.
- `id`, `folio_number` (unique), `owner_name`, `owner_type` (individual | corporation | llc | trust | government), `mailing_address`, `assessed_value`, `land_use`, `research_notes`, `source`, `updated_at`

### permits table additions
- `close_probability` (integer 0-100, nullable)
- `close_factors` (JSONB, nullable) — breakdown of scoring components
- `enriched_at` (timestamptz, nullable) — when intelligence pipeline last ran

## API Routes

- `POST /api/agents/enrich` — Enrich a single permit by ID
- `POST /api/agents/enrich-batch` — Enrich up to 10 permits
- `POST /api/agents/score` — Recalculate close probability for a permit
- `GET /api/agents/gc-profile/[name]` — Get or refresh a GC profile

## UI Integration

### Permits Table
- Close probability badge column (color-coded 0-100)
- GC total jobs count column

### Permit Detail Page
- Permit Ecosystem section (related permits timeline)
- GC Profile card (stats + top addresses)
- Property Owner card (owner info + assessed value)
- "Why This Lead" section (close probability breakdown)

### Intelligence Dashboard (`/dashboard/intelligence`)
- Top GCs by demo job count
- Most active properties by permit density
- Developer watch list from property_owners

## Environment Variables
- `TAVILY_API_KEY` — Optional, for developer research web search
- All existing env vars (Supabase, CRON_SECRET) are reused

## Design System
Uses existing industrial design tokens: `#0C0A09` bg, `#1C1917` cards, `#FF5E00` accent, Bebas Neue display font, Outfit body font, hazard stripe accents.
