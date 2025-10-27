import { browser } from '@wdio/globals';
import { waitVisible } from '../helpers/waits';

export default class BaseScreen {
  async el(sel: string): Promise<any> {
    return browser.$(sel) as any;
  }

  async tap(sel: string) {
    const e = await this.el(sel);
    await waitVisible(e);
    await (e as any).click();
  }

  async type(sel: string, text: string) {
    const e = await this.el(sel);
    await waitVisible(e);
    if (typeof (e as any).clearValue === 'function') {
      await (e as any).clearValue();
    }
    await (e as any).setValue(text);
  }

  async isVisible(sel: string) {
    const e = await this.el(sel);
    return (e as any).isDisplayed();
  }
}
