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
    <!-- Main Content Area -->
    <div class="p-8">
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
            <!-- Title (Edit Mode) -->
            <input
              v-if="isEditing"
              v-model="editForm.title"
              type="text"
              placeholder="页面标题"
              class="text-3xl font-bold text-gray-900 mb-2 w-full bg-transparent border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none pb-1 transition-colors"
            />
            <h1 v-else class="text-3xl font-bold text-gray-900 mb-2">{{ page.title }}</h1>

            <!-- Brief (Edit Mode) -->
            <input
              v-if="isEditing"
              v-model="editForm.brief"
              type="text"
              placeholder="页面描述"
              class="text-gray-500 w-full bg-transparent border-b border-gray-100 focus:border-gray-300 focus:outline-none pb-1 transition-colors"
            />
            <p v-else-if="page.brief" class="text-gray-500">{{ page.brief }}</p>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-3 ml-6">
            <template v-if="isEditing">
              <button @click="handleCancel" class="btn btn-secondary">
                取消
              </button>
              <button @click="handleSave" :disabled="saving" class="btn btn-primary">
                {{ saving ? '保存中...' : '保存' }}
              </button>
            </template>
            <template v-else>
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
              <button
                v-if="page.page_conf?.can_edit"
                @click="isEditing = true"
                class="btn btn-primary flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            </template>
          </div>
        </div>

        <!-- Collections Grid (View Mode) -->
        <div v-if="!isEditing" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LinkCollection
            v-for="(collection, index) in displayCollections"
            :key="index"
            :collection="collection"
            :collectionIndex="index"
            :isEditing="false"
          />
        </div>

        <!-- Collections List (Edit Mode) -->
        <div v-else class="space-y-6">
          <LinkCollection
            v-for="(collection, index) in displayCollections"
            :key="index"
            :collection="collection"
            :collectionIndex="index"
            :isEditing="true"
            @update="updateCollection"
            @delete="deleteCollection"
          />

          <!-- Add Collection Button -->
          <button
            @click="addCollection"
            class="w-full py-8 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
          >
            <span class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              添加链接集合
            </span>
          </button>
        </div>

        <!-- Empty Collections -->
        <div
          v-if="!isEditing && (!displayCollections.length || displayCollections.every(c => !c.links?.length))"
          class="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl"
        >
          <p class="text-gray-400 mb-4">此页面还没有书签</p>
          <button
            v-if="page.page_conf?.can_edit"
            @click="isEditing = true"
            class="text-gray-900 font-medium hover:underline"
          >
            添加书签
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
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePageStore } from '@/stores/page'
import { useAuth } from '@/composables/useAuth'
import AppLayout from '@/components/AppLayout.vue'
import LinkCollection from '@/components/LinkCollection.vue'
import ShareModal from '@/components/ShareModal.vue'
import CreatePageModal from '@/components/CreatePageModal.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const pageStore = usePageStore()
const { handleLogout: logout } = useAuth()

const pageId = computed(() => route.params.pageId)
const page = computed(() => pageStore.currentPage)
const loading = ref(false)
const error = ref('')
const isEditing = ref(false)
const saving = ref(false)
const showShareModal = ref(false)
const showCreateModal = ref(false)

// Edit form
const editForm = ref({
  title: '',
  brief: '',
  collections: []
})

// Display collections
const displayCollections = computed(() => {
  return isEditing.value ? editForm.value.collections : (page.value?.collections || [])
})

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
    initEditForm()
  } catch (err) {
    console.error('Load page error:', err)
    error.value = err.message || '加载页面失败'
  } finally {
    loading.value = false
  }
}

// Initialize edit form
const initEditForm = () => {
  if (page.value) {
    editForm.value = {
      title: page.value.title || '',
      brief: page.value.brief || '',
      collections: JSON.parse(JSON.stringify(page.value.collections || []))
    }
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

// Add collection
const addCollection = () => {
  editForm.value.collections.push({
    title: '',
    links: []
  })
}

// Update collection
const updateCollection = (index, collection) => {
  // 使用 splice 确保 Vue 检测到数组变化
  editForm.value.collections.splice(index, 1, collection)
}

// Delete collection
const deleteCollection = (index) => {
  editForm.value.collections.splice(index, 1)
}

// Handle save
const handleSave = async () => {
  saving.value = true

  try {
    await pageStore.updatePage({
      page_id: page.value.page_id,
      title: editForm.value.title,
      brief: editForm.value.brief,
      collections: editForm.value.collections,
      version: page.value.version,
      mask: 7
    })
    isEditing.value = false
  } catch (err) {
    console.error('Save error:', err)
    alert(err.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// Handle cancel
const handleCancel = () => {
  isEditing.value = false
  initEditForm()
}

// Watch for route changes
watch(pageId, (newId) => {
  if (newId) {
    loadPage()
    isEditing.value = false
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
