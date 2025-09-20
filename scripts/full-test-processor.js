/**
 * Full Test Results Processor
 * Processes complete test suite results with comprehensive analysis
 * Target: <15 minutes execution time with full coverage and quality metrics
 */

const fs = require('fs');
const path = require('path');

module.exports = (results) => {
    const startTime = Date.now();

    try {
        // Calculate execution metrics
        const totalTime = results.testResults.reduce((acc, test) => acc + test.perfStats.runtime, 0);
        const totalTests = results.numTotalTests;
        const passedTests = results.numPassedTests;
        const failedTests = results.numFailedTests;
        const skippedTests = results.numTodoTests + results.numPendingTests;
        const passRate = (passedTests / totalTests) * 100;

        // Full test validation thresholds
        const FULL_MAX_TIME = 900000; // 15 minutes
        const FULL_MIN_PASS_RATE = 90; // 90% pass rate required
        const FULL_MIN_COVERAGE = 80; // 80% coverage required

        // Test categorization by directory
        const testCategories = {
            critical: results.testResults.filter(test => test.testFilePath.includes('/_tests_/critical/')),
            core: results.testResults.filter(test => test.testFilePath.includes('/_tests_/core/')),
            infra: results.testResults.filter(test => test.testFilePath.includes('/_tests_/infra/')),
            misc: results.testResults.filter(test => test.testFilePath.includes('/_tests_/misc/')),
            components: results.testResults.filter(test => test.testFilePath.includes('/_tests_/components/')),
        };

        // Calculate category statistics
        const categoryStats = {};
        Object.keys(testCategories).forEach(category => {
            const tests = testCategories[category];
            categoryStats[category] = {
                count: tests.length,
                passed: tests.filter(test => test.numFailingTests === 0).length,
                failed: tests.filter(test => test.numFailingTests > 0).length,
                avgRuntime: tests.length > 0 ?
                    tests.reduce((acc, test) => acc + test.perfStats.runtime, 0) / tests.length : 0,
                totalRuntime: tests.reduce((acc, test) => acc + test.perfStats.runtime, 0),
            };
        });

        // Performance analysis
        const performanceMetrics = {
            veryFast: results.testResults.filter(test => test.perfStats.runtime < 100).length,
            fast: results.testResults.filter(test =>
                test.perfStats.runtime >= 100 && test.perfStats.runtime < 1000
            ).length,
            medium: results.testResults.filter(test =>
                test.perfStats.runtime >= 1000 && test.perfStats.runtime < 5000
            ).length,
            slow: results.testResults.filter(test =>
                test.perfStats.runtime >= 5000 && test.perfStats.runtime < 10000
            ).length,
            verySlow: results.testResults.filter(test => test.perfStats.runtime >= 10000).length,
        };

        // Generate comprehensive report
        const report = {
            timestamp: new Date().toISOString(),
            suite: 'full',
            execution: {
                totalTime: totalTime,
                totalTimeFormatted: `${(totalTime / 60000).toFixed(1)} minutes`,
                maxAllowedTime: FULL_MAX_TIME,
                withinTimeLimit: totalTime <= FULL_MAX_TIME,
                averageTestTime: totalTime / totalTests,
                testDistribution: Object.keys(categoryStats).reduce((acc, cat) => {
                    acc[cat] = categoryStats[cat].count;
                    return acc;
                }, {}),
            },
            results: {
                total: totalTests,
                passed: passedTests,
                failed: failedTests,
                skipped: skippedTests,
                passRate: passRate,
                fullPassRateMet: passRate >= FULL_MIN_PASS_RATE,
            },
            categories: categoryStats,
            performance: {
                distribution: performanceMetrics,
                percentages: {
                    fast: ((performanceMetrics.veryFast + performanceMetrics.fast) / totalTests * 100).toFixed(1),
                    medium: (performanceMetrics.medium / totalTests * 100).toFixed(1),
                    slow: ((performanceMetrics.slow + performanceMetrics.verySlow) / totalTests * 100).toFixed(1),
                },
            },
            validation: {
                timeValidation: totalTime <= FULL_MAX_TIME,
                passRateValidation: passRate >= FULL_MIN_PASS_RATE,
                overallValidation: (totalTime <= FULL_MAX_TIME) && (passRate >= FULL_MIN_PASS_RATE),
            },
            qualityMetrics: {
                testDensity: totalTests / Object.keys(testCategories).length,
                averageTestsPerFile: totalTests / results.testResults.length,
                testEfficiency: passedTests / (totalTime / 1000), // tests per second
            },
            slowestTests: results.testResults
                .sort((a, b) => b.perfStats.runtime - a.perfStats.runtime)
                .slice(0, 15)
                .map(test => ({
                    testPath: path.relative(process.cwd(), test.testFilePath),
                    runtime: test.perfStats.runtime,
                    runtimeFormatted: `${(test.perfStats.runtime / 1000).toFixed(2)}s`,
                    category: Object.keys(testCategories).find(cat =>
                        testCategories[cat].some(t => t.testFilePath === test.testFilePath)
                    ) || 'uncategorized',
                    status: test.numFailingTests === 0 ? 'passed' : 'failed',
                    testCount: test.testResults.length,
                })),
            failedTests: results.testResults
                .filter(test => test.numFailingTests > 0)
                .map(test => ({
                    testPath: path.relative(process.cwd(), test.testFilePath),
                    category: Object.keys(testCategories).find(cat =>
                        testCategories[cat].some(t => t.testFilePath === test.testFilePath)
                    ) || 'uncategorized',
                    failures: test.numFailingTests,
                    runtime: test.perfStats.runtime,
                    errors: test.testResults.filter(t => t.status === 'failed').slice(0, 5).map(t => ({
                        title: t.title,
                        message: t.failureMessages?.[0]?.substring(0, 300) + '...' || 'Unknown error',
                        fullName: t.fullName,
                    })),
                }))
                .sort((a, b) => {
                    // Sort by category priority: critical > core > infra > misc > components
                    const priority = { critical: 0, core: 1, infra: 2, misc: 3, components: 4 };
                    return (priority[a.category] || 5) - (priority[b.category] || 5);
                }),
        };

        // Read coverage data if available
        const coverageFile = path.join(process.cwd(), 'coverage', 'full', 'coverage-summary.json');
        if (fs.existsSync(coverageFile)) {
            try {
                const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
                report.coverage = {
                    summary: {
                        lines: coverage.total?.lines?.pct || 0,
                        branches: coverage.total?.branches?.pct || 0,
                        functions: coverage.total?.functions?.pct || 0,
                        statements: coverage.total?.statements?.pct || 0,
                    },
                    details: {
                        linesCovered: coverage.total?.lines?.covered || 0,
                        linesTotal: coverage.total?.lines?.total || 0,
                        branchesCovered: coverage.total?.branches?.covered || 0,
                        branchesTotal: coverage.total?.branches?.total || 0,
                    },
                    thresholds: {
                        lines: report.coverage.summary.lines >= FULL_MIN_COVERAGE,
                        branches: report.coverage.summary.branches >= (FULL_MIN_COVERAGE - 10),
                        functions: report.coverage.summary.functions >= FULL_MIN_COVERAGE,
                        statements: report.coverage.summary.statements >= FULL_MIN_COVERAGE,
                    },
                    overallThresholdMet: (coverage.total?.lines?.pct || 0) >= FULL_MIN_COVERAGE,
                };

                // Update overall validation to include coverage
                report.validation.coverageValidation = report.coverage.overallThresholdMet;
                report.validation.overallValidation = report.validation.timeValidation &&
                    report.validation.passRateValidation &&
                    report.validation.coverageValidation;
            } catch (err) {
                console.warn('⚠️  Could not read coverage data:', err.message);
            }
        }

        // Ensure coverage directory exists
        const coverageDir = path.join(process.cwd(), 'coverage', 'full');
        if (!fs.existsSync(coverageDir)) {
            fs.mkdirSync(coverageDir, { recursive: true });
        }

        // Write comprehensive report
        const reportPath = path.join(coverageDir, 'full-metrics.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        // Generate summary report for quick reference
        const summaryReport = {
            timestamp: report.timestamp,
            suite: 'full',
            summary: {
                totalTests: totalTests,
                passRate: passRate.toFixed(1) + '%',
                executionTime: report.execution.totalTimeFormatted,
                coverage: report.coverage ? `${report.coverage.summary.lines.toFixed(1)}%` : 'N/A',
                overallStatus: report.validation.overallValidation ? 'PASSED' : 'FAILED',
            },
            categories: Object.keys(categoryStats).reduce((acc, cat) => {
                acc[cat] = `${categoryStats[cat].passed}/${categoryStats[cat].count}`;
                return acc;
            }, {}),
            topIssues: report.failedTests.slice(0, 5).map(test => ({
                file: test.testPath,
                category: test.category,
                failures: test.failures,
            })),
        };

        const summaryPath = path.join(coverageDir, 'full-summary.json');
        fs.writeFileSync(summaryPath, JSON.stringify(summaryReport, null, 2));

        // Console output for CI/CD
        console.log('\n🚀 FULL TEST SUITE RESULTS 🚀');
        console.log('═══════════════════════════════════');
        console.log(`⏱️  Execution Time: ${report.execution.totalTimeFormatted} (Target: <${FULL_MAX_TIME / 60000} min)`);
        console.log(`✅ Pass Rate: ${passRate.toFixed(1)}% (${passedTests}/${totalTests})`);

        if (report.coverage) {
            console.log(`📊 Coverage Summary:`);
            console.log(`   Lines: ${report.coverage.summary.lines.toFixed(1)}% (${report.coverage.details.linesCovered}/${report.coverage.details.linesTotal})`);
            console.log(`   Branches: ${report.coverage.summary.branches.toFixed(1)}% (${report.coverage.details.branchesCovered}/${report.coverage.details.branchesTotal})`);
            console.log(`   Functions: ${report.coverage.summary.functions.toFixed(1)}%`);
            console.log(`   Statements: ${report.coverage.summary.statements.toFixed(1)}%`);
        }

        console.log(`📁 Test Distribution by Category:`);
        Object.keys(categoryStats).forEach(category => {
            const stats = categoryStats[category];
            if (stats.count > 0) {
                console.log(`   ${category.charAt(0).toUpperCase() + category.slice(1)}: ${stats.passed}/${stats.count} (${(stats.avgRuntime / 1000).toFixed(1)}s avg)`);
            }
        });

        console.log(`⚡ Performance Distribution:`);
        console.log(`   Fast (<1s): ${report.performance.percentages.fast}%`);
        console.log(`   Medium (1-5s): ${report.performance.percentages.medium}%`);
        console.log(`   Slow (>5s): ${report.performance.percentages.slow}%`);

        console.log(`🎯 Validation Results:`);
        console.log(`   Time: ${report.validation.timeValidation ? '✅ MET' : '❌ EXCEEDED'}`);
        console.log(`   Pass Rate: ${report.validation.passRateValidation ? '✅ MET' : '❌ FAILED'}`);
        if (report.coverage) {
            console.log(`   Coverage: ${report.validation.coverageValidation ? '✅ MET' : '❌ FAILED'}`);
        }
        console.log(`   Overall: ${report.validation.overallValidation ? '✅ PASSED' : '❌ FAILED'}`);

        if (performanceMetrics.verySlow > 0) {
            console.log(`\n🐌 Performance Concerns:`);
            console.log(`   ${performanceMetrics.verySlow} tests taking >10s`);
            console.log(`   Top slowest tests:`);
            report.slowestTests.slice(0, 5).forEach((test, index) => {
                console.log(`   ${index + 1}. ${test.testPath} (${test.runtimeFormatted})`);
            });
        }

        if (report.failedTests.length > 0) {
            console.log(`\n❌ Failed Tests by Category:`);
            const failuresByCategory = {};
            report.failedTests.forEach(test => {
                failuresByCategory[test.category] = (failuresByCategory[test.category] || 0) + 1;
            });
            Object.keys(failuresByCategory).forEach(category => {
                console.log(`   ${category}: ${failuresByCategory[category]} failures`);
            });

            console.log(`\n🔥 Critical Failures (top 3):`);
            report.failedTests.slice(0, 3).forEach(test => {
                console.log(`   📁 ${test.testPath} (${test.failures} failures)`);
                test.errors.slice(0, 1).forEach(error => {
                    console.log(`      ⚠️  ${error.title}`);
                });
            });
        }

        console.log('═══════════════════════════════════');

        // Processing time
        const processingTime = Date.now() - startTime;
        console.log(`📊 Report generated in ${processingTime}ms`);
        console.log(`📄 Detailed report: ${reportPath}`);
        console.log(`📋 Summary report: ${summaryPath}\n`);

        return results;

    } catch (error) {
        console.error('🚨 Full test processor error:', error);
        return results;
    }
};