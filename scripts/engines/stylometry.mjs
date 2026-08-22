/**
 * ai-humanizer — stylometry engine.
 *
 * The second analysis pass (impeccable added a browser engine beyond regex;
 * this adds statistical stylometry beyond phrase-matching). Computes
 * distributional features — sentence-length variance (burstiness), lexical
 * diversity (type-token ratio), comma density, paragraph uniformity — and
 * emits findings plus a `features` object the report can surface.
 */

import { finding, splitSentences, splitParagraphs } from '../shared/text.mjs';

function mean(xs) { return xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length); }
function stdev(xs) { const m = mean(xs); return Math.sqrt(mean(xs.map((x) => (x - m) ** 2))); }
function cv(xs) { return stdev(xs) / Math.max(1, mean(xs)); }

/** Compute reusable stylometric features once. */
export function features(ctx) {
  const sentences = ctx.sentences;
  const sentLens = sentences.map((s) => s.split(/\s+/).filter(Boolean).length);
  const words = ctx.text.toLowerCase().match(/[a-z][a-z'-]+/g) || [];
  const types = new Set(words);
  const paras = splitParagraphs(ctx.text);
  const paraLens = paras.map((p) => p.split(/\s+/).filter(Boolean).length);
  const commas = (ctx.text.match(/,/g) || []).length;
  const contractions = (ctx.text.match(/\b\w+['’](?:re|ve|ll|d|s|t|m)\b|\bn['’]t\b/gi) || []).length;
  return {
    sentenceCount: sentences.length,
    contractionRate: words.length ? +((contractions / words.length) * 100).toFixed(2) : 0,
    sentLenMean: +mean(sentLens).toFixed(1),
    sentLenCV: +cv(sentLens).toFixed(2),
    sentLenMin: sentLens.length ? Math.min(...sentLens) : 0,
    sentLenMax: sentLens.length ? Math.max(...sentLens) : 0,
    typeTokenRatio: words.length ? +(types.size / words.length).toFixed(3) : 1,
    wordCount: words.length,
    commasPerSentence: sentences.length ? +(commas / sentences.length).toFixed(2) : 0,
    paragraphCount: paras.length,
    paraLenCV: +cv(paraLens).toFixed(2),
  };
}

const DETECTORS = {
  'uniform-rhythm'(ctx, f) {
    if (f.sentenceCount < 6) return [];
    if (f.sentLenCV >= 0.35) return [];
    return [finding('uniform-rhythm', 'info',
      `Low sentence-length variance (CV ${f.sentLenCV}; mean ${f.sentLenMean} words, range ${f.sentLenMin}–${f.sentLenMax}). Add burstiness: one very short sentence, one long.`, 0)];
  },

  'low-lexical-diversity'(ctx, f) {
    if (f.wordCount < 120) return [];
    // TTR drops with length; adjust threshold. Short texts: 0.42, long: 0.15.
    const threshold = f.wordCount < 500 ? 0.42
      : f.wordCount < 2000 ? 0.32
      : f.wordCount < 5000 ? 0.24
      : f.wordCount < 10000 ? 0.19
      : 0.15;
    if (f.typeTokenRatio >= threshold) return [];
    return [finding('low-lexical-diversity', 'info',
      `Low type-token ratio (${f.typeTokenRatio} over ${f.wordCount} words). Repetitive vocabulary; vary word choice and cut filler.`, 0)];
  },

  'comma-splice-rhythm'(ctx, f) {
    if (f.sentenceCount < 5 || f.commasPerSentence < 2.2) return [];
    return [finding('comma-splice-rhythm', 'advisory',
      `High comma density (${f.commasPerSentence} per sentence). Over-qualified, list-like sentences; split into shorter statements.`, 0)];
  },

  'paragraph-uniformity'(ctx, f) {
    if (f.paragraphCount < 4) return [];
    if (f.paraLenCV >= 0.25) return [];
    return [finding('paragraph-uniformity', 'advisory',
      `Near-uniform paragraph length (CV ${f.paraLenCV} across ${f.paragraphCount} paragraphs). Vary paragraph size for a human shape.`, 0)];
  },

  'excessive-structure'(ctx, f) {
    if (f.wordCount < 200) return [];
    const headers = (ctx.raw.match(/^\s{0,3}#{1,6}\s/gm) || []).length;
    const bullets = (ctx.raw.match(/^\s*[-*+]\s/gm) || []).length;
    const numbered = (ctx.raw.match(/^\s*\d+[.)]\s/gm) || []).length;
    const total = headers + bullets + numbered;
    const rate = total / (f.wordCount / 100);
    if (rate < 3) return [];
    return [finding('excessive-structure', 'info',
      `High structural markup density (${total} headers/bullets/numbers, ~${rate.toFixed(1)} per 100 words). AI formatting reflex; reduce scaffolding where prose would do.`, 0, '', total)];
  },

  'sentence-spread'(ctx, f) {
    if (f.sentenceCount < 8) return [];
    const sentLens = ctx.sentences.map((s) => s.split(/\s+/).filter(Boolean).length);
    const issues = [];
    const spread = f.sentLenMax - f.sentLenMin;
    if (spread < 20) issues.push(`spread only ${spread} words (aim for 20+)`);
    let consecutive = 0;
    for (let i = 2; i < sentLens.length; i++) {
      const range = Math.max(sentLens[i], sentLens[i-1], sentLens[i-2]) - Math.min(sentLens[i], sentLens[i-1], sentLens[i-2]);
      if (range <= 5) consecutive++;
    }
    if (consecutive > 2) issues.push(`${consecutive} runs of 3+ same-length sentences`);
    if (!issues.length) return [];
    return [finding('sentence-spread', 'advisory',
      `Sentence-length monotony: ${issues.join('; ')}. Vary rhythm with one very short sentence then a long one.`, 0, '', issues.length)];
  },

  'contraction-absence'(ctx, f) {
    // Only a signal over a long passage; formal/legal/academic prose legitimately
    // avoids contractions, so this stays advisory + low weight.
    if (f.wordCount < 180) return [];
    if (f.contractionRate > 0.3) return [];
    return [finding('contraction-absence', 'advisory',
      `No contractions across ${f.wordCount} words. Reads machine-formal; use natural contractions where the register allows (don't, it's, you're).`, 0)];
  },
};

export function runStylometry(ctx, active, f) {
  const feats = f || features(ctx);
  const out = [];
  for (const id of active) {
    const fn = DETECTORS[id];
    if (!fn) continue;
    try { out.push(...fn(ctx, feats)); } catch { /* isolate rule failures */ }
  }
  return out;
}

export { DETECTORS };
