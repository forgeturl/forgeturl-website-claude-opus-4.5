<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <!-- Loading -->
      <div v-if="!error" class="animate-fade-in">
        <div class="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mb-4"></div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">登录中...</h2>
        <p class="text-gray-600">正在处理您的登录信息</p>
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
        <h2 class="text-xl font-semibold text-gray-900 mb-2">登录失败</h2>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <button @click="goToLogin" class="btn btn-primary">
          返回登录页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const { handleAuthCallback } = useAuth()

const error = ref('')

onMounted(async () => {
  const provider = route.params.provider

  if (!provider) {
    error.value = '缺少登录提供商参数'
    return
  }

  try {
    // 获取URL中的查询参数
    const params = { ...route.query }

    // 处理登录回调
    await handleAuthCallback(provider, params)

    // 登录成功，跳转到首页或重定向地址
    const redirect = route.query.redirect || '/'
    router.replace(redirect)
  } catch (err) {
    console.error('Auth callback error:', err)
    error.value = err.message || '登录失败，请重试'
  }
})

const goToLogin = () => {
  router.push('/login')
}
</script>

