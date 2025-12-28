<template>
  <div
    class="card cursor-pointer group animate-fade-in"
    @click="$emit('click')"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex-1 min-w-0">
        <h3 class="text-lg font-semibold text-gray-900 mb-1 truncate group-hover:text-gray-700 transition-colors">
          {{ page.title }}
        </h3>
        <p class="text-sm text-gray-600 line-clamp-2">
          {{ page.brief || 'No description' }}
        </p>
      </div>

      <!-- Self badge -->
      <span
        v-if="page.is_self"
        class="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full flex-shrink-0"
      >
        Mine
      </span>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between text-sm text-gray-500">
      <div class="flex items-center gap-4">
        <span class="flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {{ formatDate(page.update_time) }}
        </span>
      </div>

      <!-- Arrow icon -->
      <svg
        class="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  page: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

const formatDate = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp * 1000)
  const now = new Date()
  const diff = now - date

  // Less than 1 minute
  if (diff < 60000) {
    return 'Just now'
  }
  // Less than 1 hour
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)} min ago`
  }
  // Less than 1 day
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)} hour${Math.floor(diff / 3600000) > 1 ? 's' : ''} ago`
  }
  // Less than 7 days
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)} day${Math.floor(diff / 86400000) > 1 ? 's' : ''} ago`
  }

  // Format as date
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
</script>

