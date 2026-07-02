# Gaokao Data Directory

This directory stores only official, trusted, pending-review, or explicitly missing Gaokao data records.

- `raw/`: original downloaded official files.
- `processed/`: validated structured CSV files used by API routes.
- `pending-review/`: extracted or manually prepared data that is not yet trusted.
- `rejected/`: invalid files or rows that failed validation.
- `sources/`: source manifest and provenance records.
- `schema.sql`: SQLite schema for local snapshots.
- `gaokao-trusted.sqlite`: generated local SQLite snapshot. It is ignored by Git and can be rebuilt with `npm run build:gaokao-sqlite`.

No AI-generated school, major, score, rank, or admission plan data should be placed in `processed/`.
