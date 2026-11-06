import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createSiteI18n } from './i18n/index.js'
import App from './App.vue'
import Home from './views/Home.vue'
import PrivacyPolicy from './views/PrivacyPolicy.vue'
import TermsOfService from './views/TermsOfService.vue'
import Changelog from './views/Changelog.vue'
import NotFound from './views/NotFound.vue'

// Render only public components. No user data, API calls, or auth callbacks run here.
export async function render(path, locale) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Home },
      { path: '/zh/', component: Home },
      { path: '/privacy', component: PrivacyPolicy },
      { path: '/terms', component: TermsOfService },
      { path: '/changelog', component: Changelog },
      { path: '/:pathMatch(.*)*', component: NotFound }
    ]
  })
  const app = createSSRApp(App)
  app.use(createPinia())
  app.use(createSiteI18n(locale))
  app.use(router)
  await router.push(path)
  await router.isReady()
  return renderToString(app)
}
