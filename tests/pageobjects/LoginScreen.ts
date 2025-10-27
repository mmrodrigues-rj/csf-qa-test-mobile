import { browser } from '@wdio/globals';
import BaseScreen from './BaseScreen';
import { waitVisible } from '../helpers/waits';

class LoginScreen extends BaseScreen {
  // --- Navegação (bottom tab) ---
  get tabLoginByA11y() { return '~Login'; }
  get tabLoginByDesc() { return 'android=new UiSelector().description("Login")'; }
  get tabLoginByText() { return 'android=new UiSelector().textContains("Login")'; }

  // --- Campos e botão (preferir accessibilityId) ---
  get fldEmailA11y() { return '~input-email'; }
  get fldPassA11y()  { return '~input-password'; }
  get btnLoginA11y() { return '~button-LOGIN'; }

  // Fallbacks por resource-id (varia entre builds)
  get fldEmailId()   { return 'android=new UiSelector().resourceId("com.wdiodemoapp:id/input-email")'; }
  get fldPassId()    { return 'android=new UiSelector().resourceId("com.wdiodemoapp:id/input-password")'; }
  get btnLoginId()   { return 'android=new UiSelector().resourceId("com.wdiodemoapp:id/btn-login")'; }
  // alternativa comum em outras versões
  get btnLoginIdAlt(){ return 'android=new UiSelector().resourceIdMatches(".*id/(btn[-_]?login|loginBtn)$")'; }

  // Mensagens de erro/sucesso
  get lblError()        { return 'android=new UiSelector().resourceId("com.wdiodemoapp:id/textinput_error")'; }
  get lblSnack()        { return 'android=new UiSelector().resourceId("com.wdiodemoapp:id/snackbar_text")'; }
  get lblSuccessText()  { return 'android=new UiSelector().textContains("You are logged in")'; }
  get lblSuccessA11y()  { return '~You are logged in'; }
  // opcional: algumas builds exibem dialog nativo
  get lblDialogMsg()    { return 'android=new UiSelector().resourceId("android:id/message")'; }

  // helper: pega o primeiro seletor que aparecer
  async pick<T extends string>(...sels: T[]): Promise<T> {
    for (const s of sels) {
      try {
        const el = await waitVisible(s, 2000);
        if (el) return s;
      } catch { /* tenta o próximo */ }
    }
    return sels[0];
  }

  async open() {
    // já está na tela de login?
    if (await this.isVisible(this.fldEmailA11y) || await this.isVisible(this.fldEmailId)) return;

    // tocar na tab inferior "Login"
    const tabSel = await this.pick(this.tabLoginByA11y, this.tabLoginByDesc, this.tabLoginByText);
    await this.tap(tabSel);

    // aguardar o formulário
    const emailSel = await this.pick(this.fldEmailA11y, this.fldEmailId);
    await waitVisible(emailSel, 8000);
  }

  async login(user: string, pass: string) {
    await this.open();

    const emailSel = await this.pick(this.fldEmailA11y, this.fldEmailId);
    const passSel  = await this.pick(this.fldPassA11y,  this.fldPassId);
    const btnSel   = await this.pick(this.btnLoginA11y, this.btnLoginId, this.btnLoginIdAlt);

    await this.type(emailSel, String(user ?? ''));
    await this.type(passSel,  String(pass ?? ''));
    await this.tap(btnSel);
  }

  /**
   * Lê o texto de confirmação/erro (Snackbar, texto de sucesso ou diálogo).
   * Retorna o texto encontrado ou null.
   */
  async readSnackText(timeout = 5000): Promise<string | null> {
    const candidatos = [
      this.lblSuccessText,   // textContains("You are logged in")
      this.lblSuccessA11y,   // ~You are logged in
      this.lblSnack,         // snackbar_text
      this.lblDialogMsg      // dialogs nativos em algumas builds
    ];

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
        } catch { /* tenta o próximo */ }
      }
      await browser.pause(200);
    }
    return null;
  }

  async successVisible() {
    // tenta ler o texto primeiro (mais confiável)
    const txt = await this.readSnackText(3000);
    if (txt && /logged in/i.test(txt)) return true;

    // fallback: apenas visibilidade de elementos
    return (await this.isVisible(this.lblSuccessText))
        || (await this.isVisible(this.lblSuccessA11y))
        || (await this.isVisible(this.lblSnack))
        || (await this.isVisible(this.lblDialogMsg));
  }
}

export default new LoginScreen();

