<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="close"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/40 dark:bg-black/60 transition-opacity"></div>

        <!-- Modal -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div
            class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/30 max-w-lg w-full animate-slide-up transition-colors duration-300"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-slate-700">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-slate-100">Share Page</h3>
              <button
                @click="close"
                class="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Content -->
            <div class="p-6 space-y-4">
              <!-- Read-only Link -->
              <div class="border border-gray-200 dark:border-slate-700 rounded-xl p-4">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-8 h-8 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-gray-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900 dark:text-slate-100">Read-only Link</h4>
                    <p class="text-sm text-gray-500 dark:text-slate-400">Others can view but cannot edit.</p>
                  </div>
                </div>
                
                <div v-if="page.readonly_page_id" class="flex gap-2 mt-3">
                  <input
                    :value="getShareUrl('readonly', page.readonly_page_id)"
                    readonly
                    class="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-600 dark:text-slate-300 focus:outline-none"
                  />
                  <button
                    @click="copyLink('readonly', page.readonly_page_id)"
                    class="px-4 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
                  >
                    <svg v-if="copiedType !== 'readonly'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    <svg v-else class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Copy
                  </button>
                  <button
                    @click="removeLink('readonly')"
                    :disabled="removing"
                    class="px-3 py-2 bg-white dark:bg-slate-700 border border-red-200 dark:border-red-800 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center gap-1 disabled:opacity-50"
                    title="Delete this link"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <button
                  v-else
                  @click="generateLink('readonly')"
                  :disabled="generating"
                  class="w-full mt-3 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  {{ generating ? 'Generating...' : 'Generate Read-only Link' }}
                </button>
              </div>

              <!-- Edit Link -->
              <div class="border border-gray-200 dark:border-slate-700 rounded-xl p-4">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-8 h-8 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-gray-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900 dark:text-slate-100">Edit Link</h4>
                    <p class="text-sm text-gray-500 dark:text-slate-400">Others can view and edit.</p>
                  </div>
                </div>
                
                <div v-if="page.edit_page_id" class="flex gap-2 mt-3">
                  <input
                    :value="getShareUrl('edit', page.edit_page_id)"
                    readonly
                    class="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-600 dark:text-slate-300 focus:outline-none"
                  />
                  <button
                    @click="copyLink('edit', page.edit_page_id)"
                    class="px-4 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
                  >
                    <svg v-if="copiedType !== 'edit'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    <svg v-else class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Copy
                  </button>
                  <button
                    @click="removeLink('edit')"
                    :disabled="removing"
                    class="px-3 py-2 bg-white dark:bg-slate-700 border border-red-200 dark:border-red-800 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center gap-1 disabled:opacity-50"
                    title="Delete this link"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <button
                  v-else
                  @click="generateLink('edit')"
                  :disabled="generating"
                  class="w-full mt-3 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  {{ generating ? 'Generating...' : 'Generate Edit Link' }}
                </button>
              </div>

              <!-- Super Link -->
              <div class="border border-gray-200 dark:border-slate-700 rounded-xl p-4">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-8 h-8 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-gray-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900 dark:text-slate-100">Super Link</h4>
                    <p class="text-sm text-gray-500 dark:text-slate-400">Others can view, edit, and delete content.</p>
                  </div>
                </div>
                
                <div v-if="page.admin_page_id" class="flex gap-2 mt-3">
                  <input
                    :value="getShareUrl('admin', page.admin_page_id)"
                    readonly
                    class="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-600 dark:text-slate-300 focus:outline-none"
                  />
                  <button
                    @click="copyLink('admin', page.admin_page_id)"
                    class="px-4 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
                  >
                    <svg v-if="copiedType !== 'admin'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    <svg v-else class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Copy
                  </button>
                  <button
                    @click="removeLink('admin')"
                    :disabled="removing"
                    class="px-3 py-2 bg-white dark:bg-slate-700 border border-red-200 dark:border-red-800 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center gap-1 disabled:opacity-50"
                    title="Delete this link"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <button
                  v-else
                  @click="generateLink('admin')"
                  :disabled="generating"
                  class="w-full mt-3 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  {{ generating ? 'Generating...' : 'Generate Super Link' }}
                </button>
              </div>

              <!-- Error Message -->
              <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {{ error }}
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 border-t border-gray-100 dark:border-slate-700 flex justify-end">
              <button
                @click="close"
                class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { usePageStore } from '@/stores/page'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  page: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:show'])

const pageStore = usePageStore()

const generating = ref(false)
const removing = ref(false)
const error = ref('')
const copiedType = ref('')

const close = () => {
  emit('update:show', false)
  error.value = ''
}

const getShareUrl = (type, pageId) => {
  const origin = window.location.origin
  return `${origin}/share/${pageId}`
}

const generateLink = async (type) => {
  error.value = ''
  generating.value = true

  try {
    await pageStore.addPageLink(props.page.page_id, type)
  } catch (err) {
    console.error('Generate link error:', err)
    error.value = err.message || 'Failed to generate link'
  } finally {
    generating.value = false
  }
}

const removeLink = async (type) => {
  error.value = ''
  removing.value = true

  try {
    await pageStore.removePageLink(props.page.page_id, type)
  } catch (err) {
    console.error('Remove link error:', err)
    error.value = err.message || 'Failed to delete link'
  } finally {
    removing.value = false
  }
}

const copyLink = async (type, pageId) => {
  const url = getShareUrl(type, pageId)
  
  try {
    await navigator.clipboard.writeText(url)
    copiedType.value = type
    setTimeout(() => {
      copiedType.value = ''
    }, 2000)
  } catch (err) {
    console.error('Copy failed:', err)
    // Fallback
    const input = document.createElement('input')
    input.value = url
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    
    copiedType.value = type
    setTimeout(() => {
      copiedType.value = ''
    }, 2000)
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
