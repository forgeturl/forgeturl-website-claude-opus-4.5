<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="close"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/40 transition-opacity"></div>

        <!-- Modal -->
        <div class="flex min-h-full items-center justify-center p-4">
          <div
            class="relative bg-white rounded-2xl shadow-xl max-w-lg w-full animate-slide-up"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 class="text-xl font-semibold text-gray-900">Create Page</h3>
              <button
                @click="close"
                class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="p-6 space-y-5">
              <!-- Title -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Title <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.title"
                  type="text"
                  placeholder="Enter page title"
                  required
                  class="input"
                />
              </div>

              <!-- Brief -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  v-model="form.brief"
                  placeholder="Enter page description (optional)"
                  rows="2"
                  class="textarea"
                />
              </div>

              <!-- Initial Link (Optional) -->
              <div class="pt-4 border-t border-gray-100">
                <h4 class="text-sm font-medium text-gray-700 mb-3">Add first link (optional)</h4>
                <div class="space-y-3">
                  <input
                    v-model="form.link.title"
                    type="text"
                    placeholder="Link title"
                    class="input"
                  />
                  <input
                    v-model="form.link.url"
                    type="url"
                    placeholder="https://..."
                    class="input"
                  />
                </div>
              </div>

              <!-- Error Message -->
              <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {{ error }}
              </div>
            </form>

            <!-- Footer -->
            <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                @click="close"
                class="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                @click="handleSubmit"
                :disabled="creating || !form.title"
                class="btn btn-primary"
              >
                {{ creating ? 'Creating...' : 'Create' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { usePageStore } from '@/stores/page'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'created'])

const pageStore = usePageStore()

const form = ref({
  title: '',
  brief: '',
  link: {
    title: '',
    url: ''
  }
})

const creating = ref(false)
const error = ref('')

// Reset form when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    form.value = {
      title: '',
      brief: '',
      link: {
        title: '',
        url: ''
      }
    }
    error.value = ''
  }
})

const close = () => {
  emit('update:show', false)
}

const handleSubmit = async () => {
  if (!form.value.title) return
  
  error.value = ''
  creating.value = true

  try {
    // Build collections
    const collections = []
    if (form.value.link.title && form.value.link.url) {
      collections.push({
        links: [
          {
            title: form.value.link.title,
            url: form.value.link.url,
            tags: [],
            photo_url: '',
            sub_links: []
          }
        ]
      })
    } else {
      // Empty collection
      collections.push({
        links: []
      })
    }

    const result = await pageStore.createPage({
      title: form.value.title,
      brief: form.value.brief,
      collections
    })

    // Emit created event with page_id
    emit('created', result.page_id)
    close()
  } catch (err) {
    console.error('Create page error:', err)
    error.value = err.message || 'Creation failed, please try again'
  } finally {
    creating.value = false
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
