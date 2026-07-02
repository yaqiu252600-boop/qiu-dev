import csv
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PY_DEPS = ROOT / "work" / "python-deps"

if PY_DEPS.exists():
    sys.path.insert(0, str(PY_DEPS))

import pdfplumber


ADMISSION_HEADERS = [
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

PENDING_SEGMENT_HEADERS = [
    "year",
    "province",
    "subject_type",
    "score",
    "same_score_count",
    "cumulative_count",
    "same_score_count_specialist",
    "cumulative_count_specialist",
    "source_name",
    "source_url",
    "source_updated_at",
    "status",
    "review_notes",
]

SOURCE_NAME = "广东省教育考试院"
BATCH_NAME = "普通类本科批次"
WATERMARK_CHARS = set("广东省教育考试院")


def find_undergraduate_pdf(year, subject):
    extracted = (
        ROOT
        / "data"
        / "raw"
        / "provinces"
        / "guangdong"
        / f"{year}-admission-scores"
        / "extracted"
    )

    for path in extracted.glob("*.pdf"):
        name = path.name
        if f"{year}" in name and "本科普通类" in name and subject in name:
            return path

    raise FileNotFoundError(f"Missing Guangdong {year} {subject} undergraduate PDF")


ADMISSION_FILES = [
    {
        "year": 2023,
        "subject_type": "历史",
        "raw": find_undergraduate_pdf(2023, "历史"),
        "source_url": "https://eea.gd.gov.cn/news/content/post_4221647.html",
        "source_updated_at": "2023-07-19",
    },
    {
        "year": 2023,
        "subject_type": "物理",
        "raw": find_undergraduate_pdf(2023, "物理"),
        "source_url": "https://eea.gd.gov.cn/news/content/post_4221647.html",
        "source_updated_at": "2023-07-19",
    },
    {
        "year": 2024,
        "subject_type": "历史",
        "raw": find_undergraduate_pdf(2024, "历史"),
        "source_url": "https://eea.gd.gov.cn/zwgk/sjfb/tjsj/content/post_4458419.html",
        "source_updated_at": "2024-07-19",
    },
    {
        "year": 2024,
        "subject_type": "物理",
        "raw": find_undergraduate_pdf(2024, "物理"),
        "source_url": "https://eea.gd.gov.cn/zwgk/sjfb/tjsj/content/post_4458419.html",
        "source_updated_at": "2024-07-19",
    },
    {
        "year": 2025,
        "subject_type": "历史",
        "raw": ROOT
        / "data"
        / "raw"
        / "provinces"
        / "guangdong"
        / "2025-admission-scores"
        / "guangdong_2025_undergraduate_history.pdf",
        "source_url": "https://eea.gd.gov.cn/ptgk/content/post_4746781.html",
        "source_updated_at": "2025-07-19",
    },
    {
        "year": 2025,
        "subject_type": "物理",
        "raw": ROOT
        / "data"
        / "raw"
        / "provinces"
        / "guangdong"
        / "2025-admission-scores"
        / "guangdong_2025_undergraduate_physics.pdf",
        "source_url": "https://eea.gd.gov.cn/ptgk/content/post_4746781.html",
        "source_updated_at": "2025-07-19",
    },
]

SCORE_SEGMENT_FILES = [
    {
        "subject_type": "历史",
        "raw": ROOT
        / "data"
        / "raw"
        / "provinces"
        / "guangdong"
        / "2026-score-segments"
        / "guangdong_2026_score_segments_history.pdf",
        "processed": ROOT
        / "data"
        / "pending-review"
        / "guangdong_2026_score_segments_history_pending_review.csv",
    },
    {
        "subject_type": "物理",
        "raw": ROOT
        / "data"
        / "raw"
        / "provinces"
        / "guangdong"
        / "2026-score-segments"
        / "guangdong_2026_score_segments_physics.pdf",
        "processed": ROOT
        / "data"
        / "pending-review"
        / "guangdong_2026_score_segments_physics_pending_review.csv",
    },
]


def clean_numeric(text):
    if text is None:
        return ""
    match = re.search(r"\d+", str(text).replace(",", ""))
    return match.group(0) if match else ""


def is_watermark_word(word):
    text = word.get("text", "")
    return len(text) == 1 and text in WATERMARK_CHARS and word.get("x0", 0) > 540


def words_on_row(words, top, tolerance=2.0):
    return [
        word
        for word in words
        if abs(word.get("top", 0) - top) <= tolerance and not is_watermark_word(word)
    ]


def numeric_from_range(row_words, start, end):
    candidates = [
        clean_numeric(word["text"])
        for word in sorted(row_words, key=lambda item: item["x0"])
        if start <= word["x0"] < end and clean_numeric(word["text"])
    ]
    return candidates[0] if candidates else ""


def extract_admission_rows(config):
    if not config["raw"].exists():
        raise FileNotFoundError(config["raw"])

    rows = []
    created_at = datetime.now(timezone.utc).isoformat()

    with pdfplumber.open(config["raw"]) as pdf:
        for page in pdf.pages:
            words = page.extract_words(extra_attrs=["size"], x_tolerance=1, y_tolerance=3)
            code_words = [
                word
                for word in words
                if re.fullmatch(r"\d{5}", word["text"] or "")
                and 10 <= word["x0"] <= 70
                and 50 <= word["top"] <= 800
            ]

            for code_word in code_words:
                row_words = words_on_row(words, code_word["top"])
                name_words = [
                    word
                    for word in sorted(row_words, key=lambda item: item["x0"])
                    if 55 <= word["x0"] < 260 and not is_watermark_word(word)
                ]

                university_name = "".join(word["text"] for word in name_words).strip()
                university_code = code_word["text"]
                major_group_code = numeric_from_range(row_words, 260, 335)
                plan_count = numeric_from_range(row_words, 330, 385)
                filed_count = numeric_from_range(row_words, 380, 430)
                min_score = numeric_from_range(row_words, 425, 485)
                min_rank = numeric_from_range(row_words, 485, 565)

                if not university_name or not major_group_code:
                    continue

                if not min_score and not min_rank:
                    continue

                row_number = len(rows) + 1
                status = "verified" if min_score and min_rank else "partial"
                rows.append(
                    {
                        "id": (
                            f"gd-{config['year']}-{config['subject_type']}-"
                            f"{university_code}-{major_group_code}-{row_number}"
                        ),
                        "year": config["year"],
                        "province": "广东",
                        "subject_type": config["subject_type"],
                        "batch_name": BATCH_NAME,
                        "university_code": university_code,
                        "university_name": university_name,
                        "major_group_code": major_group_code,
                        "major_code": "",
                        "major_name": "",
                        "min_score": min_score,
                        "min_rank": min_rank,
                        "plan_count": plan_count,
                        "plan_type": f"投档人数:{filed_count}" if filed_count else "",
                        "source_name": SOURCE_NAME,
                        "source_url": config["source_url"],
                        "source_updated_at": config["source_updated_at"],
                        "status": status,
                        "created_at": created_at,
                        "updated_at": created_at,
                    }
                )

    return rows


def write_admission_csvs():
    output_dir = ROOT / "data" / "processed" / "admission-scores" / "guangdong"
    output_dir.mkdir(parents=True, exist_ok=True)
    summary = {}

    for year in sorted({config["year"] for config in ADMISSION_FILES}):
        rows = []
        for config in ADMISSION_FILES:
            if config["year"] == year:
                rows.extend(extract_admission_rows(config))

        output = output_dir / f"guangdong_{year}_undergraduate.csv"
        with output.open("w", encoding="utf-8-sig", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=ADMISSION_HEADERS)
            writer.writeheader()
            writer.writerows(rows)
        summary[str(output.relative_to(ROOT))] = len(rows)

    return summary


def score_from_text(text):
    match = re.match(r"^(\d{3})(?:（含以上）)?$", text or "")
    return match.group(1) if match else ""


def parse_score_segment_pdf(config):
    if not config["raw"].exists():
        raise FileNotFoundError(config["raw"])

    rows = []
    with pdfplumber.open(config["raw"]) as pdf:
        for page in pdf.pages:
            words = page.extract_words(extra_attrs=["size"], x_tolerance=1, y_tolerance=3)
            score_words = [
                word
                for word in words
                if score_from_text(word["text"]) and 60 <= word["x0"] <= 160
            ]

            for score_word in score_words:
                row_words = words_on_row(words, score_word["top"])
                undergraduate_count = numeric_from_range(row_words, 160, 235)
                undergraduate_cumulative = numeric_from_range(row_words, 260, 330)
                specialist_count = numeric_from_range(row_words, 345, 420)
                specialist_cumulative = numeric_from_range(row_words, 450, 520)

                if not undergraduate_count or not undergraduate_cumulative:
                    continue

                rows.append(
                    {
                        "year": 2026,
                        "province": "广东",
                        "subject_type": config["subject_type"],
                        "score": score_from_text(score_word["text"]),
                        "same_score_count": undergraduate_count,
                        "cumulative_count": undergraduate_cumulative,
                        "same_score_count_specialist": specialist_count,
                        "cumulative_count_specialist": specialist_cumulative,
                        "source_name": SOURCE_NAME,
                        "source_url": "https://eea.gd.gov.cn/ptgk/content/post_4916165.html",
                        "source_updated_at": "2026-06-25",
                        "status": "pending_review",
                        "review_notes": "官方 PDF 可抽取文字但含水印，需人工核验后才能进入 score_segments。",
                    }
                )

    config["processed"].parent.mkdir(parents=True, exist_ok=True)
    with config["processed"].open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=PENDING_SEGMENT_HEADERS)
        writer.writeheader()
        writer.writerows(rows)

    return str(config["processed"].relative_to(ROOT)), len(rows)


def write_pending_score_segments():
    return dict(parse_score_segment_pdf(config) for config in SCORE_SEGMENT_FILES)


def main():
    summary = {
        "admission_scores": write_admission_csvs(),
        "pending_score_segments": write_pending_score_segments(),
    }
    print(summary)


if __name__ == "__main__":
    main()
