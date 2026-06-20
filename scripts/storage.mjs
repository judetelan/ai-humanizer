/**
 * ai-humanizer — score storage + trend.
 *
 * Persists slop scores per target to .ai-humanizer/scores/ so you can show
 * before/after movement across rewrites (mirrors impeccable's critique-storage
 * trend). One JSONL file per slug; each line is one run.
 *
 * CLI:
 *   node storage.mjs slug   <path-or-text-id>
 *   node storage.mjs record <slug> <slop> <verdict> <mode> [wordCount]
 *   node storage.mjs trend  <slug> [n]
 */

import { mkdirSync, appendFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join(process.cwd(), '.ai-humanizer', 'scores');

export function slugify(target) {
  return String(target)
    .replace(/^https?:\/\//, '')
    .replace(/[\\/]+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .toLowerCase()
    .slice(0, 80) || 'text';
}

export function record(slug, entry) {
  try {
    mkdirSync(DIR, { recursive: true });
    const line = JSON.stringify({ slug, ...entry }) + '\n';
    appendFileSync(join(DIR, `${slug}.jsonl`), line);
    return true;
  } catch { return false; }
}

export function trend(slug, n = 5) {
  const file = join(DIR, `${slug}.jsonl`);
  if (!existsSync(file)) return [];
  try {
    const lines = readFileSync(file, 'utf8').trim().split('\n').filter(Boolean);
    return lines.slice(-n).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  } catch { return []; }
}

function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (cmd === 'slug') { process.stdout.write(slugify(rest[0] || '') + '\n'); return; }
  if (cmd === 'record') {
    const [slug, slop, verdict, mode, wordCount] = rest;
    const ok = record(slug, { slop: +slop, verdict, mode, wordCount: +wordCount || 0, ts: process.env.AIHUMANIZER_TS || '' });
    process.exit(ok ? 0 : 1);
  }
  if (cmd === 'trend') {
    process.stdout.write(JSON.stringify(trend(rest[0], +rest[1] || 5)) + '\n');
    return;
  }
  process.stderr.write('usage: storage.mjs slug|record|trend ...\n');
  process.exit(1);
}

import { pathToFileURL } from 'node:url';
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
