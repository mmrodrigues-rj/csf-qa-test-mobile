import { browser } from '@wdio/globals';
import BaseScreen from './BaseScreen';
import { waitVisible } from '../helpers/waits';

class SignupScreen extends BaseScreen {
  // --- Navegação (aba inferior) ---
  get tabSignUpA11y() { return '~Sign up'; }
  get tabSignUpDesc() { return 'android=new UiSelector().descriptionContains("Sign")'; }
  get tabSignUpText() { return 'android=new UiSelector().textContains("Sign")'; }

  // --- Campos (a11y) ---
  get fldNameA11y()    { return '~input-name'; }
  get fldEmailA11y()   { return '~input-email'; }
  get fldPassA11y()    { return '~input-password'; }
  get fldRepeatA11y()  { return '~input-repeat-password'; }
  get chkTermsA11y()   { return '~input-terms'; }
  get btnSignUpA11y()  { return '~button-SIGN UP'; }

  // --- Fallbacks por resource-id (varia por build) ---
  get fldNameId()      { return 'android=new UiSelector().resourceId("com.wdiodemoapp:id/input-name")'; }
  get fldEmailId()     { return 'android=new UiSelector().resourceId("com.wdiodemoapp:id/input-email")'; }
  get fldPassId()      { return 'android=new UiSelector().resourceId("com.wdiodemoapp:id/input-password")'; }
  get fldRepeatId()    { return 'android=new UiSelector().resourceId("com.wdiodemoapp:id/input-repeat-password")'; }
  get chkTermsId()     { return 'android=new UiSelector().resourceIdMatches(".*id/(input-terms|switch-terms|terms)")'; }
  get btnSignUpId()    { return 'android=new UiSelector().resourceId("com.wdiodemoapp:id/btn-sign-up")'; }
  get btnSignUpIdAlt() { return 'android=new UiSelector().resourceIdMatches(".*id/(btn[-_]?signup|signupBtn)$")'; }

  // --- Mensagens ---
  get lblError()        { return 'android=new UiSelector().resourceId("com.wdiodemoapp:id/textinput_error")'; }
  get lblSnack()        { return 'android=new UiSelector().resourceId("com.wdiodemoapp:id/snackbar_text")'; }
  get lblSuccessText()  { return 'android=new UiSelector().textContains("successfully signed up")'; }
  get lblDialogMsg()    { return 'android=new UiSelector().resourceId("android:id/message")'; }

  // util: pega o primeiro seletor que aparecer
  async pick<T extends string>(...sels: T[]): Promise<T> {
    for (const s of sels) {
      try { const el = await waitVisible(s, 2000); if (el) return s; } catch {}
    }
    return sels[0];
  }

  async open() {
    // já está no formulário de signup?
    if (await this.isVisible(this.fldNameA11y) || await this.isVisible(this.fldNameId)) return;

    const tabSel = await this.pick(this.tabSignUpA11y, this.tabSignUpDesc, this.tabSignUpText);
    await this.tap(tabSel);

    const nameSel = await this.pick(this.fldNameA11y, this.fldNameId);
    await waitVisible(nameSel, 8000);
  }

  async fill(data: { name?: string; email?: string; password?: string; repeat?: string; acceptTerms?: boolean }) {
    const nameSel   = await this.pick(this.fldNameA11y,  this.fldNameId);
    const emailSel  = await this.pick(this.fldEmailA11y, this.fldEmailId);
    const passSel   = await this.pick(this.fldPassA11y,  this.fldPassId);
    const repeatSel = await this.pick(this.fldRepeatA11y,this.fldRepeatId);

    if (data.name !== undefined)   await this.type(nameSel,   String(data.name ?? ''));
    if (data.email !== undefined)  await this.type(emailSel,  String(data.email ?? ''));
    if (data.password !== undefined) await this.type(passSel, String(data.password ?? ''));
    if (data.repeat !== undefined)   await this.type(repeatSel,String(data.repeat ?? ''));

    if (typeof data.acceptTerms === 'boolean') {
      const termsSel = await this.pick(this.chkTermsA11y, this.chkTermsId);
      const el = await this.el(termsSel);
      const checked = await (el as any).getAttribute('checked'); // "true"/"false" em switches
      const isOn = String(checked).toLowerCase() === 'true';
      if (data.acceptTerms !== isOn) {
        await (el as any).click();
      }
    }
  }

  async submit() {
    const btnSel = await this.pick(this.btnSignUpA11y, this.btnSignUpId, this.btnSignUpIdAlt);
    await this.tap(btnSel);
  }

  async create(user: { name: string; email: string; password: string; repeat: string; acceptTerms: boolean }) {
    await this.open();
    await this.fill(user);
    await this.submit();
  }

  async readSnackText(timeout = 5000): Promise<string | null> {
    const candidatos = [this.lblSuccessText, this.lblSnack, this.lblDialogMsg];
    const start = Date.now();
    while (Date.now() - start < timeout) {
      for (const s of candidatos) {
        try {
          const el = await this.el(s);
          if (await (el as any).isDisplayed()) {
            const txt = await (el as any).getText();
            const val = String(txt ?? '').trim();
            if (val) return val;
          }
        } catch {}
      }
      await browser.pause(200);
    }
    return null;
  }

  async successVisible() {
    const txt = await this.readSnackText(3000);
    if (txt && /successfully signed up/i.test(txt)) return true;

    return (await this.isVisible(this.lblSuccessText))
        || (await this.isVisible(this.lblSnack))
        || (await this.isVisible(this.lblDialogMsg));
  }
}

export default new SignupScreen();
