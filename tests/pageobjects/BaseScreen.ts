import { browser } from '@wdio/globals';
import { waitVisible } from '../helpers/waits';

export default class BaseScreen {
  async el(sel: string): Promise<any> {
    return (browser as any).$(sel);
  }

  async tap(sel: string) {
    const e = await this.el(sel);
    await waitVisible(e as any);
    await (e as any).click();
  }

  async type(sel: string, text: string) {
    const e = await this.el(sel);
    await waitVisible(e as any);
    try {
      if (typeof (e as any).clearValue === 'function') {
        await (e as any).clearValue();
      }
    } catch {}
    await (e as any).setValue(String(text ?? ''));
  }

  async isVisible(sel: string) {
    try {
      const e = await this.el(sel);
      return await (e as any).isDisplayed();
    } catch {
      return false;
    }
  }

  async textOf(sel: string): Promise<string> {
    const e = await this.el(sel);
    await waitVisible(e as any);
    return (e as any).getText();
  }
}
