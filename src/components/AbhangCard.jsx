import { TEXT } from '../config.js';
import { toDevanagari } from '../lib/text.js';

export default function AbhangCard({ item, direction }) {
  const number = toDevanagari(item.number);
  const meaningId = `meaning-${item.number}`;

  return (
    <article className="card" data-dir={direction}>
      <div className="card-scroll" tabIndex={0}>
        <div className="card-body">
          <div className="flag" aria-hidden="true">
            <span className="flag-label">{TEXT.abhangWord}</span>
            <span className="flag-number">{number}</span>
          </div>
          <h2 className="sr-only">
            {TEXT.abhangWord} {number}
          </h2>

          <div className="abhang">
            {item.lines.map((line, i) => (
              <p key={i} className={line.refrain ? 'abhang-line refrain' : 'abhang-line'}>
                {line.body}
                {line.marker && <span className="marker">{line.marker}</span>}
              </p>
            ))}
          </div>

          <section className="meaning" aria-labelledby={meaningId}>
            <h3 id={meaningId} className="meaning-title">
              {TEXT.meaningTitle}
            </h3>
            {item.paragraphs.length ? (
              item.paragraphs.map((p, i) => <p key={i}>{p}</p>)
            ) : (
              <p className="meaning-missing">{TEXT.meaningMissing}</p>
            )}
          </section>
        </div>
      </div>
    </article>
  );
}
