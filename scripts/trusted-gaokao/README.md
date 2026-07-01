# Trusted Gaokao Data Pipeline

This folder contains conservative local import, validation, and SQLite snapshot scripts for the Gaokao data system.

Rules:

- Do not generate school, score, rank, major group, admission plan, or admission result data.
- Official data must keep `source_name`, `source_url`, and `source_updated_at`.
- OCR output must go to `data/pending-review` until manually checked.
- Rows without a trusted source must stay out of `data/processed`.
- Do not bypass captcha, login, paywalls, robots rules, or website terms.
- The national expansion scripts exclude Jiangsu by default. Jiangsu data is handled by a separate task.

Commands:

- `npm run download:jiangsu-official`
  Download known official Jiangsu 2023/2024 admission score attachments from JSEEA. If the network cannot reach the official host, the script writes `*.download-error.json` files and exits non-zero.
- `npm run import:jiangsu-admission-scores`
  Parse already-downloaded official Jiangsu `.xls` files and write processed admission score CSV files. Missing raw files are skipped; no fake rows are generated.
- `npm run ocr:score-segments:jiangsu-2026`
  Attempt the 2026 Jiangsu score-segment OCR pipeline. Without a trusted OCR engine, it only writes pending-review CSV headers and an OCR report.
- `npm run verify:score-segments:jiangsu-2026`
  Validate pending OCR CSV files. Add `-- --confirm` only after manual review to copy valid rows into `data/processed/score-segments`.
- `npm run import:gaokao-csv -- <data_type> <input.csv> [output.csv]`
  Import a local CSV after required source-field validation.
- `npm run import:gaokao-json -- <data_type> <input.json> [output.csv]`
  Convert a local JSON array to CSV, then run the same validation.
- `npm run validate:gaokao-data`
  Validate all processed trusted data currently in the repository.
- `npm run build:gaokao-sqlite`
  Rebuild `data/gaokao-trusted.sqlite` from processed CSV files.
- `npm run data:discover-provinces`
  Create or refresh `data/config/provinces.json` for non-Jiangsu provinces and ensure the national data folders exist.
- `npm run data:fetch-province -- --province=浙江 --year=2026`
  Probe one province's official site and Gaokao channel. Jiangsu is rejected unless `--allow-jiangsu` is explicitly passed.
- `npm run data:fetch-batch-1`
  Probe the first non-Jiangsu province batch and update `data/sources/other_provinces_source_manifest.json`.
- `npm run data:fetch-batch-2`
  Probe the second non-Jiangsu province batch.
- `npm run data:fetch-batch-3`
  Probe the third non-Jiangsu province batch.
- `npm run data:validate`
  Validate processed CSV files and source manifests.
- `npm run data:import`
  Print importable verified/imported data; missing, blocked, partial, and pending-review records are not imported.
- `npm run data:report`
  Regenerate `data/reports/NATIONAL_OTHER_PROVINCES_DATA_REPORT.md`.

Supported `data_type` values:

- `universities`
- `score_segments`
- `admission_scores`
- `admission_plans`
