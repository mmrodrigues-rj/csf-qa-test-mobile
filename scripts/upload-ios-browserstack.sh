#!/bin/bash
# Upload iOS app to BrowserStack and test
# Run this script to manually test iOS upload before CI

set -euo pipefail

echo "🚀 Testing iOS Upload to BrowserStack..."
echo ""

# Check credentials
if [[ -z "${BROWSERSTACK_USERNAME:-}" ]] || [[ -z "${BROWSERSTACK_ACCESS_KEY:-}" ]]; then
  echo "❌ Missing credentials!"
  echo "Set BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY environment variables"
  exit 1
fi

echo "✅ Credentials found"

# Create zip
echo ""
echo "📦 Creating iOS app zip..."
cd apps/ios
if [[ -f "wdiodemoapp.zip" ]]; then
  rm wdiodemoapp.zip
fi
zip -r wdiodemoapp.zip Payload/
echo "✅ Created wdiodemoapp.zip ($(du -h wdiodemoapp.zip | cut -f1))"
cd ../..

# Upload to BrowserStack
echo ""
echo "☁️  Uploading to BrowserStack..."
CUSTOM_ID="wdio-native-demo-ios-v1_0_8"

upload_resp=$(curl -sS -u "${BROWSERSTACK_USERNAME}:${BROWSERSTACK_ACCESS_KEY}" \
  -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
  -F "file=@apps/ios/wdiodemoapp.zip" \
  -F "custom_id=${CUSTOM_ID}")

echo ""
echo "📋 Upload Response:"
echo "${upload_resp}" | jq '.' 2>/dev/null || echo "${upload_resp}"

# Extract app_url
app_url=$(echo "${upload_resp}" | jq -r '.app_url // empty' 2>/dev/null || echo "")

if [[ -z "${app_url}" ]]; then
  echo ""
  echo "❌ Failed to upload app or extract app_url"
  exit 1
fi

echo ""
echo "✅ Upload successful!"
echo "App URL: ${app_url}"
echo ""
echo "📋 You can now run tests with:"
echo "  export BROWSERSTACK_APP_URL='${app_url}'"
echo "  npm run test:browserstack:ios"
