---
name: ai-humanizer
description: Detects and removes AI writing tells so text reads like a human wrote it. Use when the user wants to humanize, de-slop, de-AI, score, audit, or clean up writing — prose (docs, READMEs, articles, emails) or marketing/web copy. Covers em-dash overuse, AI vocabulary (delve/leverage/robust), throat-clearing openers (moreover/furthermore), SaaS buzzwords, hedging, uniform sentence rhythm, lexical diversity, the "not X, but Y" cadence, rule-of-three, emoji decoration, model-specific tics, plus editorial tells absorbed from stop-slop — passive voice, false agency ("the data tells us"), empty adverbs, vague declaratives, meta-commentary, rhetorical setups, negative listing, and lazy extremes. Pairs a deterministic two-engine detector with rewrite guidance, modeled on the impeccable design skill.
---

# AI Humanizer

Make writing read like a person wrote it. The prose counterpart to the `impeccable`
design skill: a deterministic detector (lexical + stylometry engines, a data-driven rule
registry, score trends) plus rewrite levers. The detector keeps you honest — it's easy to
*think* text is clean and miss the patterns.

## Commands

| Command | Description | Reference |
|---|---|---|
| `humanize [target]` | Detect tells, then rewrite them out (default) | [references/humanize.md](references/humanize.md) |
| `check [target]` | Forensic score + evidence, read-only (no rewrite) | [references/check.md](references/check.md) |
| `audit [target]` | Batch-scan a dir/glob, rank worst offenders | [references/audit.md](references/audit.md) |

### Routing

1. **First word matches a command** (`humanize` / `check` / `audit`): load that reference
   and follow it. The rest of the input is the target.
2. **First word doesn't match but intent is clear**: "make this sound human" / "de-slop
   my README" → `humanize`; "is this AI?" / "score this" → `check`; "scan all my docs" →
   `audit`. Load the matching reference.
3. **No target, just text pasted**: run `check` on it, then offer to `humanize`.

(A skill is one entry but can expose many commands — the argument routes to a reference
file. Optionally pin `/humanize` as a standalone shortcut.)

## Architecture (so you can extend it)

```
scripts/
  lexicons.mjs            word/phrase lists (data)
  registry/rules.mjs      rule metadata + scoring + mode/provider gating (data)
  engines/lexical.mjs     phrase & regex matchers
  engines/stylometry.mjs  burstiness, type-token ratio, comma & paragraph stats
  storage.mjs             slop-score trend per file (.ai-humanizer/scores/)
  humanize-detect.mjs     orchestrator + CLI
  hook.mjs                PostToolUse auto-scan
references/               one flow per command
```

To add a rule: append metadata to `registry/rules.mjs`, add its detector to the matching
engine (keyed by rule id), and add any phrases to `lexicons.mjs` + `references/banned-words.md`.

## Running the detector

```bash
node .claude/skills/ai-humanizer/scripts/humanize-detect.mjs [opts] <file...>
echo "text" | node .claude/skills/ai-humanizer/scripts/humanize-detect.mjs --stdin [opts]
```

| Option | Effect |
|---|---|
| `--mode prose\|marketing\|both` | lever set (default `both`); marketing weights buzzwords up, rhythm/hedging down |
| `--gpt` / `--claude` / `--gemini` | enable model-specific tic rules (off by default) |
| `--features` | print stylometry (sentence CV, TTR, comma density, paragraph CV) |
| `--trend` | record the score and print the per-file trend |
| `--json` | machine-readable output |

Output: `slop N/100` + verdict (Human → Likely human → Mixed → Likely AI → AI slop), with
per-finding line + sample. Exit `0` clean / `2` findings (CI-friendly).

Full lexicons + rationale: [references/banned-words.md](references/banned-words.md).

## The rewrite levers

1. **Cut throat-clearing openers** — *Certainly, In today's world, It's worth noting,
   Moreover, Furthermore.* Start on the assertion.
2. **Drop AI vocabulary** — delve, leverage, robust, seamless, vibrant, tapestry, realm,
   underscore, pivotal, testament. Use plain, specific words.
3. **Vary rhythm (burstiness)** — one very short sentence (≤6 words), then a long one.
   Never three in a row within ~4 words of each other.
4. **Normalize punctuation** — em-dashes are the loudest tell; keep them rare (~1 per
   150–300 words). Prefer periods over semicolons.
5. **Kill buzzwords (marketing)** — world-class, cutting-edge, streamline your,
   supercharge, revolutionize. Say the literal verb + noun.
6. **Hedge surgery** — cut *generally speaking, arguably, in most cases* unless the
   uncertainty is real; then state it specifically.
7. **Break the rule-of-three** — stop defaulting to "X, Y, and Z" triads.
8. **Drop aphoristic cadence** — "It's not just a tool. It's a revolution." / "No fluff.
   Just results." Say it plainly. Same for negative listing ("Not X… Not Y… Z") and
   dramatic fragmentation ("That's it. That's the…").
9. **Strip decoration** — emoji bullets, ✓/🚀 badges, 01/02/03 markers with no real order.
10. **Use active voice, name the actor** — kill agentless passives ("mistakes were made") and
    false agency ("the data tells us", "the decision emerges"). A person did it — say who.
11. **Cut empty adverbs & lazy extremes** — *really, just, simply, actually, genuinely*; and
    sweeping absolutes (*everyone, always, never*). Replace with the specific.
12. **Be specific, not portentous** — drop vague declaratives ("the implications are
    significant"), meta-commentary ("the rest of this essay…"), rhetorical setups ("what if
    I told you", "think about it"), and emphasis crutches ("let that sink in"). Name the
    concrete thing; let the reader draw the conclusion.

### Human-judgment rubric (absorbed from stop-slop)

The numeric slop score catches patterns; this rubric catches what regex can't. After a
rewrite, rate each 1–10 — below ~7 on any axis, revise:

| Dimension | Question |
|---|---|
| **Directness** | Statements, or announcements about statements? |
| **Rhythm** | Varied sentence lengths, or metronomic? |
| **Trust** | Does it respect the reader's intelligence (no hand-holding)? |
| **Authenticity** | Does a person sound like they wrote this? |
| **Density** | Anything cuttable without losing meaning? |

## Triage — not every match is a defect

Keep (and say why) when: the text **quotes** a bad word on purpose (a style guide), it's a
**literal domain term** (a database really is "robust"), or removing it would distort
meaning or flatten real voice. Over-correction is its own tell; the target is natural
variance, not a new uniform.

## Hook (auto-scan)

`scripts/hook.mjs` is a `PostToolUse` hook: after a Write/Edit to `.md/.mdx/.txt/.html`
it scans and warns if slop ≥ threshold (default 12). Wired in `.claude/settings.local.json`
alongside impeccable's. Tune via `AIHUMANIZER_THRESHOLD` / `AIHUMANIZER_MODE` / `AIHUMANIZER_EXTS`.

## Honest limits & ethics

- **It's a style/slop scorer, not a provenance classifier.** It surfaces the *patterns*
  that read as AI. It can't prove text was AI-written, and surface rewriting moves a
  strong learned detector's score very little. Report results as "reads as AI/human," not
  "will pass/fail detector X."
- Beats **perplexity** detectors (ZeroGPT, QuillBot, Binoculars), **not learned
  classifiers** (GPTZero, Pangram, Grammarly), which read the instruction-tuning
  fingerprint. No undetectability promises.
- **Non-native-writer caveat.** Research (Liang et al. 2023) found perplexity-style
  signals misflag fluent non-native English at high rates. Treat a high score on such
  text with extra skepticism; weight combinations of structural tells over lone words.
- For improving your own writing, not for misrepresenting AI work as human where honesty
  is required (graded work, "no-AI" disclosures).
- A perfectly even, hedge-free, em-dash-free, contraction-free text is also a fingerprint.
  Aim for human, not robotic.
