<template>
  <div class="group">
    <!-- View Mode - Simple Link Text -->
    <div v-if="!isEditing" class="inline-block relative">
      <a
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        class="text-gray-500 hover:text-gray-900 hover:font-semibold transition-all no-underline"
      >
        {{ link.title || 'Untitled' }}
      </a>
      
      <!-- Sub Links Star Icon with Dropdown -->
      <div 
        v-if="hasSubLinks" 
        ref="subLinksContainer"
        class="absolute -top-1 -right-3 inline-block"
        @mouseenter="handleMouseEnter"
        @mouseleave="showSubLinksDropdown = false"
      >
        <span 
          class="sub-links-trigger cursor-pointer text-amber-500 hover:text-amber-600 transition-colors text-xs"
        >
          ✦
        </span>
        
        <!-- Sub Links Dropdown -->
        <div 
          v-show="showSubLinksDropdown"
          ref="dropdownRef"
          class="sub-links-dropdown absolute top-0 pt-5 z-50"
          :class="dropdownOnLeft ? 'right-0' : 'left-0'"
        >
          <div class="bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[180px] max-w-[300px]">
            <a
              v-for="(subLink, index) in link.sub_links"
              :key="index"
              :href="subLink.sub_url"
              target="_blank"
              rel="noopener noreferrer"
              class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors truncate"
              :title="subLink.sub_title"
            >
              {{ subLink.sub_title || '未命名子链接' }}
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Mode -->
    <div v-else class="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
      <!-- Title and URL -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">标题</label>
          <input
            v-model="editForm.title"
            type="text"
            placeholder="链接标题"
            class="input text-sm"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">链接</label>
          <input
            v-model="editForm.url"
            type="url"
            placeholder="https://..."
            class="input text-sm"
          />
        </div>
      </div>

      <!-- Tags -->
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">标签 (逗号分隔)</label>
        <input
          v-model="tagsInput"
          type="text"
          placeholder="工具, 开发, 设计"
          class="input text-sm"
        />
      </div>

      <!-- Sub Links -->
      <div v-if="editForm.sub_links.length > 0 || showSubLinks">
        <label class="block text-xs font-medium text-gray-500 mb-2">子链接</label>
        <div class="space-y-2">
          <div
            v-for="(subLink, index) in editForm.sub_links"
            :key="index"
            class="flex gap-2"
          >
            <input
              v-model="subLink.sub_title"
              type="text"
              placeholder="子链接标题"
              class="input flex-1 text-sm"
            />
            <input
              v-model="subLink.sub_url"
              type="url"
              placeholder="子链接地址"
              class="input flex-1 text-sm"
            />
            <button
              @click="removeSubLink(index)"
              class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button
            @click="addSubLink"
            class="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            + 添加子链接
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-between pt-2 border-t border-gray-100">
        <button
          v-if="!showSubLinks && editForm.sub_links.length === 0"
          @click="showSubLinks = true"
          class="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          + 添加子链接
        </button>
        <div v-else></div>
        <button
          @click="$emit('delete')"
          class="text-xs text-red-500 hover:text-red-600 transition-colors"
        >
          删除此链接
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue'

const props = defineProps({
  link: {
    type: Object,
    required: true
  },
  isEditing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update', 'delete'])

const showSubLinks = ref(false)

// Sub links dropdown state
const showSubLinksDropdown = ref(false)
const dropdownOnLeft = ref(false)
const subLinksContainer = ref(null)
const dropdownRef = ref(null)

// Check if link has sub_links
const hasSubLinks = computed(() => {
  return props.link.sub_links && props.link.sub_links.length > 0
})

// Handle mouse enter - check position and show dropdown
const handleMouseEnter = () => {
  showSubLinksDropdown.value = true
  
  // Check if dropdown would overflow right side of screen
  nextTick(() => {
    if (subLinksContainer.value && dropdownRef.value) {
      const containerRect = subLinksContainer.value.getBoundingClientRect()
      const dropdownWidth = 180 // min-w-[180px]
      const rightSpace = window.innerWidth - containerRect.right
      
      // If right space is less than dropdown width, show on left
      dropdownOnLeft.value = rightSpace < dropdownWidth
    }
  })
}

// Edit form
const editForm = ref({
  title: '',
  url: '',
  tags: [],
  photo_url: '',
  sub_links: []
})

// Tags input (comma separated)
const tagsInput = ref('')

// Watch for editing mode changes
watch(() => props.isEditing, (newVal) => {
  if (newVal) {
    editForm.value = {
      title: props.link.title || '',
      url: props.link.url || '',
      tags: [...(props.link.tags || [])],
      photo_url: props.link.photo_url || '',
      sub_links: JSON.parse(JSON.stringify(props.link.sub_links || []))
    }
    tagsInput.value = (props.link.tags || []).join(', ')
    showSubLinks.value = false
  }
}, { immediate: true })

// Watch for editForm changes and emit updates in real-time
watch([() => editForm.value.title, () => editForm.value.url, () => tagsInput.value], () => {
  if (props.isEditing) {
    emitUpdate()
  }
}, { deep: true })

// Watch for sub_links changes
watch(() => editForm.value.sub_links, () => {
  if (props.isEditing) {
    emitUpdate()
  }
}, { deep: true })

const addSubLink = () => {
  editForm.value.sub_links.push({
    sub_title: '',
    sub_url: ''
  })
}

const removeSubLink = (index) => {
  editForm.value.sub_links.splice(index, 1)
}

const emitUpdate = () => {
  // Parse tags
  const tags = tagsInput.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)

  // Filter empty sub links
  const subLinks = editForm.value.sub_links.filter(
    sl => sl.sub_title && sl.sub_url
  )

  const updatedLink = {
    ...editForm.value,
    tags,
    sub_links: subLinks
  }
  
  emit('update', updatedLink)
}
</script>
