import BaseScreen from './BaseScreen';

class LoginScreen extends BaseScreen {
  // Abre a tela de Login pelo menu/tab
  get tabLogin()   { return 'android=new UiSelector().textContains("Login")'; }

  // Campos da tela de login do app demo (ids típicos do native-demo-app)
  get fldEmail()   { return 'android=new UiSelector().resourceId("com.wdiodemoapp:id/input-email")'; }
  get fldPass()    { return 'android=new UiSelector().resourceId("com.wdiodemoapp:id/input-password")'; }
  get btnLogin()   { return 'android=new UiSelector().resourceId("com.wdiodemoapp:id/btn-login")'; }

  // Mensagens/validações (uma dessas costuma aparecer conforme a versão)
  get lblError()   { return 'android=new UiSelector().resourceId("com.wdiodemoapp:id/textinput_error")'; }
  get lblSnack()   { return 'android=new UiSelector().resourceId("com.wdiodemoapp:id/snackbar_text")'; }
  get lblSuccess() { return 'android=new UiSelector().textContains("You are logged in")'; }

  async open() {
    await this.tap(this.tabLogin);
  }

  async login(user: string, pass: string) {
    await this.open();
    await this.type(this.fldEmail, user);
    await this.type(this.fldPass, pass);
    await this.tap(this.btnLogin);
  }
}

export default new LoginScreen();
