const fs = require('fs');
const path = require('path');

const indexPath = path.join(process.cwd(), '_tests_', 'test-index.json');
if (!fs.existsSync(indexPath)) {
    console.error('Missing test index at', indexPath);
    process.exit(1);
}

const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

const outDirs = {
    critical: path.join(process.cwd(), '_tests_', 'critical'),
    core: path.join(process.cwd(), '_tests_', 'core'),
    infra: path.join(process.cwd(), '_tests_', 'infra'),
    misc: path.join(process.cwd(), '_tests_', 'misc'),
};
for (const d of Object.values(outDirs)) if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });

function decideCategory(e) {
    const imports = (e.imports || []).join(' ');
    const desc = (e.describes || []).join(' ');

    // critical heuristics
    if (/@tanstack\/react-query|@\/services|@\/telemetry|@\/modules\/safety|routeService|routesCache|Telemetry|useSafeZoneMonitor|routeService.fetchRoutes/i.test(imports + ' ' + desc + ' ' + e.path)) {
        return 'critical';
    }

    // core heuristics: component UI tests
    if (/@\/components|\.\.\/\.\.\/components|\.\.\/components|components\//.test(imports + ' ' + e.path)) return 'core';
    if (/components[\\/]/i.test(e.path)) return 'core';

    // infra heuristics: utils, hooks, constants, stores
    if (/\\utils\\|\/utils\/|\\hooks\\|\/hooks\/|\\constants\\|\/constants\/|\\stores\\|\/stores\//i.test(e.path + ' ' + imports)) return 'infra';

    return 'misc';
}

const moved = [];
const skipped = [];

for (const e of index.entries) {
    // skip duplicates folder entries
    if (/^_tests_[\\/](duplicates|duplicates\\)/.test(e.path)) continue;

    // already in target folders? skip
    if (/^_tests_[\\/](critical|core|infra|misc)[\\/]/.test(e.path)) continue;

    const cat = decideCategory(e);
    const src = path.join(process.cwd(), e.path);
    if (!fs.existsSync(src)) {
        skipped.push({ path: e.path, reason: 'missing' });
        continue;
    }

    const base = path.basename(e.path);
    let dst = path.join(outDirs[cat], base);
    let i = 1;
    while (fs.existsSync(dst)) {
        // if identical content, skip moving
        const existing = fs.readFileSync(dst, 'utf8');
        const current = fs.readFileSync(src, 'utf8');
        if (existing === current) {
            skipped.push({ path: e.path, reason: 'duplicate content exists at destination' });
            dst = null;
            break;
        }
        const ext = path.extname(base);
        const name = base.slice(0, -ext.length);
        dst = path.join(outDirs[cat], `${name}.${i}${ext}`);
        i += 1;
    }
    if (!dst) continue;

    try {
        fs.renameSync(src, dst);
        moved.push({ from: e.path, to: path.relative(process.cwd(), dst), category: cat });
    } catch (err) {
        skipped.push({ path: e.path, reason: String(err) });
    }
}

const report = { generated: new Date().toISOString(), moved, skipped };
fs.writeFileSync(path.join(process.cwd(), '_tests_', 'move-report.json'), JSON.stringify(report, null, 2), 'utf8');

const md = [];
md.push('# Move Report');
md.push('');
md.push(`Generated: ${report.generated}`);
md.push('');
md.push('## Moved');
for (const m of moved) md.push(`- ${m.from} -> ${m.to} (${m.category})`);
md.push('');
md.push('## Skipped');
for (const s of skipped) md.push(`- ${s.path}  (reason: ${s.reason})`);
fs.writeFileSync(path.join(process.cwd(), '_tests_', 'move-actions.md'), md.join('\n'), 'utf8');

console.log(`Moved: ${moved.length}, Skipped: ${skipped.length}`);
for (const m of moved) console.log(' Moved:', m.from, '->', m.to);
for (const s of skipped) console.log(' Skipped:', s.path, s.reason);
