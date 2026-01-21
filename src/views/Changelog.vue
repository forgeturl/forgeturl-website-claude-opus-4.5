<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-fuchsia-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 relative overflow-hidden transition-colors duration-300">
    <!-- Background decoration -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-violet-200/40 to-fuchsia-200/40 dark:from-violet-500/20 dark:to-fuchsia-500/20 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-24 -left-24 w-80 h-80 bg-gradient-to-tr from-purple-200/30 to-violet-200/30 dark:from-purple-500/15 dark:to-violet-500/15 rounded-full blur-3xl"></div>
    </div>
    
    <!-- Top Navigation Bar -->
    <nav class="fixed top-0 left-0 right-0 z-30 px-4 py-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-700/50">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <!-- Logo (left) -->
        <router-link to="/" class="flex items-center gap-2">
          <div class="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
            <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="font-bold text-base text-gray-800 dark:text-slate-200">
            <span class="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Forget</span>URL
          </span>
          <span class="px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded shadow-sm">Beta</span>
        </router-link>

        <!-- Center Navigation -->
        <div class="hidden md:flex items-center gap-1">
          <router-link
            to="/"
            class="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
          >
            Home
          </router-link>
          <router-link
            to="/changelog"
            class="px-3 py-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 rounded-lg"
          >
            Changelog
          </router-link>
          <a
            href="https://github.com/forgeturl/forgeturl-server/issues"
            target="_blank"
            rel="noopener noreferrer"
            class="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
          >
            Feedback
          </a>
          <!-- GitHub Dropdown -->
          <div class="relative" ref="githubDropdownRef">
            <button
              @click="showGithubDropdown = !showGithubDropdown"
              @mouseenter="showGithubDropdown = true"
              class="p-1.5 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
              title="Open Source"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/>
              </svg>
            </button>
            <!-- GitHub Dropdown Menu -->
            <Transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="opacity-0 translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-1"
            >
              <div
                v-if="showGithubDropdown"
                @mouseenter="showGithubDropdown = true"
                @mouseleave="showGithubDropdown = false"
                class="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-2xl dark:shadow-black/40 border border-gray-100 dark:border-slate-700 overflow-hidden"
              >
                <div class="p-2">
                  <a
                    href="https://github.com/forgeturl/forgeturl-server"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                  >
                    <div class="w-8 h-8 bg-gray-900 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                    <div class="text-left">
                      <div class="font-medium">Backend</div>
                      <div class="text-xs text-gray-500 dark:text-slate-400">forgeturl/forgeturl-server</div>
                    </div>
                  </a>
                  <a
                    href="https://github.com/forgeturl/forgeturl-website"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                  >
                    <div class="w-8 h-8 bg-gray-900 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                    <div class="text-left">
                      <div class="font-medium">Frontend</div>
                      <div class="text-xs text-gray-500 dark:text-slate-400">forgeturl/forgeturl-website</div>
                    </div>
                  </a>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Right side buttons -->
        <div class="flex items-center gap-2">
          <!-- Theme Toggle Button -->
          <button
            @click="toggleTheme"
            class="p-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-100 transition-all duration-300 shadow-sm"
            :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          >
            <svg v-if="isDark" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>

          <!-- Back to Home -->
          <router-link
            to="/"
            class="px-4 py-1.5 text-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium rounded-lg hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-300 shadow-md shadow-purple-500/25 hover:shadow-lg hover:shadow-purple-500/30 flex items-center gap-1.5"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="relative z-10 pt-16 pb-16 px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-slate-100 mb-4">
            Changelog
          </h1>
          <p class="text-lg text-gray-500 dark:text-slate-400">
            All notable changes to ForgetURL will be documented here.
          </p>
        </div>

        <!-- Changelog Entries -->
        <div class="space-y-6">
          <!-- Version 0.1.1 -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-black/30 border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div class="px-6 py-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 border-b border-gray-100 dark:border-slate-700">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-bold text-gray-900 dark:text-slate-100">v0.1.1</h2>
                <span class="px-3 py-1 text-sm font-medium bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 rounded-full">
                  2026-01-16
                </span>
              </div>
            </div>
            <div class="p-6">
              <ul class="text-gray-600 dark:text-slate-300 space-y-2">
                <li class="flex items-start gap-2">
                  <span class="text-green-500 mt-0.5">+</span>
                  Navigation bar with Changelog, Feedback, GitHub links
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-500 mt-0.5">+</span>
                  Changelog page
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-blue-500 mt-0.5">~</span>
                  Simplified footer layout
                </li>
              </ul>
            </div>
          </div>

          <!-- Version 0.1.0 -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg dark:shadow-black/30 border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div class="px-6 py-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 border-b border-gray-100 dark:border-slate-700">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-bold text-gray-900 dark:text-slate-100">v0.1.0</h2>
                <span class="px-3 py-1 text-sm font-medium bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 rounded-full">
                  2026-01-01
                </span>
              </div>
            </div>
            <div class="p-6">
              <ul class="text-gray-600 dark:text-slate-300 space-y-2">
                <li class="flex items-start gap-2">
                  <span class="text-green-500 mt-0.5">+</span>
                  OAuth authentication (Google, GitHub)
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-500 mt-0.5">+</span>
                  Bookmark management with pages and collections
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-500 mt-0.5">+</span>
                  Permission-based sharing
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-500 mt-0.5">+</span>
                  Dark mode and responsive design
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="relative z-10 py-8 px-4 border-t border-gray-200 dark:border-slate-800">
      <div class="max-w-6xl mx-auto">
        <div class="flex flex-col md:flex-row items-center justify-center gap-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="font-semibold text-gray-700 dark:text-slate-300">ForgetURL</span>
          </div>
        </div>
        
        <!-- Legal Links -->
        <div class="flex items-center justify-center gap-6 pt-4 mt-4 border-t border-gray-100 dark:border-slate-700">
          <router-link to="/privacy" class="text-sm text-gray-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-200">
            Privacy Policy
          </router-link>
          <span class="text-gray-300 dark:text-slate-600">|</span>
          <router-link to="/terms" class="text-sm text-gray-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-200">
            Terms of Service
          </router-link>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()

const showGithubDropdown = ref(false)
const githubDropdownRef = ref(null)

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (githubDropdownRef.value && !githubDropdownRef.value.contains(event.target)) {
    showGithubDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
