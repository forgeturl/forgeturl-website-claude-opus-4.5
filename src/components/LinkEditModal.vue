<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        @click.self="handleClose"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="handleClose"></div>
        
        <!-- Modal Content -->
        <div class="relative bg-white w-full sm:w-[480px] sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[85vh] overflow-hidden animate-slide-up">
          <!-- Handle bar for mobile -->
          <div class="sm:hidden flex justify-center pt-3 pb-2">
            <div class="w-10 h-1 bg-gray-300 rounded-full"></div>
          </div>

          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">编辑链接</h3>
            <button
              @click="handleClose"
              class="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-5 space-y-5 overflow-y-auto max-h-[60vh]">
            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">标题</label>
              <input
                v-model="editForm.title"
                type="text"
                placeholder="链接标题"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
              />
            </div>

            <!-- URL -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">链接地址</label>
              <input
                v-model="editForm.url"
                type="url"
                placeholder="https://..."
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
              />
            </div>

            <!-- Tags -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">标签 <span class="text-gray-400 font-normal">(逗号分隔)</span></label>
              <input
                v-model="tagsInput"
                type="text"
                placeholder="工具, 开发, 设计"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
              />
            </div>

            <!-- Sub Links -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">子链接</label>
              <div class="space-y-3">
                <div
                  v-for="(subLink, index) in editForm.sub_links"
                  :key="index"
                  class="flex gap-2 items-start"
                >
                  <div class="flex-1 space-y-2">
                    <input
                      v-model="subLink.sub_title"
                      type="text"
                      placeholder="子链接标题"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                    />
                    <input
                      v-model="subLink.sub_url"
                      type="url"
                      placeholder="子链接地址"
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
                  + 添加子链接
                </button>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button
              @click="handleClose"
              class="px-5 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors font-medium"
            >
              取消
            </button>
            <button
              @click="handleSave"
              class="px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  link: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:show', 'save'])

// Edit form
const editForm = ref({
  title: '',
  url: '',
  tags: [],
  photo_url: '',
  sub_links: []
})

const tagsInput = ref('')

// Watch for link changes to initialize form
watch(() => props.link, (newLink) => {
  if (newLink) {
    editForm.value = {
      title: newLink.title || '',
      url: newLink.url || '',
      tags: [...(newLink.tags || [])],
      photo_url: newLink.photo_url || '',
      sub_links: JSON.parse(JSON.stringify(newLink.sub_links || []))
    }
    tagsInput.value = (newLink.tags || []).join(', ')
  }
}, { immediate: true, deep: true })

// Watch for show changes to reset form
watch(() => props.show, (newShow) => {
  if (newShow && props.link) {
    editForm.value = {
      title: props.link.title || '',
      url: props.link.url || '',
      tags: [...(props.link.tags || [])],
      photo_url: props.link.photo_url || '',
      sub_links: JSON.parse(JSON.stringify(props.link.sub_links || []))
    }
    tagsInput.value = (props.link.tags || []).join(', ')
  }
})

const addSubLink = () => {
  editForm.value.sub_links.push({
    sub_title: '',
    sub_url: ''
  })
}

const removeSubLink = (index) => {
  editForm.value.sub_links.splice(index, 1)
}

const handleClose = () => {
  emit('update:show', false)
}

const handleSave = () => {
  // Parse tags
  const tags = tagsInput.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)

  // Filter empty sub links
  const subLinks = editForm.value.sub_links.filter(
    sl => sl.sub_title || sl.sub_url
  )

  const updatedLink = {
    ...editForm.value,
    tags,
    sub_links: subLinks
  }

  emit('save', updatedLink)
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

