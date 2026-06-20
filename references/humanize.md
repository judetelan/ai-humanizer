# humanize — rewrite flow

The default command. Detect AI tells, then rewrite them out while keeping meaning and the
author's voice.

## Flow

1. **Resolve target & mode.** A file path or pasted text. Mode: `prose` (default),
   `marketing`, or `both`. For `.html` copy use `marketing`.
2. **Detect (baseline).** Run the detector with `--features` and record the score:
   ```bash
   node .claude/skills/ai-humanizer/scripts/humanize-detect.mjs --mode <mode> --features --trend <file>
   ```
   `--trend` writes the score to `.ai-humanizer/scores/` so you can show before/after.
3. **Triage each finding.** Real tell → fix. Contextual false positive → keep, say why
   (quoted bad words, literal domain terms, code the stripper missed).
4. **Rewrite with the nine levers** (see SKILL.md): cut openers, drop AI vocab, vary
   rhythm, normalize em-dashes, kill buzzwords, hedge surgery, break rule-of-three, drop
   aphoristic cadence, strip decoration. Preserve meaning; don't flatten real voice.
5. **Re-detect & report.** Run again with `--trend`; report the movement, e.g.
   *"slop 63 → 8, AI slop → Likely human."* Quote 2–3 concrete before/after lines.

## Rules

- Edit in place when the target is a file; show a diff-style summary of what changed.
- Never strip every em-dash to zero or convert all prose to staccato. Over-correction is
  its own fingerprint; aim for natural variance.
- If the score won't drop below "Mixed" without distorting meaning, say so and stop —
  don't mangle the text to win a number.
