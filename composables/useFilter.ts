import { QUESTIONS } from '~/data/questions'
import type { Level, Category } from '~/data/questions'

export type SortKey = 'id' | 'level'
export type SortDir = 'asc' | 'desc'

/** フィルター・ソート状態をアプリ全体で共有するcomposable */
export function useFilter() {
  const selectedLevels     = useState<Level[]>('filter:levels',     () => [])
  const selectedCategories = useState<Category[]>('filter:categories', () => [])
  const sortKey            = useState<SortKey>('filter:sortKey',    () => 'id')
  const sortDir            = useState<SortDir>('filter:sortDir',    () => 'asc')

  const LEVEL_ORDER: Record<Level, number> = { 初級: 1, 中級: 2, 上級: 3 }

  /** フィルター＋ソートを適用した問題リスト */
  const filteredQuestions = computed(() => {
    let list = [...QUESTIONS]

    if (selectedLevels.value.length > 0) {
      list = list.filter(q => selectedLevels.value.includes(q.level))
    }
    if (selectedCategories.value.length > 0) {
      list = list.filter(q => selectedCategories.value.includes(q.category))
    }

    list.sort((a, b) => {
      let diff = 0
      if (sortKey.value === 'id')    diff = a.id - b.id
      if (sortKey.value === 'level') diff = LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]
      return sortDir.value === 'asc' ? diff : -diff
    })

    return list
  })

  /** フィルター結果の中での前後問題IDを返す */
  function adjacentIds(currentId: number) {
    const list = filteredQuestions.value
    const idx  = list.findIndex(q => q.id === currentId)
    return {
      prevId: idx > 0               ? list[idx - 1].id : null,
      nextId: idx < list.length - 1 ? list[idx + 1].id : null,
    }
  }

  function toggleLevel(level: Level) {
    const cur = selectedLevels.value
    selectedLevels.value = cur.includes(level)
      ? cur.filter(l => l !== level)
      : [...cur, level]
  }

  function toggleCategory(cat: Category) {
    const cur = selectedCategories.value
    selectedCategories.value = cur.includes(cat)
      ? cur.filter(c => c !== cat)
      : [...cur, cat]
  }

  function clearFilters() {
    selectedLevels.value     = []
    selectedCategories.value = []
    sortKey.value = 'id'
    sortDir.value = 'asc'
  }

  const isFiltered = computed(() =>
    selectedLevels.value.length > 0 ||
    selectedCategories.value.length > 0 ||
    sortKey.value !== 'id' ||
    sortDir.value !== 'asc'
  )

  return {
    selectedLevels,
    selectedCategories,
    sortKey,
    sortDir,
    filteredQuestions,
    adjacentIds,
    toggleLevel,
    toggleCategory,
    clearFilters,
    isFiltered,
  }
}
