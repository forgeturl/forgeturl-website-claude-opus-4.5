<template>
  <div class="relative" ref="dropdownRef">
    <button
      @click="toggleDropdown"
      class="flex items-center gap-1 p-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-100 transition-all duration-300 shadow-sm"
      :title="currentLabel"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke-width="1.5" />
        <path stroke-linecap="round" stroke-width="1.5" d="M2 12h20" />
        <path stroke-linecap="round" stroke-width="1.5" d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
      </svg>
      <span class="text-xs font-semibold leading-none min-w-[1.25rem] text-center">{{ currentLocaleShort }}</span>
    </button>

    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="open"
        class="absolute right-0 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-2xl dark:shadow-black/40 border border-gray-100 dark:border-slate-700 overflow-hidden z-50"
        :class="dropUp ? 'bottom-full mb-2' : 'mt-2'"
      >
        <div class="py-1">
          <button
            v-for="locale in supportedLocales"
            :key="locale.code"
            @click="switchLocale(locale.code)"
            class="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-150"
            :class="currentLocale === locale.code
              ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 font-medium'
              : 'text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700'"
          >
            <span class="w-6 text-center text-xs font-bold text-gray-400 dark:text-slate-500">{{ locale.short }}</span>
            <span>{{ locale.label }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useLocale } from '@/composables/useLocale'

const { currentLocale, currentLocaleShort, supportedLocales, setLocale } = useLocale()

const open = ref(false)
const dropUp = ref(false)
const dropdownRef = ref(null)

const currentLabel = computed(() => {
  const meta = supportedLocales.find(m => m.code === currentLocale.value)
  return meta ? meta.label : 'English'
})

const toggleDropdown = () => {
  if (!open.value && dropdownRef.value) {
    const rect = dropdownRef.value.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    dropUp.value = spaceBelow < 320
  }
  open.value = !open.value
}

const switchLocale = (code) => {
  setLocale(code)
  open.value = false
}

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
