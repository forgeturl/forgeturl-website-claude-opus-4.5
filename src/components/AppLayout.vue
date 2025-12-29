<template>
  <div class="min-h-screen flex bg-gray-50">
    <!-- Sidebar -->
    <aside class="w-56 bg-white border-r border-gray-200 flex flex-col fixed h-full z-30">
      <!-- Logo -->
      <div class="px-4 py-5">
        <router-link to="/" class="group flex items-center gap-3 select-none">
          <!-- Animated Logo Icon -->
          <div class="logo-icon relative w-9 h-9 flex-shrink-0">
            <!-- Background glow effect -->
            <div class="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <!-- Main logo container -->
            <div class="relative w-full h-full bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-xl shadow-lg shadow-purple-500/25 flex items-center justify-center overflow-hidden group-hover:shadow-purple-500/40 transition-shadow duration-300">
              <!-- Shimmer effect -->
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <!-- Link chain icon with memory bubble -->
              <svg class="w-5 h-5 text-white relative z-10" viewBox="0 0 24 24" fill="none">
                <!-- Memory bubble / cloud -->
                <circle cx="17" cy="7" r="4" fill="currentColor" opacity="0.3" class="animate-pulse-slow"/>
                <circle cx="19" cy="9" r="2.5" fill="currentColor" opacity="0.25" class="animate-pulse-slow" style="animation-delay: 0.5s"/>
                
                <!-- Link chain -->
                <path 
                  d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" 
                  stroke="currentColor" 
                  stroke-width="2" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"
                  class="group-hover:stroke-[2.5] transition-all duration-300"
                />
                <path 
                  d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" 
                  stroke="currentColor" 
                  stroke-width="2" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"
                  class="group-hover:stroke-[2.5] transition-all duration-300"
                />
              </svg>
            </div>
          </div>
          
          <!-- Brand text -->
          <div class="flex flex-col">
            <span class="text-lg font-bold tracking-tight leading-none">
              <span class="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">Forget</span><span class="text-gray-800">URL</span>
            </span>
            <span class="text-[10px] text-gray-400 font-medium tracking-wider uppercase mt-0.5">Bookmark Manager</span>
          </div>
        </router-link>
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
    <main class="flex-1 ml-56 overflow-x-hidden">
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
