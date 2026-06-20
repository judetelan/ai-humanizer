#!/usr/bin/env node
/**
 * ai-humanizer — detector orchestrator.
 *
 * Loads the rule registry, runs the lexical + stylometry engines, applies mode
 * and provider gating, scores, and (optionally) records a trend. Mirrors
 * impeccable's multi-engine detector: registry = metadata + scoring, engines =
 * detection logic, orchestrator = dispatch + CLI.
 *
 * Usage:
 *   node humanize-detect.mjs [opts] <file...>
 *   echo "text" | node humanize-detect.mjs --stdin [opts]
 *
 * Options:
 *   --mode prose|marketing|both   lever set (default both)
 *   --gpt / --claude              enable provider-specific tic rules
 *   --features                    print stylometric features
 *   --trend                       record the score and print the trend
 *   --json                        machine-readable output
 *   --stdin                       read text from stdin
 *
 * Exit code: 0 = clean, 2 = findings.
 */

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { toText, splitSentences } from './shared/text.mjs';
import { runLexical } from './engines/lexical.mjs';
import { runStylometry, features as computeFeatures } from './engines/stylometry.mjs';
import { activeRuleIds, filterByProviders, score } from './registry/rules.mjs';
import { slugify, record, trend } from './storage.mjs';

/**
 * Analyze text. providers is an array like ['gpt'] / ['claude'].
 * Returns { findings, slop, verdict, wordCount, features, mode }.
 */
export function analyze(raw, mode = 'both', providers = []) {
  const m = ['prose', 'marketing', 'both'].includes(mode) ? mode : 'both';
  const text = toText(raw);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const ctx = { raw, text, wordCount, sentences: splitSentences(text), mode: m };

  const feats = computeFeatures(ctx);
  const lexIds = activeRuleIds({ mode: m, engine: 'lexical', providers });
  const styIds = activeRuleIds({ mode: m, engine: 'stylometry', providers });

  let findings = [
    ...runLexical(ctx, lexIds),
    ...runStylometry(ctx, styIds, feats),
  ];
  findings = filterByProviders(findings, providers);
  findings.sort((a, b) => a.line - b.line || a.id.localeCompare(b.id));

  return { findings, ...score(findings, m), wordCount, features: feats, mode: m };
}

// ── CLI ──────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const out = { files: [], json: false, stdin: false, mode: 'both', providers: [], features: false, trend: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') out.json = true;
    else if (a === '--stdin') out.stdin = true;
    else if (a === '--features') out.features = true;
    else if (a === '--trend') out.trend = true;
    else if (a === '--gpt') out.providers.push('gpt');
    else if (a === '--claude') out.providers.push('claude');
    else if (a === '--gemini') out.providers.push('gemini');
    else if (a === '--mode') out.mode = argv[++i] || 'both';
    else if (a.startsWith('--mode=')) out.mode = a.slice(7);
    else out.files.push(a);
  }
  if (!['prose', 'marketing', 'both'].includes(out.mode)) out.mode = 'both';
  return out;
}

function readStdin() { try { return readFileSync(0, 'utf8'); } catch { return ''; } }

function featureLine(f) {
  return `  features: sentences ${f.sentenceCount} · len ${f.sentLenMean}±cv${f.sentLenCV} (${f.sentLenMin}-${f.sentLenMax}) · TTR ${f.typeTokenRatio} · commas/sent ${f.commasPerSentence} · contractions ${f.contractionRate}/100w · paras ${f.paragraphCount} cv${f.paraLenCV}`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputs = [];
  if (args.stdin || (args.files.length === 0 && !process.stdin.isTTY)) {
    inputs.push({ file: '<stdin>', raw: readStdin() });
  }
  for (const f of args.files) {
    try { inputs.push({ file: f, raw: readFileSync(f, 'utf8') }); }
    catch (e) { inputs.push({ file: f, raw: '', error: String(e.message || e) }); }
  }
  if (inputs.length === 0) {
    process.stderr.write('usage: humanize-detect.mjs [--mode prose|marketing|both] [--gpt|--claude] [--features] [--trend] [--json] <file...>\n');
    process.exit(1);
  }

  const results = inputs.map((inp) => {
    if (inp.error) return { file: inp.file, error: inp.error, findings: [], slop: 0, verdict: 'n/a' };
    const r = { file: inp.file, ...analyze(inp.raw, args.mode, args.providers) };
    if (args.trend && inp.file !== '<stdin>') {
      const slug = slugify(inp.file);
      record(slug, { slop: r.slop, verdict: r.verdict, mode: r.mode, wordCount: r.wordCount, ts: process.env.AIHUMANIZER_TS || '' });
      r._trend = trend(slug, 6).map((e) => e.slop);
    }
    return r;
  });

  const total = results.reduce((n, r) => n + r.findings.length, 0);

  if (args.json) {
    process.stdout.write(JSON.stringify(results, null, 2) + '\n');
  } else {
    const tag = args.providers.length ? ` +${args.providers.join('+')}` : '';
    for (const r of results) {
      if (r.error) { process.stdout.write(`\n${r.file}: ERROR ${r.error}\n`); continue; }
      process.stdout.write(`\n${r.file}  [${r.mode}${tag}]  slop ${r.slop}/100 — ${r.verdict}  (${r.wordCount} words)\n`);
      if (args.features) process.stdout.write(featureLine(r.features) + '\n');
      if (r.findings.length === 0) process.stdout.write('  ✓ no AI tells detected\n');
      for (const f of r.findings) {
        const loc = f.line ? `L${f.line}` : '—';
        process.stdout.write(`  [${f.severity}] ${loc} ${f.id}: ${f.message}\n`);
        if (f.sample) process.stdout.write(`           ↳ "${f.sample}"\n`);
      }
      if (r._trend) process.stdout.write(`  trend (slop, last ${r._trend.length}): ${r._trend.join(' → ')}\n`);
    }
    process.stdout.write('\n');
  }

  process.exit(total > 0 ? 2 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
