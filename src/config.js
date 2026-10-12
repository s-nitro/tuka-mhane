// All visible words and a few tunables live here, so you can change
// wording without touching the components.

export const DATA_FILE = 'abhangs.json'; // generated into /public from the /data folder

// How a card's link looks:
//   'path' -> https://you.github.io/repo/p/57   (clean addresses, the default)
//   'hash' -> https://you.github.io/repo/#/57   (the simple fallback)
// If clean links ever misbehave on your site, change this to 'hash'.
export const LINK_STYLE = 'path';
export const LINK_WORD = 'p'; // the letter or word before the number
export const RESULTS_PAGE_SIZE = 40; // search results shown per "show more"

export const TEXT = {
  title: 'तुकाराम गाथा',
  abhangWord: 'अभंग',
  meaningTitle: 'अर्थ',
  meaningMissing: 'या अभंगाचा अर्थ अजून उपलब्ध नाही.',
  searchLabel: 'अभंग शोधा',
  searchPlaceholder: 'शब्द किंवा क्रमांक शोधा',
  clearSearch: 'शोध पुसा',
  noResults: 'काही सापडले नाही. वेगळा शब्द किंवा अभंग क्रमांक वापरून पहा.',
  showMore: 'आणखी दाखवा',
  prev: 'मागील अभंग',
  next: 'पुढील अभंग',
  loading: 'अभंग लोड होत आहेत…',
  loadError: 'अभंग लोड करता आले नाहीत. पान पुन्हा उघडून पहा.',
  empty: 'अभंग फाइलमध्ये एकही अभंग सापडला नाही.',
};

export const resultsCount = (n) => `${n} निकाल`;
