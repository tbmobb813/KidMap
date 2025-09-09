const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const TEST_DIR = path.join(ROOT, '_tests_');
const OUT_JSON = path.join(TEST_DIR, 'test-index.json');
const OUT_CSV = path.join(TEST_DIR, 'test-index.csv');

function walkDir(dir) {
    const results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results.push(...walkDir(filePath));
        } else if (/\.test\.(ts|tsx|js|jsx)$/.test(file)) {
            results.push(filePath);
        }
    });
    return results;
}

function parseFile(fp) {
    const txt = fs.readFileSync(fp, 'utf8');
    const describeRe = /describe\(\s*['`"]([^'`"]+)['`"]\s*,/g;
    const importRe = new RegExp("import\\s+[^;]*?from\\s+['`\"]([^'`\"]+)['`\"]", 'g');
    const describes = [];
    let m;
    while ((m = describeRe.exec(txt))) describes.push(m[1]);
    const imports = [];
    while ((m = importRe.exec(txt))) imports.push(m[1]);
    const stat = fs.statSync(fp);
    return {
        path: path.relative(ROOT, fp).replaceAll('\\\\', '/'),
        size: stat.size,
        mtime: stat.mtime.toISOString(),
        describes,
        imports: Array.from(new Set(imports)),
    };
}

function writeOutputs(entries) {
    fs.writeFileSync(OUT_JSON, JSON.stringify({ generated: new Date().toISOString(), count: entries.length, entries }, null, 2));
    const headers = ['path', 'size', 'mtime', 'describe_count', 'first_describe', 'imports'];
    const rows = [headers.join(',')];
    for (const e of entries) {
        const firstDescribe = e.describes[0] ? `"${e.describes[0].replace(/"/g, '\\"')}"` : '';
        const imports = e.imports.join('|').replace(/,/g, ';');
        rows.push([`"${e.path}"`, e.size, e.mtime, e.describes.length, firstDescribe, `"${imports}"`].join(','));
    }
    fs.writeFileSync(OUT_CSV, rows.join('\n'));
}

function main() {
    try {
        console.log('Scanning', TEST_DIR);
        if (!fs.existsSync(TEST_DIR)) {
            console.error('No _tests_ directory found at', TEST_DIR);
            process.exit(1);
        }
        const files = walkDir(TEST_DIR);
        console.log('Found', files.length, 'files');
        const entries = files.map(parseFile);
        writeOutputs(entries);
        console.log('Indexed', entries.length, 'test files. Outputs:', OUT_JSON, OUT_CSV);
    } catch (err) {
        console.error('Error during test catalog generation:', err && (err.stack || err.message || err));
        process.exit(2);
    }
}

main();
