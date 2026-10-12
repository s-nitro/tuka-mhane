const DEV_DIGITS = '०१२३४५६७८९';

export const toDevanagari = (n) => String(n).replace(/\d/g, (d) => DEV_DIGITS[d]);

export const toAsciiDigits = (s) =>
  String(s).replace(/[०-९]/g, (d) => String(DEV_DIGITS.indexOf(d)));

// Makes typing forgiving: removes invisible joiners, treats chandrabindu and
// anusvara alike, ignores punctuation and danda marks, collapses spaces.
export function normalize(s) {
  return String(s || '')
    .normalize('NFC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\u0901/g, '\u0902')
    .replace(/[।॥|.,;:!?'"“”‘’()[\]\-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// Removes the stanza markers such as ॥१॥ and ॥ध्रु.॥ so searching for a digit
// does not match every abhang.
const stripMarkers = (s) => String(s || '').replace(/॥[^॥\n]*॥/g, ' ');

// One entry per line of the abhang. `marker` is the trailing ॥१॥ / ॥ध्रु.॥,
// `refrain` is true for the ध्रुवपद line.
export function parseLines(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((raw) => {
      const m = raw.match(/^(.*?)\s*(॥[^॥]*॥)\s*$/);
      return {
        body: m ? m[1] : raw,
        marker: m ? m[2] : '',
        refrain: raw.includes('ध्रु'),
      };
    });
}

// Tidies the meaning text: drops a stray "Tukaram Maharaj Abhang" heading and
// adds the missing space after a full stop ("राहो.आणि" -> "राहो. आणि").
export function meaningParagraphs(meaning) {
  const cleaned = String(meaning || '')
    .replace(/\r/g, '')
    .replace(/^\s*Tukaram Maharaj Abhang\s*/i, '')
    .replace(/\s*\.\s*(?=[\u0900-\u097F“"])/g, '. ')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
  if (!cleaned) return [];
  return cleaned
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, ' ').trim())
    .filter(Boolean);
}

// Turns the raw JSON into sorted, ready-to-search items.
export function prepareAbhangs(raw) {
  const list = Array.isArray(raw) ? raw : [];
  const seen = new Set();
  const items = [];
  for (const r of list) {
    const number = Number(r?.number);
    if (!Number.isFinite(number) || !r?.text || seen.has(number)) continue;
    const lines = parseLines(r.text);
    if (!lines.length) continue;
    seen.add(number);
    const paragraphs = meaningParagraphs(r.meaning);
    items.push({
      number,
      lines,
      paragraphs,
      textKey: normalize(stripMarkers(r.text)),
      meaningKey: normalize(paragraphs.join(' ')),
    });
  }
  items.sort((a, b) => a.number - b.number);
  return items;
}

// Digits only  -> abhang numbers that start with them (exact match first).
// Words        -> every word must appear; abhang text matches come first,
//                 then matches found only in the meaning.
export function search(items, rawQuery) {
  const q = toAsciiDigits(String(rawQuery || '').trim());
  if (!q) return [];

  if (/^\d+$/.test(q)) {
    return items
      .filter((it) => String(it.number).startsWith(q))
      .sort(
        (a, b) =>
          Number(String(b.number) === q) - Number(String(a.number) === q) ||
          a.number - b.number
      )
      .map((item) => ({ item, inMeaningOnly: false }));
  }

  const tokens = normalize(q).split(' ').filter(Boolean);
  if (!tokens.length) return [];

  const inText = [];
  const inMeaning = [];
  for (const item of items) {
    let allInText = true;
    let allAnywhere = true;
    for (const t of tokens) {
      const a = item.textKey.includes(t);
      if (!a) allInText = false;
      if (!a && !item.meaningKey.includes(t)) {
        allAnywhere = false;
        break;
      }
    }
    if (allInText) inText.push({ item, inMeaningOnly: false });
    else if (allAnywhere) inMeaning.push({ item, inMeaningOnly: true });
  }
  return [...inText, ...inMeaning];
}
