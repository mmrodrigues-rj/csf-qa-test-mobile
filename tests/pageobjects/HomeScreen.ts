import BaseScreen from './BaseScreen';
class HomeScreen extends BaseScreen {
  get lblWelcome() { return 'android=new UiSelector().textContains("Bem-vindo")'; }
}
export default new HomeScreen();

