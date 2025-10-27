import { browser } from '@wdio/globals';

export async function waitVisible(
  target: string | WebdriverIO.Element,
  timeout = 10000
) {
  const el =
    typeof target === 'string' ? await browser.$(target) : (target as any);
  await (el as any).waitForDisplayed({ timeout });
  return el as WebdriverIO.Element;
}

export async function waitGone(
  target: string | WebdriverIO.Element,
  timeout = 10000
) {
  const el =
    typeof target === 'string' ? await browser.$(target) : (target as any);
  await (el as any).waitForDisplayed({ timeout, reverse: true });
}
