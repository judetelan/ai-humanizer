/**
 * ai-humanizer — lexical engine.
 *
 * Produces findings for the registry's lexical/cadence/formatting rules via
 * phrase lists and regex. Each detector is keyed by rule id; the engine runs
 * only the ids in `active`. Findings carry the rule id so the registry can
 * score and gate them.
 */

import { finding, lineOf, sampleAround, countPhrases } from '../shared/text.mjs';
import {
  BANNED_VOCAB, AI_OPENERS, BUZZWORDS, HEDGES, GPT_TICS, CLAUDE_TICS, GEMINI_TICS,
  GROK_TICS, DEEPSEEK_TICS,
  WORDY_CONNECTIVES, WEASEL_ATTRIBUTION, COPULA_AVOID, CHATBOT_CLOSERS,
  CONCLUSION_FLUFF, BUSINESS_JARGON, ADVERB_FILLER, LAZY_EXTREMES, META_COMMENTARY,
  RHETORICAL_SETUP, EMPHASIS_CRUTCH, VAGUE_DECLARATIVE,
  RLHF_ARTIFACTS, REASONING_CHAIN, ACKNOWLEDGMENT_LOOP,
  FALSE_AGENCY_NOUNS, FALSE_AGENCY_VERBS,
} from '../lexicons.mjs';

function phraseFinding(ctx, id, severity, phrases, label, opts = {}) {
  const hits = countPhrases(ctx.text, phrases, { wordBoundary: opts.wordBoundary });
  if (hits.length < (opts.min || 1)) return [];
  const uniq = [...new Set(hits.map((h) => h.phrase))];
  return [finding(id, severity,
    `${hits.length} ${label}: ${uniq.slice(0, opts.show || 6).join(opts.sep || ' · ')}${uniq.length > (opts.show || 6) ? '…' : ''}. ${opts.advice}`,
    lineOf(ctx.raw, hits[0].index), sampleAround(ctx.text, hits[0].index, hits[0].phrase.length), hits.length)];
}

const DETECTORS = {
  'em-dash-overuse'(ctx) {
    // Actual em-dashes + typographic double-hyphens used as dashes.
    // Excludes CLI flags (--mode, --from, --replicas) which are word--letter.
    const re = /[—]|(?<!\w)--(?![a-zA-Z])/g;
    let count = 0, first = -1, m;
    while ((m = re.exec(ctx.text)) !== null) { count++; if (first < 0) first = m.index; }
    const rate = count / Math.max(1, ctx.wordCount / 150);
    if (count < 4 && rate < 1) return [];
    return [finding('em-dash-overuse', 'warning',
      `${count} em-dashes (~${rate.toFixed(1)} per 150 words). Humans average far fewer; vary with commas, periods, colons, parentheses.`,
      lineOf(ctx.raw, Math.max(0, first)), '', count)];
  },

  'banned-vocab'(ctx) {
    return phraseFinding(ctx, 'banned-vocab', 'warning', BANNED_VOCAB, 'AI-spike word(s)',
      { wordBoundary: true, show: 8, sep: ', ', advice: 'Swap for plainer, more specific words.' });
  },

  'ai-openers'(ctx) {
    return phraseFinding(ctx, 'ai-openers', 'warning', AI_OPENERS, 'throat-clearing opener(s)',
      { advice: 'Cut them or replace with a direct assertion.' });
  },

  'marketing-buzzword'(ctx) {
    return phraseFinding(ctx, 'marketing-buzzword', 'warning', BUZZWORDS, 'SaaS buzzword phrase(s)',
      { advice: 'Say the specific verb + noun instead.' });
  },

  'hedging'(ctx) {
    return phraseFinding(ctx, 'hedging', 'info', HEDGES, 'hedge phrase(s)',
      { min: 2, show: 5, sep: ', ', advice: 'Assert directly or state real uncertainty.' });
  },

  'gpt-tics'(ctx) {
    return phraseFinding(ctx, 'gpt-tics', 'advisory', GPT_TICS, 'GPT-style tic(s)',
      { advice: 'Rephrase plainly.' });
  },

  'claude-tics'(ctx) {
    return phraseFinding(ctx, 'claude-tics', 'advisory', CLAUDE_TICS, 'Claude-style tic(s)',
      { advice: 'Strip the assistant register.' });
  },

  'gemini-tics'(ctx) {
    return phraseFinding(ctx, 'gemini-tics', 'advisory', GEMINI_TICS, 'Gemini-style tic(s)',
      { advice: 'Rephrase plainly.' });
  },

  'grok-tics'(ctx) {
    return phraseFinding(ctx, 'grok-tics', 'advisory', GROK_TICS, 'Grok-style tic(s)',
      { wordBoundary: true, advice: 'Rephrase plainly.' });
  },

  'deepseek-tics'(ctx) {
    return phraseFinding(ctx, 'deepseek-tics', 'advisory', DEEPSEEK_TICS, 'DeepSeek artifact(s)',
      { advice: 'Remove markup artifacts before publishing.' });
  },

  'wordy-connectives'(ctx) {
    return phraseFinding(ctx, 'wordy-connectives', 'info', WORDY_CONNECTIVES, 'wordy connective(s)',
      { advice: 'Collapse to one word (in order to → to; due to the fact that → because).' });
  },

  'weasel-attribution'(ctx) {
    return phraseFinding(ctx, 'weasel-attribution', 'advisory', WEASEL_ATTRIBUTION, 'vague attribution(s)',
      { min: 1, advice: 'Name the source or cut the claim.' });
  },

  'copula-avoidance'(ctx) {
    return phraseFinding(ctx, 'copula-avoidance', 'advisory', COPULA_AVOID, 'inflated copula(s)',
      { min: 2, advice: 'Use the plain "is/has" where it fits.' });
  },

  'chatbot-closer'(ctx) {
    return phraseFinding(ctx, 'chatbot-closer', 'warning', CHATBOT_CLOSERS, 'assistant-register phrase(s)',
      { advice: 'Strip the helpful-assistant voice.' });
  },

  'rlhf-artifacts'(ctx) {
    return phraseFinding(ctx, 'rlhf-artifacts', 'warning', RLHF_ARTIFACTS, 'RLHF instruction-tuning phrase(s)',
      { min: 2, advice: 'Strip the helpful-assistant scaffolding; present the content directly.' });
  },

  'reasoning-chain-leak'(ctx) {
    return phraseFinding(ctx, 'reasoning-chain-leak', 'warning', REASONING_CHAIN, 'reasoning-chain artifact(s)',
      { advice: 'Strip the thinking scaffolding; present the conclusion.' });
  },

  'acknowledgment-loop'(ctx) {
    return phraseFinding(ctx, 'acknowledgment-loop', 'warning', ACKNOWLEDGMENT_LOOP, 'acknowledgment loop(s)',
      { advice: 'Answer directly without restating what was asked.' });
  },

  'conclusion-fluff'(ctx) {
    return phraseFinding(ctx, 'conclusion-fluff', 'info', CONCLUSION_FLUFF, 'weightless conclusion(s)',
      { advice: 'End on something specific instead.' });
  },

  'business-jargon'(ctx) {
    return phraseFinding(ctx, 'business-jargon', 'info', BUSINESS_JARGON, 'business-jargon phrase(s)',
      { advice: 'Say the plain thing.' });
  },

  'plays-a-role'(ctx) {
    const re = /\bplays? an? (?:crucial|vital|pivotal|key|significant|central|important) role\b/gi;
    let count = 0, first = -1, m;
    while ((m = re.exec(ctx.text)) !== null) { count++; if (first < 0) first = m.index; }
    if (count < 1) return [];
    return [finding('plays-a-role', 'info',
      `${count} "plays a … role" construction(s). State what it actually does.`,
      lineOf(ctx.raw, Math.max(0, first)), sampleAround(ctx.text, first, 22), count)];
  },

  'ing-trailers'(ctx) {
    const re = /,\s+(highlighting|underscoring|emphasizing|ensuring|reflecting|symbolizing|showcasing|fostering|cultivating|representing|signaling|allowing for|paving|demonstrating|illustrating|reinforcing|encapsulating|embodying|transcending|positioning)\b/gi;
    let count = 0, first = -1, m;
    while ((m = re.exec(ctx.text)) !== null) { count++; if (first < 0) first = m.index; }
    if (count < 2) return [];
    return [finding('ing-trailers', 'info',
      `${count} trailing "…, -ing" clauses that fake analytical depth. Cut them or make a real claim.`,
      lineOf(ctx.raw, Math.max(0, first)), sampleAround(ctx.text, first, 24), count)];
  },

  'llm-artifact-leak'(ctx) {
    const re = /(citeturn\d|oaicite|oai_citation|oai_citation_attribution|contentReference|attributableIndex|turn0search\d|utm_source=chatgpt\.com|grok_card|grok_render_citation_card_json|\[cite:\s*\d+\]|ppl-ai-file-upload|attached_file|:::writing|\[Your Name\]|\[insert [^\]]+\]|\[[A-Z][a-z]+ name\])/gi;
    let count = 0, first = -1, sample = '', m;
    while ((m = re.exec(ctx.raw)) !== null) { count++; if (first < 0) { first = m.index; sample = m[0]; } }
    if (count < 1) return [];
    return [finding('llm-artifact-leak', 'warning',
      `${count} raw model artifact(s) in the text. Remove before publishing.`,
      lineOf(ctx.raw, Math.max(0, first)), sample, count)];
  },

  'smart-punctuation-leak'(ctx) {
    const zeroWidth = /[​‌‍ ﻿]/.test(ctx.raw);
    const curly = (ctx.raw.match(/[‘’“”–…]/g) || []).length;
    const straight = (ctx.raw.match(/["']/g) || []).length;
    const mixed = curly > 0 && straight > 0;
    if (!zeroWidth && !mixed) return [];
    const why = zeroWidth ? 'zero-width characters' : 'mixed curly and straight quotes';
    return [finding('smart-punctuation-leak', 'advisory',
      `Smart-punctuation/zero-width fingerprint (${why}). Normalize punctuation to one style.`, 0, '', curly || 1)];
  },

  'bold-label-list'(ctx) {
    const re = /^\s*[-*]\s*\*\*[^*\n]+:\*\*/gm;
    const hits = ctx.raw.match(re) || [];
    if (hits.length < 2) return [];
    return [finding('bold-label-list', 'info',
      `${hits.length} "**Label:** …" bullets. AI formatting reflex; use prose or plain lists.`, 0, '', hits.length)];
  },

  'aphoristic-cadence'(ctx) {
    const NOT_A = /\bNot an? [a-z][^.!?]{1,40}[.!]\s+[A-Z][^.!?]{1,60}[.!]/g;
    const REBUTTAL = /\b[A-Z][^.!?]{4,80}[.!]\s+(No|Just)\s+[a-z][^.!?]{2,60}[.!]/g;
    const NOT_JUST = /\b(?:it'?s|this is|we'?re|they'?re) not just [^.,;]{2,50},?\s+(?:it'?s|but)\b/gi;
    let count = 0, first = -1, sample = '', m;
    for (const re of [NOT_A, REBUTTAL, NOT_JUST]) {
      re.lastIndex = 0;
      while ((m = re.exec(ctx.text)) !== null) { count++; if (first < 0) { first = m.index; sample = m[0].slice(0, 70); } }
    }
    if (count < 2) return [];
    return [finding('aphoristic-cadence', 'warning',
      `${count} aphoristic "not X, but Y" / short-rebuttal constructions. Signature AI cadence; rephrase plainly.`,
      lineOf(ctx.raw, Math.max(0, first)), sample, count)];
  },

  'rule-of-three'(ctx) {
    const re = /\b([A-Za-z]+), ([A-Za-z]+),? and ([A-Za-z]+)\b/g;
    let count = 0, first = -1, m;
    while ((m = re.exec(ctx.text)) !== null) { count++; if (first < 0) first = m.index; }
    if (count < 3) return [];
    return [finding('rule-of-three', 'info',
      `${count} triadic "X, Y, and Z" lists. Reflexive rule-of-three; break some into pairs or single nouns.`,
      lineOf(ctx.raw, Math.max(0, first)), '', count)];
  },

  'numbered-section-markers'(ctx) {
    const re = /\b(0[1-9]|1[0-2])\b/g;
    const seen = new Set(); let m;
    while ((m = re.exec(ctx.text)) !== null) seen.add(m[1]);
    if (seen.size < 3) return [];
    const sorted = [...seen].sort();
    let seq = 0;
    for (let i = 1; i < sorted.length; i++) if (+sorted[i] === +sorted[i - 1] + 1) seq++;
    if (seq < 2) return [];
    return [finding('numbered-section-markers', 'info',
      `Sequential 01/02/03 markers (${sorted.slice(0, 6).join(', ')}). Use numbers only when order carries meaning.`, 0)];
  },

  'exclamation-spam'(ctx) {
    const count = (ctx.text.match(/!/g) || []).length;
    const rate = count / Math.max(1, ctx.wordCount / 200);
    if (count < 3 || rate < 1) return [];
    return [finding('exclamation-spam', 'info',
      `${count} exclamation marks (~${rate.toFixed(1)} per 200 words). Let the words carry the emphasis.`, 0, '', count)];
  },

  'emoji-decoration'(ctx) {
    const re = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/gu;
    const hits = ctx.raw.match(re) || [];
    if (hits.length < 3) return [];
    return [finding('emoji-decoration', 'info',
      `${hits.length} decorative emoji/symbols. Drop emoji bullets and section badges; they read as AI formatting.`, 0, '', hits.length)];
  },

  // ── Absorbed from stop-slop (hardikpandya/stop-slop, MIT) ─────────────────

  'adverb-filler'(ctx) {
    const hits = countPhrases(ctx.text, ADVERB_FILLER, { wordBoundary: true });
    const rate = hits.length / Math.max(1, ctx.wordCount / 100);
    if (hits.length < 4 || rate < 0.8) return [];
    const uniq = [...new Set(hits.map((h) => h.phrase))];
    return [finding('adverb-filler', 'advisory',
      `${hits.length} empty intensifier(s) (~${rate.toFixed(1)} per 100 words): ${uniq.slice(0, 8).join(', ')}. Cut adverbs that only add emphasis (really, just, simply, actually).`,
      lineOf(ctx.raw, hits[0].index), sampleAround(ctx.text, hits[0].index, hits[0].phrase.length), hits.length)];
  },

  'lazy-extremes'(ctx) {
    const hits = countPhrases(ctx.text, LAZY_EXTREMES, { wordBoundary: true });
    if (hits.length < 4) return [];
    const uniq = [...new Set(hits.map((h) => h.phrase))];
    return [finding('lazy-extremes', 'advisory',
      `${hits.length} sweeping absolute(s): ${uniq.slice(0, 6).join(', ')}. Replace false-authority extremes (everyone/always/never) with specifics.`,
      lineOf(ctx.raw, hits[0].index), sampleAround(ctx.text, hits[0].index, hits[0].phrase.length), hits.length)];
  },

  'meta-commentary'(ctx) {
    return phraseFinding(ctx, 'meta-commentary', 'info', META_COMMENTARY, 'meta-commentary aside(s)',
      { advice: 'Cut self-referential asides; let the text move instead of narrating itself.' });
  },

  'rhetorical-setup'(ctx) {
    return phraseFinding(ctx, 'rhetorical-setup', 'warning', RHETORICAL_SETUP, 'rhetorical setup(s)',
      { advice: 'Make the point directly; let the reader draw the conclusion.' });
  },

  'emphasis-crutch'(ctx) {
    return phraseFinding(ctx, 'emphasis-crutch', 'info', EMPHASIS_CRUTCH, 'emphasis crutch(es)',
      { advice: 'Delete; the claim should carry its own weight.' });
  },

  'vague-declarative'(ctx) {
    const re = /\bthe (?:reasons?|implications?|stakes?|consequences?|impact|significance|importance|problem|challenge|risks?) (?:is|are|could not be|couldn't be|cannot be|can't be) (?:significant|structural|profound|clear|real|high|higher|immense|considerable|enormous|overstated|deep|deeper|deepest|complex|vast)\b/gi;
    let count = 0, first = -1, sample = '', m;
    while ((m = re.exec(ctx.text)) !== null) { count++; if (first < 0) { first = m.index; sample = m[0]; } }
    const phr = countPhrases(ctx.text, VAGUE_DECLARATIVE);
    count += phr.length;
    if (first < 0 && phr.length) { first = phr[0].index; sample = phr[0].phrase; }
    if (count < 1) return [];
    return [finding('vague-declarative', 'info',
      `${count} vague declarative(s) that announce importance without the specific. Name the concrete thing instead.`,
      lineOf(ctx.raw, Math.max(0, first)), sample.slice(0, 60), count)];
  },

  'false-agency'(ctx) {
    const re = new RegExp(`\\bthe (${FALSE_AGENCY_NOUNS.join('|')}) (${FALSE_AGENCY_VERBS.join('|')})\\b`, 'gi');
    let count = 0, first = -1, sample = '', m;
    while ((m = re.exec(ctx.text)) !== null) { count++; if (first < 0) { first = m.index; sample = m[0]; } }
    if (count < 2) return [];
    return [finding('false-agency', 'warning',
      `${count} inanimate-subject construction(s) ("${sample}…"). Things don't act — name the person who does.`,
      lineOf(ctx.raw, Math.max(0, first)), sample, count)];
  },

  'passive-voice'(ctx) {
    const re = /\b(?:is|are|was|were|be|been|being)\s+(?:\w+ly\s+)?(created|made|designed|built|written|reached|driven|shaped|believed|considered|regarded|viewed|seen|known|described|defined|characterized|achieved|conducted|performed|implemented|developed|established|generated|produced|determined|provided|required|caused|enabled|leveraged)\b/gi;
    let count = 0, first = -1, sample = '', m;
    while ((m = re.exec(ctx.text)) !== null) { count++; if (first < 0) { first = m.index; sample = m[0]; } }
    const rate = count / Math.max(1, ctx.wordCount / 120);
    if (count < 3 || rate < 1) return [];
    return [finding('passive-voice', 'advisory',
      `${count} passive construction(s) (~${rate.toFixed(1)} per 120 words). Find the actor and put them at the front of the sentence.`,
      lineOf(ctx.raw, Math.max(0, first)), sample, count)];
  },

  'wh-opener'(ctx) {
    const sents = ctx.sentences;
    if (sents.length < 6) return [];
    let count = 0;
    for (const s of sents) if (/^(?:What|When|Where|Which|Who|Why|How)\b/.test(s) && !s.endsWith('?')) count++;
    const rate = count / sents.length;
    if (count < 3 || rate < 0.18) return [];
    return [finding('wh-opener', 'advisory',
      `${count} of ${sents.length} sentences open with a Wh- word (What/When/Why/How…) as a crutch. Lead with the subject or name the specific.`, 0, '', count)];
  },

  'negative-listing'(ctx) {
    const re1 = /\b(Not (?:a|an|just|only|because)\b[^.!?]{1,50}[.!?]\s+){2,}/g;
    const re2 = /\b(It wasn'?t\b[^.!?]{1,50}[.!?]\s+){2,}/gi;
    let count = 0, first = -1, sample = '', m;
    for (const re of [re1, re2]) {
      re.lastIndex = 0;
      while ((m = re.exec(ctx.text)) !== null) { count++; if (first < 0) { first = m.index; sample = m[0].slice(0, 70); } }
    }
    if (count < 1) return [];
    return [finding('negative-listing', 'warning',
      `${count} negation-buildup list(s) ("Not X… Not Y… Z"). A rhetorical striptease; state Z directly and drop the runway.`,
      lineOf(ctx.raw, Math.max(0, first)), sample, count)];
  },

  'dramatic-fragmentation'(ctx) {
    const re1 = /\bThat'?s it\.\s+That'?s (?:the|it|all|what)\b/gi;
    const re2 = /\b[A-Z][a-z]+\.\s+And [a-z]+\.\s+And [a-z]+\./g;
    let count = 0, first = -1, sample = '', m;
    for (const re of [re1, re2]) {
      re.lastIndex = 0;
      while ((m = re.exec(ctx.text)) !== null) { count++; if (first < 0) { first = m.index; sample = m[0].slice(0, 60); } }
    }
    if (count < 1) return [];
    return [finding('dramatic-fragmentation', 'info',
      `${count} dramatic-fragmentation pattern(s) ("That's it. That's the…" / "X. And y. And z."). Use complete sentences; trust the content.`,
      lineOf(ctx.raw, Math.max(0, first)), sample, count)];
  },
};

export function runLexical(ctx, active) {
  const out = [];
  for (const id of active) {
    const fn = DETECTORS[id];
    if (!fn) continue;
    try { out.push(...fn(ctx)); } catch { /* never let one rule crash the run */ }
  }
  return out;
}

export { DETECTORS };
