/* eslint-env node */
// Aggregates ESLint rule violation counts to prioritize cleanup.
const { ESLint } = require('eslint');

(async () => {
    const eslint = new ESLint({ cache: false });
    const results = await eslint.lintFiles(['.']);
    const counts = {};
    let totalErrors = 0;
    let totalWarnings = 0;
    for (const r of results) {
        for (const m of r.messages) {
            const id = m.ruleId || '___internal';
            if (!counts[id]) counts[id] = { errors: 0, warnings: 0 };
            if (m.severity === 2) { counts[id].errors++; totalErrors++; } else if (m.severity === 1) { counts[id].warnings++; totalWarnings++; }
        }
    }
    const scored = Object.entries(counts).map(([rule, c]) => ({ rule, errors: c.errors, warnings: c.warnings, score: c.errors * 2 + c.warnings }));
    scored.sort((a, b) => b.score - a.score);
    console.log(`Total errors: ${totalErrors}  Total warnings: ${totalWarnings}`);
    console.log('\nTop 30 offending rules (score = errors*2 + warnings):');
    console.table(scored.slice(0, 30));
})();
