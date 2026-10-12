<script setup lang="ts">
const TABLES = [
  {
    name: 'classes',
    cols: [
      { name: 'class_id',   type: 'INTEGER', pk: true,  fk: '' },
      { name: 'grade',      type: 'INTEGER', pk: false, fk: '' },
      { name: 'class_name', type: 'TEXT',    pk: false, fk: '' },
      { name: 'homeroom',   type: 'TEXT',    pk: false, fk: '' },
    ],
  },
  {
    name: 'students',
    cols: [
      { name: 'student_id',    type: 'INTEGER', pk: true,  fk: '' },
      { name: 'name',          type: 'TEXT',    pk: false, fk: '' },
      { name: 'age',           type: 'INTEGER', pk: false, fk: '' },
      { name: 'class_id',      type: 'INTEGER', pk: false, fk: 'classes' },
      { name: 'admission',     type: 'TEXT',    pk: false, fk: '' },
      { name: 'birthday',      type: 'TEXT',    pk: false, fk: '' },
      { name: 'blood_type',    type: 'TEXT',    pk: false, fk: '' },
      { name: 'height_cm',     type: 'INTEGER', pk: false, fk: '' },
      { name: 'weight_kg',     type: 'INTEGER', pk: false, fk: '' },
      { name: 'dominant_hand', type: 'TEXT',    pk: false, fk: '' },
      { name: 'hometown',      type: 'TEXT',    pk: false, fk: '' },
      { name: 'residence',     type: 'TEXT',    pk: false, fk: '' },
    ],
  },
  {
    name: 'subjects',
    cols: [
      { name: 'subject_id',   type: 'INTEGER', pk: true,  fk: '' },
      { name: 'subject_name', type: 'TEXT',    pk: false, fk: '' },
      { name: 'category',     type: 'TEXT',    pk: false, fk: '' },
    ],
  },
  {
    name: 'scores',
    cols: [
      { name: 'score_id',   type: 'INTEGER', pk: true,  fk: '' },
      { name: 'student_id', type: 'INTEGER', pk: false, fk: 'students' },
      { name: 'subject_id', type: 'INTEGER', pk: false, fk: 'subjects' },
      { name: 'score',      type: 'INTEGER', pk: false, fk: '' },
      { name: 'term',       type: 'TEXT',    pk: false, fk: '' },
    ],
  },
  {
    name: 'clubs',
    cols: [
      { name: 'club_id',   type: 'INTEGER', pk: true,  fk: '' },
      { name: 'club_name', type: 'TEXT',    pk: false, fk: '' },
      { name: 'category',  type: 'TEXT',    pk: false, fk: '' },
    ],
  },
  {
    name: 'club_members',
    cols: [
      { name: 'member_id',  type: 'INTEGER', pk: true,  fk: '' },
      { name: 'student_id', type: 'INTEGER', pk: false, fk: 'students' },
      { name: 'club_id',    type: 'INTEGER', pk: false, fk: 'clubs' },
      { name: 'role',       type: 'TEXT',    pk: false, fk: '' },
    ],
  },
  {
    name: 'events',
    cols: [
      { name: 'event_id',   type: 'INTEGER', pk: true,  fk: '' },
      { name: 'event_name', type: 'TEXT',    pk: false, fk: '' },
      { name: 'event_date', type: 'TEXT',    pk: false, fk: '' },
      { name: 'location',   type: 'TEXT',    pk: false, fk: '' },
    ],
  },
]
</script>

<template>
  <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    <div
      v-for="table in TABLES"
      :key="table.name"
      class="rounded-xl border border-slate-200 overflow-hidden shadow-sm min-w-0"
    >
      <!-- ヘッダー -->
      <div class="px-3 py-2.5 flex items-center gap-2 bg-slate-700">
        <svg class="w-3.5 h-3.5 text-white/70 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
        </svg>
        <span class="text-white text-xs font-bold font-mono-code leading-tight break-all">{{ table.name }}</span>
      </div>

      <!-- カラム行 -->
      <div class="divide-y divide-slate-100">
        <div
          v-for="(col, i) in table.cols"
          :key="col.name"
          class="px-3 py-2"
          :class="i % 2 === 1 ? 'bg-slate-50' : 'bg-white'"
        >
          <!-- 1段目：アイコン + カラム名 -->
          <div class="flex items-center gap-1.5">
            <span class="shrink-0 text-sm leading-none">
              {{ col.pk ? '🔑' : col.fk ? '🔗' : '　' }}
            </span>
            <span
              class="font-mono-code text-xs font-semibold break-all"
              :class="col.pk ? 'text-amber-700' : col.fk ? 'text-violet-700' : 'text-slate-700'"
            >{{ col.name }}</span>
          </div>
          <!-- 2段目：型 + バッジ -->
          <div class="flex items-center gap-1.5 mt-1 pl-6 flex-wrap">
            <span class="text-xs text-slate-400 font-mono-code">{{ col.type }}</span>
            <span v-if="col.pk" class="text-xs font-bold px-1.5 py-0 rounded bg-amber-100 text-amber-700">PRIMARY KEY</span>
            <span v-if="col.fk" class="text-xs font-semibold px-1.5 py-0 rounded bg-violet-50 text-violet-600">参照 → {{ col.fk }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
