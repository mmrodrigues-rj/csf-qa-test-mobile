import { browser } from '@wdio/globals';
import BaseScreen from './BaseScreen';
import { waitVisible } from '../helpers/waits';

class SignupScreen extends BaseScreen {
  // --- Navegação (aba inferior) - mesma da LoginScreen ---
  get tabLoginByA11y() { return '~Login'; }
  get tabLoginByDesc() { return 'android=new UiSelector().descriptionContains("Login")'; }
  get tabLoginByText() { return 'android=new UiSelector().textContains("Login")'; }

  // --- Toggle/aba interna "Sign up" (várias alternativas) ---
  get tabSignUpA11y()     { return '~Sign up'; }                        // a11y clássico
  get tabSignUpA11yAlt()  { return '~Sign Up'; }                        // variação de caixa
  get tabSignUpDesc()     { return 'android=new UiSelector().descriptionMatches("(?i)sign\\s*up")'; }
  get tabSignUpText()     { return 'android=new UiSelector().textMatches("(?i)sign\\s*up")'; }
  get tabSignUpText2()    { return 'android=new UiSelector().textContains("Sign up")'; }
  get tabSignUpXpath()    { return '//android.widget.TextView[matches(@text,"(?i)sign\\s*up")]'; }
  // alguns layouts usam botões dentro de um segmented control
  get tabSignUpBtnXpath() { return '//*[@content-desc and matches(@content-desc,"(?i)sign\\s*up")]'; }

  // --- Campos (a11y) ---
  get fldNameA11y()    { return '~input-name'; }
  get fldEmailA11y()   { return '~input-email'; }
  get fldPassA11y()    { return '~input-password'; }
  get fldRepeatA11y()  { return '~input-repeat-password'; }
  get chkTermsA11y()   { return '~input-terms'; }
  get btnSignUpA11y()  { return '~button-SIGN UP'; }

  // --- Fallbacks por resource-id ---
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
    // Se já estou vendo o campo "Repeat password", já estou na aba Sign up
    if (await this.isVisible(this.fldRepeatA11y) || await this.isVisible(this.fldRepeatId)) return;

    // 1) garantir que estamos na tela Login (aba inferior)
    const tabLogin = await this.pick(this.tabLoginByA11y, this.tabLoginByDesc, this.tabLoginByText);
    await this.tap(tabLogin);

    // 2) tentar alternar para a aba "Sign up" (dentro da tela Login)
    const signUpToggle = await this.pick(
      this.tabSignUpA11y,
      this.tabSignUpA11yAlt,
      this.tabSignUpDesc,
      this.tabSignUpText,
      this.tabSignUpText2,
      this.tabSignUpXpath,
      this.tabSignUpBtnXpath
    );
    await this.tap(signUpToggle);

    // 3) aguardar o formulário de cadastro (campo repeat) ficar visível
    const repeatSel = await this.pick(this.fldRepeatA11y, this.fldRepeatId);
    try {
      await waitVisible(repeatSel, 8000);
    } catch (e) {
      // ajuda de depuração se algo mudar na UI
      const src = await browser.getPageSource();
      console.log('Não encontrei o campo Repeat após tocar na aba "Sign up". Trecho do pageSource:', src.slice(0, 800));
      throw e;
    }
  }

  async fill(data: { name?: string; email?: string; password?: string; repeat?: string; acceptTerms?: boolean }) {
    const nameSel   = await this.pick(this.fldNameA11y,  this.fldNameId);
    const emailSel  = await this.pick(this.fldEmailA11y, this.fldEmailId);
    const passSel   = await this.pick(this.fldPassA11y,  this.fldPassId);
    const repeatSel = await this.pick(this.fldRepeatA11y,this.fldRepeatId);

    if (data.name !== undefined)     await this.type(nameSel,   String(data.name ?? ''));
    if (data.email !== undefined)    await this.type(emailSel,  String(data.email ?? ''));
    if (data.password !== undefined) await this.type(passSel,   String(data.password ?? ''));
    if (data.repeat !== undefined)   await this.type(repeatSel, String(data.repeat ?? ''));

    if (typeof data.acceptTerms === 'boolean') {
      const termsSel = await this.pick(this.chkTermsA11y, this.chkTermsId);
      const el = await this.el(termsSel);
      const checked = await (el as any).getAttribute('checked'); // "true"/"false"
      const isOn = String(checked).toLowerCase() === 'true';
      if (data.acceptTerms !== isOn) await (el as any).click();
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
    if (txt && /success|signed up|account/i.test(txt)) return true;
    return (await this.isVisible(this.lblSuccessText))
        || (await this.isVisible(this.lblSnack))
        || (await this.isVisible(this.lblDialogMsg));
  }
}

export default new SignupScreen();
