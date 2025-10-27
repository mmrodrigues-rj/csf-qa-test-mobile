import { browser } from '@wdio/globals';
import BaseScreen from './BaseScreen';
import { waitVisible } from '../helpers/waits';

class SignupScreen extends BaseScreen {
  // --- Navegação (aba inferior) - mesma da LoginScreen ---
  get tabLoginByA11y() { return '~Login'; }
  get tabLoginByDesc() { return 'android=new UiSelector().descriptionContains("Login")'; }
  get tabLoginByText() { return 'android=new UiSelector().textContains("Login")'; }

  // --- Toggle/aba interna "Sign up" (várias alternativas) ---
  get tabSignUpA11y()     { return '~Sign up'; }
  get tabSignUpA11yAlt()  { return '~Sign Up'; }
  get tabSignUpDesc()     { return 'android=new UiSelector().descriptionMatches("(?i)sign\\s*up")'; }
  get tabSignUpText()     { return 'android=new UiSelector().textMatches("(?i)sign\\s*up")'; }
  get tabSignUpText2()    { return 'android=new UiSelector().textContains("Sign up")'; }
  get tabSignUpXpath()    { return '//android.widget.TextView[matches(@text,"(?i)sign\\s*up")]'; }
  get tabSignUpBtnXpath() { return '//*[@content-desc and matches(@content-desc,"(?i)sign\\s*up")]'; }

  // --- Campos (a11y) ---  (sem "name" neste build)
  get fldEmailA11y()   { return '~input-email'; }
  get fldPassA11y()    { return '~input-password'; }
  get fldRepeatA11y()  { return '~input-repeat-password'; }
  get chkTermsA11y()   { return '~input-terms'; }
  get btnSignUpA11y()  { return '~button-SIGN UP'; }

  // --- Fallbacks por resource-id ---
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

  /**
   * swipe vertical curto (para cima = 1, para baixo = -1)
   */
  private async tinySwipe(direction: 1 | -1 = 1) {
    const { height, width } = await browser.getWindowSize();
    const startY = Math.floor(height * (direction === 1 ? 0.70 : 0.30));
    const endY   = Math.floor(height * (direction === 1 ? 0.30 : 0.70));
    const x      = Math.floor(width * 0.5);

    const d = browser as any;
    await d.performActions([{
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' },
      actions: [
        { type: 'pointerMove', duration: 0, x, y: startY },
        { type: 'pointerDown', button: 1 },
        { type: 'pause', duration: 100 },
        { type: 'pointerMove', duration: 400, x, y: endY },
        { type: 'pointerUp', button: 1 }
      ]
    }]);
    await d.releaseActions();
    await browser.pause(200);
  }

  /**
   * Garante visibilidade tentando vários seletores e rolando entre as tentativas.
   * Retorna o seletor que ficou visível, ou null se nenhum aparecer.
   */
  private async ensureVisibleAny(candidates: string[], rounds = 3, timeoutPerTry = 1200): Promise<string | null> {
    for (let r = 0; r < rounds; r++) {
      for (const s of candidates) {
        try {
          const el = await this.el(s);
          await (el as any).waitForDisplayed({ timeout: timeoutPerTry });
          return s;
        } catch {}
      }
      await this.tinySwipe(1);
    }
    return null;
  }

  async open() {
    // Se já vejo "Repeat password", já estou na aba Sign up
    if (await this.isVisible(this.fldRepeatA11y) || await this.isVisible(this.fldRepeatId)) return;

    // 1) ir para a tela Login (aba inferior)
    const tabLogin = await this.pick(this.tabLoginByA11y, this.tabLoginByDesc, this.tabLoginByText);
    await this.tap(tabLogin);

    // 2) alternar para a sub-aba "Sign up"
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

    // 3) aguardar inputs; se não vierem, fazer swipes curtos e revalidar
    const anchors = [this.fldRepeatA11y, this.fldRepeatId, this.fldEmailA11y, this.fldEmailId];
    let ok = false;
    for (let i = 0; i < 5; i++) {
      for (const a of anchors) {
        try {
          const el = await this.el(a);
          if (await (el as any).isDisplayed()) { ok = true; break; }
        } catch {}
      }
      if (ok) break;
      await this.tinySwipe(1);
    }

    if (!ok) {
      const src = await browser.getPageSource();
      console.log('Sign up: inputs não ficaram visíveis. PageSource snippet:', src.slice(0, 800));
      const repeatSel = await this.pick(this.fldRepeatA11y, this.fldRepeatId);
      await waitVisible(repeatSel, 8000);
    }
  }

  async fill(data: { email?: string; password?: string; repeat?: string; acceptTerms?: boolean }) {
    const emailSel  = await this.pick(this.fldEmailA11y, this.fldEmailId);
    const passSel   = await this.pick(this.fldPassA11y,  this.fldPassId);
    const repeatSel = await this.pick(this.fldRepeatA11y,this.fldRepeatId);

    const ensure = async (sel: string) => {
      for (let i = 0; i < 3; i++) {
        try {
          const e = await this.el(sel);
          if (await (e as any).isDisplayed()) return;
        } catch {}
        await this.tinySwipe(1);
      }
      await waitVisible(sel, 5000);
    };

    if (data.email !== undefined)    { await ensure(emailSel);  await this.type(emailSel,  String(data.email ?? '')); }
    if (data.password !== undefined) { await ensure(passSel);   await this.type(passSel,   String(data.password ?? '')); }
    if (data.repeat !== undefined)   { await ensure(repeatSel); await this.type(repeatSel, String(data.repeat ?? '')); }

    if (typeof data.acceptTerms === 'boolean') {
      // tenta vários seletores e rola até achar
      const termsSel = await this.ensureVisibleAny([this.chkTermsA11y, this.chkTermsId], 3, 1200);
      if (termsSel) {
        const el = await this.el(termsSel);
        const checked = await (el as any).getAttribute('checked'); // "true"/"false"
        const isOn = String(checked).toLowerCase() === 'true';
        if (data.acceptTerms !== isOn) await (el as any).click();
      } else {
        console.log('⚠️ Switch de termos não encontrado; prosseguindo sem marcar');
      }
    }
  }

  async submit() {
    const btnSel = await this.pick(this.btnSignUpA11y, this.btnSignUpId, this.btnSignUpIdAlt);
    await this.tap(btnSel);
  }

  async create(user: { email: string; password: string; repeat: string; acceptTerms: boolean }) {
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

  /** Novo: detecta presença de mensagens/indicadores de erro de validação. */
  async anyErrorVisible(): Promise<boolean> {
    if (await this.isVisible(this.lblError)) return true;

    if (await this.isVisible(this.lblSnack)) {
      try {
        const el = await this.el(this.lblSnack);
        const txt = String(await (el as any).getText() ?? '').toLowerCase();
        if (txt && /error|invalid|senha|email|required|preencha|mismatch/.test(txt)) return true;
      } catch {}
    }

    if (await this.isVisible(this.lblDialogMsg)) {
      try {
        const el = await this.el(this.lblDialogMsg);
        const txt = String(await (el as any).getText() ?? '').toLowerCase();
        if (txt && /error|invalid|senha|email|required|preencha|mismatch/.test(txt)) return true;
      } catch {}
    }

    return false;
  }

  /** Novo: verifica se o formulário de Sign up ainda está na tela. */
  async formExists(): Promise<boolean> {
    const parts = [
      this.fldEmailA11y, this.fldEmailId,
      this.fldPassA11y,  this.fldPassId,
      this.fldRepeatA11y,this.fldRepeatId,
      this.chkTermsA11y, this.chkTermsId,
      this.btnSignUpA11y,this.btnSignUpId, this.btnSignUpIdAlt
    ];

    for (const s of parts) {
      try {
        const el = await this.el(s);
        if (await (el as any).isDisplayed()) return true;
      } catch {}
    }
    return false;
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
