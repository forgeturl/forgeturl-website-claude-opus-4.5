<template>
  <a
    :href="link.url"
    target="_blank"
    rel="noopener noreferrer"
    class="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all group"
  >
    <!-- Icon -->
    <div class="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-gray-100 transition-colors">
      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <h3 class="font-medium text-gray-900 truncate">{{ link.title || 'Untitled' }}</h3>
      <p v-if="displayUrl" class="text-sm text-gray-400 truncate mt-0.5">{{ displayUrl }}</p>
    </div>
  </a>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  link: {
    type: Object,
    required: true
  }
})

// 格式化显示的 URL
const displayUrl = computed(() => {
  if (!props.link.url) return ''
  try {
    const url = new URL(props.link.url)
    return url.hostname
  } catch {
    return props.link.url
  }
})
</script>
