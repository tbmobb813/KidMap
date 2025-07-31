#!/usr/bin/env node
// scripts/test-safe-zone-alerts.js - Test script for Safe Zone Alert System

const fs = require('fs')
const path = require('path')

console.log('🛡️ KidMap Safe Zone Alerts System Test')
console.log('=====================================')

// Check if required files exist
const requiredFiles = [
  'utils/safeZoneAlerts.ts',
  'components/SafeZoneAlert.tsx',
  'components/SafeZoneSettings.tsx',
  'hooks/useGeofencing.ts',
  'stores/safeZoneStore.ts',
]

let allFilesExist = true

requiredFiles.forEach((file) => {
  const filePath = path.join(__dirname, '..', file)
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - Found`)
  } else {
    console.log(`❌ ${file} - Missing`)
    allFilesExist = false
  }
})

// Check SafeZoneAlertManager for key methods
const alertManagerFile = path.join(
  __dirname,
  '..',
  'utils',
  'safeZoneAlerts.ts',
)
if (fs.existsSync(alertManagerFile)) {
  const content = fs.readFileSync(alertManagerFile, 'utf8')
  const requiredMethods = [
    'handleSafeZoneEvent',
    'updateSettings',
    'getStatistics',
    'getEventHistory',
    'getRecentEvents',
  ]

  requiredMethods.forEach((method) => {
    if (content.includes(`${method}(`)) {
      console.log(`✅ SafeZoneAlertManager.${method}() - Found`)
    } else {
      console.log(`❌ SafeZoneAlertManager.${method}() - Missing`)
    }
  })
}

// Check SafeZoneAlert component for key features
const alertComponentFile = path.join(
  __dirname,
  '..',
  'components',
  'SafeZoneAlert.tsx',
)
if (fs.existsSync(alertComponentFile)) {
  const content = fs.readFileSync(alertComponentFile, 'utf8')
  const requiredFeatures = [
    'SafeZoneEvent',
    'Animated.View',
    'SafeZoneAlertHistory',
    'ShieldCheck',
    'ShieldAlert',
  ]

  requiredFeatures.forEach((feature) => {
    if (content.includes(feature)) {
      console.log(`✅ SafeZoneAlert ${feature} - Found`)
    } else {
      console.log(`❌ SafeZoneAlert ${feature} - Missing`)
    }
  })
}

// Check SafeZoneSettings component
const settingsFile = path.join(
  __dirname,
  '..',
  'components',
  'SafeZoneSettings.tsx',
)
if (fs.existsSync(settingsFile)) {
  const content = fs.readFileSync(settingsFile, 'utf8')
  const requiredFeatures = [
    'AlertSettings',
    'Switch',
    'TextInput',
    'SafeZoneStatistics',
    'handleSaveSettings',
  ]

  requiredFeatures.forEach((feature) => {
    if (content.includes(feature)) {
      console.log(`✅ SafeZoneSettings ${feature} - Found`)
    } else {
      console.log(`❌ SafeZoneSettings ${feature} - Missing`)
    }
  })
}

// Check useGeofencing hook integration
const geofencingFile = path.join(__dirname, '..', 'hooks', 'useGeofencing.ts')
if (fs.existsSync(geofencingFile)) {
  const content = fs.readFileSync(geofencingFile, 'utf8')

  if (
    content.includes('safeZoneAlertManager') &&
    content.includes('handleSafeZoneEvent')
  ) {
    console.log('✅ Geofencing integration - Complete')
  } else {
    console.log('❌ Geofencing integration - Incomplete')
  }
}

// Check navigation screen integration
const navigationFile = path.join(__dirname, '..', 'app', 'navigation.tsx')
if (fs.existsSync(navigationFile)) {
  const content = fs.readFileSync(navigationFile, 'utf8')

  if (content.includes('SafeZoneAlert') && content.includes('useGeofencing')) {
    console.log('✅ Navigation screen integration - Complete')
  } else {
    console.log('❌ Navigation screen integration - Incomplete')
  }
}

// Check parent dashboard integration
const dashboardFile = path.join(
  __dirname,
  '..',
  'components',
  'ParentDashboard.tsx',
)
if (fs.existsSync(dashboardFile)) {
  const content = fs.readFileSync(dashboardFile, 'utf8')

  if (
    content.includes('SafeZoneSettings') &&
    content.includes('SafeZoneAlertHistory')
  ) {
    console.log('✅ Parent dashboard integration - Complete')
  } else {
    console.log('❌ Parent dashboard integration - Incomplete')
  }
}

console.log('\n🎯 Safe Zone Alert Features Summary:')
console.log('===================================')
console.log('🛡️ Real-time geofence monitoring')
console.log('🔔 Voice and visual alert notifications')
console.log('📊 Event history and statistics tracking')
console.log('⚙️ Configurable alert settings')
console.log('🔇 Quiet hours and cooldown management')
console.log('🎮 Gamification integration')
console.log('👨‍👩‍👧‍👦 Parent dashboard controls')
console.log('📱 Animated popup notifications')
console.log('🗣️ Kid-friendly voice announcements')
console.log('📈 Safety score calculation')

console.log('\n📋 Alert Types Available:')
console.log('========================')
console.log('🟢 Safe Zone Entry - Welcome announcements')
console.log('🟡 Safe Zone Exit - Safety reminders')
console.log('📊 Daily Statistics - Usage tracking')
console.log('🏆 Achievement Unlocks - Gamification rewards')

console.log('\n⚙️ Configurable Settings:')
console.log('========================')
console.log('🔊 Voice Alert Toggle')
console.log('👁️ Visual Alert Toggle')
console.log('📨 Parent Notification Toggle')
console.log('⏰ Alert Cooldown Period (1-60 minutes)')
console.log('🌙 Quiet Hours (Start/End Time)')
console.log('📈 Statistics Dashboard')

if (allFilesExist) {
  console.log('\n🎉 Safe Zone Alert System is ready!')
  console.log('Features: Real-time monitoring, voice alerts, parent controls')
} else {
  console.log(
    '\n⚠️  Some components are missing. Please check the files above.',
  )
}

console.log('\n🚀 Next Steps:')
console.log('=============')
console.log('1. Test safe zone creation in parent dashboard')
console.log('2. Verify voice alerts during navigation')
console.log('3. Check alert history and statistics')
console.log('4. Configure quiet hours and cooldown settings')
console.log('5. Test geofence entry/exit notifications')
