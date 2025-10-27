import { expect } from 'chai';
import LoginScreen from '../pageobjects/LoginScreen';

const users = require('../data/users.json');

describe('Login', () => {
  it('deve recusar credenciais inválidas', async () => {
    await LoginScreen.login(users.invalid.username, users.invalid.password);
    const hasError = await LoginScreen.isVisible(LoginScreen.lblError);
    const hasSnack = await LoginScreen.isVisible(LoginScreen.lblSnack);
    expect(hasError || hasSnack).to.equal(true);
  });

  it('deve autenticar com sucesso', async () => {
    await LoginScreen.login(users.valid.username, users.valid.password);
    const ok = await LoginScreen.isVisible(LoginScreen.lblSuccess);
    expect(ok).to.equal(true);
  });
});
