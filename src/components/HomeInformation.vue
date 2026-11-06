<template>
  <section class="relative z-10 px-4 py-16" aria-labelledby="about-forgeturl">
    <div class="max-w-4xl mx-auto">
      <h2 id="about-forgeturl" class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4">{{ content.heading }}</h2>
      <p class="text-lg leading-relaxed text-gray-600 dark:text-slate-300 mb-8">{{ content.intro }}</p>
      <nav aria-label="Homepage language" class="flex gap-4 mb-12 text-violet-700 dark:text-violet-300">
        <a href="/" lang="en" hreflang="en" class="hover:underline" :aria-current="isChinese ? undefined : 'page'">English</a>
        <a href="/zh/" lang="zh-CN" hreflang="zh-CN" class="hover:underline" :aria-current="isChinese ? 'page' : undefined">简体中文</a>
      </nav>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6">{{ content.faqTitle }}</h2>
      <div class="divide-y divide-gray-200 dark:divide-slate-700">
        <details v-for="[question, answer] in content.faq" :key="question" class="py-5">
          <summary class="cursor-pointer font-semibold text-gray-900 dark:text-slate-100">{{ question }}</summary>
          <p class="mt-3 leading-relaxed text-gray-600 dark:text-slate-300">{{ answer }}</p>
        </details>
      </div>
      <div class="mt-10 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-6">
        <h2 class="font-semibold text-gray-900 dark:text-slate-100">{{ content.sourceLabel }}</h2>
        <p class="mt-2 text-gray-600 dark:text-slate-300">{{ content.sourceText }}</p>
        <div class="mt-4 flex flex-wrap gap-5 text-violet-700 dark:text-violet-300">
          <a href="https://github.com/forgeturl/forgeturl-website-claude-opus-4.5" class="hover:underline">GitHub · Frontend</a>
          <a href="https://github.com/forgeturl/forgeturl-server" class="hover:underline">GitHub · Server</a>
          <router-link to="/changelog" class="hover:underline">{{ isChinese ? '更新日志' : 'Changelog' }}</router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { homeContent } from '@/seo/site.js'

const { locale } = useI18n()
const isChinese = computed(() => locale.value.startsWith('zh'))
const content = computed(() => homeContent[isChinese.value ? 'zh-CN' : 'en'])
</script>
