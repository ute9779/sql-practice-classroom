/** SQLite スキーマ定義（高校舞台） */
export const SCHEMA_SQL = `
CREATE TABLE classes (
  class_id   INTEGER PRIMARY KEY,
  grade      INTEGER NOT NULL,
  class_name TEXT NOT NULL,
  homeroom   TEXT
);
CREATE TABLE students (
  student_id   INTEGER PRIMARY KEY,
  name         TEXT NOT NULL,
  age          INTEGER,
  class_id     INTEGER REFERENCES classes(class_id),
  admission    TEXT,
  birthday     TEXT,
  blood_type   TEXT,
  height_cm    INTEGER,
  weight_kg    INTEGER,
  dominant_hand TEXT,
  hometown     TEXT,
  residence    TEXT
);
CREATE TABLE subjects (
  subject_id   INTEGER PRIMARY KEY,
  subject_name TEXT NOT NULL,
  category     TEXT
);
CREATE TABLE scores (
  score_id   INTEGER PRIMARY KEY,
  student_id INTEGER REFERENCES students(student_id),
  subject_id INTEGER REFERENCES subjects(subject_id),
  score      INTEGER,
  term       TEXT
);
CREATE TABLE clubs (
  club_id   INTEGER PRIMARY KEY,
  club_name TEXT NOT NULL,
  category  TEXT
);
CREATE TABLE club_members (
  member_id  INTEGER PRIMARY KEY,
  student_id INTEGER REFERENCES students(student_id),
  club_id    INTEGER REFERENCES clubs(club_id),
  role       TEXT
);
CREATE TABLE events (
  event_id   INTEGER PRIMARY KEY,
  event_name TEXT NOT NULL,
  event_date TEXT,
  location   TEXT
);
`

/** シードデータ */
export const SEED_SQL = `
INSERT INTO classes VALUES
  (1, 1, '1組', '山田先生'),
  (2, 1, '2組', '佐藤先生'),
  (3, 3, '1組', '鈴木先生');

INSERT INTO students VALUES
  (1,  '花海 咲季',   16, 1, '外部生', '04月02日', 'A',  152, 45, '左',   '愛知県',     '寮'),
  (2,  '月村 手毬',   15, 1, '内部生', '06月03日', 'AB', 162, 51, '右',   '京都府',     '寮'),
  (3,  '藤田 ことね', 15, 1, '内部生', '04月29日', 'O',  156, 40, '右',   '埼玉県',     '寮'),
  (4,  '姫崎 莉波',   17, 3, '外部生', '03月05日', 'A',  166, 56, '右',   '福岡県',     '寮'),
  (5,  '紫雲 清夏',   15, 1, '外部生', '11月11日', 'O',  168, 54, '左',   '北海道',     '寮'),
  (6,  '篠澤 広',     15, 2, '外部生', '12月21日', 'AB', 159, 41, '左',   '秋田県',     '寮'),
  (7,  '葛城 リーリヤ', 15, 1, '外部生', '07月24日', 'B',  161, 43, '右',   'スウェーデン', '寮'),
  (8,  '倉本 千奈',   15, 2, '外部生', '08月01日', 'O',  148, 43, '右',   '神奈川県',   '別荘'),
  (9,  '有村 麻央',   17, 3, '外部生', '01月18日', 'A',  157, 46, '右',   '兵庫県',     '寮'),
  (10, '花海 佑芽',   15, 2, '外部生', '04月01日', 'AB', 158, 50, '右',   '愛知県',     '寮'),
  (11, '十王 星南',   17, 3, '内部生', '12月07日', 'A',  170, 54, '両',   '東京都',     '自宅'),
  (12, '秦谷 美鈴',   15, 2, '内部生', '02月06日', 'B',  160, 42, '右',   '京都府',     '寮'),
  (13, '雨夜 燕',     17, 3, '内部生', '05月20日', 'A',  169, 51, '右',   '東京都',     '自宅'),
  (14, '賀陽 燐羽',  15, NULL, '内部生', NULL, NULL, 154, NULL, NULL, NULL, NULL);

INSERT INTO subjects VALUES
  (1, '国語',     '文系'),
  (2, '数学',     '理系'),
  (3, '英語',     '文系'),
  (4, '理科',     '理系'),
  (5, '社会',     '文系'),
  (6, '音楽',     '芸術'),
  (7, '体育',     '実技'),
  (8, 'プログラミング', '理系');

INSERT INTO scores VALUES
  (1,  1,  1, 88, '前期'), (2,  1,  2, 72, '前期'), (3,  1,  3, 91, '前期'), (4,  1,  4, 68, '前期'), (5,  1,  6, 95, '前期'),
  (6,  2,  1, 76, '前期'), (7,  2,  2, 84, '前期'), (8,  2,  3, 80, '前期'), (9,  2,  6, 99, '前期'), (10, 2,  7, 88, '前期'),
  (11, 3,  1, 92, '前期'), (12, 3,  2, 78, '前期'), (13, 3,  3, 85, '前期'), (14, 3,  6, 97, '前期'), (15, 3,  8, 90, '前期'),
  (16, 4,  1, 80, '前期'), (17, 4,  2, 65, '前期'), (18, 4,  3, 77, '前期'), (19, 4,  5, 82, '前期'), (20, 4,  6, 88, '前期'),
  (21, 5,  1, 70, '前期'), (22, 5,  2, 90, '前期'), (23, 5,  3, 74, '前期'), (24, 5,  4, 93, '前期'), (25, 5,  8, 88, '前期'),
  (26, 6,  1, 65, '前期'), (27, 6,  2, 88, '前期'), (28, 6,  3, 69, '前期'), (29, 6,  4, 82, '前期'), (30, 6,  8, 91, '前期'),
  (31, 7,  1, 78, '前期'), (32, 7,  2, 55, '前期'), (33, 7,  3, 96, '前期'), (34, 7,  5, 74, '前期'), (35, 7,  6, 85, '前期'),
  (36, 8,  1, 82, '前期'), (37, 8,  2, 60, '前期'), (38, 8,  3, 88, '前期'), (39, 8,  7, 92, '前期'), (40, 8,  6, 78, '前期'),
  (41, 9,  1, 90, '前期'), (42, 9,  2, 75, '前期'), (43, 9,  3, 83, '前期'), (44, 9,  5, 91, '前期'), (45, 9,  6, 94, '前期'),
  (46, 10, 1, 85, '前期'), (47, 10, 2, 70, '前期'), (48, 10, 3, 88, '前期'), (49, 10, 6, 96, '前期'), (50, 10, 7, 80, '前期'),
  (51, 11, 1, 95, '前期'), (52, 11, 2, 88, '前期'), (53, 11, 3, 92, '前期'), (54, 11, 4, 85, '前期'), (55, 11, 8, 97, '前期'),
  (56, 12, 1, 73, '前期'), (57, 12, 2, 91, '前期'), (58, 12, 3, 78, '前期'), (59, 12, 4, 86, '前期'), (60, 12, 8, 89, '前期'),
  (61, 13, 1, 88, '前期'), (62, 13, 2, 82, '前期'), (63, 13, 3, 90, '前期'), (64, 13, 5, 87, '前期'), (65, 13, 6, 91, '前期');

INSERT INTO clubs VALUES
  (1, 'ライトミュージック部', '音楽'),
  (2, '演劇部',             '芸術'),
  (3, '陸上部',             '運動'),
  (4, 'バスケットボール部',  '運動'),
  (5, '料理部',             '文化'),
  (6, '写真部',             '文化'),
  (7, '合唱部',             '音楽');

INSERT INTO club_members VALUES
  (1,  1,  1, '部長'),
  (2,  2,  1, '副部長'),
  (3,  3,  1, '部員'),
  (4,  5,  1, '部員'),
  (5,  7,  1, '部員'),
  (6,  4,  2, '部長'),
  (7,  9,  2, '副部長'),
  (8,  13, 2, '部員'),
  (9,  6,  3, '部員'),
  (10, 11, 3, '部員'),
  (11, 8,  4, '部員'),
  (12, 10, 5, '部員'),
  (13, 12, 6, '部員'),
  (14, 4,  7, '部員'),
  (15, 9,  7, '部員');

INSERT INTO events VALUES
  (1, '入学式',     '2024-04-08', '体育館'),
  (2, '体育祭',     '2024-05-25', 'グラウンド'),
  (3, '校内音楽祭', '2024-07-12', '大ホール'),
  (4, '夏季合宿',   '2024-08-10', '軽井沢'),
  (5, '文化祭',     '2024-10-19', '校内全域'),
  (6, '球技大会',   '2024-11-30', '体育館'),
  (7, '修学旅行',   '2024-12-05', '京都・奈良'),
  (8, '卒業式',     '2025-03-01', '体育館');
`

/** ER図テーブル定義 */
export const ER_TABLES = [
  // 上段
  { id: 'classes',      label: 'classes',      x: 20,  y: 20,  w: 210, cols: ['class_id PK', 'grade', 'class_name', 'homeroom'] },
  { id: 'students',     label: 'students',     x: 280, y: 20,  w: 230, cols: ['student_id PK', 'name', 'class_id FK', 'age', 'admission', 'birthday', 'blood_type', 'height_cm', 'weight_kg', 'dominant_hand', 'hometown', 'residence'] },
  { id: 'subjects',     label: 'subjects',     x: 560, y: 20,  w: 220, cols: ['subject_id PK', 'subject_name', 'category'] },
  { id: 'scores',       label: 'scores',       x: 830, y: 20,  w: 220, cols: ['score_id PK', 'student_id FK', 'subject_id FK', 'score', 'term'] },
  // 下段
  { id: 'clubs',        label: 'clubs',        x: 20,  y: 430, w: 210, cols: ['club_id PK', 'club_name', 'category'] },
  { id: 'club_members', label: 'club_members', x: 280, y: 430, w: 220, cols: ['member_id PK', 'student_id FK', 'club_id FK', 'role'] },
  { id: 'events',       label: 'events',       x: 560, y: 430, w: 220, cols: ['event_id PK', 'event_name', 'event_date', 'location'] },
] as const

/** ER図リレーション定義 */
export const ER_RELATIONS = [
  { from: 'students',     to: 'classes',  label: 'class_id' },
  { from: 'scores',       to: 'students', label: 'student_id' },
  { from: 'scores',       to: 'subjects', label: 'subject_id' },
  { from: 'club_members', to: 'students', label: 'student_id' },
  { from: 'club_members', to: 'clubs',    label: 'club_id' },
] as const

/** 全テーブル名一覧 */
export const TABLE_NAMES = [
  'classes',
  'students',
  'subjects',
  'scores',
  'clubs',
  'club_members',
  'events',
] as const
