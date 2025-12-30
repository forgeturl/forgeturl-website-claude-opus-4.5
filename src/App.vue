<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'

const authStore = useAuthStore()
const { initTheme } = useTheme()

onMounted(() => {
  // 初始化认证状态
  authStore.init()
  // 初始化主题
  initTheme()
})
</script>

<style>
/* 全局样式已在 main.css 中定义 */
</style>
