// wdio.conf.ts
import type { Options } from '@wdio/types';

const PLATFORM = (process.env.PLATFORM || 'android').toLowerCase();

const ANDROID_APP = process.env.ANDROID_APP || 'apps/android/native-demo-app.apk';
const IOS_APP     = process.env.IOS_APP     || 'apps/ios/WdioDemoApp.app';

type Caps = WebdriverIO.Capabilities;

function buildCaps(): Caps[] {
  if (PLATFORM === 'ios') {
    const caps: Caps = {
      platformName: 'iOS',
      'appium:automationName': 'XCUITest',
      'appium:deviceName': process.env.IOS_DEVICE || 'iPhone 15',
      ...(process.env.IOS_PLATFORM_VERSION
        ? { 'appium:platformVersion': process.env.IOS_PLATFORM_VERSION }
        : {}),
      ...(process.env.IOS_UDID ? { 'appium:udid': process.env.IOS_UDID } : {}),
      'appium:app': IOS_APP,
      'appium:newCommandTimeout': 120,
      'appium:autoAcceptAlerts': true,
    };
    return [caps];
  }

  const caps: Caps = {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.ANDROID_DEVICE || 'Android Emulator',
    ...(process.env.ANDROID_PLATFORM_VERSION
      ? { 'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION }
      : {}),
    'appium:app': ANDROID_APP,
    'appium:autoGrantPermissions': true,
    'appium:autoDismissAlerts': true,
    'appium:newCommandTimeout': 120,
    'appium:appWaitActivity': process.env.ANDROID_APP_WAIT_ACTIVITY || '*',
  };
  return [caps];
}

const SPECS = process.env.SPEC
  ? [process.env.SPEC]
  : ['tests/specs/**/*.spec.ts'];

export const config: Options.Testrunner & { capabilities?: Caps[] } = {
  runner: 'local',
  tsConfigPath: './tsconfig.json',

  hostname: process.env.APPIUM_HOST || '127.0.0.1',
  port: Number(process.env.APPIUM_PORT || 4723),
  // Appium 2 usa '/' por padrão; ajuste se seu servidor estiver em outro path
  path: process.env.APPIUM_BASE_PATH || '/',

  specs: SPECS,
  exclude: [],

  maxInstances: 1,

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
  },

  logLevel: (process.env.WDIO_LOG_LEVEL as Options.Testrunner['logLevel']) || 'info',
  outputDir: 'logs',

  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,

  reporters: ['spec'],

  capabilities: buildCaps(),

  before: async () => {
    await browser.setTimeout({ implicit: 0, pageLoad: 60000, script: 60000 });
  },

  beforeTest: async () => {
    if (process.env.CI) await browser.pause(100);
  },
};

export default config;
