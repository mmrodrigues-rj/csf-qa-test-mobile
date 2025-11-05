import { browser } from '@wdio/globals';

export async function isSettingsFallback(): Promise<boolean> {
  // WDIO pode expor as caps com ou sem prefixo 'appium:'
  let caps: any | undefined;
  try {
    const getCaps = (browser as any).getAppiumSessionCapabilities;
    if (typeof getCaps === 'function') {
      // Alguns providers (ex.: BrowserStack) não suportam GET /appium/capabilities
      // então envolvemos em try/catch e caímos no plano B.
      caps = await getCaps.call(browser);
    }
  } catch {
    // ignora; vamos tentar o fallback abaixo
  }

  caps = caps ?? (browser as any).capabilities ?? {};
  const pkg = caps['appium:appPackage'] ?? caps.appPackage;
  return pkg === 'com.android.settings';
}
