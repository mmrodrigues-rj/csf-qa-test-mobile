import { browser } from '@wdio/globals';
import BaseScreen from './BaseScreen';
import { waitVisible } from '../helpers/waits';

class FormsScreen extends BaseScreen {
  // ----- bottom tabs -----
  get tabHome()    { return '~Home'; }
  get tabWebview() { return '~Webview'; }
  get tabLogin()   { return '~Login'; }
  get tabForms()   { return '~Forms'; }
  get tabSwipe()   { return '~Swipe'; }
  get tabDrag()    { return '~Drag'; }

  // ----- Forms: campos -----
  get fldInput()      { return '~text-input'; }
  get lblTyped()      { return '~input-text-result'; }
  get swToggle()      { return '~switch'; }
  get lblSwitchTip()  { return '~switch-text'; }

  // Spinner/Dropdown
  get ddSelect()      { return '~Dropdown'; } // content-desc no demo

  // Botões
  get btnActive()     { return '~button-Active'; }

  // Snackbar e Diálogo
  get lblSnack()      { return 'android=new UiSelector().resourceId("com.wdiodemoapp:id/snackbar_text")'; }
  get dlgMessage()    { return 'android=new UiSelector().resourceId("android:id/message")'; }
  get dlgOk()         { return 'android=new UiSelector().resourceId("android:id/button1")'; }
  get dlgCancel()     { return 'android=new UiSelector().resourceId("android:id/button2")'; }
  get dlgLater()      { return 'android=new UiSelector().resourceId("android:id/button3")'; }

  // ----- util: swipe curto para cima -----
  private async tinySwipeUp() {
    const { height, width } = await browser.getWindowSize();
    const startY = Math.floor(height * 0.70);
    const endY   = Math.floor(height * 0.35);
    const x      = Math.floor(width * 0.5);

    const d = browser as any;
    await d.performActions([{
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x, y: startY },
        { type: 'pointerDown', button: 1 },
        { type: 'pause', duration: 80 },
        { type: 'pointerMove', duration: 320, x, y: endY },
        { type: 'pointerUp', button: 1 }
      ]
    }]);
    await d.releaseActions();
    await browser.pause(150);
  }

  // ----- navegação até a tela Forms -----
  async open() {
    if (await this.isVisible(this.fldInput)) return;
    await this.tap(this.tabForms);
    try {
      await waitVisible(this.fldInput, 4000);
    } catch {
      await this.tinySwipeUp();
      await waitVisible(this.fldInput, 4000);
    }
  }

  // ----- Input -----
  async typeInInput(text: string) {
    await this.type(this.fldInput, text);
  }
  async readTyped(): Promise<string> {
    const el = await this.el(this.lblTyped);
    return (el as any).getText();
  }

  // ----- Switch -----
  async setSwitch(shouldBeOn: boolean) {
    const el = await this.el(this.swToggle);
    const checked = String(await (el as any).getAttribute('checked')).toLowerCase() === 'true';
    if (checked !== shouldBeOn) {
      await (el as any).click();
      await browser.pause(150);
    }
  }
  async readSwitchTip(): Promise<string> {
    const el = await this.el(this.lblSwitchTip);
    return (el as any).getText();
  }

  // ----- Dropdown -----
  private buildCheckedItemSelector(text: string) {
    const safe = text.replace(/"/g, '\\"');
    return `android=new UiSelector().className("android.widget.CheckedTextView").textMatches("(?i).*${safe}.*")`;
  }

  /** Abre a lista e toca no item com o texto fornecido */
  async chooseDropdown(optionText: string) {
    // garantir visibilidade do spinner
    for (let i = 0; i < 3; i++) {
      try {
        const el = await this.el(this.ddSelect);
        if (await (el as any).isDisplayed()) break;
      } catch {}
      await this.tinySwipeUp();
    }

    await this.tap(this.ddSelect);

    const itemSel = this.buildCheckedItemSelector(optionText);
    await waitVisible(itemSel, 4000);
    const item = await this.el(itemSel);
    await (item as any).click();

    // pequena pausa para a seleção refletir
    await browser.pause(200);
  }

  /**
   * Reabre o dropdown e verifica se o item está marcado (checked="true").
   * Fecha a lista via back ao final.
   */
  async isDropdownItemChecked(optionText: string): Promise<boolean> {
    await this.tap(this.ddSelect);

    const itemSel = this.buildCheckedItemSelector(optionText);
    await waitVisible(itemSel, 4000);

    try {
      const item = await this.el(itemSel);
      const checked = String(await (item as any).getAttribute('checked')).toLowerCase();
      return checked === 'true';
    } finally {
      // fecha a lista
      await browser.back();
      await browser.pause(150);
    }
  }

  // ----- Botões -----
  async tapActive() {
    for (let i = 0; i < 4; i++) {
      try {
        const el = await this.el(this.btnActive);
        if (await (el as any).isDisplayed()) break;
      } catch {}
      await this.tinySwipeUp();
    }
    await this.tap(this.btnActive);
  }

  // ----- Snackbar (com fallback para Diálogo) -----
  async readSnack(timeoutMs = 6000): Promise<string | null> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      // snackbar
      try {
        const el = await this.el(this.lblSnack);
        if (await (el as any).isDisplayed()) {
          const t = String(await (el as any).getText()).trim();
          if (t) return t;
        }
      } catch {}

      // diálogo
      try {
        const dlg = await this.el(this.dlgMessage);
        if (await (dlg as any).isDisplayed()) {
          const t = String(await (dlg as any).getText()).trim();
          try {
            const ok = await this.el(this.dlgOk);
            if (await (ok as any).isDisplayed()) await (ok as any).click();
          } catch {}
          if (t) return t;
        }
      } catch {}

      await browser.pause(200);
    }
    return null;
  }
}

export default new FormsScreen();
