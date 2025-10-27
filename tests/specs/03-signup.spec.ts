import { expect } from 'chai';
import { browser } from '@wdio/globals';
import Signup from '../pageobjects/SignupScreen';
// se preferir ES import, garanta "resolveJsonModule": true no tsconfig
const data = require('../data/users.json');

// Gera e-mail único mesmo que o base esteja ausente ou sem domínio
function uniqueEmail(base?: string) {
  const safe = (base && String(base).trim()) || 'qa@example.com';
  const hasAt = safe.includes('@');
  const [userRaw, domainRaw] = hasAt ? safe.split('@') : [safe, 'example.com'];
  const user = userRaw.replace(/\+.*$/, ''); // remove +tag
  const domain = domainRaw || 'example.com';
  const suffix = Date.now().toString().slice(-6);
  return `${user}+${suffix}@${domain}`;
}

describe('Sign up | Sucesso', () => {
  it('a) email/senha válidos (valida Snackbar)', async () => {
    const baseEmail: string = data?.valid?.email ?? 'qa@example.com';
    const email = uniqueEmail(baseEmail);

    await Signup.create({
      email,
      password: 'Abcdef12!',
      repeat: 'Abcdef12!',
      acceptTerms: true,
    });

    const snack = await Signup.readSnackText(7000);

    // dica de depuração se não aparecer snackbar
    if (!snack) {
      const src = await browser.getPageSource();
      console.log('Snack não capturado. Trecho do pageSource:', src.slice(0, 600));
    }

    expect(snack, 'esperava mensagem de sucesso no Snackbar').to.be.a('string');
    expect(/success|signed up|logged in/i.test(String(snack)), `Snackbar inesperado: "${snack}"`).to.equal(true);
  });
});

