type StageKey = "identity" | "product" | "audience" | "positioning" | "sales" | "voice";

const KEYWORDS: Record<StageKey, string[]> = {
  identity: ["company", "industry", "values", "team", "location", "name", "brand"],
  product: ["product", "service", "pricing", "features", "benefits", "usp"],
  audience: ["customer", "target", "demographic", "segment", "persona"],
  positioning: ["competitor", "differentiation", "market", "niche", "alternative"],
  sales: ["kpi", "target", "goal", "meetings", "pipeline", "timeline"],
  voice: ["tone", "style", "brand", "communication", "language"],
};

function wordCount(text: string) {
  return (text.match(/\b\w+\b/g) || []).length;
}

function specificityScore(text: string) {
  let score = 0;
  if (/\d/.test(text)) score += 10; // numbers
  if (/,|;|\./.test(text)) score += 5; // punctuation variety
  const wc = wordCount(text);
  score += Math.min(30, Math.floor(wc / 10) * 5);
  return Math.min(50, score);
}

export function evaluateAnswer(stage: StageKey, text: string) {
  const lc = text.toLowerCase();
  const kws = KEYWORDS[stage];
  let relevance = 0;
  for (const k of kws) if (lc.includes(k)) relevance += 12;
  const spec = specificityScore(text);
  let deductions = 0;
  if (lc.length < 12) deductions += 5;
  if (/http:\/\/|https:\/\//.test(lc)) deductions += 5;
  const delta = Math.max(0, relevance + spec - deductions);
  let normalized = Math.min(100, Math.round(delta / 1.3));
  // Ensure a positive bump for any reasonable answer
  if (wordCount(text) >= 3 && normalized < 10) normalized = 10;
  const flags = [] as string[];
  if (normalized < 30) flags.push("low_relevance");
  if (spec < 15) flags.push("low_specificity");
  return { relevance, deductions, specificity: spec, progressDelta: normalized, flags };
}

export function nextPrompt(stage: StageKey) {
  switch (stage) {
    case "identity":
      return "What is your company name, industry, and core values?";
    case "product":
      return "Describe your main product/service, its key features, benefits, and pricing model.";
    case "audience":
      return "Who is your ideal customer? Include demographics and roles.";
    case "positioning":
      return "Who are your competitors and how do you differentiate?";
    case "sales":
      return "What KPIs and targets define success? Include timelines.";
    case "voice":
      return "Describe your brand voice, tone, and message style preferences.";
  }
}
