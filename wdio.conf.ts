// wdio.conf.ts
// types from 'webdriverio' are available via tsconfig "types"
import { join } from 'path'

/**
 * Plataforma alvo (default: android)
 *   export PLATFORM=ios | android
 */
const PLATFORM = (process.env.PLATFORM || 'android').toLowerCase()

/**
 * Apps (podem ser sobrescritos por env)
 */
const ANDROID_APP = process.env.ANDROID_APP || 'apps/android/native-demo-app.apk'
const IOS_APP     = process.env.IOS_APP     || 'apps/ios/WdioDemoApp.app'

/**
 * Porta/host do Appium (no CI iniciamos fora do WDIO)
 */
const APPIUM_HOST = process.env.APPIUM_HOST || '127.0.0.1'
const APPIUM_PORT = Number(process.env.APPIUM_PORT || 4723)
const APPIUM_PATH = process.env.APPIUM_BASE_PATH || '/'

/**
 * Screenshots:
 *   - sempre que houver erro (padrão)
 *   - e, opcionalmente, a cada passo se SCREENSHOTS_EVERY_STEP=1
 */
const SCREENSHOTS_EVERY_STEP = String(process.env.SCREENSHOTS_EVERY_STEP || '0') === '1'

/**
 * logLevel: normaliza valor vindo do env.
 * (O tipo do WDIO já aceita esses literais; para evitar chiado de tipos em
 * ambientes heterogêneos, fazemos um cast controlado no uso.)
 */
const LOG_LEVEL = (() => {
  const raw = String(process.env.WDIO_LOGLEVEL ?? 'warn').toLowerCase()
  const allowed = ['trace', 'debug', 'info', 'warn', 'error', 'silent'] as const
  return (allowed.includes(raw as any) ? raw : 'warn') as (typeof allowed)[number]
})()

/**
 * Capacidades de acordo com a plataforma
 */
function buildCaps() {
  if (PLATFORM === 'ios') {
    return [
      {
        platformName: 'iOS',
        'appium:automationName': 'XCUITest',
        'appium:deviceName': process.env.IOS_DEVICE || 'iPhone 15',
        'appium:platformVersion': process.env.IOS_PLATFORM_VERSION || '17.5',
        'appium:app': IOS_APP,
        'appium:newCommandTimeout': 240,
        'appium:autoAcceptAlerts': true
      }
    ]
  }

  // android (default)
  return [
    {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': process.env.ANDROID_DEVICE || 'Android Emulator',
      'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION || '14',
      'appium:app': ANDROID_APP,
      'appium:newCommandTimeout': 240,
      'appium:autoGrantPermissions': true,
      'appium:uiautomator2ServerInstallTimeout': 120000,
      'appium:adbExecTimeout': 120000,
      'appium:appWaitActivity': '*'
    }
  ]
}

export const config = {
  //
  // Runner
  //
  runner: 'local',

  maxInstances: 1,

  //
  // Conexão com o Appium (externo)
  //
  hostname: APPIUM_HOST,
  port: APPIUM_PORT,
  path: APPIUM_PATH,
  protocol: 'http',

  //
  // Projetos / specs
  //
  specs: ['./tests/specs/**/*.spec.ts'],
  exclude: [],

  //
  // Logs e timeouts
  //
  // Cast para evitar ruído de tipos em setups onde o d.ts difere.
  logLevel: LOG_LEVEL as any,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  //
  // Framework
  //
  framework: 'mocha',
  mochaOpts: {
    timeout: 120000
  },

  //
  // Capabilities
  //
  capabilities: buildCaps(),

  //
  // Services:
  //   No CI subimos Appium fora do WDIO (actions). Localmente você pode habilitar:
  //   services: [['appium', { args: { relaxedSecurity: true } }]],
  //
  services: [],

  //
  // Reporters
  //
  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: join(process.cwd(), 'reports', 'allure-results'),
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: true
      }
    ]
  ],

  //
  // Hooks
  //
  before: async () => {
    // Pequena proteção para apps “pesados”
    await browser.setTimeout({ implicit: 5000, pageLoad: 60000, script: 30000 })
  },

  /**
   * Screenshot em cada passo (se habilitado) e sempre que houver erro.
   * Tipado de forma ampla para evitar atritos com versões do WDIO.
   */
  afterStep: async function (_test: any, _context: any, result: { error?: Error; passed?: boolean }) {
    const mustShot = !!result?.error || SCREENSHOTS_EVERY_STEP
    if (!mustShot) return

    try {
      const png = await browser.takeScreenshot()
      const label = result?.error ? 'screenshot (after step error)' : 'screenshot (after step)'
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const allure = require('@wdio/allure-reporter').default
      allure.addAttachment(label, Buffer.from(png, 'base64'), 'image/png')
    } catch {
      /* ignora falha de screenshot */
    }
  },

  /**
   * Screenshot adicional em falha de teste (por segurança)
   */
  afterTest: async function (_test: any, _context: any, { passed }: { passed: boolean }) {
    if (passed) return
    try {
      const png = await browser.takeScreenshot()
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const allure = require('@wdio/allure-reporter').default
      allure.addAttachment('screenshot (after test fail)', Buffer.from(png, 'base64'), 'image/png')
    } catch {
      /* ignora */
    }
  }
} as unknown as WebdriverIO.Config

export default config
