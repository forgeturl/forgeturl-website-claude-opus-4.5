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
        <div class="relative bg-white w-full sm:w-[400px] sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden animate-slide-up">
          <!-- Handle bar for mobile -->
          <div class="sm:hidden flex justify-center pt-3 pb-2">
            <div class="w-10 h-1 bg-gray-300 rounded-full"></div>
          </div>

          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">New Collection</h3>
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
          <div class="px-6 py-5 space-y-5">
            <!-- Collection Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Collection Name</label>
              <input
                ref="inputRef"
                v-model="collectionName"
                type="text"
                placeholder="Enter collection name"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                @keyup.enter="handleConfirm"
              />
            </div>

            <!-- Position Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Position</label>
              <div class="flex gap-3">
                <button
                  @click="position = 'head'"
                  class="flex-1 py-3 px-4 border rounded-xl text-sm font-medium transition-all"
                  :class="position === 'head' 
                    ? 'border-gray-900 bg-gray-900 text-white' 
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'"
                >
                  Add to Head
                </button>
                <button
                  @click="position = 'tail'"
                  class="flex-1 py-3 px-4 border rounded-xl text-sm font-medium transition-all"
                  :class="position === 'tail' 
                    ? 'border-gray-900 bg-gray-900 text-white' 
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'"
                >
                  Add to Tail
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
              Cancel
            </button>
            <button
              @click="handleConfirm"
              class="px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'confirm'])

const collectionName = ref('')
const position = ref('tail')
const inputRef = ref(null)

// Reset and focus when modal opens
watch(() => props.show, (newShow) => {
  if (newShow) {
    collectionName.value = ''
    position.value = 'tail'
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
})

const handleClose = () => {
  emit('update:show', false)
}

const handleConfirm = () => {
  emit('confirm', {
    name: collectionName.value || 'New Collection',
    position: position.value
  })
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


