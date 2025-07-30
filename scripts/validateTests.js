#!/usr/bin/env node
// scripts/validateTests.js - Test validation and fixing script

const fs = require('fs');
const path = require('path');

console.log('🔍 KidMap Test Validation Report');
console.log('=================================\n');

// Function to check if file exists and is readable
function checkFile(filePath) {
  try {
    const stat = fs.statSync(filePath);
    return { exists: true, size: stat.size };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

// Check critical safety components
const criticalComponents = [
  'components/SafeZoneManager.tsx',
  'components/SafetyErrorBoundary.tsx', 
  'utils/safeZoneAlerts.ts',
  'constants/colors.ts',
  '__tests__/SafeZoneManager.test.tsx',
  '__tests__/safeZoneAlerts.test.ts',
  '__tests__/integration/safetySystem.integration.test.tsx',
];

console.log('📁 Component Status:');
criticalComponents.forEach(file => {
  const result = checkFile(file);
  if (result.exists) {
    console.log(`✅ ${file} (${result.size} bytes)`);
  } else {
    console.log(`❌ ${file} - ${result.error}`);
  }
});

// Check test files specifically
const testDir = '__tests__';
let testFiles = [];
try {
  function getAllTestFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        getAllTestFiles(fullPath);
      } else if (file.endsWith('.test.js') || file.endsWith('.test.ts') || file.endsWith('.test.tsx')) {
        testFiles.push(fullPath);
      }
    });
  }
  getAllTestFiles(testDir);
} catch (error) {
  console.log(`❌ Error reading test directory: ${error.message}`);
}

console.log(`\n📋 Found ${testFiles.length} test files:`);
testFiles.forEach(file => {
  const result = checkFile(file);
  console.log(`   ${result.exists ? '✅' : '❌'} ${file}`);
});

// Check Jest configuration
const jestConfig = checkFile('jest.config.js');
console.log(`\n⚙️ Jest configuration: ${jestConfig.exists ? '✅' : '❌'}`);

// Check package.json test script
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const testScript = packageJson.scripts?.test;
  console.log(`📝 Test script: ${testScript ? '✅' : '❌'} ${testScript || 'Missing'}`);
} catch (error) {
  console.log(`❌ Error reading package.json: ${error.message}`);
}

console.log('\n🔧 Recommendations:');
console.log('1. Run: npm test -- --verbose --no-coverage to see detailed output');
console.log('2. Run: npx jest --clearCache to clear Jest cache');
console.log('3. Check for import/export issues in failing tests');
console.log('4. Ensure all mocked dependencies exist');
console.log('5. Verify TypeScript compilation with: npx tsc --noEmit');

console.log('\n📊 Test Categories to Validate:');
console.log('- Basic functionality tests (__tests__/basic.test.js)'); 
console.log('- Component rendering tests (__tests__/AccessibleButton.test.tsx)');
console.log('- Safety system tests (__tests__/SafeZoneManager.test.tsx)');
console.log('- Integration tests (__tests__/integration/*)');
console.log('- Alert system tests (__tests__/safeZoneAlerts.test.ts)');

console.log('\n✨ Next Steps:');
console.log('1. Fix import/dependency issues in failing tests');
console.log('2. Update mocks to match actual component interfaces');
console.log('3. Simplify overly complex test scenarios');
console.log('4. Ensure error boundaries are properly tested');
console.log('5. Validate all safety components have comprehensive coverage');
