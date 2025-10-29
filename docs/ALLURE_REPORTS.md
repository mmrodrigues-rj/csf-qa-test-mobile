# 📊 Allure Reports - Configuração e Uso

Este projeto está configurado para gerar automaticamente relatórios Allure dos testes E2E e publicá-los no GitHub Pages.

## 🚀 Como Funciona

### CI/CD Automático

1. **Testes executam** no workflow `Android E2E`
2. **Resultados salvos** em `allure-results/` (com screenshots, logs, etc.)
3. **Artifacts enviados** para o GitHub Actions
4. **Workflow Allure dispara** automaticamente após conclusão dos testes
5. **Relatório gerado** e publicado no GitHub Pages

### URL do Relatório

🔗 **https://mmrodrigues-rj.github.io/csf-qa-test-mobile/**

O relatório é atualizado automaticamente a cada execução bem-sucedida dos testes.

## 📋 Estrutura dos Resultados

```
allure-results/
├── *-result.json          # Resultados de cada teste
├── *-container.json       # Suites e contextos
├── *-attachment.png       # Screenshots automáticos
└── environment.properties # Informações do ambiente
```

## 🛠️ Uso Local

### Gerar Relatório Localmente

```bash
# Executar testes (gera allure-results/)
npm run test:android

# Gerar relatório HTML
npm run allure:generate

# Abrir relatório no navegador
npm run allure:open
```

### Instalar Allure CLI (se necessário)

```bash
npm install -g allure-commandline
```

## ⚙️ Configuração do WDIO

O reporter Allure está configurado em `wdio.conf.ts`:

```typescript
reporters: [
  'spec',
  ['allure', {
    outputDir: 'allure-results',
    disableWebdriverStepsReporting: true,
    disableWebdriverScreenshotsReporting: false,
  }]
]
```

### Screenshots Automáticos

- ✅ **On Error**: Screenshots automáticos em caso de falha
- ✅ **Every Step**: Configurável via `SCREENSHOTS_EVERY_STEP=1`
- ✅ **Allure Integration**: Screenshots anexados ao relatório

## 📦 Workflows GitHub Actions

### `.github/workflows/android-e2e.yml`

- Executa testes E2E no Android
- Faz upload de `allure-results/` como artifact
- Retention: 30 dias

### `.github/workflows/allure-report.yml`

- Dispara após `Android E2E` completar com sucesso
- Baixa artifacts do workflow anterior
- Gera relatório com `allure generate`
- Publica no GitHub Pages (branch `gh-pages`)

## 🔧 Configuração do GitHub Pages

### Habilitar GitHub Pages

1. Vá em: **Settings** → **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `gh-pages` / `root`
4. **Save**

O relatório estará disponível em alguns minutos em:
**https://mmrodrigues-rj.github.io/csf-qa-test-mobile/**

## 📊 Features do Relatório Allure

- ✅ **Overview**: Sumarização dos testes (passed, failed, broken, skipped)
- ✅ **Suites**: Organização por suites e specs
- ✅ **Graphs**: Gráficos de status, severidade, duração
- ✅ **Timeline**: Linha do tempo de execução dos testes
- ✅ **Behaviors**: Agrupamento por features/stories
- ✅ **Packages**: Organização por estrutura de pastas
- ✅ **Screenshots**: Anexos visuais com screenshots
- ✅ **History**: Histórico de execuções (quando disponível)

## 🐛 Troubleshooting

### Relatório não gerado

```bash
# Verificar se allure-results existe e tem conteúdo
ls -la allure-results/

# Verificar logs do workflow
# GitHub → Actions → Allure Report → View logs
```

### Relatório vazio

- Certifique-se que os testes geraram arquivos em `allure-results/`
- Verifique se o reporter está configurado corretamente no `wdio.conf.ts`

### GitHub Pages não carrega

- Verifique se o branch `gh-pages` existe
- Confirme que GitHub Pages está habilitado nas Settings
- Aguarde alguns minutos para o deploy completar

## 🎯 Próximos Passos

- [ ] Adicionar histórico de testes (trend)
- [ ] Configurar categories para classificar falhas
- [ ] Adicionar environment properties dinâmicas
- [ ] Integrar com Slack/Teams para notificações

## 📚 Referências

- [Allure Framework Docs](https://docs.qameta.io/allure/)
- [WDIO Allure Reporter](https://webdriver.io/docs/allure-reporter/)
- [GitHub Pages Docs](https://docs.github.com/en/pages)
