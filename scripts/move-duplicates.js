const fs = require('fs');
const path = require('path');

const planPath = path.join(process.cwd(), '_tests_', 'dedupe-plan.json');
if (!fs.existsSync(planPath)) {
    console.error('Missing dedupe plan at', planPath);
    process.exit(1);
}

const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
const outDir = path.join(process.cwd(), '_tests_', 'duplicates');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const moved = [];
const skipped = [];

for (const g of plan.groups) {
    for (const d of g.duplicates) {
        const src = path.join(process.cwd(), d.path);
        if (!fs.existsSync(src)) {
            skipped.push({ src, reason: 'missing' });
            continue;
        }
        // create a safe dst name by removing leading _tests_\ and replacing separators
        const rel = d.path.replace(/^_tests_[\\/]/, '');
        const safeName = rel.replace(/[\\/]/g, '__');
        const dst = path.join(outDir, safeName);
        try {
            // if dst exists, add a numeric suffix
            let finalDst = dst;
            let i = 1;
            while (fs.existsSync(finalDst)) {
                const ext = path.extname(dst);
                const base = dst.slice(0, -ext.length);
                finalDst = `${base}.${i}${ext}`;
                i += 1;
            }
            fs.renameSync(src, finalDst);
            moved.push({ from: src, to: finalDst });
        } catch (err) {
            skipped.push({ src, reason: String(err) });
        }
    }
}

console.log('Moved:', moved.length);
for (const m of moved) console.log('  ', m.from, '->', m.to);
if (skipped.length) {
    console.log('Skipped:', skipped.length);
    for (const s of skipped) console.log('  ', s.src, s.reason);
}
