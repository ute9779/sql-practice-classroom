<script setup lang="ts">
import { QUESTIONS } from '~/data/questions'
import { SITE } from '~/data/site'

useHead({ title: `このサイトについて｜${SITE.name}` })
const total = QUESTIONS.length
</script>

<template>
  <main class="max-w-3xl mx-auto px-4 py-12">
    <NuxtLink to="/" class="text-sm text-blue-600 hover:underline">← トップへ</NuxtLink>
    <h1 class="text-2xl font-bold text-slate-800 mt-4 mb-6">このサイトについて</h1>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-5 text-sm text-slate-700 leading-relaxed">
      <section>
        <h2 class="font-bold text-slate-800 mb-1">概要</h2>
        <p>
          {{ SITE.name }} は、学園の業務データを題材に SQL を練習できる学習サイトです。
          全 {{ total }} 問の問題に対して、実際にブラウザ上で SQL を書いて実行し、結果で正誤を確認できます。
        </p>
      </section>

      <section>
        <h2 class="font-bold text-slate-800 mb-1">使い方</h2>
        <ol class="list-decimal list-inside space-y-1">
          <li>問題一覧から、解きたい問題を選びます。</li>
          <li>SQL を入力し、「実行のみ」で結果を確認するか、「回答する」で採点します。</li>
          <li>間違えた場合は、理由の表示と模範解答を参考に、もう一度挑戦します。</li>
        </ol>
      </section>

      <section>
        <h2 class="font-bold text-slate-800 mb-1">仕組み</h2>
        <p>
          データベースには SQLite（sql.js / WebAssembly 版）を使っています。
          処理はすべてお使いのブラウザ内で完結し、入力した SQL がサーバーへ送信されることはありません。
          問題ごとに練習用のコピー上で実行するため、INSERT や DELETE を試してもデータは元の状態に戻ります。
        </p>
      </section>

      <section>
        <h2 class="font-bold text-slate-800 mb-1">動作環境</h2>
        <p>WebAssembly に対応した最新のブラウザが必要です。古いブラウザでは動作しないことがあります。</p>
      </section>

      <section>
        <h2 class="font-bold text-slate-800 mb-1">免責</h2>
        <p>
          本サイトは学習を目的としています。掲載内容の正確性・完全性や、サービスの可用性については保証しません。
          本サイトの利用により生じた損害について、運営者は責任を負いません。
        </p>
      </section>

      <section v-if="SITE.twitterUrl">
        <h2 class="font-bold text-slate-800 mb-1">お問い合わせ</h2>
        <p>
          不具合や要望は X（旧Twitter）
          <a :href="SITE.twitterUrl" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">こちら</a>
          までお知らせください。
        </p>
      </section>
    </div>
  </main>
</template>
