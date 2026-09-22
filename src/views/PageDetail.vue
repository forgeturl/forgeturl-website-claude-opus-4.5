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
    <SaveStatus :saving="autoSave.isSaving.value" :saved="autoSave.showSavedMessage.value" :error="autoSave.saveError.value" @retry="retrySave" />

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
        <button @click="loadPage" class="btn btn-secondary">{{ t('page.retry') }}</button>
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
              :placeholder="t('page.searchPlaceholder')"
              :aria-label="t('page.searchPlaceholder')"
              class="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:focus:ring-violet-500"
            />
            <button
              v-if="searchQuery"
              :aria-label="t('modal.clear')"
              @click="clearSearch"
              class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p v-if="searchQuery && filteredCollectionsCount === 0" class="text-center text-gray-500 mt-4">
            {{ t('page.noMatchingLinks') }}
          </p>
        </div>

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">{{ page.title }}<button v-if="canEdit" type="button" class="ml-2 inline-flex size-8 items-center justify-center rounded-lg align-middle text-slate-400 hover:bg-violet-50 hover:text-violet-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500 dark:hover:bg-slate-700" :aria-label="t('modal.editPageInfo')" @click="showEditPageModal = true"><PencilSquareIcon class="size-4" /></button></h1>
            <p v-if="page.brief" class="text-gray-500 dark:text-slate-400">{{ page.brief }}</p>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-1.5 sm:ml-6 flex-shrink-0">
            <div class="relative group">
              <button
                class="btn-compact flex items-center justify-center w-11 h-10 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-500 hover:bg-yellow-100 hover:text-yellow-600 shadow-sm"
                aria-label="Sublinks"
              >
                <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3l1.8 4.4L18 9l-4.2 1.6L12 15l-1.8-4.4L6 9l4.2-1.6L12 3zM19 14l.9 2.2L22 17l-2.1.8L19 20l-.9-2.2L16 17l2.1-.8L19 14zM5 14l.9 2.2L8 17l-2.1.8L5 20l-.9-2.2L2 17l2.1-.8L5 14z" />
                </svg>
              </button>
              <div class="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-30">
                <div class="max-h-[150px] overflow-y-auto py-2">
                  <div
                    v-for="item in sublinkUsageSorted"
                    :key="item.title"
                    class="px-3 py-1.5 text-sm text-gray-700 whitespace-nowrap"
                  >
                    {{ item.title }}（{{ item.count }}）
                  </div>
                  <div v-if="sublinkUsageSorted.length === 0" class="px-3 py-2 text-sm text-gray-400">
                    {{ t('page.noSublinks') }}
                  </div>
                </div>
              </div>
            </div>
            <button
              :aria-label="t('page.searchPlaceholder')"
                :aria-expanded="showSearchBar"
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
              :aria-label="t('modal.addLink')" @click="showAddLinkModal = true"
              class="btn-compact btn-secondary flex items-center justify-center gap-1.5 h-8 w-8 sm:w-auto"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span class="hidden sm:inline">{{ t('page.link') }}</span>
            </button>
            <button
              v-if="canEdit"
              :aria-label="t('page.collection')" @click="showAddCollectionModal = true"
              class="btn-compact btn-secondary flex items-center justify-center gap-1.5 h-8 w-8 sm:w-auto"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7V3z" />
              </svg>
              <span class="hidden sm:inline">{{ t('page.collection') }}</span>
            </button>
            <button
              v-if="page.is_self"
              :aria-label="t('page.share')" @click="showShareModal = true"
              class="btn-compact btn-secondary flex items-center justify-center gap-1.5 h-8 w-8 sm:w-auto"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span class="hidden sm:inline">{{ t('page.share') }}</span>
            </button>
          </div>
        </div>

        <!-- Collections Grid with Draggable -->
        <draggable
          v-if="canEdit"
          v-model="localCollections"
          :group="{ name: 'collections', pull: true, put: ['collections'] }"
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
              :key="collection.__idx"
              :collection="collection"
              :collectionIndex="index"
              :page-key="page?.page_id"
              :canEdit="canEdit"
              :searchQuery="searchQuery"
              @update-title="(title, done) => updateCollectionTitle(index, title, done)"
              @update-link="(linkIndex, link, done) => updateLink(index, linkIndex, link, done)"
              @links-changed="(links) => updateCollectionLinks(index, links)"
              @link-drag-start="(info) => handleLinkDragStart(index, info)"
              @link-drag-end="(evt) => handleLinkDragEnd(evt)"
              @transfer-collection="openCollectionTransfer(index)"
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
              :page-key="page?.page_id"
            :canEdit="false"
            :searchQuery="searchQuery"
          />
        </div>

      </div>
    </div>

    <!-- Create Page Modal -->
    <CreatePageModal v-model:show="showCreateModal" @created="handlePageCreated" />

    <!-- Share Modal -->
    <ShareModal
      :before-action="autoSave.flush"
      v-if="page"
      v-model:show="showShareModal"
      :page="page"
    />

    <!-- Add Link Modal -->
    <EditPageModal v-if="page" v-model:show="showEditPageModal" :title="page.title" :brief="page.brief" @save="handleSavePageInfo" />
    <AddLinkModal
      :draft-scope="page?.page_id || ''"
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

    <CollectionTransferModal
      v-model:show="showCollectionTransferModal"
      :pages="pageStore.myPages"
      :current-page-id="pageId"
      :collection-title="localCollections[transferCollectionIndex]?.title"
      :loading="transferringCollection"
      @confirm="handleCollectionTransfer"
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
import EditPageModal from '@/components/EditPageModal.vue'
import { PencilSquareIcon } from '@heroicons/vue/24/outline'
import SaveStatus from '@/components/SaveStatus.vue'
import { persistPageMutation, appendLinks } from '@/utils/pageMutation'
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { persistLinkEdit } from '@/utils/linkEditor'
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
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
import CollectionTransferModal from '@/components/CollectionTransferModal.vue'
import DragDeleteZone from '@/components/DragDeleteZone.vue'
import AlertModal from '@/components/AlertModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import {
  ensureCollectionsIdx,
  ensureLinkIdx,
  cloneCollectionWithNewIds,
  createEmptyCollection,
  stripCollectionsForSave,
  removeCollectionByIdx,
  removeLinkByIdx
} from '@/utils/collections'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const pageStore = usePageStore()
const { handleLogout: logout } = useAuth()
const { t } = useI18n()

const pageId = computed(() => route.params.pageId)
const page = computed(() => pageStore.currentPage)
const loading = ref(false)
const showEditPageModal = ref(false)
const error = ref('')
const showShareModal = ref(false)
const showCreateModal = ref(false)
const showAddLinkModal = ref(false)
const showAddCollectionModal = ref(false)
const showCollectionTransferModal = ref(false)
const transferCollectionIndex = ref(-1)
const transferringCollection = ref(false)

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
const dragCollectionIdx = ref(null)
const dragLinkIdx = ref(null)

// Can edit check
const canEdit = computed(() => !loading.value && page.value?.page_id === pageId.value && Array.isArray(page.value?.collections) && page.value?.page_conf?.can_edit)

// Local collections for editing (reactive copy)
const localCollections = ref([])

// Auto save functionality. Queue complete page snapshots so route changes do
// not redirect an older page's pending save to the newly selected page.
const autoSave = useAutoSave(async (payload) => {
  return pageStore.updatePage(payload)
})

const saveMutation = (mutate) => persistPageMutation({
  getPage: () => page.value, getCollections: () => localCollections.value,
  commit: (draft) => {
    page.value.title = draft.title; page.value.brief = draft.brief
    page.value.collections = JSON.parse(JSON.stringify(draft.collections))
    localCollections.value = ensureCollectionsIdx(draft.collections)
  },
  flush: autoSave.flush, save: pageStore.updatePage, mutate
})
const completeMutation = async (mutate, done) => {
  try { await saveMutation(mutate); done?.() } catch (error) { done?.(error) }
}
const handleSavePageInfo = ({ title, brief }, done) => completeMutation(draft => { draft.title = title; draft.brief = brief }, done)
const retrySave = async () => { try { await autoSave.flush() } catch { /* status retains the error */ } }
const guardPageLeave = async () => {
  if (transferringCollection.value) return false
  try { await autoSave.flush(); return !transferringCollection.value } catch { return false }
}
onBeforeRouteLeave(guardPageLeave)
onBeforeRouteUpdate(guardPageLeave)

const queueAutoSave = () => {
  if (!page.value) return

  autoSave.markDirty({
    page_id: page.value.page_id,
    title: page.value.title,
    brief: page.value.brief,
    collections: stripCollectionsForSave(localCollections.value),
    version: page.value.version,
    mask: 7
  })
}

// Watch for page changes to sync local collections
watch(() => page.value, (newPage) => {
  if (newPage) {
    localCollections.value = ensureCollectionsIdx(
      JSON.parse(JSON.stringify(newPage.collections || []))
    )
  }
}, { immediate: true })

// Load page
let pageRequest = 0
const loadPage = async () => {
  const request = ++pageRequest
  const id = pageId.value
  if (!id) {
    error.value = t('page.pageIdNotExist')
    return
  }

  loading.value = true
  error.value = ''

  try {
    await pageStore.fetchPage(id)
  } catch (err) {
    if (request !== pageRequest) return
    console.error('Load page error:', err)
    error.value = err.message || t('page.failedToLoadPage')
  } finally {
    if (request === pageRequest) loading.value = false
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
    t('confirm.deletePageConfirm'),
    { type: 'danger', title: t('confirm.deletePageTitle'), confirmText: t('confirm.delete') }
  )
  if (!confirmed) return
  
  try {
    await autoSave.flush()
    await pageStore.deletePage(id)
    if (id === pageId.value) {
      router.push('/')
    }
  } catch (err) {
    console.error('Failed to delete page:', err)
    showAlert(err.message || 'Unknown error', 'error', t('confirm.deleteFailed'))
  }
}

// Handle logout
const handleLogout = async () => {
  if (!await guardPageLeave()) return
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
  dragCollectionIdx.value = localCollections.value[evt.oldIndex]?.__idx ?? null
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
  dragCollectionIdx.value = null
}

const handleLinkDragStart = (collectionIndex, { linkIdx, collectionIdx }) => {
  isDragging.value = true
  dragType.value = 'link'
  dragCollectionIdx.value = collectionIdx ?? localCollections.value[collectionIndex]?.__idx ?? null
  dragLinkIdx.value = linkIdx ?? null
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
  dragCollectionIdx.value = null
  dragLinkIdx.value = null
}

const handleDragDelete = async () => {
  // Capture current drag state before async operation
  // (drag end handlers may reset these values while confirm modal is open)
  const currentDragType = dragType.value
  const currentCollectionIdx = dragCollectionIdx.value
  const currentLinkIdx = dragLinkIdx.value
  
  const itemType = currentDragType === 'collection' ? 'folder' : 'link'
  
  const confirmed = await showConfirm(
    t('confirm.deleteItemConfirm', { item: itemType }),
    { type: 'danger', title: t('confirm.deleteItemTitle', { item: itemType.charAt(0).toUpperCase() + itemType.slice(1) }), confirmText: t('confirm.delete') }
  )
  
  if (confirmed) {
    if (currentDragType === 'collection' && currentCollectionIdx) {
      removeCollectionByIdx(localCollections.value, currentCollectionIdx)
      queueAutoSave()
    } else if (currentDragType === 'link' && currentCollectionIdx && currentLinkIdx) {
      removeLinkByIdx(localCollections.value, currentCollectionIdx, currentLinkIdx)
      queueAutoSave()
    }
  }
  
  // Reset drag state
  isDragging.value = false
  dragType.value = null
  dragCollectionIdx.value = null
  dragLinkIdx.value = null
}

// ==================== Collection Operations ====================

// Add collection from modal
const handleAddCollection = ({ name, position }, done) => completeMutation(draft => {
  const collection = createEmptyCollection(name, [])
  position === 'head' ? draft.collections.unshift(collection) : draft.collections.push(collection)
}, done)

// Update collection title
const updateCollectionTitle = (index, title, done) => completeMutation(draft => {
  if (!draft.collections[index]) throw new Error('Folder is no longer available')
  draft.collections[index].title = title
}, done)

const openCollectionTransfer = (index) => {
  transferCollectionIndex.value = index
  showCollectionTransferModal.value = true
}

const handleCollectionTransfer = async ({ operation, targetPageId }) => {
  if (transferringCollection.value) return
  const index = transferCollectionIndex.value
  const original = localCollections.value[index]
  const sourcePageId = page.value?.page_id
  const sourceCollectionId = original?.__idx
  if (!sourcePageId || !sourceCollectionId || !targetPageId || !['copy', 'move'].includes(operation)) return

  transferringCollection.value = true
  try {
    if (targetPageId === sourcePageId) {
      if (operation !== 'copy') return
      await saveMutation(draft => {
        const source = draft.collections[index]
        if (source?.__idx !== sourceCollectionId) throw new Error(t('collection.transferFailed'))
        const copy = cloneCollectionWithNewIds(source)
        copy.title = source.title ? `${source.title} ${t('collection.copy')}` : t('collection.copy')
        draft.collections.splice(index + 1, 0, copy)
      })
    } else {
      await autoSave.flush()
      if (page.value?.page_id !== sourcePageId || localCollections.value[index]?.__idx !== sourceCollectionId) {
        throw new Error(t('collection.transferFailed'))
      }
      await pageStore.transferCollection({
        sourcePageId,
        targetPageId,
        sourceCollectionIndex: index,
        operation,
        sourceVersion: page.value.version
      })
      if (operation === 'move' && page.value?.page_id === sourcePageId) {
        const currentIndex = localCollections.value.findIndex(collection => collection.__idx === sourceCollectionId)
        if (currentIndex !== -1) localCollections.value.splice(currentIndex, 1)
      }
    }

    showCollectionTransferModal.value = false
    showAlert(
      operation === 'copy' ? t('collection.copySuccess') : t('collection.moveSuccess'),
      'success',
      t('confirm.notice')
    )
  } catch (err) {
    showAlert(err.message || t('collection.transferFailed'), 'error', t('confirm.error'))
  } finally {
    transferringCollection.value = false
  }
}

// Update collection links (for drag and drop)
const updateCollectionLinks = (index, links) => {
  localCollections.value[index].links = links
  queueAutoSave()
}

// Handle collections order change (drag)
const handleCollectionsChange = () => {
  queueAutoSave()
}

// ==================== Link Operations ====================

// Update link
const updateLink = async (collectionIndex, linkIndex, link, done) => {
  try {
    await persistLinkEdit({
      getPage: () => page.value, getCollections: () => localCollections.value,
      collectionIndex, linkIndex, link, flush: autoSave.flush, save: pageStore.updatePage
    })
    done?.()
  } catch (error) {
    done?.(error)
  }
}

// Delete link
const deleteLink = (collectionIndex, linkIndex) => {
  localCollections.value[collectionIndex].links.splice(linkIndex, 1)
  queueAutoSave()
}

// Handle add new link from modal
const handleAddNewLink = ({ link, collectionIndex, newCollectionName }, done) => completeMutation(draft => {
  appendLinks(draft.collections, { links: [ensureLinkIdx({ ...link })], collectionIndex, newCollectionName }, createEmptyCollection)
}, done)

// Handle batch add links from modal
const handleBatchAddLinks = ({ links, collectionIndex, newCollectionName }, done) => completeMutation(draft => {
  appendLinks(draft.collections, { links: links.map(link => ensureLinkIdx({ ...link })), collectionIndex, newCollectionName }, createEmptyCollection)
}, done)

// Handle import bookmarks from modal
const handleImportBookmarks = ({ folders }) => saveMutation(draft => {
  const nonEmpty = (folders || []).filter(folder => folder.links?.length)
  if (!nonEmpty.length) throw new Error('No bookmarks to import')
  for (const folder of nonEmpty) draft.collections.push(createEmptyCollection(folder.title || t('modal.importedFolder'), folder.links))
})


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
