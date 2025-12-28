<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        @click.self="handleClose"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="handleClose"></div>
        
        <!-- Modal Content -->
        <div class="relative bg-white w-full sm:w-[560px] sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-hidden animate-slide-up">
          <!-- Handle bar for mobile -->
          <div class="sm:hidden flex justify-center pt-3 pb-2">
            <div class="w-10 h-1 bg-gray-300 rounded-full"></div>
          </div>

          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">Add Link</h3>
            <button
              @click="handleClose"
              class="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-5 space-y-5 overflow-y-auto max-h-[60vh]">
            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                v-model="form.title"
                type="text"
                placeholder="Link title"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
              />
            </div>

            <!-- URL -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">URL</label>
              <input
                v-model="form.url"
                type="url"
                placeholder="https://..."
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
              />
            </div>

            <!-- Tags -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tags <span class="text-gray-400 font-normal">(comma separated)</span></label>
              <input
                v-model="tagsInput"
                type="text"
                placeholder="tools, dev, design"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
              />
            </div>

            <!-- Sub Links -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Sub Links</label>
              <div class="space-y-3">
                <div
                  v-for="(subLink, index) in form.sub_links"
                  :key="index"
                  class="flex gap-2 items-start"
                >
                  <div class="flex-1 space-y-2">
                    <input
                      v-model="subLink.sub_title"
                      type="text"
                      placeholder="Sub link title"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                    />
                    <input
                      v-model="subLink.sub_url"
                      type="url"
                      placeholder="Sub link URL"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <button
                    @click="removeSubLink(index)"
                    class="mt-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <button
                  @click="addSubLink"
                  class="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors text-sm"
                >
                  + Add sub link
                </button>
              </div>
            </div>

            <!-- Collection Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Add to Folder</label>
              <div class="grid grid-cols-3 gap-2">
                <!-- Existing Collections -->
                <div 
                  v-for="(collection, index) in collections" 
                  :key="index"
                  @click="selectCollection(index)"
                  class="flex flex-col items-center gap-1.5 p-3 border rounded-xl cursor-pointer transition-all text-center"
                  :class="selectedCollectionIndex === index 
                    ? 'border-gray-900 bg-gray-50' 
                    : 'border-gray-200 hover:border-gray-300'"
                >
                  <div 
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0"
                    :class="selectedCollectionIndex === index 
                      ? 'border-gray-900 bg-gray-900' 
                      : 'border-gray-300'"
                  >
                    <svg 
                      v-if="selectedCollectionIndex === index" 
                      class="w-3 h-3 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span class="text-gray-700 text-xs leading-tight line-clamp-2">{{ collection.title || 'Unnamed' }}</span>
                </div>

                <!-- Create New Collection Option -->
                <div 
                  @click="selectNewCollection"
                  class="flex flex-col items-center gap-1.5 p-3 border rounded-xl cursor-pointer transition-all text-center"
                  :class="isCreateNew 
                    ? 'border-gray-900 bg-gray-50' 
                    : 'border-gray-200 hover:border-gray-300'"
                >
                  <div 
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0"
                    :class="isCreateNew 
                      ? 'border-gray-900 bg-gray-900' 
                      : 'border-gray-300'"
                  >
                    <svg 
                      v-if="isCreateNew" 
                      class="w-3 h-3 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span class="text-gray-700 text-xs leading-tight">+ New Folder</span>
                </div>
              </div>

              <!-- New Collection Name Input -->
              <div v-if="isCreateNew" class="mt-3">
                <input
                  v-model="newCollectionName"
                  type="text"
                  placeholder="Enter new folder name"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button
              @click="handleClose"
              class="px-5 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              @click="handleSave"
              :disabled="!canSave"
              class="px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  collections: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:show', 'add'])

// Form data
const form = ref({
  title: '',
  url: '',
  tags: [],
  photo_url: '',
  sub_links: []
})

const tagsInput = ref('')
const selectedCollectionIndex = ref(0)
const isCreateNew = ref(false)
const newCollectionName = ref('')

// Reset form when modal opens
watch(() => props.show, (newShow) => {
  if (newShow) {
    form.value = {
      title: '',
      url: '',
      tags: [],
      photo_url: '',
      sub_links: []
    }
    tagsInput.value = ''
    selectedCollectionIndex.value = props.collections.length > 0 ? 0 : -1
    isCreateNew.value = props.collections.length === 0
    newCollectionName.value = ''
  }
})

// Can save check
const canSave = computed(() => {
  const hasUrl = form.value.url.trim().length > 0
  const hasValidTarget = !isCreateNew.value || newCollectionName.value.trim().length > 0
  return hasUrl && hasValidTarget
})

const selectCollection = (index) => {
  selectedCollectionIndex.value = index
  isCreateNew.value = false
}

const selectNewCollection = () => {
  selectedCollectionIndex.value = -1
  isCreateNew.value = true
}

const addSubLink = () => {
  form.value.sub_links.push({
    sub_title: '',
    sub_url: ''
  })
}

const removeSubLink = (index) => {
  form.value.sub_links.splice(index, 1)
}

const handleClose = () => {
  emit('update:show', false)
}

const handleSave = () => {
  if (!canSave.value) return

  // Parse tags
  const tags = tagsInput.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)

  // Filter empty sub links
  const subLinks = form.value.sub_links.filter(
    sl => sl.sub_title || sl.sub_url
  )

  const link = {
    title: form.value.title || form.value.url,
    url: form.value.url,
    tags,
    photo_url: '',
    sub_links: subLinks
  }

  emit('add', {
    link,
    collectionIndex: isCreateNew.value ? -1 : selectedCollectionIndex.value,
    newCollectionName: isCreateNew.value ? (newCollectionName.value || 'New Folder') : null
  })

  handleClose()
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

