# Banned-words reference

The lexicons the detector scans for, with rationale. These mirror the arrays in
`scripts/humanize-detect.mjs` — edit both together if you extend a list. Nothing here is
absolute: a word is a *signal*, not a sin. Context decides (a database really can be
"robust"). The tell is **frequency and clustering**, not a single use.

## AI-spike vocabulary

Words that appear in LLM output at multiples of the human base rate. Reach for a plainer,
more specific word.

`delve` · `tapestry` · `realm` · `underscore` · `pivotal` · `testament` · `vibrant` ·
`bustling` · `navigate the` · `foster` · `leverage` · `robust` · `seamless` · `holistic` ·
`multifaceted` · `nuanced` · `intricate` · `meticulous` · `elevate` · `unleash` ·
`unlock the` · `embark` · `myriad` · `plethora` · `paramount` · `crucial` · `cutting-edge` ·
`in the realm of` · `rich tapestry` · `ever-evolving` · `ever-changing` · `landscape of` ·
`at the forefront` · `beacon of` · `treasure trove`

**Swap examples:** delve → look at / dig into · leverage → use · robust → reliable / solid ·
seamless → smooth / no setup · myriad → many · utilize → use · facilitate → help.

## Throat-clearing & connective openers

Cut, or replace with the assertion itself. Listing two adjacent connectives
(*Moreover … Furthermore …*) is an especially strong tell.

`Certainly,` · `Of course,` · `Absolutely,` · `Great question` · `In today's …` ·
`In the world of …` · `In the realm of …` · `In an era …` · `It's worth noting` ·
`It's important to note` · `Importantly,` · `Notably,` · `Needless to say` ·
`At the end of the day` · `When it comes to` · `In conclusion` · `To sum up` ·
`In summary` · `Moreover,` · `Furthermore,` · `Additionally,` · `Ultimately,` ·
`That being said` · `Rest assured`

## Marketing / SaaS buzzwords (marketing mode weights these up)

Replace with the literal verb + noun. What does the product actually do?

`streamline your` · `empower your` · `supercharge your` · `unleash your` ·
`unleash the power` · `leverage the power` · `harness the power` · `built for the modern` ·
`trusted by leading` · `best-in-class` · `industry-leading` · `world-class` ·
`enterprise-grade` · `next-generation` · `cutting-edge` · `transform your business` ·
`revolutionize` · `game-changer` · `mission-critical` · `best of breed` · `future-proof` ·
`seamless experience` · `seamlessly integrate` · `drive engagement` · `drive growth` ·
`drive results` · `take it to the next level` · `one-stop shop` · `tailored solutions` ·
`bespoke solutions`

## Hedges (prose mode)

Two or more is the trigger. Assert directly, or state real, specific uncertainty.

`generally speaking` · `broadly speaking` · `in many ways` · `to some extent` ·
`arguably` · `it could be argued` · `it depends` · `more often than not` ·
`for the most part` · `in most cases` · `as a general rule`

## Wordy connectives (collapse to one word)

`due to the fact that` (→ because) · `the fact that` · `in order to` (→ to) ·
`for the purpose of` · `in the event that` (→ if) · `has the ability to` (→ can) ·
`at this point in time` (→ now) · `in terms of` · `with regard to` · `a wide range of` ·
`a variety of`

## Vague attribution / weasel sourcing (name it or cut it)

`experts say/believe/argue/suggest` · `studies show` · `research suggests/shows` ·
`observers (have) noted` · `industry reports` · `some critics argue` ·
`widely regarded/considered/seen as` · `it is believed/said that` · `many believe` · `some say`

## Inflated copula (use plain "is/has")

`serves as` · `stands as` · `functions as` · `represents a` · `embodies the` · `exemplifies the`

## Assistant / sycophancy register (strip it)

`I hope this helps` · `I hope this finds you well` · `please don't hesitate to reach out` ·
`feel free to` · `happy to help` · `is there anything else` · `would you like me to` ·
`you're absolutely right` · `that's an excellent point` · `what a thoughtful question` ·
`I'd be happy to` · `here is an overview/summary/breakdown`

## Weightless conclusions (end on something specific)

`the future looks bright` · `exciting times lie ahead` · `the possibilities are endless` ·
`poised for growth` · `only time will tell` · `shaping the future of` · `setting the stage for` ·
`serves as a reminder` · `leaves an indelible mark` · `the bottom line is` · `here's the thing`

## Business / LinkedIn jargon (marketing mode)

`thought leadership` · `pain points` · `value proposition` · `move the needle` ·
`circle back` · `double down` · `lean into` · `low-hanging fruit` · `north star` ·
`learnings` · `paradigm shift` · `commitment to excellence` · `synergy`

## Model-specific tics (gated: --gpt / --claude / --gemini)

- **GPT:** `rich tapestry` · `navigating the complexities` · `plays a crucial/vital role` ·
  `a testament to` · `characterized by` · `Sure! Here's`
- **Claude:** `I'll help you` · `Let me` · `Here's` · `Great question` · `to be clear` ·
  `you're absolutely right`
- **Gemini:** `paving the way` · `a symphony of` · `the cascade of` · `in the grand tapestry`

## Structural / cadence tells (no word list — pattern-matched)

- **Em-dash overuse** — the loudest punctuation tell. Several × human rate. Keep rare.
- **Uniform sentence rhythm** — low length variance (low burstiness). Vary deliberately.
- **Rule-of-three** — reflexive "X, Y, and Z" triads. Break the pattern.
- **Aphoristic cadence** — "Not an X. A Y." / "No fluff. Just results." / "It's not just
  X, it's Y." Manufactured contrast.
- **Numbered 01/02/03 markers** — only earn their place when order carries meaning.
- **Emoji decoration** — emoji bullets and ✓/🚀 section badges.

## Extending the lists

Add entries to both this file and the matching array in `humanize-detect.mjs`. Keep
phrases lowercase in the script (matching is case-insensitive). Prefer multi-word phrases
over bare common words to avoid false positives (`drive growth` is a tell; `drive` alone
is not). When in doubt, watch the false-positive rate on a few real human documents before
committing a new entry.
