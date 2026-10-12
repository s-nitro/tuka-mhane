const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export const ChevronLeft = () => (
  <svg {...base}><path d="M15 5l-7 7 7 7" /></svg>
);

export const ChevronRight = () => (
  <svg {...base}><path d="M9 5l7 7-7 7" /></svg>
);

export const SearchIcon = () => (
  <svg {...base} width="20" height="20"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
);

export const CloseIcon = () => (
  <svg {...base} width="18" height="18"><path d="M6 6l12 12M18 6L6 18" /></svg>
);
