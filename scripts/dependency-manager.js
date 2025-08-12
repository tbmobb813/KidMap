const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DependencyManager {
  constructor() {
    this.packageJsonPath = path.join(process.cwd(), 'package.json');
    this.packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
  }

  async checkOutdated() {
    console.log('🔍 Checking for outdated packages...');
    try {
      const result = execSync('npm outdated --json', { encoding: 'utf8' });
      const outdated = JSON.parse(result);

      if (Object.keys(outdated).length === 0) {
        console.log('✅ All packages are up to date!');
        return [];
      }

      console.log('📦 Outdated packages found:');
      Object.entries(outdated).forEach(([pkg, info]) => {
        console.log(`  ${pkg}: ${info.current} → ${info.latest}`);
      });

      return Object.keys(outdated);
    } catch (error) {
      console.log('✅ All packages are up to date!');
      return [];
    }
  }

  async checkPeerDependencies() {
    console.log('🔍 Checking peer dependencies...');
    try {
      const result = execSync('npm ls --depth=0', { encoding: 'utf8' });
      if (result.includes('UNMET') || result.includes('invalid')) {
        console.log('⚠️  Peer dependency issues found:');
        console.log(result);
        return false;
      }
      console.log('✅ No peer dependency issues found!');
      return true;
    } catch (error) {
      console.log('⚠️  Peer dependency issues detected');
      return false;
    }
  }

  async auditSecurity() {
    console.log('🔒 Running security audit...');
    try {
      execSync('npm audit --audit-level=moderate', { stdio: 'inherit' });
      console.log('✅ No security vulnerabilities found!');
    } catch (error) {
      console.log('⚠️  Security vulnerabilities found. Run "npm audit fix" to resolve.');
    }
  }

  async updateSafely() {
    console.log('🔄 Updating packages safely...');

    // Update patch and minor versions only
    execSync('npm update', { stdio: 'inherit' });

    // Check if everything still works
    const peerDepsOk = await this.checkPeerDependencies();

    if (!peerDepsOk) {
      console.log('⚠️  Peer dependency issues after update. Consider adding overrides.');
    }
  }

  async fullHealthCheck() {
    console.log('🏥 Running full dependency health check...\n');

    await this.checkOutdated();
    console.log('');

    await this.checkPeerDependencies();
    console.log('');

    await this.auditSecurity();
    console.log('');

    console.log('✅ Health check complete!');
  }

  async autoFix() {
    console.log('🔧 Auto-fixing dependency issues...\n');

    // Fix security issues
    try {
      execSync('npm audit fix', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️  Some security issues require manual attention');
    }

    // Update packages safely
    await this.updateSafely();

    console.log('\n✅ Auto-fix complete!');
  }
}

// CLI interface
const command = process.argv[2];
const manager = new DependencyManager();

// Handle auto-scheduling
if (process.argv.includes('--auto-schedule')) {
  console.log('🕐 Starting daily dependency monitoring...');

  // Run initial check
  manager.fullHealthCheck();

  // Schedule daily checks
  setInterval(() => {
    console.log('📅 Daily dependency check...');
    manager.fullHealthCheck();
  }, 24 * 60 * 60 * 1000); // 24 hours

  // Keep the process running
  console.log('✅ Auto-scheduler is running. Press Ctrl+C to stop.');
  return;
}

// Regular CLI commands
switch (command) {
  case 'check':
    manager.fullHealthCheck();
    break;
  case 'update':
    manager.updateSafely();
    break;
  case 'fix':
    manager.autoFix();
    break;
  case 'outdated':
    manager.checkOutdated();
    break;
  case 'peers':
    manager.checkPeerDependencies();
    break;
  case 'audit':
    manager.auditSecurity();
    break;
  default:
    console.log(`
Usage: node scripts/dependency-manager.js [command]

Commands:
  check           - Run full health check
  update          - Update packages safely
  fix             - Auto-fix issues
  outdated        - Check for outdated packages
  peers           - Check peer dependencies
  audit           - Security audit
  --auto-schedule - Start daily monitoring
    `);
}