// Decides which abhang number the address points to, and changes the address
// when you move to another card. Two styles (see LINK_STYLE in config.js):
//   path:  /repo/p/57
//   hash:  /repo/#/57

import { LINK_STYLE, LINK_WORD } from '../config.js';

const BASE = import.meta.env.BASE_URL; // '/' or '/repo/'
const HASH_RE = /^#\/?[a-zA-Z]*(\d+)/;

const restOfPath = () => {
  const p = window.location.pathname;
  return p.startsWith(BASE) ? p.slice(BASE.length) : p.replace(/^\//, '');
};

// Call once before the app starts.
// 1) The 404 page forwards unknown addresses as  /repo/?r=p/57 ; put the clean
//    address back in the bar.
// 2) Turn an old #/57 style link into the clean address.
export function initRouting() {
  if (LINK_STYLE !== 'path') return;
  const r = new URL(window.location.href).searchParams.get('r');
  if (r !== null) {
    window.history.replaceState(null, '', BASE + r.replace(/^\/+/, ''));
    return;
  }
  const m = window.location.hash.match(HASH_RE);
  if (m && !restOfPath()) {
    window.history.replaceState(null, '', `${BASE}${LINK_WORD}/${m[1]}`);
  }
}

export function readNumber() {
  if (LINK_STYLE === 'hash') {
    const m = window.location.hash.match(HASH_RE);
    return m ? Number(m[1]) : null;
  }
  const m = restOfPath().match(/^[a-zA-Z]+\/(\d+)\/?$/);
  return m ? Number(m[1]) : null;
}

const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());
const eventName = LINK_STYLE === 'hash' ? 'hashchange' : 'popstate';

export function showNumber(number) {
  if (LINK_STYLE === 'hash') {
    window.location.hash = `/${number}`; // fires hashchange by itself
  } else {
    window.history.pushState(null, '', `${BASE}${LINK_WORD}/${number}`);
    notify();
  }
}

export function subscribe(fn) {
  listeners.add(fn);
  window.addEventListener(eventName, notify);
  return () => {
    listeners.delete(fn);
    if (!listeners.size) window.removeEventListener(eventName, notify);
  };
}
