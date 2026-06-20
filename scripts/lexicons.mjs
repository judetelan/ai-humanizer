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
  'serves as', 'stands as', 'functions as', 'acts as a testament',
  'represents a', 'embodies the', 'exemplifies the',
];

// Sycophantic / assistant closers and openers.
export const CHATBOT_CLOSERS = [
  'i hope this helps', 'i hope this finds you well', 'i hope this email finds you well',
  "please don't hesitate to reach out", "don't hesitate to", "feel free to",
  'happy to help', 'is there anything else', "let me know if you'd like",
  'would you like me to', "you're absolutely right", "that's an excellent point",
  'excellent point', 'what a thoughtful question', "i'd be happy to",
  'here is an overview', 'here is a summary', 'here is a breakdown',
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
];

// Model-specific tics, gated off by default (--gpt / --claude / --gemini).
export const GPT_TICS = [
  'rich tapestry', 'navigating the complexities', 'in the ever-evolving',
  'it is worth noting that', 'plays a crucial role', 'plays a vital role',
  'a testament to', 'underscores the importance', 'sure! here', "here's a",
  'i hope this helps', 'certainly!', 'characterized by', 'it is important to remember',
];

export const CLAUDE_TICS = [
  "i'll help you", "let me", "here's", "i'd be happy to", "great question",
  "i appreciate", "to be clear", "that said,", "it's worth noting that",
  "a few things", "let's break", "i want to make sure", "you're absolutely right",
  "that's a great", "i should note",
];

export const GEMINI_TICS = [
  'the way for', 'the cascade of', 'it is not a', 'it is not just a',
  'paving the way', 'a symphony of', 'in the grand tapestry',
  'plays a significant role', 'it is essential to',
];
