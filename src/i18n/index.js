import { createI18n } from 'vue-i18n'
import en from './locales/en.js'
import zhCN from './locales/zh-CN.js'
import zhTW from './locales/zh-TW.js'
import ja from './locales/ja.js'
import es from './locales/es.js'
import pt from './locales/pt.js'
import de from './locales/de.js'
import fr from './locales/fr.js'

const LOCALE_STORAGE_KEY = 'locale'

const SUPPORTED_LOCALES = ['en', 'zh-CN', 'zh-TW', 'ja', 'es', 'pt', 'de', 'fr']

function detectLocale() {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored && SUPPORTED_LOCALES.includes(stored)) {
      return stored
    }
  } catch {
    // ignore
  }

  const browserLang = navigator.language || navigator.userLanguage || ''
  return matchLocale(browserLang)
}

function matchLocale(lang) {
  const lower = lang.toLowerCase()

  if (lower === 'zh-tw' || lower === 'zh-hk' || lower === 'zh-hant' || lower.startsWith('zh-hant')) {
    return 'zh-TW'
  }
  if (lower.startsWith('zh')) {
    return 'zh-CN'
  }
  if (lower.startsWith('ja')) return 'ja'
  if (lower.startsWith('es')) return 'es'
  if (lower.startsWith('pt')) return 'pt'
  if (lower.startsWith('de')) return 'de'
  if (lower.startsWith('fr')) return 'fr'
  return 'en'
}

const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages: {
    en,
    'zh-CN': zhCN,
    'zh-TW': zhTW,
    ja,
    es,
    pt,
    de,
    fr
  }
})

export { LOCALE_STORAGE_KEY, SUPPORTED_LOCALES }
export default i18n
