<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        @click.self="handleClose"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" @click="handleClose"></div>
        
        <!-- Modal Content -->
        <div class="relative bg-white dark:bg-slate-800 w-full sm:w-[480px] sm:rounded-2xl rounded-t-2xl shadow-2xl dark:shadow-black/30 max-h-[85vh] overflow-hidden animate-slide-up transition-colors duration-300">
          <!-- Handle bar for mobile -->
          <div class="sm:hidden flex justify-center pt-3 pb-2">
            <div class="w-10 h-1 bg-gray-300 dark:bg-slate-600 rounded-full"></div>
          </div>

          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-slate-100">Edit Link</h3>
            <button
              @click="handleClose"
              class="p-2 -mr-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-5 space-y-5 overflow-y-auto max-h-[60vh]">
            <!-- Title -->
            <div class="flex items-center gap-4">
              <label class="text-sm font-medium text-gray-700 dark:text-slate-300 w-12 flex-shrink-0">Title</label>
              <input
                v-model="editForm.title"
                type="text"
                placeholder="Link title"
                class="flex-1 px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-gray-900 dark:focus:ring-violet-500 focus:border-transparent outline-none transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
            </div>

            <!-- URL -->
            <div class="flex items-center gap-4">
              <label class="text-sm font-medium text-gray-700 dark:text-slate-300 w-12 flex-shrink-0">URL</label>
              <input
                v-model="editForm.url"
                type="url"
                placeholder="https://..."
                class="flex-1 px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-gray-900 dark:focus:ring-violet-500 focus:border-transparent outline-none transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
            </div>

            <!-- Optional Fields Buttons -->
            <div v-if="!showTags || !showSubLinks" class="flex gap-2">
              <button
                v-if="!showTags"
                @click="showTags = true"
                class="px-3 py-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Tags
              </button>
              <button
                v-if="!showSubLinks"
                @click="expandSubLinks"
                class="px-3 py-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Sub Links
              </button>
            </div>

            <!-- Tags (shown when expanded) -->
            <div v-if="showTags">
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300">Tags <span class="text-gray-400 dark:text-slate-500 font-normal">(comma separated)</span></label>
                <button
                  @click="showTags = false; tagsInput = ''"
                  class="p-1 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 rounded transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <input
                v-model="tagsInput"
                type="text"
                placeholder="tools, dev, design"
                class="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-gray-900 dark:focus:ring-violet-500 focus:border-transparent outline-none transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
            </div>

            <!-- Sub Links (shown when expanded) -->
            <div v-if="showSubLinks">
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-slate-300">Sub Links</label>
                <button
                  @click="showSubLinks = false; editForm.sub_links = []"
                  class="p-1 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 rounded transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="space-y-3">
                <div
                  v-for="(subLink, index) in editForm.sub_links"
                  :key="index"
                  class="flex gap-2 items-start"
                >
                  <div class="flex-1 space-y-2">
                    <input
                      v-model="subLink.sub_title"
                      type="text"
                      placeholder="Sub link title"
                      class="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 dark:focus:ring-violet-500 focus:border-transparent outline-none transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                    />
                    <input
                      v-model="subLink.sub_url"
                      type="url"
                      placeholder="Sub link URL"
                      class="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 dark:focus:ring-violet-500 focus:border-transparent outline-none transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                  <button
                    @click="removeSubLink(index)"
                    class="mt-2 p-2 text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <button
                  @click="addSubLink"
                  class="w-full py-3 border-2 border-dashed border-gray-200 dark:border-slate-600 rounded-xl text-gray-400 dark:text-slate-500 hover:border-gray-300 dark:hover:border-slate-500 hover:text-gray-500 dark:hover:text-slate-400 transition-colors text-sm"
                >
                  + Add sub link
                </button>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3">
            <button
              @click="handleClose"
              class="px-5 py-2.5 text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              @click="handleSave"
              class="px-5 py-2.5 bg-gray-900 dark:bg-violet-600 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-violet-500 transition-colors font-medium"
            >
              Save
            </button>
          </div>
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
  link: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:show', 'save'])

// Edit form
const editForm = ref({
  title: '',
  url: '',
  tags: [],
  photo_url: '',
  sub_links: []
})

const tagsInput = ref('')

// Optional fields visibility
const showTags = ref(false)
const showSubLinks = ref(false)

// Watch for link changes to initialize form
watch(() => props.link, (newLink) => {
  if (newLink) {
    editForm.value = {
      title: newLink.title || '',
      url: newLink.url || '',
      tags: [...(newLink.tags || [])],
      photo_url: newLink.photo_url || '',
      sub_links: JSON.parse(JSON.stringify(newLink.sub_links || []))
    }
    tagsInput.value = (newLink.tags || []).join(', ')
    // Auto show tags/sub_links if they have data
    showTags.value = (newLink.tags && newLink.tags.length > 0)
    showSubLinks.value = (newLink.sub_links && newLink.sub_links.length > 0)
  }
}, { immediate: true, deep: true })

// Watch for show changes to reset form
watch(() => props.show, (newShow) => {
  if (newShow && props.link) {
    editForm.value = {
      title: props.link.title || '',
      url: props.link.url || '',
      tags: [...(props.link.tags || [])],
      photo_url: props.link.photo_url || '',
      sub_links: JSON.parse(JSON.stringify(props.link.sub_links || []))
    }
    tagsInput.value = (props.link.tags || []).join(', ')
    // Auto show tags/sub_links if they have data
    showTags.value = (props.link.tags && props.link.tags.length > 0)
    showSubLinks.value = (props.link.sub_links && props.link.sub_links.length > 0)
  }
})

const addSubLink = () => {
  editForm.value.sub_links.push({
    sub_title: '',
    sub_url: ''
  })
}

// Expand sub links section and auto-add one empty sub link
const expandSubLinks = () => {
  showSubLinks.value = true
  // Auto-add one empty sub link if there are none
  if (editForm.value.sub_links.length === 0) {
    addSubLink()
  }
}

const removeSubLink = (index) => {
  editForm.value.sub_links.splice(index, 1)
}

const handleClose = () => {
  emit('update:show', false)
}

const handleSave = () => {
  // Parse tags
  const tags = tagsInput.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)

  // Filter empty sub links
  const subLinks = editForm.value.sub_links.filter(
    sl => sl.sub_title || sl.sub_url
  )

  const updatedLink = {
    ...editForm.value,
    tags,
    sub_links: subLinks
  }

  emit('save', updatedLink)
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

