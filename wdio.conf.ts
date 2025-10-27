import type { Options } from '@wdio/types';
import * as path from 'path';

const PLATFORM = (process.env.PLATFORM || 'android').toLowerCase(); // android | ios
const ANDROID_APP = process.env.ANDROID_APP || path.resolve(__dirname, 'apps', 'android', 'app-debug.apk');
const IOS_APP     = process.env.IOS_APP     || path.resolve(__dirname, 'apps', 'ios', 'MyApp.app'); // ou .ipa se usar real device

function androidCaps() {
  return [{
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.ANDROID_DEVICE || 'Android Emulator',
    'appium:platformVersion': process.env.ANDROID_VERSION || '14',
    'appium:app': ANDROID_APP,
    'appium:noReset': false,
    'appium:newCommandTimeout': 240,
    'appium:autoGrantPermissions': true
  }];
}

function iosCaps() {
  return [{
    platformName: 'iOS',
    'appium:automationName': 'XCUITest',
    'appium:deviceName': process.env.IOS_DEVICE || 'iPhone 15',
    'appium:platformVersion': process.env.IOS_VERSION || '17.5',
    'appium:app': IOS_APP,
    'appium:noReset': false,
    'appium:newCommandTimeout': 240
  }];
}

export const config: Options.Testrunner = {
  runner: 'local',
  specs: ['./tests/specs/**/*.ts'],
  exclude: [],

  maxInstances: 1,

  capabilities: PLATFORM === 'ios' ? iosCaps() : androidCaps(),

  logLevel: 'info',

  bail: 0,
  baseUrl: 'http://localhost',
  waitforTimeout: 15000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  // Appium server rodando local em 0.0.0.0:4723 (use "npx appium" em outro terminal)
  hostname: process.env.APPIUM_HOST || '127.0.0.1',
  port: Number(process.env.APPIUM_PORT || 4723),
  path: process.env.APPIUM_PATH || '/',

  framework: 'mocha',
  reporters: [
    'spec',
    ['allure', {
      outputDir: 'allure-results',
      disableWebdriverStepsReporting: true,
      disableWebdriverScreenshotsReporting: false,
      useCucumberStepReporter: false
    }]
  ],

  mochaOpts: {
    ui: 'bdd',
    timeout: 180000
  },

  // Transpilar TS on-the-fly
  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      transpileOnly: true,
      project: './tsconfig.json'
    }
  },

  // Screenshot automático se um teste falhar
  afterTest: async function (_test, _context, { passed }) {
    if (!passed) {
      await browser.takeScreenshot();
    }
  }
};
