<template>
  <div class="min-h-screen flex bg-gray-50">
    <!-- Sidebar -->
    <aside class="w-56 bg-white border-r border-gray-200 flex flex-col fixed h-full">
      <!-- Logo -->
      <div class="px-5 py-5">
        <h1 class="text-xl font-bold text-gray-900 tracking-tight">ForgetURL</h1>
      </div>

      <!-- Pages Section -->
      <div class="flex-1 overflow-y-auto px-3">
        <div class="flex items-center justify-between px-2 py-2">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pages</span>
          <button
            @click="$emit('create-page')"
            class="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700 transition-colors"
            title="Create new page"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <!-- Page List -->
        <nav class="space-y-1">
          <div
            v-for="page in pages"
            :key="page.page_id"
            @click="$emit('select-page', page.page_id)"
            class="group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors"
            :class="[
              currentPageId === page.page_id 
                ? 'bg-gray-100 text-gray-900' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            ]"
          >
            <span class="truncate text-sm">{{ page.title || 'Unnamed Page' }}</span>
            <button
              v-if="page.is_self"
              @click.stop="$emit('delete-page', page.page_id)"
              class="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 text-gray-400 hover:text-red-500 transition-all"
              title="Delete page"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </nav>

        <!-- Empty State -->
        <div v-if="!pages || pages.length === 0" class="px-3 py-8 text-center">
          <p class="text-sm text-gray-400">No pages yet</p>
        </div>
      </div>

      <!-- User Section -->
      <div class="border-t border-gray-200 p-4">
        <div class="flex items-center gap-3 mb-3">
          <img
            v-if="user?.avatar"
            :src="user.avatar"
            :alt="user.displayName"
            class="w-8 h-8 rounded-full object-cover"
          />
          <div v-else class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
            {{ getInitial(user?.displayName) }}
          </div>
          <span class="text-sm text-gray-600 truncate flex-1">{{ user?.email }}</span>
        </div>
        <button
          @click="$emit('logout')"
          class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors w-full"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 ml-56">
      <slot></slot>
    </main>
  </div>
</template>

<script setup>
defineProps({
  pages: {
    type: Array,
    default: () => []
  },
  currentPageId: {
    type: String,
    default: ''
  },
  user: {
    type: Object,
    default: null
  }
})

defineEmits(['create-page', 'select-page', 'delete-page', 'logout'])

const getInitial = (name) => {
  return name ? name.charAt(0).toUpperCase() : 'U'
}
</script>
