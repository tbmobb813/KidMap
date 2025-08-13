/* eslint-env node */
// Generates an ESLint baseline capturing current violations so only NEW issues fail CI.
const fs = require('fs');
const path = require('path');

const { ESLint } = require('eslint');

(async () => {
    const eslint = new ESLint({ cache: false });
    const results = await eslint.lintFiles(['.']);
    const baseline = [];
    for (const r of results) {
        for (const m of r.messages) {
            if (!m.ruleId) continue; // skip internal parser issues
            baseline.push({
                file: path.relative(process.cwd(), r.filePath).replace(/\\/g, '/'),
                ruleId: m.ruleId,
                line: m.line,
                message: m.message
            });
        }
    }
    const out = { generatedAt: new Date().toISOString(), entries: baseline };
    fs.writeFileSync('.eslint-baseline.json', JSON.stringify(out, null, 2));
    console.log(`Baseline written with ${baseline.length} entries.`);
    console.log('Commit .eslint-baseline.json and use npm run lint:ci to gate on new issues.');
})();
