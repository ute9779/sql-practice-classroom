<script setup lang="ts">
import { SITE } from '~/data/site'

useHead({ title: `プライバシー｜${SITE.name}` })
</script>

<template>
  <main class="max-w-3xl mx-auto px-4 py-12">
    <NuxtLink to="/" class="text-sm text-blue-600 hover:underline">← トップへ</NuxtLink>
    <h1 class="text-2xl font-bold text-slate-800 mt-4 mb-6">プライバシーについて</h1>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-5 text-sm text-slate-700 leading-relaxed">
      <section>
        <h2 class="font-bold text-slate-800 mb-1">入力したデータの扱い</h2>
        <p>
          入力した SQL やその実行結果は、すべてお使いのブラウザ内で処理されます。
          これらのデータがサーバーへ送信・保存されることはありません。
        </p>
      </section>

      <section>
        <h2 class="font-bold text-slate-800 mb-1">アクセス解析・Cookie</h2>
        <p>
          本サイトはアクセス解析ツールを使用しておらず、Cookie による追跡も行いません。
        </p>
      </section>

      <section>
        <h2 class="font-bold text-slate-800 mb-1">外部サービスへの接続</h2>
        <p>
          画面表示のため、Web フォント（Google Fonts）を外部から読み込みます。
          この際、フォント配信元に対して、お使いの端末の IP アドレスなどの接続情報が送られることがあります。
        </p>
      </section>
    </div>
  </main>
</template>
