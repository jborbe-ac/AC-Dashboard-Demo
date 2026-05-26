// Dasha AI Chat — Netlify Serverless Function
// Proxies Anthropic API calls for the AC HHS public demo dashboard.
//
// HIPAA NOTE: This function only ever sends/receives aggregate operational
// data. No PHI (patient names, MRNs, dates tied to individuals, or insurance
// details) is included in the hardcoded context or permitted in responses.
// The API key is read from environment — never logged or returned.

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 600;

// Hardcoded aggregate context — 100% PHI-free operational summary.
const SYSTEM_PROMPT = `You are Dasha, an AI operations analyst for AC HHS (Angelcare Home Health). You have access to the following April 2026 operational data:

OASIS Pipeline: 109 charts total | 89% on-time | avg documentation 1.67 days (target 2d) | total lead time 14.7 days (target 30d) | Clinicians A–F anonymized
QA Stages: Coding 2.67d | QA1 Review 4.67d (biggest bottleneck, target 2d) | Correction 2.0d | POC Completion 3.5d (above 2d target) | POC Faxing 0.0d
Discharge: 38 charts | 97% on-time | avg DC OASIS time 4.2d (target 5d) | 22 Goals Met, 9 Hospitalization, 4 Higher Level of Care, 2 Patient/Family Choice, 1 Expired
POC Pipeline: 109 issued | 102 faxed (94%) | 87 signed by MD (85%) | avg fax time 0.0d same-day | avg MD signature 5.57d (target 7d)
MD Orders: 24 open | 3 urgent | 5 priority | 12 routine | 4 low | avg return 6.3d (target 7d) | Returned this month: 41
Referrals: 64 total | 52 accepted (81% conversion) | 7 pending | 5 declined | avg time to admit 1.8d (target 2d) | Sources: Hospital Discharge 28, SNF/Rehab 15, Physician Office 11, Health Plan 7, Community/Self 3
CMS Strengths (above national): Timely Initiation 98.5% (CA 96.8%, US 96.2%) | Pain Improvement 86.1% (CA 79.6%, US 78.3%) | Discharge to Community 79.4% (CA 73.1%, US 72.0%) | PPH 4.7–7.8% (CA 9.4%, US 10.1%)
CMS Gaps (below national): Dyspnea 85.6% (CA 94.1%, US 93.6%) | Ambulation 72.1% (CA 79.8%, US 82.4%) | Bed Transfer/DC Function 68.4% (CA 74.2%, US 76.9%)
CAHPS Patient Satisfaction: Communication 91 (CA 86, US 88) | Professional Care 89 (CA 84, US 86) | Recommend Agency 86 (CA 79, US 81) | Overall Rating 87 (CA 82, US 84)
Clinician Scorecard (anonymized A–F): Clinician B 97% on-time | Clinician D 89% on-time | Clinician E 76% on-time | Clinician A 27% on-time (coaching) | Clinician C 0% on-time (coaching) | Clinician F 0% on-time (coaching)

Answer questions about operational performance, bottlenecks, and improvement opportunities. Be specific and reference the data above. Keep responses concise (3–5 sentences or a short bullet list).`;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

exports.handler = async function (event) {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: "",
    };
  }

  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  // Parse request body
  let message, history;
  try {
    const body = JSON.parse(event.body || "{}");
    message = body.message;
    history = Array.isArray(body.history) ? body.history : [];
    history = history.slice(-20);
  } catch {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  if (!message || typeof message !== "string" || message.trim() === "") {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "message field is required" }),
    };
  }

  if (message.trim().length > 2000) {
    return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Message too long" }) };
  }

  // Validate API key is present (never log or return it)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Service configuration error" }),
    };
  }

  // Build messages array: prior history + new user message
  // Only accept role/content fields to prevent injection
  const safeHistory = history
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    )
    .map((m) => ({ role: m.role, content: m.content }));

  const messages = [
    ...safeHistory,
    { role: "user", content: message.trim() },
  ];

  // Call Anthropic Messages API using Node 18 built-in fetch
  const controller = new AbortController();
  const fetchTimeout = setTimeout(() => controller.abort(), 8000);
  let anthropicResponse;
  try {
    anthropicResponse = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages,
      }),
      signal: controller.signal,
    });
  } catch (fetchErr) {
    if (fetchErr.name === "AbortError") {
      return {
        statusCode: 504,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Request timed out" }),
      };
    }
    return {
      statusCode: 502,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to reach AI service" }),
    };
  } finally {
    clearTimeout(fetchTimeout);
  }

  if (!anthropicResponse.ok) {
    // Don't expose upstream error details — they may contain API metadata
    return {
      statusCode: 502,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "AI service returned an error" }),
    };
  }

  let data;
  try {
    data = await anthropicResponse.json();
  } catch {
    return {
      statusCode: 502,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid response from AI service" }),
    };
  }

  // Extract reply text from Anthropic response shape
  const reply =
    data?.content?.[0]?.text ?? "Sorry, I could not generate a response.";

  return {
    statusCode: 200,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    body: JSON.stringify({ reply }),
  };
};
