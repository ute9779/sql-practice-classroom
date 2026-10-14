<script setup lang="ts">
import { TABLE_NAMES } from '~/data/schema'
import { useDatabase } from '~/composables/useDatabase'
import type { SqlResult } from '~/utils/judge'

const { exec, isReady } = useDatabase()

// 各テーブルの開閉状態とデータをまとめて管理
interface TableState {
  open: boolean
  result: SqlResult
  error: string
  loaded: boolean
}

const tables = ref<Record<string, TableState>>(
  Object.fromEntries(
    TABLE_NAMES.map((name) => [name, { open: false, result: [], error: '', loaded: false }])
  )
)

function toggle(name: string) {
  const t = tables.value[name]
  t.open = !t.open
  // 開いたときに未ロードなら取得
  if (t.open && !t.loaded) {
    fetchTable(name)
  }
}

function fetchTable(name: string) {
  const t = tables.value[name]
  t.error = ''
  t.loaded = true
  try {
    t.result = exec(`SELECT * FROM ${name}`)
  } catch (e: any) {
    t.error = e.message
  }
}

// DB ready になったら開いているテーブルをロード
watch(isReady, (ready) => {
  if (!ready) return
  TABLE_NAMES.forEach((name) => {
    if (tables.value[name].open) fetchTable(name)
  })
})

function openAll() {
  TABLE_NAMES.forEach((name) => {
    tables.value[name].open = true
    if (!tables.value[name].loaded && isReady.value) fetchTable(name)
  })
}

function closeAll() {
  TABLE_NAMES.forEach((name) => { tables.value[name].open = false })
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- 一括操作 -->
    <div class="flex items-center gap-3">
      <button
        class="text-xs font-semibold text-blue-600 hover:underline"
        @click="openAll"
      >すべて展開</button>
      <span class="text-slate-300">|</span>
      <button
        class="text-xs font-semibold text-slate-400 hover:underline"
        @click="closeAll"
      >すべて折りたたむ</button>
    </div>

    <!-- テーブルアコーディオン -->
    <div
      v-for="name in TABLE_NAMES"
      :key="name"
      class="border border-slate-200 rounded-xl overflow-hidden"
    >
      <!-- ヘッダー行（クリックで開閉） -->
      <button
        class="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-blue-50 transition-colors text-left"
        @click="toggle(name)"
      >
        <div class="flex items-center gap-2">
          <!-- DB アイコン -->
          <svg class="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
            <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
          </svg>
          <span class="text-sm font-bold text-slate-700 font-mono-code">{{ name }}</span>
          <!-- 行数バッジ -->
          <span
            v-if="tables[name].loaded && tables[name].result.length"
            class="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold"
          >{{ tables[name].result[0].values.length }} 行</span>
        </div>
        <!-- 開閉矢印 -->
        <svg
          class="w-4 h-4 text-slate-400 transition-transform duration-200"
          :class="tables[name].open ? 'rotate-180' : ''"
          fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <!-- コンテンツ -->
      <Transition name="accordion">
        <div v-if="tables[name].open">
          <!-- エラー -->
          <div v-if="tables[name].error" class="px-4 py-3 text-xs text-red-500 bg-red-50">
            {{ tables[name].error }}
          </div>

          <!-- ローディング -->
          <div v-else-if="!tables[name].loaded || !isReady" class="px-4 py-4 text-xs text-slate-400 text-center">
            <span class="inline-block animate-pulse">読み込み中…</span>
          </div>

          <!-- データテーブル -->
          <div v-else-if="tables[name].result.length" class="overflow-x-auto max-h-72 overflow-y-auto">
            <table class="w-full text-xs border-collapse">
              <thead>
                <tr class="bg-slate-700 text-white sticky top-0 z-10">
                  <th
                    v-for="col in tables[name].result[0].columns"
                    :key="col"
                    class="px-4 py-2.5 text-left font-semibold whitespace-nowrap tracking-wide"
                  >{{ col }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, ri) in tables[name].result[0].values"
                  :key="ri"
                  class="hover:bg-blue-50 transition-colors"
                  :class="ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'"
                >
                  <td
                    v-for="(cell, ci) in row"
                    :key="ci"
                    class="px-4 py-2 border-b border-slate-100 whitespace-nowrap"
                  >
                    <span v-if="cell === null" class="text-slate-300 italic">NULL</span>
                    <span v-else>{{ cell }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="px-4 py-3 text-xs text-slate-400 text-center">データなし</div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}
.accordion-enter-to,
.accordion-leave-from {
  max-height: 1200px;
  opacity: 1;
}
</style>
