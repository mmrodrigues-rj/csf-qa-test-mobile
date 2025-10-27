import * as fs from 'fs';
import * as path from 'path';
import { browser } from '@wdio/globals';

const PLATFORM = (process.env.PLATFORM || 'android').toLowerCase(); // android | ios
const ANDROID_APP = process.env.ANDROID_APP || path.resolve(__dirname, 'apps', 'android', 'app-debug.apk');
const IOS_APP     = process.env.IOS_APP     || path.resolve(__dirname, 'apps', 'ios', 'MyApp.app'); // .app (simulador) ou .ipa (device)

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

export const config = {
  runner: 'local',

  specs: ['./tests/specs/**/*.ts'],
  exclude: [],

  maxInstances: 1,

  // escolhe as caps pela variável PLATFORM
  capabilities: PLATFORM === 'ios' ? iosCaps() : androidCaps(),

  logLevel: 'info',
  bail: 0,

  baseUrl: 'http://localhost',
  waitforTimeout: 15000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  // Appium local (suba com: npm run appium)
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

  // Screenshot manual quando um teste falhar (usando takeScreenshot)
  afterTest: async function (test: any, _context: any, { passed }: { passed: boolean }) {
    if (!passed) {
      const pngBase64 = await (browser as any).takeScreenshot();
      const outDir = path.resolve(__dirname, 'reports', 'screenshots');
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const safeName = String(test?.title || 'failed').replace(/[^\w.-]+/g, '_');
      const file = path.join(outDir, `${safeName}.png`);
      fs.writeFileSync(file, Buffer.from(pngBase64, 'base64'));
    }
  }
};

export default config;
