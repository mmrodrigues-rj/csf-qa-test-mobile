// tests/pageobjects/FormsScreen.ts
import { browser } from '@wdio/globals';
import BaseScreen from './BaseScreen';
import { waitVisible } from '../helpers/waits';

class FormsScreen extends BaseScreen {
  // --- bottom tabs ---
  get tabHome()   { return '~Home'; }
  get tabWebview(){ return '~Webview'; }
  get tabLogin()  { return '~Login'; }
  get tabForms()  { return '~Forms'; }
  get tabSwipe()  { return '~Swipe'; }
  get tabDrag()   { return '~Drag'; }

  // --- Forms (a11y do app demo) ---
  get fldInput()     { return '~text-input'; }
  get lblTyped()     { return '~input-text-result'; }
  get swToggle()     { return '~switch'; }
  get lblSwitch()    { return '~switch-text'; }
  get ddSelect()     { return '~Dropdown'; }
  get btnActive()    { return '~button-Active'; }
  get btnInactive()  { return '~button-Inactive'; }
  get lblSnack()     { return 'android=new UiSelector().resourceId("com.wdiodemoapp:id/snackbar_text")'; }

  // --- util: pega o primeiro que aparecer ---
  private async pick(...sels: string[]) {
    for (const s of sels) {
      try { const el = await waitVisible(s, 1200); if (el) return s; } catch {}
    }
    return sels[0];
  }

  // pequeno swipe (caso algo esteja fora da viewport)
  private async tinySwipeUp() {
    const { height, width } = await browser.getWindowSize();
    const x = Math.floor(width * 0.5);
    const y1 = Math.floor(height * 0.70);
    const y2 = Math.floor(height * 0.35);
    const d = browser as any;
    await d.performActions([{
      type: 'pointer', id: 'finger', parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x, y: y1 },
        { type: 'pointerDown', button: 1 },
        { type: 'pointerMove', duration: 350, x, y: y2 },
        { type: 'pointerUp', button: 1 }
      ]
    }]);
    await d.releaseActions();
    await browser.pause(150);
  }

  // --- navegação até a tela Forms ---
  async open() {
    // já estou na tela?
    if (await this.isVisible(this.fldInput)) return;

    await this.tap(this.tabForms());

    // se não aparecer de primeira, faz um pequeno swipe e revalida
    try {
      await waitVisible(this.fldInput, 4000);
    } catch {
      await this.tinySwipeUp();
      await waitVisible(this.fldInput, 4000);
    }
  }

  // --- ações / leituras usadas no spec ---

  async typeInInput(text: string) {
    await this.open();
    await this.type(this.fldInput, text);
  }

  async readTyped(): Promise<string> {
    const el = await this.el(this.lblTyped);
    return String(await (el as any).getText());
  }

  async setSwitch(on: boolean) {
    // garante que os elementos do switch estão visíveis
    for (let i = 0; i < 2; i++) {
      if (await this.isVisible(this.swToggle) && await this.isVisible(this.lblSwitch)) break;
      await this.tinySwipeUp();
    }

    const el = await this.el(this.swToggle);
    const cur = String(await (el as any).getAttribute('checked')).toLowerCase() === 'true';
    if (cur !== on) await (el as any).click();
  }

  async readSwitchTip(): Promise<string> {
    const el = await this.el(this.lblSwitch);
    return String((await (el as any).getText()) ?? '');
  }

  async chooseDropdown(valuePartial: string) {
    // abre o dropdown (spinner)
    await this.tap(this.ddSelect);

    // toca no item por texto parcial (case-insensitive)
    const itemSel = `android=new UiSelector().className("android.widget.CheckedTextView").textContains("${valuePartial}")`;
    const el = await this.el(itemSel);
    await (el as any).click();
  }

  async readDropdown(): Promise<string> {
    // após a escolha, o próprio componente mostra o valor selecionado
    const el = await this.el(this.ddSelect);
    const txt = await (el as any).getText();
    return String(txt ?? '');
  }

  async tapActive() {
    // garante que o botão esteja visível
    for (let i = 0; i < 2; i++) {
      if (await this.isVisible(this.btnActive)) break;
      await this.tinySwipeUp();
    }
    await this.tap(this.btnActive);
  }

  async readSnack(timeout = 5000): Promise<string | null> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        const el = await this.el(this.lblSnack);
        if (await (el as any).isDisplayed()) {
          const t = await (el as any).getText();
          const v = String(t ?? '').trim();
          if (v) return v;
        }
      } catch {}
      await browser.pause(150);
    }
    return null;
  }
}

export default new FormsScreen();
