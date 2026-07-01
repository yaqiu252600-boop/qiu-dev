import csv
import importlib.util
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PENDING = ROOT / "data" / "pending-review"
SOURCE_URL = "https://www.jseea.cn/webfile/index/index_zkxx/2026-06-24/7475494421979467776.html"
HEADERS = [
    "id",
    "year",
    "province",
    "subject_type",
    "score",
    "same_score_count",
    "cumulative_count",
    "rank_min",
    "rank_max",
    "source_name",
    "source_url",
    "source_updated_at",
    "created_at",
    "updated_at",
]

FILES = [
    {
        "subject_type": "history",
        "image": ROOT
        / "data"
        / "raw"
        / "jiangsu"
        / "2026-score-segments"
        / "jiangsu_2026_history_score_segment.jpg",
        "output": PENDING / "jiangsu_2026_score_segments_history_ocr.csv",
    },
    {
        "subject_type": "physics",
        "image": ROOT
        / "data"
        / "raw"
        / "jiangsu"
        / "2026-score-segments"
        / "jiangsu_2026_physics_score_segment.jpg",
        "output": PENDING / "jiangsu_2026_score_segments_physics_ocr.csv",
    },
]


def write_header(path):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as file:
        csv.DictWriter(file, fieldnames=HEADERS).writeheader()


def main():
    has_tesseract = importlib.util.find_spec("pytesseract") is not None
    now = datetime.now(timezone.utc).isoformat()
    report = {
        "province": "江苏",
        "year": 2026,
        "source_name": "江苏省教育考试院",
        "source_url": SOURCE_URL,
        "source_updated_at": "2026-06-24",
        "status": "pending_review",
        "ocr_available": has_tesseract,
        "generated_at": now,
        "files": [],
        "validation_pass_rate": 0,
        "note": "",
    }

    for item in FILES:
      write_header(item["output"])
      report["files"].append(
          {
              "subject_type": item["subject_type"],
              "raw_file_path": str(item["image"].relative_to(ROOT)),
              "processed_file_path": str(item["output"].relative_to(ROOT)),
              "rows": 0,
              "status": "pending_review",
          }
      )

    if has_tesseract:
        report["note"] = (
            "检测到 pytesseract，但本脚本不会自动信任 OCR 结果。请人工复核后运行 verify 脚本确认。"
        )
    else:
        report["note"] = (
            "当前环境未安装可用 OCR 引擎，已保留官方 JPG 原图和待校验 CSV 表头；未导入正式 score_segments 表。"
        )

    report_path = PENDING / "jiangsu_2026_score_segments_ocr_report.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
