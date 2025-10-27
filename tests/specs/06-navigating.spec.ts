// tests/specs/06-navigating.spec.ts
import { expect } from 'chai';
import Forms from '../pageobjects/FormsScreen';

describe('06 | Navigating + Forms interactions', () => {
  it('navega pelas abas e interage com a Forms', async () => {
    await Forms.tap(Forms.tabHome);
    await Forms.tap(Forms.tabWebview);
    await Forms.tap(Forms.tabLogin);
    await Forms.tap(Forms.tabForms);
    await Forms.tap(Forms.tabSwipe);
    await Forms.tap(Forms.tabDrag);
    await Forms.tap(Forms.tabForms);

    const text = 'hello QA - forms';
    await Forms.typeInInput(text);
    expect(await Forms.readTyped()).to.contain(text);

    await Forms.setSwitch(true);
    const tipOn = (await Forms.readSwitchTip()).toLowerCase();
    expect(tipOn).to.match(/(turn the switch on|^on\b)/);

    await Forms.setSwitch(false);
    const tipOff = (await Forms.readSwitchTip()).toLowerCase();
    expect(tipOff).to.match(/(turn the switch off|^off\b)/);

    await Forms.chooseDropdown('webdriver.io is awesome');
    const ddValue = (await Forms.readDropdown()).toLowerCase();   // <= aqui
    expect(ddValue).to.match(/webdriver\.io is awesome/);

    await Forms.tapActive();
    const snack = await Forms.readSnack(5000);                     // <= aqui
    expect(snack).to.be.a('string');
    expect(String(snack).toLowerCase()).to.match(/(active|button .* active)/);
  });
});
