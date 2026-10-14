/** SQLite スキーマ定義（学園業務システム） */
export const SCHEMA_SQL = `
CREATE TABLE departments (
  dept_id   INTEGER PRIMARY KEY,
  dept_name TEXT NOT NULL,
  est_year  INTEGER
);
CREATE TABLE teachers (
  teacher_id INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  dept_id    INTEGER REFERENCES departments(dept_id),
  hire_date  TEXT,
  is_active  INTEGER
);
CREATE TABLE classrooms (
  classroom_id INTEGER PRIMARY KEY,
  grade        INTEGER NOT NULL,
  class_label  TEXT NOT NULL,
  dept_id      INTEGER REFERENCES departments(dept_id),
  teacher_id   INTEGER REFERENCES teachers(teacher_id)
);
CREATE TABLE students (
  student_id   INTEGER PRIMARY KEY,
  name         TEXT NOT NULL,
  classroom_id INTEGER REFERENCES classrooms(classroom_id),
  enroll_year  INTEGER,
  birth_date   TEXT,
  gender       TEXT,
  status       TEXT
);
CREATE TABLE subjects (
  subject_id   INTEGER PRIMARY KEY,
  subject_name TEXT NOT NULL,
  category     TEXT,
  credits      INTEGER,
  is_required  INTEGER
);
CREATE TABLE teacher_subjects (
  ts_id      INTEGER PRIMARY KEY,
  teacher_id INTEGER REFERENCES teachers(teacher_id),
  subject_id INTEGER REFERENCES subjects(subject_id)
);
CREATE TABLE exams (
  exam_id   INTEGER PRIMARY KEY,
  exam_name TEXT NOT NULL,
  exam_type TEXT,
  term      TEXT,
  exam_date TEXT
);
CREATE TABLE exam_results (
  result_id  INTEGER PRIMARY KEY,
  exam_id    INTEGER REFERENCES exams(exam_id),
  student_id INTEGER REFERENCES students(student_id),
  subject_id INTEGER REFERENCES subjects(subject_id),
  score      INTEGER
);
CREATE TABLE attendances (
  attendance_id INTEGER PRIMARY KEY,
  student_id    INTEGER REFERENCES students(student_id),
  attend_date   TEXT,
  status        TEXT
);
`

/** シードデータ */
export const SEED_SQL = `
INSERT INTO departments VALUES
  (1, '普通科',   1998),
  (2, '理数科',   2005),
  (3, '国際科',   2012),
  (4, '体育科',   2015);

INSERT INTO teachers VALUES
  (1,  '斎藤 健一', 1, '2010-04-01', 1),
  (2,  '大野 聡子', 1, '2013-04-01', 1),
  (3,  '前田 直樹', 2, '2008-04-01', 1),
  (4,  '橋本 由美', 2, '2016-04-01', 1),
  (5,  '石川 浩二', 3, '2012-04-01', 1),
  (6,  '村上 千春', 3, '2019-04-01', 1),
  (7,  '福田 隆',   4, '2006-04-01', 1),
  (8,  '岡田 美和', 1, '2021-04-01', 1),
  (9,  '西村 和彦', 2, '2000-04-01', 0),
  (10, '藤井 恵子', 4, '2023-04-01', 1);

INSERT INTO classrooms VALUES
  (1, 1, 'A', 1, 1),
  (2, 1, 'B', 1, 2),
  (3, 2, 'A', 2, 3),
  (4, 2, 'B', 2, 4),
  (5, 3, 'A', 3, 5),
  (6, 3, 'B', 4, 7),
  (7, 2, 'C', 1, NULL);  -- 担任未定のクラス（LEFT JOIN の学習用）

INSERT INTO students VALUES
  (1,  '青木 遥',   3, 2023, '2007-05-14', 'F', '在籍'),
  (2,  '伊藤 大輔', 3, 2023, '2007-08-02', 'M', '在籍'),
  (3,  '上田 彩',   3, 2023, '2008-01-20', 'F', '在籍'),
  (4,  '遠藤 翔太', 3, 2023, '2007-11-11', 'M', '在籍'),
  (5,  '小川 美咲', 3, 2023, '2007-03-30', 'F', '休学'),
  (6,  '加藤 蓮',   4, 2023, '2007-07-07', 'M', '在籍'),
  (7,  '木村 さくら', 4, 2023, '2008-02-18', 'F', '在籍'),
  (8,  '工藤 悠真', 4, 2023, '2007-09-25', 'M', '在籍'),
  (9,  '小林 結衣', 4, 2023, '2007-12-05', 'F', '在籍'),
  (10, '佐藤 陽菜', 4, 2023, '2008-04-14', 'F', '在籍'),
  (11, '鈴木 颯太', 5, 2022, '2006-06-21', 'M', '在籍'),
  (12, '高橋 美月', 5, 2022, '2006-10-10', 'F', '在籍'),
  (13, '田中 健', 5, 2022, '2006-01-29', 'M', '退学'),
  (14, '中村 莉子', 6, 2022, '2006-08-17', 'F', '在籍'),
  (15, '西 大和',   6, 2022, '2006-05-03', 'M', '在籍'),
  (16, '野口 愛', 1, 2024, '2008-07-19', 'F', '在籍'),
  (17, '橋本 樹', 1, 2024, '2008-11-28', 'M', '在籍'),
  (18, '長谷川 凛', 1, 2024, '2008-09-09', 'F', '在籍'),
  (19, '平野 翼', 2, 2024, '2008-02-02', 'M', '在籍'),
  (20, '松井 優花', 2, 2024, '2008-12-24', 'F', '在籍'),
  (21, '三浦 拓海', NULL, 2024, '2008-03-03', 'M', '在籍');  -- クラス未配属（IS NULL / LEFT JOIN の学習用）

INSERT INTO subjects VALUES
  (1, '国語',     '文系', 4, 1),
  (2, '数学I',    '理系', 4, 1),
  (3, '数学II',   '理系', 3, 0),
  (4, '英語',     '文系', 4, 1),
  (5, '物理',     '理系', 3, 0),
  (6, '化学',     '理系', 3, 0),
  (7, '世界史',   '文系', 2, 0),
  (8, '保健体育', '実技', 2, 1),
  (9, '情報',     '理系', 2, 1);

INSERT INTO teacher_subjects VALUES
  (1,  1, 1), (2,  1, 7),
  (3,  2, 4),
  (4,  3, 2), (5,  3, 3),
  (6,  4, 5), (7,  4, 6),
  (8,  5, 4), (9,  5, 7),
  (10, 6, 1),
  (11, 7, 8),
  (12, 8, 9),
  (13, 10, 8);

INSERT INTO exams VALUES
  (1, '前期中間', '中間', '前期', '2024-05-20'),
  (2, '前期期末', '期末', '前期', '2024-07-10'),
  (3, '後期中間', '中間', '後期', '2024-11-18'),
  (4, '後期期末', '期末', '後期', '2025-02-12');

-- exam_results: 試験1・2について、在籍生徒の一部に主要4科目(1,2,4,9)の点数を付与
INSERT INTO exam_results VALUES
  -- 前期中間(exam 1)
  (1,  1, 1, 1, 72), (2,  1, 1, 2, 65), (3,  1, 1, 4, 80), (4,  1, 1, 9, 88),
  (5,  1, 2, 1, 90), (6,  1, 2, 2, 78), (7,  1, 2, 4, 85), (8,  1, 2, 9, 70),
  (9,  1, 3, 1, 55), (10, 1, 3, 2, 60), (11, 1, 3, 4, 68), (12, 1, 3, 9, 72),
  (13, 1, 4, 2, 95), (14, 1, 4, 5, 91), (15, 1, 4, 6, 88), (16, 1, 4, 9, 93),
  (17, 1, 6, 1, 83), (18, 1, 6, 4, 77), (19, 1, 6, 7, 80), (20, 1, 6, 9, 85),
  (21, 1, 7, 1, 68), (22, 1, 7, 4, 72), (23, 1, 7, 7, 90), (24, 1, 7, 9, 66),
  (25, 1, 11, 2, 100),(26, 1, 11, 5, 95),(27, 1, 11, 6, 92),(28, 1, 11, 9, 98),
  (29, 1, 14, 1, 76), (30, 1, 14, 4, 82), (31, 1, 14, 8, 88), (32, 1, 14, 9, 74),
  -- 前期期末(exam 2)
  (33, 2, 1, 1, 78), (34, 2, 1, 2, 70), (35, 2, 1, 4, 82), (36, 2, 1, 9, 90),
  (37, 2, 2, 1, 88), (38, 2, 2, 2, 80), (39, 2, 2, 4, 86), (40, 2, 2, 9, 75),
  (41, 2, 3, 1, 60), (42, 2, 3, 2, 58), (43, 2, 3, 4, 70), (44, 2, 3, 9, 68),
  (45, 2, 4, 2, 98), (46, 2, 4, 5, 94), (47, 2, 4, 6, 90), (48, 2, 4, 9, 96),
  (49, 2, 6, 1, 85), (50, 2, 6, 4, 79), (51, 2, 6, 7, 83), (52, 2, 6, 9, 88),
  (53, 2, 7, 1, 72), (54, 2, 7, 4, 75), (55, 2, 7, 7, 92), (56, 2, 7, 9, 70),
  (57, 2, 11, 2, 99),(58, 2, 11, 5, 97),(59, 2, 11, 6, 95),(60, 2, 11, 9, 100),
  (61, 2, 14, 1, 80), (62, 2, 14, 4, 85), (63, 2, 14, 8, 90), (64, 2, 14, 9, 78);

-- attendances: 2024-06-03〜06-07 の5日分、一部生徒の出欠
INSERT INTO attendances VALUES
  (1,  1, '2024-06-03', '出席'), (2,  1, '2024-06-04', '出席'), (3,  1, '2024-06-05', '欠席'), (4,  1, '2024-06-06', '出席'), (5,  1, '2024-06-07', '出席'),
  (6,  2, '2024-06-03', '出席'), (7,  2, '2024-06-04', '遅刻'), (8,  2, '2024-06-05', '出席'), (9,  2, '2024-06-06', '出席'), (10, 2, '2024-06-07', '出席'),
  (11, 3, '2024-06-03', '欠席'), (12, 3, '2024-06-04', '欠席'), (13, 3, '2024-06-05', '欠席'), (14, 3, '2024-06-06', '出席'), (15, 3, '2024-06-07', '出席'),
  (16, 4, '2024-06-03', '出席'), (17, 4, '2024-06-04', '出席'), (18, 4, '2024-06-05', '出席'), (19, 4, '2024-06-06', '出席'), (20, 4, '2024-06-07', '出席'),
  (21, 6, '2024-06-03', '出席'), (22, 6, '2024-06-04', '出席'), (23, 6, '2024-06-05', '遅刻'), (24, 6, '2024-06-06', '欠席'), (25, 6, '2024-06-07', '出席'),
  (26, 7, '2024-06-03', '出席'), (27, 7, '2024-06-04', '出席'), (28, 7, '2024-06-05', '出席'), (29, 7, '2024-06-06', '出席'), (30, 7, '2024-06-07', '欠席'),
  (31, 11,'2024-06-03', '出席'), (32, 11,'2024-06-04', '出席'), (33, 11,'2024-06-05', '出席'), (34, 11,'2024-06-06', '出席'), (35, 11,'2024-06-07', '出席'),
  (36, 14,'2024-06-03', '遅刻'), (37, 14,'2024-06-04', '出席'), (38, 14,'2024-06-05', '出席'), (39, 14,'2024-06-06', '欠席'), (40, 14,'2024-06-07', '出席');
`

/** ER図テーブル定義 */
export const ER_TABLES = [
  { id: 'departments',     label: 'departments',     x: 20,  y: 20,  w: 210, cols: ['dept_id PK', 'dept_name', 'est_year'] },
  { id: 'teachers',        label: 'teachers',        x: 280, y: 20,  w: 220, cols: ['teacher_id PK', 'name', 'dept_id FK', 'hire_date', 'is_active'] },
  { id: 'classrooms',      label: 'classrooms',      x: 560, y: 20,  w: 220, cols: ['classroom_id PK', 'grade', 'class_label', 'dept_id FK', 'teacher_id FK'] },
  { id: 'students',        label: 'students',        x: 840, y: 20,  w: 230, cols: ['student_id PK', 'name', 'classroom_id FK', 'enroll_year', 'birth_date', 'gender', 'status'] },
  { id: 'subjects',        label: 'subjects',        x: 20,  y: 360, w: 220, cols: ['subject_id PK', 'subject_name', 'category', 'credits', 'is_required'] },
  { id: 'teacher_subjects',label: 'teacher_subjects',x: 300, y: 360, w: 220, cols: ['ts_id PK', 'teacher_id FK', 'subject_id FK'] },
  { id: 'exams',           label: 'exams',           x: 580, y: 360, w: 220, cols: ['exam_id PK', 'exam_name', 'exam_type', 'term', 'exam_date'] },
  { id: 'exam_results',    label: 'exam_results',    x: 300, y: 560, w: 230, cols: ['result_id PK', 'exam_id FK', 'student_id FK', 'subject_id FK', 'score'] },
  { id: 'attendances',     label: 'attendances',     x: 580, y: 560, w: 220, cols: ['attendance_id PK', 'student_id FK', 'attend_date', 'status'] },
] as const

/** ER図リレーション定義 */
export const ER_RELATIONS = [
  { from: 'teachers',         to: 'departments', label: 'dept_id' },
  { from: 'classrooms',       to: 'departments', label: 'dept_id' },
  { from: 'classrooms',       to: 'teachers',    label: 'teacher_id' },
  { from: 'students',         to: 'classrooms',  label: 'classroom_id' },
  { from: 'teacher_subjects', to: 'teachers',    label: 'teacher_id' },
  { from: 'teacher_subjects', to: 'subjects',    label: 'subject_id' },
  { from: 'exam_results',     to: 'exams',       label: 'exam_id' },
  { from: 'exam_results',     to: 'students',    label: 'student_id' },
  { from: 'exam_results',     to: 'subjects',    label: 'subject_id' },
  { from: 'attendances',      to: 'students',    label: 'student_id' },
] as const

/** 全テーブル名一覧 */
export const TABLE_NAMES = [
  'departments',
  'teachers',
  'classrooms',
  'students',
  'subjects',
  'teacher_subjects',
  'exams',
  'exam_results',
  'attendances',
] as const
