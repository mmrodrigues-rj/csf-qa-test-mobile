import { expect } from 'chai';
import { browser } from '@wdio/globals';
import { App } from '../pageobjects/App';

describe('Smoke | App launch', () => {
  it('abre a sessão do Appium e retorna pageSource', async () => {
    // Confirma que a sessão está ativa
    const session = await browser.getSession();
    expect(session.sessionId).to.be.a('string');

    // Screenshot inicial
    await App.stepShot('launch');

    // Valida que algo foi renderizado
    const xml = await browser.getPageSource();
    expect(xml.length).to.be.greaterThan(50);
  });
});
