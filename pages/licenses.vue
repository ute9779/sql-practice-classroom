<script setup lang="ts">
import { SITE, OSS_LICENSES } from '~/data/site'

useHead({ title: `ライセンス｜${SITE.name}` })
</script>

<template>
  <main class="max-w-3xl mx-auto px-4 py-12">
    <NuxtLink to="/" class="text-sm text-blue-600 hover:underline">← トップへ</NuxtLink>
    <h1 class="text-2xl font-bold text-slate-800 mt-4 mb-6">ライセンス</h1>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-sm text-slate-700 leading-relaxed">
      <p class="mb-4">
        本サイトは、以下のオープンソースソフトウェアを利用して作られています。
        各ソフトウェアの著作権は、それぞれの権利者に帰属します。
      </p>
      <ul class="divide-y divide-slate-100">
        <li v-for="o in OSS_LICENSES" :key="o.name" class="py-3 flex items-center justify-between gap-3">
          <div>
            <a :href="o.url" target="_blank" rel="noopener noreferrer" class="font-semibold text-blue-700 hover:underline">{{ o.name }}</a>
            <span v-if="o.version" class="text-slate-400 ml-1.5">{{ o.version }}</span>
          </div>
          <span class="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg shrink-0">{{ o.license }}</span>
        </li>
      </ul>
    </div>
  </main>
</template>
