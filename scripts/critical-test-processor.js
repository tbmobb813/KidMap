/**
 * Critical Test Results Processor
 * Processes and validates critical test suite results for CI/CD pipeline
 * Target: <30 seconds execution time validation
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
        const passRate = (passedTests / totalTests) * 100;

        // Critical test validation thresholds
        const CRITICAL_MAX_TIME = 30000; // 30 seconds
        const CRITICAL_MIN_PASS_RATE = 100; // 100% pass rate required

        // Generate critical test report
        const report = {
            timestamp: new Date().toISOString(),
            suite: 'critical',
            execution: {
                totalTime: totalTime,
                maxAllowedTime: CRITICAL_MAX_TIME,
                withinTimeLimit: totalTime <= CRITICAL_MAX_TIME,
                averageTestTime: totalTime / totalTests,
            },
            results: {
                total: totalTests,
                passed: passedTests,
                failed: failedTests,
                passRate: passRate,
                criticalPassRateMet: passRate >= CRITICAL_MIN_PASS_RATE,
            },
            validation: {
                timeValidation: totalTime <= CRITICAL_MAX_TIME,
                passRateValidation: passRate >= CRITICAL_MIN_PASS_RATE,
                overallValidation: (totalTime <= CRITICAL_MAX_TIME) && (passRate >= CRITICAL_MIN_PASS_RATE),
            },
            slowestTests: results.testResults
                .sort((a, b) => b.perfStats.runtime - a.perfStats.runtime)
                .slice(0, 5)
                .map(test => ({
                    testPath: path.relative(process.cwd(), test.testFilePath),
                    runtime: test.perfStats.runtime,
                    status: test.testResults.length > 0 ? test.testResults[0].status : 'unknown',
                })),
            failedTests: results.testResults
                .filter(test => test.numFailingTests > 0)
                .map(test => ({
                    testPath: path.relative(process.cwd(), test.testFilePath),
                    failures: test.testResults.filter(t => t.status === 'failed').length,
                    errors: test.testResults.filter(t => t.status === 'failed').map(t => ({
                        title: t.title,
                        message: t.failureMessages?.[0] || 'Unknown error',
                    })),
                })),
        };

        // Ensure coverage directory exists
        const coverageDir = path.join(process.cwd(), 'coverage', 'critical');
        if (!fs.existsSync(coverageDir)) {
            fs.mkdirSync(coverageDir, { recursive: true });
        }

        // Write critical test report
        const reportPath = path.join(coverageDir, 'critical-metrics.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        // Console output for CI/CD
        console.log('\n🔥 CRITICAL TEST SUITE RESULTS 🔥');
        console.log('═══════════════════════════════════');
        console.log(`⏱️  Execution Time: ${totalTime}ms (Target: <${CRITICAL_MAX_TIME}ms)`);
        console.log(`✅ Pass Rate: ${passRate.toFixed(1)}% (${passedTests}/${totalTests})`);
        console.log(`🎯 Time Target: ${report.validation.timeValidation ? '✅ MET' : '❌ EXCEEDED'}`);
        console.log(`🎯 Pass Target: ${report.validation.passRateValidation ? '✅ MET' : '❌ FAILED'}`);
        console.log(`🏆 Overall: ${report.validation.overallValidation ? '✅ PASSED' : '❌ FAILED'}`);

        if (report.slowestTests.length > 0) {
            console.log('\n🐌 Slowest Tests:');
            report.slowestTests.forEach((test, index) => {
                console.log(`  ${index + 1}. ${test.testPath} (${test.runtime}ms)`);
            });
        }

        if (report.failedTests.length > 0) {
            console.log('\n❌ Failed Tests:');
            report.failedTests.forEach(test => {
                console.log(`  📁 ${test.testPath} (${test.failures} failures)`);
                test.errors.forEach(error => {
                    console.log(`    ⚠️  ${error.title}: ${error.message.substring(0, 100)}...`);
                });
            });
        }

        // Exit with error code if critical tests don't meet requirements
        if (!report.validation.overallValidation) {
            console.log('\n🚨 CRITICAL TEST REQUIREMENTS NOT MET 🚨');
            console.log('CI/CD pipeline should be blocked until issues are resolved.');
            process.exitCode = 1;
        } else {
            console.log('\n🎉 CRITICAL TESTS PASSED - PIPELINE READY 🎉');
        }

        console.log('═══════════════════════════════════\n');

        // Processing time
        const processingTime = Date.now() - startTime;
        console.log(`📊 Report generated in ${processingTime}ms`);
        console.log(`📄 Detailed report: ${reportPath}\n`);

        return results;

    } catch (error) {
        console.error('🚨 Critical test processor error:', error);
        process.exitCode = 1;
        return results;
    }
};