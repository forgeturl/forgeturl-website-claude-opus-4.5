<template>
  <div 
    v-show="!shouldHide"
    class="border border-gray-200 dark:border-slate-700 rounded-xl p-4 hover:border-gray-900 dark:hover:border-violet-500 transition-colors relative group bg-white dark:bg-slate-800"
  >
    <!-- Drag Handle for Collection (top-left, only in edit mode) -->
    <div 
      v-if="canEdit"
      class="collection-drag-handle absolute -top-2 -left-2 w-6 h-6 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-full flex items-center justify-center cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
      @mousedown.stop
      @touchstart.stop
    >
      <svg class="w-3 h-3 text-gray-400 dark:text-slate-400" fill="currentColor" viewBox="0 0 20 20">
        <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/>
      </svg>
    </div>

    <!-- Copy Button (top-left offset, only in edit mode) -->
    <button
      v-if="canEdit"
      @click="handleCopyCollection"
      class="absolute -top-2 left-6 w-6 h-6 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
      title="Duplicate this collection"
    >
      <svg class="w-3 h-3 text-gray-400 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    </button>

    <!-- Collection Title -->
    <div class="mb-2">
      <h3 
        v-if="collection.title"
        class="text-base font-semibold text-gray-900 dark:text-slate-100 text-center"
      >
        <span
          class="select-none"
          :class="{ 'cursor-pointer hover:text-blue-600 dark:hover:text-violet-400 transition-colors': canEdit }"
          @mousedown="handleTitleMouseDown"
          @mouseup="handleTitleMouseUp"
          @mouseleave="handleTitleMouseLeave"
          @touchstart="handleTitleTouchStart"
          @touchend="handleTitleTouchEnd"
          @touchmove="handleTitleTouchMove"
        >{{ collection.title }}</span>
      </h3>
      <h3 
        v-else
        class="text-base font-semibold text-gray-400 dark:text-slate-500 text-center"
      >
        <span
          class="select-none"
          :class="{ 'cursor-pointer hover:text-gray-600 dark:hover:text-slate-300 transition-colors': canEdit }"
          @mousedown="handleTitleMouseDown"
          @mouseup="handleTitleMouseUp"
          @mouseleave="handleTitleMouseLeave"
          @touchstart="handleTitleTouchStart"
          @touchend="handleTitleTouchEnd"
          @touchmove="handleTitleTouchMove"
        >Unnamed Collection</span>
      </h3>
    </div>

    <!-- Links (Draggable in edit mode) -->
    <draggable
      v-if="canEdit"
      v-model="localLinks"
      :group="{ name: 'links', pull: true, put: ['links'] }"
      item-key="__idx"
      handle=".link-drag-handle"
      ghost-class="link-drop-indicator"
      chosen-class="link-dragging-source"
      :animation="0"
      :scroll="true"
      :scrollSensitivity="100"
      :scrollSpeed="80"
      :bubbleScroll="true"
      class="links-draggable flex flex-wrap gap-x-10 gap-y-2 min-h-[60px] relative pl-5"
      @change="handleLinksChange"
      @start="handleDragStart"
      @end="handleDragEnd"
    >
      <template #item="{ element: link, index }">
        <LinkItem
          v-show="linkMatchesQuery(link, searchQuery) && linkMatchesActiveSublink(link)"
          :link="link"
          :linkIndex="index"
          :canEdit="true"
          :searchQuery="searchQuery"
          :activeSublink="activeSublink"
          @edit="handleEditLink(index, link)"
        />
      </template>
      <!-- Empty State inside draggable for drop target -->
      <template #footer>
        <div 
          v-if="localLinks.length === 0" 
          class="empty-state-hint w-full text-center py-4 text-gray-400 dark:text-slate-500 text-sm"
        >
          Drag links here
        </div>
      </template>
    </draggable>

    <!-- Links (Read-only) -->
    <div v-else class="flex flex-wrap gap-x-10 gap-y-2">
      <LinkItem
        v-for="(link, linkIndex) in filteredLinksWithSublink"
        :key="linkIndex"
        :link="link"
        :linkIndex="linkIndex"
        :canEdit="false"
        :searchQuery="searchQuery"
        :activeSublink="activeSublink"
      />
      <!-- Empty State for read-only -->
      <div v-if="!filteredLinksWithSublink.length" class="w-full text-center py-4 text-gray-400 dark:text-slate-500 text-sm">
        No links yet
      </div>
    </div>

    <!-- Title Edit Modal -->
    <CollectionTitleModal
      v-model:show="showTitleModal"
      :title="collection.title"
      @save="handleSaveTitle"
    />

    <!-- Link Edit Modal -->
    <LinkEditModal
      v-model:show="showLinkModal"
      :link="editingLink"
      @save="handleSaveLinkEdit"
    />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import draggable from 'vuedraggable'
import LinkItem from './LinkItem.vue'
import CollectionTitleModal from './CollectionTitleModal.vue'
import LinkEditModal from './LinkEditModal.vue'

const props = defineProps({
  collection: {
    type: Object,
    required: true
  },
  collectionIndex: {
    type: Number,
    required: true
  },
  canEdit: {
    type: Boolean,
    default: false
  },
  searchQuery: {
    type: String,
    default: ''
  },
  activeSublink: {
    type: String,
    default: ''
  }
})

const emit = defineEmits([
  'update-title',
  'update-link',
  'delete-link',
  'links-changed',
  'link-drag-start',
  'link-drag-end',
  'copy-collection'
])

// Local state for draggable
const localLinks = ref([])

// Sync local links with props
watch(() => props.collection.links, (newLinks) => {
  localLinks.value = JSON.parse(JSON.stringify(newLinks || []))
}, { immediate: true, deep: true })

// Check if a link matches the search query
const linkMatchesQuery = (link, query) => {
  if (!query) return true
  const lowerQuery = query.toLowerCase()
  
  // Check title
  if (link.title?.toLowerCase().includes(lowerQuery)) return true
  // Check URL
  if (link.url?.toLowerCase().includes(lowerQuery)) return true
  // Check tags
  if (link.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) return true
  // Check sub_links title and url
  if (link.sub_links?.some(subLink => 
    subLink.sub_title?.toLowerCase().includes(lowerQuery) ||
    subLink.sub_url?.toLowerCase().includes(lowerQuery)
  )) return true
  
  return false
}

// Check if a link has the active sublink
const linkMatchesActiveSublink = (link) => {
  if (!props.activeSublink) return true
  return link.sub_links?.some(subLink => subLink.sub_title?.trim() === props.activeSublink)
}

// Filtered links based on search query
const filteredLinks = computed(() => {
  if (!props.searchQuery) return localLinks.value
  return localLinks.value.filter(link => linkMatchesQuery(link, props.searchQuery))
})

// Filtered links based on both search query and active sublink
const filteredLinksWithSublink = computed(() => {
  let links = localLinks.value
  if (props.searchQuery) {
    links = links.filter(link => linkMatchesQuery(link, props.searchQuery))
  }
  if (props.activeSublink) {
    links = links.filter(link => linkMatchesActiveSublink(link))
  }
  return links
})

// Should hide collection if no links match
const shouldHide = computed(() => {
  if (!props.searchQuery && !props.activeSublink) return false
  return filteredLinksWithSublink.value.length === 0
})

// Title modal
const showTitleModal = ref(false)

// Long press for title (same behavior as LinkItem)
let titleLongPressTimer = null
const longPressDelay = 500

// Mouse handlers (desktop) - long press to edit
const handleTitleMouseDown = (e) => {
  if (!props.canEdit) return
  
  titleLongPressTimer = setTimeout(() => {
    openTitleModal()
  }, longPressDelay)
}

const handleTitleMouseUp = () => {
  if (titleLongPressTimer) {
    clearTimeout(titleLongPressTimer)
    titleLongPressTimer = null
  }
}

const handleTitleMouseLeave = () => {
  if (titleLongPressTimer) {
    clearTimeout(titleLongPressTimer)
    titleLongPressTimer = null
  }
}

// Touch handlers (mobile) - long press to edit
const handleTitleTouchStart = (e) => {
  if (!props.canEdit) return
  titleLongPressTimer = setTimeout(() => {
    openTitleModal()
  }, longPressDelay)
}

const handleTitleTouchEnd = () => {
  if (titleLongPressTimer) {
    clearTimeout(titleLongPressTimer)
    titleLongPressTimer = null
  }
}

const handleTitleTouchMove = () => {
  if (titleLongPressTimer) {
    clearTimeout(titleLongPressTimer)
    titleLongPressTimer = null
  }
}

const openTitleModal = () => {
  showTitleModal.value = true
}

const handleSaveTitle = (title) => {
  emit('update-title', title)
}

const handleCopyCollection = () => {
  emit('copy-collection')
}

// Link edit modal
const showLinkModal = ref(false)
const editingLink = ref(null)
const editingLinkIndex = ref(-1)

const handleEditLink = (index, link) => {
  editingLinkIndex.value = index
  editingLink.value = JSON.parse(JSON.stringify(link))
  showLinkModal.value = true
}

const handleSaveLinkEdit = (updatedLink) => {
  emit('update-link', editingLinkIndex.value, updatedLink)
  editingLinkIndex.value = -1
  editingLink.value = null
}

// Draggable handlers
let currentDragIndex = -1

const handleDragStart = (evt) => {
  currentDragIndex = evt.oldIndex
  emit('link-drag-start', { linkIndex: evt.oldIndex })
}

const handleDragEnd = (evt) => {
  currentDragIndex = -1
  emit('link-drag-end', evt)
}

const handleLinksChange = (evt) => {
  // Emit the entire updated links array to parent
  // This covers all cases: move within, add from other, remove to other
  emit('links-changed', localLinks.value)
}
</script>

<style scoped>
/* Hide empty state hint when there are items being dragged in */
.links-draggable:has(.sortable-ghost) .empty-state-hint,
.links-draggable:has(.link-drag-handle) .empty-state-hint {
  display: none;
}
</style>

<style>
/* Link drag styles - must be global for vuedraggable dynamic classes */

/* Source element - stays in place but faded */
.link-dragging-source {
  opacity: 0.4 !important;
  position: relative;
}

.link-dragging-source::after {
  content: '';
  position: absolute;
  inset: -2px;
  background: rgba(59, 130, 246, 0.15);
  border-radius: 4px;
  pointer-events: none;
}

/* Drop indicator - blue vertical line */
.link-drop-indicator {
  display: inline-block !important;
  width: 3px !important;
  min-width: 3px !important;
  max-width: 3px !important;
  height: 18px !important;
  min-height: 18px !important;
  max-height: 18px !important;
  padding: 0 !important;
  margin: 0 6px !important;
  background: #3b82f6 !important;
  border-radius: 2px !important;
  border: none !important;
  opacity: 1 !important;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
  overflow: hidden !important;
  position: relative !important;
  vertical-align: middle !important;
  flex: none !important;
  align-self: center !important;
}

.dark .link-drop-indicator {
  background: #8b5cf6 !important;
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.6);
}

.link-drop-indicator,
.link-drop-indicator * {
  box-sizing: border-box !important;
}

.link-drop-indicator > *,
.link-drop-indicator > div,
.link-drop-indicator > a,
.link-drop-indicator .link-drag-handle,
.link-drop-indicator .inline-block {
  display: none !important;
  visibility: hidden !important;
  width: 0 !important;
  height: 0 !important;
  opacity: 0 !important;
  position: absolute !important;
  pointer-events: none !important;
}

/* Animated glow effect on indicator */
.link-drop-indicator::before {
  content: '';
  position: absolute;
  top: -100%;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.9), transparent);
  animation: link-indicator-glow 1s ease-in-out infinite;
}

@keyframes link-indicator-glow {
  0% {
    top: -100%;
  }
  100% {
    top: 200%;
  }
}

</style>
