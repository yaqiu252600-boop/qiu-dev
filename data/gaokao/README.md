# 高考志愿数据目录

这个目录用于建设高考志愿辅助系统的数据工程基础。当前仓库只包含来源登记、结构化数据格式和演示 fallback 数据，不包含未经核验的真实招生数据。

## 目录结构

```txt
data/gaokao/
├── sources/
│   ├── source-registry.json
│   ├── province-sources.json
│   └── official-open-data-index.json
├── raw/
│   └── .gitkeep
├── processed/
│   ├── schools.json
│   ├── majors.json
│   ├── admission-scores.json
│   ├── score-ranks.json
│   ├── province-rules.json
│   └── enrollment-plans.json
└── README.md
```

## 规则

- `raw/` 用于临时存放人工下载的官方 PDF、Excel、CSV 或 JSON，不提交大型原始文件。
- `processed/` 用于保存清洗后的结构化 JSON。
- `sources/` 只登记官方来源和待核验来源，不代表已经采集或授权使用。
- `official-open-data-index.json` 用于登记已经核验到的官方公开文件入口。若来源存在转载限制，只能作为入口展示，不能把原始文件或整表数据直接打包进公开仓库。
- 所有真实数据必须保留 `sourceName`、`sourceUrl`、`year`、`province`、`updatedAt`。
- 演示数据必须标记 `isDemo: true`，页面必须提示不代表真实招生计划和录取结果。
