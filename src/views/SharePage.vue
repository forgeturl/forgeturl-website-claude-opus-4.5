<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Bar -->
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-6xl mx-auto px-6 lg:px-8">
        <div class="flex justify-between items-center h-14">
          <h1 class="text-lg font-bold text-gray-900 tracking-tight">ForgetURL</h1>
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
    </nav>

    <!-- Main Content -->
    <main class="max-w-6xl mx-auto px-6 lg:px-8 py-8">
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-24">
        <div class="animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent"></div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="text-center py-24">
        <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
        <p class="text-gray-500 mb-6">{{ error }}</p>
        <button @click="loadPage" class="btn btn-secondary">重试</button>
      </div>

      <!-- Page Content -->
      <div v-else-if="page" class="animate-fade-in">
        <!-- Header -->
        <div class="flex items-start justify-between mb-8">
          <div class="flex-1">
            <!-- Title -->
            <input
              v-if="isEditing"
              v-model="editForm.title"
              type="text"
              placeholder="页面标题"
              class="text-3xl font-bold text-gray-900 mb-2 w-full bg-transparent border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none pb-1 transition-colors"
            />
            <h1 v-else class="text-3xl font-bold text-gray-900 mb-2">{{ page.title }}</h1>

            <!-- Brief -->
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
          <div v-if="pageConf?.can_edit" class="flex items-center gap-3 ml-6">
            <template v-if="isEditing">
              <button @click="handleCancel" class="btn btn-secondary">
                取消
              </button>
              <button @click="handleSave" :disabled="saving" class="btn btn-primary">
                {{ saving ? '保存中...' : '保存' }}
              </button>
            </template>
            <template v-else>
              <button @click="startEdit" class="btn btn-primary flex items-center gap-2">
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

        <!-- Empty State -->
        <div
          v-if="!isEditing && (!displayCollections.length || displayCollections.every(c => !c.links?.length))"
          class="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl"
        >
          <p class="text-gray-400 mb-4">此页面还没有书签</p>
          <button
            v-if="pageConf?.can_edit"
            @click="startEdit"
            class="text-gray-900 font-medium hover:underline"
          >
            添加书签
          </button>
        </div>

        <!-- Page Info -->
        <div class="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-400">
          <p>更新时间: {{ formatDate(page.update_time) }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getPage, updatePage } from '@/api/space'
import LinkCollection from '@/components/LinkCollection.vue'

const route = useRoute()

const page = ref(null)
const loading = ref(false)
const error = ref('')
const isEditing = ref(false)
const saving = ref(false)

// Page config
const pageConf = computed(() => page.value?.page_conf)

// Can edit
const canEdit = computed(() => pageConf.value?.can_edit || false)

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

// Format date
const formatDate = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp * 1000)
  return date.toLocaleString('zh-CN')
}

// Load page
const loadPage = async () => {
  const pageId = route.params.pageId
  if (!pageId) {
    error.value = '页面ID不存在'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const data = await getPage(pageId)
    page.value = data.page || data
    initEditForm()
  } catch (err) {
    console.error('Load page error:', err)
    error.value = err.message || '加载页面失败，可能没有访问权限'
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

// Start edit
const startEdit = () => {
  if (!canEdit.value) {
    alert('您没有编辑权限')
    return
  }
  isEditing.value = true
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
  if (!canEdit.value) {
    alert('您没有编辑权限')
    return
  }

  saving.value = true

  try {
    await updatePage({
      page_id: page.value.page_id,
      title: editForm.value.title,
      brief: editForm.value.brief,
      collections: editForm.value.collections,
      version: page.value.version,
      mask: 7
    })

    // Reload page
    await loadPage()
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

onMounted(() => {
  loadPage()
})
</script>

