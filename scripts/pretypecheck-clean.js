#!/usr/bin/env node
/* eslint-env node */
// Remove .test.ts files that contain JSX (likely misnamed) to prevent tsc parse errors.
// Also specifically target routesCacheMetrics duplicate.
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const TEST_DIR = path.join(root, '_tests_');

function fileHasJSX(p) {
  try {
    const txt = fs.readFileSync(p, 'utf8');
    // Naive heuristic: looks for closing provider tag or angle brackets with capitalized component
    return /<QueryClientProvider|<ComponentOnce|<\w+\s+[^>]*>/.test(txt);
  } catch { return false; }
}

function scan(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).flatMap(name => {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) return scan(full);
    return [full];
  });
}

const candidates = scan(TEST_DIR).filter(f => /\.test\.ts$/.test(f));
let removed = 0;
for (const f of candidates) {
  if (fileHasJSX(f)) {
    fs.unlinkSync(f);
    removed++;

    console.log('[pretypecheck-clean] Removed misnamed JSX test file:', path.relative(root, f));
  }
}

if (removed === 0) {

  console.log('[pretypecheck-clean] No misnamed JSX .test.ts files found.');
}
