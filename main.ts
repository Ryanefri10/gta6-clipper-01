// gta6-clipper-01 entry — Node 22+, standard library only.
// The entry itself is the YouTube clip; this program's whole job is to hand
// the grader the video's address: read VIDEO.json from the bot directory and
// copy it byte for byte into the output directory. No network, no wall clock,
// no files outside those two directories, so two runs write the same bytes.

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const botDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function fail(msg: string): never {
  console.error(`main.ts: ${msg}`);
  process.exit(1);
  throw new Error(msg); // unreachable; satisfies `never` without @types/node
}

const src = join(botDir, 'VIDEO.json');
let raw: string;
try {
  raw = readFileSync(src, 'utf8');
} catch (e) {
  fail(`cannot read ${src}: ${(e as Error).message}`);
}

// Validate the shape the gate expects before handing it on: a JSON object
// with a non-empty url string. The placeholder address passes this check;
// the house refuses it later, on purpose, until the real address replaces it.
let doc: unknown;
try {
  doc = JSON.parse(raw);
} catch (e) {
  fail(`VIDEO.json is not valid JSON: ${(e as Error).message}`);
}
if (doc === null || typeof doc !== 'object' || Array.isArray(doc)) {
  fail('VIDEO.json must be a JSON object');
}
const url = (doc as Record<string, unknown>).url;
if (typeof url !== 'string' || url.trim().length === 0) {
  fail('VIDEO.json must carry a non-empty "url" string');
}

const dst = join(outDir, 'VIDEO.json');
mkdirSync(outDir, { recursive: true });
copyFileSync(src, dst);
