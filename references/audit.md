# audit — batch scan

Score many files at once and rank the worst offenders. Use before a docs cleanup, a copy
pass, or in CI.

## Flow

1. **Collect targets.** A directory, a glob, or an explicit list. Skip generated and
   vendor paths (`node_modules`, `dist`, `.git`).
2. **Scan in one call** (the detector accepts many files):
   ```bash
   node .claude/skills/ai-humanizer/scripts/humanize-detect.mjs --mode <mode> --json <file...>
   ```
   For large trees, shell-expand the glob (e.g. `**/*.md`) and pass the list.
3. **Rank & summarize** in chat:
   - A table sorted by slop score (worst first): file · score · verdict · top rule.
   - The single most common rule across the corpus (the systemic habit to fix).
   - Totals: N files, M flagged, average score.
4. **Recommend** the 2–3 files worth a `humanize` pass first (highest score × importance).

## CI use

Exit code is `2` if any file has findings, `0` if all clean. Gate a docs/copy check on it:

```bash
node .claude/skills/ai-humanizer/scripts/humanize-detect.mjs --mode prose docs/**/*.md || echo "AI tells found"
```

Tune strictness by mode and by enabling/omitting `--gpt` / `--claude`.
