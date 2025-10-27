import { expect } from 'chai';
import Signup from '../pageobjects/SignupScreen';
const data = require('../data/users.json');

// Gera e-mail único mesmo que o base esteja ausente ou sem domínio
function uniqueEmail(base?: string) {
  const safe = (base && String(base).trim()) || 'qa@example.com';
  const hasAt = safe.includes('@');
  const [userRaw, domainRaw] = hasAt ? safe.split('@') : [safe, 'example.com'];
  const user = userRaw.replace(/\+.*$/,'');    // remove +tag se houver
  const domain = domainRaw || 'example.com';
  const suffix = Date.now().toString().slice(-6);
  return `${user}+${suffix}@${domain}`;
}

describe('Sign up | Sucesso', () => {
  it('a) email/senha válidos (valida Snackbar)', async () => {
    const baseEmail = data?.valid?.email ?? 'qa@example.com';
    const email = uniqueEmail(baseEmail);

    await Signup.create({
      name: 'QA User',
      email,
      password: data?.valid?.password ?? 'Password123',
      repeat:   data?.valid?.password ?? 'Password123',
      acceptTerms: true
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

