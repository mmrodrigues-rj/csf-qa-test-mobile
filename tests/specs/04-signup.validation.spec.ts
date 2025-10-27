import { expect } from 'chai';
import Signup from '../pageobjects/SignupScreen';
const data = require('../data/users.json');

// critério de bloqueio (sem depender de mensagem de erro):
async function expectSignupBlocked(motivo: string) {
  await browser.pause(300); // pequeno yield
  const ok = await Signup.successVisible();
  expect(ok, `não deveria concluir cadastro (${motivo})`).to.equal(false);

  const stillOnForm =
    (await Signup.isVisible(Signup.fldNameA11y)) ||
    (await Signup.isVisible(Signup.fldNameId));
  expect(stillOnForm, `formulário deveria continuar visível (${motivo})`).to.equal(true);
}

describe('Sign up | Validações negativas', () => {
  beforeEach(async () => { await Signup.open(); });

  it('b) email inválido', async () => {
    await Signup.create({
      name: 'User',
      email: data.invalid.email_format,
      password: data.valid.password,
      repeat: data.valid.password,
      acceptTerms: true
    });
    await expectSignupBlocked('email inválido');
  });

  it('c) senha curta', async () => {
    await Signup.create({
      name: 'User',
      email: 'qa@example.com',
      password: data.invalid.short_password,
      repeat: data.invalid.short_password,
      acceptTerms: true
    });
    await expectSignupBlocked('senha curta');
  });

  it('d) campo email vazio', async () => {
    await Signup.create({
      name: 'User',
      email: data.blank.email,
      password: data.valid.password,
      repeat: data.valid.password,
      acceptTerms: true
    });
    await expectSignupBlocked('email vazio');
  });

  it('e) campo senha vazio', async () => {
    await Signup.create({
      name: 'User',
      email: 'qa@example.com',
      password: data.blank.password,
      repeat: data.blank.password,
      acceptTerms: true
    });
    await expectSignupBlocked('senha vazia');
  });

  it('f) campo confirmar senha vazio', async () => {
    await Signup.create({
      name: 'User',
      email: 'qa@example.com',
      password: data.valid.password,
      repeat: '',
      acceptTerms: true
    });
    await expectSignupBlocked('confirmar senha vazio');
  });

  it('g) confirmar senha diferente da senha', async () => {
    await Signup.create({
      name: 'User',
      email: 'qa@example.com',
      password: 'Password123',
      repeat: 'Password999',
      acceptTerms: true
    });
    await expectSignupBlocked('senhas diferentes');
  });
});
