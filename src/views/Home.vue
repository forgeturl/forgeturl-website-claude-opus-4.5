<template>
  <AppLayout
    :pages="pageStore.myPages"
    :currentPageId="selectedPageId"
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
      <div v-if="pageStore.loading && !pageStore.myPages.length" class="flex justify-center py-24">
        <div class="animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent"></div>
      </div>

      <!-- Empty State - No Pages -->
      <div v-else-if="!pageStore.myPages.length" class="flex flex-col items-center justify-center py-24">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Pages Yet</h3>
        <p class="text-gray-500 mb-6">Create your first bookmark page to get started</p>
        <button @click="showCreateModal = true" class="btn btn-primary">
          Create Page
        </button>
      </div>

      <!-- Page Detail View -->
      <div v-else-if="selectedPage" class="animate-fade-in">
        <!-- Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h1 
              class="text-3xl font-bold text-gray-900 mb-2 select-none"
              :class="{ 'cursor-pointer hover:text-blue-600 transition-colors': canEdit }"
              @mousedown="handlePageTitleMouseDown"
              @mouseup="handlePageTitleMouseUp"
              @mouseleave="handlePageTitleMouseLeave"
              @touchstart="handlePageTitleTouchStart"
              @touchend="handlePageTitleTouchEnd"
              @touchmove="handlePageTitleTouchMove"
            >
              {{ selectedPage.title }}
            </h1>
            <p 
              v-if="selectedPage.brief" 
              class="text-gray-500 select-none"
              :class="{ 'cursor-pointer hover:text-gray-700 transition-colors': canEdit }"
              @mousedown="handlePageTitleMouseDown"
              @mouseup="handlePageTitleMouseUp"
              @mouseleave="handlePageTitleMouseLeave"
              @touchstart="handlePageTitleTouchStart"
              @touchend="handlePageTitleTouchEnd"
              @touchmove="handlePageTitleTouchMove"
            >
              {{ selectedPage.brief }}
            </p>
            <p 
              v-else-if="canEdit" 
              class="text-gray-400 select-none cursor-pointer hover:text-gray-500 transition-colors"
              @mousedown="handlePageTitleMouseDown"
              @mouseup="handlePageTitleMouseUp"
              @mouseleave="handlePageTitleMouseLeave"
              @touchstart="handlePageTitleTouchStart"
              @touchend="handlePageTitleTouchEnd"
              @touchmove="handlePageTitleTouchMove"
            >
              Add description
            </p>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex items-center gap-3 ml-6">
            <button
              v-if="canEdit"
              @click="showAddLinkModal = true"
              class="btn btn-secondary flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Link
            </button>
            <button
              v-if="canEdit"
              @click="showAddCollectionModal = true"
              class="btn btn-secondary flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7V3z" />
              </svg>
              Collection
            </button>
            <button
              @click="showShareModal = true"
              class="btn btn-secondary flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>
        </div>

        <!-- Collections Grid with Draggable (Edit mode) -->
        <draggable
          v-if="canEdit"
          v-model="localCollections"
          :group="{ name: 'collections' }"
          item-key="__idx"
          handle=".collection-drag-handle"
          ghost-class="opacity-50"
          :animation="200"
          @start="handleCollectionDragStart"
          @end="handleCollectionDragEnd"
          @change="handleCollectionsChange"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <template #item="{ element: collection, index }">
            <LinkCollection
              :collection="collection"
              :collectionIndex="index"
              :canEdit="canEdit"
              @update-title="(title) => updateCollectionTitle(index, title)"
              @update-link="(linkIndex, link) => updateLink(index, linkIndex, link)"
              @links-changed="(links) => updateCollectionLinks(index, links)"
              @link-drag-start="(info) => handleLinkDragStart(index, info)"
              @link-drag-end="handleLinkDragEnd"
              @copy-collection="copyCollection(index)"
            />
          </template>
        </draggable>

        <!-- Collections Grid (Read-only mode) -->
        <div v-else-if="selectedPage.collections && selectedPage.collections.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <LinkCollection
            v-for="(collection, index) in selectedPage.collections"
            :key="index"
            :collection="collection"
            :collectionIndex="index"
            :canEdit="false"
          />
        </div>

        <!-- Empty Links -->
        <div v-if="!localCollections.length || localCollections.every(c => !c.links?.length)" class="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl mt-6">
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

      <!-- Select Page Hint -->
      <div v-else class="flex flex-col items-center justify-center py-24 text-gray-400">
        <svg class="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
        <p>Select a page from the sidebar</p>
      </div>
    </div>

    <!-- Create Page Modal -->
    <CreatePageModal v-model:show="showCreateModal" @created="handlePageCreated" />

    <!-- Share Modal -->
    <ShareModal
      v-if="selectedPage"
      v-model:show="showShareModal"
      :page="selectedPage"
    />

    <!-- Add Link Modal -->
    <AddLinkModal
      v-model:show="showAddLinkModal"
      :collections="localCollections"
      @add="handleAddNewLink"
      @batch-add="handleBatchAddLinks"
      :onImportBookmarks="handleImportBookmarks"
    />

    <!-- Add Collection Modal -->
    <AddCollectionModal
      v-model:show="showAddCollectionModal"
      @confirm="handleAddCollection"
    />

    <!-- Edit Page Modal -->
    <EditPageModal
      v-model:show="showEditPageModal"
      :title="selectedPage?.title"
      :brief="selectedPage?.brief"
      :saving="savingPageInfo"
      @save="handleSavePageInfo"
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePageStore } from '@/stores/page'
import { useAuth } from '@/composables/useAuth'
import { useAutoSave } from '@/composables/useAutoSave'
import draggable from 'vuedraggable'
import AppLayout from '@/components/AppLayout.vue'
import CreatePageModal from '@/components/CreatePageModal.vue'
import ShareModal from '@/components/ShareModal.vue'
import LinkCollection from '@/components/LinkCollection.vue'
import AddLinkModal from '@/components/AddLinkModal.vue'
import AddCollectionModal from '@/components/AddCollectionModal.vue'
import DragDeleteZone from '@/components/DragDeleteZone.vue'
import EditPageModal from '@/components/EditPageModal.vue'
import AlertModal from '@/components/AlertModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const pageStore = usePageStore()
const { handleLogout: logout } = useAuth()

const showCreateModal = ref(false)
const showShareModal = ref(false)
const showAddLinkModal = ref(false)
const showAddCollectionModal = ref(false)
const showEditPageModal = ref(false)
const savingPageInfo = ref(false)
const selectedPageId = ref('')

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

const selectedPage = computed(() => {
  if (!selectedPageId.value) return null
  return pageStore.myPages.find(p => p.page_id === selectedPageId.value)
})

// Can edit check
const canEdit = computed(() => selectedPage.value?.page_conf?.can_edit)

// Local collections for editing (reactive copy)
const localCollections = ref([])

// Long press detection for page title/brief
let pageTitleLongPressTimer = null
const longPressDelay = 500

// Mouse handlers (desktop) - long press to edit page info
const handlePageTitleMouseDown = (e) => {
  if (!canEdit.value) return
  
  pageTitleLongPressTimer = setTimeout(() => {
    showEditPageModal.value = true
  }, longPressDelay)
}

const handlePageTitleMouseUp = () => {
  if (pageTitleLongPressTimer) {
    clearTimeout(pageTitleLongPressTimer)
    pageTitleLongPressTimer = null
  }
}

const handlePageTitleMouseLeave = () => {
  if (pageTitleLongPressTimer) {
    clearTimeout(pageTitleLongPressTimer)
    pageTitleLongPressTimer = null
  }
}

// Touch handlers (mobile) - long press to edit page info
const handlePageTitleTouchStart = (e) => {
  if (!canEdit.value) return
  pageTitleLongPressTimer = setTimeout(() => {
    showEditPageModal.value = true
  }, longPressDelay)
}

const handlePageTitleTouchEnd = () => {
  if (pageTitleLongPressTimer) {
    clearTimeout(pageTitleLongPressTimer)
    pageTitleLongPressTimer = null
  }
}

const handlePageTitleTouchMove = () => {
  if (pageTitleLongPressTimer) {
    clearTimeout(pageTitleLongPressTimer)
    pageTitleLongPressTimer = null
  }
}

// Save page info (title and brief)
const handleSavePageInfo = async ({ title, brief }) => {
  if (!selectedPage.value) return
  
  savingPageInfo.value = true
  try {
    await pageStore.updatePage({
      page_id: selectedPage.value.page_id,
      title: title,
      brief: brief,
      version: selectedPage.value.version,
      mask: 3 // Only update title (1) and brief (2) = 3
    })
    
    // Update will be reflected through the store
    showEditPageModal.value = false
  } catch (err) {
    console.error('Save page info error:', err)
    showAlert(err.message || 'Unknown error', 'error', 'Save Failed')
  } finally {
    savingPageInfo.value = false
  }
}

// Auto save functionality
const autoSave = useAutoSave(async () => {
  if (!selectedPage.value) return
  
  await pageStore.updatePage({
    page_id: selectedPage.value.page_id,
    title: selectedPage.value.title,
    brief: selectedPage.value.brief,
    collections: localCollections.value,
    version: selectedPage.value.version,
    mask: 7
  })
})

// Watch for page changes to sync local collections
watch(() => selectedPage.value, (newPage) => {
  if (newPage) {
    localCollections.value = JSON.parse(JSON.stringify(newPage.collections || []))
  }
}, { immediate: true, deep: true })

const selectPage = async (pageId) => {
  selectedPageId.value = pageId
  try {
    await pageStore.fetchPage(pageId)
    const index = pageStore.myPages.findIndex(p => p.page_id === pageId)
    if (index !== -1 && pageStore.currentPage) {
      pageStore.myPages[index] = { ...pageStore.myPages[index], ...pageStore.currentPage }
    }
  } catch (error) {
    console.error('Failed to fetch page:', error)
  }
}

const handleDeletePage = async (pageId) => {
  const confirmed = await showConfirm(
    'Are you sure you want to delete this page? This action cannot be undone.',
    { type: 'danger', title: 'Delete Page', confirmText: 'Delete' }
  )
  if (!confirmed) return
  
  try {
    await pageStore.deletePage(pageId)
    if (selectedPageId.value === pageId) {
      selectedPageId.value = pageStore.myPages[0]?.page_id || ''
    }
  } catch (error) {
    console.error('Failed to delete page:', error)
    showAlert(error.message || 'Unknown error', 'error', 'Delete Failed')
  }
}

const handlePageCreated = async (pageId) => {
  showCreateModal.value = false
  if (pageId) {
    selectedPageId.value = pageId
    await selectPage(pageId)
  }
}

const handleLogout = async () => {
  await logout()
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
  console.log('handleImportBookmarks called with:', folders)
  
  if (!folders || folders.length === 0) {
    console.log('No folders to import')
    return
  }
  
  // Add each folder as a new collection
  folders.forEach(folder => {
    if (folder.links && folder.links.length > 0) {
      localCollections.value.push({
        title: folder.title || 'Imported Folder',
        links: folder.links
      })
    }
  })
  
  // Mark as dirty to trigger auto save (5s delay)
  autoSave.markDirty()
  console.log('Import complete, marked dirty for auto save')
}

onMounted(async () => {
  try {
    await pageStore.fetchMySpace()
    if (pageStore.myPages.length > 0 && !selectedPageId.value) {
      selectPage(pageStore.myPages[0].page_id)
    }
  } catch (error) {
    console.error('Failed to fetch space:', error)
  }
})

watch(() => pageStore.myPages, (pages) => {
  if (pages.length > 0 && !selectedPageId.value) {
    selectPage(pages[0].page_id)
  }
}, { immediate: true })
</script>
