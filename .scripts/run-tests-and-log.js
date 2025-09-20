/*
Simple Node wrapper to run jest and write stdout/stderr to a timestamped log file.
Usage: npm run test:log -- <jest args>
*/

const { spawnSync, execFileSync } = require('child_process');
const { writeFileSync, mkdirSync, existsSync } = require('fs');
const { join } = require('path');

function run() {
    const repoRoot = process.cwd();
    const logsDir = join(repoRoot, '.logs');
    try { mkdirSync(logsDir, { recursive: true }); } catch { }

    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const args = process.argv.slice(2);
    const tag = args.join(' ').replace(/[^a-z0-9.-]/gi, '_').slice(0, 200) || 'all';
    const logfile = join(logsDir, `jest_${tag}_${ts}.log`);

    let gitSha = 'unknown';
    let branch = 'unknown';
    try {
        gitSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
        branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8' }).trim();
    } catch {
        // ignore
    }

    const header = [];
    header.push(`timestamp: ${new Date().toISOString()}`);
    header.push(`branch: ${branch}`);
    header.push(`sha: ${gitSha}`);
    header.push(`args: jest ${args.join(' ')}`);
    header.push('---\n');

    // Prefer local jest binary if available
    // If the JS runner exists, prefer invoking it with the current node executable
    const jestJsRunner = join(repoRoot, 'node_modules', 'jest', 'bin', 'jest.js');
    let cmd;
    if (existsSync(jestJsRunner)) {
        // Use current Node to execute the local Jest JS runner
        cmd = process.execPath; // node
    } else {
        // Prefer local shell script/binary under node_modules/.bin if present
        const localJest = join(
            repoRoot,
            'node_modules',
            '.bin',
            process.platform === 'win32' ? 'jest.cmd' : 'jest'
        );
        if (existsSync(localJest)) {
            cmd = localJest;
        } else {
            // Fallback to npx (we will pass 'jest' explicitly later)
            cmd = 'npx';
        }
    }

    // Pre-scan provided paths: if a path points to a file and that file
    // contains no test tokens (it(, test(, describe(), treat it as archived.
    // This prevents Jest from failing on archived stub files.
    const fs = require('fs');
    const path = require('path');

    const scannedArgs = [];
    const moved = [];
    for (const a of args) {
        // Only consider explicit test file paths (exist on disk)
        try {
            const abs = path.resolve(a);
            if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
                const content = fs.readFileSync(abs, 'utf8');
                if (!/\b(it|test|describe)\s*\(/.test(content)) {
                    // Move file to _tests_/duplicates/archived preserving filename
                    const repoRoot = process.cwd();
                    const archivedDir = path.join(repoRoot, '_tests_', 'duplicates', 'archived');
                    try { fs.mkdirSync(archivedDir, { recursive: true }); } catch { }
                    const dest = path.join(archivedDir, path.basename(abs));
                    try {
                        fs.renameSync(abs, dest);
                        moved.push({ from: abs, to: dest });
                        // record: do not include this file in test run
                        continue;
                    } catch (err) {
                        // if move fails, skip it in the run but log it
                        moved.push({ from: abs, to: dest, error: String(err) });
                        continue;
                    }
                }
            }
        } catch {
            // non-fatal: just include the arg
        }
        scannedArgs.push(a);
    }

    // If we moved any files, write an index for human review
    if (moved.length > 0) {
        try {
            const repoRoot = process.cwd();
            const indexPath = path.join(repoRoot, '_tests_', 'duplicates', 'archived', 'moved_index.json');
            fs.writeFileSync(indexPath, JSON.stringify({ moved, ts: new Date().toISOString() }, null, 2), 'utf8');
            console.log(`Moved ${moved.length} archived stub(s) to _tests_/duplicates/archived/ and wrote index: ${indexPath}`);
        } catch (e) {
            console.error('Failed to write moved_index.json:', e);
        }
    }

    // Use scannedArgs for the actual jest invocation
    // Build the argument vector based on which command we are invoking.
    let argv;
    if (cmd === process.execPath) {
        // node <jest.js> --colors ...
        argv = [jestJsRunner, '--colors', ...scannedArgs];
    } else if (cmd === 'npx') {
        // npx jest --colors ... (ensure jest is specified)
        argv = ['jest', '--colors', ...scannedArgs];
    } else {
        // local jest(.cmd) binary
        argv = ['--colors', ...scannedArgs];
    }
    const proc = spawnSync(cmd, argv, { encoding: 'utf8' });

    const out = (proc.stdout || '') + '\n' + (proc.stderr || '') + '\nEXIT CODE: ' + (proc.status ?? (proc.error && proc.error.code) ?? 'unknown');
    writeFileSync(logfile, header.join('\n') + out, { encoding: 'utf8' });
    console.log(`WROTE LOG: ${logfile}`);

    const exitCode = typeof proc.status === 'number' ? proc.status : 1;
    process.exit(exitCode);
}

run();
