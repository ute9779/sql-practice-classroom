<script setup lang="ts">
import type { DbChanges, TableChange, IndexChange } from '~/utils/dbDiff'

// DDL / DML を実行したときの「データベースの変更」を表示する。
// 追加行は ＋、削除・更新前の行は － で示す（色だけに頼らない）。
const props = defineProps<{
  changes:   DbChanges | null
  /** 変更が何もなかった場合にも「変更なし」を表示するか（DDL/DML の問題で true） */
  showEmpty: boolean
}>()

const visible = computed(() =>
  !!props.changes &&
  (props.changes.items.length > 0 || props.changes.affectedRows > 0 || props.showEmpty)
)

const tables  = computed(() => (props.changes?.items.filter((i) => i.type === 'table') ?? []) as TableChange[])
const indexes = computed(() => (props.changes?.items.filter((i) => i.type === 'index') ?? []) as IndexChange[])

// 行の記号が出るテーブルがあるときだけ凡例を出す
const hasMarks = computed(() => tables.value.some((t) => t.rows.some((r) => r.mark !== ' ')))

function badge(t: TableChange): { label: string; cls: string } {
  const isView = t.kind === 'view'
  switch (t.change) {
    case 'created': return { label: isView ? 'ビューを作成' : 'テーブルを作成', cls: 'bg-green-100 text-green-700' }
    case 'dropped': return { label: isView ? 'ビューを削除' : 'テーブルを削除', cls: 'bg-red-100 text-red-700' }
    case 'altered': return { label: '列を変更',     cls: 'bg-amber-100 text-amber-700' }
    default:        return { label: 'データを変更', cls: 'bg-blue-100 text-blue-700' }
  }
}

// ── 列の絞り込み ──
// UPDATE で列が多いテーブルだと、変更した列が画面の右端に隠れてしまう。
// そこで「主キー・先頭の項目（名前など）・値が変わった列」だけを既定で表示し、切り替えで全列を出せるようにする。
// INSERT / DELETE は行全体が大事なので、絞り込まない。
const showAllCols = ref<Record<string, boolean>>({})
const tableKey = (t: TableChange) => `${t.kind}:${t.name}:${t.change}`

function compactCols(t: TableChange): number[] | null {
  if (t.change !== 'data') return null
  const changed = new Set<number>()
  t.rows.forEach((r) => r.changedCols.forEach((c) => changed.add(c)))
  if (changed.size === 0) return null   // 更新された行がない（追加・削除のみ）

  const keep = new Set<number>([...t.pkCols, ...changed])
  const firstLabel = t.columns.findIndex((_, i) => !t.pkCols.includes(i))
  if (firstLabel >= 0) keep.add(firstLabel)

  const idx = [...keep].sort((a, b) => a - b)
  return idx.length < t.columns.length ? idx : null
}

const isCompact = (t: TableChange) => compactCols(t) !== null && !showAllCols.value[tableKey(t)]
const visibleCols = (t: TableChange): number[] =>
  (isCompact(t) ? compactCols(t)! : t.columns.map((_, i) => i))

const rowClass = (mark: string) =>
  mark === '+' ? 'bg-green-50' : mark === '-' ? 'bg-red-50 text-slate-400 line-through' : 'bg-white'
const markText = (mark: string) => (mark === '+' ? '＋' : mark === '-' ? '－' : '')
const markLabel = (mark: string) =>
  mark === '+' ? '追加または更新後の行' : mark === '-' ? '削除または更新前の行' : ''
</script>

<template>
  <div v-if="visible && changes" class="flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <p class="text-sm font-bold text-slate-700">データベースの変更</p>
      <span v-if="changes.affectedRows > 0" class="text-xs font-semibold text-blue-600">
        {{ changes.affectedRows }} 行に影響
      </span>
    </div>

    <!-- 変更なし -->
    <p
      v-if="changes.items.length === 0"
      class="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 leading-relaxed"
    >
      <template v-if="changes.affectedRows > 0">
        {{ changes.affectedRows }} 行が対象になりましたが、値は変わりませんでした。
      </template>
      <template v-else>
        データベースに変更はありませんでした。UPDATE / DELETE の場合は、WHERE の条件に一致する行があるか確認してください。
      </template>
    </p>

    <!-- 凡例 -->
    <p v-if="hasMarks" class="text-xs text-slate-500">
      <span class="font-bold text-green-700">＋</span> 追加・更新後　
      <span class="font-bold text-red-700">－</span> 削除・更新前
    </p>

    <!-- テーブル・ビューの変更 -->
    <div
      v-for="t in tables"
      :key="t.kind + t.name + t.change"
      class="border border-slate-200 rounded-xl overflow-hidden"
    >
      <div class="flex items-center gap-2 px-4 py-2.5 bg-slate-50">
        <span class="text-sm font-bold text-slate-700 font-mono-code">{{ t.name }}</span>
        <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :class="badge(t).cls">{{ badge(t).label }}</span>
      </div>

      <p v-if="t.change === 'dropped'" class="px-4 py-3 text-xs text-slate-500">
        {{ t.kind === 'view' ? 'ビュー' : 'テーブル' }} {{ t.name }} は削除されました。
      </p>

      <template v-else>
        <p v-if="t.addedColumns.length || t.removedColumns.length" class="px-4 pt-3 text-xs text-slate-600">
          <span v-if="t.addedColumns.length">追加された列: <strong class="text-amber-700">{{ t.addedColumns.join(', ') }}</strong></span>
          <span v-if="t.removedColumns.length" class="ml-3">削除された列: <strong class="text-red-700">{{ t.removedColumns.join(', ') }}</strong></span>
        </p>

        <!-- 列の絞り込み中は、その旨と切り替えボタンを出す -->
        <p v-if="compactCols(t)" class="flex items-center justify-between gap-2 px-4 py-2.5 text-xs text-slate-500">
          <span v-if="isCompact(t)">変更のあった列だけ表示しています（全 {{ t.columns.length }} 列中 {{ visibleCols(t).length }} 列）</span>
          <span v-else>すべての列を表示しています</span>
          <button
            type="button"
            class="font-semibold text-blue-600 hover:underline shrink-0"
            :aria-pressed="!!showAllCols[tableKey(t)]"
            @click="showAllCols[tableKey(t)] = !showAllCols[tableKey(t)]"
          >{{ isCompact(t) ? 'すべての列を表示' : '変更のあった列だけ表示' }}</button>
        </p>

        <div v-if="t.rows.length" class="overflow-x-auto max-h-72 overflow-y-auto">
          <table class="w-full text-xs border-collapse">
            <thead>
              <tr class="bg-slate-700 text-white sticky top-0 z-10">
                <th class="w-6 px-2 py-2"><span class="sr-only">変更の種類</span></th>
                <th
                  v-for="ci in visibleCols(t)"
                  :key="t.columns[ci]"
                  class="px-3 py-2 text-left font-semibold whitespace-nowrap"
                  :class="t.addedColumns.includes(t.columns[ci]) ? 'bg-amber-600' : ''"
                >{{ t.columns[ci] }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, ri) in t.rows" :key="ri" :class="rowClass(row.mark)">
                <td
                  class="px-2 py-1.5 text-center font-bold border-b border-slate-100 no-underline"
                  :class="row.mark === '+' ? 'text-green-700' : 'text-red-700'"
                >
                  <span :aria-label="markLabel(row.mark)">{{ markText(row.mark) }}</span>
                </td>
                <td
                  v-for="ci in visibleCols(t)"
                  :key="ci"
                  class="px-3 py-1.5 border-b border-slate-100 whitespace-nowrap"
                  :class="row.changedCols.includes(ci) ? 'bg-green-200 font-bold text-green-900' : ''"
                >
                  <span v-if="row.values[ci] === null" class="text-slate-300 italic">NULL</span>
                  <span v-else>{{ row.values[ci] }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else-if="t.change === 'created'" class="px-4 py-3 text-xs text-slate-500">
          データはまだありません（0行）。
        </p>

        <p v-if="t.omitted > 0 || t.unchanged > 0" class="px-4 py-2 text-xs text-slate-400 border-t border-slate-100">
          <span v-if="t.omitted > 0">ほか {{ t.omitted }} 行（表示を省略）</span>
          <span v-if="t.omitted > 0 && t.unchanged > 0">　</span>
          <span v-if="t.unchanged > 0">変更のない行: {{ t.unchanged }} 行</span>
        </p>
      </template>
    </div>

    <!-- インデックスの変更 -->
    <div
      v-for="ix in indexes"
      :key="ix.name + ix.change"
      class="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 text-xs text-slate-600"
    >
      <span class="font-bold font-mono-code text-slate-700">{{ ix.name }}</span>
      <span
        class="font-semibold px-2 py-0.5 rounded-full"
        :class="ix.change === 'created' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
      >インデックスを{{ ix.change === 'created' ? '作成' : '削除' }}</span>
      <span>{{ ix.table }}({{ ix.columns.join(', ') }})</span>
    </div>

    <p class="text-xs text-slate-400 leading-relaxed">
      ※ 練習用のコピー上で実行しています。元のデータは変わらず、実行のたびに最初の状態から始まります。
    </p>
  </div>
</template>
