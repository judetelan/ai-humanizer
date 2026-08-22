/**
 * ai-humanizer — rule registry.
 *
 * Pure data (mirrors impeccable's antipatterns.mjs). Each rule declares its
 * identity, the engine that produces its findings, which modes activate it,
 * its scoring weight, and optional provider gating. Engines own the detection
 * logic and tag each finding with the rule `id`; this registry owns metadata,
 * scoring, mode-filtering, and gating.
 *
 *   category  : lexical | cadence | stylometry | formatting
 *   engine    : 'lexical' | 'stylometry'  (which engine emits this rule's findings)
 *   severity  : warning | info | advisory
 *   modes     : subset of ['prose','marketing','both'] that activates the rule
 *   weight    : number, or { default, marketing } for mode-dependent weight
 *   gated     : 'gpt' | 'claude'  (off unless the provider is enabled)
 */

const RULES = [
  // ── Lexical ──────────────────────────────────────────────────────────────
  {
    id: 'em-dash-overuse', category: 'cadence', engine: 'lexical', severity: 'warning',
    name: 'Em-dash overuse', modes: ['prose', 'marketing', 'both'], weight: 6,
    description: 'Em-dashes at several times the human rate. As of 2026, primarily a Claude tell; GPT-5 actively suppresses them. Vary with commas, periods, colons, parentheses.',
  },
  {
    id: 'banned-vocab', category: 'lexical', engine: 'lexical', severity: 'warning',
    name: 'AI-spike vocabulary', modes: ['prose', 'marketing', 'both'], weight: 4,
    description: 'Words that spike in AI prose (delve, leverage, robust, seamless). Swap for plainer, more specific words.',
  },
  {
    id: 'ai-openers', category: 'lexical', engine: 'lexical', severity: 'warning',
    name: 'Throat-clearing openers', modes: ['prose', 'marketing', 'both'], weight: 5,
    description: 'Connective/RLHF scaffolding (Moreover, Furthermore, In today\'s world, It\'s worth noting). Cut or assert directly.',
  },
  {
    id: 'marketing-buzzword', category: 'lexical', engine: 'lexical', severity: 'warning',
    name: 'Marketing buzzword', modes: ['prose', 'marketing', 'both'],
    weight: { default: 4, marketing: 8 },
    description: 'Generic SaaS phrases (world-class, cutting-edge, streamline your). Say the literal verb + noun.',
  },
  {
    id: 'hedging', category: 'lexical', engine: 'lexical', severity: 'info',
    name: 'Hedge density', modes: ['prose', 'both'], weight: 3,
    description: 'Soft hedges (generally speaking, arguably, in most cases). Assert directly or state real uncertainty.',
  },
  {
    id: 'aphoristic-cadence', category: 'cadence', engine: 'lexical', severity: 'warning',
    name: 'Aphoristic cadence', modes: ['prose', 'marketing', 'both'], weight: 5,
    description: 'Manufactured-contrast rhythm ("Not an X. A Y." / "No fluff. Just results."). Signature AI cadence.',
  },
  {
    id: 'rule-of-three', category: 'cadence', engine: 'lexical', severity: 'info',
    name: 'Reflexive rule-of-three', modes: ['prose', 'marketing', 'both'], weight: 3,
    description: 'Repeated "X, Y, and Z" triads. Break the pattern with pairs or single nouns.',
  },
  {
    id: 'numbered-section-markers', category: 'formatting', engine: 'lexical', severity: 'info',
    name: 'Numbered section markers', modes: ['marketing', 'both'], weight: 3,
    description: 'Sequential 01/02/03 markers used as scaffolding. Number only when order carries meaning.',
  },
  {
    id: 'exclamation-spam', category: 'formatting', engine: 'lexical', severity: 'info',
    name: 'Exclamation spam', modes: ['prose', 'marketing', 'both'], weight: 2,
    description: 'High exclamation rate. Let the words carry the emphasis.',
  },
  {
    id: 'emoji-decoration', category: 'formatting', engine: 'lexical', severity: 'info',
    name: 'Emoji decoration', modes: ['prose', 'marketing', 'both'], weight: 3,
    description: 'Decorative emoji bullets and section badges read as AI formatting.',
  },
  {
    id: 'wordy-connectives', category: 'lexical', engine: 'lexical', severity: 'info',
    name: 'Wordy connectives', modes: ['prose', 'marketing', 'both'], weight: 3,
    description: 'Padding phrases ("due to the fact that", "in order to", "in terms of"). Collapse to one word.',
  },
  {
    id: 'weasel-attribution', category: 'lexical', engine: 'lexical', severity: 'advisory',
    name: 'Vague attribution', modes: ['prose', 'both'], weight: 3,
    description: 'Unsourced authority ("studies show", "experts say", "it is believed that"). Name the source or cut it.',
  },
  {
    id: 'copula-avoidance', category: 'lexical', engine: 'lexical', severity: 'advisory',
    name: 'Inflated copula', modes: ['prose', 'both'], weight: 2,
    description: 'Inflated verbs where "is/has" would do ("serves as", "stands as", "represents a"). Use the plain copula.',
  },
  {
    id: 'chatbot-closer', category: 'lexical', engine: 'lexical', severity: 'warning',
    name: 'Assistant closer', modes: ['prose', 'marketing', 'both'], weight: 4,
    description: 'Sycophantic assistant register ("I hope this helps", "feel free to", "you\'re absolutely right"). Strip it.',
  },
  {
    id: 'rlhf-artifacts', category: 'lexical', engine: 'lexical', severity: 'warning',
    name: 'RLHF instruction-tuning voice', modes: ['prose', 'marketing', 'both'], weight: 5,
    description: 'Balanced tradeoffs, structured enumeration, pedagogical scaffolding, and hedged disagreement that RLHF training produces. The primary signal detectors fire on.',
  },
  {
    id: 'reasoning-chain-leak', category: 'lexical', engine: 'lexical', severity: 'warning',
    name: 'Reasoning chain leak', modes: ['prose', 'marketing', 'both'], weight: 5,
    description: 'Chain-of-thought artifacts leaked into prose ("Let me think...", "Step 1:"). Strip the scaffolding; present the conclusion.',
  },
  {
    id: 'acknowledgment-loop', category: 'lexical', engine: 'lexical', severity: 'warning',
    name: 'Acknowledgment loop', modes: ['prose', 'marketing', 'both'], weight: 4,
    description: 'Parroting the question back ("You\'re asking about..."). Answer directly without restating what was asked.',
  },
  {
    id: 'conclusion-fluff', category: 'lexical', engine: 'lexical', severity: 'info',
    name: 'Weightless conclusion', modes: ['prose', 'marketing', 'both'], weight: 3,
    description: 'Generic closers ("the future looks bright", "the possibilities are endless"). End on something specific.',
  },
  {
    id: 'business-jargon', category: 'lexical', engine: 'lexical', severity: 'info',
    name: 'Business jargon', modes: ['marketing', 'both'], weight: 3,
    description: 'LinkedIn jargon ("thought leadership", "move the needle", "low-hanging fruit"). Say the plain thing.',
  },
  {
    id: 'plays-a-role', category: 'lexical', engine: 'lexical', severity: 'info',
    name: '"Plays a … role"', modes: ['prose', 'marketing', 'both'], weight: 3,
    description: 'The "plays a crucial/vital/key role" template. State what it actually does.',
  },
  {
    id: 'ing-trailers', category: 'cadence', engine: 'lexical', severity: 'info',
    name: 'Participial trailers', modes: ['prose', 'both'], weight: 3,
    description: 'Trailing ", highlighting/underscoring/ensuring …" clauses that fake analytical depth. Cut or make a real claim.',
  },
  {
    id: 'llm-artifact-leak', category: 'formatting', engine: 'lexical', severity: 'warning',
    name: 'LLM artifact leak', modes: ['prose', 'marketing', 'both'], weight: 12,
    description: 'Raw model artifacts shipped in text (oaicite, grok_card, DeepSeek brackets, Perplexity tags, :::writing markers, unfilled [placeholders]). Remove before publishing.',
  },
  {
    id: 'smart-punctuation-leak', category: 'formatting', engine: 'lexical', severity: 'advisory',
    name: 'Smart-punctuation / zero-width leak', modes: ['prose', 'marketing', 'both'], weight: 2,
    description: 'Curly quotes/ellipsis mixed with straight, or zero-width characters — a paste-from-model or humanizer-tool fingerprint.',
  },
  {
    id: 'bold-label-list', category: 'formatting', engine: 'lexical', severity: 'info',
    name: 'Bold-label colon list', modes: ['prose', 'marketing', 'both'], weight: 3,
    description: 'Repeated "**Label:** description" bullets are an AI formatting reflex. Use prose or plain lists.',
  },

  {
    id: 'excessive-structure', category: 'formatting', engine: 'stylometry', severity: 'info',
    name: 'Excessive structure', modes: ['prose', 'marketing', 'both'], weight: 3,
    description: 'Over-formatted responses with too many headers, bullets, and numbered lists relative to word count. AI reflex; reduce scaffolding.',
  },

  // ── Absorbed from stop-slop (editorial tells) ─────────────────────────────
  {
    id: 'false-agency', category: 'lexical', engine: 'lexical', severity: 'warning',
    name: 'False agency', modes: ['prose', 'marketing', 'both'], weight: 4,
    description: 'Inanimate subjects given human verbs ("the data tells us", "the decision emerges"). Name the person who acts.',
  },
  {
    id: 'rhetorical-setup', category: 'cadence', engine: 'lexical', severity: 'warning',
    name: 'Rhetorical setup', modes: ['prose', 'marketing', 'both'], weight: 4,
    description: 'Phrases that announce insight instead of delivering it ("what if I told you", "think about it"). Make the point directly.',
  },
  {
    id: 'negative-listing', category: 'cadence', engine: 'lexical', severity: 'warning',
    name: 'Negative listing', modes: ['prose', 'marketing', 'both'], weight: 5,
    description: 'Negation buildup ("Not X… Not Y… Z") — a rhetorical striptease. State Z directly and drop the runway.',
  },
  {
    id: 'vague-declarative', category: 'lexical', engine: 'lexical', severity: 'info',
    name: 'Vague declarative', modes: ['prose', 'both'], weight: 3,
    description: 'Announcing significance without the specific ("the implications are significant"). Name the concrete thing.',
  },
  {
    id: 'meta-commentary', category: 'lexical', engine: 'lexical', severity: 'info',
    name: 'Meta-commentary', modes: ['prose', 'marketing', 'both'], weight: 3,
    description: 'Self-referential asides about the text\'s own structure ("the rest of this essay…", "let me walk you through"). Cut them.',
  },
  {
    id: 'emphasis-crutch', category: 'lexical', engine: 'lexical', severity: 'info',
    name: 'Emphasis crutch', modes: ['prose', 'marketing', 'both'], weight: 3,
    description: 'Manufactured weight that carries no information ("let that sink in", "make no mistake"). Delete.',
  },
  {
    id: 'dramatic-fragmentation', category: 'cadence', engine: 'lexical', severity: 'info',
    name: 'Dramatic fragmentation', modes: ['prose', 'marketing', 'both'], weight: 3,
    description: 'Fragments for performative profundity ("That\'s it. That\'s the…", "X. And y. And z."). Use complete sentences.',
  },
  {
    id: 'adverb-filler', category: 'lexical', engine: 'lexical', severity: 'advisory',
    name: 'Empty intensifiers', modes: ['prose', 'both'], weight: 2,
    description: 'Adverbs that only add emphasis (really, just, simply, actually, genuinely). Density-gated; cut them.',
  },
  {
    id: 'lazy-extremes', category: 'lexical', engine: 'lexical', severity: 'advisory',
    name: 'Lazy extremes', modes: ['prose', 'both'], weight: 2,
    description: 'Sweeping absolutes faking authority (everyone/always/never/nobody). Replace with specifics.',
  },
  {
    id: 'passive-voice', category: 'stylometry', engine: 'lexical', severity: 'advisory',
    name: 'Passive voice', modes: ['prose', 'both'], weight: 2,
    description: 'Agentless passives ("was created", "is believed") hide the actor and drain energy. Density-gated; find the actor.',
  },
  {
    id: 'wh-opener', category: 'cadence', engine: 'lexical', severity: 'advisory',
    name: 'Wh- opener crutch', modes: ['prose', 'both'], weight: 2,
    description: 'Many sentences opening with What/When/Why/How as a crutch. Lead with the subject or name the specific.',
  },

  // ── Stylometry ───────────────────────────────────────────────────────────
  {
    id: 'uniform-rhythm', category: 'stylometry', engine: 'stylometry', severity: 'info',
    name: 'Uniform sentence rhythm', modes: ['prose', 'both'], weight: 5,
    description: 'Low sentence-length variance (low burstiness). Add a very short sentence and a long one.',
  },
  {
    id: 'low-lexical-diversity', category: 'stylometry', engine: 'stylometry', severity: 'info',
    name: 'Low lexical diversity', modes: ['prose', 'both'], weight: 4,
    description: 'Repetitive vocabulary (low type-token ratio). Vary word choice; cut filler repetition.',
  },
  {
    id: 'comma-splice-rhythm', category: 'stylometry', engine: 'stylometry', severity: 'advisory',
    name: 'High comma density', modes: ['prose', 'both'], weight: 3,
    description: 'Very high commas-per-sentence suggests over-qualified, list-like AI sentences. Split into shorter statements.',
  },
  {
    id: 'paragraph-uniformity', category: 'stylometry', engine: 'stylometry', severity: 'advisory',
    name: 'Uniform paragraph length', modes: ['prose', 'both'], weight: 3,
    description: 'Every paragraph nearly the same length is an AI structural tell. Vary paragraph size.',
  },
  {
    id: 'contraction-absence', category: 'stylometry', engine: 'stylometry', severity: 'advisory',
    name: 'No contractions', modes: ['prose', 'both'], weight: 2,
    description: 'Zero contractions across a long, conversational passage reads as machine-formal. Use natural contractions where the register allows.',
  },

  // ── Provider-gated tics (off unless --gpt / --claude / --gemini) ──────────
  {
    id: 'gpt-tics', category: 'lexical', engine: 'lexical', severity: 'advisory', gated: 'gpt',
    name: 'GPT-style tics', modes: ['prose', 'marketing', 'both'], weight: 4,
    description: 'Recurring GPT phrasings ("rich tapestry", "plays a crucial role", "Sure! Here\'s"). Rephrase plainly.',
  },
  {
    id: 'claude-tics', category: 'lexical', engine: 'lexical', severity: 'advisory', gated: 'claude',
    name: 'Claude-style tics', modes: ['prose', 'marketing', 'both'], weight: 4,
    description: 'Recurring Claude phrasings ("I\'ll help you", "Let me", "Here\'s", "Great question"). Strip assistant register.',
  },
  {
    id: 'gemini-tics', category: 'lexical', engine: 'lexical', severity: 'advisory', gated: 'gemini',
    name: 'Gemini-style tics', modes: ['prose', 'marketing', 'both'], weight: 4,
    description: 'Recurring Gemini phrasings ("paving the way", "a symphony of", "the cascade of"). Rephrase plainly.',
  },
  {
    id: 'grok-tics', category: 'lexical', engine: 'lexical', severity: 'advisory', gated: 'grok',
    name: 'Grok-style tics', modes: ['prose', 'marketing', 'both'], weight: 4,
    description: 'Recurring Grok phrasings (causal, empirical, correlate, underscore) and markup artifacts. Rephrase plainly.',
  },
  {
    id: 'deepseek-tics', category: 'lexical', engine: 'lexical', severity: 'advisory', gated: 'deepseek',
    name: 'DeepSeek-style tics', modes: ['prose', 'marketing', 'both'], weight: 4,
    description: 'DeepSeek markup artifacts (lenticular brackets, dagger symbols). Remove before publishing.',
  },
];

const GATED_PROVIDERS = new Set(RULES.map((r) => r.gated).filter(Boolean));

function getRule(id) {
  return RULES.find((r) => r.id === id);
}

function weightFor(rule, mode) {
  if (!rule) return 3;
  const w = rule.weight;
  return typeof w === 'object' ? (w[mode] ?? w.default ?? 3) : (w ?? 3);
}

/** Rule ids active for a mode and an engine, with gating applied. */
function activeRuleIds({ mode = 'both', engine, providers = [] } = {}) {
  const enabled = new Set(providers);
  return RULES.filter((r) => {
    if (engine && r.engine !== engine) return false;
    if (!r.modes.includes(mode)) return false;
    if (r.gated && !enabled.has(r.gated)) return false;
    return true;
  }).map((r) => r.id);
}

/** Drop findings whose rule is gated behind a provider that wasn't enabled. */
function filterByProviders(findings, providers = []) {
  const enabled = new Set(providers);
  if (!GATED_PROVIDERS.size) return findings;
  return findings.filter((f) => {
    const rule = getRule(f.id);
    if (!rule || !rule.gated) return true;
    return enabled.has(rule.gated);
  });
}

/** Slop score 0–100 + verdict. Weight scaled by hit volume with diminishing
 *  returns so one noisy rule can't pin the score on its own. */
function score(findings, mode = 'both') {
  let raw = 0;
  for (const f of findings) {
    const rule = getRule(f.id);
    const w = weightFor(rule, mode);
    const mult = Math.min(3, 1 + Math.log2(Math.max(1, f.count || 1)));
    raw += w * mult;
  }
  const slop = Math.min(100, Math.round(raw));
  let verdict;
  if (slop === 0) verdict = 'Human';
  else if (slop <= 10) verdict = 'Likely human';
  else if (slop <= 25) verdict = 'Mixed';
  else if (slop <= 45) verdict = 'Likely AI';
  else verdict = 'AI slop';
  return { slop, verdict };
}

export {
  RULES, GATED_PROVIDERS,
  getRule, weightFor, activeRuleIds, filterByProviders, score,
};
