import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { LOCALE_STORAGE_KEY, SUPPORTED_LOCALES } from '@/i18n/index.js'

const LOCALE_META = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'zh-CN', label: '简体中文', short: '中' },
  { code: 'zh-TW', label: '繁體中文', short: '繁' },
  { code: 'ja', label: '日本語', short: '日' },
  { code: 'es', label: 'Español', short: 'ES' },
  { code: 'pt', label: 'Português', short: 'PT' },
  { code: 'de', label: 'Deutsch', short: 'DE' },
  { code: 'fr', label: 'Français', short: 'FR' }
]

export function useLocale() {
  const { locale } = useI18n()

  const currentLocale = computed(() => locale.value)

  const currentLocaleShort = computed(() => {
    const meta = LOCALE_META.find(m => m.code === locale.value)
    return meta ? meta.short : 'EN'
  })

  const supportedLocales = LOCALE_META

  const setLocale = (code) => {
    if (!SUPPORTED_LOCALES.includes(code)) return
    locale.value = code
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, code)
    } catch {
      // ignore
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = code
    }
  }

  const isZh = computed(() => locale.value.startsWith('zh'))

  watch(locale, (val) => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = val
    }
  }, { immediate: true })

  return {
    currentLocale,
    currentLocaleShort,
    supportedLocales,
    setLocale,
    isZh
  }
}
