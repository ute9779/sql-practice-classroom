<script setup lang="ts">
import { QUESTIONS, CATEGORY_STYLE, LEVEL_STYLE } from '~/data/questions'
import type { Category, Level } from '~/data/questions'

// 問題データから内訳を集計（問題を増減しても自動で追従する）
const total = QUESTIONS.length
const categories = Object.keys(CATEGORY_STYLE) as Category[]
const levels = Object.keys(LEVEL_STYLE) as Level[]

const countByLevel = (lv: Level) => QUESTIONS.filter((q) => q.level === lv).length

// このサイトの特徴
const features = [
  {
    title: 'ブラウザだけで本物の SQL',
    desc: 'インストールや環境構築は不要。実際の SQLite エンジンがブラウザ内で動くので、書いたクエリがその場で実行されます。',
    icon: 'bolt',
  },
  {
    title: '結果を見て自動で採点',
    desc: '模範解答の実行結果と照らし合わせて正誤を判定。間違いの理由（列の不足・行数・並び順など）も教えてくれます。',
    icon: 'check',
  },
  {
    title: 'テーブルの変化が見える',
    desc: 'INSERT / UPDATE / DELETE では、どの行がどう変わったかを差分で表示。練習用のコピー上で動くので元データは壊れません。',
    icon: 'table',
  },
]
</script>

<template>
  <main>
    <!-- ヒーロー -->
    <section class="bg-gradient-to-b from-blue-50 to-slate-100">
      <div class="max-w-4xl mx-auto px-4 py-20 text-center">
        <span class="inline-block text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full mb-5">
          ブラウザで学ぶ SQL 演習サイト
        </span>
        <h1 class="text-4xl sm:text-5xl font-bold text-slate-800 leading-tight mb-4">
          SQL演習教室
        </h1>
        <p class="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-8">
          学園の業務データを題材に、SELECT から JOIN・集計・サブクエリ・DDL / DML まで。
          実際に手を動かして、全 {{ total }} 問を解きながら SQL を身につけましょう。
          <br>当サイトは<strong>登録不要・無料</strong>でご利用いただけます。
        </p>
        <NuxtLink
          to="/questions"
          class="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-base font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
        >
          問題一覧へ進む
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </NuxtLink>

        <!-- 難易度の内訳 -->
        <div class="flex items-center justify-center gap-2 mt-8 flex-wrap">
          <span
            v-for="lv in levels"
            :key="lv"
            class="text-xs font-semibold px-3 py-1 rounded-lg"
            :style="{ backgroundColor: LEVEL_STYLE[lv].bg, color: LEVEL_STYLE[lv].text }"
          >{{ lv }} {{ countByLevel(lv) }} 問</span>
        </div>


      </div>
    </section>

    <!-- 特徴 -->
    <section class="max-w-5xl mx-auto px-4 py-16">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="f in features"
          :key="f.title"
          class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-3"
        >
          <div class="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path v-if="f.icon === 'bolt'" d="M13 2L3 14h7l-1 8 10-12h-7z" />
              <template v-else-if="f.icon === 'check'">
                <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </template>
              <template v-else>
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
                <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
              </template>
            </svg>
          </div>
          <h2 class="text-lg font-bold text-slate-800">{{ f.title }}</h2>
          <p class="text-sm text-slate-600 leading-relaxed">{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <!-- 扱う分野 -->
    <section class="max-w-5xl mx-auto px-4 pb-16">
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
        <h2 class="text-xl font-bold text-slate-800 mb-1">扱う分野</h2>
        <p class="text-sm text-slate-500 mb-6">{{ categories.length }} カテゴリ・全 {{ total }} 問</p>
        <div class="flex flex-wrap items-center justify-center gap-2">
          <span
            v-for="cat in categories"
            :key="cat"
            class="text-sm font-semibold px-3.5 py-1.5 rounded-lg"
            :style="{ backgroundColor: CATEGORY_STYLE[cat].bg, color: CATEGORY_STYLE[cat].text }"
          >{{ cat }}</span>
        </div>

        <NuxtLink
          to="/questions"
          class="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow transition-colors"
        >
          さっそく始める
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
