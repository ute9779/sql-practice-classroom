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

// 列名ユーティリティ
const hasCols = (res: SqlResult, ...names: string[]) => {
  if (!res?.length) return false
  const cols = res[0].columns.map(c => c.toLowerCase())
  return names.every(n => cols.includes(n.toLowerCase()))
}
const rowCount = (res: SqlResult) => (res?.length ? res[0].values.length : -1)

export const QUESTIONS: Question[] = [

  // ═══════════ SELECT ═══════════
  {
    id: 1, level: '初級', category: 'SELECT',
    title: '全生徒の基本情報を取得する',
    desc: 'students テーブルから、全生徒の student_id, name, enroll_year, status を取得してください。',
    hint: 'SELECT 列名, ... FROM テーブル名',
    answer: 'SELECT student_id, name, enroll_year, status\nFROM students;',
    validate: (res) => hasCols(res, 'student_id', 'name', 'enroll_year', 'status') && rowCount(res) === 20,
  },
  {
    id: 2, level: '初級', category: 'SELECT',
    title: '生年月日が新しい順に生徒を並べる',
    desc: 'students テーブルから name と birth_date を取得し、birth_date の新しい順（降順）に並べてください。',
    hint: 'ORDER BY birth_date DESC',
    answer: 'SELECT name, birth_date\nFROM students\nORDER BY birth_date DESC;',
    validate: (res) => {
      if (!hasCols(res, 'name', 'birth_date') || rowCount(res) !== 20) return false
      const v = res[0].values
      for (let i = 0; i < v.length - 1; i++) {
        if (String(v[i][1]) < String(v[i + 1][1])) return false
      }
      return true
    },
  },
  {
    id: 3, level: '初級', category: 'SELECT',
    title: '列に別名を付けて取得する',
    desc: 'students テーブルから name を「氏名」、enroll_year を「入学年度」という別名で取得してください。',
    hint: 'SELECT name AS 氏名, enroll_year AS 入学年度',
    answer: 'SELECT name AS 氏名, enroll_year AS 入学年度\nFROM students;',
    validate: (res) => hasCols(res, '氏名', '入学年度') && rowCount(res) === 20,
  },
  {
    id: 4, level: '中級', category: 'SELECT',
    title: 'DISTINCT で入学年度の一覧を取得する',
    desc: 'students テーブルから、重複を除いた enroll_year の一覧を取得してください。DISTINCT を使ってください。',
    hint: 'SELECT DISTINCT 列名 FROM テーブル名',
    answer: 'SELECT DISTINCT enroll_year\nFROM students;',
    requiredKeywords: [{ keyword: 'DISTINCT', label: 'DISTINCT' }],
    validate: (res) => {
      // 2022, 2023, 2024 の3種類
      if (!res?.length || rowCount(res) !== 3) return false
      const vals = res[0].values.map(r => r[0]).sort()
      return vals[0] === 2022 && vals[1] === 2023 && vals[2] === 2024
    },
  },
  {
    id: 5, level: '中級', category: 'SELECT',
    title: 'LIMIT で生年月日が若い順に3名取得する',
    desc: 'students テーブルから name と birth_date を取得し、birth_date の新しい順（＝若い順）に上位3名だけ取得してください。',
    hint: 'ORDER BY birth_date DESC のあとに LIMIT 3',
    answer: 'SELECT name, birth_date\nFROM students\nORDER BY birth_date DESC\nLIMIT 3;',
    requiredKeywords: [{ keyword: 'LIMIT', label: 'LIMIT 句' }],
    validate: (res) => {
      if (!hasCols(res, 'name', 'birth_date') || rowCount(res) !== 3) return false
      const v = res[0].values
      for (let i = 0; i < v.length - 1; i++) {
        if (String(v[i][1]) < String(v[i + 1][1])) return false
      }
      return true
    },
  },

  // ═══════════ WHERE ═══════════
  {
    id: 6, level: '初級', category: 'WHERE',
    title: '在籍中の生徒を取得する',
    desc: "students テーブルから、status が '在籍' の生徒の name と status を取得してください。",
    hint: "WHERE status = '在籍'",
    answer: "SELECT name, status\nFROM students\nWHERE status = '在籍';",
    validate: (res) => hasCols(res, 'name', 'status') && rowCount(res) === 18 &&
                       res[0].values.every(r => r[1] === '在籍'),
  },
  {
    id: 7, level: '初級', category: 'WHERE',
    title: '2023年度入学の男子生徒を取得する',
    desc: "students テーブルから、enroll_year が 2023 かつ gender が 'M' の生徒の name を取得してください。",
    hint: 'AND で2つの条件を組み合わせます。',
    answer: "SELECT name\nFROM students\nWHERE enroll_year = 2023\n  AND gender = 'M';",
    validate: (res) => hasCols(res, 'name') && rowCount(res) === 4,
  },
  {
    id: 8, level: '初級', category: 'WHERE',
    title: '在籍していない生徒を取得する',
    desc: "students テーブルから、status が '在籍' 以外の生徒の name と status を取得してください。",
    hint: '<> 演算子を使います。',
    answer: "SELECT name, status\nFROM students\nWHERE status <> '在籍';",
    validate: (res) => hasCols(res, 'name', 'status') && rowCount(res) === 2 &&
                       res[0].values.every(r => r[1] !== '在籍'),
  },
  {
    id: 9, level: '初級', category: 'WHERE',
    title: 'IN で特定クラスの生徒を絞り込む',
    desc: 'students テーブルから、classroom_id が 1, 2, 3 のいずれかの生徒の name と classroom_id を取得してください。IN 演算子を使ってください。',
    hint: 'WHERE classroom_id IN (1, 2, 3)',
    answer: 'SELECT name, classroom_id\nFROM students\nWHERE classroom_id IN (1, 2, 3);',
    requiredKeywords: [{ keyword: 'IN', label: 'IN 演算子' }],
    validate: (res) => hasCols(res, 'name', 'classroom_id') && rowCount(res) === 11 &&
                       res[0].values.every(r => [1, 2, 3].includes(r[1] as number)),
  },
  {
    id: 10, level: '中級', category: 'WHERE',
    title: 'BETWEEN で入学年度を範囲指定する',
    desc: 'students テーブルから、enroll_year が 2022 以上 2023 以下の生徒の name と enroll_year を取得してください。BETWEEN 演算子を使ってください。',
    hint: 'WHERE enroll_year BETWEEN 2022 AND 2023',
    answer: 'SELECT name, enroll_year\nFROM students\nWHERE enroll_year BETWEEN 2022 AND 2023;',
    requiredKeywords: [{ keyword: 'BETWEEN', label: 'BETWEEN 演算子' }],
    validate: (res) => hasCols(res, 'name', 'enroll_year') && rowCount(res) === 15 &&
                       res[0].values.every(r => (r[1] as number) >= 2022 && (r[1] as number) <= 2023),
  },
  {
    id: 11, level: '中級', category: 'WHERE',
    title: 'LIKE で姓を部分一致検索する',
    desc: "students テーブルから、name が「佐藤」で始まる生徒の name を取得してください。LIKE 演算子を使ってください。",
    hint: "WHERE name LIKE '佐藤%'",
    answer: "SELECT name\nFROM students\nWHERE name LIKE '佐藤%';",
    requiredKeywords: [{ keyword: 'LIKE', label: 'LIKE 演算子' }],
    validate: (res) => hasCols(res, 'name') && rowCount(res) === 1 &&
                       res[0].values.every(r => String(r[0]).startsWith('佐藤')),
  },
  {
    id: 12, level: '中級', category: 'WHERE',
    title: 'IS NULL でクラス未配属の生徒を取得する',
    desc: 'students テーブルから、classroom_id が NULL（クラス未配属）の生徒の name を取得してください。IS NULL を使ってください。',
    hint: 'WHERE classroom_id IS NULL',
    answer: 'SELECT name\nFROM students\nWHERE classroom_id IS NULL;',
    requiredKeywords: [{ keyword: 'IS NULL', label: 'IS NULL' }],
    // 現データに未配属はいない → 0件が正解
    validate: (res) => Array.isArray(res) && rowCount(res) <= 0 ? (res.length === 0 || res[0].values.length === 0) : false,
  },

  // ═══════════ 集計 ═══════════
  {
    id: 13, level: '初級', category: '集計',
    title: '生徒数を数える',
    desc: 'students テーブルの全生徒数を total という名前で取得してください。',
    hint: 'COUNT(*) AS total',
    answer: 'SELECT COUNT(*) AS total\nFROM students;',
    validate: (res) => rowCount(res) === 1 && res[0].values[0].includes(20),
  },
  {
    id: 14, level: '初級', category: '集計',
    title: '試験の最高点・最低点・平均点を求める',
    desc: 'exam_results テーブルから、全成績の最高点（max_score）・最低点（min_score）・平均点（avg_score）を1行で取得してください。',
    hint: 'MAX(), MIN(), AVG() を使います。',
    answer: 'SELECT MAX(score) AS max_score,\n       MIN(score) AS min_score,\n       AVG(score) AS avg_score\nFROM exam_results;',
    validate: (res) => rowCount(res) === 1 &&
                       res[0].values[0].includes(100) && res[0].values[0].includes(55),
  },
  {
    id: 15, level: '中級', category: '集計',
    title: 'クラスごとの生徒数を集計する',
    desc: 'students テーブルから classroom_id ごとの生徒数を集計し、classroom_id と student_count という名前で取得してください。',
    hint: 'GROUP BY classroom_id と COUNT(*) を使います。',
    answer: 'SELECT classroom_id, COUNT(*) AS student_count\nFROM students\nGROUP BY classroom_id;',
    validate: (res) => hasCols(res, 'classroom_id', 'student_count') && rowCount(res) === 6,
  },
  {
    id: 16, level: '中級', category: '集計',
    title: '科目ごとの平均点を求める',
    desc: 'exam_results テーブルから subject_id ごとの平均点を計算し、subject_id と avg_score という名前で取得してください。',
    hint: 'GROUP BY subject_id と AVG(score) を使います。',
    answer: 'SELECT subject_id, AVG(score) AS avg_score\nFROM exam_results\nGROUP BY subject_id;',
    validate: (res) => hasCols(res, 'subject_id', 'avg_score') && rowCount(res) === 8,
  },
  {
    id: 17, level: '上級', category: '集計',
    title: '平均点が85点以上の科目を抽出する',
    desc: 'exam_results テーブルから subject_id ごとの平均点を計算し、平均点が 85 以上の subject_id と avg_score を取得してください。',
    hint: 'GROUP BY のあとに HAVING AVG(score) >= 85 で絞り込みます。',
    answer: 'SELECT subject_id, AVG(score) AS avg_score\nFROM exam_results\nGROUP BY subject_id\nHAVING AVG(score) >= 85;',
    requiredKeywords: [{ keyword: 'HAVING', label: 'HAVING 句' }],
    validate: (res) => hasCols(res, 'subject_id', 'avg_score') && rowCount(res) === 4 &&
                       res[0].values.every(r => (r[1] as number) >= 85),
  },
  {
    id: 18, level: '上級', category: '集計',
    title: '生徒ごとの受験科目数を数える',
    desc: 'exam_results テーブルから student_id ごとの受験した成績件数を数え、student_id と result_count という名前で、件数の多い順に取得してください。',
    hint: 'GROUP BY student_id, COUNT(*) AS result_count, ORDER BY result_count DESC',
    answer: 'SELECT student_id, COUNT(*) AS result_count\nFROM exam_results\nGROUP BY student_id\nORDER BY result_count DESC;',
    validate: (res) => hasCols(res, 'student_id', 'result_count') && rowCount(res) === 8,
  },

  // ═══════════ JOIN ═══════════
  {
    id: 19, level: '初級', category: 'JOIN',
    title: '生徒とクラス情報を内部結合する',
    desc: 'students と classrooms を INNER JOIN し、生徒の name・学年 grade・組 class_label を取得してください。',
    hint: 'INNER JOIN classrooms c ON s.classroom_id = c.classroom_id',
    answer: 'SELECT s.name, c.grade, c.class_label\nFROM students s\nINNER JOIN classrooms c ON s.classroom_id = c.classroom_id;',
    validate: (res) => hasCols(res, 'name', 'grade', 'class_label') && rowCount(res) === 20,
  },
  {
    id: 20, level: '中級', category: 'JOIN',
    title: '教員と所属学科名を結合する',
    desc: 'teachers と departments を INNER JOIN し、教員の name と所属学科名 dept_name を取得してください。',
    hint: 'INNER JOIN departments d ON t.dept_id = d.dept_id',
    answer: 'SELECT t.name, d.dept_name\nFROM teachers t\nINNER JOIN departments d ON t.dept_id = d.dept_id;',
    validate: (res) => hasCols(res, 'name', 'dept_name') && rowCount(res) === 10,
  },
  {
    id: 21, level: '中級', category: 'JOIN',
    title: '担任のいないクラスも含めて一覧する',
    desc: 'classrooms を基点に teachers を LEFT JOIN し、全クラスの grade・class_label と担任名 name を取得してください。',
    hint: 'LEFT JOIN teachers t ON c.teacher_id = t.teacher_id',
    answer: 'SELECT c.grade, c.class_label, t.name\nFROM classrooms c\nLEFT JOIN teachers t ON c.teacher_id = t.teacher_id;',
    requiredKeywords: [{ keyword: 'LEFT JOIN', label: 'LEFT JOIN' }],
    validate: (res) => rowCount(res) === 6,
  },
  {
    id: 22, level: '中級', category: 'JOIN',
    title: '生徒・試験・科目・点数を結合する',
    desc: 'exam_results を起点に students・subjects を結合し、生徒名 name・科目名 subject_name・点数 score を取得してください。',
    hint: 'exam_results → students, exam_results → subjects をそれぞれ JOIN します。',
    answer: 'SELECT s.name, sub.subject_name, er.score\nFROM exam_results er\nINNER JOIN students s ON er.student_id = s.student_id\nINNER JOIN subjects sub ON er.subject_id = sub.subject_id;',
    validate: (res) => hasCols(res, 'name', 'subject_name', 'score') && rowCount(res) === 64,
  },
  {
    id: 23, level: '上級', category: 'JOIN',
    title: '一度も受験していない生徒を見つける',
    desc: 'exam_results に成績が1件も存在しない生徒の name を取得してください。LEFT JOIN と IS NULL を組み合わせましょう。',
    hint: 'students に exam_results を LEFT JOIN し、er.result_id IS NULL で絞り込みます。',
    answer: 'SELECT s.name\nFROM students s\nLEFT JOIN exam_results er ON s.student_id = er.student_id\nWHERE er.result_id IS NULL;',
    requiredKeywords: [{ keyword: 'LEFT JOIN', label: 'LEFT JOIN' }, { keyword: 'IS NULL', label: 'IS NULL' }],
    // 成績があるのは生徒 1,2,3,4,6,7,11,14 の8名 → 残り12名
    validate: (res) => hasCols(res, 'name') && rowCount(res) === 12,
  },
  {
    id: 24, level: '上級', category: 'JOIN',
    title: '教員の担当科目を多対多で取得する',
    desc: 'teachers・teacher_subjects・subjects を結合し、教員名 name と担当科目名 subject_name を取得してください。',
    hint: 'teachers → teacher_subjects → subjects と JOIN します。',
    answer: 'SELECT t.name, sub.subject_name\nFROM teachers t\nINNER JOIN teacher_subjects ts ON t.teacher_id = ts.teacher_id\nINNER JOIN subjects sub ON ts.subject_id = sub.subject_id;',
    validate: (res) => hasCols(res, 'name', 'subject_name') && rowCount(res) === 13,
  },
  {
    id: 25, level: '上級', category: 'JOIN',
    title: '生徒・クラス・担任・学科を4テーブル結合する',
    desc: 'students・classrooms・teachers・departments を結合し、生徒名 name・学年 grade・担任名（teacher_name）・学科名 dept_name を取得してください。',
    hint: 'students → classrooms → teachers / classrooms → departments と段階的に JOIN します。担任名は AS teacher_name で別名を付けます。',
    answer: 'SELECT s.name, c.grade, t.name AS teacher_name, d.dept_name\nFROM students s\nINNER JOIN classrooms c ON s.classroom_id = c.classroom_id\nINNER JOIN teachers t ON c.teacher_id = t.teacher_id\nINNER JOIN departments d ON c.dept_id = d.dept_id;',
    validate: (res) => hasCols(res, 'name', 'grade', 'teacher_name', 'dept_name') && rowCount(res) === 20,
  },

  // ═══════════ サブクエリ ═══════════
  {
    id: 26, level: '中級', category: 'サブクエリ',
    title: '最高得点の成績を取得する',
    desc: 'exam_results テーブルから、score が最高点の成績の student_id, subject_id, score を取得してください。サブクエリを使うこと。',
    hint: 'WHERE score = (SELECT MAX(score) FROM exam_results)',
    answer: 'SELECT student_id, subject_id, score\nFROM exam_results\nWHERE score = (SELECT MAX(score) FROM exam_results);',
    requiredKeywords: [{ keyword: '(SELECT', label: 'サブクエリ' }],
    validate: (res) => hasCols(res, 'student_id', 'subject_id', 'score') && rowCount(res) === 2 &&
                       res[0].values.every(r => r[2] === 100),
  },
  {
    id: 27, level: '上級', category: 'サブクエリ',
    title: '全体平均を上回る成績の生徒を集計する',
    desc: 'exam_results から student_id ごとの平均点を計算し、その平均点が全成績の平均点を上回る student_id と avg_score を取得してください。',
    hint: 'HAVING AVG(score) > (SELECT AVG(score) FROM exam_results)',
    answer: 'SELECT student_id, AVG(score) AS avg_score\nFROM exam_results\nGROUP BY student_id\nHAVING AVG(score) > (SELECT AVG(score) FROM exam_results);',
    requiredKeywords: [{ keyword: '(SELECT', label: 'サブクエリ' }, { keyword: 'HAVING', label: 'HAVING 句' }],
    validate: (res) => hasCols(res, 'student_id', 'avg_score') && rowCount(res) === 3,
  },
  {
    id: 28, level: '上級', category: 'サブクエリ',
    title: 'EXISTS で受験経験のある生徒を取得する',
    desc: 'exam_results に成績が存在する生徒の name を取得してください。EXISTS を使ってください。',
    hint: 'WHERE EXISTS (SELECT 1 FROM exam_results er WHERE er.student_id = s.student_id)',
    answer: 'SELECT s.name\nFROM students s\nWHERE EXISTS (\n  SELECT 1 FROM exam_results er\n  WHERE er.student_id = s.student_id\n);',
    requiredKeywords: [{ keyword: 'EXISTS', label: 'EXISTS' }],
    validate: (res) => hasCols(res, 'name') && rowCount(res) === 8,
  },
  {
    id: 29, level: '上級', category: 'サブクエリ',
    title: '相関サブクエリでクラス平均を上回る生徒を取得する',
    desc: '各生徒について、同じ classroom_id の生徒たちの平均 enroll_year より大きい enroll_year を持つ生徒の name と enroll_year を取得してください。相関サブクエリを使います。',
    hint: 'WHERE s.enroll_year > (SELECT AVG(s2.enroll_year) FROM students s2 WHERE s2.classroom_id = s.classroom_id)',
    answer: 'SELECT s.name, s.enroll_year\nFROM students s\nWHERE s.enroll_year > (\n  SELECT AVG(s2.enroll_year)\n  FROM students s2\n  WHERE s2.classroom_id = s.classroom_id\n);',
    requiredKeywords: [{ keyword: '(SELECT', label: '相関サブクエリ' }],
    validate: (res) => hasCols(res, 'name', 'enroll_year') && rowCount(res) === 5 &&
                       res[0].values.every(r => r[1] === 2024),
  },

  // ═══════════ DDL ═══════════
  {
    id: 30, level: '初級', category: 'DDL',
    title: 'テーブルを作成する',
    desc: '次の仕様でテーブルを作成してください。\n\nテーブル名: clubs\n列:\n  club_id   INTEGER  PRIMARY KEY\n  club_name TEXT     NOT NULL\n  category  TEXT',
    hint: 'CREATE TABLE テーブル名 (列名 型 制約, ...)',
    answer: 'CREATE TABLE clubs (\n  club_id   INTEGER PRIMARY KEY,\n  club_name TEXT    NOT NULL,\n  category  TEXT\n);',
    validate: (res) => Array.isArray(res) && res.length === 0,
  },
  {
    id: 31, level: '初級', category: 'DDL',
    title: '列を追加してテーブルを変更する',
    desc: 'students テーブルに新しい列 email（TEXT 型）を追加してください。',
    hint: 'ALTER TABLE テーブル名 ADD COLUMN 列名 型',
    answer: 'ALTER TABLE students ADD COLUMN email TEXT;',
    validate: (res) => Array.isArray(res) && res.length === 0,
  },
  {
    id: 32, level: '中級', category: 'DDL',
    title: 'インデックスを作成する',
    desc: 'exam_results テーブルの student_id 列に idx_result_student という名前のインデックスを作成してください。',
    hint: 'CREATE INDEX インデックス名 ON テーブル名(列名)',
    answer: 'CREATE INDEX idx_result_student ON exam_results(student_id);',
    validate: (res) => Array.isArray(res) && res.length === 0,
  },
  {
    id: 33, level: '中級', category: 'DDL',
    title: 'ビューを作成する',
    desc: 'students と classrooms を結合した結果（student_id, name, grade, class_label）を返すビュー student_class_view を作成してください。',
    hint: 'CREATE VIEW ビュー名 AS SELECT ...',
    answer: 'CREATE VIEW student_class_view AS\nSELECT s.student_id, s.name, c.grade, c.class_label\nFROM students s\nINNER JOIN classrooms c ON s.classroom_id = c.classroom_id;',
    validate: (res) => Array.isArray(res) && res.length === 0,
  },
  {
    id: 34, level: '上級', category: 'DDL',
    title: '外部キー制約付きテーブルを作成する',
    desc: '次の仕様でテーブルを作成してください。\n\nテーブル名: club_members\n列:\n  member_id  INTEGER  PRIMARY KEY\n  student_id INTEGER  REFERENCES students(student_id)\n  club_id    INTEGER  REFERENCES clubs(club_id)\n  role       TEXT\n\n※ clubs は Q30 で作成しています。',
    hint: 'REFERENCES テーブル名(列名) で外部キー制約を付けます。',
    answer: 'CREATE TABLE club_members (\n  member_id  INTEGER PRIMARY KEY,\n  student_id INTEGER REFERENCES students(student_id),\n  club_id    INTEGER REFERENCES clubs(club_id),\n  role       TEXT\n);',
    validate: (res) => Array.isArray(res) && res.length === 0,
  },

  // ═══════════ DML ═══════════
  {
    id: 35, level: '初級', category: 'DML',
    title: '新しい学科を追加する',
    desc: 'departments テーブルに以下のデータを1件追加してください。\n\ndept_id: 5\ndept_name: 芸術科\nest_year: 2020',
    hint: 'INSERT INTO テーブル名 (列1, ...) VALUES (値1, ...)',
    answer: "INSERT INTO departments (dept_id, dept_name, est_year)\nVALUES (5, '芸術科', 2020);",
    validate: (res) => Array.isArray(res) && res.length === 0,
  },
  {
    id: 36, level: '初級', category: 'DML',
    title: '生徒のステータスを更新する',
    desc: "students テーブルで、student_id が 5 の生徒（小川 美咲）の status を '在籍' に更新してください。",
    hint: 'UPDATE テーブル名 SET 列名 = 値 WHERE 条件',
    answer: "UPDATE students\nSET status = '在籍'\nWHERE student_id = 5;",
    validate: (res) => Array.isArray(res) && res.length === 0,
  },
  {
    id: 37, level: '初級', category: 'DML',
    title: '退学した生徒を削除する',
    desc: "students テーブルから、status が '退学' の生徒を削除してください。",
    hint: 'DELETE FROM テーブル名 WHERE 条件',
    answer: "DELETE FROM students\nWHERE status = '退学';",
    validate: (res) => Array.isArray(res) && res.length === 0,
  },
  {
    id: 38, level: '中級', category: 'DML',
    title: '複数の科目をまとめて挿入する',
    desc: "subjects テーブルに以下の2件を一度の INSERT で追加してください。\n\n(10, '生物', '理系', 3, 0)\n(11, '地理', '文系', 2, 0)",
    hint: 'VALUES (...), (...) のようにカンマ区切りで複数行指定できます。',
    answer: "INSERT INTO subjects (subject_id, subject_name, category, credits, is_required)\nVALUES\n  (10, '生物', '理系', 3, 0),\n  (11, '地理', '文系', 2, 0);",
    validate: (res) => Array.isArray(res) && res.length === 0,
  },
  {
    id: 39, level: '中級', category: 'DML',
    title: '休学中の生徒を一括で在籍に戻す',
    desc: "students テーブルで、status が '休学' の全生徒の status を '在籍' に更新してください。",
    hint: "UPDATE students SET status = '在籍' WHERE status = '休学'",
    answer: "UPDATE students\nSET status = '在籍'\nWHERE status = '休学';",
    validate: (res) => Array.isArray(res) && res.length === 0,
  },
  {
    id: 40, level: '上級', category: 'DML',
    title: '2024年度入学生の学年を一括更新する',
    desc: '2024年度入学（enroll_year = 2024）の生徒が所属するクラス（classroom_id）の中で、\nまず全生徒の enroll_year を +1 するのではなく、enroll_year が 2024 の生徒だけ enroll_year を 2025 に更新してください。',
    hint: 'UPDATE students SET enroll_year = 2025 WHERE enroll_year = 2024',
    answer: 'UPDATE students\nSET enroll_year = 2025\nWHERE enroll_year = 2024;',
    validate: (res) => Array.isArray(res) && res.length === 0,
  },

  // ═══════════ 集計・JOIN 実務応用（追加） ═══════════
  {
    id: 41, level: '上級', category: '集計',
    title: '学科ごとの在籍教員数を集計する',
    desc: 'teachers テーブルから、is_active が 1（在職）の教員について dept_id ごとの人数を集計し、dept_id と active_count という名前で取得してください。',
    hint: "WHERE is_active = 1 のあと GROUP BY dept_id。COUNT(*) AS active_count。",
    answer: 'SELECT dept_id, COUNT(*) AS active_count\nFROM teachers\nWHERE is_active = 1\nGROUP BY dept_id;',
    validate: (res) => hasCols(res, 'dept_id', 'active_count') && rowCount(res) === 4,
  },
  {
    id: 42, level: '上級', category: 'JOIN',
    title: 'クラスごとの平均点を算出する',
    desc: 'exam_results と students と classrooms を結合し、classroom_id ごとの平均点（avg_score）を取得してください。',
    hint: 'exam_results → students → classrooms を JOIN し、GROUP BY c.classroom_id。',
    answer: 'SELECT c.classroom_id, AVG(er.score) AS avg_score\nFROM exam_results er\nINNER JOIN students s ON er.student_id = s.student_id\nINNER JOIN classrooms c ON s.classroom_id = c.classroom_id\nGROUP BY c.classroom_id;',
    validate: (res) => hasCols(res, 'classroom_id', 'avg_score') && rowCount(res) === 5,
  },
  {
    id: 43, level: '上級', category: '集計',
    title: '出席率が80%未満の生徒を抽出する',
    desc: "attendances テーブルから生徒ごとに、全記録に占める '出席' の割合を計算し、80%未満の student_id と出席率（attend_rate）を取得してください。\n出席率は 出席数 ÷ 全記録数 × 100 で計算します。",
    hint: "AVG(CASE WHEN status = '出席' THEN 1.0 ELSE 0 END) * 100 で出席率を計算し、HAVING で絞り込みます。",
    answer: "SELECT student_id,\n       AVG(CASE WHEN status = '出席' THEN 1.0 ELSE 0 END) * 100 AS attend_rate\nFROM attendances\nGROUP BY student_id\nHAVING AVG(CASE WHEN status = '出席' THEN 1.0 ELSE 0 END) * 100 < 80;",
    requiredKeywords: [{ keyword: 'HAVING', label: 'HAVING 句' }],
    validate: (res) => hasCols(res, 'student_id', 'attend_rate') && rowCount(res) === 3 &&
                       res[0].values.every(r => (r[1] as number) < 80),
  },
  {
    id: 44, level: '中級', category: 'JOIN',
    title: '科目別の受験者数を集計する',
    desc: 'exam_results と subjects を結合し、科目名 subject_name ごとの受験者数（result_count）を取得してください。',
    hint: 'INNER JOIN subjects のあと GROUP BY sub.subject_name。',
    answer: 'SELECT sub.subject_name, COUNT(*) AS result_count\nFROM exam_results er\nINNER JOIN subjects sub ON er.subject_id = sub.subject_id\nGROUP BY sub.subject_name;',
    validate: (res) => hasCols(res, 'subject_name', 'result_count') && rowCount(res) === 8,
  },
  {
    id: 45, level: '上級', category: 'サブクエリ',
    title: '担当科目を持たない教員を取得する',
    desc: 'teacher_subjects に1件も担当がない教員の name を取得してください。NOT IN または NOT EXISTS を使います。',
    hint: 'WHERE teacher_id NOT IN (SELECT teacher_id FROM teacher_subjects)',
    answer: 'SELECT name\nFROM teachers\nWHERE teacher_id NOT IN (\n  SELECT teacher_id FROM teacher_subjects\n);',
    requiredKeywords: [{ keyword: 'NOT IN', label: 'NOT IN' }],
    // 担当あり: 1,2,3,4,5,6,7,8,10 → なしは 9 のみ
    validate: (res) => hasCols(res, 'name') && rowCount(res) === 1,
  },
]
