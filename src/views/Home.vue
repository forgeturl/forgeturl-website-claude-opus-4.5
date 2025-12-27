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
    <!-- Main Content Area -->
    <div class="p-8">
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
        <h3 class="text-lg font-medium text-gray-900 mb-2">还没有页面</h3>
        <p class="text-gray-500 mb-6">创建您的第一个书签页面开始使用</p>
        <button @click="showCreateModal = true" class="btn btn-primary">
          创建页面
        </button>
      </div>

      <!-- Page Detail View -->
      <div v-else-if="selectedPage" class="animate-fade-in">
        <!-- Header -->
        <div class="flex items-start justify-between mb-8">
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ selectedPage.title }}</h1>
            <p v-if="selectedPage.brief" class="text-gray-500">{{ selectedPage.brief }}</p>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex items-center gap-3 ml-6">
            <button
              @click="showShareModal = true"
              class="btn btn-secondary flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
            <button
              @click="goToEditPage"
              class="btn btn-primary flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          </div>
        </div>

        <!-- Collections Grid -->
        <div v-if="selectedPage.collections && selectedPage.collections.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LinkCollection
            v-for="(collection, index) in selectedPage.collections"
            :key="index"
            :collection="collection"
            :collectionIndex="index"
            :isEditing="false"
          />
        </div>

        <!-- Empty Links -->
        <div v-else class="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <p class="text-gray-400 mb-4">此页面还没有书签</p>
          <button @click="goToEditPage" class="text-gray-900 font-medium hover:underline">
            添加书签
          </button>
        </div>
      </div>

      <!-- Select Page Hint -->
      <div v-else class="flex flex-col items-center justify-center py-24 text-gray-400">
        <svg class="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
        <p>请从左侧选择一个页面</p>
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
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePageStore } from '@/stores/page'
import { useAuth } from '@/composables/useAuth'
import AppLayout from '@/components/AppLayout.vue'
import CreatePageModal from '@/components/CreatePageModal.vue'
import ShareModal from '@/components/ShareModal.vue'
import LinkCollection from '@/components/LinkCollection.vue'

const router = useRouter()
const authStore = useAuthStore()
const pageStore = usePageStore()
const { handleLogout: logout } = useAuth()

const showCreateModal = ref(false)
const showShareModal = ref(false)
const selectedPageId = ref('')

// 选中的页面
const selectedPage = computed(() => {
  if (!selectedPageId.value) return null
  return pageStore.myPages.find(p => p.page_id === selectedPageId.value)
})

// 选择页面
const selectPage = async (pageId) => {
  selectedPageId.value = pageId
  // 获取页面详情
  try {
    await pageStore.fetchPage(pageId)
    // 更新 myPages 中对应页面的完整信息
    const index = pageStore.myPages.findIndex(p => p.page_id === pageId)
    if (index !== -1 && pageStore.currentPage) {
      pageStore.myPages[index] = { ...pageStore.myPages[index], ...pageStore.currentPage }
    }
  } catch (error) {
    console.error('Failed to fetch page:', error)
  }
}

// 删除页面
const handleDeletePage = async (pageId) => {
  if (!confirm('确定要删除此页面吗？此操作不可撤销。')) return
  
  try {
    await pageStore.deletePage(pageId)
    if (selectedPageId.value === pageId) {
      selectedPageId.value = pageStore.myPages[0]?.page_id || ''
    }
  } catch (error) {
    console.error('Failed to delete page:', error)
    alert('删除失败：' + (error.message || '未知错误'))
  }
}

// 前往编辑页面
const goToEditPage = () => {
  if (selectedPageId.value) {
    router.push(`/page/${selectedPageId.value}`)
  }
}

// 处理页面创建
const handlePageCreated = async (pageId) => {
  showCreateModal.value = false
  if (pageId) {
    selectedPageId.value = pageId
    await selectPage(pageId)
  }
}

// 处理登出
const handleLogout = async () => {
  await logout()
}

// 初始化
onMounted(async () => {
  try {
    await pageStore.fetchMySpace()
    // 自动选中第一个页面
    if (pageStore.myPages.length > 0 && !selectedPageId.value) {
      selectPage(pageStore.myPages[0].page_id)
    }
  } catch (error) {
    console.error('Failed to fetch space:', error)
  }
})

// 监听页面列表变化，自动选中
watch(() => pageStore.myPages, (pages) => {
  if (pages.length > 0 && !selectedPageId.value) {
    selectPage(pages[0].page_id)
  }
}, { immediate: true })
</script>
