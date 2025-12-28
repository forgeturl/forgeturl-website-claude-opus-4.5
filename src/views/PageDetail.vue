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
        <span class="text-xs text-gray-500 whitespace-nowrap">等待保存...</span>
      </div>
      
      <!-- Saved message -->
      <div v-else-if="autoSave.showSavedMessage.value" class="flex items-center gap-2 text-emerald-600">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span class="text-xs font-medium">已保存修改</span>
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
    <div class="p-8 relative">
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
        <button @click="loadPage" class="btn btn-secondary">重试</button>
      </div>

      <!-- Page Content -->
      <div v-else-if="page" class="animate-fade-in">
        <!-- Header -->
        <div class="flex items-start justify-between mb-8">
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ page.title }}</h1>
            <p v-if="page.brief" class="text-gray-500">{{ page.brief }}</p>
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
              v-if="page.is_self"
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

        <!-- Collections Grid with Draggable -->
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
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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

        <!-- Read-only mode -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LinkCollection
            v-for="(collection, index) in localCollections"
            :key="index"
            :collection="collection"
            :collectionIndex="index"
            :canEdit="false"
          />
        </div>

        <!-- Empty Collections -->
        <div
          v-if="!localCollections.length || localCollections.every(c => !c.links?.length)"
          class="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl mt-6"
        >
          <p class="text-gray-400 mb-4">此页面还没有书签</p>
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
      @add="handleAddNewLink"
    />

    <!-- Add Collection Modal -->
    <AddCollectionModal
      v-model:show="showAddCollectionModal"
      @confirm="handleAddCollection"
    />
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
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
    error.value = '页面ID不存在'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await pageStore.fetchPage(id)
  } catch (err) {
    console.error('Load page error:', err)
    error.value = err.message || '加载页面失败'
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
  if (!confirm('确定要删除此页面吗？此操作不可撤销。')) return
  
  try {
    await pageStore.deletePage(id)
    if (id === pageId.value) {
      router.push('/')
    }
  } catch (err) {
    console.error('Failed to delete page:', err)
    alert('删除失败：' + (err.message || '未知错误'))
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

const handleLinkDragEnd = () => {
  isDragging.value = false
  dragType.value = null
  dragCollectionIndex.value = -1
  dragLinkIndex.value = -1
}

const handleDragDelete = () => {
  const itemType = dragType.value === 'collection' ? '文件夹' : '链接'
  
  if (confirm(`确定要删除此${itemType}吗？`)) {
    if (dragType.value === 'collection' && dragCollectionIndex.value >= 0) {
      localCollections.value.splice(dragCollectionIndex.value, 1)
      autoSave.markDirty()
    } else if (dragType.value === 'link' && dragCollectionIndex.value >= 0 && dragLinkIndex.value >= 0) {
      localCollections.value[dragCollectionIndex.value].links.splice(dragLinkIndex.value, 1)
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
</script>
