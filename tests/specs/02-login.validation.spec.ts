import { expect } from 'chai';
import Login from '../pageobjects/LoginScreen';

// helper: garante que o login NÃO foi bem-sucedido e que ainda estamos no form
async function expectLoginBlocked(motivo: string) {
  // pequeno yield pra UI responder
  await browser.pause(300);

  // 1) não apareceu confirmação de sucesso
  const ok = await Login.successVisible();
  expect(ok, `não deveria autenticar (${motivo})`).to.equal(false);

  // 2) ainda estamos na tela de login (campo de email visível)
  const stillOnForm =
    (await Login.isVisible(Login.fldEmailA11y)) ||
    (await Login.isVisible(Login.fldEmailId));
  expect(stillOnForm, `formulário deveria continuar visível (${motivo})`).to.equal(true);
}

describe('Login | Validações negativas', () => {

  beforeEach(async () => {
    // Garante que estamos na aba de Login antes de cada teste
    await Login.open();
  });

  it('a) e-mail mal formatado', async () => {
    await Login.login('invalido@@dominio', 'senhaValida123');
    await expectLoginBlocked('e-mail mal formatado');
  });

  it('b) e-mail vazio', async () => {
    await Login.login('', 'senhaValida123');
    await expectLoginBlocked('e-mail vazio');
  });

  it('c) senha curta (< 8)', async () => {
    await Login.login('qa@example.com', '12345'); // 5 chars
    await expectLoginBlocked('senha curta');
  });

  it('d) sem senha', async () => {
    await Login.login('qa@example.com', '');
    await expectLoginBlocked('senha vazia');
  });
});
