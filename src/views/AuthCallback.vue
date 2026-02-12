<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <!-- Loading -->
      <div v-if="!error" class="animate-fade-in">
        <div class="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mb-4"></div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Signing in...</h2>
        <p class="text-gray-600">Processing your login information</p>
      </div>

      <!-- Error -->
      <div v-else class="animate-fade-in max-w-md mx-auto p-8">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Login Failed</h2>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <button @click="goToLogin" class="btn btn-primary">
          Back to Home
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { storage } from '@/utils/storage'
import { STORAGE_KEYS, MAIN_DOMAIN, isWechatLoginDomain } from '@/utils/config'

const route = useRoute()
const router = useRouter()
const { handleAuthCallback } = useAuth()

const error = ref('')

onMounted(async () => {
  const provider = route.params.provider

  if (!provider) {
    error.value = 'Missing login provider parameter'
    return
  }

  try {
    const params = { ...route.query }
    const userInfo = await handleAuthCallback(provider, params)

    // 微信登录特殊处理：如果当前在备案域名(forgeturl.brightguo.com)上完成的微信登录，
    // 需要携带token和用户信息跳转回主站(forgeturl.com)
    if (provider === 'wechat' && isWechatLoginDomain()) {
      const token = storage.get(STORAGE_KEYS.TOKEN)
      const userEncoded = encodeURIComponent(btoa(JSON.stringify(userInfo)))
      const tokenEncoded = encodeURIComponent(token)
      window.location.href = `${MAIN_DOMAIN}/?wechat_token=${tokenEncoded}&wechat_user=${userEncoded}`
      return
    }

    // 其他provider或非跨域场景，正常跳转
    const redirect = route.query.redirect || '/my'
    router.replace(redirect)
  } catch (err) {
    console.error('Auth callback error:', err)
    error.value = err.message || 'Login failed, please try again'
  }
})

const goToLogin = () => {
  router.push('/')
}
</script>

