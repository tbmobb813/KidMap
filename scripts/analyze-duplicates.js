const fs = require('fs');
const path = require('path');

const indexPath = path.join(process.cwd(), '_tests_', 'test-index.json');
const planPath = path.join(process.cwd(), '_tests_', 'dedupe-plan.json');

if (!fs.existsSync(indexPath) || !fs.existsSync(planPath)) {
  console.error('Missing index or plan');
  process.exit(1);
}

const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));

const byPath = new Map(index.entries.map(e => [e.path.replace(/\\/g, '/'), e]));

function normPath(p) { return p.replace(/\\/g, '/'); }

const report = { generated: new Date().toISOString(), summary: { totalSubjects: plan.groups.length, totalDuplicates: 0 }, groups: [] };

for (const g of plan.groups) {
  const canonicalPath = normPath(g.canonical.path);
  const canonical = byPath.get(canonicalPath) || null;
  const group = { subject: g.subject, canonical: g.canonical, duplicates: [] };
  for (const d of g.duplicates) {
    report.summary.totalDuplicates += 1;
    const dupPath = normPath(d.path);
    const dup = byPath.get(dupPath) || null;
    if (!dup || !canonical) {
      group.duplicates.push({ path: d.path, status: 'missing-index', note: 'index entry or canonical missing' });
      continue;
    }

    const dupDes = new Set((dup.describes || []).map(s => s.trim()));
    const canDes = new Set((canonical.describes || []).map(s => s.trim()));
    const dupImp = new Set((dup.imports || []).map(s => s.trim()));
    const canImp = new Set((canonical.imports || []).map(s => s.trim()));

    // helper functions
    const isSubset = (a,b) => { for (const x of a) if (!b.has(x)) return false; return true; };

    const identicalSize = dup.size === canonical.size;

    let status = 'manual_review';
    let reason = [];

    if (identicalSize) {
      status = 'discardable';
      reason.push('same file size');
    }

    if (isSubset(dupDes, canDes) && isSubset(dupImp, canImp)) {
      status = 'discardable';
      reason.push('describes+imports subset of canonical');
    } else if (isSubset(canDes, dupDes) || isSubset(canImp, dupImp)) {
      status = 'mergeable';
      reason.push('canonical subset of duplicate (mergeable)');
    } else {
      // if overlap >50% in describes or imports, mark mergeable
      const desOverlap = [...dupDes].filter(x => canDes.has(x)).length;
      const impOverlap = [...dupImp].filter(x => canImp.has(x)).length;
      if ((desOverlap > 0 && desOverlap / Math.max(1, dupDes.size) >= 0.5) || (impOverlap > 0 && impOverlap / Math.max(1, dupImp.size) >= 0.5)) {
        status = 'mergeable';
        reason.push('partial overlap -> mergeable');
      }
    }

    group.duplicates.push({ path: d.path, status, reason, dup: { describes: dup.describes, imports: dup.imports, size: dup.size }, canonical: { describes: canonical.describes, imports: canonical.imports, size: canonical.size } });
  }
  report.groups.push(group);
}

// produce summary counts
const counts = { discardable:0, mergeable:0, manual_review:0, missing_index:0 };
for (const g of report.groups) for (const d of g.duplicates) counts[d.status] = (counts[d.status]||0)+1;
report.summary.counts = counts;

fs.writeFileSync(path.join(process.cwd(), '_tests_', 'dedupe-merge.json'), JSON.stringify(report, null, 2), 'utf8');

const lines = [];
lines.push('# Dedupe Merge Report');
lines.push(`Generated: ${report.generated}`);
lines.push('');
lines.push('## Summary');
lines.push(`- Subjects: ${report.summary.totalSubjects}`);
lines.push(`- Duplicate files analyzed: ${report.summary.totalDuplicates}`);
lines.push(`- Counts: ${JSON.stringify(report.summary.counts)}`);
lines.push('');
for (const g of report.groups) {
  lines.push(`### Subject: ${g.subject}`);
  lines.push(`Canonical: ${g.canonical.path}`);
  for (const d of g.duplicates) {
    lines.push(`- ${d.path}  => ${d.status}  ${d.reason ? `(${d.reason.join('; ')})` : ''}`);
  }
  lines.push('');
}

fs.writeFileSync(path.join(process.cwd(), '_tests_', 'dedupe-merge.md'), lines.join('\n'), 'utf8');

console.log('Wrote dedupe-merge.json and dedupe-merge.md');
