<template>
  <div 
    class="group inline-flex items-center gap-1 relative"
    :class="{ 'cursor-grab': canEdit }"
  >
    <!-- Drag Handle (visible on hover in edit mode) -->
    <div 
      v-if="canEdit"
      class="link-drag-handle flex-shrink-0 w-4 h-4 flex items-center justify-center cursor-grab opacity-0 group-hover:opacity-100 transition-opacity -ml-5"
    >
      <svg class="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
        <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/>
      </svg>
    </div>

    <!-- Link Text -->
    <div class="inline-block relative max-w-[180px]">
      <!-- Read-only mode: normal link -->
      <a
        v-if="!canEdit"
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        class="text-gray-500 hover:text-gray-900 hover:font-semibold transition-all no-underline block truncate"
        :title="link.title || 'Untitled'"
      >
        {{ link.title || 'Untitled' }}
      </a>
      
      <!-- Edit mode: click to open, long press to edit -->
      <a
        v-else
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        class="text-gray-500 hover:text-gray-900 hover:font-semibold transition-all no-underline select-none block truncate"
        :title="link.title || 'Untitled'"
        @click="handleClick"
        @mousedown="handleMouseDown"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseLeave"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
        @touchmove="handleTouchMove"
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
              {{ subLink.sub_title || 'Unnamed sub link' }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

const props = defineProps({
  link: {
    type: Object,
    required: true
  },
  linkIndex: {
    type: Number,
    default: 0
  },
  canEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit'])

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

// Long press detection
let longPressTimer = null
const longPressDelay = 500
let isLongPress = false

// Mouse handlers (desktop)
const handleMouseDown = (e) => {
  if (!props.canEdit) return
  
  isLongPress = false
  longPressTimer = setTimeout(() => {
    isLongPress = true
    emit('edit')
  }, longPressDelay)
}

const handleMouseUp = () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

const handleMouseLeave = () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

// Touch handlers (mobile)
const handleTouchStart = (e) => {
  if (!props.canEdit) return
  
  isLongPress = false
  longPressTimer = setTimeout(() => {
    isLongPress = true
    emit('edit')
  }, longPressDelay)
}

const handleTouchEnd = (e) => {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
  
  // Prevent navigation if it was a long press
  if (isLongPress) {
    e.preventDefault()
    isLongPress = false
  }
}

const handleTouchMove = () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

// Click handler - prevent navigation if long press triggered
const handleClick = (e) => {
  if (isLongPress) {
    e.preventDefault()
    isLongPress = false
  }
  // Otherwise, let the default <a> behavior happen (navigate to link)
}
</script>
