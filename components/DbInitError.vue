<script setup lang="ts">
import { useDatabase } from '~/composables/useDatabase'

// DB の初期化に失敗したときだけ表示する。「再試行」で最初からやり直せる。
const { initError, init } = useDatabase()
const retrying = ref(false)

async function retry() {
  retrying.value = true
  try { await init() } finally { retrying.value = false }
}
</script>

<template>
  <div
    v-if="initError"
    role="alert"
    class="bg-white border border-red-200 rounded-2xl shadow p-5 max-w-lg w-full text-left"
  >
    <p class="text-sm font-bold text-red-700 mb-1">⚠ データベースを準備できませんでした</p>
    <p class="text-xs text-slate-600 leading-relaxed">
      SQL の実行に必要なライブラリ（sql.js）の読み込みに失敗しました。
      ネットワーク接続を確認して、もう一度お試しください。
    </p>
    <p class="font-mono-code text-xs text-red-600 break-all mt-2">{{ initError }}</p>
    <button
      type="button"
      class="mt-3 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow transition-colors disabled:opacity-40"
      :disabled="retrying"
      @click="retry"
    >{{ retrying ? '再試行中…' : '再試行' }}</button>
  </div>
</template>
