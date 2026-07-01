CREATE TABLE IF NOT EXISTS universities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  school_code TEXT NOT NULL UNIQUE,
  province TEXT,
  city TEXT,
  authority TEXT,
  education_level TEXT,
  school_type TEXT,
  ownership TEXT,
  remark TEXT,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_updated_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS score_segments (
  id TEXT PRIMARY KEY,
  year INTEGER NOT NULL,
  province TEXT NOT NULL,
  subject_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  same_score_count INTEGER,
  cumulative_count INTEGER NOT NULL,
  rank_min INTEGER,
  rank_max INTEGER,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_updated_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(year, province, subject_type, score)
);

CREATE TABLE IF NOT EXISTS admission_scores (
  id TEXT PRIMARY KEY,
  year INTEGER NOT NULL,
  province TEXT NOT NULL,
  subject_type TEXT NOT NULL,
  batch_name TEXT NOT NULL,
  university_code TEXT NOT NULL,
  university_name TEXT NOT NULL,
  major_group_code TEXT,
  major_code TEXT,
  major_name TEXT,
  min_score INTEGER NOT NULL,
  min_rank INTEGER,
  plan_type TEXT,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_updated_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(year, province, subject_type, batch_name, university_code, major_group_code, major_name)
);

CREATE TABLE IF NOT EXISTS admission_plans (
  id TEXT PRIMARY KEY,
  year INTEGER NOT NULL,
  province TEXT NOT NULL,
  subject_type TEXT NOT NULL,
  batch_name TEXT NOT NULL,
  university_code TEXT NOT NULL,
  university_name TEXT NOT NULL,
  major_group_code TEXT,
  major_code TEXT,
  major_name TEXT NOT NULL,
  plan_count INTEGER,
  tuition TEXT,
  duration TEXT,
  requirements TEXT,
  remark TEXT,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_updated_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(year, province, subject_type, batch_name, university_code, major_group_code, major_code, major_name)
);

CREATE TABLE IF NOT EXISTS data_import_jobs (
  id TEXT PRIMARY KEY,
  data_type TEXT NOT NULL,
  province TEXT,
  year INTEGER,
  filename TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  status TEXT NOT NULL,
  total_rows INTEGER NOT NULL DEFAULT 0,
  success_rows INTEGER NOT NULL DEFAULT 0,
  failed_rows INTEGER NOT NULL DEFAULT 0,
  error_log TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
