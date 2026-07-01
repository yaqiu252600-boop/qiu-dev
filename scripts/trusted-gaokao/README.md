# Trusted Gaokao Data Pipeline

This folder contains conservative local import, validation, and SQLite snapshot scripts for the Gaokao data system.

Rules:

- Do not generate school, score, rank, major group, admission plan, or admission result data.
- Official data must keep `source_name`, `source_url`, and `source_updated_at`.
- OCR output must go to `data/pending-review` until manually checked.
- Rows without a trusted source must stay out of `data/processed`.
- Do not bypass captcha, login, paywalls, robots rules, or website terms.

Commands:

- `npm run import:gaokao-csv -- <data_type> <input.csv> [output.csv]`
  Import a local CSV after required source-field validation.
- `npm run import:gaokao-json -- <data_type> <input.json> [output.csv]`
  Convert a local JSON array to CSV, then run the same validation.
- `npm run validate:gaokao-data`
  Validate all processed trusted data currently in the repository.
- `npm run build:gaokao-sqlite`
  Rebuild `data/gaokao-trusted.sqlite` from processed CSV files.

Supported `data_type` values:

- `universities`
- `score_segments`
- `admission_scores`
- `admission_plans`
