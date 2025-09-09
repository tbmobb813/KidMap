const fs = require('fs');
const path = require('path');

const indexPath = path.join(process.cwd(), '_tests_', 'test-index.json');
if (!fs.existsSync(indexPath)) {
    console.error('Missing test index at', indexPath);
    process.exit(1);
}

const raw = fs.readFileSync(indexPath, 'utf8');
const index = JSON.parse(raw);

function inferSubject(entry) {
    if (entry.describes && entry.describes.length) return entry.describes[0].trim();
    // fallback: look for a components import pattern
    const comp = (entry.imports || []).find(i => /components\/?[A-Za-z]/.test(i));
    if (comp) {
        // try to extract last path segment
        const parts = comp.split('/').filter(Boolean);
        const last = parts[parts.length - 1];
        // strip file extensions or index
        return last.replace(/\.tsx?$|\.js$|\.jsx$/i, '') || comp;
    }
    return '(unknown)';
}

const groups = Object.create(null);
for (const e of index.entries) {
    const subject = inferSubject(e);
    if (!groups[subject]) groups[subject] = [];
    groups[subject].push(e);
}

function scorePath(p) {
    // higher is better
    if (/\\critical\\/.test(p) || /\/critical\//.test(p)) return 100;
    if (/\\core\\/.test(p) || /\/core\//.test(p)) return 50;
    return 10;
}

const plan = {
    generated: new Date().toISOString(),
    groups: [],
};

const actions = [];

for (const [subject, files] of Object.entries(groups).sort()) {
    if (files.length === 1) continue; // no dedupe needed

    // choose canonical: highest scorePath, then largest size
    const sorted = files.slice().sort((a, b) => {
        const sa = scorePath(a.path);
        const sb = scorePath(b.path);
        if (sb !== sa) return sb - sa;
        return b.size - a.size;
    });

    const canonical = sorted[0];
    const duplicates = sorted.slice(1);

    plan.groups.push({
        subject,
        canonical: { path: canonical.path, size: canonical.size, mtime: canonical.mtime },
        duplicates: duplicates.map(d => ({ path: d.path, size: d.size, mtime: d.mtime })),
    });

    actions.push(`Subject: ${subject}`);
    actions.push(`  Canonical: ${canonical.path}  (reason: preferred location / larger file)`);
    for (const d of duplicates) {
        actions.push(`  Duplicate: ${d.path}  -> Suggest: mark as duplicate / merge into canonical`);
    }
    actions.push('');
}

const outJson = path.join(process.cwd(), '_tests_', 'dedupe-plan.json');
fs.writeFileSync(outJson, JSON.stringify(plan, null, 2), 'utf8');

const outMd = path.join(process.cwd(), '_tests_', 'dedupe-actions.md');
fs.writeFileSync(outMd, ['# Dedupe Actions', '', `Generated: ${plan.generated}`, '', ...actions].join('\n'), 'utf8');

console.log('Wrote dedupe plan ->', outJson);
console.log('Wrote dedupe actions ->', outMd);
