import * as fs from 'fs';
import * as path from 'path';
import { browser } from '@wdio/globals';

/**
 * ====== Variáveis ======
 * PLATFORM: android | ios
 * ANDROID_APP: caminho do APK (se não setar, usa apps/android/native-demo-app.apk)
 * IOS_APP: caminho do .app/.ipa (apenas se for usar iOS)
 */
const PLATFORM = (process.env.PLATFORM || 'android').toLowerCase();

const ANDROID_APP =
  process.env.ANDROID_APP ||
  path.resolve(__dirname, 'apps', 'android', 'native-demo-app.apk');

const IOS_APP =
  process.env.IOS_APP ||
  path.resolve(__dirname, 'apps', 'ios', 'MyApp.app'); // placeholder p/ iOS

function androidCaps() {
  return [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': process.env.ANDROID_DEVICE || 'Android Emulator',
      'appium:platformVersion': process.env.ANDROID_VERSION || '14',

      // ===== App nativo (APK) =====
      'appium:app': ANDROID_APP,

      // Qualidade de vida
      'appium:noReset': false,
      'appium:newCommandTimeout': 240,
      'appium:autoGrantPermissions': true
    }
  ];
}

function iosCaps() {
  return [
    {
      platformName: 'iOS',
      'appium:automationName': 'XCUITest',
      'appium:deviceName': process.env.IOS_DEVICE || 'iPhone 15',
      'appium:platformVersion': process.env.IOS_VERSION || '17.5',
      'appium:app': IOS_APP,
      'appium:noReset': false,
      'appium:newCommandTimeout': 240
    }
  ];
}

export const config: WebdriverIO.Config = {
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

  // Appium local (v3)
  hostname: process.env.APPIUM_HOST || '127.0.0.1',
  port: Number(process.env.APPIUM_PORT || 4723),
  path: process.env.APPIUM_PATH || '/',

  framework: 'mocha',

  reporters: [
  'spec',
  [
    'allure',
    {
      outputDir: 'allure-results',
      disableWebdriverStepsReporting: true,
      disableWebdriverScreenshotsReporting: false,
      useCucumberStepReporter: false
    }
  ]
] as any,

  mochaOpts: {
    ui: 'bdd',
    timeout: 180000
  },

  // Transpilar TS on-the-fly
 

  /**
   * Screenshot manual quando um teste falhar (usa takeScreenshot)
   */
 afterTest: async (...args: any[]) => {
  const [test, _context, result] = args;
  const passed: boolean = !!result?.passed;

  if (!passed) {
    const pngBase64 = await (browser as any).takeScreenshot();
    const outDir = path.resolve(__dirname, 'reports', 'screenshots');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const safeName = String(test?.title || 'failed').replace(/[^\w.-]+/g, '_');
    const file = path.join(outDir, `${safeName}.png`);
    fs.writeFileSync(file, Buffer.from(pngBase64, 'base64'));
  }
},
};

export default config;
