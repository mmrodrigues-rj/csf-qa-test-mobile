import { browser } from '@wdio/globals';

export async function waitVisible(
  target: string | any,
  timeout = 10_000
) {
  const el = typeof target === 'string' ? await browser.$(target) : target;
  await (el as any).waitForDisplayed({ timeout });
  return el;
}

export async function waitGone(
  target: string | any,
  timeout = 10_000
) {
  const el = typeof target === 'string' ? await browser.$(target) : target;
  await (el as any).waitForDisplayed({ timeout, reverse: true });
}
