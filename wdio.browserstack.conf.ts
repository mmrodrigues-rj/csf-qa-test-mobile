// wdio.browserstack.conf.ts
import type { Options } from '@wdio/types'

// Global browser instance from WebdriverIO
declare const browser: WebdriverIO.Browser

/**
 * BrowserStack credentials (from env)
 */
const BROWSERSTACK_USERNAME = process.env.BROWSERSTACK_USERNAME
const BROWSERSTACK_ACCESS_KEY = process.env.BROWSERSTACK_ACCESS_KEY

if (!BROWSERSTACK_USERNAME || !BROWSERSTACK_ACCESS_KEY) {
  throw new Error('BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY must be set')
}

/**
 * Platform (android or ios)
 */
const PLATFORM = (process.env.PLATFORM || 'android').toLowerCase()

/**
 * BrowserStack app URL (uploaded app)
 * Upload via: curl -u "USERNAME:ACCESS_KEY" -X POST "https://api-cloud.browserstack.com/app-automate/upload" -F "file=@/path/to/app"
 */
const BROWSERSTACK_APP_URL = process.env.BROWSERSTACK_APP_URL

/**
 * Build info for BrowserStack dashboard
 */
const BUILD_NAME = process.env.BROWSERSTACK_BUILD_NAME || `Build ${new Date().toISOString()}`
const PROJECT_NAME = process.env.BROWSERSTACK_PROJECT_NAME || 'CSF QA Test Mobile'

/**
 * BrowserStack capabilities
 */
function buildBrowserStackCaps() {
  const commonCaps = {
    'bstack:options': {
      userName: BROWSERSTACK_USERNAME,
      accessKey: BROWSERSTACK_ACCESS_KEY,
      projectName: PROJECT_NAME,
      buildName: BUILD_NAME,
      sessionName: `${PLATFORM.toUpperCase()} E2E Tests`,
      debug: true,
      networkLogs: true,
      appiumLogs: true,
      video: true,
      deviceLogs: true,
      local: false,
      // Timeout para comandos idle (em segundos)
      idleTimeout: 300,
    }
  }

  if (PLATFORM === 'ios') {
    return [
      {
        platformName: 'iOS',
        'appium:automationName': 'XCUITest',
        'appium:deviceName': process.env.IOS_DEVICE || 'iPhone 15',
        'appium:platformVersion': process.env.IOS_PLATFORM_VERSION || '17',
        'appium:app': BROWSERSTACK_APP_URL || process.env.BROWSERSTACK_IOS_APP_URL,
        'appium:newCommandTimeout': 240,
        'appium:autoAcceptAlerts': true,
        ...commonCaps
      }
    ]
  }

  // Android (default)
  return [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': process.env.ANDROID_DEVICE || 'Google Pixel 8',
      'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION || '14.0',
      'appium:app': BROWSERSTACK_APP_URL || process.env.BROWSERSTACK_ANDROID_APP_URL,
      'appium:newCommandTimeout': 240,
      'appium:autoGrantPermissions': true,
      ...commonCaps
    }
  ]
}

export const config = {
  // Runner
  runner: 'local',

  // BrowserStack uses their own hostname and port
  hostname: 'hub-cloud.browserstack.com',
  port: 443,
  protocol: 'https',
  path: '/wd/hub',

  // Auth for BrowserStack (required for session creation)
  user: process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_ACCESS_KEY,

  // Specs
  specs: [
    './tests/specs/**/*.spec.ts'
  ],
  exclude: [],

  // Capabilities with BrowserStack config
  capabilities: buildBrowserStackCaps(),

  // Test settings
  logLevel: 'info',
  bail: 0,
  baseUrl: '',
  waitforTimeout: 10000,
  connectionRetryTimeout: 180000,
  connectionRetryCount: 3,
  
  // Framework
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000
  },

  // Reporters
  reporters: [
    'spec',
    ['allure', {
      outputDir: 'allure-results',
      disableWebdriverStepsReporting: true,
      disableWebdriverScreenshotsReporting: false,
    }]
  ],

  // Services
  services: [
    [
      'browserstack',
      {
        browserstackLocal: false,
        opts: {
          forceLocal: false
        }
      }
    ]
  ],

  // Hooks
  before: function () {
    console.log('🚀 Starting BrowserStack session...')
    console.log('Platform:', PLATFORM)
    console.log('Build:', BUILD_NAME)
  },

  afterTest: async function(_test: any, _context: any, { passed }: { passed: boolean }) {
    if (!passed) {
      try {
        await (browser as any).takeScreenshot()
      } catch (e) {
        console.warn('Failed to take screenshot:', e)
      }
    }
  },

  after: function () {
    console.log('✅ BrowserStack session completed')
  },
} as unknown as Options.Testrunner
