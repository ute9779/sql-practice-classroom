<script setup lang="ts">
import { QUESTIONS, LEVEL_STYLE, CATEGORY_STYLE } from '~/data/questions'
import type { Level, Category } from '~/data/questions'
import { useFilter } from '~/composables/useFilter'
import { useDatabase } from '~/composables/useDatabase'

const { isReady, initMessage, initError, init } = useDatabase()
const {
  selectedLevels, selectedCategories,
  sortKey, sortDir,
  filteredQuestions, toggleLevel, toggleCategory, clearFilters, isFiltered,
} = useFilter()

onMounted(() => init())

const LEVELS:     Level[]    = ['初級', '中級', '上級']
// カテゴリ一覧は CATEGORY_STYLE から導出（カテゴリ追加時の更新漏れを防ぐ）
const CATEGORIES = Object.keys(CATEGORY_STYLE) as Category[]

function toggleSort(key: typeof sortKey.value) {
  sortKey.value === key
    ? (sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc')
    : ((sortKey.value = key), (sortDir.value = 'asc'))
}

// フィルターボタン選択時のインラインスタイルを返す
function tagStyle(s: { bg: string; text: string }) {
  return { backgroundColor: s.bg, color: s.text }
}
</script>

<template>
  <main class="max-w-6xl mx-auto px-4 py-8">

    <!-- ローディング -->
    <Transition name="fade">
      <div
        v-if="!isReady"
        class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm"
      >
        <!-- 失敗時はスピナーの代わりにエラーと再試行ボタンを出す -->
        <div v-if="initError" class="px-4 w-full flex justify-center">
          <DbInitError />
        </div>
        <template v-else>
          <svg class="animate-spin h-12 w-12 mb-4 text-blue-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p class="text-white text-lg font-semibold">データベースを初期化中…</p>
          <p class="text-slate-400 text-sm mt-1">{{ initMessage }}</p>
        </template>
      </div>
    </Transition>

    <!-- ヒーロー -->
    <section class="mb-8">
      <h2 class="text-3xl font-bold text-slate-800 mb-1">問題一覧</h2>
      <p class="text-slate-500 text-sm">全 {{ QUESTIONS.length }} 問</p>
    </section>

    <!-- フィルター・ソートパネル -->
    <div class="bg-white rounded-2xl shadow p-5 mb-6">
      <div class="flex flex-wrap items-start gap-6">

        <!-- 難易度フィルター -->
        <div class="flex flex-col gap-2">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">難易度</p>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="lv in LEVELS" :key="lv"
              class="px-3 py-1 rounded-lg text-xs font-semibold border transition-all"
              :style="selectedLevels.includes(lv)
                ? { backgroundColor: LEVEL_STYLE[lv].bg, color: LEVEL_STYLE[lv].text, borderColor: LEVEL_STYLE[lv].text, outline: `2px solid ${LEVEL_STYLE[lv].text}`, outlineOffset: '2px' }
                : {}"
              :class="!selectedLevels.includes(lv) ? 'bg-white text-slate-500 border-slate-200 hover:border-slate-400' : ''"
              @click="toggleLevel(lv)"
            >{{ lv }}</button>
          </div>
        </div>

        <!-- 種類フィルター -->
        <div class="flex flex-col gap-2 flex-1">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">種類</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="cat in CATEGORIES" :key="cat"
              class="px-3 py-1 rounded-lg text-xs font-semibold border transition-all"
              :style="selectedCategories.includes(cat)
                ? { backgroundColor: CATEGORY_STYLE[cat].bg, color: CATEGORY_STYLE[cat].text, borderColor: CATEGORY_STYLE[cat].text, outline: `2px solid ${CATEGORY_STYLE[cat].text}`, outlineOffset: '2px' }
                : {}"
              :class="!selectedCategories.includes(cat) ? 'bg-white text-slate-500 border-slate-200 hover:border-slate-400' : ''"
              @click="toggleCategory(cat)"
            >{{ cat }}</button>
          </div>
        </div>

        <!-- 並び替え -->
        <div class="flex flex-col gap-2 shrink-0">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">並び替え</p>
          <div class="flex gap-2">
            <button
              class="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold border transition-all"
              :class="sortKey === 'id' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'"
              @click="toggleSort('id')"
            >問題番号<span v-if="sortKey === 'id'">{{ sortDir === 'asc' ? ' ↑' : ' ↓' }}</span></button>
            <button
              class="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold border transition-all"
              :class="sortKey === 'level' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'"
              @click="toggleSort('level')"
            >難易度順<span v-if="sortKey === 'level'">{{ sortDir === 'asc' ? ' ↑' : ' ↓' }}</span></button>
          </div>
        </div>

        <!-- クリア -->
        <div class="flex items-end shrink-0">
          <button
            v-if="isFiltered"
            class="px-3 py-1 rounded-lg text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            @click="clearFilters"
          >× クリア</button>
        </div>
      </div>

      <p class="mt-3 text-xs text-slate-400">
        {{ filteredQuestions.length }} 件表示
        <span v-if="isFiltered" class="text-blue-500 ml-1">（絞り込み中）</span>
      </p>
    </div>

    <!-- 問題カードグリッド -->
    <div v-if="filteredQuestions.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <NuxtLink
        v-for="q in filteredQuestions"
        :key="q.id"
        :to="`/questions/${q.id}`"
        class="group bg-white rounded-2xl shadow hover:shadow-md border border-slate-100 hover:border-blue-200 p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5"
      >
        <!-- ヘッダー -->
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg">Q{{ q.id }}</span>
          <div class="flex items-center gap-1.5">
            <!-- 種類タグ -->
            <span
              class="text-xs font-semibold px-2.5 py-0.5 rounded-lg"
              :style="tagStyle(CATEGORY_STYLE[q.category])"
            >{{ q.category }}</span>
            <!-- 難易度タグ -->
            <span
              class="text-xs font-semibold px-2.5 py-0.5 rounded-lg"
              :style="tagStyle(LEVEL_STYLE[q.level])"
            >{{ q.level }}</span>
          </div>
        </div>

        <!-- タイトル -->
        <h3 class="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors leading-snug flex-1">
          {{ q.title }}
        </h3>

        <!-- フッター -->
        <div class="flex items-center justify-end mt-auto pt-2 border-t border-slate-100">
          <span class="text-xs text-blue-500 font-semibold group-hover:underline">挑戦する →</span>
        </div>
      </NuxtLink>
    </div>

    <!-- 結果なし -->
    <div v-else class="text-center py-16 text-slate-400">
      <p class="text-4xl mb-3">🔍</p>
      <p class="font-semibold">条件に一致する問題がありません</p>
      <button class="mt-4 text-sm text-blue-500 hover:underline" @click="clearFilters">フィルターをリセット</button>
    </div>

  </main>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
