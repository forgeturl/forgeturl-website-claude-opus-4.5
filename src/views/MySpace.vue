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
      class="fixed top-4 right-4 z-40 flex items-center gap-3 bg-white dark:bg-slate-800 rounded-full shadow-lg px-4 py-2 border border-gray-100 dark:border-slate-700 transition-colors duration-300"
    >
      <!-- Progress bar -->
      <div v-if="autoSave.showProgress.value" class="flex items-center gap-3">
        <div class="w-32 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            class="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-100"
            :style="{ width: autoSave.saveProgress.value + '%' }"
          ></div>
        </div>
        <span class="text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">Saving...</span>
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
    <div class="p-4 relative transition-colors duration-300">
      <!-- Drag Delete Zone -->
      <DragDeleteZone
        ref="deleteZoneRef"
        :visible="isDragging"
        @delete="handleDragDelete"
      />
      
      <!-- Loading -->
      <div v-if="pageStore.loading && !pageStore.myPages.length" class="flex justify-center py-24">
        <div class="animate-spin rounded-full h-10 w-10 border-2 border-gray-900 dark:border-violet-400 border-t-transparent"></div>
      </div>

      <!-- Empty State - No Pages -->
      <div v-else-if="!pageStore.myPages.length" class="flex flex-col items-center justify-center py-24">
        <div class="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <svg class="w-8 h-8 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">No Pages Yet</h3>
        <p class="text-gray-500 dark:text-slate-400 mb-6">Create your first bookmark page to get started</p>
        <button @click="showCreateModal = true" class="btn btn-primary">
          Create Page
        </button>
      </div>

      <!-- Page Detail View -->
      <div v-else-if="selectedPage" class="animate-fade-in">
        <!-- Search Bar -->
        <div 
          v-if="showSearchBar"
          ref="searchContainerRef"
          class="mb-6 animate-fade-in"
        >
          <div class="relative max-w-2xl mx-auto">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              placeholder="Search title, URL, tags, sub links..."
              class="w-full pl-12 pr-10 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-violet-500 focus:border-transparent transition-all text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 bg-white dark:bg-slate-800"
            />
            <button
              v-if="searchQuery"
              @click="clearSearch"
              class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p v-if="searchQuery && filteredCollectionsCount === 0" class="text-center text-gray-500 dark:text-slate-400 mt-4">
            No matching links found
          </p>
        </div>

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
          <div class="flex-1">
            <h1 
              class="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2 select-none"
              :class="{ 'cursor-pointer hover:text-blue-600 dark:hover:text-violet-400 transition-colors': canEdit }"
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
              class="text-gray-500 dark:text-slate-400 select-none"
              :class="{ 'cursor-pointer hover:text-gray-700 dark:hover:text-slate-300 transition-colors': canEdit }"
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
              class="text-gray-400 dark:text-slate-500 select-none cursor-pointer hover:text-gray-500 dark:hover:text-slate-400 transition-colors"
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
          <div class="flex flex-col items-end gap-1.5 sm:ml-6 flex-shrink-0">
            <div class="flex items-center gap-1.5">
              <button
                ref="searchButtonRef"
                @click="toggleSearch"
                data-search-button
                class="btn-compact btn-secondary flex items-center justify-center w-8 h-8 focus:ring-0 focus:ring-offset-0"
                :class="{ 'bg-gray-900 dark:bg-violet-600 text-white hover:bg-gray-800 dark:hover:bg-violet-500': showSearchBar }"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button
                v-if="canEdit"
                @click="showAddLinkModal = true"
                class="btn-compact btn-secondary flex items-center justify-center gap-1.5 h-8 w-8 sm:w-auto"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span class="hidden sm:inline">Link</span>
              </button>
              <button
                v-if="canEdit"
                @click="showAddCollectionModal = true"
                class="btn-compact btn-secondary flex items-center justify-center gap-1.5 h-8 w-8 sm:w-auto"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7V3z" />
                </svg>
                <span class="hidden sm:inline">Collection</span>
              </button>
              <button
                @click="showShareModal = true"
                class="btn-compact btn-secondary flex items-center justify-center gap-1.5 h-8 w-8 sm:w-auto"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span class="hidden sm:inline">Share</span>
              </button>
            </div>
            <!-- Sublinks Button -->
            <div class="relative group">
              <button
                class="btn-compact btn-secondary flex items-center justify-center w-8 h-8 focus:ring-0 focus:ring-offset-0"
                :class="activeSublink ? 'text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-600' : 'text-amber-500 dark:text-amber-400'"
                aria-label="Sublinks"
                @click="activeSublink ? clearActiveSublink() : null"
              >
                <span class="text-xl font-bold">✦</span>
              </button>
              <div class="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-30">
                <div class="max-h-[150px] overflow-y-auto py-2">
                  <!-- Clear filter option -->
                  <div
                    v-if="activeSublink"
                    @click="clearActiveSublink"
                    class="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer whitespace-nowrap border-b border-gray-100 dark:border-slate-700 mb-1"
                  >
                    ✕ Clear Filter
                  </div>
                  <div
                    v-for="item in sublinkUsageSorted"
                    :key="item.title"
                    @click="setActiveSublink(item.title)"
                    class="px-3 py-1.5 text-sm cursor-pointer whitespace-nowrap hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    :class="activeSublink === item.title ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 font-medium' : 'text-gray-700 dark:text-slate-200'"
                  >
                    {{ item.title }}（{{ item.count }}）
                  </div>
                  <div v-if="sublinkUsageSorted.length === 0" class="px-3 py-2 text-sm text-gray-400 dark:text-slate-400">
                    暂无 sublinks
                  </div>
                </div>
              </div>
            </div>
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
              :searchQuery="searchQuery"
              :activeSublink="activeSublink"
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
            :searchQuery="searchQuery"
            :activeSublink="activeSublink"
          />
        </div>

      </div>

      <!-- Select Page Hint -->
      <div v-else class="flex flex-col items-center justify-center py-24 text-gray-400 dark:text-slate-500">
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
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

// Search state
const showSearchBar = ref(false)
const searchQuery = ref('')
const searchInputRef = ref(null)
const searchContainerRef = ref(null)
const searchButtonRef = ref(null)

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
      // Check URL
      if (link.url?.toLowerCase().includes(query)) return true
      // Check tags
      if (link.tags?.some(tag => tag.toLowerCase().includes(query))) return true
      // Check sub_links title and url
      if (link.sub_links?.some(subLink => 
        subLink.sub_title?.toLowerCase().includes(query) ||
        subLink.sub_url?.toLowerCase().includes(query)
      )) return true
      return false
    })
  }).length
})

const sublinkUsageSorted = computed(() => {
  const usageMap = new Map()
  localCollections.value.forEach((collection) => {
    const links = collection.links || []
    links.forEach((link) => {
      const subLinks = link.sub_links || []
      subLinks.forEach((subLink) => {
        const title = subLink.sub_title?.trim()
        if (!title) return
        usageMap.set(title, (usageMap.get(title) || 0) + 1)
      })
    })
  })

  return Array.from(usageMap.entries())
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      return a.title.localeCompare(b.title)
    })
})

// Active sublink filter state
const activeSublink = ref('')

const setActiveSublink = (title) => {
  activeSublink.value = title
}

const clearActiveSublink = () => {
  activeSublink.value = ''
}

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

// Cleanup event listener on unmount
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(() => pageStore.myPages, (pages) => {
  if (pages.length > 0 && !selectedPageId.value) {
    selectPage(pages[0].page_id)
  }
}, { immediate: true })
</script>
