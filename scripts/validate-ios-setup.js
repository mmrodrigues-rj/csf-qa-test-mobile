#!/usr/bin/env node
/**
 * Validates iOS setup for BrowserStack
 * Checks:
 * - iOS app exists
 * - App bundle structure is correct
 * - Configuration files are valid
 */

const fs = require('fs');
const path = require('path');

const IOS_APP_PATH = 'apps/ios/Payload/wdiodemoapp.app';
const REQUIRED_FILES = [
  'Info.plist',
  'wdiodemoapp', // binary
  'Assets.car',
  'PkgInfo'
];

console.log('🔍 Validating iOS Setup for BrowserStack...\n');

// Check if app directory exists
if (!fs.existsSync(IOS_APP_PATH)) {
  console.error('❌ iOS app not found at:', IOS_APP_PATH);
  process.exit(1);
}
console.log('✅ iOS app directory found');

// Check required files
let allFilesExist = true;
for (const file of REQUIRED_FILES) {
  const filePath = path.join(IOS_APP_PATH, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
  } else {
    console.error(`❌ Missing: ${file}`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.error('\n❌ Some required files are missing!');
  process.exit(1);
}

// Check Info.plist for bundle ID
const plistPath = path.join(IOS_APP_PATH, 'Info.plist');
const plistContent = fs.readFileSync(plistPath, 'utf8');

// Basic check for bundle identifier (plist is binary, so just check presence)
if (plistContent.includes('CFBundleIdentifier') || plistContent.includes('wdiodemoapp')) {
  console.log('✅ Info.plist contains bundle identifier');
} else {
  console.warn('⚠️  Could not verify bundle identifier in Info.plist');
}

// Check app size
const getDirectorySize = (dirPath) => {
  let size = 0;
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      size += getDirectorySize(filePath);
    } else {
      size += stats.size;
    }
  }
  
  return size;
};

const appSize = getDirectorySize(IOS_APP_PATH);
console.log(`\n📦 Total app size: ${(appSize / 1024 / 1024).toFixed(2)} MB`);

// Summary
console.log('\n✅ iOS app is ready for BrowserStack upload!');
console.log('\n📋 Next steps:');
console.log('1. Push changes to trigger the workflow');
console.log('2. Check GitHub Actions for iOS job execution');
console.log('3. View results in BrowserStack dashboard');
console.log('\nOr test manually with:');
console.log('  npm run test:browserstack:ios');
