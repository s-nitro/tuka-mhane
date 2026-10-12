import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { RESULTS_PAGE_SIZE, TEXT, resultsCount } from '../config.js';
import { search, toDevanagari } from '../lib/text.js';
import { CloseIcon, SearchIcon } from './Icons.jsx';

const snippet = (s) => (s.length > 110 ? `${s.slice(0, 110)}…` : s);

export default function SearchBox({ items, onSelect, inputRef }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [limit, setLimit] = useState(RESULTS_PAGE_SIZE);
  const wrapRef = useRef(null);
  const panelRef = useRef(null);

  const deferredQuery = useDeferredValue(query);
  const results = useMemo(() => search(items, deferredQuery), [items, deferredQuery]);

  useEffect(() => setLimit(RESULTS_PAGE_SIZE), [deferredQuery]);

  // Close the panel when tapping or clicking anywhere outside the search box.
  useEffect(() => {
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, []);

  const showPanel = open && query.trim() !== '';

  const choose = (number) => {
    onSelect(number);
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  const onInputKey = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter' && results[0]) {
      choose(results[0].item.number);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      panelRef.current?.querySelector('button.result')?.focus();
    }
  };

  const onPanelKey = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.focus();
      return;
    }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const buttons = [...panelRef.current.querySelectorAll('button.result')];
    const i = buttons.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') buttons[Math.min(i + 1, buttons.length - 1)]?.focus();
    else if (i <= 0) inputRef.current?.focus();
    else buttons[i - 1].focus();
  };

  return (
    <div className="search" ref={wrapRef} role="search">
      <div className="search-field">
        <span className="search-icon">
          <SearchIcon />
        </span>
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          spellCheck={false}
          value={query}
          placeholder={TEXT.searchPlaceholder}
          aria-label={TEXT.searchLabel}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onInputKey}
        />
        {query && (
          <button
            type="button"
            className="search-clear"
            aria-label={TEXT.clearSearch}
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {showPanel && (
        <div className="results" ref={panelRef} onKeyDown={onPanelKey}>
          {results.length === 0 ? (
            <p className="results-empty">{TEXT.noResults}</p>
          ) : (
            <>
              <p className="results-count" aria-live="polite">
                {resultsCount(toDevanagari(results.length))}
              </p>
              <ul>
                {results.slice(0, limit).map(({ item, inMeaningOnly }) => (
                  <li key={item.number}>
                    <button type="button" className="result" onClick={() => choose(item.number)}>
                      <span className="result-no">{toDevanagari(item.number)}</span>
                      <span className="result-body">
                        <span className="result-line">{item.lines[0].body}</span>
                        {inMeaningOnly && item.paragraphs[0] && (
                          <span className="result-snippet">{snippet(item.paragraphs[0])}</span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {results.length > limit && (
                <button type="button" className="more" onClick={() => setLimit((l) => l + RESULTS_PAGE_SIZE)}>
                  {TEXT.showMore}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
