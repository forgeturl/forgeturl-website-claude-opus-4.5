import { createI18n } from 'vue-i18n'
import en from './locales/en.js'
import zhCN from './locales/zh-CN.js'
import zhTW from './locales/zh-TW.js'
import ja from './locales/ja.js'
import es from './locales/es.js'
import pt from './locales/pt.js'
import de from './locales/de.js'
import fr from './locales/fr.js'
import { publicLocale } from '../seo/site.js'

const LOCALE_STORAGE_KEY = 'locale'

const SUPPORTED_LOCALES = ['en', 'zh-CN', 'zh-TW', 'ja', 'es', 'pt', 'de', 'fr']

function detectLocale() {
  if (typeof window === 'undefined') return 'en'
  if (typeof window !== 'undefined') {
    const published = publicLocale(window.location.pathname)
    if (published) {
      const selected = new URLSearchParams(window.location.search).get('lang')
      return SUPPORTED_LOCALES.includes(selected) ? selected : published
    }
  }
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored && SUPPORTED_LOCALES.includes(stored)) {
      return stored
    }
  } catch {
    // ignore
  }

  const browserLang = typeof navigator === 'undefined' ? '' : navigator.language || navigator.userLanguage || ''
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

export const createSiteI18n = (locale = detectLocale()) => createI18n({
  legacy: false,
  locale,
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

const i18n = createSiteI18n()

export { LOCALE_STORAGE_KEY, SUPPORTED_LOCALES }
export default i18n
