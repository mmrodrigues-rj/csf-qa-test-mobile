import { browser } from '@wdio/globals';

export const Device = {
  async back() { await (browser as any).back(); },
  async pause(ms = 500) { await (browser as any).pause(ms); }
};
