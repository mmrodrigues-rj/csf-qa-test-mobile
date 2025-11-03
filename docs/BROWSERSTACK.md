# 🌐 BrowserStack Configuration

Este projeto está configurado para executar testes E2E no BrowserStack como alternativa ao emulador local.

## 🚀 Vantagens do BrowserStack

- ✅ **Infraestrutura estável** - Sem problemas de emulador local
- ✅ **Múltiplos dispositivos** - Fácil testar em diferentes versões/dispositivos
- ✅ **CI/CD confiável** - Sem timeouts ou "device offline"
- ✅ **Vídeos e logs** - Gravação automática de testes
- ✅ **Execução paralela** - Rodar múltiplos testes simultaneamente

## 📋 Pré-requisitos

### 1. Conta BrowserStack

Crie uma conta em: https://www.browserstack.com/app-automate

### 2. Obter credenciais

Encontre suas credenciais em: https://app-automate.browserstack.com/dashboard

- `BROWSERSTACK_USERNAME` - Seu username
- `BROWSERSTACK_ACCESS_KEY` - Sua access key

### 3. Configurar secrets no GitHub

Vá em: **Settings** → **Secrets and variables** → **Actions**

Adicione os secrets:
- `BROWSERSTACK_USERNAME`
- `BROWSERSTACK_ACCESS_KEY`

## 🛠️ Uso Local

### Configurar variáveis de ambiente

```bash
# Windows (PowerShell)
$env:BROWSERSTACK_USERNAME="seu_username"
$env:BROWSERSTACK_ACCESS_KEY="sua_access_key"

# Linux/Mac
export BROWSERSTACK_USERNAME="seu_username"
export BROWSERSTACK_ACCESS_KEY="sua_access_key"
```

### Upload manual do app (opcional)

```bash
# Android
curl -u "USERNAME:ACCESS_KEY" \
  -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
  -F "file=@apps/android/native-demo-app.apk"

# iOS
curl -u "USERNAME:ACCESS_KEY" \
  -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
  -F "file=@apps/ios/wdiodemoapp.zip"
```

Guarde o `app_url` retornado e use:

```bash
export BROWSERSTACK_APP_URL="bs://c700ce60d13a4ac..."
```

### Executar testes

```bash
# Android
npm run test:browserstack:android

# iOS
npm run test:browserstack:ios
```

## ⚙️ Configuração

### Arquivo: `wdio.browserstack.conf.ts`

Configurações principais:

```typescript
// Hostname do BrowserStack
hostname: 'hub-cloud.browserstack.com'
port: 443
protocol: 'https'

// Capabilities
capabilities: [
  {
    platformName: 'Android',
    'appium:deviceName': 'Google Pixel 8',
    'appium:platformVersion': '14.0',
    'bstack:options': {
      userName: BROWSERSTACK_USERNAME,
      accessKey: BROWSERSTACK_ACCESS_KEY,
      projectName: 'CSF QA Test Mobile',
      buildName: 'Build #123',
      debug: true,
      networkLogs: true,
      video: true
    }
  }
]
```

### Variáveis de ambiente suportadas

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `BROWSERSTACK_USERNAME` | Username do BrowserStack | **obrigatório** |
| `BROWSERSTACK_ACCESS_KEY` | Access key do BrowserStack | **obrigatório** |
| `BROWSERSTACK_APP_URL` | URL do app já uploadado | auto-upload no CI |
| `PLATFORM` | Plataforma (android/ios) | `android` |
| `ANDROID_DEVICE` | Nome do device Android | `Google Pixel 8` |
| `ANDROID_PLATFORM_VERSION` | Versão do Android | `14.0` |
| `IOS_DEVICE` | Nome do device iOS | `iPhone 15` |
| `IOS_PLATFORM_VERSION` | Versão do iOS | `17` |
| `BROWSERSTACK_PROJECT_NAME` | Nome do projeto | `CSF QA Test Mobile` |
| `BROWSERSTACK_BUILD_NAME` | Nome do build | `Build {timestamp}` |

## 🔄 Workflow CI/CD

### `.github/workflows/browserstack-e2e.yml`

Workflow automático que:

1. ✅ Faz upload do app para BrowserStack
2. ✅ Executa os testes no device cloud
3. ✅ Gera relatórios Allure
4. ✅ Faz upload dos artifacts

### Trigger

- Push para `main` ou `feat/*`
- Pull requests para `main`
- Manualmente via `workflow_dispatch`

### Concurrency

O workflow cancela automaticamente runs anteriores da mesma branch para economizar minutos do BrowserStack.

## 📊 Dashboard BrowserStack

Acesse: https://app-automate.browserstack.com/dashboard

Você verá:
- ✅ Status de cada teste
- 📹 Vídeos das execuções
- 📝 Logs do Appium
- 🌐 Network logs
- 📱 Device logs
- 📊 Timeline de execução

## 🎯 Devices Recomendados

### Android

| Device | Version | Configuração |
|--------|---------|--------------|
| Google Pixel 8 | 14.0 | `ANDROID_DEVICE="Google Pixel 8"` |
| Samsung Galaxy S23 | 13.0 | `ANDROID_DEVICE="Samsung Galaxy S23"` |
| OnePlus 11 | 13.0 | `ANDROID_DEVICE="OnePlus 11"` |

### iOS

| Device | Version | Configuração |
|--------|---------|--------------|
| iPhone 15 Pro | 17 | `IOS_DEVICE="iPhone 15 Pro"` |
| iPhone 14 | 16 | `IOS_DEVICE="iPhone 14"` |
| iPhone 13 | 15 | `IOS_DEVICE="iPhone 13"` |

Lista completa: https://www.browserstack.com/list-of-browsers-and-platforms/app_automate

## 🐛 Troubleshooting

### Erro: "App URL is required"

Upload o app manualmente e defina `BROWSERSTACK_APP_URL`.

### Erro: "Invalid credentials"

Verifique se `BROWSERSTACK_USERNAME` e `BROWSERSTACK_ACCESS_KEY` estão corretos.

### Testes lentos

- Use devices mais recentes
- Ative execução paralela no plano BrowserStack
- Reduza timeouts desnecessários

### App não encontrado

Certifique-se que o app foi uploadado com sucesso:

```bash
curl -u "USERNAME:ACCESS_KEY" \
  "https://api-cloud.browserstack.com/app-automate/recent_apps"
```

## 💰 Custos

BrowserStack cobra por:
- **Minutos de execução** - Tempo que os testes rodam
- **Sessões paralelas** - Quantos testes simultâneos

Dicas para economizar:
- ✅ Use concurrency para cancelar runs antigos
- ✅ Execute apenas smoke tests em PRs
- ✅ Execute suite completa apenas em main
- ✅ Configure timeouts apropriados

## 📚 Referências

- [BrowserStack App Automate Docs](https://www.browserstack.com/docs/app-automate)
- [WDIO BrowserStack Service](https://webdriver.io/docs/browserstack-service/)
- [BrowserStack REST API](https://www.browserstack.com/docs/app-automate/api-reference/introduction)
