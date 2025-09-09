const fs = require('fs');
const path = require('path');

const mergePath = path.join(process.cwd(), '_tests_', 'dedupe-merge.json');
const dupDir = path.join(process.cwd(), '_tests_', 'duplicates');
if (!fs.existsSync(mergePath)) {
  console.error('Missing dedupe-merge.json');
  process.exit(1);
}
if (!fs.existsSync(dupDir)) {
  console.error('Missing _tests_/duplicates folder');
  process.exit(1);
}

const merge = JSON.parse(fs.readFileSync(mergePath, 'utf8'));

const outDiscard = path.join(dupDir, 'discardable');
const outMerge = path.join(dupDir, 'mergeable');
if (!fs.existsSync(outDiscard)) fs.mkdirSync(outDiscard, { recursive: true });
if (!fs.existsSync(outMerge)) fs.mkdirSync(outMerge, { recursive: true });

const moved = [];
const missing = [];

function dupNameFromPath(p) {
  return p.replace(/^_tests_[\\/]/, '').replace(/[\\/]/g, '__');
}

for (const g of merge.groups) {
  for (const d of g.duplicates) {
    const name = dupNameFromPath(d.path);
    const src = path.join(dupDir, name);
    if (!fs.existsSync(src)) {
      // some duplicates may already have been moved with suffixes; try prefix search
      const files = fs.readdirSync(dupDir).filter(f => f.startsWith(name));
      if (files.length === 0) { missing.push(d.path); continue; }
      // pick first
      const src2 = path.join(dupDir, files[0]);
      const dst = (d.status === 'discardable') ? path.join(outDiscard, files[0]) : path.join(outMerge, files[0]);
      fs.renameSync(src2, dst);
      moved.push({ from: src2, to: dst, status: d.status });
      continue;
    }
    const dst = (d.status === 'discardable') ? path.join(outDiscard, name) : path.join(outMerge, name);
    fs.renameSync(src, dst);
    moved.push({ from: src, to: dst, status: d.status });
  }
}

const report = { generated: new Date().toISOString(), moved, missing };
fs.writeFileSync(path.join(process.cwd(), '_tests_', 'duplicates-relocate-report.json'), JSON.stringify(report, null, 2), 'utf8');
fs.writeFileSync(path.join(process.cwd(), '_tests_', 'duplicates-relocate-report.md'), ['# Duplicates Relocate Report', '', `Generated: ${report.generated}`, '', '## Moved', '', ...moved.map(m => `- ${m.from} -> ${m.to} (${m.status})`), '', '## Missing', '', ...missing.map(m => `- ${m}`)].join('\n'), 'utf8');

console.log('Moved:', moved.length, 'Missing:', missing.length);
for (const m of moved) console.log('  ', m.from, '->', m.to, m.status);
if (missing.length) { console.log('Missing:', missing.length); for (const s of missing) console.log('  ', s); }
