#!/usr/bin/env node

/**
 * WCAG Contrast Compliance Checker for KidMap Theme Tokens
 * 
 * Validates all color combinations in our theme palettes against WCAG AA/AAA standards.
 * Ensures 4.5:1 contrast ratio for normal text and 3:1 for large text.
 */

const fs = require('fs');
const path = require('path');

// WCAG contrast calculation functions
function getLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
        const sRGB = c / 255;
        return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1, color2) {
    const [r1, g1, b1] = hexToRgb(color1);
    const [r2, g2, b2] = hexToRgb(color2);

    const lum1 = getLuminance(r1, g1, b1);
    const lum2 = getLuminance(r2, g2, b2);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
}

function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    return [
        parseInt(clean.substring(0, 2), 16),
        parseInt(clean.substring(2, 4), 16),
        parseInt(clean.substring(4, 6), 16)
    ];
}

// Load theme colors
function loadColors() {
    try {
        const colorsPath = path.join(__dirname, '..', 'constants', 'colors.ts');
        const content = fs.readFileSync(colorsPath, 'utf8');

        // Extract color values using regex (simple approach)
        const lightMatch = content.match(/export const lightColors = \{([\s\S]*?)\} as const/);
        const darkMatch = content.match(/export const darkColors = \{([\s\S]*?)\} as const/);
        const highContrastMatch = content.match(/export const highContrastColors = \{([\s\S]*?)\} as const/);

        if (!lightMatch || !darkMatch || !highContrastMatch) {
            throw new Error('Could not parse color definitions');
        }

        const parseColors = (colorText) => {
            const colors = {};
            const lines = colorText.split('\n');

            for (const line of lines) {
                const match = line.match(/^\s*(\w+):\s*["']([#\w]+)["']/);
                if (match && match[2].startsWith('#')) {
                    colors[match[1]] = match[2];
                }
            }
            return colors;
        };

        return {
            light: parseColors(lightMatch[1]),
            dark: parseColors(darkMatch[1]),
            highContrast: parseColors(highContrastMatch[1])
        };
    } catch (error) {
        console.error('Error loading colors:', error.message);
        return null;
    }
}

// Test color combinations
function checkContrast(themeName, colors) {
    console.log(`\n🎨 ${themeName.toUpperCase()} THEME CONTRAST CHECK`);
    console.log('='.repeat(50));

    const results = {
        passed: 0,
        failed: 0,
        warnings: 0
    };

    const textCombinations = [
        ['text', 'background', 'Primary text on background'],
        ['text', 'surface', 'Primary text on surface'],
        ['textSecondary', 'background', 'Secondary text on background'],
        ['textSecondary', 'surface', 'Secondary text on surface'],
        ['primaryForeground', 'primary', 'Primary button text'],
        ['secondaryForeground', 'secondary', 'Secondary button text'],
        ['errorForeground', 'error', 'Error button text'],
        ['successForeground', 'success', 'Success button text'],
        ['warningForeground', 'warning', 'Warning button text'],
        ['infoForeground', 'info', 'Info button text']
    ];

    for (const [foreground, background, description] of textCombinations) {
        if (colors[foreground] && colors[background]) {
            const ratio = getContrastRatio(colors[foreground], colors[background]);
            const status = getComplianceStatus(ratio);

            console.log(`${status.icon} ${description}: ${ratio.toFixed(2)}:1 ${status.label}`);

            if (status.type === 'pass') results.passed++;
            else if (status.type === 'fail') results.failed++;
            else results.warnings++;
        }
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`⚠️  Warnings: ${results.warnings}`);
    console.log(`❌ Failed: ${results.failed}`);

    return results;
}

function getComplianceStatus(ratio) {
    if (ratio >= 7.0) {
        return { icon: '✅', label: '(AAA)', type: 'pass' };
    } else if (ratio >= 4.5) {
        return { icon: '✅', label: '(AA)', type: 'pass' };
    } else if (ratio >= 3.0) {
        return { icon: '⚠️', label: '(Large text only)', type: 'warning' };
    } else {
        return { icon: '❌', label: '(FAIL)', type: 'fail' };
    }
}

// Main execution
function main() {
    console.log('🔍 KidMap Theme Contrast Compliance Check');
    console.log('=========================================');

    const colors = loadColors();
    if (!colors) {
        process.exit(1);
    }

    const results = {
        light: checkContrast('Light', colors.light),
        dark: checkContrast('Dark', colors.dark),
        highContrast: checkContrast('High Contrast', colors.highContrast)
    };

    // Overall summary
    const totalPassed = results.light.passed + results.dark.passed + results.highContrast.passed;
    const totalFailed = results.light.failed + results.dark.failed + results.highContrast.failed;
    const totalWarnings = results.light.warnings + results.dark.warnings + results.highContrast.warnings;

    console.log('\n🏆 OVERALL RESULTS');
    console.log('==================');
    console.log(`✅ Total Passed: ${totalPassed}`);
    console.log(`⚠️  Total Warnings: ${totalWarnings}`);
    console.log(`❌ Total Failed: ${totalFailed}`);

    if (totalFailed > 0) {
        console.log('\n💡 Recommendations:');
        console.log('- Adjust colors with failed ratios to meet WCAG AA (4.5:1) standard');
        console.log('- Consider using AAA (7:1) standard for critical UI elements');
        console.log('- Test with actual users who have visual impairments');
        process.exit(1);
    } else {
        console.log('\n🎉 All themes pass WCAG accessibility standards!');
        process.exit(0);
    }
}

if (require.main === module) {
    main();
}

module.exports = { getContrastRatio, checkContrast };
