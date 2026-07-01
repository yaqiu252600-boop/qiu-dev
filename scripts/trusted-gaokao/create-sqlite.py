import csv
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DB_PATH = ROOT / "data" / "gaokao-trusted.sqlite"
SCHEMA_PATH = ROOT / "data" / "schema.sql"


def read_csv(path: Path):
    if not path.exists():
        return []

    with path.open("r", encoding="utf-8-sig", newline="") as file:
        return list(csv.DictReader(file))


def read_csv_dir(path: Path):
    rows = []
    if not path.exists():
        return rows

    for file_path in sorted(path.glob("*.csv")):
        rows.extend(read_csv(file_path))
    return rows


def insert_rows(connection, table, rows):
    if not rows:
        return 0

    keys = list(rows[0].keys())
    placeholders = ",".join(["?"] * len(keys))
    columns = ",".join(keys)
    sql = f"INSERT OR REPLACE INTO {table} ({columns}) VALUES ({placeholders})"
    connection.executemany(sql, [[row.get(key) or None for key in keys] for row in rows])
    return len(rows)


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

    connection.commit()
    connection.close()
    print(counts)
    print(DB_PATH)


if __name__ == "__main__":
    main()
