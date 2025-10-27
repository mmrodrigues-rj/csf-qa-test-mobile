import { expect } from 'chai';
import Forms from '../pageobjects/FormsScreen';

describe('06 | Navigating + Forms interactions (fatiado)', () => {
  it('input: digita e espelha o texto', async () => {
    await Forms.open();
    const text = 'hello forms';
    await Forms.typeInInput(text);
    expect((await Forms.readTyped()).toLowerCase()).to.contain(text);
  });

  it('switch: ligar mostra dica para desligar', async () => {
    await Forms.setSwitch(true);
    const tipOn = (await Forms.readSwitchTip()).toLowerCase();
    expect(tipOn).to.match(/(turn the switch off|^on\b)/);
  });

  it('switch: desligar mostra dica para ligar', async () => {
    await Forms.setSwitch(false);
    const tipOff = (await Forms.readSwitchTip()).toLowerCase();
    expect(tipOff).to.match(/(turn the switch on|^off\b)/);
  });

  it('dropdown: seleciona "webdriver.io is awesome" e valida', async () => {
    const option = 'webdriver.io is awesome';
    await Forms.chooseDropdown(option);
    const checked = await Forms.isDropdownItemChecked(option);
    expect(checked, 'item selecionado deveria aparecer marcado ao reabrir a lista').to.equal(true);
  });

  it('botão Active: dispara snackbar de sucesso', async () => {
    await Forms.tapActive();
    const snack = await Forms.readSnack(6000);
    expect(snack).to.be.a('string');
    expect(String(snack).toLowerCase()).to.match(/(active|button .* active)/);
  });
});
