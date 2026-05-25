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

1. **Initial build** — landing + 7 dashboards + VSM + stylesheet + README.
2. **`main` created** from the prototype commit (repo had no prior history, so
   no PR was possible — work landed directly on `main`).
3. **Referral Tracker added** as the 8th dashboard, wired into nav + landing
   grid on every page.
4. **Mobile friendly** — responsive breakpoints at 768px and 440px.

## Key decisions

- **Static only.** GitHub Pages serves static files; the real app is Streamlit,
  which can't run here. All charts are CSS-rendered or pure SVG (no JS).
- **Dark theme** using the real app's design tokens (see `:root` in styles.css).
- **Two deploy branches kept in sync:** `main` and
  `claude/ac-hhs-dashboard-prototype-AMHGR` point at the same commit.
- **Deploy path:** Settings → Pages → Deploy from a branch → `main` / root →
  `https://jborbe-ac.github.io/AC-Dashboard-Demo/`.

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

- [ ] **Referral Tracker numbers are SYNTHETIC placeholders**, not real April
      2026 aggregates. Needs real data swapped in.
- [ ] **Possible missing content.** The prototype was built from a written spec,
      NOT from the live dashboard. Any pages/columns/metrics present in the real
      Streamlit app but absent from the spec are not reflected here. To close
      this gap, share the real dashboard (repo, screenshots, or a list of
      sections) so each element can be mapped and de-identified.
- [ ] **Mobile layout** verified by brace-balance and structure only — not yet
      eyeballed on a real device. Spot-check the live URL on a phone.
- [ ] GitHub Pages not yet confirmed enabled in repo Settings.

## Data sources used (de-identified aggregates)

April 2026 operational metrics and rolling-12-month CMS outcome/CAHPS figures
came from the task brief and are population-level de-identified. Row-level table
samples throughout are synthetic.
