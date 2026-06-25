# ai-humanizer

Detect and remove AI writing tells so text reads like a person wrote it. A deterministic
detector (two engines, a 40-rule registry, score trends) paired with rewrite guidance.
Works as a [Claude Agent Skill](https://docs.claude.com/en/docs/agents-and-tools/agent-skills)
and as portable instructions for ChatGPT and Gemini.

> It's a **style/slop scorer, not a provenance classifier.** It surfaces the patterns that
> read as AI. Use it to make your own writing clearer — not to misrepresent AI work as
> human where honesty is required.

## Quickest start — give an LLM this link

Paste this raw link into **Claude, ChatGPT, or Gemini** and tell it to use the skill:

```
https://raw.githubusercontent.com/judetelan/ai-humanizer/main/portable/ai-humanizer.md
```

> Read this and use it to humanize the text I paste next: <link above>

That file is self-contained (rewrite levers + an embedded Python scorer that runs in any
code tool). Use the **raw** link, not the `github.com/.../blob/...` page — raw returns
plain markdown, the blob URL returns an HTML page the model has to wade through.

**Raw links for every file** (pattern: `https://raw.githubusercontent.com/judetelan/ai-humanizer/main/<path>`):

| File | Raw URL |
|---|---|
| Portable (paste into any LLM) | `…/main/portable/ai-humanizer.md` |
| Skill manifest | `…/main/SKILL.md` |
| Banned-words reference | `…/main/references/banned-words.md` |

## What it catches

- **Lexical:** AI-spike vocabulary (delve, leverage, robust, seamless), throat-clearing
  openers (Moreover, In today's world), SaaS buzzwords, hedging, wordy connectives,
  weasel attribution, assistant-register closers, business jargon, empty adverbs (really,
  just, simply), lazy extremes (everyone/always/never), vague declaratives, meta-commentary,
  emphasis crutches.
- **Cadence:** em-dash overuse, the "not X, but Y" aphorism, rule-of-three, participial
  trailers, rhetorical setups ("what if I told you"), negative listing ("Not X… Not Y… Z"),
  dramatic fragmentation, Wh- opener crutch.
- **Voice:** passive voice ("mistakes were made"), false agency ("the data tells us", "the
  decision emerges").
- **Formatting:** emoji decoration, bold-label lists, numbered 01/02/03 markers,
  **LLM-artifact leaks** (`citeturn`, `utm_source=chatgpt.com`, `[Your Name]`),
  smart-punctuation/zero-width fingerprints.
- **Stylometry:** sentence-length burstiness, lexical diversity (type-token ratio), comma
  density, paragraph uniformity, contraction absence.
- **Model tics:** opt-in `--gpt` / `--claude` / `--gemini` lists.

Output: a `slop 0–100` score + verdict (Human → Likely human → Mixed → Likely AI → AI
slop), per-finding line numbers, and a stylometry feature line.

```
sloppy marketing sample   → 68/100  AI slop
genuine human prose       →  0/100  Human
```

---

## Install & use

### Claude Code

Clone into your skills directory so the folder is `~/.claude/skills/ai-humanizer` (global)
or `<project>/.claude/skills/ai-humanizer` (per-project):

```bash
git clone https://github.com/judetelan/ai-humanizer.git ~/.claude/skills/ai-humanizer
```

Then just ask in natural language — "humanize this README", "is this AI?", "de-slop my
landing copy" — or call a command:

| Command | Does |
|---|---|
| `humanize [target]` | detect tells, then rewrite them out |
| `check [target]` | forensic score + evidence (read-only) |
| `audit [target]` | batch-scan a dir/glob, rank worst offenders |

Run the detector directly:

```bash
node scripts/humanize-detect.mjs --mode prose --features path/to/file.md
node scripts/humanize-detect.mjs --mode marketing --gpt path/to/page.html
echo "your text" | node scripts/humanize-detect.mjs --stdin --mode both
```

Flags: `--mode prose|marketing|both`, `--gpt|--claude|--gemini`, `--features`, `--trend`,
`--json`. Exit code `0` clean / `2` findings (CI-friendly). Requires Node 18+.

**Optional auto-scan hook** — flag tells automatically after you write `.md/.txt/.html`.
Add to `.claude/settings.json` (or `settings.local.json`):

```json
{
  "hooks": {
    "PostToolUse": [
      { "matcher": "Write|Edit",
        "hooks": [{ "type": "command",
          "command": "node \"${CLAUDE_PROJECT_DIR}/.claude/skills/ai-humanizer/scripts/hook.mjs\"" }] }
    ]
  }
}
```

### claude.ai (Skills)

Requires a paid plan with the Skills capability. Settings → Capabilities/Skills → create a
skill, then either upload this repo as a zip or paste `portable/ai-humanizer.md` as the
instructions (name it `ai-humanizer`). The portable file includes an embedded Python
scorer that runs in claude.ai's code tool, so you still get an objective slop number.

### ChatGPT

The Node CLI won't run in ChatGPT, but the guidance + Python scorer port cleanly.

- **Custom GPT:** Create a GPT → Configure → paste the contents of
  `portable/ai-humanizer.md` into **Instructions**. With **Code Interpreter** enabled, ask
  it to "score this with the humanizer scorer" and it'll run the embedded Python.
- **Per-chat / Projects:** paste `portable/ai-humanizer.md` into a Project's custom
  instructions, or drop it into a chat and say "use this to humanize what I paste next."

### Gemini

- **Gem:** Gemini → Gems → New Gem → paste `portable/ai-humanizer.md` into the
  instructions. With code execution on, it can run the Python scorer.
- **Per-chat:** paste the portable file and ask it to apply the levers.

---

## The rewrite levers

1. Cut throat-clearing openers. 2. Drop AI vocabulary. 3. Vary sentence rhythm
(burstiness). 4. Normalize em-dashes. 5. Kill marketing buzzwords. 6. Do hedge surgery.
7. Break the rule-of-three. 8. Drop aphoristic cadence / negative listing / dramatic
fragmentation. 9. Strip decoration. 10. Use active voice, name the actor (no passive, no
false agency). 11. Cut empty adverbs & lazy extremes. 12. Be specific, not portentous (no
vague declaratives, meta-commentary, or rhetorical setups). Plus a 1–10 human-judgment
rubric (Directness, Rhythm, Trust, Authenticity, Density). Full detail in
[`SKILL.md`](SKILL.md); lexicons in [`references/banned-words.md`](references/banned-words.md).

## Architecture

```
SKILL.md                  command family + routing + levers
references/               one flow per command + banned-words reference
scripts/
  lexicons.mjs            word/phrase lists (data)
  registry/rules.mjs      40 rules as metadata + scoring + mode/provider gating
  engines/lexical.mjs     phrase & regex matchers
  engines/stylometry.mjs  burstiness, TTR, comma/paragraph stats, contractions
  storage.mjs             per-file slop-score trend
  humanize-detect.mjs     orchestrator + CLI
  hook.mjs                PostToolUse auto-scan
```

Add a rule: append metadata to `registry/rules.mjs`, add a detector keyed by its id to the
matching engine, add any phrases to `lexicons.mjs`.

## Limits & ethics

- Beats **perplexity** detectors (ZeroGPT, QuillBot, Binoculars), **not learned
  classifiers** (GPTZero, Pangram). No undetectability claims.
- Perplexity-style signals misflag fluent non-native English (Liang et al. 2023) — treat
  high scores on such text with skepticism.
- A perfectly even, contraction-free text is also a fingerprint. Aim for human, not robotic.

## License

MIT — see [LICENSE](LICENSE).

Built with [impeccable](https://github.com/)'s detector architecture as the blueprint.

## Credits

Editorial tells — passive voice, false agency, empty adverbs, vague declaratives,
meta-commentary, rhetorical setups, negative listing, lazy extremes, and the 1–10
human-judgment rubric — were absorbed from [stop-slop](https://github.com/hardikpandya/stop-slop)
by Hardik Pandya (MIT). Word lists also draw on anti-ai-slop-writing, harshaneel/humanize,
shannhk/avoid-slop, MohamedAbdallah-14/unslop, brandonwise/humanizer, and Wikipedia's
"Signs of AI writing."
