// Writes public/404.html. GitHub Pages shows this page for any address that
// is not a real file (such as /repo/p/57). It forwards the visitor to the app,
// which then restores the clean address. Runs before dev and build.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let base = process.env.BASE_PATH || '/';
if (!base.startsWith('/')) base = `/${base}`;
if (!base.endsWith('/')) base = `${base}/`;

const html = `<!doctype html>
<html lang="mr">
  <head>
    <meta charset="UTF-8" />
    <title>तुकाराम गाथा</title>
    <script>
      var base = ${JSON.stringify(base)};
      var p = location.pathname;
      var rest = p.indexOf(base) === 0 ? p.slice(base.length) : p.replace(/^\\//, '');
      location.replace(base + '?r=' + encodeURIComponent(rest) + location.hash);
    </script>
  </head>
  <body></body>
</html>
`;

fs.mkdirSync(path.join(root, 'public'), { recursive: true });
fs.writeFileSync(path.join(root, 'public', '404.html'), html);
console.log(`✔ Wrote public/404.html (site base path: ${base})`);
