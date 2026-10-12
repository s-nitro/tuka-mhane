import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DATA_FILE, TEXT } from './config.js';
import { readNumber, showNumber, subscribe } from './lib/router.js';
import { prepareAbhangs, toDevanagari } from './lib/text.js';
import AbhangCard from './components/AbhangCard.jsx';
import SearchBox from './components/SearchBox.jsx';
import { ChevronLeft, ChevronRight } from './components/Icons.jsx';

// The address bar is the single source of truth: /p/12 shows abhang 12.
// That makes every card linkable, and the browser back button just works.

export default function App() {
  const [items, setItems] = useState(null);
  const [failed, setFailed] = useState(false);
  const [routeNumber, setRouteNumber] = useState(readNumber);
  const prevIndex = useRef(0);
  const searchInput = useRef(null);
  const touchStart = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.BASE_URL}${DATA_FILE}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((raw) => {
        if (!cancelled) setItems(prepareAbhangs(raw));
      })
      .catch((err) => {
        console.error('Could not load abhangs:', err);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return subscribe(() => setRouteNumber(readNumber()));
  }, []);

  const indexByNumber = useMemo(() => {
    const map = new Map();
    (items || []).forEach((it, i) => map.set(it.number, i));
    return map;
  }, [items]);

  const total = items ? items.length : 0;
  const index = total ? indexByNumber.get(routeNumber) ?? 0 : 0;
  const current = total ? items[index] : null;

  const direction = index >= prevIndex.current ? 'next' : 'prev';
  useEffect(() => {
    prevIndex.current = index;
  }, [index]);

  const goToIndex = useCallback(
    (i) => {
      if (items && i >= 0 && i < items.length) showNumber(items[i].number);
    },
    [items]
  );

  // Left / right arrow keys change the card; "/" jumps to search.
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
      if (e.key === 'ArrowLeft') goToIndex(index - 1);
      else if (e.key === 'ArrowRight') goToIndex(index + 1);
      else if (e.key === '/') {
        e.preventDefault();
        searchInput.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, goToIndex]);

  // Swipe left for the next abhang, right for the previous one.
  const onTouchStart = (e) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.8) {
      goToIndex(index + (dx < 0 ? 1 : -1));
    }
  };

  return (
    <div className="app">
      <header className="bar">
        <h1 className="brand">{TEXT.title}</h1>
        <SearchBox items={items || []} onSelect={showNumber} inputRef={searchInput} />
      </header>

      <main className="stage">
        {failed && (
          <p className="notice" role="alert">
            {TEXT.loadError}
          </p>
        )}
        {!failed && !items && (
          <p className="notice" role="status">
            {TEXT.loading}
          </p>
        )}
        {items && total === 0 && <p className="notice">{TEXT.empty}</p>}

        {current && (
          <>
            <button
              type="button"
              className="arrow arrow-prev"
              aria-label={TEXT.prev}
              disabled={index === 0}
              onClick={() => goToIndex(index - 1)}
            >
              <ChevronLeft />
            </button>

            <div className="card-slot" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              <AbhangCard key={current.number} item={current} direction={direction} />
            </div>

            <button
              type="button"
              className="arrow arrow-next"
              aria-label={TEXT.next}
              disabled={index === total - 1}
              onClick={() => goToIndex(index + 1)}
            >
              <ChevronRight />
            </button>

            <p className="count" aria-live="polite">
              {toDevanagari(index + 1)} / {toDevanagari(total)}
            </p>
          </>
        )}
      </main>
    </div>
  );
}
