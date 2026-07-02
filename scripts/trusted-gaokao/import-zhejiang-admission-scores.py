import csv
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PY_DEPS = ROOT / "work" / "python-deps"

if PY_DEPS.exists():
    sys.path.insert(0, str(PY_DEPS))

import xlrd

FILES = [
    {
        "year": 2025,
        "raw": ROOT
        / "data"
        / "raw"
        / "provinces"
        / "zhejiang"
        / "2025-admission-scores"
        / "zhejiang_2025_regular_first_segment.xls",
        "processed": ROOT
        / "data"
        / "processed"
        / "admission-scores"
        / "zhejiang"
        / "zhejiang_2025_regular_first_segment.csv",
        "source_url": "https://www.zjzs.net/art/2025/7/21/art_45_11467.html",
        "source_updated_at": "2025-07-21",
    },
    {
        "year": 2024,
        "raw": ROOT
        / "data"
        / "raw"
        / "provinces"
        / "zhejiang"
        / "2024-admission-scores"
        / "zhejiang_2024_regular_first_segment.xls",
        "processed": ROOT
        / "data"
        / "processed"
        / "admission-scores"
        / "zhejiang"
        / "zhejiang_2024_regular_first_segment.csv",
        "source_url": "https://www.zjzs.net/art/2024/7/21/art_155_9900.html",
        "source_updated_at": "2024-07-21",
    },
    {
        "year": 2023,
        "raw": ROOT
        / "data"
        / "raw"
        / "provinces"
        / "zhejiang"
        / "2023-admission-scores"
        / "zhejiang_2023_regular_first_segment.xls",
        "processed": ROOT
        / "data"
        / "processed"
        / "admission-scores"
        / "zhejiang"
        / "zhejiang_2023_regular_first_segment.csv",
        "source_url": "https://www.zjzs.net/art/2023/7/19/art_45_2052.html",
        "source_updated_at": "2023-07-19",
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
    "plan_count",
    "plan_type",
    "source_name",
    "source_url",
    "source_updated_at",
    "status",
    "created_at",
    "updated_at",
]


def clean_cell(value):
    if value is None:
        return ""
    text = str(value).strip()
    if text.endswith(".0") and re.fullmatch(r"\d+\.0", text):
        text = text[:-2]
    return re.sub(r"\s+", " ", text).strip()


def clean_int(value):
    text = clean_cell(value)
    if not text:
        return ""
    text = text.replace(",", "").replace("↑", "")
    try:
        return str(int(float(text)))
    except ValueError:
        return ""


def extract_rows(config):
    if not config["raw"].exists():
        return []

    book = xlrd.open_workbook(str(config["raw"]))
    rows = []
    created_at = datetime.now(timezone.utc).isoformat()

    for sheet in book.sheets():
        for row_index in range(1, sheet.nrows):
            cells = [sheet.cell_value(row_index, col) for col in range(sheet.ncols)]
            if len(cells) < 7:
                continue

            university_code = clean_cell(cells[0]).zfill(4)
            university_name = clean_cell(cells[1])
            major_code = clean_cell(cells[2])
            major_name = clean_cell(cells[3])
            plan_count = clean_int(cells[4])
            min_score = clean_int(cells[5])
            min_rank = clean_int(cells[6])

            if not university_code or not university_name or not major_code or not major_name:
                continue

            if not min_score and not min_rank:
                continue

            row_number = len(rows) + 1
            rows.append(
                {
                    "id": f"zj-{config['year']}-general-{university_code}-{major_code}-{row_number}",
                    "year": config["year"],
                    "province": "浙江",
                    "subject_type": "普通类",
                    "batch_name": "普通类第一段平行投档",
                    "university_code": university_code,
                    "university_name": university_name,
                    "major_group_code": "",
                    "major_code": major_code,
                    "major_name": major_name,
                    "min_score": min_score,
                    "min_rank": min_rank,
                    "plan_count": plan_count,
                    "plan_type": f"计划数:{plan_count}" if plan_count else "",
                    "source_name": "浙江省教育考试院",
                    "source_url": config["source_url"],
                    "source_updated_at": config["source_updated_at"],
                    "status": "verified",
                    "created_at": created_at,
                    "updated_at": created_at,
                }
            )

    return rows


def main():
    summary = {}

    for config in FILES:
        rows = extract_rows(config)
        config["processed"].parent.mkdir(parents=True, exist_ok=True)
        with config["processed"].open("w", encoding="utf-8-sig", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=HEADERS)
            writer.writeheader()
            writer.writerows(rows)
        summary[str(config["processed"])] = len(rows)

    print(summary)


if __name__ == "__main__":
    main()
