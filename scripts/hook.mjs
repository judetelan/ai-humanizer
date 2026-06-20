#!/usr/bin/env node
/**
 * ai-humanizer — PostToolUse hook.
 *
 * After a Write/Edit to a text file, runs the humanizer detector and, if the
 * slop score crosses a threshold, surfaces the findings as additional context
 * (the same loop the impeccable design skill uses for UI files). It never
 * blocks — PostToolUse runs after the edit; this only adds a reminder.
 *
 * Enable by adding to .claude/settings.json:
 *
 *   {
 *     "hooks": {
 *       "PostToolUse": [
 *         {
 *           "matcher": "Write|Edit",
 *           "hooks": [
 *             { "type": "command",
 *               "command": "node .claude/skills/ai-humanizer/scripts/hook.mjs" }
 *           ]
 *         }
 *       ]
 *     }
 *   }
 *
 * Tune with env vars:
 *   AIHUMANIZER_THRESHOLD  minimum slop score to report (default 12)
 *   AIHUMANIZER_MODE       prose | marketing | both (default: by extension)
 *   AIHUMANIZER_EXTS       comma list of extensions (default md,mdx,txt,html,htm)
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';
import { analyze } from './humanize-detect.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

function readStdin() {
  try { return readFileSync(0, 'utf8'); } catch { return ''; }
}

function emitContext(text) {
  // PostToolUse JSON contract: additionalContext is injected as a reminder.
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: text },
  }) + '\n');
}

function main() {
  let payload;
  try { payload = JSON.parse(readStdin() || '{}'); } catch { process.exit(0); }

  const filePath = payload?.tool_input?.file_path || payload?.tool_input?.path || '';
  if (!filePath) process.exit(0);

  const exts = (process.env.AIHUMANIZER_EXTS || 'md,mdx,txt,html,htm')
    .split(',').map((e) => '.' + e.trim().replace(/^\./, '').toLowerCase());
  const ext = extname(filePath).toLowerCase();
  if (!exts.includes(ext)) process.exit(0);

  // Skip the skill's own files (SKILL.md, references, lexicons, dist copies):
  // they quote tells on purpose and would always self-flag.
  if (/ai-humanizer/i.test(filePath.replace(/\\/g, '/'))) process.exit(0);

  let raw;
  try { raw = readFileSync(filePath, 'utf8'); } catch { process.exit(0); }

  const mode = process.env.AIHUMANIZER_MODE
    || (ext === '.html' || ext === '.htm' ? 'marketing' : 'prose');
  const threshold = Number(process.env.AIHUMANIZER_THRESHOLD || 12);

  let result;
  try { result = analyze(raw, ['prose', 'marketing', 'both'].includes(mode) ? mode : 'prose'); }
  catch { process.exit(0); }

  if (!result.findings.length || result.slop < threshold) process.exit(0);

  const top = result.findings.slice(0, 6).map((f) => {
    const loc = f.line ? `L${f.line}` : '—';
    return `  • [${f.severity}] ${loc} ${f.id}: ${f.message}`;
  }).join('\n');
  const more = result.findings.length > 6 ? `\n  • +${result.findings.length - 6} more` : '';
  const rel = filePath.replace(/\\/g, '/').split('/').slice(-2).join('/');

  emitContext(
    `[ai-humanizer] ${rel} scored slop ${result.slop}/100 (${result.verdict}, mode: ${mode}).\n` +
    `${top}${more}\n` +
    `Apply the rewrite levers in ai-humanizer/SKILL.md, or classify contextual false ` +
    `positives (quoted bad words, literal domain terms). Re-run the detector to confirm ` +
    `the score dropped. Full scan: node .claude/skills/ai-humanizer/scripts/humanize-detect.mjs --mode ${mode} "${filePath}"`
  );
  process.exit(0);
}

main();
