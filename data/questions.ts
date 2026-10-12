export type SqlResult = { columns: string[]; values: (string | number | null)[][] }[]

export type Level    = '初級' | '中級' | '上級'
export type Category =
  | 'SELECT' | 'WHERE' | '集計' | 'JOIN' | 'サブクエリ' | 'DDL' | 'DML'

export interface Question {
  id:               number
  level:            Level
  category:         Category
  title:            string
  desc:             string
  hint:             string
  answer:           string
  /** 指定構文チェック: SQLに含まれていなければならないキーワード（大文字で判定） */
  requiredKeywords?: { keyword: string; label: string }[]
  validate:         (res: SqlResult) => boolean
}

export const CATEGORY_STYLE: Record<Category, { bg: string; text: string }> = {
  'SELECT':   { bg: '#dbeafe', text: '#1d4ed8' },
  'WHERE':    { bg: '#cffafe', text: '#0e7490' },
  '集計':     { bg: '#f3e8ff', text: '#7e22ce' },
  'JOIN':     { bg: '#ccfbf1', text: '#0f766e' },
  'サブクエリ': { bg: '#e0e7ff', text: '#3730a3' },
  'DDL':      { bg: '#ffedd5', text: '#c2410c' },
  'DML':      { bg: '#ffe4e6', text: '#be123c' },
}

export const LEVEL_STYLE: Record<Level, { bg: string; text: string }> = {
  初級: { bg: '#e0f2fe', text: '#0369a1' },
  中級: { bg: '#dcfce7', text: '#15803d' },
  上級: { bg: '#fee2e2', text: '#b91c1c' },
}

export const QUESTIONS: Question[] = [

  // ══ 選択 ══
  {
    id: 1, level: '初級', category: 'SELECT',
    title: '全生徒の一覧を取得する',
    desc: 'students テーブルから、全ての生徒の student_id, name, age, hometown を取得してください。',
    hint: 'SELECT 列名, ... FROM テーブル名',
    answer: 'SELECT student_id, name, age, hometown\nFROM students;',
    validate: (res) => {
      if (!res?.length) return false
      const cols = res[0].columns.map(c => c.toLowerCase())
      return cols.includes('student_id') && cols.includes('name') &&
             cols.includes('age') && cols.includes('hometown') &&
             res[0].values.length === 14
    },
  },

  // ══ 絞り込み ══
  {
    id: 2, level: '初級', category: 'WHERE',
    title: '寮に住んでいる生徒を取得する',
    desc: "students テーブルから、residence が「寮」の生徒の name と hometown を全て取得してください。",
    hint: "WHERE residence = '寮'",
    answer: "SELECT name, hometown\nFROM students\nWHERE residence = '寮';",
    validate: (res) => {
      if (!res?.length) return false
      const cols = res[0].columns.map(c => c.toLowerCase())
      return cols.includes('name') && cols.includes('hometown') && res[0].values.length === 10
    },
  },

  // ══ 比較・論理演算子 ══
  {
    id: 3, level: '初級', category: 'WHERE',
    title: '身長が160cm以上の生徒を取得する',
    desc: 'students テーブルから、height_cm が 160 以上の生徒の name と height_cm を取得してください。',
    hint: '>= 演算子を使います。',
    answer: 'SELECT name, height_cm\nFROM students\nWHERE height_cm >= 160;',
    validate: (res) => {
      if (!res?.length) return false
      const cols = res[0].columns.map(c => c.toLowerCase())
      return cols.includes('name') && cols.includes('height_cm') &&
             res[0].values.length === 7 &&
             res[0].values.every(r => (r[1] as number) >= 160)
    },
  },
  {
    id: 4, level: '初級', category: 'WHERE',
    title: '外部生かつ17歳の生徒を取得する',
    desc: "students テーブルから、admission が '外部生' かつ age が 17 の生徒の name を取得してください。",
    hint: 'AND で複数の条件を組み合わせます。',
    answer: "SELECT name\nFROM students\nWHERE admission = '外部生'\n  AND age = 17;",
    validate: (res) => {
      if (!res?.length) return false
      const cols = res[0].columns.map(c => c.toLowerCase())
      // 外部生かつ17歳は 姫崎 莉波・有村 麻央 の2名
      const names = res[0].values.map(r => r[0])
      return cols.includes('name') && res[0].values.length === 2 &&
             names.includes('姫崎 莉波') && names.includes('有村 麻央')
    },
  },
  {
    id: 5, level: '初級', category: 'WHERE',
    title: '1年生または3年生の生徒を取得する',
    desc: 'students テーブルと classes テーブルを見ると、class_id 1〜2 が1年生、class_id 3 が3年生です。\nstudents テーブルから、class_id が 1 または 3 の生徒の name と class_id を取得してください。',
    hint: 'OR で条件を並べます。',
    answer: 'SELECT name, class_id\nFROM students\nWHERE class_id = 1\n   OR class_id = 3;',
    validate: (res) => {
      if (!res?.length) return false
      const cols = res[0].columns.map(c => c.toLowerCase())
      return cols.includes('name') && cols.includes('class_id') &&
             res[0].values.length === 9 &&
             res[0].values.every(r => r[1] === 1 || r[1] === 3)
    },
  },
  {
    id: 6, level: '初級', category: 'WHERE',
    title: '右利き以外の生徒を取得する',
    desc: "students テーブルから、dominant_hand が '右' 以外の生徒の name と dominant_hand を取得してください。",
    hint: '<> 演算子を使います。',
    answer: "SELECT name, dominant_hand\nFROM students\nWHERE dominant_hand <> '右';",
    validate: (res) => {
      if (!res?.length) return false
      const cols = res[0].columns.map(c => c.toLowerCase())
      // 右以外は 左3名(咲季/清夏/広) + 両1名(星南) = 4名。NULL(賀陽)は <> では除外される
      return cols.includes('name') && cols.includes('dominant_hand') &&
             res[0].values.length === 4 &&
             res[0].values.every(r => r[1] !== '右' && r[1] !== null)
    },
  },

  // ══ 特殊演算子 ══
  {
    id: 7, level: '初級', category: 'WHERE',
    title: 'IN で複数の血液型を絞り込む',
    desc: "students テーブルから、blood_type が 'A' または 'AB' の生徒の name と blood_type を取得してください。IN 演算子を使ってください。",
    hint: "WHERE blood_type IN ('A', 'AB')",
    answer: "SELECT name, blood_type\nFROM students\nWHERE blood_type IN ('A', 'AB');",
    requiredKeywords: [{ keyword: 'IN', label: 'IN 演算子' }],
    validate: (res) => {
      if (!res?.length) return false
      const cols = res[0].columns.map(c => c.toLowerCase())
      return cols.includes('name') && cols.includes('blood_type') &&
             res[0].values.length === 8 &&
             res[0].values.every(r => r[1] === 'A' || r[1] === 'AB')
    },
  },
  {
    id: 8, level: '初級', category: 'WHERE',
    title: 'BETWEEN で身長の範囲を絞り込む',
    desc: 'students テーブルから、height_cm が 155 以上 165 以下の生徒の name と height_cm を取得してください。BETWEEN 演算子を使ってください。',
    hint: 'WHERE height_cm BETWEEN 155 AND 165',
    answer: 'SELECT name, height_cm\nFROM students\nWHERE height_cm BETWEEN 155 AND 165;',
    requiredKeywords: [{ keyword: 'BETWEEN', label: 'BETWEEN 演算子' }],
    validate: (res) => {
      if (!res?.length) return false
      const cols = res[0].columns.map(c => c.toLowerCase())
      return cols.includes('name') && cols.includes('height_cm') &&
             res[0].values.length === 7 &&
             res[0].values.every(r => (r[1] as number) >= 155 && (r[1] as number) <= 165)
    },
  },
  {
    id: 9, level: '初級', category: 'WHERE',
    title: 'LIKE で名前を部分一致検索する',
    desc: "students テーブルから、name が「花海」で始まる生徒の name を全て取得してください。LIKE 演算子を使ってください。",
    hint: "WHERE name LIKE '花海%'",
    answer: "SELECT name\nFROM students\nWHERE name LIKE '花海%';",
    requiredKeywords: [{ keyword: 'LIKE', label: 'LIKE 演算子' }],
    validate: (res) => {
      if (!res?.length) return false
      const cols = res[0].columns.map(c => c.toLowerCase())
      return cols.includes('name') && res[0].values.length === 2 &&
             res[0].values.every(r => String(r[0]).startsWith('花海'))
    },
  },
  {
    id: 10, level: '初級', category: 'WHERE',
    title: 'IS NULL でクラス未所属の生徒を取得する',
    desc: 'students テーブルから、class_id が NULL（クラス未所属）の生徒の name を取得してください。IS NULL を使ってください。',
    hint: 'WHERE class_id IS NULL',
    answer: 'SELECT name\nFROM students\nWHERE class_id IS NULL;',
    requiredKeywords: [{ keyword: 'IS NULL', label: 'IS NULL' }],
    validate: (res) => {
      if (!res?.length) return false
      const cols = res[0].columns.map(c => c.toLowerCase())
      // class_id が NULL なのは 賀陽 燐羽 の1名
      return cols.includes('name') && res[0].values.length === 1 &&
             res[0].values[0][0] === '賀陽 燐羽'
    },
  },

  // ══ 集計関数 ══
  {
    id: 11, level: '初級', category: '集計',
    title: '生徒数・最高身長・平均体重を求める',
    desc: 'students テーブルから、全生徒数（total）・最高身長（max_height）・平均体重（avg_weight）を1行で取得してください。',
    hint: 'COUNT(*), MAX(), AVG() を使います。AS で列名を付けましょう。',
    answer: 'SELECT COUNT(*) AS total,\n       MAX(height_cm) AS max_height,\n       AVG(weight_kg) AS avg_weight\nFROM students;',
    validate: (res) => {
      if (!res?.length) return false
      const row = res[0].values[0]
      // total=14, max_height=170 を厳密チェック
      return res[0].values.length === 1 && row.includes(14) && row.includes(170)
    },
  },
  {
    id: 12, level: '初級', category: '集計',
    title: '音楽の合計点と平均点を求める',
    desc: 'scores テーブルから、subject_id が 6（音楽）の合計点（total_score）と平均点（avg_score）を取得してください。',
    hint: 'SUM() と AVG() を使います。WHERE で subject_id を絞り込みましょう。',
    answer: 'SELECT SUM(score) AS total_score, AVG(score) AS avg_score\nFROM scores\nWHERE subject_id = 6;',
    validate: (res) => {
      if (!res?.length) return false
      // 音楽(subject_id=6)の合計は 823 を厳密チェック
      return res[0].values.length === 1 && res[0].values[0].includes(823)
    },
  },

  // ══ グループ化 ══
  {
    id: 13, level: '初級', category: '集計',
    title: 'クラスごとの生徒数を集計する',
    desc: 'students テーブルから class_id ごとの生徒数を集計し、class_id と student_count という名前で表示してください（class_id が NULL の生徒も1グループとして含みます）。',
    hint: 'GROUP BY class_id と COUNT(*) を使います。',
    answer: 'SELECT class_id, COUNT(*) AS student_count\nFROM students\nGROUP BY class_id;',
    validate: (res) => {
      if (!res?.length) return false
      const cols = res[0].columns.map(c => c.toLowerCase())
      return cols.some(c => c.includes('count') || c === 'student_count') && res[0].values.length === 4
    },
  },
  {
    id: 14, level: '初級', category: '集計',
    title: '部活カテゴリごとの部活数を集計する',
    desc: 'clubs テーブルから category ごとの部活数（club_count）を求めてください。',
    hint: 'GROUP BY category と COUNT(*) を使います。',
    answer: 'SELECT category, COUNT(*) AS club_count\nFROM clubs\nGROUP BY category;',
    validate: (res) => {
      if (!res?.length) return false
      const cols = res[0].columns.map(c => c.toLowerCase())
      // 部活カテゴリは 音楽/芸術/運動/文化 の4種類
      return cols.some(c => c === 'category') && cols.some(c => c.includes('count')) &&
             res[0].values.length === 4
    },
  },
  {
    id: 15, level: '中級', category: '集計',
    title: '平均点が80点以上の教科を抽出する',
    desc: 'scores テーブルから subject_id ごとに平均点を計算し、平均点が 80 以上の subject_id と avg_score を取得してください。',
    hint: 'HAVING AVG(score) >= 80',
    answer: 'SELECT subject_id, AVG(score) AS avg_score\nFROM scores\nGROUP BY subject_id\nHAVING AVG(score) >= 80;',
    requiredKeywords: [{ keyword: 'HAVING', label: 'HAVING 句' }],
    validate: (res) => {
      if (!res?.length) return false
      const cols = res[0].columns.map(c => c.toLowerCase())
      // 平均80以上は7教科
      return cols.includes('subject_id') &&
             res[0].values.length === 7 &&
             res[0].values.every(r => (r[1] as number) >= 80)
    },
  },

  // ══ 並び替え・名前付け ══
  {
    id: 16, level: '初級', category: 'SELECT',
    title: '身長が高い順に生徒を並べる',
    desc: 'students テーブルから name と height_cm を取得し、height_cm の高い順に並べてください。',
    hint: 'ORDER BY height_cm DESC',
    answer: 'SELECT name, height_cm\nFROM students\nORDER BY height_cm DESC;',
    validate: (res) => {
      if (!res?.length) return false
      const cols = res[0].columns.map(c => c.toLowerCase())
      if (!cols.includes('name') || !cols.includes('height_cm')) return false
      const vals = res[0].values
      if (vals.length !== 14) return false
      for (let i = 0; i < vals.length - 1; i++) {
        if ((vals[i][1] as number) < (vals[i + 1][1] as number)) return false
      }
      return true
    },
  },
  {
    id: 17, level: '初級', category: 'SELECT',
    title: '列に別名を付けて取得する',
    desc: 'students テーブルから name を「生徒名」、hometown を「出身地」という別名で取得してください。',
    hint: 'SELECT name AS 生徒名, hometown AS 出身地',
    answer: 'SELECT name AS 生徒名, hometown AS 出身地\nFROM students;',
    validate: (res) => {
      if (!res?.length) return false
      const cols = res[0].columns
      return cols.includes('生徒名') && cols.includes('出身地') && res[0].values.length === 14
    },
  },
  {
    id: 18, level: '中級', category: 'SELECT',
    title: '複数列で並び替える',
    desc: 'students テーブルから name, class_id, height_cm を取得し、class_id の昇順・同じ class_id 内では height_cm の降順で並べてください。',
    hint: 'ORDER BY class_id ASC, height_cm DESC',
    answer: 'SELECT name, class_id, height_cm\nFROM students\nORDER BY class_id ASC, height_cm DESC;',
    validate: (res) => {
      if (!res?.length) return false
      const vals = res[0].values
      if (vals.length !== 14) return false
      // class_id は NULL が先頭（SQLiteのASCではNULLが最小）。NULL を -Infinity 扱いで比較
      const cid = (v: unknown) => (v === null ? -Infinity : (v as number))
      for (let i = 0; i < vals.length - 1; i++) {
        const ca = cid(vals[i][1])
        const cb = cid(vals[i + 1][1])
        if (ca > cb) return false
        if (ca === cb && (vals[i][2] as number) < (vals[i + 1][2] as number)) return false
      }
      return true
    },
  },

  // ══ 結合 ══
  {
    id: 19, level: '中級', category: 'JOIN',
    title: '生徒とクラス名を内部結合する',
    desc: 'students と classes を INNER JOIN し、生徒の name と所属する class_name, grade を取得してください。',
    hint: 'INNER JOIN classes c ON s.class_id = c.class_id',
    answer: 'SELECT s.name, c.class_name, c.grade\nFROM students s\nINNER JOIN classes c ON s.class_id = c.class_id;',
    validate: (res) => {
      if (!res?.length) return false
      const cols = res[0].columns.map(c => c.toLowerCase())
      return cols.some(c => c === 'name') && cols.some(c => c.includes('class_name')) && res[0].values.length === 13
    },
  },
  {
    id: 20, level: '中級', category: 'JOIN',
    title: '生徒と成績を内部結合する',
    desc: 'students と scores を INNER JOIN し、生徒の name・教科 subject_id・点数 score を取得してください。',
    hint: 'INNER JOIN scores sc ON s.student_id = sc.student_id',
    answer: 'SELECT s.name, sc.subject_id, sc.score\nFROM students s\nINNER JOIN scores sc ON s.student_id = sc.student_id;',
    validate: (res) => {
      if (!res?.length) return false
      const cols = res[0].columns.map(c => c.toLowerCase())
      return cols.some(c => c === 'name') && cols.some(c => c.includes('score')) && res[0].values.length === 65
    },
  },
  {
    id: 21, level: '初級', category: 'JOIN',
    title: '自然結合で生徒とクラスを結合する',
    desc: 'NATURAL JOIN を使って students と classes を結合し、name と class_name を取得してください。',
    hint: 'NATURAL JOIN は ON 句なしで同名の列（class_id）を自動的に結合条件にします。',
    answer: 'SELECT name, class_name\nFROM students\nNATURAL JOIN classes;',
    requiredKeywords: [{ keyword: 'NATURAL JOIN', label: 'NATURAL JOIN' }],
    validate: (res) => {
      if (!res?.length) return false
      const cols = res[0].columns.map(c => c.toLowerCase())
      return cols.some(c => c === 'name') && cols.some(c => c.includes('class_name'))
    },
  },
  {
    id: 22, level: '中級', category: 'JOIN',
    title: '生徒・成績・教科名を3テーブル結合する',
    desc: 'students, scores, subjects の3テーブルを結合し、生徒名（name）・教科名（subject_name）・点数（score）を取得してください。',
    hint: 'students → scores → subjects の順に JOIN します。',
    answer: 'SELECT s.name, sub.subject_name, sc.score\nFROM students s\nINNER JOIN scores sc ON s.student_id = sc.student_id\nINNER JOIN subjects sub ON sc.subject_id = sub.subject_id;',
    validate: (res) => {
      if (!res?.length) return false
      const cols = res[0].columns.map(c => c.toLowerCase())
      return cols.some(c => c === 'name') &&
             cols.some(c => c.includes('subject_name')) &&
             cols.some(c => c === 'score') &&
             res[0].values.length === 65
    },
  },
  {
    id: 23, level: '中級', category: 'JOIN',
    title: '部活に所属していない生徒を見つける',
    desc: '一度も部活に所属していない生徒の name を取得してください。LEFT JOIN と IS NULL を組み合わせて解きましょう。',
    hint: 'LEFT JOIN club_members cm ON s.student_id = cm.student_id WHERE cm.member_id IS NULL',
    answer: 'SELECT s.name\nFROM students s\nLEFT JOIN club_members cm ON s.student_id = cm.student_id\nWHERE cm.member_id IS NULL;',
    requiredKeywords: [{ keyword: 'LEFT JOIN', label: 'LEFT JOIN' }, { keyword: 'IS NULL', label: 'IS NULL' }],
    validate: (res) => {
      return Array.isArray(res)
    },
  },
  {
    id: 24, level: '上級', category: 'JOIN',
    title: '生徒・部活・クラスを4テーブル結合する',
    desc: 'students, club_members, clubs, classes の4テーブルを結合し、生徒名（name）・クラス名（class_name）・部活名（club_name）・役割（role）を取得してください。',
    hint: 'students → club_members → clubs と students → classes をそれぞれ JOIN します。',
    answer: 'SELECT s.name, c.class_name, cl.club_name, cm.role\nFROM students s\nINNER JOIN classes c ON s.class_id = c.class_id\nINNER JOIN club_members cm ON s.student_id = cm.student_id\nINNER JOIN clubs cl ON cm.club_id = cl.club_id;',
    validate: (res) => {
      if (!res?.length) return false
      const cols = res[0].columns.map(c => c.toLowerCase())
      return cols.some(c => c === 'name') && cols.some(c => c.includes('class_name')) &&
             cols.some(c => c.includes('club_name')) && cols.some(c => c.includes('role'))
    },
  },
  {
    id: 25, level: '上級', category: 'JOIN',
    title: '同じクラスの生徒ペアを取得する',
    desc: 'students テーブルを自己結合（self join）して、同じ class_id に所属する生徒の全組み合わせを取得してください。\n同じ人どうしや逆順の重複を避けるため、s1.student_id < s2.student_id という条件を付けてください。\n取得列: s1.name（name1）、s2.name（name2）、class_id',
    hint: '同じテーブルに s1・s2 の2つの別名を付けて INNER JOIN し、\nON の条件に s1.class_id = s2.class_id AND s1.student_id < s2.student_id を指定します。',
    answer: 'SELECT s1.name AS name1, s2.name AS name2, s1.class_id\nFROM students s1\nINNER JOIN students s2\n  ON s1.class_id = s2.class_id\n AND s1.student_id < s2.student_id;',
    requiredKeywords: [{ keyword: 'JOIN', label: 'JOIN（自己結合）' }],
    validate: (res) => {
      if (!res?.length) return false
      return res[0].values.length > 0
    },
  },
  {
    id: 26, level: '上級', category: 'JOIN',
    title: '生徒・成績・教科・クラスを4テーブル結合する',
    desc: 'students, scores, subjects, classes の4テーブルを結合し、生徒名・クラス名・教科名・点数を取得してください。',
    hint: 'students を起点に scores, subjects, classes を順番に JOIN します。',
    answer: 'SELECT s.name, c.class_name, sub.subject_name, sc.score\nFROM students s\nINNER JOIN classes c ON s.class_id = c.class_id\nINNER JOIN scores sc ON s.student_id = sc.student_id\nINNER JOIN subjects sub ON sc.subject_id = sub.subject_id;',
    validate: (res) => {
      if (!res?.length) return false
      const cols = res[0].columns.map(c => c.toLowerCase())
      return cols.some(c => c === 'name') && cols.some(c => c.includes('class')) &&
             cols.some(c => c.includes('subject')) && cols.some(c => c === 'score')
    },
  },

  // ══ 副問い合わせ ══
  {
    id: 27, level: '中級', category: 'サブクエリ',
    title: '音楽で最高点を取った生徒を取得する',
    desc: 'scores テーブルから、subject_id が 6（音楽）で score が最高点の生徒の student_id と score を取得してください。サブクエリを使うこと。',
    hint: 'WHERE score = (SELECT MAX(score) FROM scores WHERE subject_id = 6)',
    answer: 'SELECT student_id, score\nFROM scores\nWHERE subject_id = 6\n  AND score = (SELECT MAX(score) FROM scores WHERE subject_id = 6);',
    requiredKeywords: [{ keyword: '(SELECT', label: 'サブクエリ' }],
    validate: (res) => {
      if (!res?.length) return false
      return res[0].values.length >= 1 && res[0].values[0][1] === 99
    },
  },
  {
    id: 28, level: '上級', category: 'サブクエリ',
    title: '平均点が全体平均を上回る生徒を集計する',
    desc: 'scores テーブルから生徒ごとの平均点を計算し、その平均点が全生徒の平均点（全 scores の AVG）を上回る student_id と avg_score を取得してください。',
    hint: 'HAVING AVG(score) > (SELECT AVG(score) FROM scores)',
    answer: 'SELECT student_id, AVG(score) AS avg_score\nFROM scores\nGROUP BY student_id\nHAVING AVG(score) > (SELECT AVG(score) FROM scores);',
    requiredKeywords: [{ keyword: '(SELECT', label: 'サブクエリ' }, { keyword: 'HAVING', label: 'HAVING 句' }],
    validate: (res) => {
      if (!res?.length) return false
      return res[0].values.length > 0
    },
  },

  // ══ テーブル定義 ══
  {
    id: 29, level: '初級', category: 'DDL',
    title: 'テーブルを作成する',
    desc: '次の仕様でテーブルを作成してください。\n\nテーブル名: school_trips\n列:\n  trip_id     INTEGER  PRIMARY KEY\n  trip_name   TEXT     NOT NULL\n  destination TEXT\n  trip_date   TEXT',
    hint: 'CREATE TABLE テーブル名 (列名 型 制約, ...)',
    answer: 'CREATE TABLE school_trips (\n  trip_id     INTEGER PRIMARY KEY,\n  trip_name   TEXT    NOT NULL,\n  destination TEXT,\n  trip_date   TEXT\n);',
    validate: (res) => Array.isArray(res) && res.length === 0,
  },
  {
    id: 30, level: '初級', category: 'DDL',
    title: '列を追加してテーブルを変更する',
    desc: 'students テーブルに新しい列 email（TEXT 型）を追加してください。',
    hint: 'ALTER TABLE テーブル名 ADD COLUMN 列名 型',
    answer: 'ALTER TABLE students ADD COLUMN email TEXT;',
    validate: (res) => Array.isArray(res) && res.length === 0,
  },
  {
    id: 31, level: '中級', category: 'DDL',
    title: 'インデックスを作成する',
    desc: 'students テーブルの class_id 列に idx_student_class という名前のインデックスを作成してください。',
    hint: 'CREATE INDEX インデックス名 ON テーブル名(列名)',
    answer: 'CREATE INDEX idx_student_class ON students(class_id);',
    validate: (res) => Array.isArray(res) && res.length === 0,
  },
  {
    id: 32, level: '中級', category: 'DDL',
    title: 'ビューを作成する',
    desc: 'students と classes を結合した結果（student_id, name, class_name, grade）を返すビュー student_class_view を作成してください。',
    hint: 'CREATE VIEW ビュー名 AS SELECT ...',
    answer: 'CREATE VIEW student_class_view AS\nSELECT s.student_id, s.name, c.class_name, c.grade\nFROM students s\nINNER JOIN classes c ON s.class_id = c.class_id;',
    validate: (res) => Array.isArray(res) && res.length === 0,
  },
  {
    id: 33, level: '上級', category: 'DDL',
    title: '外部キー制約付きテーブルを作成する',
    desc: '次の仕様でテーブルを作成してください。\n\nテーブル名: awards\n列:\n  award_id    INTEGER  PRIMARY KEY\n  student_id  INTEGER  REFERENCES students(student_id)\n  event_id    INTEGER  REFERENCES events(event_id)\n  award_name  TEXT\n  awarded_at  TEXT',
    hint: 'REFERENCES テーブル名(列名) で外部キー制約を付けます。',
    answer: 'CREATE TABLE awards (\n  award_id   INTEGER PRIMARY KEY,\n  student_id INTEGER REFERENCES students(student_id),\n  event_id   INTEGER REFERENCES events(event_id),\n  award_name TEXT,\n  awarded_at TEXT\n);',
    validate: (res) => Array.isArray(res) && res.length === 0,
  },

  // ══ データ操作 ══
  {
    id: 34, level: '初級', category: 'DML',
    title: '新しいクラスを追加する',
    desc: 'classes テーブルに以下のデータを1件追加してください。\n\nclass_id: 4\ngrade: 2\nclass_name: 1組\nhomeroom: 田中先生',
    hint: 'INSERT INTO テーブル名 (列1, ...) VALUES (値1, ...)',
    answer: "INSERT INTO classes (class_id, grade, class_name, homeroom)\nVALUES (4, 2, '1組', '田中先生');",
    validate: (res) => Array.isArray(res) && res.length === 0,
  },
  {
    id: 35, level: '初級', category: 'DML',
    title: '生徒の居住区分を更新する',
    desc: "students テーブルで、student_id が 8 の生徒（倉本 千奈）の residence を '寮' に更新してください。",
    hint: 'UPDATE テーブル名 SET 列名 = 値 WHERE 条件',
    answer: "UPDATE students\nSET residence = '寮'\nWHERE student_id = 8;",
    validate: (res) => Array.isArray(res) && res.length === 0,
  },
  {
    id: 36, level: '初級', category: 'DML',
    title: 'イベントを削除する',
    desc: "events テーブルから、event_name が '修学旅行' のイベントを削除してください。",
    hint: 'DELETE FROM テーブル名 WHERE 条件',
    answer: "DELETE FROM events\nWHERE event_name = '修学旅行';",
    validate: (res) => Array.isArray(res) && res.length === 0,
  },
  {
    id: 37, level: '中級', category: 'DML',
    title: '複数の教科をまとめて挿入する',
    desc: "subjects テーブルに以下の2件を一度の INSERT で追加してください。\n\n(9, '美術', '芸術')\n(10, '家庭科', '実技')",
    hint: 'VALUES (...), (...) のようにカンマ区切りで複数行指定できます。',
    answer: "INSERT INTO subjects (subject_id, subject_name, category)\nVALUES\n  (9, '美術', '芸術'),\n  (10, '家庭科', '実技');",
    validate: (res) => Array.isArray(res) && res.length === 0,
  },
  {
    id: 38, level: '中級', category: 'DML',
    title: '1年生の全生徒の年齢を1増やす',
    desc: '1年生のクラス（class_id が 1 または 2）に所属する全生徒の age を現在の値に +1 して更新してください。',
    hint: 'UPDATE students SET age = age + 1 WHERE class_id IN (...)',
    answer: 'UPDATE students\nSET age = age + 1\nWHERE class_id IN (1, 2);',
    validate: (res) => Array.isArray(res) && res.length === 0,
  },

  // ══ 集計関数（追加）══
  {
    id: 39, level: '初級', category: '集計',
    title: '最低点と最高点の差を求める',
    desc: 'scores テーブルから、全スコアの最低点（min_score）・最高点（max_score）・その差（score_range）を1行で取得してください。',
    hint: 'MIN(), MAX() を使い、MAX - MIN を計算します。AS で列名を付けましょう。',
    answer: 'SELECT MIN(score) AS min_score,\n       MAX(score) AS max_score,\n       MAX(score) - MIN(score) AS score_range\nFROM scores;',
    validate: (res) => {
      if (!res?.length) return false
      const cols = res[0].columns.map(c => c.toLowerCase())
      return cols.some(c => c.includes('min')) &&
             cols.some(c => c.includes('max')) &&
             res[0].values.length === 1
    },
  },
  {
    id: 40, level: '中級', category: '集計',
    title: 'COUNT(DISTINCT) で出身地の種類数を求める',
    desc: 'students テーブルから、重複を除いた出身地（hometown）の種類数を hometown_count という名前で取得してください。NULL は除外されます。',
    hint: 'COUNT(DISTINCT 列名) で重複を除いて数えられます。',
    answer: 'SELECT COUNT(DISTINCT hometown) AS hometown_count\nFROM students;',
    requiredKeywords: [{ keyword: 'DISTINCT', label: 'COUNT(DISTINCT ...)' }],
    validate: (res) => {
      if (!res?.length) return false
      const cols = res[0].columns.map(c => c.toLowerCase())
      return cols.some(c => c.includes('count') || c.includes('hometown_count')) &&
             res[0].values.length === 1 &&
             (res[0].values[0][0] as number) > 0
    },
  },
  {
    id: 41, level: '中級', category: '集計',
    title: 'NULL を含む列を集計する',
    desc: 'students テーブルで weight_kg の平均（avg_weight）と、weight_kg が NULL でない生徒の人数（count_with_weight）を取得してください。\nAVG と COUNT はどちらも NULL を自動的に無視します。',
    hint: 'AVG(weight_kg) と COUNT(weight_kg) を使います。COUNT(*) と COUNT(列名) の違いに注目しましょう。',
    answer: 'SELECT AVG(weight_kg)   AS avg_weight,\n       COUNT(weight_kg) AS count_with_weight\nFROM students;',
    validate: (res) => {
      if (!res?.length) return false
      const cols = res[0].columns.map(c => c.toLowerCase())
      return cols.some(c => c.includes('avg')) &&
             cols.some(c => c.includes('count')) &&
             res[0].values.length === 1
    },
  },

  // ══ SELECT（追加）══
  {
    id: 42, level: '初級', category: 'SELECT',
    title: 'DISTINCT で重複を除いて取得する',
    desc: 'students テーブルから、重複を除いた blood_type の一覧を取得してください。DISTINCT を使ってください。',
    hint: 'SELECT DISTINCT 列名 FROM テーブル名',
    answer: 'SELECT DISTINCT blood_type\nFROM students;',
    requiredKeywords: [{ keyword: 'DISTINCT', label: 'DISTINCT' }],
    validate: (res) => {
      if (!res?.length) return false
      // A / AB / B / O の4種類（NULLは除外）
      const vals = res[0].values.map(r => r[0])
      const unique = new Set(vals)
      return unique.size >= 4 && res[0].columns[0].toLowerCase().includes('blood')
    },
  },
  {
    id: 43, level: '初級', category: 'SELECT',
    title: 'LIMIT で先頭5件だけ取得する',
    desc: 'students テーブルから name と height_cm を取得し、height_cm の高い順に並べて上位5件だけ取得してください。',
    hint: 'ORDER BY height_cm DESC のあとに LIMIT 5 を付けます。',
    answer: 'SELECT name, height_cm\nFROM students\nORDER BY height_cm DESC\nLIMIT 5;',
    requiredKeywords: [{ keyword: 'LIMIT', label: 'LIMIT 句' }],
    validate: (res) => {
      if (!res?.length) return false
      const vals = res[0].values
      if (vals.length !== 5) return false
      // 降順になっているか確認
      for (let i = 0; i < vals.length - 1; i++) {
        if ((vals[i][1] as number) < (vals[i + 1][1] as number)) return false
      }
      return true
    },
  },

  // ══ サブクエリ（追加）══
  {
    id: 44, level: '中級', category: 'サブクエリ',
    title: 'EXISTS で部活に所属している生徒を取得する',
    desc: 'students テーブルから、club_members テーブルに所属レコードが存在する生徒の name を取得してください。EXISTS を使ってください。',
    hint: 'WHERE EXISTS (SELECT 1 FROM club_members cm WHERE cm.student_id = s.student_id)',
    answer: 'SELECT s.name\nFROM students s\nWHERE EXISTS (\n  SELECT 1\n  FROM club_members cm\n  WHERE cm.student_id = s.student_id\n);',
    requiredKeywords: [{ keyword: 'EXISTS', label: 'EXISTS' }],
    validate: (res) => {
      if (!res?.length) return false
      // club_members に登録されている student_id は 1〜13 の中の15件（重複あり）
      // 実際にメンバーになっている生徒は何人か
      return res[0].values.length > 0 && res[0].values.length <= 13
    },
  },
  {
    id: 45, level: '上級', category: 'サブクエリ',
    title: '相関サブクエリで各生徒のクラス平均より高い点数を取得する',
    desc: '同じ class_id の生徒たちの平均点より高いスコアを持つ（student_id, score）を scores テーブルから取得してください。\n外側のクエリの class_id を参照する相関サブクエリを使います。',
    hint: 'WHERE sc.score > (SELECT AVG(sc2.score) FROM scores sc2 INNER JOIN students s2 ON sc2.student_id = s2.student_id WHERE s2.class_id = s.class_id)',
    answer: 'SELECT sc.student_id, sc.score\nFROM scores sc\nINNER JOIN students s ON sc.student_id = s.student_id\nWHERE sc.score > (\n  SELECT AVG(sc2.score)\n  FROM scores sc2\n  INNER JOIN students s2 ON sc2.student_id = s2.student_id\n  WHERE s2.class_id = s.class_id\n);',
    validate: (res) => {
      if (!res?.length) return false
      return res[0].values.length > 0
    },
  },
]
