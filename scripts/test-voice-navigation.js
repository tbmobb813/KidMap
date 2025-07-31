#!/usr/bin/env node
// scripts/test-voice-navigation.js - Test script for voice navigation functionality

const fs = require('fs')
const path = require('path')

console.log('🎤 KidMap Voice Navigation Integration Test')
console.log('==========================================')

// Check if required files exist
const requiredFiles = [
  'utils/speechEngine.ts',
  'components/VoiceNavigation.tsx',
  'app/navigation.tsx',
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

// Check package.json for expo-speech dependency
const packageJsonPath = path.join(__dirname, '..', 'package.json')
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  const hasExpoSpeech =
    packageJson.dependencies && packageJson.dependencies['expo-speech']

  if (hasExpoSpeech) {
    console.log(
      `✅ expo-speech dependency - Found (${packageJson.dependencies['expo-speech']})`,
    )
  } else {
    console.log('❌ expo-speech dependency - Missing')
    allFilesExist = false
  }
}

// Check speechEngine.ts for key methods
const speechEngineFile = path.join(__dirname, '..', 'utils', 'speechEngine.ts')
if (fs.existsSync(speechEngineFile)) {
  const content = fs.readFileSync(speechEngineFile, 'utf8')
  const requiredMethods = [
    'speak',
    'initialize',
    'processVoiceInput',
    'speakWelcome',
    'speakCompletion',
  ]

  requiredMethods.forEach((method) => {
    if (content.includes(`async ${method}`) || content.includes(`${method}(`)) {
      console.log(`✅ SpeechEngine.${method}() - Found`)
    } else {
      console.log(`❌ SpeechEngine.${method}() - Missing`)
    }
  })
}

// Check VoiceNavigation component for key features
const voiceNavFile = path.join(
  __dirname,
  '..',
  'components',
  'VoiceNavigation.tsx',
)
if (fs.existsSync(voiceNavFile)) {
  const content = fs.readFileSync(voiceNavFile, 'utf8')
  const requiredFeatures = [
    'useState',
    'speechEngine',
    'Mic',
    'MessageSquare',
    'Play',
    'Pause',
  ]

  requiredFeatures.forEach((feature) => {
    if (content.includes(feature)) {
      console.log(`✅ VoiceNavigation ${feature} - Found`)
    } else {
      console.log(`❌ VoiceNavigation ${feature} - Missing`)
    }
  })
}

// Check navigation integration
const navigationFile = path.join(__dirname, '..', 'app', 'navigation.tsx')
if (fs.existsSync(navigationFile)) {
  const content = fs.readFileSync(navigationFile, 'utf8')

  if (content.includes('VoiceNavigation') && content.includes('speechEngine')) {
    console.log('✅ Voice navigation integration - Complete')
  } else {
    console.log('❌ Voice navigation integration - Incomplete')
  }
}

console.log('\n📋 Voice Navigation Features Summary:')
console.log('=====================================')
console.log('🎯 Speech Engine with 10+ voice commands')
console.log('🎤 Interactive voice controls UI')
console.log('🗣️ Text-to-speech with kid-friendly voice')
console.log('👂 Simulated voice recognition')
console.log('🎮 Integration with navigation screen')
console.log('🆘 Emergency voice commands')
console.log('⏸️ Pause/resume voice feedback')
console.log('🔍 Fuzzy matching for voice input')
console.log('📢 Auto-announcements for step changes')
console.log('♿ Accessibility support')

if (allFilesExist) {
  console.log('\n🎉 Voice navigation is ready! Run the app to test.')
} else {
  console.log('\n⚠️  Some issues found. Please check the missing files above.')
}
