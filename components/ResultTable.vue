<script setup lang="ts">
import type { SqlResult } from '~/composables/useDatabase'

const props = defineProps<{
  result: SqlResult
}>()
</script>

<template>
  <div v-if="result.length">
    <div class="table-scroll border border-slate-200 rounded-xl overflow-hidden">
      <table class="w-full text-xs">
        <thead>
          <tr class="bg-slate-700 text-white sticky top-0">
            <th
              v-for="col in result[0].columns"
              :key="col"
              class="px-3 py-2 text-left font-semibold whitespace-nowrap"
            >{{ col }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, ri) in result[0].values"
            :key="ri"
            class="hover:bg-blue-50 transition-colors"
            :class="ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'"
          >
            <td
              v-for="(cell, ci) in row"
              :key="ci"
              class="px-3 py-1.5 border-b border-slate-100 whitespace-nowrap"
            >
              <span v-if="cell === null" class="text-slate-300 italic">NULL</span>
              <span v-else>{{ cell }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div v-else class="text-xs text-slate-400 text-center py-4 border border-slate-200 rounded-xl">
    結果なし（0行）
  </div>
</template>
