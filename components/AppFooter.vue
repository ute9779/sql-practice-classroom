<script setup lang="ts">
import { SITE } from '~/data/site'

const copyrightName = SITE.author || '個人開発'
</script>

<template>
  <footer class="mt-auto bg-white border-t border-slate-200">
    <div class="max-w-[1600px] mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
      <p class="text-xs text-slate-500 leading-relaxed text-center sm:text-left">
        {{ SITE.name }} は学習用のサイトです。内容の正確性や可用性は保証しません。
      </p>
      <nav class="flex items-center gap-4 text-xs">
        <NuxtLink to="/about" class="text-slate-500 hover:text-blue-600 hover:underline">このサイトについて</NuxtLink>
        <NuxtLink to="/privacy" class="text-slate-500 hover:text-blue-600 hover:underline">プライバシー</NuxtLink>
        <NuxtLink to="/licenses" class="text-slate-500 hover:text-blue-600 hover:underline">ライセンス</NuxtLink>
        <a
          v-if="SITE.twitterUrl"
          :href="SITE.twitterUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-slate-500 hover:text-blue-600 hover:underline"
        >X（旧Twitter）</a>
      </nav>
    </div>
    <div class="pb-5 text-center">
      <p class="text-xs text-slate-400">© {{ SITE.year }} {{ copyrightName }}</p>
    </div>
  </footer>
</template>
