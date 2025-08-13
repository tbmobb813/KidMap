/* eslint-env node */
// Compares current ESLint results against baseline and fails on NEW violations.
const fs = require('fs');
const path = require('path');

const { ESLint } = require('eslint');

function loadBaseline() {
    if (!fs.existsSync('.eslint-baseline.json')) {
        console.error('Missing .eslint-baseline.json. Run npm run lint:baseline first.');
        process.exit(2);
    }
    const raw = JSON.parse(fs.readFileSync('.eslint-baseline.json', 'utf8'));
    const map = new Map();
    for (const e of raw.entries) {
        const key = `${e.file}|${e.ruleId}|${e.message}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(e.line);
    }
    return map;
}

function isBaselineHit(entryMap, file, ruleId, message, line) {
    const key = `${file}|${ruleId}|${message}`;
    const lines = entryMap.get(key);
    if (!lines) return false;
    // Allow small line drift (+/-5)
    return lines.some(l => Math.abs(l - line) <= 5);
}

(async () => {
    const baseline = loadBaseline();
    const eslint = new ESLint({ cache: false });
    const results = await eslint.lintFiles(['.']);
    const newMessages = [];
    let totalCurrent = 0;
    for (const r of results) {
        const relFile = path.relative(process.cwd(), r.filePath).replace(/\\/g, '/');
        for (const m of r.messages) {
            if (!m.ruleId) continue;
            totalCurrent++;
            if (!isBaselineHit(baseline, relFile, m.ruleId, m.message, m.line)) {
                newMessages.push({ file: relFile, rule: m.ruleId, line: m.line, col: m.column, msg: m.message, severity: m.severity });
            }
        }
    }
    if (newMessages.length) {
        console.log(`NEW ESLint issues detected (${newMessages.length}):`);
        for (const n of newMessages.slice(0, 200)) {
            console.log(`${n.severity === 2 ? 'ERROR' : 'WARN '} ${n.file}:${n.line}:${n.col} ${n.rule} - ${n.msg}`);
        }
        if (newMessages.length > 200) console.log('... truncated list ...');
        process.exit(1);
    } else {
        console.log(`No new ESLint issues. (Baseline size: ${baseline.size} unique rule/message/file combos, Current messages: ${totalCurrent})`);
    }
})();
