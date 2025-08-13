#!/usr/bin/env node
/* eslint-env node */
/**
 * Codemod: replace inline hex color literals in StyleSheet.create / style objects
 * with theme token placeholders (TODO: map actual palette later).
 * - Scans .tsx/.ts in provided paths (default: components, app, src)
 * - For each hex (#...): wraps with a TODO constant or replaces with theme.colors.placeholder
 */
const fs = require('fs');
const path = require('path');

const TARGET_DIRS = process.argv.slice(2);
const DEFAULT_DIRS = ['components', 'app', 'src'];
const dirs = TARGET_DIRS.length ? TARGET_DIRS : DEFAULT_DIRS;

const HEX = /#[0-9a-fA-F]{3,8}\b/g;

function walk(dir, acc = []) {
    if (!fs.existsSync(dir)) return acc;
    for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) walk(full, acc); else if (/\.(tsx?|jsx?)$/.test(entry)) acc.push(full);
    }
    return acc;
}

function transform(file) {
    let src = fs.readFileSync(file, 'utf8');
    if (!HEX.test(src)) return false; // no change
    HEX.lastIndex = 0;
    let changed = false;
    src = src.replace(HEX, (m) => {
        changed = true;
        return `/*TODO theme*/ theme.colors.placeholder /*${m}*/`;
    });
    if (changed) {
        // Ensure theme is imported if not.
        if (!/useTheme\(/.test(src) && !/theme\.colors/.test(src)) {
            // naive inject at top
            src = `// FIXME: injected theme placeholder import\n` + src;
        }
        fs.writeFileSync(file, src, 'utf8');
    }
    return changed;
}

let modified = 0;
for (const d of dirs) {
    const files = walk(d);
    for (const f of files) if (transform(f)) modified++;
}
console.log(`Color literal codemod complete. Modified files: ${modified}`);
