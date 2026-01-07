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
              Privacy Policy
            </h1>
            <p class="text-gray-500 dark:text-slate-400">
              Last updated: January 7, 2026
            </p>
          </div>

          <!-- Content -->
          <div class="prose prose-gray dark:prose-invert max-w-none">
            <section class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">1. Introduction</h2>
              <p class="text-gray-600 dark:text-slate-300 mb-4 leading-relaxed">
                Welcome to ForgetURL ("we," "our," or "us"). We are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our bookmark management service at forgeturl.com (the "Service").
              </p>
              <p class="text-gray-600 dark:text-slate-300 leading-relaxed">
                By using our Service, you agree to the collection and use of information in accordance with this Privacy Policy.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">2. Information We Collect</h2>
              
              <h3 class="text-lg font-medium text-gray-800 dark:text-slate-200 mb-3">2.1 Information You Provide</h3>
              <ul class="list-disc list-inside text-gray-600 dark:text-slate-300 mb-4 space-y-2">
                <li>Account information from third-party authentication providers (GitHub, Google, WeChat), including your name, email address, and profile picture</li>
                <li>Bookmarks and links you save to your collections</li>
                <li>Collection names, descriptions, and organization preferences</li>
                <li>Any other information you choose to provide</li>
              </ul>

              <h3 class="text-lg font-medium text-gray-800 dark:text-slate-200 mb-3">2.2 Information Collected Automatically</h3>
              <ul class="list-disc list-inside text-gray-600 dark:text-slate-300 mb-4 space-y-2">
                <li>Device information (browser type, operating system)</li>
                <li>Usage data (pages visited, features used, time spent)</li>
                <li>IP address and approximate location</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">3. How We Use Your Information</h2>
              <p class="text-gray-600 dark:text-slate-300 mb-4">We use the information we collect to:</p>
              <ul class="list-disc list-inside text-gray-600 dark:text-slate-300 space-y-2">
                <li>Provide, maintain, and improve our Service</li>
                <li>Create and manage your account</li>
                <li>Sync your bookmarks across devices</li>
                <li>Process and respond to your requests and inquiries</li>
                <li>Send you technical notices and security alerts</li>
                <li>Analyze usage patterns to enhance user experience</li>
                <li>Detect, prevent, and address technical issues and security threats</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">4. Information Sharing and Disclosure</h2>
              <p class="text-gray-600 dark:text-slate-300 mb-4 leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul class="list-disc list-inside text-gray-600 dark:text-slate-300 space-y-2">
                <li><strong class="text-gray-700 dark:text-slate-200">With your consent:</strong> When you explicitly agree to share information</li>
                <li><strong class="text-gray-700 dark:text-slate-200">Service providers:</strong> With trusted third-party services that help us operate our Service (e.g., cloud hosting, analytics)</li>
                <li><strong class="text-gray-700 dark:text-slate-200">Legal requirements:</strong> When required by law, court order, or governmental authority</li>
                <li><strong class="text-gray-700 dark:text-slate-200">Protection of rights:</strong> To protect our rights, privacy, safety, or property, and that of our users</li>
                <li><strong class="text-gray-700 dark:text-slate-200">Shared pages:</strong> When you create shareable links, the content you choose to share will be accessible to anyone with the link</li>
              </ul>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">5. Data Security</h2>
              <p class="text-gray-600 dark:text-slate-300 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include encryption, secure servers, and regular security assessments. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">6. Data Retention</h2>
              <p class="text-gray-600 dark:text-slate-300 leading-relaxed">
                We retain your personal information for as long as your account is active or as needed to provide you services. If you wish to delete your account, please contact us, and we will delete your personal information within a reasonable timeframe, except as required by law or for legitimate business purposes.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">7. Your Rights and Choices</h2>
              <p class="text-gray-600 dark:text-slate-300 mb-4">Depending on your location, you may have the following rights:</p>
              <ul class="list-disc list-inside text-gray-600 dark:text-slate-300 space-y-2">
                <li>Access, correct, or delete your personal information</li>
                <li>Export your data in a portable format</li>
                <li>Opt out of certain data collection or processing</li>
                <li>Withdraw consent where processing is based on consent</li>
                <li>Lodge a complaint with a data protection authority</li>
              </ul>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">8. Third-Party Authentication</h2>
              <p class="text-gray-600 dark:text-slate-300 leading-relaxed">
                We use third-party authentication services (GitHub, Google, WeChat) to allow you to sign in to our Service. When you authenticate through these services, we receive limited profile information as permitted by your privacy settings with those providers. We encourage you to review the privacy policies of these third-party services.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">9. Cookies and Tracking Technologies</h2>
              <p class="text-gray-600 dark:text-slate-300 leading-relaxed">
                We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie preferences through your browser settings. Note that disabling certain cookies may affect the functionality of our Service.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">10. Children's Privacy</h2>
              <p class="text-gray-600 dark:text-slate-300 leading-relaxed">
                Our Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us, and we will take steps to delete such information.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">11. International Data Transfers</h2>
              <p class="text-gray-600 dark:text-slate-300 leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. By using our Service, you consent to the transfer of your information to these countries.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">12. Changes to This Privacy Policy</h2>
              <p class="text-gray-600 dark:text-slate-300 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">13. Contact Us</h2>
              <p class="text-gray-600 dark:text-slate-300 mb-4 leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div class="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-6 border border-gray-100 dark:border-slate-600">
                <p class="text-gray-700 dark:text-slate-200 font-medium mb-2">ForgetURL</p>
                <p class="text-gray-600 dark:text-slate-300">
                  Email: <a href="mailto:privacy@forgeturl.com" class="text-violet-600 dark:text-violet-400 hover:underline">privacy@forgeturl.com</a>
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
          <router-link to="/privacy" class="text-sm text-violet-600 dark:text-violet-400 hover:underline">Privacy Policy</router-link>
          <router-link to="/terms" class="text-sm text-gray-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Terms of Service</router-link>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

