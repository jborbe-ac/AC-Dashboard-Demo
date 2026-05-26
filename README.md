# AC HHS Operations Dashboard — Prototype

A static, public-facing prototype of the AC HHS internal home health operations
dashboard. The real application is a Streamlit project backed by Google Sheets
and a Claude-powered analyst; this repository is a visual mockup only and
contains no live data, no application code, and no patient information.

## What's in here

```
index.html                  Landing page with KPI snapshot and dashboard nav
oasis.html                  OASIS Pipeline
qa.html                     QA Pipeline
discharge.html              Discharge & Transfer
poc.html                    POC Pipeline
md-orders.html              MD Order Pipeline
referral.html               Referral Tracker (Solano / Santa Clara county tabs)
cms-trends.html             CMS Trends
dasha.html                  Dasha AI assistant (live chat, requires Netlify)
vsm.html                    Current → Future state transformation narrative
assets/styles.css           Shared dark-theme stylesheet
netlify/functions/dasha.js  Serverless AI proxy (Anthropic Claude Haiku)
netlify.toml                Netlify routing config
.nojekyll                   Disables Jekyll on GitHub Pages
```

Dashboard pages are pure HTML + CSS — no build step, no runtime dependencies.
The Dasha chat requires the Netlify serverless function (see Deploy below).

## Deploy to Netlify (recommended — required for Dasha AI chat)

1. Push to `main`.
2. Go to [netlify.com](https://netlify.com) → **Add new site → Import an
   existing project** → connect GitHub → select `jborbe-ac/AC-Dashboard-Demo`.
3. Set **Build command** to blank (nothing) and **Publish directory** to `/`.
4. Click **Deploy site**. Netlify auto-detects `netlify.toml` and deploys the
   serverless function.
5. Go to **Site settings → Environment variables** and add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: the Anthropic API key (from `.streamlit/secrets.toml` — never
     commit this value to git)
6. Trigger a redeploy. Dasha chat will now be fully functional.

## Deploy to GitHub Pages (static pages only — Dasha chat will not work)

1. Push to `main`.
2. In the GitHub repo, go to **Settings → Pages**.
3. Under **Source**, choose **Deploy from a branch**, set the branch to
   `main` and folder to `/ (root)`, then **Save**.
4. Wait ~1 minute for the deploy to complete.
5. Visit `https://jborbe-ac.github.io/AC-Dashboard-Demo/`.

The `.nojekyll` file is intentionally present so GitHub Pages does not run
Jekyll on the repo.

## HIPAA scope

This is a healthcare-adjacent prototype. The following have been scrubbed and
never appear in this repo:

- Patient names, MR numbers, addresses, phone numbers, or any other patient
  identifiers
- Day-level dates for production data (only synthetic illustrative rows use
  month-day-year, and they reference synthetic `P-####` chart IDs)
- Real clinician or staff names (replaced with anonymized `Clinician A–F`
  identifiers using a randomized mapping that does not preserve alphabetical
  ordering against any source)
- Real physician names (referred to as `Group A`, `Group B`, etc.)
- API keys, OAuth tokens, Google Sheet IDs, or any credentials
- Third-party vendor company names (referred to generically as "coding
  vendor", "QA/POC vendor", "billing vendor")
- Geographic identifiers smaller than state level
- The agency's full legal name (only "AC HHS" is used)

Aggregate operational metrics (cycle times, on-time rates, CMS outcome
percentages, CAHPS scores) are real and based on the agency's April 2026
operations and rolling 12-month CMS outcome data, all of which are
de-identified at the population level.

## License

Internal prototype. Not for redistribution.
