<template>
  <div class="border border-gray-200 rounded-xl p-5 hover:border-gray-900 transition-colors">
    <!-- Collection Title -->
    <div v-if="!isEditing" class="mb-4">
      <h3 v-if="collection.title" class="text-lg font-semibold text-gray-900 text-center">
        {{ collection.title }}
      </h3>
      <h3 v-else class="text-lg font-semibold text-gray-400 text-center">
        未命名集合
      </h3>
    </div>

    <!-- Edit Mode: Title Input -->
    <div v-if="isEditing" class="mb-4">
      <input
        v-model="localTitle"
        type="text"
        placeholder="集合标题"
        class="w-full text-center text-lg font-semibold text-gray-900 bg-transparent border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none pb-1 transition-colors"
      />
    </div>

    <!-- Links (View Mode) - Flow Layout -->
    <div v-if="!isEditing" class="flex flex-wrap gap-x-6 gap-y-2">
      <LinkItem
        v-for="(link, linkIndex) in collection.links"
        :key="linkIndex"
        :link="link"
        :isEditing="false"
      />
    </div>

    <!-- Links (Edit Mode) - Grid Layout -->
    <div v-else class="space-y-4">
      <LinkItem
        v-for="(link, linkIndex) in collection.links"
        :key="linkIndex"
        :link="link"
        :isEditing="true"
        @update="updateLink(linkIndex, $event)"
        @delete="deleteLink(linkIndex)"
      />

      <!-- Add Link Button -->
      <button
        @click="addLink"
        class="w-full py-4 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors"
      >
        <span class="flex items-center justify-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          添加链接
        </span>
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="!isEditing && (!collection.links || collection.links.length === 0)" class="text-center py-4 text-gray-400 text-sm">
      暂无链接
    </div>

    <!-- Delete Collection Button -->
    <button
      v-if="isEditing"
      @click="$emit('delete', collectionIndex)"
      class="mt-4 w-full py-2 text-xs text-gray-400 hover:text-red-500 transition-colors"
    >
      删除此集合
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import LinkItem from './LinkItem.vue'

const props = defineProps({
  collection: {
    type: Object,
    required: true
  },
  collectionIndex: {
    type: Number,
    required: true
  },
  isEditing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update', 'delete'])

// 本地 title 状态
const localTitle = ref('')

// 监听 isEditing 变化，初始化本地 title
watch(() => props.isEditing, (newVal) => {
  if (newVal) {
    localTitle.value = props.collection.title || ''
  }
}, { immediate: true })

// 监听 collection.title 变化（当外部数据更新时）
watch(() => props.collection.title, (newVal) => {
  if (props.isEditing) {
    localTitle.value = newVal || ''
  }
})

// 监听本地 title 变化，实时更新
watch(localTitle, (newTitle) => {
  if (props.isEditing) {
    emitUpdate()
  }
})

const emitUpdate = () => {
  const updatedCollection = {
    ...props.collection,
    title: localTitle.value,
    links: props.collection.links || []
  }
  emit('update', props.collectionIndex, updatedCollection)
}

const addLink = () => {
  const updatedCollection = {
    ...props.collection,
    title: localTitle.value,
    links: [
      ...(props.collection.links || []),
      {
        title: '',
        url: '',
        tags: [],
        photo_url: '',
        sub_links: []
      }
    ]
  }
  emit('update', props.collectionIndex, updatedCollection)
}

const updateLink = (linkIndex, updatedLink) => {
  const updatedLinks = [...(props.collection.links || [])]
  updatedLinks[linkIndex] = updatedLink
  
  const updatedCollection = {
    ...props.collection,
    title: localTitle.value,
    links: updatedLinks
  }
  
  emit('update', props.collectionIndex, updatedCollection)
}

const deleteLink = (linkIndex) => {
  const updatedLinks = (props.collection.links || []).filter((_, index) => index !== linkIndex)
  
  const updatedCollection = {
    ...props.collection,
    title: localTitle.value,
    links: updatedLinks
  }
  emit('update', props.collectionIndex, updatedCollection)
}
</script>
