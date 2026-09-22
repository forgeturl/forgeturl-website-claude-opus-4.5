import { createApp, ref } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import i18n from '../src/i18n'
import '../src/assets/main.css'
import LinkEditModal from '../src/components/LinkEditModal.vue'
const router = createRouter({ history: createWebHistory(), routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }] })
i18n.global.locale.value = 'zh-CN'
const App = {
  components: { LinkEditModal },
  setup() {
    const show = ref(true), fail = ref(false), saved = ref(false)
    const link = ref({ title: 'kong-gateway-cron', url: 'https://ops.example.com/projects/gateway', tags: [], sub_links: ['us_test','us_onl','eu_test','eu_onl','br_test','br_onl'].map(name => ({sub_title: name, sub_url: `https://ops.example.com/projects/${name}/deployments`})) })
    const save = (value, done) => setTimeout(() => { if (fail.value) done(new Error('网络连接失败，请重试')); else { link.value = value; saved.value = true; done() } }, 700)
    const toggleDark = () => document.documentElement.classList.toggle('dark')
    return { show, fail, saved, link, save, toggleDark }
  },
  template: `<main class="min-h-screen bg-slate-100 p-8"><h1 class="text-xl font-semibold">ForgetURL</h1><div class="mt-8 flex gap-5"><button @click="show=true">打开编辑器</button><label><input type="checkbox" v-model="fail"> 模拟保存失败</label><button @click="toggleDark">切换深色</button><span v-if="saved">已完成模拟保存</span></div><LinkEditModal v-model:show="show" :link="link" draft-scope="preview" @save="save" /></main>`
}
createApp(App).use(createPinia()).use(router).use(i18n).mount('#app')
