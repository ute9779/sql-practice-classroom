export type Level    = '初級' | '中級' | '上級'
export type Category =
  | 'SELECT' | 'WHERE' | '集計' | 'JOIN' | 'サブクエリ' | '関数' | '応用' | 'DDL' | 'DML'

/** 並び順の指定 */
export interface OrderSpec { column: string; dir: 'asc' | 'desc' }

/** 制約の動作確認（DDL 用）: sql を実行したときにエラーになるべきか(fails)を検査する */
export interface Probe { label: string; sql: string; fails: boolean }

export interface Question {
  id:               number
  level:            Level
  category:         Category
  title:            string
  desc:             string
  hint:             string
  answer:           string
  /**
   * 使用必須の構文。keyword または alt のいずれか1つが使われていればOK。
   * 空白・改行・コメント・文字列内の出現は無視して判定する（utils/judge.ts）。
   */
  requiredKeywords?: { keyword: string; alt?: string[]; label: string }[]
  /**
   * 並び順の指定（ORDER BY を伴う問題用）。配列なら先頭の列から順に確認する。
   * 判定の正解データは answer を実行した結果（DDL/DML は実行後のDB状態）から自動生成される。
   */
  order?:            OrderSpec | OrderSpec[]
  /**
   * 制約の動作確認（DDL 用）。CHECK のように、構造の比較だけでは判定できないものに使う。
   * 各 probe は実行後に必ず巻き戻されるので、DBの状態には影響しない。
   */
  probes?:           Probe[]
}

export const CATEGORY_STYLE: Record<Category, { bg: string; text: string }> = {
  'SELECT':   { bg: '#dbeafe', text: '#1d4ed8' },
  'WHERE':    { bg: '#cffafe', text: '#0e7490' },
  '集計':     { bg: '#f3e8ff', text: '#7e22ce' },
  'JOIN':     { bg: '#ccfbf1', text: '#0f766e' },
  'サブクエリ': { bg: '#e0e7ff', text: '#3730a3' },
  '関数':     { bg: '#fef9c3', text: '#a16207' },
  '応用':     { bg: '#fce7f3', text: '#be185d' },
  'DDL':      { bg: '#ffedd5', text: '#c2410c' },
  'DML':      { bg: '#ffe4e6', text: '#be123c' },
}

export const LEVEL_STYLE: Record<Level, { bg: string; text: string }> = {
  初級: { bg: '#e0f2fe', text: '#0369a1' },
  中級: { bg: '#dcfce7', text: '#15803d' },
  上級: { bg: '#fee2e2', text: '#b91c1c' },
}

export const QUESTIONS: Question[] = [

  // ═══════════ SELECT ═══════════
  {
    id: 1, level: '初級', category: 'SELECT',
    title: '全生徒の基本情報を取得する',
    desc: 'students テーブルから、全生徒の student_id, name, enroll_year, status を取得してください。',
    hint: 'SELECT 列名, ... FROM テーブル名',
    answer: 'SELECT student_id, name, enroll_year, status\nFROM students;',
  },
  {
    id: 2, level: '初級', category: 'SELECT',
    title: '生年月日が新しい順に生徒を並べる',
    desc: 'students テーブルから name と birth_date を取得し、birth_date の新しい順（降順）に並べてください。',
    hint: 'ORDER BY birth_date DESC',
    answer: 'SELECT name, birth_date\nFROM students\nORDER BY birth_date DESC;',
    order: { column: 'birth_date', dir: 'desc' },
  },
  {
    id: 3, level: '初級', category: 'SELECT',
    title: '列に別名を付けて取得する',
    desc: 'students テーブルから name を「氏名」、enroll_year を「入学年度」という別名で取得してください。',
    hint: 'SELECT name AS 氏名, enroll_year AS 入学年度',
    answer: 'SELECT name AS 氏名, enroll_year AS 入学年度\nFROM students;',
  },
  {
    id: 4, level: '初級', category: 'SELECT',
    title: 'DISTINCT で入学年度の一覧を取得する',
    desc: 'students テーブルから、重複を除いた enroll_year の一覧を取得してください。DISTINCT を使ってください。',
    hint: 'SELECT DISTINCT 列名 FROM テーブル名',
    answer: 'SELECT DISTINCT enroll_year\nFROM students;',
    requiredKeywords: [{ keyword: 'DISTINCT', label: 'DISTINCT' }],
  },
  {
    id: 5, level: '初級', category: 'SELECT',
    title: 'LIMIT で生年月日が若い順に3名取得する',
    desc: 'students テーブルから name と birth_date を取得し、birth_date の新しい順（＝若い順）に上位3名だけ取得してください。',
    hint: 'ORDER BY birth_date DESC のあとに LIMIT 3',
    answer: 'SELECT name, birth_date\nFROM students\nORDER BY birth_date DESC\nLIMIT 3;',
    requiredKeywords: [{ keyword: 'LIMIT', label: 'LIMIT 句' }],
    order: { column: 'birth_date', dir: 'desc' },
  },

  // ═══════════ WHERE ═══════════
  {
    id: 6, level: '初級', category: 'WHERE',
    title: '在籍中の生徒を取得する',
    desc: "students テーブルから、status が '在籍' の生徒の name と status を取得してください。",
    hint: "WHERE status = '在籍'",
    answer: "SELECT name, status\nFROM students\nWHERE status = '在籍';",
  },
  {
    id: 7, level: '初級', category: 'WHERE',
    title: '2023年度入学の男子生徒を取得する',
    desc: "students テーブルから、enroll_year が 2023 かつ gender が 'M' の生徒の name を取得してください。",
    hint: 'AND で2つの条件を組み合わせます。',
    answer: "SELECT name\nFROM students\nWHERE enroll_year = 2023\n  AND gender = 'M';",
  },
  {
    id: 8, level: '初級', category: 'WHERE',
    title: '在籍していない生徒を取得する',
    desc: "students テーブルから、status が '在籍' 以外の生徒の name と status を取得してください。",
    hint: '<> 演算子を使います。',
    answer: "SELECT name, status\nFROM students\nWHERE status <> '在籍';",
  },
  {
    id: 9, level: '初級', category: 'WHERE',
    title: 'IN で特定クラスの生徒を絞り込む',
    desc: 'students テーブルから、classroom_id が 1, 2, 3 のいずれかの生徒の name と classroom_id を取得してください。IN 演算子を使ってください。',
    hint: 'WHERE classroom_id IN (1, 2, 3)',
    answer: 'SELECT name, classroom_id\nFROM students\nWHERE classroom_id IN (1, 2, 3);',
    requiredKeywords: [{ keyword: 'IN', label: 'IN 演算子' }],
  },
  {
    id: 10, level: '中級', category: 'WHERE',
    title: 'BETWEEN で入学年度を範囲指定する',
    desc: 'students テーブルから、enroll_year が 2022 以上 2023 以下の生徒の name と enroll_year を取得してください。BETWEEN 演算子を使ってください。',
    hint: 'WHERE enroll_year BETWEEN 2022 AND 2023',
    answer: 'SELECT name, enroll_year\nFROM students\nWHERE enroll_year BETWEEN 2022 AND 2023;',
    requiredKeywords: [{ keyword: 'BETWEEN', label: 'BETWEEN 演算子' }],
  },
  {
    id: 11, level: '中級', category: 'WHERE',
    title: 'LIKE で姓を部分一致検索する',
    desc: "students テーブルから、name が「佐藤」で始まる生徒の name を取得してください。LIKE 演算子を使ってください。",
    hint: "WHERE name LIKE '佐藤%'",
    answer: "SELECT name\nFROM students\nWHERE name LIKE '佐藤%';",
    requiredKeywords: [{ keyword: 'LIKE', label: 'LIKE 演算子' }],
  },
  {
    id: 12, level: '中級', category: 'WHERE',
    title: 'IS NULL でクラス未配属の生徒を取得する',
    desc: 'students テーブルから、classroom_id が NULL（クラス未配属）の生徒の name を取得してください。IS NULL を使ってください。',
    hint: 'WHERE classroom_id IS NULL',
    answer: 'SELECT name\nFROM students\nWHERE classroom_id IS NULL;',
    requiredKeywords: [{ keyword: 'IS NULL', label: 'IS NULL' }],
  },

  // ═══════════ 集計 ═══════════
  {
    id: 13, level: '初級', category: '集計',
    title: '生徒数を数える',
    desc: 'students テーブルの全生徒数を total という名前で取得してください。',
    hint: 'COUNT(*) AS total',
    answer: 'SELECT COUNT(*) AS total\nFROM students;',
  },
  {
    id: 14, level: '初級', category: '集計',
    title: '試験の最高点・最低点・平均点を求める',
    desc: 'exam_results テーブルから、全成績の最高点（max_score）・最低点（min_score）・平均点（avg_score）を1行で取得してください。',
    hint: 'MAX(), MIN(), AVG() を使います。',
    answer: 'SELECT MAX(score) AS max_score,\n       MIN(score) AS min_score,\n       AVG(score) AS avg_score\nFROM exam_results;',
  },
  {
    id: 15, level: '中級', category: '集計',
    title: 'クラスごとの生徒数を集計する',
    desc: 'students テーブルから classroom_id ごとの生徒数を集計し、classroom_id と student_count という名前で取得してください。',
    hint: 'GROUP BY classroom_id と COUNT(*) を使います。',
    answer: 'SELECT classroom_id, COUNT(*) AS student_count\nFROM students\nGROUP BY classroom_id;',
  },
  {
    id: 16, level: '中級', category: '集計',
    title: '科目ごとの平均点を求める',
    desc: 'exam_results テーブルから subject_id ごとの平均点を計算し、subject_id と avg_score という名前で取得してください。',
    hint: 'GROUP BY subject_id と AVG(score) を使います。',
    answer: 'SELECT subject_id, AVG(score) AS avg_score\nFROM exam_results\nGROUP BY subject_id;',
  },
  {
    id: 17, level: '中級', category: '集計',
    title: '平均点が85点以上の科目を抽出する',
    desc: 'exam_results テーブルから subject_id ごとの平均点を計算し、平均点が 85 以上の subject_id と avg_score を取得してください。',
    hint: 'GROUP BY のあとに HAVING AVG(score) >= 85 で絞り込みます。',
    answer: 'SELECT subject_id, AVG(score) AS avg_score\nFROM exam_results\nGROUP BY subject_id\nHAVING AVG(score) >= 85;',
    requiredKeywords: [{ keyword: 'HAVING', label: 'HAVING 句' }],
  },
  {
    id: 18, level: '上級', category: '集計',
    title: '生徒ごとの受験科目数を数える',
    desc: 'exam_results テーブルから student_id ごとに、受験した科目の種類数（同じ科目を複数回受験しても1科目と数える）を数え、student_id と subject_count という名前で、科目数の多い順に取得してください。',
    hint: '同じ科目の重複を除いて数えるには COUNT(DISTINCT 列名)。GROUP BY student_id と ORDER BY subject_count DESC も使います。',
    answer: 'SELECT student_id, COUNT(DISTINCT subject_id) AS subject_count\nFROM exam_results\nGROUP BY student_id\nORDER BY subject_count DESC;',
    order: { column: 'subject_count', dir: 'desc' },
  },

  // ═══════════ JOIN ═══════════
  {
    id: 19, level: '初級', category: 'JOIN',
    title: '生徒とクラス情報を内部結合する',
    desc: 'students と classrooms を INNER JOIN し、生徒の name・学年 grade・組 class_label を取得してください。',
    hint: 'INNER JOIN classrooms c ON s.classroom_id = c.classroom_id',
    answer: 'SELECT s.name, c.grade, c.class_label\nFROM students s\nINNER JOIN classrooms c ON s.classroom_id = c.classroom_id;',
  },
  {
    id: 20, level: '中級', category: 'JOIN',
    title: '教員と所属学科名を結合する',
    desc: 'teachers と departments を INNER JOIN し、教員の name と所属学科名 dept_name を取得してください。',
    hint: 'INNER JOIN departments d ON t.dept_id = d.dept_id',
    answer: 'SELECT t.name, d.dept_name\nFROM teachers t\nINNER JOIN departments d ON t.dept_id = d.dept_id;',
  },
  {
    id: 21, level: '中級', category: 'JOIN',
    title: '担任のいないクラスも含めて一覧する',
    desc: 'classrooms を基点に teachers を LEFT JOIN し、全クラスの grade・class_label と担任名 name を取得してください。',
    hint: 'LEFT JOIN teachers t ON c.teacher_id = t.teacher_id',
    answer: 'SELECT c.grade, c.class_label, t.name\nFROM classrooms c\nLEFT JOIN teachers t ON c.teacher_id = t.teacher_id;',
    requiredKeywords: [{ keyword: 'LEFT JOIN', label: 'LEFT JOIN' }],
  },
  {
    id: 22, level: '中級', category: 'JOIN',
    title: '生徒・科目・点数を結合する',
    desc: 'exam_results を起点に students・subjects を結合し、生徒名 name・科目名 subject_name・点数 score を取得してください。',
    hint: 'exam_results → students, exam_results → subjects をそれぞれ JOIN します。',
    answer: 'SELECT s.name, sub.subject_name, er.score\nFROM exam_results er\nINNER JOIN students s ON er.student_id = s.student_id\nINNER JOIN subjects sub ON er.subject_id = sub.subject_id;',
  },
  {
    id: 23, level: '上級', category: 'JOIN',
    title: '一度も受験していない生徒を見つける',
    desc: 'exam_results に成績が1件も存在しない生徒の name を取得してください。LEFT JOIN と IS NULL を組み合わせましょう。',
    hint: 'students に exam_results を LEFT JOIN し、er.result_id IS NULL で絞り込みます。',
    answer: 'SELECT s.name\nFROM students s\nLEFT JOIN exam_results er ON s.student_id = er.student_id\nWHERE er.result_id IS NULL;',
    requiredKeywords: [{ keyword: 'LEFT JOIN', label: 'LEFT JOIN' }, { keyword: 'IS NULL', label: 'IS NULL' }],
  },
  {
    id: 24, level: '上級', category: 'JOIN',
    title: '教員の担当科目を多対多で取得する',
    desc: 'teachers・teacher_subjects・subjects を結合し、教員名 name と担当科目名 subject_name を取得してください。',
    hint: 'teachers → teacher_subjects → subjects と JOIN します。',
    answer: 'SELECT t.name, sub.subject_name\nFROM teachers t\nINNER JOIN teacher_subjects ts ON t.teacher_id = ts.teacher_id\nINNER JOIN subjects sub ON ts.subject_id = sub.subject_id;',
  },
  {
    id: 25, level: '上級', category: 'JOIN',
    title: '生徒・クラス・担任・学科を4テーブル結合する',
    desc: 'students・classrooms・teachers・departments を結合し、生徒名 name・学年 grade・担任名（teacher_name）・学科名 dept_name を取得してください。',
    hint: 'students → classrooms → teachers / classrooms → departments と段階的に JOIN します。担任名は AS teacher_name で別名を付けます。',
    answer: 'SELECT s.name, c.grade, t.name AS teacher_name, d.dept_name\nFROM students s\nINNER JOIN classrooms c ON s.classroom_id = c.classroom_id\nINNER JOIN teachers t ON c.teacher_id = t.teacher_id\nINNER JOIN departments d ON c.dept_id = d.dept_id;',
  },

  // ═══════════ サブクエリ ═══════════
  {
    id: 26, level: '中級', category: 'サブクエリ',
    title: '最高得点の成績を取得する',
    desc: 'exam_results テーブルから、score が最高点の成績の student_id, subject_id, score を取得してください。サブクエリを使うこと。',
    hint: 'WHERE score = (SELECT MAX(score) FROM exam_results)',
    answer: 'SELECT student_id, subject_id, score\nFROM exam_results\nWHERE score = (SELECT MAX(score) FROM exam_results);',
    requiredKeywords: [{ keyword: '(SELECT', label: 'サブクエリ' }],
  },
  {
    id: 27, level: '上級', category: 'サブクエリ',
    title: '全体平均を上回る成績の生徒を集計する',
    desc: 'exam_results から student_id ごとの平均点を計算し、その平均点が全成績の平均点を上回る student_id と avg_score を取得してください。',
    hint: 'HAVING AVG(score) > (SELECT AVG(score) FROM exam_results)',
    answer: 'SELECT student_id, AVG(score) AS avg_score\nFROM exam_results\nGROUP BY student_id\nHAVING AVG(score) > (SELECT AVG(score) FROM exam_results);',
    requiredKeywords: [{ keyword: '(SELECT', label: 'サブクエリ' }, { keyword: 'HAVING', label: 'HAVING 句' }],
  },
  {
    id: 28, level: '上級', category: 'サブクエリ',
    title: 'EXISTS で受験経験のある生徒を取得する',
    desc: 'exam_results に成績が存在する生徒の name を取得してください。EXISTS を使ってください。',
    hint: 'WHERE EXISTS (SELECT 1 FROM exam_results er WHERE er.student_id = s.student_id)',
    answer: 'SELECT s.name\nFROM students s\nWHERE EXISTS (\n  SELECT 1 FROM exam_results er\n  WHERE er.student_id = s.student_id\n);',
    requiredKeywords: [{ keyword: 'EXISTS', label: 'EXISTS' }],
  },
  {
    id: 29, level: '上級', category: 'サブクエリ',
    title: '相関サブクエリで科目平均を上回る成績を取得する',
    desc: 'exam_results から、同じ科目（subject_id）の全成績の平均点より高い score の成績について、student_id・subject_id・score を取得してください。相関サブクエリを使います。',
    hint: '外側の行の subject_id を参照するサブクエリを書きます。WHERE er.score > (SELECT AVG(er2.score) FROM exam_results er2 WHERE er2.subject_id = er.subject_id)',
    answer: 'SELECT er.student_id, er.subject_id, er.score\nFROM exam_results er\nWHERE er.score > (\n  SELECT AVG(er2.score)\n  FROM exam_results er2\n  WHERE er2.subject_id = er.subject_id\n);',
    requiredKeywords: [{ keyword: '(SELECT', label: '相関サブクエリ' }],
  },

  // ═══════════ DDL ═══════════
  {
    id: 30, level: '初級', category: 'DDL',
    title: 'テーブルを作成する',
    desc: '次の仕様でテーブルを作成してください。\n\nテーブル名: clubs\n列:\n  club_id   INTEGER  PRIMARY KEY\n  club_name TEXT     NOT NULL\n  category  TEXT',
    hint: 'CREATE TABLE テーブル名 (列名 型 制約, ...)',
    answer: 'CREATE TABLE clubs (\n  club_id   INTEGER PRIMARY KEY,\n  club_name TEXT    NOT NULL,\n  category  TEXT\n);',
  },
  {
    id: 31, level: '初級', category: 'DDL',
    title: '列を追加してテーブルを変更する',
    desc: 'students テーブルに新しい列 email（TEXT 型）を追加してください。',
    hint: 'ALTER TABLE テーブル名 ADD COLUMN 列名 型',
    answer: 'ALTER TABLE students ADD COLUMN email TEXT;',
  },
  {
    id: 32, level: '中級', category: 'DDL',
    title: 'インデックスを作成する',
    desc: 'exam_results テーブルの student_id 列に idx_result_student という名前のインデックスを作成してください。',
    hint: 'CREATE INDEX インデックス名 ON テーブル名(列名)',
    answer: 'CREATE INDEX idx_result_student ON exam_results(student_id);',
  },
  {
    id: 33, level: '中級', category: 'DDL',
    title: 'ビューを作成する',
    desc: 'students と classrooms を結合した結果（student_id, name, grade, class_label）を返すビュー student_class_view を作成してください。',
    hint: 'CREATE VIEW ビュー名 AS SELECT ...',
    answer: 'CREATE VIEW student_class_view AS\nSELECT s.student_id, s.name, c.grade, c.class_label\nFROM students s\nINNER JOIN classrooms c ON s.classroom_id = c.classroom_id;',
  },
  {
    id: 34, level: '上級', category: 'DDL',
    title: '外部キー制約付きテーブルを作成する',
    desc: '次の仕様でテーブルを作成してください。\n\nテーブル名: club_members\n列:\n  member_id  INTEGER  PRIMARY KEY\n  student_id INTEGER  REFERENCES students(student_id)\n  club_id    INTEGER  REFERENCES clubs(club_id)\n  role       TEXT\n\n※ このアプリでは問題ごとに独立した環境で実行されるため、Q30 の clubs テーブルは存在しません。SQLite は外部キーの参照先がなくてもテーブルを作成できるので、そのまま作成してください。',
    hint: 'REFERENCES テーブル名(列名) で外部キー制約を付けます。',
    answer: 'CREATE TABLE club_members (\n  member_id  INTEGER PRIMARY KEY,\n  student_id INTEGER REFERENCES students(student_id),\n  club_id    INTEGER REFERENCES clubs(club_id),\n  role       TEXT\n);',
  },

  // ═══════════ DML ═══════════
  {
    id: 35, level: '初級', category: 'DML',
    title: '新しい学科を追加する',
    desc: 'departments テーブルに以下のデータを1件追加してください。\n\ndept_id: 5\ndept_name: 芸術科\nest_year: 2020',
    hint: 'INSERT INTO テーブル名 (列1, ...) VALUES (値1, ...)',
    answer: "INSERT INTO departments (dept_id, dept_name, est_year)\nVALUES (5, '芸術科', 2020);",
  },
  {
    id: 36, level: '初級', category: 'DML',
    title: '生徒のステータスを更新する',
    desc: "students テーブルで、student_id が 5 の生徒（小川 美咲）の status を '在籍' に更新してください。",
    hint: 'UPDATE テーブル名 SET 列名 = 値 WHERE 条件',
    answer: "UPDATE students\nSET status = '在籍'\nWHERE student_id = 5;",
  },
  {
    id: 37, level: '初級', category: 'DML',
    title: '退学した生徒を削除する',
    desc: "students テーブルから、status が '退学' の生徒を削除してください。",
    hint: 'DELETE FROM テーブル名 WHERE 条件',
    answer: "DELETE FROM students\nWHERE status = '退学';",
  },
  {
    id: 38, level: '中級', category: 'DML',
    title: '複数の科目をまとめて挿入する',
    desc: "subjects テーブルに以下の2件を一度の INSERT で追加してください。\n\n(10, '生物', '理系', 3, 0)\n(11, '地理', '文系', 2, 0)",
    hint: 'VALUES (...), (...) のようにカンマ区切りで複数行指定できます。',
    answer: "INSERT INTO subjects (subject_id, subject_name, category, credits, is_required)\nVALUES\n  (10, '生物', '理系', 3, 0),\n  (11, '地理', '文系', 2, 0);",
  },
  {
    id: 39, level: '中級', category: 'DML',
    title: '条件に合う複数の生徒を一括で更新する',
    desc: "students テーブルで、enroll_year が 2022 かつ status が '在籍' の生徒すべての status を '卒業' に更新してください。",
    hint: "WHERE に AND で2つの条件を書くと、両方に合う行がまとめて更新されます。",
    answer: "UPDATE students\nSET status = '卒業'\nWHERE enroll_year = 2022\n  AND status = '在籍';",
  },
  {
    id: 40, level: '上級', category: 'DML',
    title: '2024年度入学生の学年を一括更新する',
    desc: 'students テーブルで、enroll_year が 2024 の生徒だけを対象に、enroll_year を 2025 に更新してください。他の入学年度の生徒は変更しないでください。',
    hint: 'UPDATE students SET enroll_year = 2025 WHERE enroll_year = 2024',
    answer: 'UPDATE students\nSET enroll_year = 2025\nWHERE enroll_year = 2024;',
  },

  // ═══════════ 集計・JOIN 実務応用（追加） ═══════════
  {
    id: 41, level: '中級', category: '集計',
    title: '学科ごとの在籍教員数を集計する',
    desc: 'teachers テーブルから、is_active が 1（在職）の教員について dept_id ごとの人数を集計し、dept_id と active_count という名前で取得してください。',
    hint: "WHERE is_active = 1 のあと GROUP BY dept_id。COUNT(*) AS active_count。",
    answer: 'SELECT dept_id, COUNT(*) AS active_count\nFROM teachers\nWHERE is_active = 1\nGROUP BY dept_id;',
  },
  {
    id: 42, level: '上級', category: 'JOIN',
    title: 'クラスごとの平均点を算出する',
    desc: 'exam_results と students と classrooms を結合し、classroom_id ごとの平均点（avg_score）を取得してください。',
    hint: 'exam_results → students → classrooms を JOIN し、GROUP BY c.classroom_id。',
    answer: 'SELECT c.classroom_id, AVG(er.score) AS avg_score\nFROM exam_results er\nINNER JOIN students s ON er.student_id = s.student_id\nINNER JOIN classrooms c ON s.classroom_id = c.classroom_id\nGROUP BY c.classroom_id;',
  },
  {
    id: 43, level: '上級', category: '集計',
    title: '出席率が80%未満の生徒を抽出する',
    desc: "attendances テーブルから生徒ごとに、全記録に占める '出席' の割合を計算し、80%未満の student_id と出席率（attend_rate）を取得してください。\n出席率は 出席数 ÷ 全記録数 × 100 で計算します。",
    hint: "AVG(CASE WHEN status = '出席' THEN 1.0 ELSE 0 END) * 100 で出席率を計算し、HAVING で絞り込みます。",
    answer: "SELECT student_id,\n       AVG(CASE WHEN status = '出席' THEN 1.0 ELSE 0 END) * 100 AS attend_rate\nFROM attendances\nGROUP BY student_id\nHAVING AVG(CASE WHEN status = '出席' THEN 1.0 ELSE 0 END) * 100 < 80;",
    requiredKeywords: [{ keyword: 'HAVING', label: 'HAVING 句' }],
  },
  {
    id: 44, level: '中級', category: 'JOIN',
    title: '科目別の受験者数を集計する',
    desc: 'exam_results と subjects を結合し、科目名 subject_name ごとの受験者数（同じ生徒が複数の試験を受けても1人と数える）を examinee_count という名前で取得してください。',
    hint: 'INNER JOIN subjects のあと GROUP BY sub.subject_name。人数の重複を除くには COUNT(DISTINCT 列名)。',
    answer: 'SELECT sub.subject_name, COUNT(DISTINCT er.student_id) AS examinee_count\nFROM exam_results er\nINNER JOIN subjects sub ON er.subject_id = sub.subject_id\nGROUP BY sub.subject_name;',
  },
  {
    id: 45, level: '上級', category: 'サブクエリ',
    title: '担当科目を持たない教員を取得する',
    desc: 'teacher_subjects に1件も担当がない教員の name を取得してください。NOT IN または NOT EXISTS を使います。',
    hint: 'WHERE teacher_id NOT IN (SELECT teacher_id FROM teacher_subjects)',
    answer: 'SELECT name\nFROM teachers\nWHERE teacher_id NOT IN (\n  SELECT teacher_id FROM teacher_subjects\n);',
    requiredKeywords: [{ keyword: 'NOT IN', alt: ['NOT EXISTS'], label: 'NOT IN または NOT EXISTS' }],
  },

  // ═══════════ 追加: WHERE / SELECT の基本構文 ═══════════
  {
    id: 46, level: '中級', category: 'WHERE',
    title: 'AND と OR を括弧で組み合わせる',
    desc: "students テーブルから、gender が 'F' で、かつ enroll_year が 2022 または 2024 の生徒の name と enroll_year を取得してください。OR を使ってください。",
    hint: 'AND と OR を一緒に使うときは、OR の部分を括弧でまとめます。括弧がないと AND が先に評価されます。',
    answer: "SELECT name, enroll_year\nFROM students\nWHERE gender = 'F'\n  AND (enroll_year = 2022 OR enroll_year = 2024);",
    requiredKeywords: [{ keyword: 'OR', label: 'OR 演算子' }],
  },
  {
    id: 47, level: '中級', category: 'WHERE',
    title: 'LIKE で名前の一部が一致する教員を検索する',
    desc: 'teachers テーブルから、name に「子」を含む教員の name を取得してください。LIKE 演算子を使ってください。',
    hint: '前後に % を付けると、文字列のどこに含まれていても一致します。',
    answer: "SELECT name\nFROM teachers\nWHERE name LIKE '%子%';",
    requiredKeywords: [{ keyword: 'LIKE', label: 'LIKE 演算子' }],
  },
  {
    id: 48, level: '中級', category: 'SELECT',
    title: '複数の列で並べ替える',
    desc: 'students テーブルから name・enroll_year・birth_date を取得し、enroll_year の新しい順（降順）に並べてください。同じ入学年度の中では birth_date の古い順（昇順）に並べます。',
    hint: 'ORDER BY 列1 DESC, 列2 ASC のように、カンマで区切って複数の列を指定できます。',
    answer: 'SELECT name, enroll_year, birth_date\nFROM students\nORDER BY enroll_year DESC, birth_date ASC;',
    order: [{ column: 'enroll_year', dir: 'desc' }, { column: 'birth_date', dir: 'asc' }],
  },
  {
    id: 49, level: '中級', category: 'WHERE',
    title: 'IS NOT NULL で担任が決まっているクラスを取得する',
    desc: 'classrooms テーブルから、teacher_id が NULL ではない（担任が決まっている）クラスの classroom_id・grade・class_label を取得してください。IS NOT NULL を使ってください。',
    hint: 'NULL との比較は = や <> ではなく、IS / IS NOT を使います。',
    answer: 'SELECT classroom_id, grade, class_label\nFROM classrooms\nWHERE teacher_id IS NOT NULL;',
    requiredKeywords: [{ keyword: 'IS NOT NULL', label: 'IS NOT NULL' }],
  },

  // ═══════════ 追加: 関数・式 ═══════════
  {
    id: 50, level: '初級', category: '関数',
    title: '文字列を || で連結する',
    desc: "students テーブルから、name と status を「青木 遥 [在籍]」の形式（name、半角スペース、角括弧で囲んだ status）でつないだ文字列を label という名前で取得してください。",
    hint: "SQLite では文字列の連結に || を使います。固定の文字はシングルクォートで囲みます。",
    answer: "SELECT name || ' [' || status || ']' AS label\nFROM students;",
  },
  {
    id: 51, level: '中級', category: '関数',
    title: '文字列関数で姓だけを取り出す',
    desc: "students テーブルの name は「姓 名」の形式（間は半角スペース）です。name と、姓の部分だけを取り出した family_name を取得してください。SUBSTR と INSTR を使ってください。",
    hint: "INSTR(name, ' ') は半角スペースの位置を返します。SUBSTR(文字列, 開始位置, 長さ) で一部を切り出せます。",
    answer: "SELECT name,\n       SUBSTR(name, 1, INSTR(name, ' ') - 1) AS family_name\nFROM students;",
    requiredKeywords: [
      { keyword: 'SUBSTR', alt: ['SUBSTRING'], label: 'SUBSTR' },
      { keyword: 'INSTR', label: 'INSTR' },
    ],
  },
  {
    id: 52, level: '中級', category: '関数',
    title: '日付関数で誕生月ごとの生徒数を集計する',
    desc: "students テーブルの birth_date は 'YYYY-MM-DD' 形式の文字列です。誕生月を整数（1〜12）にして birth_month、その月に生まれた生徒数を student_count という名前で取得してください。",
    hint: "STRFTIME('%m', 日付) で月を '05' のような文字列で取り出せます。CAST(... AS INTEGER) で整数に変換できます。",
    answer: "SELECT CAST(STRFTIME('%m', birth_date) AS INTEGER) AS birth_month,\n       COUNT(*) AS student_count\nFROM students\nGROUP BY birth_month;",
  },
  {
    id: 53, level: '中級', category: '関数',
    title: 'CASE 式で点数をランクに変換する',
    desc: "exam_results テーブルから result_id と score を取得し、score が 90 以上なら 'A'、80 以上なら 'B'、60 以上なら 'C'、それ以外は 'D' とした列を grade_label という名前で追加してください。CASE 式を使ってください。",
    hint: 'CASE WHEN 条件 THEN 値 ... ELSE 値 END の形で書きます。条件は上から順に評価されます。',
    answer: "SELECT result_id,\n       score,\n       CASE\n         WHEN score >= 90 THEN 'A'\n         WHEN score >= 80 THEN 'B'\n         WHEN score >= 60 THEN 'C'\n         ELSE 'D'\n       END AS grade_label\nFROM exam_results;",
    requiredKeywords: [{ keyword: 'CASE', label: 'CASE 式' }],
  },
  {
    id: 54, level: '初級', category: '関数',
    title: 'ROUND で平均点を小数第1位に丸める',
    desc: 'exam_results テーブルから subject_id ごとの平均点を、小数第1位までに丸めて avg_score という名前で取得してください。ROUND を使ってください。',
    hint: 'ROUND(数値, 桁数) で指定した桁数に丸められます。',
    answer: 'SELECT subject_id, ROUND(AVG(score), 1) AS avg_score\nFROM exam_results\nGROUP BY subject_id;',
    requiredKeywords: [{ keyword: 'ROUND', label: 'ROUND' }],
  },
  {
    id: 55, level: '上級', category: '関数',
    title: 'COALESCE でクラス未配属を表示する',
    desc: "students を基点に classrooms を LEFT JOIN し、全生徒の name と class_label を取得してください。クラスが未配属（NULL）の生徒は class_label を '未配属' と表示してください。",
    hint: 'COALESCE(列, 代わりの値) は、列が NULL のときに代わりの値を返します。',
    answer: "SELECT s.name,\n       COALESCE(c.class_label, '未配属') AS class_label\nFROM students s\nLEFT JOIN classrooms c ON s.classroom_id = c.classroom_id;",
    requiredKeywords: [
      { keyword: 'COALESCE', alt: ['IFNULL'], label: 'COALESCE（または IFNULL）' },
      { keyword: 'LEFT JOIN', label: 'LEFT JOIN' },
    ],
  },
  {
    id: 56, level: '上級', category: '関数',
    title: '条件付き集計で合格・不合格の件数を数える',
    desc: 'exam_results テーブルから subject_id ごとに、score が 60 以上の成績件数を pass_count、60 未満の成績件数を fail_count という名前で取得してください。SUM と CASE を組み合わせてください。',
    hint: 'CASE で条件に合う行だけ 1、それ以外は 0 にして、SUM で合計します。',
    answer: 'SELECT subject_id,\n       SUM(CASE WHEN score >= 60 THEN 1 ELSE 0 END) AS pass_count,\n       SUM(CASE WHEN score < 60  THEN 1 ELSE 0 END) AS fail_count\nFROM exam_results\nGROUP BY subject_id;',
    requiredKeywords: [{ keyword: 'CASE', label: 'CASE 式' }],
  },

  // ═══════════ 追加: JOIN / 集計（exams・attendances・teacher_subjects の活用） ═══════════
  {
    id: 57, level: '中級', category: 'JOIN',
    title: '試験ごとの平均点を求める',
    desc: 'exam_results と exams を結合し、試験名 exam_name ごとの平均点を avg_score という名前で取得してください。',
    hint: 'INNER JOIN exams e ON er.exam_id = e.exam_id のあと、GROUP BY e.exam_name。',
    answer: 'SELECT e.exam_name, AVG(er.score) AS avg_score\nFROM exam_results er\nINNER JOIN exams e ON er.exam_id = e.exam_id\nGROUP BY e.exam_name;',
  },
  {
    id: 58, level: '上級', category: 'JOIN',
    title: '成績が登録されていない試験を探す',
    desc: 'exams を基点に exam_results を LEFT JOIN し、成績が1件も登録されていない試験の exam_name を取得してください。',
    hint: 'exams に exam_results を LEFT JOIN し、er.result_id IS NULL で絞り込みます。',
    answer: 'SELECT e.exam_name\nFROM exams e\nLEFT JOIN exam_results er ON e.exam_id = er.exam_id\nWHERE er.result_id IS NULL;',
    requiredKeywords: [{ keyword: 'LEFT JOIN', label: 'LEFT JOIN' }, { keyword: 'IS NULL', label: 'IS NULL' }],
  },
  {
    id: 59, level: '上級', category: 'JOIN',
    title: '試験×科目ごとの平均点を求める',
    desc: 'exam_results・exams・subjects を結合し、試験名 exam_name と科目名 subject_name の組み合わせごとの平均点を avg_score という名前で取得してください。',
    hint: 'GROUP BY には、複数の列をカンマ区切りで指定できます。',
    answer: 'SELECT e.exam_name, sub.subject_name, AVG(er.score) AS avg_score\nFROM exam_results er\nINNER JOIN exams e ON er.exam_id = e.exam_id\nINNER JOIN subjects sub ON er.subject_id = sub.subject_id\nGROUP BY e.exam_name, sub.subject_name;',
  },
  {
    id: 60, level: '上級', category: 'JOIN',
    title: '自己結合で同じ学科の教員ペアを作る',
    desc: 'teachers テーブルを自己結合し、同じ学科（dept_id が同じ）に所属する教員のペアを取得してください。teacher_id が小さい方の name を teacher1、大きい方の name を teacher2 という名前で取得します。同じ組み合わせを重複して出さないでください。',
    hint: '同じテーブルに別名（t1, t2）を付けて2回結合します。t1.teacher_id < t2.teacher_id とすると、同じ組み合わせが2回出るのを防げます。',
    answer: 'SELECT t1.name AS teacher1, t2.name AS teacher2\nFROM teachers t1\nINNER JOIN teachers t2\n  ON t1.dept_id = t2.dept_id\n AND t1.teacher_id < t2.teacher_id;',
  },
  {
    id: 61, level: '中級', category: 'JOIN',
    title: '学科ごとの生徒数を集計する',
    desc: 'students・classrooms・departments を結合し、学科名 dept_name ごとの生徒数を student_count という名前で取得してください。',
    hint: 'students → classrooms → departments と段階的に JOIN し、GROUP BY d.dept_name。',
    answer: 'SELECT d.dept_name, COUNT(*) AS student_count\nFROM students s\nINNER JOIN classrooms c ON s.classroom_id = c.classroom_id\nINNER JOIN departments d ON c.dept_id = d.dept_id\nGROUP BY d.dept_name;',
  },
  {
    id: 62, level: '中級', category: '集計',
    title: '日付ごとの欠席者数を集計する',
    desc: "attendances テーブルから、status が '欠席' の記録を attend_date ごとに数え、attend_date と absent_count という名前で取得してください。",
    hint: 'WHERE で欠席の記録に絞ってから、GROUP BY attend_date で集計します。',
    answer: "SELECT attend_date, COUNT(*) AS absent_count\nFROM attendances\nWHERE status = '欠席'\nGROUP BY attend_date;",
  },
  {
    id: 63, level: '上級', category: '集計',
    title: '担当教員が複数いる科目を抽出する',
    desc: 'teacher_subjects と subjects を結合し、担当教員が2人以上いる科目について、科目名 subject_name と担当教員数 teacher_count を取得してください。',
    hint: '科目名ごとに GROUP BY し、HAVING COUNT(*) >= 2 で絞り込みます。',
    answer: 'SELECT sub.subject_name, COUNT(*) AS teacher_count\nFROM teacher_subjects ts\nINNER JOIN subjects sub ON ts.subject_id = sub.subject_id\nGROUP BY sub.subject_name\nHAVING COUNT(*) >= 2;',
    requiredKeywords: [{ keyword: 'HAVING', label: 'HAVING 句' }],
  },

  // ═══════════ 追加: サブクエリ / 応用 ═══════════
  {
    id: 64, level: '中級', category: 'サブクエリ',
    title: 'FROM 句のサブクエリで最も平均点が高い科目を求める',
    desc: 'exam_results から subject_id ごとの平均点（avg_score）を求める処理を FROM 句のサブクエリとして書き、その結果から平均点が最も高い科目の subject_id と avg_score を1行だけ取得してください。',
    hint: 'FROM (SELECT ... GROUP BY ...) のように、サブクエリの結果を1つのテーブルのように扱えます。外側で ORDER BY と LIMIT を使います。',
    answer: 'SELECT subject_id, avg_score\nFROM (\n  SELECT subject_id, AVG(score) AS avg_score\n  FROM exam_results\n  GROUP BY subject_id\n)\nORDER BY avg_score DESC\nLIMIT 1;',
    requiredKeywords: [{ keyword: 'FROM (SELECT', label: 'FROM 句のサブクエリ' }],
  },
  {
    id: 65, level: '上級', category: 'サブクエリ',
    title: 'WITH 句（CTE）で生徒ごとの平均点を使う',
    desc: 'WITH 句で、exam_results から生徒ごとの平均点 avg_score を求める student_avg を作り、それを students と結合して、平均点が 85 以上の生徒の name と avg_score を取得してください。',
    hint: 'WITH 名前 AS (SELECT ...) SELECT ... のように、先に定義した結果を後続の SELECT で使えます。',
    answer: 'WITH student_avg AS (\n  SELECT student_id, AVG(score) AS avg_score\n  FROM exam_results\n  GROUP BY student_id\n)\nSELECT s.name, sa.avg_score\nFROM student_avg sa\nINNER JOIN students s ON sa.student_id = s.student_id\nWHERE sa.avg_score >= 85;',
    requiredKeywords: [{ keyword: 'WITH', label: 'WITH 句' }],
  },
  {
    id: 66, level: '中級', category: '応用',
    title: 'UNION ALL で生徒と教員を1つの一覧にまとめる',
    desc: "students の name と teachers の name を1つの一覧にまとめてください。列は name と kind（生徒は '生徒'、教員は '教員'）とし、UNION ALL を使ってください。",
    hint: '各 SELECT の列数と並びを揃えて、UNION ALL でつなぎます。固定の文字列も列として取得できます。',
    answer: "SELECT name, '生徒' AS kind FROM students\nUNION ALL\nSELECT name, '教員' AS kind FROM teachers;",
    requiredKeywords: [{ keyword: 'UNION ALL', label: 'UNION ALL' }],
  },
  {
    id: 67, level: '上級', category: '応用',
    title: 'ウィンドウ関数 RANK で平均点の順位を付ける',
    desc: 'exam_results から student_id ごとの平均点を avg_score として求め、平均点の高い順に順位を rank_no として付けてください（同点は同順位）。RANK() OVER を使ってください。',
    hint: 'RANK() OVER (ORDER BY AVG(score) DESC) のように、集計結果に対して順位を付けられます。',
    answer: 'SELECT student_id,\n       AVG(score) AS avg_score,\n       RANK() OVER (ORDER BY AVG(score) DESC) AS rank_no\nFROM exam_results\nGROUP BY student_id;',
    requiredKeywords: [{ keyword: 'RANK', label: 'RANK()' }, { keyword: 'OVER', label: 'OVER' }],
  },
  {
    id: 68, level: '上級', category: '応用',
    title: 'PARTITION BY で科目ごとの最高得点の成績を取得する',
    desc: 'exam_results について、科目（subject_id）ごとに score の高い順で RANK() を付け、各科目で1位の成績（同点は全員）の subject_id・student_id・score を取得してください。RANK() OVER (PARTITION BY ...) を使ってください。',
    hint: 'ウィンドウ関数の結果は WHERE で直接使えません。サブクエリで包んでから、外側で順位 = 1 に絞ります。',
    answer: 'SELECT subject_id, student_id, score\nFROM (\n  SELECT subject_id, student_id, score,\n         RANK() OVER (PARTITION BY subject_id ORDER BY score DESC) AS rnk\n  FROM exam_results\n)\nWHERE rnk = 1;',
    requiredKeywords: [{ keyword: 'RANK', label: 'RANK()' }, { keyword: 'PARTITION BY', label: 'PARTITION BY' }],
  },

  // ═══════════ 追加: DDL / DML ═══════════
  {
    id: 69, level: '中級', category: 'DML',
    title: '点数を加算し、上限を100点に抑える',
    desc: 'exam_results テーブルで、exam_id が 1 かつ subject_id が 9（情報）の成績の score を 5 点加算してください。ただし 100 点を超えないようにしてください。',
    hint: '引数を2つ取る MIN(a, b) は小さい方の値を返します。CASE 式でも書けます。',
    answer: 'UPDATE exam_results\nSET score = MIN(score + 5, 100)\nWHERE exam_id = 1\n  AND subject_id = 9;',
  },
  {
    id: 70, level: '上級', category: 'DML',
    title: '成績のない試験をサブクエリで削除する',
    desc: 'exams テーブルから、exam_results に1件も成績が登録されていない試験を削除してください。サブクエリを使ってください。',
    hint: 'DELETE FROM テーブル WHERE 列 NOT IN (SELECT ...) の形で、他のテーブルにない行だけを削除できます。',
    answer: 'DELETE FROM exams\nWHERE exam_id NOT IN (\n  SELECT exam_id FROM exam_results\n);',
    requiredKeywords: [{ keyword: '(SELECT', label: 'サブクエリ' }],
  },
  {
    id: 71, level: '上級', category: 'DML',
    title: 'INSERT ... SELECT で別のテーブルにコピーする',
    desc: '次の2つを順番に（1回の実行でまとめて）行ってください。\n\n1. high_scores テーブルを作成する\n   列: student_id INTEGER, subject_id INTEGER, score INTEGER\n2. exam_results のうち score が 90 以上の成績の student_id・subject_id・score を、INSERT ... SELECT で high_scores に追加する',
    hint: 'INSERT INTO テーブル (列, ...) の後ろに、VALUES の代わりに SELECT を書けます。2つの文はセミコロンで区切ります。',
    answer: 'CREATE TABLE high_scores (\n  student_id INTEGER,\n  subject_id INTEGER,\n  score      INTEGER\n);\nINSERT INTO high_scores (student_id, subject_id, score)\nSELECT student_id, subject_id, score\nFROM exam_results\nWHERE score >= 90;',
    requiredKeywords: [{ keyword: 'SELECT', label: 'INSERT ... SELECT' }],
  },
  {
    id: 72, level: '初級', category: 'DDL',
    title: 'テーブルを削除する',
    desc: 'attendances テーブルを削除してください。',
    hint: 'DROP TABLE テーブル名',
    answer: 'DROP TABLE attendances;',
  },
  {
    id: 73, level: '上級', category: 'DDL',
    title: '制約付きテーブルを作成する',
    desc: '次の仕様でテーブルを作成してください。\n\nテーブル名: rooms\n列:\n  room_id      INTEGER  PRIMARY KEY\n  room_name    TEXT     NOT NULL かつ UNIQUE（重複不可）\n  capacity     INTEGER  CHECK 制約: 0 より大きい値のみ\n  is_available INTEGER  DEFAULT 1',
    hint: '列定義の後ろに、NOT NULL / UNIQUE / CHECK (条件) / DEFAULT 値 を並べて書けます。',
    answer: 'CREATE TABLE rooms (\n  room_id      INTEGER PRIMARY KEY,\n  room_name    TEXT    NOT NULL UNIQUE,\n  capacity     INTEGER CHECK (capacity > 0),\n  is_available INTEGER DEFAULT 1\n);',
    probes: [
      { label: 'capacity が 0 以下の行を登録できてしまう',
        sql: "INSERT INTO rooms (room_id, room_name, capacity) VALUES (1, 'A101', 0)", fails: true },
      { label: 'room_name が重複する行を登録できてしまう',
        sql: "INSERT INTO rooms (room_id, room_name, capacity) VALUES (1, 'A101', 30); INSERT INTO rooms (room_id, room_name, capacity) VALUES (2, 'A101', 30)", fails: true },
      { label: '正しいデータを登録できない',
        sql: "INSERT INTO rooms (room_id, room_name, capacity) VALUES (1, 'A101', 30)", fails: false },
    ],
  },
]
