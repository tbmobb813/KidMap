/* Basic Danger rules */
const { danger, warn, message } = require('danger');

// PR size
if (danger.github.pr.additions + danger.github.pr.deletions > 1200) {
    warn('Large PR: Consider splitting into smaller, focused changes.');
}

// Title quality
if (!/(feat|fix|chore|refactor|docs|test|perf|build|ci)/i.test(danger.github.pr.title)) {
    warn('PR title should follow conventional commit style (e.g., feat:, fix:, chore:).');
}

// Test reminder
const hasTestChanges = danger.git.modified_files.some(f => f.includes('_tests_') || f.includes('__tests__'))
    || danger.git.created_files.some(f => f.includes('_tests_') || f.includes('__tests__'));
const touchesSrc = danger.git.modified_files.some(f => f.startsWith('components/') || f.startsWith('hooks/') || f.startsWith('stores/'));
if (touchesSrc && !hasTestChanges) {
    warn('Source changes detected without accompanying tests. Consider adding/adjusting tests.');
}

message('✅ Danger checks completed.');
