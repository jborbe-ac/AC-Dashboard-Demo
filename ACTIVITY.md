# Activity Log — AC HHS Operations Dashboard Prototype

A running record of work done on this prototype, the decisions behind it, and
open items. Kept so any device or session can pick up with full context.

## What was built

A static GitHub Pages site (HTML + CSS only, no JS runtime, no build step)
mirroring the AC HHS internal operations dashboard.

**Pages (11 HTML files):**

| File | Purpose |
|---|---|
| `index.html` | Landing: hero, April 2026 KPI snapshot, page nav grid |
| `oasis.html` | OASIS Pipeline — timeliness, cycle-time trend, clinician scorecard |
| `qa.html` | QA Pipeline — stage health, bottleneck heatmap, pending queue |
| `discharge.html` | Discharge & Transfer — reasons, timeliness trend |
| `poc.html` | POC Pipeline — faxing, MD signature cohorts |
| `md-orders.html` | MD Order Pipeline — urgency, physician return rate |
| `referral.html` | Referral Tracker — sources, conversion trend, intake queue |
| `cms-trends.html` | CMS Trends — outcome benchmarks, CAHPS scores |
| `dasha.html` | Dasha AI assistant — static chat mockup |
| `vsm.html` | VSM transformation story — before/after, process flow |
| `assets/styles.css` | Shared dark-theme stylesheet + responsive breakpoints |

Plus `.nojekyll` (disables Jekyll on GH Pages) and `README.md`.

## Build timeline (commits)

### Agent C — initial build (Session 1)
1. **Initial build** — landing + 7 dashboards + VSM + stylesheet + README.
2. **`main` created** from the prototype commit (repo had no prior history, so
   no PR was possible — work landed directly on `main`).
3. **Referral Tracker added** as the 8th dashboard, wired into nav + landing
   grid on every page.
4. **Mobile friendly** — responsive breakpoints at 768px and 440px.

### Agent A — Streamlit-aligned rebuild (Session 2)
Built from the live Streamlit app as reference, adding real data and
functional features across 8 phases:

5. **Phase 0 — Netlify + Dasha serverless** — `netlify/functions/dasha.js`
   proxies chat to Claude Haiku; `netlify.toml` routes `/api/*` to functions.
   Security: 2000-char message cap, 20-turn history cap, 8s timeout, API key
   from env only.
6. **Phase 1 — OASIS** — SOC Correction bars in cycle-time chart, Visit Type
   Breakdown KPI section (4 cards), At-Risk % column in Clinician Scorecard.
7. **Phase 5 — Referral Tracker** — County tabs (Solano / Santa Clara) with
   per-county KPIs, facility volume bars (real facility names, aggregate only),
   SVG conversion trend lines, stacked monthly bars, insurance mix, pending
   queue.
8. **Phase 6 — CMS Trends** — 4 inline SVG monthly trend charts (Jan–Apr
   2026) with benchmark lines, Baseline column in comparison table, 4
   additional outcome measures.
9. **Phase 7 — Dasha goes live** — functional chat (textarea, fetch to
   `/api/dasha`, loading state, error handling, history cap).
10. **Phases 2–4 — Pipeline fills** — QA timestamp, Discharge pending
    submission table + month grouping, POC expanded KPI grid (8 cards) + Ready
    to Fax table.
11. **Merge to main** — all Agent A changes merged and pushed to `main`.

## Key decisions

- **Static HTML + one serverless function.** All dashboard pages are pure
  HTML + CSS. The only JS is the Dasha chat client and the Referral Tracker
  tab switcher. No build step, no frameworks.
- **Dark theme** using the real app's design tokens (see `:root` in styles.css).
- **Hosting migrated to Netlify** so the Dasha serverless function can run.
  GitHub Pages cannot execute server-side code.
- **Deploy target:** `https://jborbe-ac.github.io/AC-Dashboard-Demo/` (GitHub
  Pages, static pages only) → migrating to Netlify URL once connected.
- **API key never in git.** `ANTHROPIC_API_KEY` lives only in Netlify
  environment variables, sourced from `.streamlit/secrets.toml`.

## HIPAA scrub (what was intentionally removed)

This is a public repo, so the following never appear:

- Patient names, MR numbers, addresses, phones → synthetic `P-####` / `R-####`
- Real clinician names → `Clinician A–F` (randomized, non-alphabetical mapping)
- Real physician names → `Group A–D`
- Vendor company names → "coding vendor / QA-POC vendor / billing vendor"
- Geography below state level
- Day-level dates on real data (only synthetic sample rows use full dates)
- API keys, OAuth tokens, Google Sheet IDs, file paths
- Agency full legal name → only "AC HHS"

## Open items / things to verify

- [x] **Referral Tracker rebuilt** with county tabs (Solano / Santa Clara) and
      real facility names. *(Numbers are still April 2026 aggregates from the
      spec — verify against live Streamlit data.)*
- [x] **Missing content gap partially closed** — Agent A used the live
      Streamlit app as reference. Remaining gaps unknown until Joey reviews.
- [ ] **Connect repo to Netlify** — netlify.com → Add new site → Import from
      Git → `jborbe-ac/AC-Dashboard-Demo`. Build command: blank. Publish dir: `/`.
- [ ] **Set `ANTHROPIC_API_KEY`** in Netlify → Site settings → Environment
      variables. Copy value from `.streamlit/secrets.toml`. Never commit.
- [ ] **Confirm Dasha works** on the live Netlify URL — send a test message.
- [ ] **Update Dasha banner** from "Prototype preview" once live on Netlify.
- [ ] **Mobile layout** not yet eyeballed on a real device after Agent A's
      additions — spot-check on a phone.

## Data sources used (de-identified aggregates)

April 2026 operational metrics and rolling-12-month CMS outcome/CAHPS figures
came from the task brief and are population-level de-identified. Row-level table
samples throughout are synthetic.
