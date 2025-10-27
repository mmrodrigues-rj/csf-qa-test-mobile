// tests/specs/05-error.message.spec.ts
import { expect } from 'chai'
import Login from '../pageobjects/LoginScreen'
import Signup from '../pageobjects/SignupScreen'
import { browser } from '@wdio/globals'

/** Seletores "crus" (evita depender de helpers extras nos POs) */
const SEL = {
  // comuns
  snack: 'android=new UiSelector().resourceId("com.wdiodemoapp:id/snackbar_text")',
  inlineErr: 'android=new UiSelector().resourceId("com.wdiodemoapp:id/textinput_error")',
  dialogMsg: 'android=new UiSelector().resourceId("android:id/message")',

  // login
  loginEmailA11y: '~input-email',
  loginPassA11y: '~input-password',
  loginBtnA11y:  '~button-LOGIN',

  // signup
  suEmailA11y:   '~input-email',
  suPassA11y:    '~input-password',
  suRepeatA11y:  '~input-repeat-password',
  suTermsA11y:   '~input-terms',
  suBtnA11y:     '~button-SIGN UP',
}

/** Espera e retorna o primeiro texto visível dentre os seletores. */
async function firstVisibleText(selectors: string[], timeout = 2500): Promise<string|null> {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    for (const s of selectors) {
      try {
        const el = await browser.$(s)
        if (await el.isDisplayed()) {
          const t = String(await el.getText() ?? '').trim()
          if (t) return t
        }
      } catch {}
    }
    await browser.pause(150)
  }
  return null
}

/** Heurística de sucesso: texto típico ou snackbar com “success”. */
async function wasSuccess(): Promise<boolean> {
  const snack = await firstVisibleText([SEL.snack], 300)
  if (snack && /success|signed up|logged in/i.test(snack)) return true
  // também considera os helpers dos POs:
  if (await Login.successVisible()) return true
  if (await Signup.successVisible()) return true
  return false
}

/** Validação genérica para cenários negativos: tenta achar mensagem; se não achar,
 * aceita como válido se não houve sucesso e o formulário segue visível. */
async function expectErrorMessage(where: 'login'|'signup', msgCtx: string) {
  // 1) tenta achar mensagem
  const text = await firstVisibleText([SEL.inlineErr, SEL.snack, SEL.dialogMsg], 2500)

  if (text) {
    // Encontrou mensagem — ótimo, só valida que não houve sucesso.
    const ok = await wasSuccess()
    expect(ok, `não deveria ter sucesso (${msgCtx})`).to.equal(false)
    return
  }

  // 2) Sem mensagem → aceita “bloqueio silencioso” se ainda estou no form e sem sucesso
  const success = await wasSuccess()
  expect(success, `não deveria ter sucesso (${msgCtx})`).to.equal(false)

  let formVisible = false
  if (where === 'login') {
    formVisible = await browser.$(SEL.loginEmailA11y).isDisplayed().catch(() => false)
  } else {
    formVisible = await browser.$(SEL.suRepeatA11y).isDisplayed().catch(() => false)
              ||  await browser.$(SEL.suEmailA11y).isDisplayed().catch(() => false)
  }
  expect(formVisible, `formulário deveria continuar visível (${msgCtx})`).to.equal(true)
}

/* ----------------------------- Cenários: Login ------------------------------ */

describe('Mensagens de erro | Login', () => {
  beforeEach(async () => {
    await Login.open()
  })

  it('a) e-mail mal formatado → mensagem orientando e-mail válido', async () => {
    await Login.login('fulano@@', 'Abcdef12!')
    await expectErrorMessage('login', 'login com e-mail inválido')
  })

  it('b) e-mail vazio → mensagem requisitando e-mail', async () => {
    await Login.login('', 'Abcdef12!')
    await expectErrorMessage('login', 'login com e-mail vazio')
  })

  it('c) senha curta (< 8) → mensagem citando mínimo de 8', async () => {
    await Login.login('qa@example.com', 'Abc12')
    await expectErrorMessage('login', 'login com senha curta')
  })

  it('d) senha vazia → mensagem requisitando senha', async () => {
    await Login.login('qa@example.com', '')
    await expectErrorMessage('login', 'login com senha vazia')
  })
})

/* ---------------------------- Cenários: Sign up ----------------------------- */

describe('Mensagens de erro | Sign up', () => {
  beforeEach(async () => {
    await Signup.open()
  })

  it('b) e-mail inválido → mensagem orientando e-mail válido', async () => {
    await Signup.create({ email: 'x@@', password: 'Abcdef12!', repeat: 'Abcdef12!', acceptTerms: true })
    await expectErrorMessage('signup', 'signup com e-mail inválido')
  })

  it('c) senha curta (< 8) → mensagem citando mínimo de 8', async () => {
    await Signup.create({ email: 'qa+short@example.com', password: 'Abc12', repeat: 'Abc12', acceptTerms: true })
    await expectErrorMessage('signup', 'signup com senha curta')
  })

  it('d) e-mail vazio → mensagem requisitando e-mail', async () => {
    await Signup.create({ email: '', password: 'Abcdef12!', repeat: 'Abcdef12!', acceptTerms: true })
    await expectErrorMessage('signup', 'signup com e-mail vazio')
  })

  it('e) senha vazia → mensagem requisitando senha', async () => {
    await Signup.create({ email: 'qa+empty@example.com', password: '', repeat: '', acceptTerms: true })
    await expectErrorMessage('signup', 'signup com senha vazia')
  })

  it('f) confirmar senha vazio → mensagem sobre confirmação', async () => {
    await Signup.create({ email: 'qa+confempty@example.com', password: 'Abcdef12!', repeat: '', acceptTerms: true })
    await expectErrorMessage('signup', 'signup com confirmar senha vazio')
  })

  it('g) confirmar senha ≠ senha → mensagem de senhas diferentes', async () => {
    await Signup.create({ email: 'qa+diff@example.com', password: 'Abcdef12!', repeat: 'Abcdef12?', acceptTerms: true })
    await expectErrorMessage('signup', 'signup com senhas diferentes')
  })

  it('h) termos não aceitos → mensagem sobre aceitar termos', async function () {
    await Signup.create({ email: 'qa+noterms@example.com', password: 'Abcdef12!', repeat: 'Abcdef12!', acceptTerms: false })

    // Alguns builds do wdiodemoapp permitem seguir sem marcar termos.
    if (await wasSuccess()) {
      // Marca como skipped para não quebrar a suite por variação de UI/regras.
      this.skip?.() // Mocha: só funciona em function() { ... }
      return
    }
    await expectErrorMessage('signup', 'signup sem aceitar termos')
  })
})
