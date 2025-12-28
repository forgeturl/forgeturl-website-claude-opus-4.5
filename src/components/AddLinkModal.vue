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

          <!-- Header with Tabs -->
          <div class="px-6 py-4 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <!-- Tab Switcher -->
              <div class="flex bg-gray-100 rounded-lg p-1">
                <button
                  @click="activeTab = 'single'"
                  class="px-4 py-2 text-sm font-medium rounded-md transition-all"
                  :class="activeTab === 'single' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'"
                >
                  Add Link
                </button>
                <button
                  @click="activeTab = 'batch'"
                  class="px-4 py-2 text-sm font-medium rounded-md transition-all"
                  :class="activeTab === 'batch' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'"
                >
                  Batch Add Links
                </button>
              </div>
              <button
                @click="handleClose"
                class="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Body - Single Link Mode -->
          <div v-if="activeTab === 'single'" ref="scrollContainerRef" class="px-6 py-5 space-y-5 overflow-y-auto max-h-[60vh]">
            <!-- URL -->
            <div class="flex items-center gap-4">
              <label class="text-sm font-medium text-gray-700 w-12 flex-shrink-0">URL</label>
              <input
                v-model="form.url"
                type="url"
                placeholder="https://..."
                class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
              />
            </div>

            <!-- Title -->
            <div class="flex items-center gap-4">
              <label class="text-sm font-medium text-gray-700 w-12 flex-shrink-0">Title</label>
              <input
                v-model="form.title"
                type="text"
                placeholder="Link title"
                class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                @input="handleTitleInput"
              />
            </div>

            <!-- Optional Fields Buttons -->
            <div v-if="!showTags || !showSubLinks" class="flex gap-2">
              <button
                v-if="!showTags"
                @click="showTags = true"
                class="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Tags
              </button>
              <button
                v-if="!showSubLinks"
                @click="expandSubLinks"
                class="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
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
                <label class="block text-sm font-medium text-gray-700">Tags <span class="text-gray-400 font-normal">(comma separated)</span></label>
                <button
                  @click="showTags = false; tagsInput = ''"
                  class="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
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
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
              />
            </div>

            <!-- Sub Links (shown when expanded) -->
            <div v-if="showSubLinks">
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-700">Sub Links</label>
                <button
                  @click="showSubLinks = false; form.sub_links = []"
                  class="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
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
              <label class="block text-sm font-medium text-gray-700 mb-2">Add to Collection</label>
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
                  ref="newFolderInputRef"
                  v-model="newCollectionName"
                  type="text"
                  placeholder="Enter new folder name"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <!-- Body - Batch Add Mode -->
          <div v-else ref="batchScrollContainerRef" class="px-6 py-5 space-y-5 overflow-y-auto max-h-[60vh]">
            <!-- Collection Selection (First) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Add to Collection</label>
              <div class="grid grid-cols-3 gap-2">
                <!-- Existing Collections -->
                <div 
                  v-for="(collection, index) in collections" 
                  :key="index"
                  @click="selectBatchCollection(index)"
                  class="flex flex-col items-center gap-1.5 p-3 border rounded-xl cursor-pointer transition-all text-center"
                  :class="batchSelectedCollectionIndex === index 
                    ? 'border-gray-900 bg-gray-50' 
                    : 'border-gray-200 hover:border-gray-300'"
                >
                  <div 
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0"
                    :class="batchSelectedCollectionIndex === index 
                      ? 'border-gray-900 bg-gray-900' 
                      : 'border-gray-300'"
                  >
                    <svg 
                      v-if="batchSelectedCollectionIndex === index" 
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
                  @click="selectBatchNewCollection"
                  class="flex flex-col items-center gap-1.5 p-3 border rounded-xl cursor-pointer transition-all text-center"
                  :class="isBatchCreateNew 
                    ? 'border-gray-900 bg-gray-50' 
                    : 'border-gray-200 hover:border-gray-300'"
                >
                  <div 
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0"
                    :class="isBatchCreateNew 
                      ? 'border-gray-900 bg-gray-900' 
                      : 'border-gray-300'"
                  >
                    <svg 
                      v-if="isBatchCreateNew" 
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
              <div v-if="isBatchCreateNew" class="mt-3">
                <input
                  ref="batchNewFolderInputRef"
                  v-model="batchNewCollectionName"
                  type="text"
                  placeholder="Enter new folder name"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <!-- Batch Links Input -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Paste Links</label>
              <textarea
                v-model="batchLinksInput"
                placeholder="Paste multiple links here, separated by spaces or new lines...&#10;&#10;Example:&#10;https://google.com&#10;https://github.com&#10;https://twitter.com"
                class="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none text-sm"
                @input="parseBatchLinks"
              ></textarea>
            </div>

            <!-- Parsed Links Preview -->
            <div v-if="parsedLinks.length > 0">
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-700">
                  Parsed Links 
                  <span class="text-gray-400 font-normal">({{ parsedLinks.length }} links)</span>
                </label>
                <button
                  @click="clearBatchLinks"
                  class="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  Clear All
                </button>
              </div>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div
                  v-for="(link, index) in parsedLinks"
                  :key="index"
                  class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group"
                >
                  <div class="flex-1 min-w-0">
                    <input
                      v-model="link.title"
                      type="text"
                      class="w-full text-sm font-medium text-gray-700 bg-transparent border-none outline-none focus:ring-0 p-0"
                      placeholder="Link title"
                    />
                    <p class="text-xs text-gray-400 truncate mt-0.5">{{ link.url }}</p>
                  </div>
                  <button
                    @click="removeParsedLink(index)"
                    class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
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
              v-if="activeTab === 'single'"
              @click="handleSave"
              :disabled="!canSave"
              class="px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
            <button
              v-else
              @click="handleBatchSave"
              :disabled="!canBatchSave"
              class="px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add {{ parsedLinks.length }} Links
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

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

const emit = defineEmits(['update:show', 'add', 'batch-add'])

// Tab state
const activeTab = ref('single')

// Form data for single add
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

// Batch add state
const batchLinksInput = ref('')
const parsedLinks = ref([])
const batchSelectedCollectionIndex = ref(0)
const isBatchCreateNew = ref(false)
const batchNewCollectionName = ref('')

// Optional fields visibility
const showTags = ref(false)
const showSubLinks = ref(false)

// Refs for auto-scroll
const scrollContainerRef = ref(null)
const newFolderInputRef = ref(null)
const batchScrollContainerRef = ref(null)
const batchNewFolderInputRef = ref(null)

// Track if user has manually edited the title
const userEditedTitle = ref(false)

// Reset form when modal opens
watch(() => props.show, (newShow) => {
  if (newShow) {
    // Reset single add form
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
    userEditedTitle.value = false
    showTags.value = false
    showSubLinks.value = false
    
    // Reset batch add form
    batchLinksInput.value = ''
    parsedLinks.value = []
    batchSelectedCollectionIndex.value = props.collections.length > 0 ? 0 : -1
    isBatchCreateNew.value = props.collections.length === 0
    batchNewCollectionName.value = ''
    
    // Reset tab to single
    activeTab.value = 'single'
  }
})

// Extract domain name from URL
const extractDomainName = (url) => {
  try {
    const urlObj = new URL(url)
    let hostname = urlObj.hostname
    // Remove www. prefix
    hostname = hostname.replace(/^www\./, '')
    // Remove common TLDs to get the core name
    const parts = hostname.split('.')
    if (parts.length >= 2) {
      // Return the main domain part (e.g., 'watermarkremoversora' from 'watermarkremoversora.com')
      return parts[0]
    }
    return hostname
  } catch {
    return ''
  }
}

// Auto-fill title from URL when title is empty and user hasn't edited it
watch(() => form.value.url, (newUrl) => {
  if (newUrl && !form.value.title && !userEditedTitle.value) {
    const domainName = extractDomainName(newUrl)
    if (domainName) {
      form.value.title = domainName
    }
  }
})

// Can save check for single add
const canSave = computed(() => {
  const hasUrl = form.value.url.trim().length > 0
  const hasValidTarget = !isCreateNew.value || newCollectionName.value.trim().length > 0
  return hasUrl && hasValidTarget
})

// Can save check for batch add
const canBatchSave = computed(() => {
  const hasLinks = parsedLinks.value.length > 0
  const hasValidTarget = !isBatchCreateNew.value || batchNewCollectionName.value.trim().length > 0
  return hasLinks && hasValidTarget
})

// Handle title input - mark as user edited
const handleTitleInput = () => {
  userEditedTitle.value = true
}

const selectCollection = (index) => {
  selectedCollectionIndex.value = index
  isCreateNew.value = false
}

const selectNewCollection = () => {
  selectedCollectionIndex.value = -1
  isCreateNew.value = true
  
  // Auto scroll to bottom and focus input after DOM updates
  nextTick(() => {
    if (scrollContainerRef.value) {
      scrollContainerRef.value.scrollTo({
        top: scrollContainerRef.value.scrollHeight,
        behavior: 'smooth'
      })
    }
    // Focus the input after scroll animation
    setTimeout(() => {
      if (newFolderInputRef.value) {
        newFolderInputRef.value.focus()
      }
    }, 150)
  })
}

// Batch collection selection
const selectBatchCollection = (index) => {
  batchSelectedCollectionIndex.value = index
  isBatchCreateNew.value = false
}

const selectBatchNewCollection = () => {
  batchSelectedCollectionIndex.value = -1
  isBatchCreateNew.value = true
  
  // Auto scroll and focus input after DOM updates
  nextTick(() => {
    setTimeout(() => {
      if (batchNewFolderInputRef.value) {
        batchNewFolderInputRef.value.focus()
      }
    }, 150)
  })
}

// Parse batch links from input
const parseBatchLinks = () => {
  const input = batchLinksInput.value.trim()
  if (!input) {
    parsedLinks.value = []
    return
  }
  
  // Split by whitespace and newlines
  const urlRegex = /https?:\/\/[^\s]+/gi
  const matches = input.match(urlRegex) || []
  
  // Create unique links with auto-generated titles
  const seenUrls = new Set()
  parsedLinks.value = matches
    .filter(url => {
      const normalized = url.toLowerCase()
      if (seenUrls.has(normalized)) return false
      seenUrls.add(normalized)
      return true
    })
    .map(url => ({
      url: url,
      title: extractDomainName(url) || url,
      tags: [],
      photo_url: '',
      sub_links: []
    }))
}

// Remove a parsed link
const removeParsedLink = (index) => {
  parsedLinks.value.splice(index, 1)
}

// Clear all batch links
const clearBatchLinks = () => {
  batchLinksInput.value = ''
  parsedLinks.value = []
}

const addSubLink = () => {
  form.value.sub_links.push({
    sub_title: '',
    sub_url: ''
  })
}

// Expand sub links section and auto-add one empty sub link
const expandSubLinks = () => {
  showSubLinks.value = true
  // Auto-add one empty sub link if there are none
  if (form.value.sub_links.length === 0) {
    addSubLink()
  }
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

// Handle batch save
const handleBatchSave = () => {
  if (!canBatchSave.value) return

  // Emit batch-add event with all parsed links
  emit('batch-add', {
    links: parsedLinks.value.map(link => ({
      title: link.title || link.url,
      url: link.url,
      tags: [],
      photo_url: '',
      sub_links: []
    })),
    collectionIndex: isBatchCreateNew.value ? -1 : batchSelectedCollectionIndex.value,
    newCollectionName: isBatchCreateNew.value ? (batchNewCollectionName.value || 'New Folder') : null
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

