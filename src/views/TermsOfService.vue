<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-fuchsia-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 relative overflow-hidden transition-colors duration-300">
    <!-- Background decoration -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-violet-200/40 to-fuchsia-200/40 dark:from-violet-500/20 dark:to-fuchsia-500/20 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-24 -left-24 w-80 h-80 bg-gradient-to-tr from-purple-200/30 to-violet-200/30 dark:from-purple-500/15 dark:to-violet-500/15 rounded-full blur-3xl"></div>
    </div>

    <!-- Navigation -->
    <nav class="relative z-20 px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div class="w-9 h-9 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="font-bold text-lg text-gray-800 dark:text-slate-200">
            <span class="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">Forget</span>URL
          </span>
        </router-link>

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
      </div>
    </nav>

    <!-- Content -->
    <main class="relative z-10 px-6 py-12">
      <div class="max-w-4xl mx-auto">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-black/30 border border-gray-100 dark:border-slate-700 p-8 md:p-12">
          <!-- Header -->
          <div class="mb-10">
            <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-100 mb-4">
              Terms of Service
            </h1>
            <p class="text-gray-500 dark:text-slate-400">
              Last updated: January 7, 2026
            </p>
          </div>

          <!-- Content -->
          <div class="prose prose-gray dark:prose-invert max-w-none">
            <section class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">1. Agreement to Terms</h2>
              <p class="text-gray-600 dark:text-slate-300 mb-4 leading-relaxed">
                Welcome to ForgetURL. These Terms of Service ("Terms") govern your access to and use of the ForgetURL website and services located at forgeturl.com (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms.
              </p>
              <p class="text-gray-600 dark:text-slate-300 leading-relaxed">
                If you do not agree to these Terms, you may not access or use the Service. We may modify these Terms at any time, and such modifications will be effective immediately upon posting. Your continued use of the Service following any modifications indicates your acceptance of the modified Terms.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">2. Description of Service</h2>
              <p class="text-gray-600 dark:text-slate-300 leading-relaxed">
                ForgetURL is a bookmark management service that allows users to save, organize, and share web links. The Service includes features such as bookmark collections, link sharing, cross-device synchronization, and search functionality. We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time without notice.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">3. User Accounts</h2>
              
              <h3 class="text-lg font-medium text-gray-800 dark:text-slate-200 mb-3">3.1 Account Creation</h3>
              <p class="text-gray-600 dark:text-slate-300 mb-4 leading-relaxed">
                To access certain features of the Service, you must create an account using a third-party authentication provider (GitHub, Google, or WeChat). You agree to provide accurate and complete information and to keep this information up to date.
              </p>

              <h3 class="text-lg font-medium text-gray-800 dark:text-slate-200 mb-3">3.2 Account Security</h3>
              <p class="text-gray-600 dark:text-slate-300 mb-4 leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>

              <h3 class="text-lg font-medium text-gray-800 dark:text-slate-200 mb-3">3.3 Account Termination</h3>
              <p class="text-gray-600 dark:text-slate-300 leading-relaxed">
                We reserve the right to suspend or terminate your account at any time for any reason, including violation of these Terms. You may also delete your account at any time by contacting us.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">4. User Content</h2>
              
              <h3 class="text-lg font-medium text-gray-800 dark:text-slate-200 mb-3">4.1 Your Content</h3>
              <p class="text-gray-600 dark:text-slate-300 mb-4 leading-relaxed">
                You retain ownership of all bookmarks, collections, and other content you create or store using our Service ("User Content"). By using the Service, you grant us a limited license to host, store, and display your User Content solely for the purpose of providing the Service to you.
              </p>

              <h3 class="text-lg font-medium text-gray-800 dark:text-slate-200 mb-3">4.2 Content Responsibility</h3>
              <p class="text-gray-600 dark:text-slate-300 mb-4 leading-relaxed">
                You are solely responsible for your User Content. You represent and warrant that you have all necessary rights to the content you store and share, and that your User Content does not violate any third-party rights or applicable laws.
              </p>

              <h3 class="text-lg font-medium text-gray-800 dark:text-slate-200 mb-3">4.3 Shared Content</h3>
              <p class="text-gray-600 dark:text-slate-300 leading-relaxed">
                When you create shareable links for your collections or pages, you acknowledge that anyone with access to those links can view the shared content. You are responsible for managing access to your shared content.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">5. Acceptable Use</h2>
              <p class="text-gray-600 dark:text-slate-300 mb-4">You agree not to use the Service to:</p>
              <ul class="list-disc list-inside text-gray-600 dark:text-slate-300 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the intellectual property rights of others</li>
                <li>Store or share content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable</li>
                <li>Transmit viruses, malware, or other malicious code</li>
                <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
                <li>Interfere with or disrupt the Service or servers connected to the Service</li>
                <li>Use the Service for any commercial purpose without our written consent</li>
                <li>Scrape, crawl, or use automated means to access the Service without permission</li>
                <li>Impersonate any person or entity</li>
                <li>Collect or harvest personal information of other users</li>
              </ul>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">6. Intellectual Property</h2>
              <p class="text-gray-600 dark:text-slate-300 leading-relaxed">
                The Service and its original content (excluding User Content), features, and functionality are owned by ForgetURL and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">7. Third-Party Links and Services</h2>
              <p class="text-gray-600 dark:text-slate-300 leading-relaxed">
                The Service may contain links to third-party websites or services that are not owned or controlled by ForgetURL. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You acknowledge and agree that we shall not be responsible or liable for any damage or loss caused by your use of any such third-party content, goods, or services.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">8. Disclaimer of Warranties</h2>
              <p class="text-gray-600 dark:text-slate-300 mb-4 leading-relaxed">
                THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
              </p>
              <p class="text-gray-600 dark:text-slate-300 leading-relaxed">
                We do not warrant that the Service will be uninterrupted, secure, or error-free, that defects will be corrected, or that the Service or servers are free of viruses or other harmful components.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">9. Limitation of Liability</h2>
              <p class="text-gray-600 dark:text-slate-300 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL FORGETURL, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">10. Indemnification</h2>
              <p class="text-gray-600 dark:text-slate-300 leading-relaxed">
                You agree to defend, indemnify, and hold harmless ForgetURL and its officers, directors, employees, and agents from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from your use of the Service, your User Content, or your violation of these Terms.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">11. Governing Law</h2>
              <p class="text-gray-600 dark:text-slate-300 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which ForgetURL operates, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the Service shall be resolved through binding arbitration or in the courts of that jurisdiction.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">12. Severability</h2>
              <p class="text-gray-600 dark:text-slate-300 leading-relaxed">
                If any provision of these Terms is held to be invalid or unenforceable, such provision shall be struck and the remaining provisions shall be enforced to the fullest extent under law.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">13. Entire Agreement</h2>
              <p class="text-gray-600 dark:text-slate-300 leading-relaxed">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and ForgetURL regarding your use of the Service and supersede all prior agreements and understandings.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">14. Waiver</h2>
              <p class="text-gray-600 dark:text-slate-300 leading-relaxed">
                Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. The waiver of any such right or provision will be effective only if in writing and signed by a duly authorized representative of ForgetURL.
              </p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">15. Contact Us</h2>
              <p class="text-gray-600 dark:text-slate-300 mb-4 leading-relaxed">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div class="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-6 border border-gray-100 dark:border-slate-600">
                <p class="text-gray-700 dark:text-slate-200 font-medium mb-2">ForgetURL</p>
                <p class="text-gray-600 dark:text-slate-300">
                  Email: <a href="mailto:support@forgeturl.com" class="text-violet-600 dark:text-violet-400 hover:underline">support@forgeturl.com</a>
                </p>
                <p class="text-gray-600 dark:text-slate-300">
                  Website: <a href="https://forgeturl.com" class="text-violet-600 dark:text-violet-400 hover:underline">https://forgeturl.com</a>
                </p>
              </div>
            </section>
          </div>
        </div>

        <!-- Back to Home -->
        <div class="mt-8 text-center">
          <router-link
            to="/"
            class="inline-flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-200"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </router-link>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="relative z-10 py-8 px-4 border-t border-gray-200 dark:border-slate-800">
      <div class="max-w-4xl mx-auto text-center">
        <p class="text-sm text-gray-500 dark:text-slate-500">
          © {{ new Date().getFullYear() }} ForgetURL. All rights reserved.
        </p>
        <div class="mt-4 flex justify-center gap-6">
          <router-link to="/privacy" class="text-sm text-gray-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Privacy Policy</router-link>
          <router-link to="/terms" class="text-sm text-violet-600 dark:text-violet-400 hover:underline">Terms of Service</router-link>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>


