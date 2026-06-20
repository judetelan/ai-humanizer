/**
 * ai-humanizer — shared text utilities. Used by both engines and the orchestrator.
 */

/** Strip HTML and markdown to prose. Newlines preserved so line numbers hold. */
export function toText(raw) {
  return raw
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>\n]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&[a-z]+;/gi, ' ')
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/`[^`\n]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/[*_~>]/g, ' ');
}

export function splitSentences(text) {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z("“'])/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).filter(Boolean).length >= 3);
}

export function splitParagraphs(text) {
  return text.split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p.split(/\s+/).length >= 8);
}

export function lineOf(raw, index) {
  if (index == null || index < 0) return 0;
  return raw.slice(0, index).split('\n').length;
}

export function finding(id, severity, message, line, sample, count) {
  return { id, severity, message, line: line || 0, sample: sample || '', count: count || 1 };
}

export function sampleAround(text, index, len) {
  return text.slice(Math.max(0, index - 14), Math.min(text.length, index + len + 14))
    .replace(/\s+/g, ' ').trim();
}

export function isWordBoundary(text, index, phrase) {
  const before = index === 0 ? ' ' : text[index - 1];
  const after = text[index + phrase.length] ?? ' ';
  const wb = /[A-Za-z0-9]/;
  return !wb.test(before) && (!wb.test(after) || /\s/.test(after) || phrase.includes(' '));
}

/** All case-insensitive occurrences of any phrase in `phrases`. */
export function countPhrases(text, phrases, { wordBoundary = false } = {}) {
  const lower = text.toLowerCase();
  const hits = [];
  for (const p of phrases) {
    let from = 0;
    while (true) {
      const idx = lower.indexOf(p, from);
      if (idx === -1) break;
      if (!wordBoundary || isWordBoundary(text, idx, p)) hits.push({ phrase: p, index: idx });
      from = idx + p.length;
    }
  }
  return hits.sort((a, b) => a.index - b.index);
}
