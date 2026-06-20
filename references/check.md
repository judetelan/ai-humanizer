# check — forensic score (read-only)

Score text for AI tells and explain the verdict with evidence. Does **not** rewrite —
this is the diagnostic counterpart to `humanize` (like impeccable's `critique`).

## Flow

1. **Run the detector** with features and JSON for the full picture:
   ```bash
   node .claude/skills/ai-humanizer/scripts/humanize-detect.mjs --mode <mode> --features --json <file>
   # add --gpt and/or --claude to surface model-specific tics
   ```
2. **Present a forensic report** in chat:
   - **Verdict & score**: `slop N/100` → Human / Likely human / Mixed / Likely AI / AI slop.
   - **Stylometry**: sentence-length mean ± CV (burstiness), type-token ratio, commas per
     sentence, paragraph-length CV — say which look human vs. machine.
   - **Evidence**: for each finding, quote the flagged sample with its line and the rule.
   - **Top fixes**: the 3 highest-weight findings, with the specific lever to apply.
3. **Classify false positives** explicitly so the user trusts the score.

## Notes

- Honest limit: this reflects *perplexity/stylometry* signals. It does not replicate
  learned classifiers (GPTZero, Pangram). Report it as "reads as AI/human," not "will
  pass/fail detector X."
- For a quick number without the report, just read the non-JSON output's first line.
