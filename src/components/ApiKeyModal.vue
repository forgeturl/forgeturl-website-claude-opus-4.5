<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        @click.self="handleBackdropClick"
      >
        <div class="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" @click="handleBackdropClick"></div>

        <div class="relative bg-white dark:bg-slate-800 w-full sm:w-[520px] sm:rounded-2xl rounded-t-2xl shadow-2xl dark:shadow-black/30 overflow-hidden animate-slide-up transition-colors duration-300">
          <div class="sm:hidden flex justify-center pt-3 pb-2">
            <div class="w-10 h-1 bg-gray-300 dark:bg-slate-600 rounded-full"></div>
          </div>

          <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-slate-100">OpenClaw API Key</h3>
            <button @click="close" class="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Confirm regenerate view -->
          <template v-if="confirming">
            <div class="px-6 py-5 space-y-4">
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-base font-medium text-gray-900 dark:text-slate-100">重新生成 API Key</h4>
                  <p class="mt-1 text-sm text-gray-600 dark:text-slate-400">
                    重新生成后旧的 API Key 会立即失效，确认继续吗？
                  </p>
                </div>
              </div>
            </div>
            <div class="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3">
              <button
                @click="confirming = false"
                :disabled="loading"
                class="px-4 py-2.5 rounded-xl transition-colors font-medium text-sm border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                取消
              </button>
              <button
                @click="doRegenerate"
                :disabled="loading"
                class="px-4 py-2.5 rounded-xl transition-colors font-medium text-sm bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ loading ? '处理中...' : '重新生成' }}
              </button>
            </div>
          </template>

          <!-- Normal API Key view -->
          <template v-else>
            <div class="px-6 py-5 space-y-4">
              <p class="text-sm text-gray-600 dark:text-slate-400">
                用于 OpenClaw skill 调用后端接口。请妥善保管，不要泄露给他人。
              </p>
              <div class="bg-gray-50 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-700 rounded-xl p-3">
                <code class="text-xs break-all text-gray-800 dark:text-slate-200">{{ apiKey || '尚未生成' }}</code>
              </div>
            </div>
            <div class="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-700 flex flex-wrap justify-end gap-3">
              <button
                @click="$emit('copy')"
                :disabled="!apiKey || loading"
                class="px-4 py-2.5 rounded-xl transition-colors font-medium text-sm border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                复制
              </button>
              <button
                @click="confirming = true"
                :disabled="loading"
                class="px-4 py-2.5 rounded-xl transition-colors font-medium text-sm bg-gray-900 dark:bg-violet-600 text-white hover:bg-gray-800 dark:hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ loading ? '处理中...' : '重新生成' }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  apiKey: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'regenerate', 'copy'])

const confirming = ref(false)

watch(() => props.show, (val) => {
  if (!val) confirming.value = false
})

const close = () => {
  confirming.value = false
  emit('update:show', false)
}

const handleBackdropClick = () => {
  if (confirming.value) {
    confirming.value = false
    return
  }
  close()
}

const doRegenerate = () => {
  confirming.value = false
  emit('regenerate')
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .relative {
  transform: translateY(100%);
}

.modal-leave-to .relative {
  transform: translateY(100%);
}

@media (min-width: 640px) {
  .modal-enter-from .relative {
    transform: translateY(20px) scale(0.95);
  }

  .modal-leave-to .relative {
    transform: translateY(20px) scale(0.95);
  }
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

@media (min-width: 640px) {
  .animate-slide-up {
    animation: none;
  }
}
</style>
