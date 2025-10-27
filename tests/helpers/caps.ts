import { browser } from '@wdio/globals';

export async function isSettingsFallback(): Promise<boolean> {
  // WDIO pode expor as caps com ou sem prefixo 'appium:'
  const caps: any = (await (browser as any).getAppiumSessionCapabilities?.()) ?? (browser as any).capabilities ?? {};
  const pkg = caps['appium:appPackage'] ?? caps.appPackage;
  return pkg === 'com.android.settings';
}
