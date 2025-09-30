/**
 * Core Test Results Processor
 * Processes core test suite results and generates comprehensive metrics
 * Target: <5 minutes execution time with coverage analysis
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

        // Core test validation thresholds
        const CORE_MAX_TIME = 300000; // 5 minutes
        const CORE_MIN_PASS_RATE = 95; // 95% pass rate required
        const CORE_MIN_COVERAGE = 70; // 70% coverage required

        // Test categorization
        const criticalTests = results.testResults.filter(test =>
            test.testFilePath.includes('/_tests_/critical/')
        );
        const coreTests = results.testResults.filter(test =>
            test.testFilePath.includes('/_tests_/core/')
        );

        // Generate core test report
        const report = {
            timestamp: new Date().toISOString(),
            suite: 'core',
            execution: {
                totalTime: totalTime,
                maxAllowedTime: CORE_MAX_TIME,
                withinTimeLimit: totalTime <= CORE_MAX_TIME,
                averageTestTime: totalTime / totalTests,
                testDistribution: {
                    critical: criticalTests.length,
                    core: coreTests.length,
                    total: totalTests,
                },
            },
            results: {
                total: totalTests,
                passed: passedTests,
                failed: failedTests,
                skipped: skippedTests,
                passRate: passRate,
                corePassRateMet: passRate >= CORE_MIN_PASS_RATE,
            },
            performance: {
                fastTests: results.testResults.filter(test => test.perfStats.runtime < 1000).length,
                mediumTests: results.testResults.filter(test =>
                    test.perfStats.runtime >= 1000 && test.perfStats.runtime < 5000
                ).length,
                slowTests: results.testResults.filter(test => test.perfStats.runtime >= 5000).length,
            },
            validation: {
                timeValidation: totalTime <= CORE_MAX_TIME,
                passRateValidation: passRate >= CORE_MIN_PASS_RATE,
                overallValidation: (totalTime <= CORE_MAX_TIME) && (passRate >= CORE_MIN_PASS_RATE),
            },
            testsByCategory: {
                critical: {
                    count: criticalTests.length,
                    passed: criticalTests.filter(test => test.numFailingTests === 0).length,
                    failed: criticalTests.filter(test => test.numFailingTests > 0).length,
                    avgRuntime: criticalTests.reduce((acc, test) => acc + test.perfStats.runtime, 0) / criticalTests.length || 0,
                },
                core: {
                    count: coreTests.length,
                    passed: coreTests.filter(test => test.numFailingTests === 0).length,
                    failed: coreTests.filter(test => test.numFailingTests > 0).length,
                    avgRuntime: coreTests.reduce((acc, test) => acc + test.perfStats.runtime, 0) / coreTests.length || 0,
                },
            },
            slowestTests: results.testResults
                .sort((a, b) => b.perfStats.runtime - a.perfStats.runtime)
                .slice(0, 10)
                .map(test => ({
                    testPath: path.relative(process.cwd(), test.testFilePath),
                    runtime: test.perfStats.runtime,
                    category: test.testFilePath.includes('/critical/') ? 'critical' :
                        test.testFilePath.includes('/core/') ? 'core' : 'other',
                    status: test.numFailingTests === 0 ? 'passed' : 'failed',
                    testCount: test.testResults.length,
                })),
            failedTests: results.testResults
                .filter(test => test.numFailingTests > 0)
                .map(test => ({
                    testPath: path.relative(process.cwd(), test.testFilePath),
                    category: test.testFilePath.includes('/critical/') ? 'critical' :
                        test.testFilePath.includes('/core/') ? 'core' : 'other',
                    failures: test.numFailingTests,
                    runtime: test.perfStats.runtime,
                    errors: test.testResults.filter(t => t.status === 'failed').slice(0, 3).map(t => ({
                        title: t.title,
                        message: t.failureMessages?.[0]?.substring(0, 200) + '...' || 'Unknown error',
                    })),
                })),
        };

        // Read coverage data if available
        const coverageFile = path.join(process.cwd(), 'coverage', 'core', 'coverage-summary.json');
        if (fs.existsSync(coverageFile)) {
            try {
                const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
                report.coverage = {
                    lines: coverage.total?.lines?.pct || 0,
                    branches: coverage.total?.branches?.pct || 0,
                    functions: coverage.total?.functions?.pct || 0,
                    statements: coverage.total?.statements?.pct || 0,
                    coverageThresholdMet: (coverage.total?.lines?.pct || 0) >= CORE_MIN_COVERAGE,
                };

                // Update overall validation to include coverage
                report.validation.coverageValidation = report.coverage.coverageThresholdMet;
                report.validation.overallValidation = report.validation.timeValidation &&
                    report.validation.passRateValidation &&
                    report.validation.coverageValidation;
            } catch (err) {
                console.warn('⚠️  Could not read coverage data:', err.message);
            }
        }

        // Ensure coverage directory exists
        const coverageDir = path.join(process.cwd(), 'coverage', 'core');
        if (!fs.existsSync(coverageDir)) {
            fs.mkdirSync(coverageDir, { recursive: true });
        }

        // Write core test report
        const reportPath = path.join(coverageDir, 'core-metrics.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        // Console output for CI/CD
        console.log('\n🔧 CORE TEST SUITE RESULTS 🔧');
        console.log('══════════════════════════════');
        console.log(`⏱️  Execution Time: ${(totalTime / 1000).toFixed(1)}s (Target: <${CORE_MAX_TIME / 1000}s)`);
        console.log(`✅ Pass Rate: ${passRate.toFixed(1)}% (${passedTests}/${totalTests})`);

        if (report.coverage) {
            console.log(`📊 Coverage: ${report.coverage.lines.toFixed(1)}% lines, ${report.coverage.branches.toFixed(1)}% branches`);
        }

        console.log(`📁 Test Distribution:`);
        console.log(`   Critical: ${report.testsByCategory.critical.count} tests (${report.testsByCategory.critical.passed} passed)`);
        console.log(`   Core: ${report.testsByCategory.core.count} tests (${report.testsByCategory.core.passed} passed)`);

        console.log(`🎯 Validation:`);
        console.log(`   Time: ${report.validation.timeValidation ? '✅ MET' : '❌ EXCEEDED'}`);
        console.log(`   Pass Rate: ${report.validation.passRateValidation ? '✅ MET' : '❌ FAILED'}`);
        if (report.coverage) {
            console.log(`   Coverage: ${report.validation.coverageValidation ? '✅ MET' : '❌ FAILED'}`);
        }
        console.log(`   Overall: ${report.validation.overallValidation ? '✅ PASSED' : '❌ FAILED'}`);

        if (report.performance.slowTests > 0) {
            console.log(`\n⚠️  Performance Alert: ${report.performance.slowTests} tests >5s`);
            console.log('   Top slow tests:');
            report.slowestTests.slice(0, 5).forEach((test, index) => {
                console.log(`   ${index + 1}. ${test.testPath} (${(test.runtime / 1000).toFixed(1)}s)`);
            });
        }

        if (report.failedTests.length > 0) {
            console.log('\n❌ Failed Tests Summary:');
            const criticalFailures = report.failedTests.filter(t => t.category === 'critical');
            const coreFailures = report.failedTests.filter(t => t.category === 'core');

            if (criticalFailures.length > 0) {
                console.log(`   🔥 Critical Failures: ${criticalFailures.length}`);
            }
            if (coreFailures.length > 0) {
                console.log(`   🔧 Core Failures: ${coreFailures.length}`);
            }
        }

        console.log('══════════════════════════════');

        // Processing time
        const processingTime = Date.now() - startTime;
        console.log(`📊 Report generated in ${processingTime}ms`);
        console.log(`📄 Detailed report: ${reportPath}\n`);

        return results;

    } catch (error) {
        console.error('🚨 Core test processor error:', error);
        return results;
    }
};