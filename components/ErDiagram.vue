<script setup lang="ts">
const TABLES = [
  {
    name: 'departments',
    cols: [
      { name: 'dept_id',   type: 'INTEGER', pk: true,  fk: '' },
      { name: 'dept_name', type: 'TEXT',    pk: false, fk: '' },
      { name: 'est_year',  type: 'INTEGER', pk: false, fk: '' },
    ],
  },
  {
    name: 'teachers',
    cols: [
      { name: 'teacher_id', type: 'INTEGER', pk: true,  fk: '' },
      { name: 'name',       type: 'TEXT',    pk: false, fk: '' },
      { name: 'dept_id',    type: 'INTEGER', pk: false, fk: 'departments' },
      { name: 'hire_date',  type: 'TEXT',    pk: false, fk: '' },
      { name: 'is_active',  type: 'INTEGER', pk: false, fk: '' },
    ],
  },
  {
    name: 'classrooms',
    cols: [
      { name: 'classroom_id', type: 'INTEGER', pk: true,  fk: '' },
      { name: 'grade',        type: 'INTEGER', pk: false, fk: '' },
      { name: 'class_label',  type: 'TEXT',    pk: false, fk: '' },
      { name: 'dept_id',      type: 'INTEGER', pk: false, fk: 'departments' },
      { name: 'teacher_id',   type: 'INTEGER', pk: false, fk: 'teachers' },
    ],
  },
  {
    name: 'students',
    cols: [
      { name: 'student_id',   type: 'INTEGER', pk: true,  fk: '' },
      { name: 'name',         type: 'TEXT',    pk: false, fk: '' },
      { name: 'classroom_id', type: 'INTEGER', pk: false, fk: 'classrooms' },
      { name: 'enroll_year',  type: 'INTEGER', pk: false, fk: '' },
      { name: 'birth_date',   type: 'TEXT',    pk: false, fk: '' },
      { name: 'gender',       type: 'TEXT',    pk: false, fk: '' },
      { name: 'status',       type: 'TEXT',    pk: false, fk: '' },
    ],
  },
  {
    name: 'subjects',
    cols: [
      { name: 'subject_id',   type: 'INTEGER', pk: true,  fk: '' },
      { name: 'subject_name', type: 'TEXT',    pk: false, fk: '' },
      { name: 'category',     type: 'TEXT',    pk: false, fk: '' },
      { name: 'credits',      type: 'INTEGER', pk: false, fk: '' },
      { name: 'is_required',  type: 'INTEGER', pk: false, fk: '' },
    ],
  },
  {
    name: 'teacher_subjects',
    cols: [
      { name: 'ts_id',      type: 'INTEGER', pk: true,  fk: '' },
      { name: 'teacher_id', type: 'INTEGER', pk: false, fk: 'teachers' },
      { name: 'subject_id', type: 'INTEGER', pk: false, fk: 'subjects' },
    ],
  },
  {
    name: 'exams',
    cols: [
      { name: 'exam_id',   type: 'INTEGER', pk: true,  fk: '' },
      { name: 'exam_name', type: 'TEXT',    pk: false, fk: '' },
      { name: 'exam_type', type: 'TEXT',    pk: false, fk: '' },
      { name: 'term',      type: 'TEXT',    pk: false, fk: '' },
      { name: 'exam_date', type: 'TEXT',    pk: false, fk: '' },
    ],
  },
  {
    name: 'exam_results',
    cols: [
      { name: 'result_id',  type: 'INTEGER', pk: true,  fk: '' },
      { name: 'exam_id',    type: 'INTEGER', pk: false, fk: 'exams' },
      { name: 'student_id', type: 'INTEGER', pk: false, fk: 'students' },
      { name: 'subject_id', type: 'INTEGER', pk: false, fk: 'subjects' },
      { name: 'score',      type: 'INTEGER', pk: false, fk: '' },
    ],
  },
  {
    name: 'attendances',
    cols: [
      { name: 'attendance_id', type: 'INTEGER', pk: true,  fk: '' },
      { name: 'student_id',    type: 'INTEGER', pk: false, fk: 'students' },
      { name: 'attend_date',   type: 'TEXT',    pk: false, fk: '' },
      { name: 'status',        type: 'TEXT',    pk: false, fk: '' },
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
          <div class="flex items-center gap-1.5">
            <span class="shrink-0 text-sm leading-none">
              {{ col.pk ? '🔑' : col.fk ? '🔗' : '　' }}
            </span>
            <span
              class="font-mono-code text-xs font-semibold break-all"
              :class="col.pk ? 'text-amber-700' : col.fk ? 'text-violet-700' : 'text-slate-700'"
            >{{ col.name }}</span>
          </div>
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
