<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        @click.self="handleClose"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" @click="handleClose"></div>
        
        <!-- Modal Content -->
        <div class="relative bg-white dark:bg-slate-800 w-full sm:w-[560px] sm:rounded-2xl rounded-t-2xl shadow-2xl dark:shadow-black/30 max-h-[90vh] overflow-hidden animate-slide-up transition-colors duration-300">
          <!-- Handle bar for mobile -->
          <div class="sm:hidden flex justify-center pt-3 pb-2">
            <div class="w-10 h-1 bg-gray-300 dark:bg-slate-600 rounded-full"></div>
          </div>

          <!-- Header with Tabs -->
          <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
            <div class="flex items-center justify-between">
              <!-- Tab Switcher -->
              <div class="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
                <button
                  @click="activeTab = 'single'"
                  class="px-3 py-2 text-sm font-medium rounded-md transition-all"
                  :class="activeTab === 'single' 
                    ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-slate-100 shadow-sm' 
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'"
                >
                  Add Link
                </button>
                <button
                  @click="activeTab = 'batch'"
                  class="px-3 py-2 text-sm font-medium rounded-md transition-all"
                  :class="activeTab === 'batch' 
                    ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-slate-100 shadow-sm' 
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'"
                >
                  Batch Add
                </button>
                <button
                  @click="activeTab = 'import'"
                  class="px-3 py-2 text-sm font-medium rounded-md transition-all"
                  :class="activeTab === 'import' 
                    ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-slate-100 shadow-sm' 
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'"
                >
                  Import
                </button>
              </div>
              <button
                @click="handleClose"
                class="p-2 -mr-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Body - Single Link Mode -->
          <div v-show="activeTab === 'single'" ref="scrollContainerRef" class="px-6 py-5 space-y-5 overflow-y-auto max-h-[60vh]">
            <!-- Title -->
            <div class="flex items-center gap-4">
              <label class="text-sm font-medium text-gray-700 dark:text-slate-300 w-12 flex-shrink-0">Title</label>
              <input
                v-model="form.title"
                type="text"
                placeholder="Link title"
                class="flex-1 px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-gray-900 dark:focus:ring-violet-500 focus:border-transparent outline-none transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                @input="handleTitleInput"
              />
            </div>

            <!-- URL -->
            <div class="flex items-center gap-4">
              <label class="text-sm font-medium text-gray-700 dark:text-slate-300 w-12 flex-shrink-0">URL</label>
              <input
                v-model="form.url"
                type="url"
                placeholder="https://..."
                class="flex-1 px-4 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-gray-900 dark:focus:ring-violet-500 focus:border-transparent outline-none transition-all bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
            </div>

            <!-- Optional Fields Buttons -->
            <div v-if="!showTags || !showSubLinks" class="flex gap-2">
              <button
                v-if="!showTags"
                @click="showTags = true"
                class="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Tags
              </button>
              <button
                v-if="!showSubLinks"
                @click="expandSubLinks"
                class="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Sub Links
              </button>
            </div>

            <!-- Tags (shown when expanded) -->
            <div v-if="showTags">
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-700">Tags <span class="text-gray-400 font-normal">(comma separated)</span></label>
                <button
                  @click="showTags = false; tagsInput = ''"
                  class="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <input
                v-model="tagsInput"
                type="text"
                placeholder="tools, dev, design"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
              />
            </div>

            <!-- Sub Links (shown when expanded) -->
            <div v-if="showSubLinks">
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-700">Sub Links</label>
                <button
                  @click="showSubLinks = false; form.sub_links = []"
                  class="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="space-y-3">
                <div
                  v-for="(subLink, index) in form.sub_links"
                  :key="index"
                  class="flex gap-2 items-start"
                >
                  <div class="flex-1 space-y-2">
                    <input
                      v-model="subLink.sub_title"
                      type="text"
                      placeholder="Sub link title"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                    />
                    <input
                      v-model="subLink.sub_url"
                      type="url"
                      placeholder="Sub link URL"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <button
                    @click="removeSubLink(index)"
                    class="mt-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <button
                  @click="addSubLink"
                  class="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors text-sm"
                >
                  + Add sub link
                </button>
              </div>
            </div>

            <!-- Collection Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Add to Collection</label>
              <div class="grid grid-cols-3 gap-2">
                <!-- Existing Collections -->
                <div 
                  v-for="(collection, index) in collections" 
                  :key="index"
                  @click="selectCollection(index)"
                  class="flex flex-col items-center gap-1.5 p-3 border rounded-xl cursor-pointer transition-all text-center"
                  :class="selectedCollectionIndex === index 
                    ? 'border-gray-900 bg-gray-50' 
                    : 'border-gray-200 hover:border-gray-300'"
                >
                  <div 
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0"
                    :class="selectedCollectionIndex === index 
                      ? 'border-gray-900 bg-gray-900' 
                      : 'border-gray-300'"
                  >
                    <svg 
                      v-if="selectedCollectionIndex === index" 
                      class="w-3 h-3 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span class="text-gray-700 text-xs leading-tight line-clamp-2">{{ collection.title || 'Unnamed' }}</span>
                </div>

                <!-- Create New Collection Option -->
                <div 
                  @click="selectNewCollection"
                  class="flex flex-col items-center gap-1.5 p-3 border rounded-xl cursor-pointer transition-all text-center"
                  :class="isCreateNew 
                    ? 'border-gray-900 bg-gray-50' 
                    : 'border-gray-200 hover:border-gray-300'"
                >
                  <div 
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0"
                    :class="isCreateNew 
                      ? 'border-gray-900 bg-gray-900' 
                      : 'border-gray-300'"
                  >
                    <svg 
                      v-if="isCreateNew" 
                      class="w-3 h-3 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span class="text-gray-700 text-xs leading-tight">+ New Folder</span>
                </div>
              </div>

              <!-- New Collection Name Input -->
              <div v-if="isCreateNew" class="mt-3">
                <input
                  ref="newFolderInputRef"
                  v-model="newCollectionName"
                  type="text"
                  placeholder="Enter new folder name"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <!-- Body - Batch Add Mode -->
          <div v-show="activeTab === 'batch'" ref="batchScrollContainerRef" class="px-6 py-5 space-y-5 overflow-y-auto max-h-[60vh]">
            <!-- Collection Selection (First) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Add to Collection</label>
              <div class="grid grid-cols-3 gap-2">
                <!-- Existing Collections -->
                <div 
                  v-for="(collection, index) in collections" 
                  :key="index"
                  @click="selectBatchCollection(index)"
                  class="flex flex-col items-center gap-1.5 p-3 border rounded-xl cursor-pointer transition-all text-center"
                  :class="batchSelectedCollectionIndex === index 
                    ? 'border-gray-900 bg-gray-50' 
                    : 'border-gray-200 hover:border-gray-300'"
                >
                  <div 
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0"
                    :class="batchSelectedCollectionIndex === index 
                      ? 'border-gray-900 bg-gray-900' 
                      : 'border-gray-300'"
                  >
                    <svg 
                      v-if="batchSelectedCollectionIndex === index" 
                      class="w-3 h-3 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span class="text-gray-700 text-xs leading-tight line-clamp-2">{{ collection.title || 'Unnamed' }}</span>
                </div>

                <!-- Create New Collection Option -->
                <div 
                  @click="selectBatchNewCollection"
                  class="flex flex-col items-center gap-1.5 p-3 border rounded-xl cursor-pointer transition-all text-center"
                  :class="isBatchCreateNew 
                    ? 'border-gray-900 bg-gray-50' 
                    : 'border-gray-200 hover:border-gray-300'"
                >
                  <div 
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0"
                    :class="isBatchCreateNew 
                      ? 'border-gray-900 bg-gray-900' 
                      : 'border-gray-300'"
                  >
                    <svg 
                      v-if="isBatchCreateNew" 
                      class="w-3 h-3 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span class="text-gray-700 text-xs leading-tight">+ New Folder</span>
                </div>
              </div>

              <!-- New Collection Name Input -->
              <div v-if="isBatchCreateNew" class="mt-3">
                <input
                  ref="batchNewFolderInputRef"
                  v-model="batchNewCollectionName"
                  type="text"
                  placeholder="Enter new folder name"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <!-- Batch Links Input -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Paste Links</label>
              <textarea
                v-model="batchLinksInput"
                placeholder="Paste multiple links here, separated by spaces or new lines...&#10;&#10;Example:&#10;https://google.com&#10;https://github.com&#10;https://twitter.com"
                class="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none text-sm"
                @input="parseBatchLinks"
              ></textarea>
            </div>

            <!-- Parsed Links Preview -->
            <div v-if="parsedLinks.length > 0">
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-700">
                  Parsed Links 
                  <span class="text-gray-400 font-normal">({{ parsedLinks.length }} links)</span>
                </label>
                <button
                  @click="clearBatchLinks"
                  class="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  Clear All
                </button>
              </div>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div
                  v-for="(link, index) in parsedLinks"
                  :key="index"
                  class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group"
                >
                  <div class="flex-1 min-w-0">
                    <input
                      v-model="link.title"
                      type="text"
                      class="w-full text-sm font-medium text-gray-700 bg-transparent border-none outline-none focus:ring-0 p-0"
                      placeholder="Link title"
                    />
                    <p class="text-xs text-gray-400 truncate mt-0.5">{{ link.url }}</p>
                  </div>
                  <button
                    @click="removeParsedLink(index)"
                    class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Body - Import Mode -->
          <div v-show="activeTab === 'import'" ref="importScrollContainerRef" class="px-6 py-5 space-y-5 overflow-y-auto max-h-[60vh]">
            <!-- File Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Select Chrome Bookmarks File</label>
              <div 
                class="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-gray-300 transition-colors cursor-pointer"
                @click="triggerFileInput"
                @dragover.prevent="handleDragOver"
                @dragleave.prevent="handleDragLeave"
                @drop.prevent="handleFileDrop"
                :class="{ 'border-blue-400 bg-blue-50': isDragOver }"
              >
                <input
                  ref="fileInputRef"
                  type="file"
                  accept=".html,.htm"
                  class="hidden"
                  @change="handleFileSelect"
                />
                <svg class="w-10 h-10 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p class="text-sm text-gray-600 mb-1">
                  <span class="font-medium text-gray-900">Click to upload</span> or drag and drop
                </p>
                <p class="text-xs text-gray-400">Chrome bookmarks HTML file</p>
              </div>
              <p v-if="importFileName" class="mt-2 text-sm text-gray-600 flex items-center gap-2">
                <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ importFileName }}
              </p>
            </div>

            <!-- Import Preview -->
            <div v-if="importFolders.length > 0">
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-700">
                  Preview
                  <span class="text-gray-400 font-normal">({{ totalImportLinks }} links in {{ importFolders.length }} folders)</span>
                </label>
                <button
                  @click="clearImport"
                  class="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  Clear
                </button>
              </div>
              <div class="space-y-3 max-h-64 overflow-y-auto">
                <div
                  v-for="(folder, folderIndex) in importFolders"
                  :key="folderIndex"
                  class="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div 
                    class="flex items-center justify-between px-3 py-2 bg-gray-50 cursor-pointer"
                    @click="toggleFolderExpand(folderIndex)"
                  >
                    <div class="flex items-center gap-2">
                      <svg 
                        class="w-4 h-4 text-gray-400 transition-transform"
                        :class="{ 'rotate-90': expandedFolders.includes(folderIndex) }"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                      <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                      </svg>
                      <span class="text-sm font-medium text-gray-700">{{ folder.title }}</span>
                    </div>
                    <span class="text-xs text-gray-400">{{ folder.links.length }} links</span>
                  </div>
                  <div v-show="expandedFolders.includes(folderIndex)" class="px-3 py-2 space-y-1">
                    <div
                      v-for="(link, linkIndex) in folder.links.slice(0, 10)"
                      :key="linkIndex"
                      class="flex items-center gap-2 text-xs text-gray-600 py-1"
                    >
                      <svg class="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span class="truncate">{{ link.title }}</span>
                    </div>
                    <div v-if="folder.links.length > 10" class="text-xs text-gray-400 py-1 pl-5">
                      ... and {{ folder.links.length - 10 }} more links
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Import Info -->
            <div v-if="importFolders.length === 0" class="text-center py-4 text-gray-400 text-sm">
              <p>Export your Chrome bookmarks:</p>
              <p class="text-xs mt-1">Chrome → Bookmarks → Bookmark Manager → ⋮ → Export bookmarks</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3">
            <button
              @click="handleClose"
              class="px-5 py-2.5 text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              v-if="activeTab === 'single'"
              @click="handleSave"
              :disabled="!canSave"
              class="px-5 py-2.5 bg-gray-900 dark:bg-violet-600 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-violet-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
            <button
              v-else-if="activeTab === 'batch'"
              @click="handleBatchSave"
              :disabled="!canBatchSave"
              class="px-5 py-2.5 bg-gray-900 dark:bg-violet-600 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-violet-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add {{ parsedLinks.length }} Links
            </button>
            <button
              v-else-if="activeTab === 'import'"
              @click="handleImport"
              :disabled="!canImport"
              class="px-5 py-2.5 bg-gray-900 dark:bg-violet-600 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-violet-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import {{ totalImportLinks }} Links
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  collections: {
    type: Array,
    default: () => []
  },
  onImportBookmarks: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['update:show', 'add', 'batch-add', 'import-bookmarks'])

// Tab state
const activeTab = ref('single')

// Form data for single add
const form = ref({
  title: '',
  url: '',
  tags: [],
  photo_url: '',
  sub_links: []
})

const tagsInput = ref('')
const selectedCollectionIndex = ref(0)
const isCreateNew = ref(false)
const newCollectionName = ref('')

// Batch add state
const batchLinksInput = ref('')
const parsedLinks = ref([])
const batchSelectedCollectionIndex = ref(0)
const isBatchCreateNew = ref(false)
const batchNewCollectionName = ref('')

// Import state
const importFolders = ref([])
const importFileName = ref('')
const expandedFolders = ref([])
const fileInputRef = ref(null)
const importScrollContainerRef = ref(null)
const isDragOver = ref(false)

// Optional fields visibility
const showTags = ref(false)
const showSubLinks = ref(false)

// Refs for auto-scroll
const scrollContainerRef = ref(null)
const newFolderInputRef = ref(null)
const batchScrollContainerRef = ref(null)
const batchNewFolderInputRef = ref(null)

// Track if user has manually edited the title
const userEditedTitle = ref(false)

// Check if a string is a valid URL
const isValidUrl = (str) => {
  try {
    const url = new URL(str)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

// Check clipboard for URL and auto-fill
const checkClipboardForUrl = async () => {
  try {
    // Check if clipboard API is available
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      return
    }
    
    const clipboardText = await navigator.clipboard.readText()
    const trimmedText = clipboardText?.trim()
    
    // If clipboard contains a valid URL, auto-fill it
    if (trimmedText && isValidUrl(trimmedText)) {
      form.value.url = trimmedText
    }
  } catch {
    // Silently fail if clipboard access is denied or not available
    // This is expected behavior when user denies permission
  }
}

// Reset form when modal opens
watch(() => props.show, (newShow) => {
  if (newShow) {
    // Reset single add form
    form.value = {
      title: '',
      url: '',
      tags: [],
      photo_url: '',
      sub_links: []
    }
    tagsInput.value = ''
    selectedCollectionIndex.value = props.collections.length > 0 ? 0 : -1
    isCreateNew.value = props.collections.length === 0
    newCollectionName.value = ''
    userEditedTitle.value = false
    showTags.value = false
    showSubLinks.value = false
    
    // Reset batch add form
    batchLinksInput.value = ''
    parsedLinks.value = []
    batchSelectedCollectionIndex.value = props.collections.length > 0 ? 0 : -1
    isBatchCreateNew.value = props.collections.length === 0
    batchNewCollectionName.value = ''
    
    // Reset import form
    importFolders.value = []
    importFileName.value = ''
    expandedFolders.value = []
    isDragOver.value = false
    
    // Reset tab to single
    activeTab.value = 'single'
    
    // Check clipboard for URL after form reset
    checkClipboardForUrl()
  }
})

// Extract domain name from URL
const extractDomainName = (url) => {
  try {
    const urlObj = new URL(url)
    let hostname = urlObj.hostname
    // Remove www. prefix
    hostname = hostname.replace(/^www\./, '')
    // Remove common TLDs to get the core name
    const parts = hostname.split('.')
    if (parts.length >= 2) {
      // Return the main domain part (e.g., 'watermarkremoversora' from 'watermarkremoversora.com')
      return parts[0]
    }
    return hostname
  } catch {
    return ''
  }
}

// Auto-fill title from URL when title is empty and user hasn't edited it
watch(() => form.value.url, (newUrl) => {
  if (newUrl && !form.value.title && !userEditedTitle.value) {
    const domainName = extractDomainName(newUrl)
    if (domainName) {
      form.value.title = domainName
    }
  }
})

// Can save check for single add
const canSave = computed(() => {
  const hasUrl = form.value.url.trim().length > 0
  const hasValidTarget = !isCreateNew.value || newCollectionName.value.trim().length > 0
  return hasUrl && hasValidTarget
})

// Can save check for batch add
const canBatchSave = computed(() => {
  const hasLinks = parsedLinks.value.length > 0
  const hasValidTarget = !isBatchCreateNew.value || batchNewCollectionName.value.trim().length > 0
  return hasLinks && hasValidTarget
})

// Can import check
const canImport = computed(() => {
  return importFolders.value.length > 0 && totalImportLinks.value > 0
})

// Total import links count
const totalImportLinks = computed(() => {
  return importFolders.value.reduce((sum, folder) => sum + folder.links.length, 0)
})

// Handle title input - mark as user edited
const handleTitleInput = () => {
  userEditedTitle.value = true
}

const selectCollection = (index) => {
  selectedCollectionIndex.value = index
  isCreateNew.value = false
}

const selectNewCollection = () => {
  selectedCollectionIndex.value = -1
  isCreateNew.value = true
  
  // Auto scroll to bottom and focus input after DOM updates
  nextTick(() => {
    if (scrollContainerRef.value) {
      scrollContainerRef.value.scrollTo({
        top: scrollContainerRef.value.scrollHeight,
        behavior: 'smooth'
      })
    }
    // Focus the input after scroll animation
    setTimeout(() => {
      if (newFolderInputRef.value) {
        newFolderInputRef.value.focus()
      }
    }, 150)
  })
}

// Batch collection selection
const selectBatchCollection = (index) => {
  batchSelectedCollectionIndex.value = index
  isBatchCreateNew.value = false
}

const selectBatchNewCollection = () => {
  batchSelectedCollectionIndex.value = -1
  isBatchCreateNew.value = true
  
  // Auto scroll and focus input after DOM updates
  nextTick(() => {
    setTimeout(() => {
      if (batchNewFolderInputRef.value) {
        batchNewFolderInputRef.value.focus()
      }
    }, 150)
  })
}

// Parse batch links from input
const parseBatchLinks = () => {
  const input = batchLinksInput.value.trim()
  if (!input) {
    parsedLinks.value = []
    return
  }
  
  // Split by whitespace and newlines
  const urlRegex = /https?:\/\/[^\s]+/gi
  const matches = input.match(urlRegex) || []
  
  // Create unique links with auto-generated titles
  const seenUrls = new Set()
  parsedLinks.value = matches
    .filter(url => {
      const normalized = url.toLowerCase()
      if (seenUrls.has(normalized)) return false
      seenUrls.add(normalized)
      return true
    })
    .map(url => ({
      url: url,
      title: extractDomainName(url) || url,
      tags: [],
      photo_url: '',
      sub_links: []
    }))
}

// Remove a parsed link
const removeParsedLink = (index) => {
  parsedLinks.value.splice(index, 1)
}

// Clear all batch links
const clearBatchLinks = () => {
  batchLinksInput.value = ''
  parsedLinks.value = []
}

const addSubLink = () => {
  form.value.sub_links.push({
    sub_title: '',
    sub_url: ''
  })
}

// Expand sub links section and auto-add one empty sub link
const expandSubLinks = () => {
  showSubLinks.value = true
  // Auto-add one empty sub link if there are none
  if (form.value.sub_links.length === 0) {
    addSubLink()
  }
}

const removeSubLink = (index) => {
  form.value.sub_links.splice(index, 1)
}

const handleClose = () => {
  emit('update:show', false)
}

const handleSave = () => {
  if (!canSave.value) return

  // Parse tags
  const tags = tagsInput.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)

  // Filter empty sub links
  const subLinks = form.value.sub_links.filter(
    sl => sl.sub_title || sl.sub_url
  )

  const link = {
    title: form.value.title || form.value.url,
    url: form.value.url,
    tags,
    photo_url: '',
    sub_links: subLinks
  }

  emit('add', {
    link,
    collectionIndex: isCreateNew.value ? -1 : selectedCollectionIndex.value,
    newCollectionName: isCreateNew.value ? (newCollectionName.value || 'New Folder') : null
  })

  handleClose()
}

// Handle batch save
const handleBatchSave = () => {
  console.log('handleBatchSave called, canBatchSave:', canBatchSave.value)
  if (!canBatchSave.value) return

  const payload = {
    links: parsedLinks.value.map(link => ({
      title: link.title || link.url,
      url: link.url,
      tags: [],
      photo_url: '',
      sub_links: []
    })),
    collectionIndex: isBatchCreateNew.value ? -1 : batchSelectedCollectionIndex.value,
    newCollectionName: isBatchCreateNew.value ? (batchNewCollectionName.value || 'New Folder') : null
  }
  
  console.log('Emitting batch-add with payload:', payload)
  
  // Emit batch-add event with all parsed links
  emit('batch-add', payload)
  
  console.log('batch-add event emitted')

  handleClose()
}

// ==================== Import Functions ====================

// Trigger file input click
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// Handle file selection
const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    processBookmarkFile(file)
  }
}

// Handle drag over
const handleDragOver = () => {
  isDragOver.value = true
}

// Handle drag leave
const handleDragLeave = () => {
  isDragOver.value = false
}

// Handle file drop
const handleFileDrop = (event) => {
  isDragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file && (file.name.endsWith('.html') || file.name.endsWith('.htm'))) {
    processBookmarkFile(file)
  }
}

// Process bookmark file
const processBookmarkFile = (file) => {
  importFileName.value = file.name
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result
    if (content) {
      parseBookmarksHtml(content)
    }
  }
  reader.readAsText(file)
}

// Parse Chrome bookmarks HTML
const parseBookmarksHtml = (html) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  
  // Find all DL elements (bookmark lists)
  const folders = new Map()
  const noFolderLinks = []
  
  // Get the main bookmarks list (usually the first DL after H1)
  const mainDL = doc.querySelector('DL')
  if (!mainDL) {
    importFolders.value = []
    return
  }
  
  // Special folder names that should be skipped (their contents will be processed as top-level)
  const rootFolderNames = ['书签栏', 'Bookmarks Bar', 'Bookmarks bar', '其他书签', 'Other Bookmarks', 'Other bookmarks']
  
  // Process the bookmarks structure recursively
  // Returns true if this is a root-level folder (like "书签栏")
  const processFolder = (dlElement, currentFolderName = null, isUnderRoot = false) => {
    const items = dlElement.children
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      
      if (item.tagName === 'DT') {
        // Check if it's a folder (has H3) or a link (has A)
        const h3 = item.querySelector(':scope > H3')
        const anchor = item.querySelector(':scope > A')
        const nestedDL = item.querySelector(':scope > DL')
        
        if (h3 && nestedDL) {
          // This is a folder
          const folderName = h3.textContent?.trim() || 'Unnamed Folder'
          
          // Check if this is a root folder (like "书签栏")
          if (rootFolderNames.includes(folderName)) {
            // This is a root folder, process its contents as top-level
            // Links directly under this folder will go to "New Folder"
            processFolder(nestedDL, null, true)
          } else if (isUnderRoot || currentFolderName === null) {
            // This is a direct child folder under the root (like "文件夹1", "文件夹2", etc.)
            // Create a new folder entry and process its contents
            if (!folders.has(folderName)) {
              folders.set(folderName, [])
            }
            processFolder(nestedDL, folderName, false)
          } else {
            // This is a nested folder inside another folder
            // Continue using the parent folder name (flatten nested structure)
            processFolder(nestedDL, currentFolderName, false)
          }
        } else if (anchor) {
          // This is a link
          const url = anchor.getAttribute('href')
          const title = anchor.textContent?.trim() || url
          
          // Skip chrome:// URLs and other internal URLs
          if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
            const link = {
              title: title,
              url: url,
              tags: [],
              photo_url: '',
              sub_links: []
            }
            
            if (currentFolderName) {
              // Add to the current folder
              if (!folders.has(currentFolderName)) {
                folders.set(currentFolderName, [])
              }
              folders.get(currentFolderName).push(link)
            } else if (isUnderRoot) {
              // Link directly under root folder (like "书签栏"), add to "New Folder"
              noFolderLinks.push(link)
            } else {
              // No folder at all, add to default folder
              noFolderLinks.push(link)
            }
          }
        }
      }
    }
  }
  
  processFolder(mainDL, null, false)
  
  // Convert to array format
  const result = []
  
  // Add folders with their links
  folders.forEach((links, folderName) => {
    if (links.length > 0) {
      result.push({
        title: folderName,
        links: links
      })
    }
  })
  
  // Add links without folder to "New Folder"
  if (noFolderLinks.length > 0) {
    result.push({
      title: 'New Folder',
      links: noFolderLinks
    })
  }
  
  importFolders.value = result
  
  // Expand first folder by default
  if (result.length > 0) {
    expandedFolders.value = [0]
  }
}

// Toggle folder expand/collapse
const toggleFolderExpand = (index) => {
  const idx = expandedFolders.value.indexOf(index)
  if (idx >= 0) {
    expandedFolders.value.splice(idx, 1)
  } else {
    expandedFolders.value.push(index)
  }
}

// Clear import
const clearImport = () => {
  importFolders.value = []
  importFileName.value = ''
  expandedFolders.value = []
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// Handle import
const handleImport = () => {
  console.log('handleImport called, canImport:', canImport.value)
  console.log('props:', props)
  console.log('props.onImportBookmarks:', props.onImportBookmarks)
  console.log('typeof props.onImportBookmarks:', typeof props.onImportBookmarks)

  if (!canImport.value) return

  const payload = {
    folders: importFolders.value.map(folder => ({
      title: folder.title,
      links: folder.links.map(link => ({
        title: link.title || link.url,
        url: link.url,
        tags: [],
        photo_url: '',
        sub_links: []
      }))
    }))
  }
  
  console.log('Import payload:', payload)
  // 实现和 handleBatchSave 类似的结构
  
  // Use callback prop instead of event (more reliable)
  if (props.onImportBookmarks) {
    console.log('Calling onImportBookmarks callback')
    props.onImportBookmarks(payload)
  } else {
    console.log('No onImportBookmarks callback provided')
  }

  handleClose()
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .relative {
  transform: translateY(100%);
}

.modal-leave-to .relative {
  transform: translateY(100%);
}

@media (min-width: 640px) {
  .modal-enter-from .relative {
    transform: translateY(20px) scale(0.95);
  }
  
  .modal-leave-to .relative {
    transform: translateY(20px) scale(0.95);
  }
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

@media (min-width: 640px) {
  .animate-slide-up {
    animation: none;
  }
}
</style>

