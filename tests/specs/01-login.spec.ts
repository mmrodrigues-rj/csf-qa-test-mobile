import { expect } from 'chai';
import Login from '../pageobjects/LoginScreen';

describe('Login | Sucesso', () => {
  it('deve autenticar com sucesso (valida Snackbar)', async () => {
    // O app de demo aceita qualquer e-mail válido + senha >= 8 chars
    await Login.login('test@webdriver.io', 'Password123');

    const snack = await Login.readSnackText(5000);
    // Comentário: o objetivo aqui é validar o retorno do app ao autenticar,
    // já que não há redirecionamento de tela. O texto pode variar por build,
    // então usamos "logged in" de forma case-insensitive.
    expect(snack, 'esperava mensagem de sucesso no Snackbar').to.be.a('string');
    expect(/logged in/i.test(String(snack)), `Snackbar inesperado: "${snack}"`).to.equal(true);
  });
});
