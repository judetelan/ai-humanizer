/**
 * ai-humanizer — shared lexicons.
 *
 * Pure data, no logic. The lexical engine reads these; the registry references
 * them by name. Keep entries lowercase (matching is case-insensitive). Mirror
 * any change here in references/banned-words.md.
 *
 * Sources for the expanded lists: anti-ai-slop-writing, harshaneel/humanize,
 * shannhk/avoid-slop, MohamedAbdallah-14/unslop, brandonwise/humanizer,
 * hardikpandya/stop-slop, and Wikipedia "Signs of AI writing".
 */

// Words that spike in AI prose well above human base rates.
export const BANNED_VOCAB = [
  // original set
  'delve', 'delves', 'delving', 'tapestry', 'realm', 'realms', 'underscore',
  'underscores', 'underscoring', 'pivotal', 'testament', 'vibrant', 'bustling',
  'foster', 'fostering', 'leverage', 'leveraging', 'robust', 'seamless',
  'seamlessly', 'holistic', 'multifaceted', 'nuanced', 'intricate', 'meticulous',
  'meticulously', 'elevate', 'elevates', 'elevating', 'unleash', 'embark',
  'myriad', 'plethora', 'paramount', 'crucial', 'cutting-edge', 'in the realm of',
  'rich tapestry', 'ever-evolving', 'ever-changing', 'landscape of',
  'at the forefront', 'beacon of', 'treasure trove',
  // researched additions (high-signal)
  'bolster', 'bolstered', 'bolstering', 'garner', 'garnered', 'interplay',
  'encompass', 'encompassing', 'commence', 'aforementioned', 'spearhead',
  'spearheading', 'harness', 'harnessing', 'showcase', 'showcasing', 'elucidate',
  'illuminate', 'catalyze', 'catalyst', 'cornerstone', 'poised', 'reimagine',
  'reimagining', 'invaluable', 'groundbreaking', 'transformative', 'unprecedented',
  'breathtaking', 'renowned', 'nestled', 'boasts', 'unparalleled',
  'state-of-the-art', 'synergy', 'synergies', 'utilize', 'utilizing', 'facilitate',
  'paradigm', 'indelible', 'delve into',
  // 2026 additions (stop-slop, unslop, brandonwise, Wikipedia)
  'enduring', 'stunning', 'must-visit', 'steeped in',
  'actionable', 'impactful', 'unpack', 'unpacking',
  'enhancing', 'emphasizing', 'highlighting',
  'boasts a rich heritage',
];

// Throat-clearing / RLHF openers and connective scaffolding.
export const AI_OPENERS = [
  "certainly,", "of course,", "absolutely,", "great question",
  "in today's", "in the world of", "in the realm of", "in an era",
  "it's worth noting", "it is worth noting", "it's important to note",
  "it is important to note", "importantly,", "notably,", "needless to say",
  "at the end of the day", "when it comes to", "in conclusion", "to sum up",
  "in summary", "moreover,", "furthermore,", "additionally,", "ultimately,",
  "that being said", "rest assured",
  // researched additions
  "indeed,", "interestingly,", "remarkably,", "essentially,", "fundamentally,",
  "inherently,", "conversely,", "that said,", "in essence,", "simply put,",
  "to put it simply,", "in other words,",
  // stop-slop throat-clearers
  "it turns out", "the truth is", "let's be honest", "can we talk about",
  "the real question is", "in a world where",
  // 2026 additions (stop-slop Jan 2026, no-ai-slop, unslop)
  "here's what i find interesting", "here's the problem though",
  "what nobody tells you", "the part everyone misses",
  "at its core,", "in reality,",
  "here's what you need to know", "let's break this down", "let's dive in",
];

// SaaS marketing filler.
export const BUZZWORDS = [
  'streamline your', 'empower your', 'supercharge your', 'unleash your',
  'unleash the power', 'leverage the power', 'harness the power',
  'built for the modern', 'trusted by leading', 'trusted by the world',
  'best-in-class', 'industry-leading', 'world-class', 'enterprise-grade',
  'next-generation', 'next generation', 'cutting-edge', 'transform your business',
  'revolutionize', 'game-changer', 'game changing', 'game-changing',
  'mission-critical', 'best of breed', 'future-proof', 'future proof',
  'seamless experience', 'seamlessly integrate', 'drive engagement',
  'drive growth', 'drive results', 'take it to the next level',
  'one-stop shop', 'tailored solutions', 'bespoke solutions',
  // researched additions
  'move the needle', 'unlock the power of', 'unlock the potential',
  'unleash the potential', 'bridge the gap', 'at its core', 'at the heart of',
  'the rise of', 'a deep dive into', 'deep dive', 'in a nutshell',
];

// Hedges that soften prose into noncommittal mush.
export const HEDGES = [
  'generally speaking', 'broadly speaking', 'in many ways', 'to some extent',
  'arguably', 'it could be argued', 'one could argue', 'it depends',
  'more often than not', 'for the most part', 'in most cases', 'as a general rule',
];

// Wordy connectives that a human would collapse.
export const WORDY_CONNECTIVES = [
  'due to the fact that', 'the fact that', 'in order to', 'for the purpose of',
  'in the event that', 'has the ability to', 'in light of the fact that',
  'at this point in time', 'in terms of', 'with regard to', 'in the process of',
  'a wide range of', 'a variety of', 'it is important to',
];

// Vague attribution / weasel sourcing.
export const WEASEL_ATTRIBUTION = [
  'experts say', 'experts believe', 'experts argue', 'experts suggest',
  'studies show', 'research suggests', 'research shows', 'observers noted',
  'observers have noted', 'industry reports', 'some critics argue',
  'widely regarded', 'widely considered', 'widely seen as', 'it is believed that',
  'it is said that', 'many believe', 'some say',
];

// Copula avoidance — inflated verbs where "is/has" would do.
export const COPULA_AVOID = [
  'serves as', 'served as', 'stands as', 'functions as', 'acts as a testament',
  'represents a', 'embodies the', 'exemplifies the',
  // 2026 additions (unslop copula expansion)
  'features a', 'features an', 'boasted', 'boasting',
];

// Sycophantic / assistant closers and openers.
export const CHATBOT_CLOSERS = [
  'i hope this helps', 'i hope this finds you well', 'i hope this email finds you well',
  "please don't hesitate to reach out", "don't hesitate to", "feel free to",
  'happy to help', 'is there anything else', "let me know if you'd like",
  'would you like me to', "you're absolutely right", "that's an excellent point",
  'excellent point', 'what a thoughtful question', "i'd be happy to",
  'here is an overview', 'here is a summary', 'here is a breakdown',
  // 2026 additions (harshaneel)
  'happy to jump on a call', 'looking forward to connecting',
];

// Generic, weightless conclusions.
export const CONCLUSION_FLUFF = [
  'the future looks bright', 'exciting times lie ahead', 'journey toward excellence',
  'step in the right direction', 'only time will tell', 'the possibilities are endless',
  'poised for growth', 'watch this space', 'shaping the future of',
  'setting the stage for', 'serves as a reminder', 'leaves an indelible mark',
  'a key turning point', 'the bottom line is', "here's the thing",
];

// Business / LinkedIn jargon.
export const BUSINESS_JARGON = [
  'thought leader', 'thought leadership', 'pain points', 'value add',
  'value proposition', 'moving forward', 'touch base', 'circle back',
  'double down', 'double-click', 'lean into', 'on the same page',
  'low-hanging fruit', 'north star', 'learnings', 'paradigm shift',
  'commitment to excellence', 'synergy', 'leverage synergies',
  // stop-slop additions
  'take a step back',
];

// Empty intensifiers — adverbs that add emphasis but no meaning (stop-slop).
// Single common words; the rule is density-gated to avoid false positives.
export const ADVERB_FILLER = [
  'really', 'just', 'literally', 'genuinely', 'honestly', 'simply', 'actually',
  'truly', 'deeply', 'basically', 'totally', 'frankly', 'surely', 'undoubtedly',
  // 2026 additions (stop-slop Jan 2026 AI intensifiers)
  'fundamentally', 'inherently', 'inevitably',
];

// Lazy extremes — sweeping absolutes that fake authority (stop-slop).
export const LAZY_EXTREMES = [
  'everyone', 'everybody', 'nobody', 'no one', 'always', 'never',
  'every single', 'without exception', 'each and every', 'everything', 'nothing',
];

// Meta-commentary — self-referential asides about the text's own structure (stop-slop).
export const META_COMMENTARY = [
  'the rest of this essay', 'walk you through',
  'in this section', 'in this post', 'in this article', "as we'll see",
  'as we will see', 'i want to explore', 'plot twist:', 'spoiler:',
  'you already know this', "but that's another post", 'let me explain',
  // 2026 additions (metadiscourse patterns)
  'as mentioned earlier', 'as discussed above',
];

// Rhetorical setups — announce insight instead of delivering it (stop-slop).
export const RHETORICAL_SETUP = [
  'what if i told you', "here's what i mean", 'think about it', "and that's okay",
  'ask yourself', "here's the kicker", "here's the catch", 'hear me out',
  'let that marinate', 'buckle up',
];

// Emphasis crutches — manufactured weight that carries no information (stop-slop).
export const EMPHASIS_CRUTCH = [
  'full stop.', 'let that sink in', 'make no mistake', 'this matters because',
  "here's why that matters", 'let me be clear', "i'll say it again", 'read that again',
  'the uncomfortable truth is', 'plain and simple', 'mark my words',
  // 2026 additions (stop-slop performative emphasis)
  'i promise', 'they exist, i promise', 'creeps in',
];

// Vague declaratives — announce significance without naming the specific thing (stop-slop).
export const VAGUE_DECLARATIVE = [
  'the reasons are structural', 'the implications are significant',
  'the stakes are high', 'the consequences are real', 'this is the deepest problem',
  "the stakes couldn't be higher", 'the stakes could not be higher',
  'the significance cannot be overstated', 'the importance cannot be overstated',
  // 2026 additions (harshaneel authority tropes)
  'the real question is', 'what really matters', 'the deeper issue',
  'the heart of the matter',
];

// False agency — inanimate subjects given human verbs (stop-slop). Matched as
// "the <noun> <verb>" in the engine; lists kept here for maintainability.
export const FALSE_AGENCY_NOUNS = [
  'data', 'market', 'markets', 'culture', 'conversation', 'decision', 'complaint',
  'narrative', 'story', 'algorithm', 'technology', 'system', 'process', 'numbers',
  'metrics', 'code', 'model', 'product', 'strategy', 'truth', 'answer', 'question',
];
export const FALSE_AGENCY_VERBS = [
  'tells', 'rewards', 'decides', 'emerges', 'shifts', 'moves', 'knows', 'wants',
  'believes', 'demands', 'chooses', 'understands', 'realizes', 'feels', 'thinks',
  'speaks', 'listens', 'reveals', 'suggests', 'reminds', 'becomes', 'punishes',
];

// Business jargon → plain replacements (stop-slop). Drives rewrite guidance; the
// keys also feed the business-jargon detector via BUSINESS_JARGON above.
export const JARGON_SWAPS = {
  'navigate': 'handle, address',
  'unpack': 'explain, examine',
  'lean into': 'accept, embrace',
  'landscape': 'situation, field',
  'game-changer': 'significant, important',
  'double down': 'commit, increase',
  'deep dive': 'analysis, examination',
  'take a step back': 'reconsider',
  'moving forward': 'next, from now',
  'circle back': 'return to, revisit',
  'on the same page': 'aligned, agreed',
};

// Model-specific tics, gated off by default (--gpt / --claude / --gemini).
export const GPT_TICS = [
  'rich tapestry', 'navigating the complexities', 'in the ever-evolving',
  'it is worth noting that', 'plays a crucial role', 'plays a vital role',
  'a testament to', 'underscores the importance', 'sure! here', "here's a",
  'i hope this helps', 'certainly!', 'characterized by', 'it is important to remember',
  // GPT-5 persistent (2026)
  'emphasizing', 'enhance', 'showcasing',
];

export const CLAUDE_TICS = [
  "i'll help you", "let me", "here's", "i'd be happy to", "great question",
  "i appreciate", "to be clear", "that said,", "it's worth noting that",
  "a few things", "let's break", "i want to make sure", "you're absolutely right",
  "that's a great", "i should note",
  // Opus 5 Claudisms (2026)
  "load-bearing", "worth stating plainly", "carry the argument",
  "one might argue", "it could be suggested",
];

export const GEMINI_TICS = [
  'the way for', 'the cascade of', 'it is not a', 'it is not just a',
  'paving the way', 'a symphony of', 'in the grand tapestry',
  'plays a significant role', 'it is essential to',
];

// Grok-specific tics (2026 — Wikipedia, community research).
export const GROK_TICS = [
  'causal', 'empirical', 'correlate', 'correlates',
  'grok_card', 'grok_render_citation_card_json',
];

// DeepSeek markup artifacts (2026 — Wikipedia).
export const DEEPSEEK_TICS = [
  '⟨', '⟩', '†', '‡',
];

// RLHF artifacts — instruction-tuning voice that detectors fire on (arXiv 2605.19516).
export const RLHF_ARTIFACTS = [
  'on one hand', 'on the other hand',
  "that's a great question",
  'while i understand', 'i would suggest',
  "it's important to consider",
  'there are several', 'there are a few',
  'let me clarify', 'to clarify',
  'as of my training', 'based on what i know',
  'i should mention', 'i should point out',
];

// Reasoning chain leaks — CoT artifacts in published prose (PAN 2026, brandonwise).
export const REASONING_CHAIN = [
  'let me think', "let's reason through", "let's work through",
  'step 1:', 'step 2:', 'step 3:', 'step 4:',
  "first, let's", "next, let's", "finally, let's",
  'breaking this down', 'if we break this down',
  "let's consider", "let's examine",
];

// Acknowledgment loops — parroting the question back (brandonwise).
export const ACKNOWLEDGMENT_LOOP = [
  "you're asking about", "you're wondering",
  'you want to know', 'you mentioned that',
  'great observation', "that's an interesting question",
  "that's a thoughtful question",
  "i understand you're looking for",
];
