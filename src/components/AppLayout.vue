<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
    <!-- Mobile Responsive Layout -->
    <header class="md:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between transition-colors duration-300">
      <!-- Logo -->
      <router-link to="/" class="group flex items-center gap-2 select-none">
        <div class="logo-icon relative w-8 h-8 flex-shrink-0">
          <div class="relative w-full h-full bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-lg shadow-lg shadow-purple-500/25 flex items-center justify-center overflow-hidden">
            <svg class="w-4 h-4 text-white relative z-10" viewBox="0 0 24 24" fill="none">
              <circle cx="17" cy="7" r="4" fill="currentColor" opacity="0.3"/>
              <circle cx="19" cy="9" r="2.5" fill="currentColor" opacity="0.25"/>
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        <span class="text-base font-bold tracking-tight">
          <span class="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">Forget</span><span class="text-gray-800 dark:text-slate-200">URL</span>
        </span>
        <span class="px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded shadow-sm">Beta</span>
      </router-link>
      
      <!-- Mobile Menu Button -->
      <button
        @click="mobileMenuOpen = !mobileMenuOpen"
        class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-400 transition-colors"
      >
        <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </header>

    <!-- Mobile Menu Overlay -->
    <div 
      v-if="mobileMenuOpen" 
      class="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
      @click="mobileMenuOpen = false"
    ></div>

    <!-- Mobile Slide-down Menu -->
    <div
      class="md:hidden fixed top-14 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-lg transition-all duration-300 overflow-hidden"
      :class="mobileMenuOpen ? 'max-h-[70vh] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'"
    >
      <div class="overflow-y-auto max-h-[calc(70vh-120px)]">
        <!-- Pages Section -->
        <div class="px-4 py-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Pages</span>
            <button
              @click="$emit('create-page'); mobileMenuOpen = false"
              class="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
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
              @click="$emit('select-page', page.page_id); mobileMenuOpen = false"
              class="group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
              :class="[
                currentPageId === page.page_id 
                  ? 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-slate-100' 
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-slate-200'
              ]"
            >
              <span class="truncate text-sm">{{ page.title || 'Unnamed Page' }}</span>
              <button
                v-if="page.is_self"
                @click.stop="$emit('delete-page', page.page_id)"
                class="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-all"
                title="Delete page"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </nav>

          <!-- Empty State -->
          <div v-if="!pages || pages.length === 0" class="py-6 text-center">
            <p class="text-sm text-gray-400 dark:text-slate-500">No pages yet</p>
          </div>
        </div>
      </div>

      <!-- User Section (Mobile) -->
      <div class="border-t border-gray-200 dark:border-slate-700 p-4 bg-gray-50 dark:bg-slate-800/50">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img
              v-if="user?.avatar"
              :src="user.avatar"
              :alt="user.displayName"
              class="w-8 h-8 rounded-full object-cover"
            />
            <div v-else class="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-gray-600 dark:text-slate-300 text-sm font-medium">
              {{ getInitial(user?.displayName) }}
            </div>
            <span class="text-sm text-gray-600 dark:text-slate-400 truncate max-w-[140px]">{{ user?.email }}</span>
          </div>
          
          <div class="flex items-center gap-1">
            <!-- Theme Toggle -->
            <button
              @click="toggleTheme"
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-all duration-300"
            >
              <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
            <!-- Logout -->
            <button
              @click="$emit('logout'); mobileMenuOpen = false"
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop Sidebar -->
    <aside 
      class="hidden md:flex bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex-col fixed h-full z-30 transition-all duration-300"
      :class="sidebarCollapsed ? 'w-16' : 'w-56'"
    >
      <!-- Logo Section -->
      <div class="px-3 py-4" :class="sidebarCollapsed ? 'flex justify-center' : ''">
        <router-link v-if="!sidebarCollapsed" to="/" class="group flex items-center gap-3 select-none">
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
            <div class="flex items-center gap-2">
              <span class="text-lg font-bold tracking-tight leading-none">
                <span class="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">Forget</span><span class="text-gray-800 dark:text-slate-200">URL</span>
              </span>
              <span class="px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded shadow-sm leading-none">Beta</span>
            </div>
            <span class="text-[10px] text-gray-400 dark:text-slate-500 font-medium tracking-wider uppercase mt-0.5">Bookmark Manager</span>
          </div>
        </router-link>
        
        <!-- Collapsed Logo Icon (clickable to expand) -->
        <button
          v-else
          @click="sidebarCollapsed = false"
          class="group relative w-10 h-10 flex-shrink-0"
          title="展开侧边栏"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div class="relative w-full h-full bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-xl shadow-lg shadow-purple-500/25 flex items-center justify-center overflow-hidden group-hover:shadow-purple-500/40 transition-shadow duration-300">
            <svg class="w-5 h-5 text-white relative z-10" viewBox="0 0 24 24" fill="none">
              <circle cx="17" cy="7" r="4" fill="currentColor" opacity="0.3"/>
              <circle cx="19" cy="9" r="2.5" fill="currentColor" opacity="0.25"/>
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </button>
      </div>

      <!-- Pages Section -->
      <div class="flex-1 overflow-y-auto" :class="sidebarCollapsed ? 'px-2' : 'px-3'">
        <!-- Pages Header -->
        <div class="flex items-center py-2" :class="sidebarCollapsed ? 'justify-center px-1' : 'justify-between px-2'">
          <span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider" :class="sidebarCollapsed ? 'text-[10px]' : ''">
            Pages
          </span>
          <button
            v-if="!sidebarCollapsed"
            @click="$emit('create-page')"
            class="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
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
            v-for="(page, index) in pages"
            :key="page.page_id"
            @click="$emit('select-page', page.page_id)"
            class="group flex items-center rounded-lg cursor-pointer transition-colors"
            :class="[
              sidebarCollapsed ? 'justify-center px-0 py-2' : 'justify-between px-3 py-2',
              currentPageId === page.page_id 
                ? 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-slate-100' 
                : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-slate-200'
            ]"
            :title="sidebarCollapsed ? (page.title || 'Unnamed Page') : ''"
          >
            <!-- Collapsed: Show number -->
            <span v-if="sidebarCollapsed" class="text-sm font-medium w-8 h-8 flex items-center justify-center">
              {{ index + 1 }}
            </span>
            <!-- Expanded: Show title -->
            <span v-else class="truncate text-sm">{{ page.title || 'Unnamed Page' }}</span>
            <button
              v-if="!sidebarCollapsed && page.is_self"
              @click.stop="$emit('delete-page', page.page_id)"
              class="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-all"
              title="Delete page"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </nav>

        <!-- Empty State -->
        <div v-if="!pages || pages.length === 0" class="py-8 text-center" :class="sidebarCollapsed ? '' : 'px-3'">
          <p class="text-sm text-gray-400 dark:text-slate-500">{{ sidebarCollapsed ? '-' : 'No pages yet' }}</p>
        </div>
      </div>

      <!-- User Section -->
      <div class="border-t border-gray-200 dark:border-slate-700 p-3 transition-colors duration-300">
        <!-- Expanded Mode -->
        <template v-if="!sidebarCollapsed">
          <div class="flex items-center gap-3 mb-3">
            <img
              v-if="user?.avatar"
              :src="user.avatar"
              :alt="user.displayName"
              class="w-8 h-8 rounded-full object-cover"
            />
            <div v-else class="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-gray-600 dark:text-slate-300 text-sm font-medium">
              {{ getInitial(user?.displayName) }}
            </div>
            <span class="text-sm text-gray-600 dark:text-slate-400 truncate flex-1">{{ user?.email }}</span>
          </div>
          
          <!-- Theme Toggle & Logout Row -->
          <div class="flex items-center justify-between">
            <button
              @click="$emit('logout')"
              class="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
            
            <!-- Theme Toggle Button -->
            <button
              @click="toggleTheme"
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-all duration-300"
              :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
            >
              <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
          </div>
        </template>
        
        <!-- Collapsed Mode -->
        <template v-else>
          <div class="flex flex-col items-center gap-2">
            <!-- User Avatar -->
            <img
              v-if="user?.avatar"
              :src="user.avatar"
              :alt="user.displayName"
              class="w-8 h-8 rounded-full object-cover"
              :title="user?.email"
            />
            <div v-else class="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-gray-600 dark:text-slate-300 text-sm font-medium" :title="user?.email">
              {{ getInitial(user?.displayName) }}
            </div>
            
            <!-- Logout Button -->
            <button
              @click="$emit('logout')"
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              title="Sign out"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
            
            <!-- Theme Toggle Button -->
            <button
              @click="toggleTheme"
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-all duration-300"
              :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
            >
              <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
          </div>
        </template>
      </div>

      <!-- Sidebar Toggle Button -->
      <button
        @click="sidebarCollapsed = !sidebarCollapsed"
        class="absolute top-1/2 -translate-y-1/2 -right-3 z-50 w-6 h-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full shadow-md flex items-center justify-center text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-300"
        :title="sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
      >
        <svg class="w-3 h-3 transition-transform duration-300" :class="sidebarCollapsed ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </aside>

    <!-- Main Content -->
    <main 
      class="pt-14 md:pt-0 overflow-x-hidden min-h-screen transition-all duration-300"
      :class="sidebarCollapsed ? 'md:ml-16' : 'md:ml-56'"
    >
      <slot></slot>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTheme } from '@/composables/useTheme'

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

const { isDark, toggleTheme } = useTheme()

// Mobile menu state
const mobileMenuOpen = ref(false)

// Sidebar collapse state (desktop only)
const sidebarCollapsed = ref(false)

const getInitial = (name) => {
  return name ? name.charAt(0).toUpperCase() : 'U'
}
</script>
