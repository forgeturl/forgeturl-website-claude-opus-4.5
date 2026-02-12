<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
    <router-view />
    <!-- ICP 备案信息 - 仅在 forgeturl.brightguo.com 域名下显示 -->
    <div v-if="showICP" class="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-t border-gray-200/50 dark:border-slate-700/50 py-2 text-center">
      <a
        href="https://beian.miit.gov.cn/"
        target="_blank"
        rel="noopener noreferrer"
        class="text-xs text-gray-400 dark:text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-200"
      >
        沪ICP备14029667号-4
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'

const authStore = useAuthStore()
const { initTheme } = useTheme()

// 是否显示 ICP 备案信息
const showICP = ref(false)

onMounted(() => {
  // 初始化认证状态
  authStore.init()
  // 初始化主题
  initTheme()
  // 检查域名是否为 forgeturl.brightguo.com
  showICP.value = window.location.hostname === 'forgeturl.brightguo.com'
})
</script>

<style>
/* 全局样式已在 main.css 中定义 */
</style>
