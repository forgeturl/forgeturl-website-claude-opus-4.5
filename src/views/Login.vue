<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-fuchsia-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 relative overflow-hidden transition-colors duration-300">
    <!-- Background decoration -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-violet-200/40 to-fuchsia-200/40 dark:from-violet-500/20 dark:to-fuchsia-500/20 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-24 -left-24 w-80 h-80 bg-gradient-to-tr from-purple-200/30 to-violet-200/30 dark:from-purple-500/15 dark:to-violet-500/15 rounded-full blur-3xl"></div>
      <div class="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-br from-fuchsia-200/20 to-pink-200/20 dark:from-fuchsia-500/10 dark:to-pink-500/10 rounded-full blur-3xl"></div>
    </div>
    
    <!-- Top Navigation Bar -->
    <nav class="fixed top-0 left-0 right-0 z-30 px-6 py-4">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <!-- Logo (left) -->
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="font-bold text-lg text-gray-800 dark:text-slate-200">
            <span class="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Forget</span>URL
          </span>
          <span class="px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded shadow-sm">Beta</span>
        </div>

        <!-- Right side buttons -->
        <div class="flex items-center gap-3">
          <!-- Theme Toggle Button -->
          <button
            @click="toggleTheme"
            class="p-2.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-100 transition-all duration-300 shadow-md"
            :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          >
            <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>

          <!-- Login Button with Dropdown -->
          <div class="relative" ref="loginDropdownRef">
            <button
              @click="showLoginDropdown = !showLoginDropdown"
              @mouseenter="showLoginDropdown = true"
              class="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In
            </button>

            <!-- Dropdown Menu -->
            <Transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="opacity-0 translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-1"
            >
              <div
                v-if="showLoginDropdown"
                @mouseenter="showLoginDropdown = true"
                @mouseleave="showLoginDropdown = false"
                class="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl dark:shadow-black/40 border border-gray-100 dark:border-slate-700 overflow-hidden"
              >
                <div class="p-2">
                  <!-- Google Login -->
                  <button
                    @click="handleLogin('google')"
                    :disabled="loading"
                    class="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    <div class="w-8 h-8 bg-white dark:bg-slate-600 rounded-lg flex items-center justify-center border border-gray-200 dark:border-slate-500">
                      <svg class="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <div class="text-left">
                      <div class="font-medium">Sign in with Google</div>
                      <div class="text-xs text-gray-500 dark:text-slate-400">Recommended</div>
                    </div>
                  </button>

                  <div class="my-1 border-t border-gray-100 dark:border-slate-700"></div>

                  <!-- GitHub Login -->
                  <button
                    @click="handleLogin('github')"
                    :disabled="loading"
                    class="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    <div class="w-8 h-8 bg-gray-900 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                    <div class="text-left">
                      <div class="font-medium">Sign in with GitHub</div>
                      <div class="text-xs text-gray-500 dark:text-slate-400">GitHub Account</div>
                    </div>
                  </button>

                  <div class="my-1 border-t border-gray-100 dark:border-slate-700"></div>

                  <!-- WeChat Login -->
                  <button
                    @click="handleLogin('wechat')"
                    :disabled="loading"
                    class="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    <div class="w-8 h-8 bg-[#07C160] rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
                      </svg>
                    </div>
                    <div class="text-left">
                      <div class="font-medium">Sign in with WeChat</div>
                      <div class="text-xs text-gray-500 dark:text-slate-400">WeChat Account</div>
                    </div>
                  </button>
                </div>

                <!-- Loading indicator -->
                <div v-if="loading" class="px-4 py-3 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-700">
                  <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                    <div class="animate-spin rounded-full h-4 w-4 border-2 border-violet-500 border-t-transparent"></div>
                    Redirecting...
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative z-10 pt-28 pb-12 px-4">
      <div class="max-w-6xl mx-auto">
        <div class="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          <!-- Left: Content -->
          <div class="flex-1 text-center lg:text-left animate-fade-in">
            <!-- Logo -->
            <div class="flex justify-center lg:justify-start mb-6">
              <div class="logo-icon-large relative w-20 h-20 group">
                <div class="absolute inset-0 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 rounded-2xl blur-xl animate-pulse-slow"></div>
                <div class="relative w-full h-full bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl shadow-2xl shadow-purple-500/30 flex items-center justify-center overflow-hidden">
                  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full animate-shimmer"></div>
                  <svg class="w-10 h-10 text-white relative z-10" viewBox="0 0 24 24" fill="none">
                    <circle cx="17" cy="7" r="4" fill="currentColor" opacity="0.3" class="animate-pulse-slow"/>
                    <circle cx="19" cy="9" r="2.5" fill="currentColor" opacity="0.25" class="animate-pulse-slow" style="animation-delay: 0.5s"/>
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <h1 class="text-5xl lg:text-6xl font-bold mb-4 flex items-center justify-center lg:justify-start gap-3 flex-wrap">
              <span>
                <span class="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">Forget</span><span class="text-gray-800 dark:text-slate-200">URL</span>
              </span>
              <span class="px-2.5 py-1 text-sm font-bold tracking-wider uppercase bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg shadow-lg shadow-orange-500/25">Beta</span>
            </h1>
            
            <p class="text-xl lg:text-2xl text-gray-600 dark:text-slate-300 font-medium mb-4">
              Save links, free your mind
            </p>
            
            <p class="text-gray-500 dark:text-slate-400 text-lg mb-8 max-w-xl mx-auto lg:mx-0">
              A clean and elegant bookmark manager. Say goodbye to cluttered browser favorites — organize with smart collections and find anything in seconds.
            </p>

            <!-- CTA Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                @click="scrollToLogin"
                class="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5"
              >
                Get Started Free
              </button>
              <a
                href="#features"
                class="px-8 py-4 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 font-semibold rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-300"
              >
                Learn More
              </a>
            </div>
          </div>

          <!-- Right: Hero Illustration -->
          <div class="flex-1 relative animate-fade-in" style="animation-delay: 0.2s">
            <div class="relative">
              <!-- Browser mockup -->
              <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl dark:shadow-black/40 border border-gray-200 dark:border-slate-700 overflow-hidden">
                <!-- Browser header -->
                <div class="bg-gray-100 dark:bg-slate-900 px-4 py-3 flex items-center gap-2 border-b border-gray-200 dark:border-slate-700">
                  <div class="flex gap-1.5">
                    <div class="w-3 h-3 rounded-full bg-red-400"></div>
                    <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div class="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div class="flex-1 mx-4">
                    <div class="bg-white dark:bg-slate-800 rounded-lg px-4 py-1.5 text-sm text-gray-500 dark:text-slate-400 flex items-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      forgeturl.com
                    </div>
                  </div>
                </div>
                
                <!-- Content mockup -->
                <div class="p-6">
                  <!-- Header -->
                  <div class="flex items-center justify-between mb-6">
                    <div>
                      <div class="h-6 w-40 bg-gradient-to-r from-violet-200 to-fuchsia-200 dark:from-violet-800 dark:to-fuchsia-800 rounded-lg mb-2"></div>
                      <div class="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded"></div>
                    </div>
                    <div class="flex gap-2">
                      <div class="h-8 w-8 bg-gray-100 dark:bg-slate-700 rounded-lg"></div>
                      <div class="h-8 w-20 bg-violet-100 dark:bg-violet-900/50 rounded-lg"></div>
                    </div>
                  </div>
                  
                  <!-- Collections Grid -->
                  <div class="grid grid-cols-2 gap-4">
                    <!-- Collection 1 -->
                    <div class="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 border border-gray-100 dark:border-slate-600">
                      <div class="flex items-center gap-2 mb-3">
                        <div class="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded flex items-center justify-center">
                          <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span class="text-sm font-medium text-gray-700 dark:text-slate-200">Dev Tools</span>
                      </div>
                      <div class="space-y-2">
                        <div class="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg">
                          <div class="w-4 h-4 bg-gray-200 dark:bg-slate-600 rounded"></div>
                          <div class="h-3 w-16 bg-gray-200 dark:bg-slate-600 rounded"></div>
                        </div>
                        <div class="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg">
                          <div class="w-4 h-4 bg-orange-200 dark:bg-orange-900/50 rounded"></div>
                          <div class="h-3 w-12 bg-gray-200 dark:bg-slate-600 rounded"></div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Collection 2 -->
                    <div class="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 border border-gray-100 dark:border-slate-600">
                      <div class="flex items-center gap-2 mb-3">
                        <div class="w-6 h-6 bg-purple-100 dark:bg-purple-900/50 rounded flex items-center justify-center">
                          <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <span class="text-sm font-medium text-gray-700 dark:text-slate-200">Learning</span>
                      </div>
                      <div class="space-y-2">
                        <div class="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg">
                          <div class="w-4 h-4 bg-green-200 dark:bg-green-900/50 rounded"></div>
                          <div class="h-3 w-14 bg-gray-200 dark:bg-slate-600 rounded"></div>
                        </div>
                        <div class="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg">
                          <div class="w-4 h-4 bg-blue-200 dark:bg-blue-900/50 rounded"></div>
                          <div class="h-3 w-20 bg-gray-200 dark:bg-slate-600 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Floating elements -->
              <div class="absolute -top-4 -right-4 bg-white dark:bg-slate-800 rounded-xl shadow-xl dark:shadow-black/30 p-3 border border-gray-100 dark:border-slate-700 animate-bounce-slow">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span class="text-sm font-medium text-gray-700 dark:text-slate-200">Saved!</span>
                </div>
              </div>
              
              <div class="absolute -bottom-4 -left-4 bg-white dark:bg-slate-800 rounded-xl shadow-xl dark:shadow-black/30 p-3 border border-gray-100 dark:border-slate-700" style="animation: float 3s ease-in-out infinite; animation-delay: 1s;">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span class="text-sm text-gray-500 dark:text-slate-400">Quick search...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="relative z-10 py-20 px-4">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16 animate-fade-in">
          <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-slate-100 mb-4">
            Why choose <span class="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">ForgetURL</span>
          </h2>
          <p class="text-gray-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Built for productivity. Keep your bookmarks simple and organized.
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="feature-card group bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-100 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300 hover:shadow-xl dark:hover:shadow-black/30 hover:-translate-y-1">
            <div class="w-14 h-14 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-7 h-7 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-3">Smart Collections</h3>
            <p class="text-gray-500 dark:text-slate-400 leading-relaxed">
              Organize links with folders and tags. Drag and drop to reorder — keep everything tidy.
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="feature-card group bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-100 dark:border-slate-700 hover:border-fuchsia-200 dark:hover:border-fuchsia-800 transition-all duration-300 hover:shadow-xl dark:hover:shadow-black/30 hover:-translate-y-1">
            <div class="w-14 h-14 bg-gradient-to-br from-fuchsia-100 to-pink-100 dark:from-fuchsia-900/50 dark:to-pink-900/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-7 h-7 text-fuchsia-600 dark:text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-3">Instant Search</h3>
            <p class="text-gray-500 dark:text-slate-400 leading-relaxed">
              Full-text search across titles, URLs, and tags. Find any link in milliseconds.
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="feature-card group bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 hover:shadow-xl dark:hover:shadow-black/30 hover:-translate-y-1">
            <div class="w-14 h-14 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-3">One-Click Sharing</h3>
            <p class="text-gray-500 dark:text-slate-400 leading-relaxed">
              Generate beautiful share pages. Share your curated collections with friends or your team.
            </p>
          </div>

          <!-- Feature 4 -->
          <div class="feature-card group bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300 hover:shadow-xl dark:hover:shadow-black/30 hover:-translate-y-1">
            <div class="w-14 h-14 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-7 h-7 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-3">Browser Import</h3>
            <p class="text-gray-500 dark:text-slate-400 leading-relaxed">
              Import existing bookmarks from Chrome, Firefox, Safari, and more with one click.
            </p>
          </div>

          <!-- Feature 5 -->
          <div class="feature-card group bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-100 dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-800 transition-all duration-300 hover:shadow-xl dark:hover:shadow-black/30 hover:-translate-y-1">
            <div class="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-7 h-7 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-3">Cross-Device Sync</h3>
            <p class="text-gray-500 dark:text-slate-400 leading-relaxed">
              Cloud-based storage. Access all your bookmarks from any device, anywhere.
            </p>
          </div>

          <!-- Feature 6 -->
          <div class="feature-card group bg-white dark:bg-slate-800 rounded-2xl p-8 border border-gray-100 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800 transition-all duration-300 hover:shadow-xl dark:hover:shadow-black/30 hover:-translate-y-1">
            <div class="w-14 h-14 bg-gradient-to-br from-rose-100 to-red-100 dark:from-rose-900/50 dark:to-red-900/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg class="w-7 h-7 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-3">Dark Mode</h3>
            <p class="text-gray-500 dark:text-slate-400 leading-relaxed">
              Beautifully crafted dark theme. Easy on the eyes for late-night browsing.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="relative z-10 py-20 px-4 bg-white/50 dark:bg-slate-800/30">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-slate-100 mb-4">
            Get started in 3 simple steps
          </h2>
          <p class="text-gray-500 dark:text-slate-400 text-lg">
            No complicated setup. Just start saving.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8 lg:gap-12">
          <!-- Step 1 -->
          <div class="text-center">
            <div class="relative inline-flex items-center justify-center w-20 h-20 mb-6">
              <div class="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl opacity-20 dark:opacity-30"></div>
              <span class="text-4xl font-bold bg-gradient-to-br from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">1</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-3">Sign In</h3>
            <p class="text-gray-500 dark:text-slate-400">
              Log in with your GitHub account. Quick and hassle-free.
            </p>
          </div>

          <!-- Step 2 -->
          <div class="text-center">
            <div class="relative inline-flex items-center justify-center w-20 h-20 mb-6">
              <div class="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl opacity-20 dark:opacity-30"></div>
              <span class="text-4xl font-bold bg-gradient-to-br from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">2</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-3">Create a Page</h3>
            <p class="text-gray-500 dark:text-slate-400">
              Set up bookmark pages to organize links by topic or project.
            </p>
          </div>

          <!-- Step 3 -->
          <div class="text-center">
            <div class="relative inline-flex items-center justify-center w-20 h-20 mb-6">
              <div class="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl opacity-20 dark:opacity-30"></div>
              <span class="text-4xl font-bold bg-gradient-to-br from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">3</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-3">Add Bookmarks</h3>
            <p class="text-gray-500 dark:text-slate-400">
              Paste a URL to auto-fetch details, or bulk import your existing bookmarks.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Login Section -->
    <section id="login" ref="loginSection" class="relative z-10 py-20 px-4">
      <div class="max-w-md mx-auto animate-fade-in">
        <!-- Login Card -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-black/30 border border-gray-100 dark:border-slate-700 p-8 transition-colors duration-300">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-2 text-center">
            Get Started
          </h2>
          <p class="text-gray-500 dark:text-slate-400 text-center mb-6">
            Choose a login method. It's free.
          </p>

          <!-- Error Message -->
          <div v-if="error" class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {{ error }}
          </div>

          <!-- Login Buttons -->
          <div class="space-y-3">
            <!-- Google Login -->
            <button
              @click="handleLogin('google')"
              :disabled="loading"
              class="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span class="font-medium">Sign in with Google</span>
            </button>

            <!-- GitHub Login -->
            <button
              @click="handleLogin('github')"
              :disabled="loading"
              class="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-gray-900 dark:bg-slate-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-slate-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fill-rule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="font-medium">Sign in with GitHub</span>
            </button>

            <!-- WeChat Login -->
            <button
              @click="handleLogin('wechat')"
              :disabled="loading"
              class="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-[#07C160] text-white rounded-xl hover:bg-[#06AD56] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
              </svg>
              <span class="font-medium">Sign in with WeChat</span>
            </button>
          </div>

          <!-- Loading Indicator -->
          <div v-if="loading" class="mt-6 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-violet-400"></div>
            <p class="mt-2 text-sm text-gray-600 dark:text-slate-400">Redirecting...</p>
          </div>
        </div>

        <!-- Footer -->
        <p class="mt-6 text-center text-sm text-gray-500 dark:text-slate-500">
          By signing in, you agree to our 
          <router-link to="/terms" class="text-violet-600 dark:text-violet-400 hover:underline">Terms of Service</router-link>
          and 
          <router-link to="/privacy" class="text-violet-600 dark:text-violet-400 hover:underline">Privacy Policy</router-link>
        </p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="relative z-10 py-8 px-4 border-t border-gray-200 dark:border-slate-800">
      <div class="max-w-6xl mx-auto">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="font-semibold text-gray-700 dark:text-slate-300">ForgetURL</span>
          </div>
          <p class="text-sm text-gray-500 dark:text-slate-500">
            © {{ new Date().getFullYear() }} ForgetURL. Save links, free your mind.
          </p>
        </div>
        
        <!-- Legal Links -->
        <div class="flex items-center justify-center gap-6 pt-4 border-t border-gray-100 dark:border-slate-700 mb-4">
          <router-link to="/privacy" class="text-sm text-gray-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-200">
            Privacy Policy
          </router-link>
          <span class="text-gray-300 dark:text-slate-600">|</span>
          <router-link to="/terms" class="text-sm text-gray-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-200">
            Terms of Service
          </router-link>
        </div>
        
        <!-- Open Source Links -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-gray-100 dark:border-slate-700">
          <span class="text-sm text-gray-500 dark:text-slate-400">Open Source on GitHub:</span>
          <div class="flex items-center gap-4">
            <a
              href="https://github.com/forgeturl/forgeturl-server"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-1.5 text-sm text-gray-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-200"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/>
              </svg>
              Backend
            </a>
            <span class="text-gray-300 dark:text-slate-600">|</span>
            <a
              href="https://github.com/forgeturl/forgeturl-website-claude-opus-4.5"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-1.5 text-sm text-gray-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-200"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/>
              </svg>
              Frontend
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useTheme } from '@/composables/useTheme'
import { isWechatLoginDomain } from '@/utils/config'

const { startAuth } = useAuth()
const { isDark, toggleTheme } = useTheme()
const loading = ref(false)
const error = ref('')
const loginSection = ref(null)
const showLoginDropdown = ref(false)
const loginDropdownRef = ref(null)

const scrollToLogin = () => {
  loginSection.value?.scrollIntoView({ behavior: 'smooth' })
}

const handleLogin = async (provider) => {
  loading.value = true
  error.value = ''
  showLoginDropdown.value = false

  try {
    await startAuth(provider)
  } catch (err) {
    console.error('Login error:', err)
    error.value = err.message || 'Login failed. Please try again.'
    loading.value = false
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (loginDropdownRef.value && !loginDropdownRef.value.contains(event.target)) {
    showLoginDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)

  // 检测是否从主站跳转过来进行微信登录
  // 当用户在 forgeturl.com 点击微信登录后，会被重定向到
  // forgeturl.brightguo.com/?wechat_login=true，此时自动发起微信OAuth
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('wechat_login') === 'true' && isWechatLoginDomain()) {
    handleLogin('wechat')
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}
</style>
