import csv
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PY_DEPS = ROOT / "work" / "python-deps"

if PY_DEPS.exists():
    sys.path.insert(0, str(PY_DEPS))

import pandas as pd

FILES = [
    {
        "year": 2024,
        "subject_type": "history",
        "subject_label": "历史",
        "raw": ROOT
        / "data"
        / "raw"
        / "jiangsu"
        / "2024-admission-scores"
        / "jiangsu_2024_undergraduate_history.xls",
        "processed": ROOT
        / "data"
        / "processed"
        / "admission-scores"
        / "jiangsu_2024_undergraduate_history.csv",
        "source_url": "https://www.jseea.cn/webfile/index/index_zkxx/2024-07-18/7219509116052443136.html",
        "source_updated_at": "2024-07-18",
    },
    {
        "year": 2024,
        "subject_type": "physics",
        "subject_label": "物理",
        "raw": ROOT
        / "data"
        / "raw"
        / "jiangsu"
        / "2024-admission-scores"
        / "jiangsu_2024_undergraduate_physics.xls",
        "processed": ROOT
        / "data"
        / "processed"
        / "admission-scores"
        / "jiangsu_2024_undergraduate_physics.csv",
        "source_url": "https://www.jseea.cn/webfile/index/index_zkxx/2024-07-18/7219509116052443136.html",
        "source_updated_at": "2024-07-18",
    },
    {
        "year": 2023,
        "subject_type": "physics",
        "subject_label": "物理",
        "raw": ROOT
        / "data"
        / "raw"
        / "jiangsu"
        / "2023-admission-scores"
        / "jiangsu_2023_undergraduate_physics.xls",
        "processed": ROOT
        / "data"
        / "processed"
        / "admission-scores"
        / "jiangsu_2023_undergraduate_physics.csv",
        "source_url": "https://www.jseea.cn/webfile/index/index_zkxx/2023-07-18/7086888854866628608.html",
        "source_updated_at": "2023-07-18",
    },
    {
        "year": 2023,
        "subject_type": "history",
        "subject_label": "历史",
        "raw": ROOT
        / "data"
        / "raw"
        / "jiangsu"
        / "2023-admission-scores"
        / "jiangsu_2023_undergraduate_history.xls",
        "processed": ROOT
        / "data"
        / "processed"
        / "admission-scores"
        / "jiangsu_2023_undergraduate_history.csv",
        "source_url": "https://www.jseea.cn/webfile/index/index_zkxx/2023-07-18/7086888854866628608.html",
        "source_updated_at": "2023-07-18",
    },
]

HEADERS = [
    "id",
    "year",
    "province",
    "subject_type",
    "batch_name",
    "university_code",
    "university_name",
    "major_group_code",
    "major_code",
    "major_name",
    "min_score",
    "min_rank",
    "plan_type",
    "source_name",
    "source_url",
    "source_updated_at",
    "created_at",
    "updated_at",
]


def clean_cell(value):
    if value is None or pd.isna(value):
        return ""
    return re.sub(r"\s+", "", str(value).strip())


def parse_group(value, university_code=""):
    text = clean_cell(value)
    match = re.match(r"^(\d{4})(.+?)(\d{2})专业组(.*)$", text)
    if match:
        return {
            "university_code": match.group(1),
            "university_name": match.group(2),
            "major_group_code": match.group(3),
            "major_name": match.group(4) or "",
        }

    if not re.fullmatch(r"\d{4}", university_code):
        return None

    match = re.match(r"^(.+?)(\d{2})专业组(.*)$", text)
    if not match:
        return None
    return {
        "university_code": university_code,
        "university_name": match.group(1),
        "major_group_code": match.group(2),
        "major_name": match.group(3) or "",
    }


def parse_score(value):
    text = clean_cell(value)
    if not re.fullmatch(r"\d{3}", text):
        return None
    score = int(text)
    if score < 100 or score > 750:
        return None
    return score


def extract_rows(config):
    if not config["raw"].exists():
        return []

    frames = pd.read_excel(config["raw"], header=None, sheet_name=None, dtype=str)
    rows = []
    created_at = datetime.now(timezone.utc).isoformat()

    for frame in frames.values():
        for _, series in frame.iterrows():
            cells = [clean_cell(value) for value in series.tolist()]
            parsed = None
            parsed_cell_index = -1

            if len(cells) >= 3:
                parsed = parse_group(cells[1], cells[0])
                if parsed:
                    parsed_cell_index = 1

            for index, cell in enumerate(cells):
                if parsed:
                    break
                parsed = parse_group(cell)
                if parsed:
                    parsed_cell_index = index
                    break

            if not parsed:
                continue

            min_score = None
            if parsed_cell_index == 1 and len(cells) > 2:
                min_score = parse_score(cells[2])

            if min_score is None:
                for cell in cells[parsed_cell_index + 1 :]:
                    min_score = parse_score(cell)
                    if min_score is not None:
                        break

            if min_score is None:
                continue

            row_number = len(rows) + 1
            rows.append(
                {
                    "id": f"js-{config['year']}-{config['subject_type']}-{parsed['university_code']}-{parsed['major_group_code']}-{row_number}",
                    "year": config["year"],
                    "province": "江苏",
                    "subject_type": config["subject_label"],
                    "batch_name": "普通类本科批次",
                    "university_code": parsed["university_code"],
                    "university_name": parsed["university_name"],
                    "major_group_code": parsed["major_group_code"],
                    "major_code": "",
                    "major_name": parsed["major_name"],
                    "min_score": min_score,
                    "min_rank": "",
                    "plan_type": "",
                    "source_name": "江苏省教育考试院",
                    "source_url": config["source_url"],
                    "source_updated_at": config["source_updated_at"],
                    "created_at": created_at,
                    "updated_at": created_at,
                }
            )

    return rows


def write_csv(path, rows):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=HEADERS)
        writer.writeheader()
        writer.writerows(rows)


def main():
    summary = []
    for config in FILES:
        rows = extract_rows(config)
        if rows:
            write_csv(config["processed"], rows)
        summary.append(
            {
                "year": config["year"],
                "subject_type": config["subject_type"],
                "raw": str(config["raw"].relative_to(ROOT)),
                "processed": str(config["processed"].relative_to(ROOT)),
                "rows": len(rows),
                "status": "imported" if rows else "skipped_no_raw_or_no_rows",
            }
        )

    print(summary)


if __name__ == "__main__":
    main()
