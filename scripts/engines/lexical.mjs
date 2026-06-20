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
  WORDY_CONNECTIVES, WEASEL_ATTRIBUTION, COPULA_AVOID, CHATBOT_CLOSERS,
  CONCLUSION_FLUFF, BUSINESS_JARGON,
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
    const re = /[—]|--(?=\S)/g;
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
    const re = /,\s+(highlighting|underscoring|emphasizing|ensuring|reflecting|symbolizing|showcasing|fostering|cultivating|representing|signaling|allowing for|paving)\b/gi;
    let count = 0, first = -1, m;
    while ((m = re.exec(ctx.text)) !== null) { count++; if (first < 0) first = m.index; }
    if (count < 2) return [];
    return [finding('ing-trailers', 'info',
      `${count} trailing "…, -ing" clauses that fake analytical depth. Cut them or make a real claim.`,
      lineOf(ctx.raw, Math.max(0, first)), sampleAround(ctx.text, first, 24), count)];
  },

  'llm-artifact-leak'(ctx) {
    const re = /(citeturn\d|oaicite|oai_citation|contentReference|utm_source=chatgpt\.com|grok_card|\[Your Name\]|\[insert [^\]]+\]|\[[A-Z][a-z]+ name\])/gi;
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
