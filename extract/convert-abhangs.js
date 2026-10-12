import fs from "node:fs";

const INPUT_FILE = "abhang-input.txt";
const OUTPUT_FILE = "tukaram_abhangs.json";

function normalizeDigits(text) {
  return text.replace(/[०-९]/g, (d) => String("०१२३४५६७८९".indexOf(d)));
}

function parseAbhangs(input) {
  // Supports headings such as:
  // अभंग क्र.१
  // अभंग क्र. १
  // अभंग क्र.101
  const headingRegex = /^[ \t]*अभंग\s*क्र\.?\s*([०-९0-9]+)[^\r\n]*$/gm;

  const headings = [...input.matchAll(headingRegex)];
  const results = [];
  const seen = new Set();

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i];
    const number = Number(normalizeDigits(heading[1]));

    if (!Number.isInteger(number) || number < 1) continue;

    const start = heading.index + heading[0].length;
    const end = headings[i + 1]?.index ?? input.length;

    let section = input.slice(start, end).trim();

    // Remove an optional repeated title.
    section = section
      .replace(/^[ \t]*Tukaram Maharaj Abhang[ \t]*\r?\n?/i, "")
      .trim();

    // Split poem and meaning at अर्थ:-, अर्थ:, or अर्थः
    const meaningRegex = /^[ \t]*अर्थ[ \t]*[:：-]*[ \t]*/m;
    const match = meaningRegex.exec(section);

    let text = section;
    let meaning = "";

    if (match) {
      text = section.slice(0, match.index).trim();
      meaning = section.slice(match.index + match[0].length).trim();
    }

    // Ignore accidental duplicate numbering.
    if (seen.has(number)) {
      console.warn(`Warning: duplicate abhang number ${number}`);
    }
    seen.add(number);

    results.push({
      number,
      text,
      meaning,
      source: "user-provided",
    });
  }

  return results.sort((a, b) => a.number - b.number);
}

function main() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`Cannot find ${INPUT_FILE}`);
    console.error("Create the file and paste your abhangs into it.");
    process.exitCode = 1;
    return;
  }

  const input = fs.readFileSync(INPUT_FILE, "utf8");
  const abhangs = parseAbhangs(input);

  if (abhangs.length === 0) {
    console.error("No abhang headings found.");
    console.error("Use the format: अभंग क्र.१");
    process.exitCode = 1;
    return;
  }

  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(abhangs, null, 2) + "\n",
    "utf8",
  );

  const missingText = abhangs.filter((a) => !a.text).map((a) => a.number);

  const missingMeaning = abhangs.filter((a) => !a.meaning).map((a) => a.number);

  console.log("\nJSON created successfully!");
  console.log(`File: ${OUTPUT_FILE}`);
  console.log(`Total abhangs: ${abhangs.length}`);

  if (missingText.length) {
    console.log("Missing poem text:", missingText.join(", "));
  }

  if (missingMeaning.length) {
    console.log("Missing meaning:", missingMeaning.join(", "));
  }
}

/***
 * PS D:\repos\tuka-mhane\extract> node convert-abhangs.js

JSON created successfully!
File: tukaram_abhangs.json
Total abhangs: 100
PS D:\repos\tuka-mhane\extract> 
 */

main();
