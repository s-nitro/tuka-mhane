# तुकाराम गाथा: abhang cards

One abhang per full-page card (number, abhang text, then meaning), with
left/right arrows, keyboard arrows, swipe on phones, and search.

## Run it on your computer

```bash
npm install
npm run dev        # local preview (restart it after you change files in /data)
npm run build      # makes the finished site in /dist
```

You need Node.js 18 or newer.

## Your data: the `data/` folder

Put your abhangs in any number of `.json` files inside `data/`. Subfolders are
fine. Before every `npm run dev` and `npm run build` (and on GitHub, when it
publishes), `scripts/combine-data.js` merges them all into
`public/abhangs.json`. That generated file is not committed; do not edit it.

Ways to organise 4000 abhangs. Pick whichever you like, or mix them:

```
data/001-100.json        a list of 100 abhangs
data/101-200.json
data/extra/0257.json     or one abhang per file
```

A file holds either a list `[ {...}, {...} ]` or a single `{ ... }`:

```json
{ "number": 57, "text": "…lines of the abhang…", "meaning": "…" }
```

- `number`: whole number. It may skip numbers; arrows follow the sorted order.
- `text`: one line per abhang line (`\r\n` or `\n`). A line ending with `॥१॥`
  or `॥ध्रु.॥` shows that marker styled; the `ध्रु.` line gets the gold rule.
- `meaning`: plain text. Empty is allowed ("अर्थ अजून उपलब्ध नाही" is shown).
- Other fields are ignored. File names and order do not matter.

The combine step stops with a clear message if a file is not valid JSON, an
abhang has no number or text, or the same number appears in two places (it
tells you which two files).

The app also tidies on display: it removes a leading "Tukaram Maharaj Abhang"
line from `meaning` and adds the missing space after a full stop. Fixing these
in the JSON is still best.

## Links to a card

Every card has its own clean link: `https://<you>.github.io/<repo>/p/57`
opens abhang 57. The word before the number is `LINK_WORD` in `src/config.js`.

GitHub Pages only serves real files, so a visitor who opens such a link
directly first lands on a tiny `404.html` page (made automatically by
`scripts/write-404.js`) that forwards them into the app and restores the clean
address. Moving between cards inside the app, back and forward, reload and
sharing all work normally. Old `#/57` links are converted to the clean form.

Prefer the simple style? In `src/config.js` change `LINK_STYLE` from `'path'`
to `'hash'`. Links then look like `.../#/57`, with no 404 page involved.

## Search

Type a word (it looks in the abhang first, then in the meaning) or a number
(Devanagari or English digits). Everything is searched in the browser, so no
server is needed. 4000 abhangs is fine, and GitHub Pages compresses the file.

Shortcuts: `←` `→` change the card, `/` jumps to search, `Esc` closes results.

## Put it on GitHub Pages

1. Create a GitHub repository and push this folder to the `main` branch.
2. In the repository open **Settings → Pages** and set **Source** to
   **GitHub Actions**.
3. Push again (or run the workflow from the **Actions** tab). The included
   workflow in `.github/workflows/deploy.yml` builds and publishes the site.
   It also works out the site's folder name (`/<repo>/`) on its own.

Using your own domain (for example `gatha.example.com`)? The site then lives at
the root, so in the workflow change the line `echo "BASE_PATH=/$REPO/"` to
`echo "BASE_PATH=/"`.

## Change the wording or look

- Words on screen (title, buttons, messages) and the link letter: `src/config.js`
- Colours, fonts, spacing: top of `src/styles.css`
- Fonts (Tiro Devanagari Marathi and Mukta) load from Google Fonts in `index.html`.
