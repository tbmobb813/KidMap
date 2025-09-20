# Test Suite Stratification Guide

This document explains the stratified test execution system implemented in Phase 3 of the KidMap test architecture optimization.

## 🎯 Overview

The test suite is divided into three execution tiers to optimize CI/CD pipeline efficiency:

### 1. Critical Tests (`test:critical`)
- **Target:** <30 seconds execution time
- **Scope:** Essential safety, security, and core functionality
- **Trigger:** Every commit, PR creation, pre-merge validation
- **Pass Rate:** 100% required
- **Location:** `_tests_/critical/`

### 2. Core Tests (`test:core`)
- **Target:** <5 minutes execution time  
- **Scope:** Core features, components, hooks, essential integrations
- **Trigger:** Daily builds, feature branch merges, release candidates
- **Pass Rate:** 95% required
- **Coverage:** 70% minimum
- **Location:** `_tests_/critical/` + `_tests_/core/`

### 3. Full Tests (`test:full`)
- **Target:** <15 minutes execution time
- **Scope:** Complete test coverage including integration, performance, edge cases
- **Trigger:** Nightly builds, pre-release validation, manual execution
- **Pass Rate:** 90% required
- **Coverage:** 80% minimum
- **Location:** All test directories except duplicates

## 🚀 Usage

### Local Development

```bash
# Run critical tests (fast feedback)
npm run test:critical

# Run core tests with coverage
npm run test:core

# Run complete test suite
npm run test:full

# Run all tiers sequentially
npm run test:stratified

# Watch mode for development
npm run test:watch:critical
npm run test:watch:core
```

### CI/CD Integration

```bash
# Optimized for CI environment
npm run test:critical:ci
npm run test:core:ci
npm run test:full:ci

# Full stratified CI run
npm run test:stratified:ci
```

## 📊 Reporting and Metrics

Each test tier generates comprehensive reports:

### Critical Test Reports
- **Location:** `coverage/critical/`
- **Metrics:** Execution time validation, pass rate, slowest tests
- **CI Integration:** Automatic PR comments with results
- **Validation:** Fails CI if >30s or <100% pass rate

### Core Test Reports
- **Location:** `coverage/core/`
- **Metrics:** Coverage analysis, performance distribution, category breakdown
- **CI Integration:** Codecov integration, detailed PR comments
- **Validation:** Time, pass rate, and coverage thresholds

### Full Test Reports
- **Location:** `coverage/full/`
- **Metrics:** Comprehensive analysis, quality metrics, performance insights
- **CI Integration:** Release reports, nightly failure notifications
- **Validation:** Complete system health validation

## 🔧 Configuration Files

### Jest Configurations
- `jest.config.critical.js` - Critical test settings
- `jest.config.core.js` - Core test settings with coverage
- `jest.config.full.js` - Complete test suite configuration

### Test Processors
- `scripts/critical-test-processor.js` - Critical test validation
- `scripts/core-test-processor.js` - Core test analysis
- `scripts/full-test-processor.js` - Comprehensive reporting

### GitHub Actions
- `.github/workflows/test-stratification.yml` - CI/CD pipeline

## 📁 Test Organization

Tests are organized by execution priority:

```
_tests_/
├── critical/           # <30s essential tests
│   ├── components/     # Critical UI components
│   └── core/          # Essential functionality
├── core/              # <5min core features
│   ├── components/    # Main components
│   ├── hooks/         # Custom hooks
│   └── stores/        # State management
├── infra/             # Infrastructure tests
├── misc/              # Miscellaneous tests
└── components/        # General component tests
```

## 🎯 Test Classification Guidelines

### Critical Tests
- Safety-related functionality (SafetyDashboard, emergency features)
- Authentication and security
- Core navigation and routing
- Essential data integrity
- Basic rendering and accessibility

### Core Tests
- Main application features
- Component behavior and interactions
- Hook functionality
- Store state management
- API integration basics

### Full Test Suite
- Edge cases and error scenarios
- Performance and load testing
- Complete integration scenarios
- Cross-browser/platform compatibility
- Comprehensive accessibility testing

## 🔍 Performance Monitoring

### Execution Time Targets
- **Critical:** Individual tests <1s, suite <30s
- **Core:** Individual tests <3s, suite <5min
- **Full:** Individual tests <10s, suite <15min

### Performance Alerts
- Automatic detection of slow tests
- Performance regression tracking
- Memory usage monitoring
- CI timeout protection

## 🚨 Failure Handling

### Critical Test Failures
- **Action:** Immediate CI failure, blocks merge
- **Notification:** PR comments, team alerts
- **Resolution:** Fix required before proceeding

### Core Test Failures
- **Action:** CI warning, investigation required
- **Notification:** Detailed reports, coverage analysis
- **Resolution:** Fix within sprint cycle

### Full Test Failures
- **Action:** Nightly failure issues created
- **Notification:** GitHub issues, maintainer alerts
- **Resolution:** Address before next release

## 🛠️ Maintenance

### Weekly Tasks
- Review slow test reports
- Update test categorization as needed
- Validate threshold settings

### Monthly Tasks
- Analyze test distribution balance
- Update performance targets
- Review and optimize test infrastructure

### Release Tasks
- Validate all thresholds are met
- Generate comprehensive test reports
- Archive test metrics for future reference

## 📈 Metrics and KPIs

### Success Metrics
- CI execution time reduction
- Developer feedback cycle improvement
- Test reliability and stability
- Coverage consistency

### Quality Indicators
- Pass rate stability across tiers
- Performance regression detection
- Test categorization accuracy
- CI/CD pipeline efficiency

## 🔧 Troubleshooting

### Common Issues

#### Critical Tests Timing Out
```bash
# Check slowest tests
cat coverage/critical/critical-metrics.json | jq '.slowestTests'

# Profile specific test
npm run test:critical -- --verbose --testPathPattern=SafetyDashboard
```

#### Coverage Not Meeting Thresholds
```bash
# Generate detailed coverage report
npm run test:core
open coverage/core/lcov-report/index.html
```

#### Test Categorization Issues
```bash
# Validate test organization
npm run test:full -- --listTests | grep -E "(critical|core)"
```

## 🚀 Future Enhancements

### Planned Improvements
- Dynamic test categorization based on file changes
- Parallel test execution optimization
- Enhanced performance analytics
- Integration with external monitoring tools

### Experimental Features
- AI-powered test categorization
- Predictive failure analysis
- Automated performance optimization
- Real-time test result streaming

---

For questions or improvements to this system, please refer to the test architecture documentation in `_tests_/ARCHITECTURE.md` or contact the development team.