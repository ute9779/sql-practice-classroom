<script setup lang="ts">
import { QUESTIONS, CATEGORY_STYLE, LEVEL_STYLE } from '~/data/questions'
import { useDatabase } from '~/composables/useDatabase'
import { useScores } from '~/composables/useScores'
import { useFilter } from '~/composables/useFilter'
import type { SqlResult } from '~/composables/useDatabase'

const route = useRoute()
const router = useRouter()
const { exec, execSandbox, isReady, init } = useDatabase()
const { scores, setScore } = useScores()
const { filteredQuestions, adjacentIds } = useFilter()

const qId = computed(() => Number(route.params.id))
const qIndex = computed(() => qId.value - 1)
const question = computed(() => QUESTIONS.find((q) => q.id === qId.value))

watchEffect(() => {
  if (!question.value) router.replace('/')
})
onMounted(() => init())

// ページ状態
const sqlInput = ref('')
const showHint = ref(false)
const activeTab = ref<'tables' | 'er'>('tables') // 右カラムのタブ

// 結果状態
const execResult = ref<SqlResult>([])
const execError = ref('')
const verdict = ref<'correct' | 'wrong' | 'missing' | null>(null)
const missingLabels = ref<string[]>([]) // 不足している指定構文のラベル
const judged = ref(false)

watch(qId, () => {
  sqlInput.value = ''
  execResult.value = []
  execError.value = ''
  verdict.value = null
  missingLabels.value = []
  judged.value = false
  showHint.value = false
})

function runSQL(judge: boolean) {
  const sql = sqlInput.value.trim()
  if (!sql || !isReady.value) return
  execError.value = ''
  execResult.value = []
  verdict.value = null
  missingLabels.value = []

  // DDL・DML はサンドボックスDBで実行（メインDBを汚染しない）
  const isSandbox = question.value?.category === 'DDL' || question.value?.category === 'DML'

  try {
    execResult.value = isSandbox ? execSandbox(sql) : exec(sql)
  } catch (e: any) {
    execError.value = e.message
    return
  }

  if (!judge) return

  const q = question.value!
  const resultOk = q.validate(execResult.value)

  // 指定構文チェック（大文字化して部分一致で判定）
  const upperSql = sql.toUpperCase()
  const missing = (q.requiredKeywords ?? []).filter(
    (k) => !upperSql.includes(k.keyword.toUpperCase())
  )

  if (resultOk && missing.length > 0) {
    // 結果は合っているが指定構文を使っていない → 不正解扱い
    verdict.value = 'missing'
    missingLabels.value = missing.map((m) => m.label)
    judged.value = true
    setScore(qIndex.value, false)
  } else {
    verdict.value = resultOk ? 'correct' : 'wrong'
    judged.value = true
    setScore(qIndex.value, resultOk)
  }
}

const rowCount = computed(() =>
  execResult.value.length > 0 ? `${execResult.value[0].values.length} 行` : ''
)

// フィルター状態に追従した前後ナビ
const { prevId: prevQ, nextId: nextQ } = computed(() => adjacentIds(qId.value)).value
const adjacent = computed(() => adjacentIds(qId.value))

const hasResult = computed(() => !!execError.value || execResult.value.length > 0 || judged.value)
</script>

<template>
  <div v-if="question">
    <main class="max-w-[1600px] mx-auto px-4 py-6 grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">

      <!-- ====== 左カラム（問題・入力・結果） ====== -->
      <section class="xl:col-span-2 flex flex-col gap-5">

        <!-- 問題カード -->
        <div class="bg-white rounded-2xl shadow p-5">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Q{{ question.id }} / {{ QUESTIONS.length }}
            </span>
            <div class="flex items-center gap-1.5">
              <span
                class="text-xs font-semibold px-2.5 py-0.5 rounded-lg"
                :style="{ backgroundColor: CATEGORY_STYLE[question.category].bg, color: CATEGORY_STYLE[question.category].text }"
              >{{ question.category }}</span>
              <span
                class="text-xs font-semibold px-2.5 py-0.5 rounded-lg"
                :style="{ backgroundColor: LEVEL_STYLE[question.level].bg, color: LEVEL_STYLE[question.level].text }"
              >{{ question.level }}</span>
            </div>
          </div>
          <h2 class="text-lg font-bold text-slate-800 mb-2">{{ question.title }}</h2>
          <p class="text-slate-600 leading-relaxed text-sm">{{ question.desc }}</p>

          <!-- ヒント -->
          <div class="mt-3">
            <button
              class="text-xs text-slate-400 hover:text-amber-600 underline transition-colors"
              @click="showHint = !showHint"
            >{{ showHint ? 'ヒントを隠す' : '💡 ヒントを表示' }}</button>
            <Transition name="slide-down">
              <div
                v-if="showHint"
                class="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
              >{{ question.hint }}</div>
            </Transition>
          </div>
        </div>

        <!-- SQL入力 -->
        <div class="bg-white rounded-2xl shadow p-5">
          <label class="block text-sm font-bold text-slate-700 mb-2">SQL を入力してください</label>
          <textarea
            v-model="sqlInput"
            rows="8"
            placeholder="SELECT ..."
            class="font-mono-code w-full bg-slate-900 text-green-300 rounded-xl p-4 text-sm outline-none ring-2 ring-slate-700 focus:ring-blue-500 transition-all resize-y"
          />
          <div class="flex justify-between items-center mt-3">
            <button
              class="text-sm text-slate-400 hover:text-slate-600 transition-colors"
              @click="sqlInput = ''"
            >クリア</button>
            <div class="flex gap-2">
              <button
                class="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold transition-colors disabled:opacity-40"
                :disabled="!isReady"
                @click="runSQL(false)"
              >実行のみ</button>
              <button
                class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow transition-colors disabled:opacity-40"
                :disabled="!isReady"
                @click="runSQL(true)"
              >▶ 回答する</button>
            </div>
          </div>
        </div>

        <!-- 実行結果 -->
        <Transition name="fade">
          <div v-if="hasResult" class="bg-white rounded-2xl shadow p-5 flex flex-col gap-4">
            <!-- 構文エラー -->
            <div v-if="execError" class="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p class="text-sm font-bold text-red-700 mb-1">⚠ 構文エラー</p>
              <p class="font-mono-code text-xs text-red-600 break-all">{{ execError }}</p>
            </div>

            <!-- 正誤バナー -->
            <div
              v-if="verdict"
              class="rounded-xl px-4 py-3 flex items-center gap-3"
              :class="verdict === 'correct' ? 'bg-green-50 border border-green-300'
                    : verdict === 'missing' ? 'bg-amber-50 border border-amber-300'
                    : 'bg-red-50 border border-red-300'"
            >
              <span class="text-2xl">{{ verdict === 'correct' ? '✅' : verdict === 'missing' ? '⚠️' : '❌' }}</span>
              <div>
                <p
                  class="font-bold text-sm"
                  :class="verdict === 'correct' ? 'text-green-700' : verdict === 'missing' ? 'text-amber-700' : 'text-red-700'"
                >
                  {{ verdict === 'correct' ? '正解！' : verdict === 'missing' ? '不正解（指定構文の未使用）' : '不正解' }}
                </p>
                <p
                  class="text-xs mt-0.5"
                  :class="verdict === 'correct' ? 'text-green-600' : verdict === 'missing' ? 'text-amber-600' : 'text-red-600'"
                >
                  <template v-if="verdict === 'correct'">期待通りの結果が返ってきました！</template>
                  <template v-else-if="verdict === 'missing'">
                    結果は合っていますが、この問題で指定された <strong>{{ missingLabels.join('・') }}</strong> が使われていません。
                  </template>
                  <template v-else>SQLの構文は正しいですが、結果が異なります。</template>
                </p>
              </div>
            </div>

            <!-- 結果テーブル -->
            <div v-if="!execError">
              <div class="flex items-center justify-between mb-1.5">
                <p class="text-sm font-bold text-slate-700">実行結果</p>
                <span class="text-xs text-slate-400">{{ rowCount }}</span>
              </div>
              <ResultTable :result="execResult" />
            </div>

            <!-- 模範解答（判定後は正解・不正解問わず常に表示） -->
            <div v-if="verdict" class="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p class="text-xs font-bold text-slate-500 mb-2">模範解答</p>
              <pre class="font-mono-code text-xs text-blue-800 whitespace-pre-wrap">{{ question.answer }}</pre>
            </div>
          </div>
        </Transition>

        <!-- 前後ナビ -->
        <div class="flex justify-between items-center pb-6">
          <NuxtLink
            v-if="adjacent.prevId"
            :to="`/questions/${adjacent.prevId}`"
            class="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-slate-700 text-sm font-semibold shadow-sm transition-colors"
          >← Q{{ adjacent.prevId }}</NuxtLink>
          <span v-else />
          <NuxtLink
            v-if="adjacent.nextId"
            :to="`/questions/${adjacent.nextId}`"
            class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow transition-colors"
          >Q{{ adjacent.nextId }} →</NuxtLink>
          <NuxtLink
            v-else
            to="/"
            class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold shadow-sm transition-colors"
          >← 問題一覧</NuxtLink>
        </div>
      </section>

      <!-- ====== 右カラム（テーブル参照 / ER図 タブ切り替え） ====== -->
      <section class="xl:col-span-3 flex flex-col gap-5">

        <!-- ヘッダー行：タブ + 問題一覧ボタン -->
        <div class="flex items-center justify-between">
          <!-- タブ -->
          <div class="flex gap-1 bg-slate-100 rounded-xl p-1">
            <button
              class="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
              :class="activeTab === 'tables'
                ? 'bg-white text-blue-600 shadow'
                : 'text-slate-500 hover:text-slate-700'"
              @click="activeTab = 'tables'"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
                <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
              </svg>
              テーブル参照
            </button>
            <button
              class="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
              :class="activeTab === 'er'
                ? 'bg-white text-blue-600 shadow'
                : 'text-slate-500 hover:text-slate-700'"
              @click="activeTab = 'er'"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
                <path d="M10 6.5h4M6.5 10v4M17.5 10v4M10 17.5h4" stroke-width="1.5" />
              </svg>
              ER 図
            </button>
          </div>

          <!-- 問題一覧ボタン -->
          <NuxtLink
            to="/"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold border border-slate-200 transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            問題一覧
          </NuxtLink>
        </div>

        <!-- タブコンテンツ -->
        <div class="bg-white rounded-2xl shadow p-5">
          <Transition name="tab-fade" mode="out-in">
            <!-- テーブル参照 -->
            <div v-if="activeTab === 'tables'" key="tables">
              <TablePreview />
            </div>

            <!-- ER図 -->
            <div v-else key="er">
              <div class="flex items-center gap-4 mb-4 text-xs text-slate-500">
                <span class="flex items-center gap-1">🔑 PRIMARY KEY</span>
                <span class="flex items-center gap-1">🔗 FOREIGN KEY</span>
                <span class="flex items-center gap-1 font-mono-code text-violet-600">
                  参照 → テーブル名
                </span>
              </div>
              <ErDiagram />
            </div>
          </Transition>
        </div>

      </section>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.22s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-5px); }
.slide-down-enter-to, .slide-down-leave-from { opacity: 1; transform: translateY(0); }

.accordion-enter-active, .accordion-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.accordion-enter-from, .accordion-leave-to { max-height: 0; opacity: 0; }
.accordion-enter-to, .accordion-leave-from { max-height: 2000px; opacity: 1; }</style>

<style scoped>
.tab-fade-enter-active, .tab-fade-leave-active { transition: opacity 0.15s ease; }
.tab-fade-enter-from, .tab-fade-leave-to { opacity: 0; }
</style>