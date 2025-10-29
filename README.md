# CSF QA Test Mobile — WebdriverIO + Appium (Android/iOS-ready)

Projetinho de automação E2E mobile baseado no **Banco Carrefour — Desafio de Automação de Testes Mobile**.  
Stack principal: **Node 20**, **WebdriverIO (Mocha/TS)**, **Appium 3 + uiautomator2**, **Allure Report** e **GitHub Actions**.

> **Status:** Specs funcionais e CI Android em andamento. iOS planejado.

---

## 🔧 Requisitos

- **Node.js 20+** (verificado no CI com `actions/setup-node@v4`)
- **Java 17** (Temurin/JDK — usado no CI)
- **Android SDK** + **AVD** (por ex.: API 34, `google_apis`, `x86_64`, Pixel 5)
- **Appium 3** e **uiautomator2 driver**
- **Emulador Android** (ou device físico com depuração USB)

### Instalação de dependências (local)
```bash
npm ci
# ou
npm i
```

### Appium 3 + driver uiautomator2 (local)
```bash
npm i -D appium@^3
npx appium -v
# driver uiautomator2
npx appium driver install uiautomator2
npx appium driver list --installed
```

---

## 📁 Estrutura (resumo)

```
apps/
  android/native-demo-app.apk
tests/
  data/users.json
  helpers/waits.ts
  pageobjects/
    BaseScreen.ts
    LoginScreen.ts
    SignupScreen.ts
    FormScreen.ts
  specs/
    00-smoke.install.spec.ts
    01-login.spec.ts
    02-login.validation.spec.ts
    03-signup.spec.ts
    04-signup.validation.spec.ts
    05-error.message.spec.ts
    06-navigating.spec.ts
reports/
  allure-results/    # saída bruta
  allure-report/     # relatório gerado
wdio.conf.ts
.github/workflows/
  android-e2e.yml    # pipeline Android
```

---

## ⚙️ Configuração (wdio.conf.ts)

- Multi-plataforma via `PLATFORM=android|ios` (default: `android`).
- Conexão com Appium externo (CI inicia Appium fora do WDIO).
- Screenshots on-fail e (opcional) a cada passo (`SCREENSHOTS_EVERY_STEP=1`).
- Allure reporter em `reports/allure-results`.

**Variáveis úteis:**
- `PLATFORM` — `android` | `ios`
- `ANDROID_APP` — caminho do APK (default: `apps/android/native-demo-app.apk`)
- `IOS_APP` — caminho do .app/.ipa (default: `apps/ios/WdioDemoApp.app`)
- `APPIUM_HOST`, `APPIUM_PORT`, `APPIUM_BASE_PATH`
- `SCREENSHOTS_EVERY_STEP=1` para screenshot de todos os passos
- `WDIO_LOGLEVEL=debug|info|warn...`

---

## ▶️ Execução Local

### 1) Iniciar Appium
```bash
npx appium --port 4723 --base-path /
```

### 2) (Opcional) Iniciar emulador Android
```bash
# listar AVDs
emulator -list-avds

# iniciar (exemplo)
emulator -avd Pixel_5_API_34 -no-snapshot -no-boot-anim -noaudio
```

### 3) Rodar todos os testes
```bash
npm run test:android
# ou diretamente
npx wdio run wdio.conf.ts
```

### 4) Rodar **apenas uma spec**
```bash
npx wdio run wdio.conf.ts --spec tests/specs/00-smoke.install.spec.ts
```

> Dica Windows/PowerShell: se precisar, envolva o path em aspas.

---

## 🧪 Casos de Teste Implementados

1. **00-smoke.install.spec.ts** — Abre sessão Appium e valida `pageSource` (sanity).
2. **01-login.spec.ts** — Login **positivo**: leitura de Snackbar (não há navegação).
3. **02-login.validation.spec.ts** — Login **negativo** (e-mail mal formatado, e-mail vazio, senha curta, senha vazia). Foco em **bloqueio** do submit.
4. **03-signup.spec.ts** — Sign up **positivo** (gera e-mail único, marca termos, valida Snackbar).
5. **04-signup.validation.spec.ts** — Sign up **negativo** (e-mail inválido/vazio, senha vazia/curta, confirmar senha vazio/diferente).
6. **05-error.message.spec.ts** — Valida **mensagens de erro** (login e signup) via inline errors / snack/dialog.
7. **06-navigating.spec.ts** — Navegação pelas abas e interações na tela **Forms** (input/echo, switch on/off com hints, dropdown, botão Active → snackbar). _Inclui workarounds de seleção de dropdown._

**PageObjects principais**
- `LoginScreen.ts`: fallbacks de seletor (a11y/resource-id/text/xpath) e leitura robusta de Snackbar/dialog.
- `SignupScreen.ts`: alterna aba interna “Sign up”, rolagem curta para garantir visibilidade, marcação de termos, leitura de feedback.
- `FormScreen.ts`: utilitários para input/echo, switch (hints), dropdown (tap/longTap + seleção por texto), botão Active (Snackbar).

---

## 📊 Relatórios (Allure)

Instalado via `@wdio/allure-reporter`. Resultados em `reports/allure-results`.

Gerar e abrir relatório localmente:
```bash
npm run report:allure
# ou manual:
npx allure generate reports/allure-results --clean -o reports/allure-report
npx allure open reports/allure-report
```

> No CI, os **artefatos** (logs, resultados, screenshots) são publicados quando há falha.

---

## 🤖 CI/CD (GitHub Actions)

Workflow principal: `.github/workflows/android-e2e.yml`  
- **Runner**: `macos-latest`
- **Passos-chave**:
  - `actions/checkout@v4`
  - `actions/setup-node@v4` (Node 20 + cache `npm`)
  - `npm ci`
  - Instalação do **Appium 3** e do **uiautomator2** (idempotente)
  - `actions/setup-java@v4` (JDK 17)
  - **Emulador Android** com `reactivecircus/android-emulator-runner@v2`
  - Sobe Appium em background → `npm run test:android`
  - Upload de artefatos em caso de falha (reports/logs/screenshots)

**Disparo:**
- `push` em `main`, `ci-setup`, `feat/*`
- `pull_request` direcionado para `main`

> Planejamento iOS: futuro `ios-e2e.yml` usando `xcodebuild`/`simctl` + Appium XCUITest.

---

## 🛠️ Scripts (package.json)

Sugeridos/esperados:
```jsonc
{
  "scripts": {
    "test:android": "cross-env PLATFORM=android wdio run wdio.conf.ts",
    "report:allure": "allure generate reports/allure-results --clean -o reports/allure-report && allure open reports/allure-report"
  }
}
```

> Use `cross-env` no Windows. Se não estiver no projeto: `npm i -D cross-env`.

---

## 🔐 Variáveis de Ambiente (exemplos)

```bash
# Geral
export WDIO_LOGLEVEL=info
export SCREENSHOTS_EVERY_STEP=0

# Appium
export APPIUM_HOST=127.0.0.1
export APPIUM_PORT=4723
export APPIUM_BASE_PATH=/

# Apps
export ANDROID_APP=apps/android/native-demo-app.apk
export IOS_APP=apps/ios/WdioDemoApp.app
```

---

## 🚑 Troubleshooting Rápido

- **Driver uiautomator2 não instalado**  
  `npx appium driver install uiautomator2` e confirme com `npx appium driver list --installed`.

- **Emulador não inicia / timeout**  
  Use `-no-snapshot -no-boot-anim -noaudio` e confira AVD com `emulator -list-avds`.  
  Garanta `ANDROID_SDK_ROOT/ANDROID_HOME` corretos e `platform-tools` no PATH (adb).

- **App não instala**  
  Verifique a **compatibilidade de API** do AVD com o APK e permissões (`autoGrantPermissions=true`).

- **Dropdown não seleciona**  
  Tentar `longClick` no campo, aguardar lista, selecionar por texto com `textMatches` ou `textContains`.

- **Snackbar não detectado**  
  Aguardar com polling e tentar fallbacks (dialog nativo, `snackbar_text`, texto parcial).

---

## 🌿 Branches & Fluxo
- `main` — base estável
- `feat/mobile-test-structure` — **MIGRADO** (mergeado)
- `testcases` — specs e pageobjects
- `ci-setup` — pipeline Android + ajustes CI
- `criandoci` — ajustes intermediários de CI

Fluxo comum:
```
git checkout -b ci-setup
# implementar
git push -u origin ci-setup
# abrir PR -> main
```

---

## 📄 Licença
Uso educacional/demonstração do desafio. Ajuste conforme necessidade do seu repositório.

---

## 🙌 Créditos & Referências
- [WebdriverIO](https://webdriver.io/)
- [Appium](https://appium.io/)
- [Allure](https://docs.qameta.io/allure/)
- Ações: `actions/*`, `reactivecircus/android-emulator-runner`

---

Se algo quebrar no CI, verifique os artefatos publicados (logs e screenshots) para diagnosticar rapidamente.
