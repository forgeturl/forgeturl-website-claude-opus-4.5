<template>
  <AppLayout
    :pages="pageStore.myPages"
    :currentPageId="pageId"
    :user="authStore.user"
    @create-page="showCreateModal = true"
    @select-page="selectPage"
    @delete-page="handleDeletePage"
    @logout="handleLogout"
  >
    <!-- Save Progress Bar (Fixed at top-right) -->
    <div 
      v-if="canEdit && (autoSave.showProgress.value || autoSave.showSavedMessage.value || autoSave.saveError.value)"
      class="fixed top-4 right-4 z-40 flex items-center gap-3 bg-white rounded-full shadow-lg px-4 py-2 border border-gray-100"
    >
      <!-- Progress bar -->
      <div v-if="autoSave.showProgress.value" class="flex items-center gap-3">
        <div class="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            class="h-full bg-emerald-500 rounded-full transition-all duration-100"
            :style="{ width: autoSave.saveProgress.value + '%' }"
          ></div>
        </div>
        <span class="text-xs text-gray-500 whitespace-nowrap">Saving...</span>
      </div>
      
      <!-- Saved message -->
      <div v-else-if="autoSave.showSavedMessage.value" class="flex items-center gap-2 text-emerald-600">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span class="text-xs font-medium">Saved</span>
      </div>
      
      <!-- Error message -->
      <div v-else-if="autoSave.saveError.value" class="flex items-center gap-2 text-red-600">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-xs font-medium">{{ autoSave.saveError.value }}</span>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="p-4 relative">
      <!-- Drag Delete Zone -->
      <DragDeleteZone
        ref="deleteZoneRef"
        :visible="isDragging"
        @delete="handleDragDelete"
      />
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-24">
        <div class="animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent"></div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-24">
        <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p class="text-red-600 mb-4">{{ error }}</p>
        <button @click="loadPage" class="btn btn-secondary">Retry</button>
      </div>

      <!-- Page Content -->
      <div v-else-if="page" class="animate-fade-in">
        <!-- Search Bar -->
        <div 
          v-if="showSearchBar"
          ref="searchContainerRef"
          class="mb-6 animate-fade-in"
        >
          <div class="relative max-w-2xl mx-auto">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              placeholder="Search title, tags, sub links..."
              class="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
            />
            <button
              v-if="searchQuery"
              @click="clearSearch"
              class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p v-if="searchQuery && filteredCollectionsCount === 0" class="text-center text-gray-500 mt-4">
            No matching links found
          </p>
        </div>

        <!-- Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ page.title }}</h1>
            <p v-if="page.brief" class="text-gray-500">{{ page.brief }}</p>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-1.5 ml-6">
            <button
              @click="toggleSearch"
              data-search-button
              class="btn-compact btn-secondary flex items-center justify-center w-8 h-8 focus:ring-0 focus:ring-offset-0"
              :class="{ 'bg-gray-900 text-white hover:bg-gray-800': showSearchBar }"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button
              v-if="canEdit"
              @click="showAddLinkModal = true"
              class="btn-compact btn-secondary flex items-center gap-1.5 h-8"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Link
            </button>
            <button
              v-if="canEdit"
              @click="showAddCollectionModal = true"
              class="btn-compact btn-secondary flex items-center gap-1.5 h-8"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7V3z" />
              </svg>
              Collection
            </button>
            <button
              v-if="page.is_self"
              @click="showShareModal = true"
              class="btn-compact btn-secondary flex items-center gap-1.5 h-8"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>
        </div>

        <!-- Collections Grid with Draggable -->
        <draggable
          v-if="canEdit"
          v-model="localCollections"
          :group="{ name: 'collections' }"
          item-key="__idx"
          handle=".collection-drag-handle"
          ghost-class="collection-drop-indicator"
          chosen-class="collection-dragging-source"
          drag-class="collection-drag-preview"
          :force-fallback="true"
          :fallback-class="'collection-drag-fallback'"
          :animation="0"
          :scroll="true"
          :scrollSensitivity="100"
          :scrollSpeed="80"
          :bubbleScroll="true"
          @start="handleCollectionDragStart"
          @end="handleCollectionDragEnd"
          @change="handleCollectionsChange"
          class="collections-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <template #item="{ element: collection, index }">
            <LinkCollection
              :collection="collection"
              :collectionIndex="index"
              :canEdit="canEdit"
              :searchQuery="searchQuery"
              @update-title="(title) => updateCollectionTitle(index, title)"
              @update-link="(linkIndex, link) => updateLink(index, linkIndex, link)"
              @links-changed="(links) => updateCollectionLinks(index, links)"
              @link-drag-start="(info) => handleLinkDragStart(index, info)"
              @link-drag-end="(evt) => handleLinkDragEnd(evt)"
              @copy-collection="copyCollection(index)"
            />
          </template>
        </draggable>

        <!-- Read-only mode -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <LinkCollection
            v-for="(collection, index) in localCollections"
            :key="index"
            :collection="collection"
            :collectionIndex="index"
            :canEdit="false"
            :searchQuery="searchQuery"
          />
        </div>

        <!-- Empty Collections -->
        <div
          v-if="!localCollections.length || localCollections.every(c => !c.links?.length)"
          class="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl mt-6"
        >
          <p class="text-gray-400 mb-4">No bookmarks on this page yet</p>
          <button
            v-if="canEdit"
            @click="showAddLinkModal = true"
            class="text-gray-900 font-medium hover:underline"
          >
            Add your first link
          </button>
        </div>
      </div>
    </div>

    <!-- Create Page Modal -->
    <CreatePageModal v-model:show="showCreateModal" @created="handlePageCreated" />

    <!-- Share Modal -->
    <ShareModal
      v-if="page"
      v-model:show="showShareModal"
      :page="page"
    />

    <!-- Add Link Modal -->
    <AddLinkModal
      v-model:show="showAddLinkModal"
      :collections="localCollections"
      :onImportBookmarks="handleImportBookmarks"
      @add="handleAddNewLink"
      @batch-add="handleBatchAddLinks"
    />

    <!-- Add Collection Modal -->
    <AddCollectionModal
      v-model:show="showAddCollectionModal"
      @confirm="handleAddCollection"
    />

    <!-- Alert Modal -->
    <AlertModal
      v-model:show="alertModal.show"
      :type="alertModal.type"
      :title="alertModal.title"
      :message="alertModal.message"
    />

    <!-- Confirm Modal -->
    <ConfirmModal
      v-model:show="confirmModal.show"
      :type="confirmModal.type"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :confirm-text="confirmModal.confirmText"
      @confirm="confirmModal.onConfirm"
      @cancel="confirmModal.onCancel"
    />
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePageStore } from '@/stores/page'
import { useAuth } from '@/composables/useAuth'
import { useAutoSave } from '@/composables/useAutoSave'
import draggable from 'vuedraggable'
import AppLayout from '@/components/AppLayout.vue'
import LinkCollection from '@/components/LinkCollection.vue'
import ShareModal from '@/components/ShareModal.vue'
import CreatePageModal from '@/components/CreatePageModal.vue'
import AddLinkModal from '@/components/AddLinkModal.vue'
import AddCollectionModal from '@/components/AddCollectionModal.vue'
import DragDeleteZone from '@/components/DragDeleteZone.vue'
import AlertModal from '@/components/AlertModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const pageStore = usePageStore()
const { handleLogout: logout } = useAuth()

const pageId = computed(() => route.params.pageId)
const page = computed(() => pageStore.currentPage)
const loading = ref(false)
const error = ref('')
const showShareModal = ref(false)
const showCreateModal = ref(false)
const showAddLinkModal = ref(false)
const showAddCollectionModal = ref(false)

// Search state
const showSearchBar = ref(false)
const searchQuery = ref('')
const searchInputRef = ref(null)
const searchContainerRef = ref(null)

// Handle click outside to close search bar
const handleClickOutside = (event) => {
  if (!showSearchBar.value) return
  
  // Check if click is outside search container and search button
  const isOutsideContainer = searchContainerRef.value && !searchContainerRef.value.contains(event.target)
  const isOutsideButton = !event.target.closest('[data-search-button]')
  
  if (isOutsideContainer && isOutsideButton) {
    showSearchBar.value = false
    searchQuery.value = ''
  }
}

// Toggle search bar
const toggleSearch = () => {
  showSearchBar.value = !showSearchBar.value
  if (showSearchBar.value) {
    nextTick(() => {
      searchInputRef.value?.focus()
      // Add click outside listener
      document.addEventListener('click', handleClickOutside)
    })
  } else {
    searchQuery.value = ''
    document.removeEventListener('click', handleClickOutside)
  }
}

// Clear search
const clearSearch = () => {
  searchQuery.value = ''
  searchInputRef.value?.focus()
}

// Count filtered collections (for showing "no results" message)
const filteredCollectionsCount = computed(() => {
  if (!searchQuery.value) return localCollections.value.length
  
  const query = searchQuery.value.toLowerCase()
  return localCollections.value.filter(collection => {
    const links = collection.links || []
    return links.some(link => {
      // Check title
      if (link.title?.toLowerCase().includes(query)) return true
      // Check tags
      if (link.tags?.some(tag => tag.toLowerCase().includes(query))) return true
      // Check sub_links
      if (link.sub_links?.some(subLink => subLink.sub_title?.toLowerCase().includes(query))) return true
      return false
    })
  }).length
})

// Alert modal state
const alertModal = ref({
  show: false,
  type: 'error',
  title: 'Error',
  message: ''
})

// Confirm modal state
const confirmModal = ref({
  show: false,
  type: 'warning',
  title: 'Confirm',
  message: '',
  confirmText: 'Confirm',
  onConfirm: () => {},
  onCancel: () => {}
})

// Show alert modal
const showAlert = (message, type = 'error', title = 'Error') => {
  alertModal.value = {
    show: true,
    type,
    title,
    message
  }
}

// Show confirm modal with promise
const showConfirm = (message, options = {}) => {
  return new Promise((resolve) => {
    confirmModal.value = {
      show: true,
      type: options.type || 'warning',
      title: options.title || 'Confirm',
      message,
      confirmText: options.confirmText || 'Confirm',
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false)
    }
  })
}

// Drag delete state
const isDragging = ref(false)
const deleteZoneRef = ref(null)
const dragType = ref(null) // 'collection' or 'link'
const dragCollectionIndex = ref(-1)
const dragLinkIndex = ref(-1)

// Can edit check
const canEdit = computed(() => page.value?.page_conf?.can_edit)

// Local collections for editing (reactive copy)
const localCollections = ref([])

// Auto save functionality
const autoSave = useAutoSave(async () => {
  if (!page.value) return
  
  await pageStore.updatePage({
    page_id: page.value.page_id,
    title: page.value.title,
    brief: page.value.brief,
    collections: localCollections.value,
    version: page.value.version,
    mask: 7
  })
})


// Watch for page changes to sync local collections
watch(() => page.value, (newPage) => {
  if (newPage) {
    localCollections.value = JSON.parse(JSON.stringify(newPage.collections || []))
  }
}, { immediate: true, deep: true })

// Load page
const loadPage = async () => {
  const id = pageId.value
  if (!id) {
    error.value = 'Page ID does not exist'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await pageStore.fetchPage(id)
  } catch (err) {
    console.error('Load page error:', err)
    error.value = err.message || 'Failed to load page'
  } finally {
    loading.value = false
  }
}

// Select page (from sidebar)
const selectPage = (id) => {
  if (id !== pageId.value) {
    router.push(`/page/${id}`)
  }
}

// Delete page
const handleDeletePage = async (id) => {
  const confirmed = await showConfirm(
    'Are you sure you want to delete this page? This action cannot be undone.',
    { type: 'danger', title: 'Delete Page', confirmText: 'Delete' }
  )
  if (!confirmed) return
  
  try {
    await pageStore.deletePage(id)
    if (id === pageId.value) {
      router.push('/')
    }
  } catch (err) {
    console.error('Failed to delete page:', err)
    showAlert(err.message || 'Unknown error', 'error', 'Delete Failed')
  }
}

// Handle logout
const handleLogout = async () => {
  await logout()
}

// Handle page created
const handlePageCreated = (id) => {
  showCreateModal.value = false
  if (id) {
    router.push(`/page/${id}`)
  }
}

// ==================== Drag Delete Handlers ====================

const handleCollectionDragStart = (evt) => {
  isDragging.value = true
  dragType.value = 'collection'
  dragCollectionIndex.value = evt.oldIndex
}

const handleCollectionDragEnd = (evt) => {
  // Check if dropped on delete zone using mouse position
  if (evt.originalEvent && deleteZoneRef.value?.isPointInZone) {
    const { clientX, clientY } = evt.originalEvent
    if (deleteZoneRef.value.isPointInZone(clientX, clientY)) {
      handleDragDelete()
      return
    }
  }
  
  isDragging.value = false
  dragType.value = null
  dragCollectionIndex.value = -1
}

const handleLinkDragStart = (collectionIndex, { linkIndex }) => {
  isDragging.value = true
  dragType.value = 'link'
  dragCollectionIndex.value = collectionIndex
  dragLinkIndex.value = linkIndex
}

const handleLinkDragEnd = (evt) => {
  // Check if dropped on delete zone using mouse position
  if (evt?.originalEvent && deleteZoneRef.value?.isPointInZone) {
    const { clientX, clientY } = evt.originalEvent
    if (deleteZoneRef.value.isPointInZone(clientX, clientY)) {
      handleDragDelete()
      return
    }
  }
  
  isDragging.value = false
  dragType.value = null
  dragCollectionIndex.value = -1
  dragLinkIndex.value = -1
}

const handleDragDelete = async () => {
  // Capture current drag state before async operation
  // (drag end handlers may reset these values while confirm modal is open)
  const currentDragType = dragType.value
  const currentCollectionIndex = dragCollectionIndex.value
  const currentLinkIndex = dragLinkIndex.value
  
  const itemType = currentDragType === 'collection' ? 'folder' : 'link'
  
  const confirmed = await showConfirm(
    `Are you sure you want to delete this ${itemType}?`,
    { type: 'danger', title: `Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`, confirmText: 'Delete' }
  )
  
  if (confirmed) {
    if (currentDragType === 'collection' && currentCollectionIndex >= 0) {
      localCollections.value.splice(currentCollectionIndex, 1)
      autoSave.markDirty()
    } else if (currentDragType === 'link' && currentCollectionIndex >= 0 && currentLinkIndex >= 0) {
      localCollections.value[currentCollectionIndex].links.splice(currentLinkIndex, 1)
      autoSave.markDirty()
    }
  }
  
  // Reset drag state
  isDragging.value = false
  dragType.value = null
  dragCollectionIndex.value = -1
  dragLinkIndex.value = -1
}

// ==================== Collection Operations ====================

// Add collection from modal
const handleAddCollection = ({ name, position }) => {
  const newCollection = {
    title: name,
    links: []
  }
  
  if (position === 'head') {
    localCollections.value.unshift(newCollection)
  } else {
    localCollections.value.push(newCollection)
  }
  
  autoSave.markDirty()
}

// Update collection title
const updateCollectionTitle = (index, title) => {
  localCollections.value[index].title = title
  autoSave.markDirty()
}

// Copy collection
const copyCollection = (index) => {
  const original = localCollections.value[index]
  const copy = JSON.parse(JSON.stringify(original))
  copy.title = original.title ? `${original.title} (Copy)` : 'Copy'
  
  // Insert after the original
  localCollections.value.splice(index + 1, 0, copy)
  autoSave.markDirty()
}

// Update collection links (for drag and drop)
const updateCollectionLinks = (index, links) => {
  localCollections.value[index].links = links
  autoSave.markDirty()
}

// Handle collections order change (drag)
const handleCollectionsChange = () => {
  autoSave.markDirty()
}

// ==================== Link Operations ====================

// Update link
const updateLink = (collectionIndex, linkIndex, link) => {
  localCollections.value[collectionIndex].links[linkIndex] = link
  autoSave.markDirty()
}

// Delete link
const deleteLink = (collectionIndex, linkIndex) => {
  localCollections.value[collectionIndex].links.splice(linkIndex, 1)
  autoSave.markDirty()
}

// Handle add new link from modal
const handleAddNewLink = ({ link, collectionIndex, newCollectionName }) => {
  if (collectionIndex === -1 && newCollectionName) {
    // Create new collection with the link
    localCollections.value.push({
      title: newCollectionName,
      links: [link]
    })
  } else if (collectionIndex >= 0) {
    // Add to existing collection
    if (!localCollections.value[collectionIndex].links) {
      localCollections.value[collectionIndex].links = []
    }
    localCollections.value[collectionIndex].links.push(link)
  }
  autoSave.markDirty()
}

// Handle batch add links from modal
const handleBatchAddLinks = ({ links, collectionIndex, newCollectionName }) => {
  console.log('handleBatchAddLinks called with:', { links, collectionIndex, newCollectionName })
  if (collectionIndex === -1 && newCollectionName) {
    // Create new collection with all the links
    localCollections.value.push({
      title: newCollectionName,
      links: links
    })
  } else if (collectionIndex >= 0) {
    // Add all links to existing collection
    if (!localCollections.value[collectionIndex].links) {
      localCollections.value[collectionIndex].links = []
    }
    localCollections.value[collectionIndex].links.push(...links)
  }
  autoSave.markDirty()
}

// Handle import bookmarks from modal
const handleImportBookmarks = ({ folders }) => {
  console.log('handleImportBookmarks called with folders:', folders)
  
  // Add each folder as a new collection
  // If a collection with the same name exists, add links to it
  folders.forEach(folder => {
    const existingIndex = localCollections.value.findIndex(
      c => c.title?.toLowerCase() === folder.title?.toLowerCase()
    )
    
    if (existingIndex >= 0) {
      // Add to existing collection
      if (!localCollections.value[existingIndex].links) {
        localCollections.value[existingIndex].links = []
      }
      localCollections.value[existingIndex].links.push(...folder.links)
    } else {
      // Create new collection
      localCollections.value.push({
        title: folder.title,
        links: folder.links
      })
    }
  })
  
  console.log('localCollections after import:', localCollections.value)
  console.log('Calling autoSave.markDirty()')
  
  // markDirty will trigger auto-save after 5 seconds (built-in delay in useAutoSave)
  autoSave.markDirty()
}


// Watch for route changes
watch(pageId, (newId) => {
  if (newId) {
    loadPage()
  }
})

// Load my space for sidebar
onMounted(async () => {
  try {
    await pageStore.fetchMySpace()
  } catch (err) {
    console.error('Failed to fetch space:', err)
  }
  loadPage()
})

// Cleanup event listener on unmount
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Prevent layout shift during collection drag */
.collections-grid {
  min-height: 100px;
}
</style>

<style>
/* Collection drag styles - must be global for vuedraggable dynamic classes */

/* Source element - stays in place but faded */
.collection-dragging-source {
  opacity: 0.4 !important;
  background: rgba(59, 130, 246, 0.08) !important;
  border: 2px dashed #93c5fd !important;
  box-shadow: none !important;
}

/* Drop indicator - blue line showing where item will be inserted */
.collection-drop-indicator {
  position: relative !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  opacity: 1 !important;
  min-height: 8px !important;
  max-height: 8px !important;
  height: 8px !important;
  padding: 0 !important;
  margin: 0 !important;
  overflow: visible !important;
  border-radius: 0 !important;
}

.collection-drop-indicator::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4px;
  transform: translateY(-50%);
  background: linear-gradient(90deg, #3b82f6, #60a5fa, #3b82f6);
  border-radius: 2px;
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.6), 0 0 4px rgba(59, 130, 246, 0.8);
  animation: collection-indicator-pulse 1.5s ease-in-out infinite;
}

@keyframes collection-indicator-pulse {
  0%, 100% {
    box-shadow: 0 0 12px rgba(59, 130, 246, 0.6), 0 0 4px rgba(59, 130, 246, 0.8);
  }
  50% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 8px rgba(59, 130, 246, 1);
  }
}

.collection-drop-indicator > * {
  display: none !important;
}

/* Drag preview - the element being dragged */
.collection-drag-preview {
  opacity: 0.9 !important;
  transform: rotate(2deg) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

/* Fallback drag element */
.collection-drag-fallback {
  opacity: 0.95 !important;
  transform: rotate(1deg) scale(1.02) !important;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25) !important;
  border: 2px solid #3b82f6 !important;
  background: white !important;
  z-index: 9999 !important;
}
</style>
