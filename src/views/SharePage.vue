<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Bar -->
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-6xl mx-auto px-6 lg:px-8">
        <div class="flex justify-between items-center h-14">
          <h1 class="text-lg font-bold text-gray-900 tracking-tight">ForgetURL</h1>
          
          <!-- Save Status -->
          <div class="flex items-center gap-3">
            <div 
              v-if="canEdit && (autoSave.showProgress.value || autoSave.showSavedMessage.value || autoSave.saveError.value)"
              class="flex items-center gap-3 bg-white rounded-full px-3 py-1"
            >
              <!-- Progress bar -->
              <div v-if="autoSave.showProgress.value" class="flex items-center gap-2">
                <div class="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-emerald-500 rounded-full transition-all duration-100"
                    :style="{ width: autoSave.saveProgress.value + '%' }"
                  ></div>
                </div>
                <span class="text-xs text-gray-500">Saving...</span>
              </div>
              
              <!-- Saved message -->
              <div v-else-if="autoSave.showSavedMessage.value" class="flex items-center gap-1 text-emerald-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-xs font-medium">Saved</span>
              </div>
              
              <!-- Error message -->
              <div v-else-if="autoSave.saveError.value" class="flex items-center gap-1 text-red-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-xs font-medium">Save failed</span>
              </div>
            </div>

            <span
              v-if="pageConf"
              class="px-3 py-1 text-xs font-medium rounded-full"
              :class="{
                'bg-blue-50 text-blue-600': pageConf.can_edit,
                'bg-gray-100 text-gray-600': pageConf.read_only
              }"
            >
              {{ pageConf.read_only ? 'Read-only' : pageConf.can_edit ? 'Editable' : 'View' }}
            </span>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-6xl mx-auto px-6 lg:px-8 py-8">
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-24">
        <div class="animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent"></div>
      </div>

      <!-- Need Login -->
      <div v-else-if="needLogin" class="text-center py-24">
        <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Login Required</h3>
        <p class="text-gray-500 mb-6">Please login to access this page</p>
        <button @click="goToLogin" class="btn btn-primary">Login</button>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-24">
        <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Load Failed</h3>
        <p class="text-gray-500 mb-6">{{ error }}</p>
        <button @click="loadPage" class="btn btn-secondary">Retry</button>
      </div>

      <!-- Page Content -->
      <div v-else-if="page" class="animate-fade-in">
        <!-- Header -->
        <div class="flex items-start justify-between mb-8">
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ page.title }}</h1>
            <p v-if="page.brief" class="text-gray-500">{{ page.brief }}</p>
          </div>
        </div>

        <!-- Collections Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LinkCollection
            v-for="(collection, index) in localCollections"
            :key="index"
            :collection="collection"
            :collectionIndex="index"
            :canEdit="canEdit"
            @update-title="(title) => updateCollectionTitle(index, title)"
            @update-link="(linkIndex, link) => updateLink(index, linkIndex, link)"
            @links-changed="(links) => updateCollectionLinks(index, links)"
            @copy-collection="copyCollection(index)"
          />
        </div>

        <!-- Empty State -->
        <div
          v-if="!localCollections.length || localCollections.every(c => !c.links?.length)"
          class="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl mt-6"
        >
          <p class="text-gray-400">No bookmarks on this page yet</p>
        </div>

        <!-- Page Info -->
        <div class="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-400">
          <p>Updated: {{ formatDate(page.update_time) }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPage, updatePage } from '@/api/space'
import { useAutoSave } from '@/composables/useAutoSave'
import LinkCollection from '@/components/LinkCollection.vue'

const route = useRoute()
const router = useRouter()

const page = ref(null)
const loading = ref(false)
const error = ref('')
const needLogin = ref(false)

// Page config
const pageConf = computed(() => page.value?.page_conf)

// Can edit - directly from page_conf
const canEdit = computed(() => pageConf.value?.can_edit || false)

// Local collections for editing
const localCollections = ref([])

// Auto save functionality
const autoSave = useAutoSave(async () => {
  if (!page.value || !canEdit.value) return
  
  await updatePage({
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

// Format date
const formatDate = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp * 1000)
  return date.toLocaleString('zh-CN')
}

const goToLogin = () => {
  router.push({
    path: '/login',
    query: { redirect: route.fullPath }
  })
}

// Load page
const loadPage = async () => {
  const pageId = route.params.pageId
  if (!pageId) {
    error.value = 'Page ID does not exist'
    return
  }

  loading.value = true
  error.value = ''
  needLogin.value = false

  try {
    const data = await getPage(pageId)
    page.value = data.page || data
  } catch (err) {
    console.error('Load page error:', err)
    if (err.code === 40001) {
      needLogin.value = true
      error.value = 'Please login to access this page'
    } else {
      error.value = err.message || 'Failed to load page, you may not have access'
    }
  } finally {
    loading.value = false
  }
}

// ==================== Collection Operations ====================

// Update collection title
const updateCollectionTitle = (index, title) => {
  localCollections.value[index].title = title
  autoSave.markDirty()
}

// Update collection links
const updateCollectionLinks = (index, links) => {
  localCollections.value[index].links = links
  autoSave.markDirty()
}

// Update link
const updateLink = (collectionIndex, linkIndex, link) => {
  localCollections.value[collectionIndex].links[linkIndex] = link
  autoSave.markDirty()
}

// Copy collection
const copyCollection = (index) => {
  const original = localCollections.value[index]
  const copy = JSON.parse(JSON.stringify(original))
  copy.title = original.title ? `${original.title} (Copy)` : 'Copy'
  
  localCollections.value.splice(index + 1, 0, copy)
  autoSave.markDirty()
}

onMounted(() => {
  loadPage()
})
</script>
