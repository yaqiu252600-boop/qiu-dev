import csv
import json
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DB_PATH = ROOT / "data" / "gaokao-trusted.sqlite"
SCHEMA_PATH = ROOT / "data" / "schema.sql"

EXPECTED_MINIMUMS = {
    "universities": 2952,
    "admission_scores": 138782,
    "admission_scores:江苏": 11944,
    "admission_scores:山东": 60909,
    "admission_scores:浙江": 51939,
    "admission_scores:广东": 13990,
}


def read_csv(path: Path):
    if not path.exists():
        return []

    with path.open("r", encoding="utf-8-sig", newline="") as file:
        return list(csv.DictReader(file))


def read_csv_dir(path: Path):
    rows = []
    if not path.exists():
        return rows

    for file_path in sorted(path.rglob("*.csv")):
        rows.extend(read_csv(file_path))
    return rows


def table_columns(connection, table):
    return {
        row[1]
        for row in connection.execute(f"PRAGMA table_info({table})").fetchall()
    }


def insert_rows(connection, table, rows):
    if not rows:
        return 0

    allowed_columns = table_columns(connection, table)
    keys = sorted({key for row in rows for key in row.keys()} & allowed_columns)

    if not keys:
        raise RuntimeError(f"No importable columns for {table}")

    placeholders = ",".join(["?"] * len(keys))
    columns = ",".join(keys)
    sql = f"INSERT OR REPLACE INTO {table} ({columns}) VALUES ({placeholders})"
    connection.executemany(sql, [[row.get(key) or None for key in keys] for row in rows])
    return len(rows)


def create_indexes(connection):
    connection.executescript(
        """
        CREATE INDEX IF NOT EXISTS idx_universities_name_province
          ON universities(name, province);
        CREATE INDEX IF NOT EXISTS idx_universities_school_code
          ON universities(school_code);
        CREATE INDEX IF NOT EXISTS idx_admission_scores_lookup
          ON admission_scores(province, year, subject_type, university_name);
        CREATE INDEX IF NOT EXISTS idx_admission_scores_score
          ON admission_scores(province, year, subject_type, min_score);
        CREATE INDEX IF NOT EXISTS idx_admission_scores_rank
          ON admission_scores(province, year, subject_type, min_rank);
        CREATE INDEX IF NOT EXISTS idx_score_segments_lookup
          ON score_segments(province, year, subject_type, score);
        CREATE INDEX IF NOT EXISTS idx_admission_plans_lookup
          ON admission_plans(province, year, subject_type, university_name);
        """
    )


def scalar(connection, sql, params=()):
    return connection.execute(sql, params).fetchone()[0]


def verify_counts(connection, counts):
    province_counts = {
        province: scalar(
            connection,
            "SELECT COUNT(*) FROM admission_scores WHERE province = ?",
            (province,),
        )
        for province in ["江苏", "山东", "浙江", "广东"]
    }

    failures = []
    for key, minimum in EXPECTED_MINIMUMS.items():
        if ":" in key:
            table, province = key.split(":", 1)
            actual = province_counts[province] if table == "admission_scores" else 0
        else:
            actual = counts.get(key, 0)

        if actual < minimum:
            failures.append(f"{key} expected >= {minimum}, got {actual}")

    if failures:
        raise RuntimeError("SQLite verification failed: " + "; ".join(failures))

    return province_counts


def main():
    if DB_PATH.exists():
        DB_PATH.unlink()

    connection = sqlite3.connect(DB_PATH)
    connection.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))

    counts = {
        "universities": insert_rows(
            connection,
            "universities",
            read_csv(ROOT / "data" / "processed" / "universities" / "moe_universities_2026.csv"),
        ),
        "admission_scores": insert_rows(
            connection,
            "admission_scores",
            read_csv_dir(ROOT / "data" / "processed" / "admission-scores"),
        ),
        "score_segments": insert_rows(
            connection,
            "score_segments",
            read_csv_dir(ROOT / "data" / "processed" / "score-segments"),
        ),
        "admission_plans": insert_rows(
            connection,
            "admission_plans",
            read_csv_dir(ROOT / "data" / "processed" / "admission-plans"),
        ),
    }

    create_indexes(connection)
    province_counts = verify_counts(connection, counts)
    connection.commit()
    connection.close()
    print(
        json.dumps(
            {
                "ok": True,
                "database": str(DB_PATH),
                "counts": counts,
                "admission_scores_by_province": province_counts,
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
