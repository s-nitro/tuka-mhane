// Merges every .json file inside /data (subfolders included) into
// public/abhangs.json, which is the file the app loads.
// It runs automatically before `npm run dev` and `npm run build`.
//
// A file may hold a list of abhangs  [ {...}, {...} ]  or a single one  { ... }.
// File names and folders are only for your own tidiness; the final order is
// always by abhang number.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'data');
const outFile = path.join(root, 'public', 'abhangs.json');

const fail = (msg) => {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
};

function listJson(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) return listJson(full);
      return e.isFile() && e.name.toLowerCase().endsWith('.json') ? [full] : [];
    })
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
}

if (!fs.existsSync(dataDir)) {
  fail('The "data" folder was not found. Create it and put your abhang .json files inside.');
}
const files = listJson(dataDir);
if (!files.length) fail('No .json files were found inside the "data" folder.');

const byNumber = new Map();
let withoutMeaning = 0;

for (const file of files) {
  const rel = path.relative(root, file);
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
  } catch (err) {
    fail(`${rel} is not valid JSON: ${err.message}`);
  }

  const list = Array.isArray(parsed) ? parsed : [parsed];
  list.forEach((entry, i) => {
    const where = Array.isArray(parsed) ? `${rel} (item ${i + 1})` : rel;
    const number = Number(entry?.number);
    if (!Number.isInteger(number) || number < 1) {
      fail(`${where}: "number" must be a whole number such as 57.`);
    }
    if (typeof entry.text !== 'string' || !entry.text.trim()) {
      fail(`${where}: abhang ${number} has no "text".`);
    }
    if (byNumber.has(number)) {
      fail(`Abhang ${number} appears twice: in ${byNumber.get(number).where} and in ${where}.`);
    }
    const meaning = typeof entry.meaning === 'string' ? entry.meaning : '';
    if (!meaning.trim()) withoutMeaning++;
    byNumber.set(number, { where, entry: { number, text: entry.text, meaning } });
  });
}

const merged = [...byNumber.values()].map((v) => v.entry).sort((a, b) => a.number - b.number);

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(merged));

console.log(
  `✔ Combined ${merged.length} abhang(s) from ${files.length} file(s) into public/abhangs.json ` +
    `(${merged[0].number} to ${merged[merged.length - 1].number})`
);
if (withoutMeaning) console.log(`  note: ${withoutMeaning} abhang(s) have no meaning yet.`);
