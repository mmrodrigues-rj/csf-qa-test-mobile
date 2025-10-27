import { expect } from 'chai';
import { browser } from '@wdio/globals';
import { App } from '../pageobjects/App';

describe('Smoke | App launch', () => {
  it('abre a sessão do Appium e retorna pageSource', async () => {
    // Garante que a sessão está ativa (evita warnings e aquece capacidades)
    if (typeof (browser as any).getAppiumSessionCapabilities === 'function') {
      await (browser as any).getAppiumSessionCapabilities();
    }

    // Valida a sessão
    expect(browser.sessionId).to.be.a('string');

    // Screenshot inicial
    await App.stepShot('launch');

    // Valida que algo foi renderizado
    const xml = await (browser as any).getPageSource();
    expect(xml && xml.length).to.be.greaterThan(50);
  });
});
