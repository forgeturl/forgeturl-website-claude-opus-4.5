<template>
  <div class="flex flex-wrap items-center justify-end gap-2 text-xs" aria-live="polite">
    <span v-if="added && !page?.is_self" class="text-emerald-700 dark:text-emerald-400">{{ t('sharedSpace.added') }}</span>
    <button v-if="page?.is_self || added" class="btn-compact btn-secondary" @click="openInSpace">{{ t('sharedSpace.open') }}</button>
    <button v-else class="btn-compact btn-primary disabled:opacity-50" :disabled="busy || checking || unavailable" :aria-busy="busy" @click="join">
      {{ busy ? t('sharedSpace.adding') : checking ? t('sharedSpace.checking') : !auth.isLoggedIn || needsLogin ? t('sharedSpace.login') : t('sharedSpace.add') }}
    </button>
    <span v-if="message" role="alert" class="basis-full text-right text-red-600 dark:text-red-400">{{ message }}</span>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { usePageStore } from '@/stores/page'

const props = defineProps({ pageId: String, page: Object, beforeAction: Function, unavailable: Boolean })
const { t } = useI18n()
const route = useRoute(), router = useRouter()
const auth = useAuthStore(), space = usePageStore()
const busy = ref(false), checking = ref(false), message = ref(''), needsLogin = ref(false)
const added = computed(() => auth.isLoggedIn && !needsLogin.value && space.myPages.some(page => page.page_id === props.pageId))
let checkRequest = 0
watch(() => [auth.isLoggedIn, props.pageId], async ([loggedIn]) => {
  const sequence = ++checkRequest
  message.value = ''; needsLogin.value = false
  if (!loggedIn) { checking.value = false; return }
  checking.value = true
  try { await space.fetchMySpace() }
  catch { if (sequence === checkRequest) message.value = t('sharedSpace.checkFailed') }
  finally { if (sequence === checkRequest) checking.value = false }
}, { immediate: true })

const login = () => router.push({ path: '/', query: { redirect: route.fullPath } })
const join = async () => {
  if (busy.value) return
  if (!auth.isLoggedIn || needsLogin.value) { await login(); return }
  const id = props.pageId
  busy.value = true; message.value = ''
  try {
    await props.beforeAction?.()
    await space.addSharedPage(id)
  } catch (error) {
    needsLogin.value = error.code === 40001 || error.response?.status === 401
    message.value = needsLogin.value ? t('sharedSpace.loginExpired') : error.message || t('sharedSpace.addFailed')
  } finally { busy.value = false }
}
const openInSpace = async () => {
  // Router guards also protect any open modal draft and queued page saves.
  const id = props.page?.is_self ? props.page.owner_page_id : props.pageId
  await router.push({ path: '/my', query: { page_id: id || props.pageId } })
}
</script>
