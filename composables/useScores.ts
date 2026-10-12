import { QUESTIONS } from '~/data/questions'

const TOTAL = QUESTIONS.length  // 25

/** 全問のスコアをアプリ全体で共有するcomposable */
export function useScores() {
  // null=未回答 / true=正解 / false=不正解
  const scores = useState<(boolean | null)[]>('scores', () => Array(TOTAL).fill(null))

  const correctCount  = computed(() => scores.value.filter(s => s === true).length)
  const answeredCount = computed(() => scores.value.filter(s => s !== null).length)

  function setScore(index: number, value: boolean) {
    const next = [...scores.value]
    next[index] = value
    scores.value = next
  }

  function reset() {
    scores.value = Array(TOTAL).fill(null)
  }

  return { scores, correctCount, answeredCount, setScore, reset, total: TOTAL }
}
