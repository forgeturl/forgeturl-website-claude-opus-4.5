<template>
  <div 
    class="border border-gray-200 rounded-xl p-5 hover:border-gray-900 transition-colors relative group"
  >
    <!-- Drag Handle for Collection (top-left, only in edit mode) -->
    <div 
      v-if="canEdit"
      class="collection-drag-handle absolute -top-2 -left-2 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
      @mousedown.stop
      @touchstart.stop
    >
      <svg class="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/>
      </svg>
    </div>

    <!-- Copy Button (top-left offset, only in edit mode) -->
    <button
      v-if="canEdit"
      @click="handleCopyCollection"
      class="absolute -top-2 left-6 w-6 h-6 bg-white border border-gray-300 hover:bg-blue-50 hover:border-blue-300 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
      title="Duplicate this collection"
    >
      <svg class="w-3 h-3 text-gray-400 hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    </button>

    <!-- Collection Title -->
    <div class="mb-4">
      <h3 
        v-if="collection.title"
        class="text-lg font-semibold text-gray-900 text-center select-none"
        :class="{ 'cursor-pointer hover:text-blue-600 transition-colors': canEdit }"
        @mousedown="handleTitleMouseDown"
        @mouseup="handleTitleMouseUp"
        @mouseleave="handleTitleMouseLeave"
        @touchstart="handleTitleTouchStart"
        @touchend="handleTitleTouchEnd"
        @touchmove="handleTitleTouchMove"
      >
        {{ collection.title }}
      </h3>
      <h3 
        v-else
        class="text-lg font-semibold text-gray-400 text-center select-none"
        :class="{ 'cursor-pointer hover:text-gray-600 transition-colors': canEdit }"
        @mousedown="handleTitleMouseDown"
        @mouseup="handleTitleMouseUp"
        @mouseleave="handleTitleMouseLeave"
        @touchstart="handleTitleTouchStart"
        @touchend="handleTitleTouchEnd"
        @touchmove="handleTitleTouchMove"
      >
        Unnamed Collection
      </h3>
    </div>

    <!-- Links (Draggable in edit mode) -->
    <draggable
      v-if="canEdit"
      v-model="localLinks"
      :group="{ name: 'links', pull: true, put: true }"
      item-key="__idx"
      handle=".link-drag-handle"
      ghost-class="opacity-50"
      :animation="200"
      class="links-draggable flex flex-wrap gap-x-6 gap-y-2 min-h-[60px] relative"
      @change="handleLinksChange"
      @start="handleDragStart"
      @end="handleDragEnd"
    >
      <template #item="{ element: link, index }">
        <LinkItem
          :link="link"
          :linkIndex="index"
          :canEdit="true"
          @edit="handleEditLink(index, link)"
        />
      </template>
      <!-- Empty State inside draggable for drop target -->
      <template #footer>
        <div 
          v-if="localLinks.length === 0" 
          class="empty-state-hint w-full text-center py-4 text-gray-400 text-sm"
        >
          Drag links here
        </div>
      </template>
    </draggable>

    <!-- Links (Read-only) -->
    <div v-else class="flex flex-wrap gap-x-6 gap-y-2">
      <LinkItem
        v-for="(link, linkIndex) in collection.links"
        :key="linkIndex"
        :link="link"
        :linkIndex="linkIndex"
        :canEdit="false"
      />
      <!-- Empty State for read-only -->
      <div v-if="!collection.links || collection.links.length === 0" class="w-full text-center py-4 text-gray-400 text-sm">
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
import { ref, watch } from 'vue'
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
