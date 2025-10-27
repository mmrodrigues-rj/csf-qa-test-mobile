import { expect } from 'chai';
import Signup from '../pageobjects/SignupScreen';
const data = require('../data/users.json');

function uniqueEmail(base: string) {
  const [user, domain] = base.split('@');
  const suffix = Date.now().toString().slice(-6);
  return `${user}+${suffix}@${domain || 'example.com'}`;
}

describe('Sign up | Sucesso', () => {
  it('a) email/senha válidos (valida Snackbar)', async () => {
    const email = uniqueEmail(data.valid.email);
    await Signup.create({
      name: 'QA User',
      email,
      password: data.valid.password,
      repeat: data.valid.password,
      acceptTerms: true
    });

    const snack = await Signup.readSnackText(7000);
    expect(snack, 'esperava mensagem de sucesso no Snackbar').to.be.a('string');
    expect(/success|signed up|logged in/i.test(String(snack)), `Snackbar inesperado: "${snack}"`).to.equal(true);
  });
});
