import { expect } from 'chai'
import Signup from '../pageobjects/SignupScreen'

describe('Sign up | Validações negativas', () => {

  async function expectSignupBlocked(msg: string) {
    // dá um pequeno tempo para renderizar validações/snackbar
    await browser.pause(400);

    const success = await Signup.successVisible();     // não deveria ter sucesso
    const hasErr  = await Signup.anyErrorVisible();    // deveria ter erro inline, em geral
    const exists  = await Signup.formExists();         // formulário ainda existe no DOM

    // 1) nunca deve sinalizar sucesso
    expect(success, `não deveria ter sucesso (${msg})`).to.equal(false);

    // 2) deve haver erro inline OU ao menos o formulário continuar existindo
    expect(hasErr || exists, `formulário deveria continuar visível (${msg})`)
      .to.equal(true);
  }

  beforeEach(async () => {
    // garante que estamos na aba Sign up antes de cada cenário
    await Signup.open();
  });

  it('b) email inválido', async () => {
    await Signup.create({
      email: 'fulano@@',            // inválido
      password: 'Abcdef12!',
      repeat:   'Abcdef12!',
      acceptTerms: true
    });
    await expectSignupBlocked('email inválido');
  });

  it('c) senha curta', async () => {
    await Signup.create({
      email: 'qa+short@example.com',
      password: 'Abc12',            // < 8
      repeat:   'Abc12',
      acceptTerms: true
    });
    await expectSignupBlocked('senha curta');
  });

  it('d) campo email vazio', async () => {
    await Signup.create({
      email: '',
      password: 'Abcdef12!',
      repeat:   'Abcdef12!',
      acceptTerms: true
    });
    await expectSignupBlocked('email vazio');
  });

  it('e) campo senha vazio', async () => {
    await Signup.create({
      email: 'qa+empty@example.com',
      password: '',
      repeat:   '',
      acceptTerms: true
    });
    await expectSignupBlocked('senha vazia');
  });

  it('f) campo confirmar senha vazio', async () => {
    await Signup.create({
      email: 'qa+confempty@example.com',
      password: 'Abcdef12!',
      repeat:   '',
      acceptTerms: true
    });
    await expectSignupBlocked('confirmar senha vazio');
  });

  it('g) confirmar senha diferente da senha', async () => {
    await Signup.create({
      email: 'qa+diff@example.com',
      password: 'Abcdef12!',
      repeat:   'Abcdef12?',         // diferente
      acceptTerms: true
    });
    await expectSignupBlocked('senhas diferentes');
  });
});
