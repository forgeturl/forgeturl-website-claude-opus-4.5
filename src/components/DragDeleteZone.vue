<template>
  <Transition name="trash">
    <div
      v-if="visible"
      class="fixed top-[3vh] left-56 right-0 z-50 flex justify-center pointer-events-none"
    >
      <div
        ref="dropZone"
        class="pointer-events-auto flex flex-col items-center gap-1 px-5 py-2.5 rounded-xl transition-all duration-200"
        :class="isOver 
          ? 'bg-red-500 scale-110 shadow-xl shadow-red-500/30' 
          : 'bg-red-100 dark:bg-red-900/30 shadow-md'"
        @dragover.prevent="handleDragOver"
        @dragleave="handleDragLeave"
        @drop.prevent="handleDrop"
      >
        <div 
          class="w-7 h-7 rounded-full flex items-center justify-center transition-all"
          :class="isOver ? 'bg-red-600' : 'bg-red-200 dark:bg-red-800/50'"
        >
          <svg 
            class="w-3.5 h-3.5 transition-colors"
            :class="isOver ? 'text-white' : 'text-red-500 dark:text-red-400'"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <span 
          class="text-xs font-medium transition-colors"
          :class="isOver ? 'text-white' : 'text-red-500 dark:text-red-400'"
        >
          {{ isOver ? 'Release to delete' : 'Drag here to delete' }}
        </span>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['delete'])

const isOver = ref(false)
const dropZone = ref(null)

const handleDragOver = (e) => {
  isOver.value = true
}

const handleDragLeave = (e) => {
  isOver.value = false
}

const handleDrop = (e) => {
  isOver.value = false
  emit('delete')
}

// Check if a point (x, y) is inside the delete zone
// Used by vuedraggable which doesn't trigger native drop events
const isPointInZone = (x, y) => {
  if (!dropZone.value) return false
  const rect = dropZone.value.getBoundingClientRect()
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
}

// Expose methods for parent component
defineExpose({
  isPointInZone
})
</script>

<style scoped>
.trash-enter-active {
  transition: all 0.3s ease-out;
}

.trash-leave-active {
  transition: all 0.2s ease-in;
}

.trash-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.trash-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
