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
        / "shandong"
        / "2025-admission-scores"
        / "shandong_2025_regular_batch_first_choice.xls",
        "processed": ROOT
        / "data"
        / "processed"
        / "admission-scores"
        / "shandong_2025_regular_batch_first_choice.csv",
        "source_url": "https://www.sdzk.cn/NewsInfo.aspx?NewsID=6996",
        "source_updated_at": "2025-07-19",
    },
    {
        "year": 2024,
        "raw": ROOT
        / "data"
        / "raw"
        / "provinces"
        / "shandong"
        / "2024-admission-scores"
        / "shandong_2024_regular_batch_first_choice.xls",
        "processed": ROOT
        / "data"
        / "processed"
        / "admission-scores"
        / "shandong_2024_regular_batch_first_choice.csv",
        "source_url": "https://www.sdzk.cn/NewsInfo.aspx?NewsID=6680",
        "source_updated_at": "2024-07-19",
    },
    {
        "year": 2023,
        "raw": ROOT
        / "data"
        / "raw"
        / "provinces"
        / "shandong"
        / "2023-admission-scores"
        / "shandong_2023_regular_batch_first_choice.xls",
        "processed": ROOT
        / "data"
        / "processed"
        / "admission-scores"
        / "shandong_2023_regular_batch_first_choice.csv",
        "source_url": "https://www.sdzk.cn/NewsInfo.aspx?NewsID=6297",
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
    "plan_type",
    "source_name",
    "source_url",
    "source_updated_at",
    "created_at",
    "updated_at",
]


def clean_cell(value):
    if value is None:
        return ""
    text = str(value).strip()
    if text.endswith(".0") and re.fullmatch(r"[A-Z]?\d+\.0", text):
        text = text[:-2]
    return re.sub(r"\s+", "", text)


def clean_int(value):
    text = clean_cell(value)
    if not text:
        return ""
    try:
        number = int(float(text))
    except ValueError:
        return ""
    return str(number)


def split_code_name(value):
    text = clean_cell(value)
    match = re.match(r"^([A-Z]\d{3})(.+)$", text)
    if not match:
        return "", text
    return match.group(1), match.group(2)


def split_major(value):
    text = clean_cell(value)
    match = re.match(r"^([A-Z0-9]{2})(.+)$", text)
    if not match:
        return "", text
    return match.group(1), match.group(2)


def extract_rows(config):
    if not config["raw"].exists():
        return []

    book = xlrd.open_workbook(str(config["raw"]))
    rows = []
    created_at = datetime.now(timezone.utc).isoformat()

    for sheet in book.sheets():
        for row_index in range(sheet.nrows):
            cells = [sheet.cell_value(row_index, col) for col in range(sheet.ncols)]

            if config["year"] in [2023, 2024]:
                if len(cells) < 5:
                    continue
                major_raw = cells[1]
                university_raw = cells[2]
                plan_count = clean_int(cells[3])
                min_rank = clean_int(cells[4])
            else:
                if len(cells) < 4:
                    continue
                major_raw = cells[0]
                university_raw = cells[1]
                plan_count = clean_int(cells[2])
                min_rank = clean_int(cells[3])

            university_code, university_name = split_code_name(university_raw)
            major_code, major_name = split_major(major_raw)

            if not university_code or not university_name or not major_name or not min_rank:
                continue

            row_number = len(rows) + 1
            rows.append(
                {
                    "id": f"sd-{config['year']}-general-{university_code}-{major_code or row_number}-{row_number}",
                    "year": config["year"],
                    "province": "山东",
                    "subject_type": "普通类",
                    "batch_name": "普通类常规批第1次志愿",
                    "university_code": university_code,
                    "university_name": university_name,
                    "major_group_code": "",
                    "major_code": major_code,
                    "major_name": major_name,
                    "min_score": "",
                    "min_rank": min_rank,
                    "plan_type": f"投档计划数:{plan_count}" if plan_count else "",
                    "source_name": "山东省教育招生考试院",
                    "source_url": config["source_url"],
                    "source_updated_at": config["source_updated_at"],
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
