# 高考数据导入脚本

这些脚本只用于处理人工下载、人工核验后的官方公开文件。当前不包含爬虫，不访问需要登录、付费、验证码或禁止自动化访问的数据源。

## 脚本

- `normalize.ts`：把本地 JSON / CSV 文件转换成 `processed` 目录使用的结构。Excel 文件需要先人工另存为 CSV，或后续在明确依赖和授权后再接入解析库。
- `validate.ts`：校验 processed 数据的关键字段完整性。
- `import-local-json.ts`：把人工整理好的 JSON 导入指定 processed 数据文件。
- `import-csv.ts`：把人工整理后的 CSV 导入指定 processed 数据文件。
- `import-json.ts`：把人工整理后的 JSON 导入指定 processed 数据文件。
- `import-excel.ts`：Excel 安全入口。当前不直接解析 Excel，要求先人工另存为 CSV。
- `fetch-official-sources.ts`：按官方来源索引低频下载允许自动下载的原始文件。`requires_review` 来源不会自动下载。
- `validate-admission-scores.ts`：专项校验录取分数数据。
- `check-data-quality.ts`：统计数据量、演示数据占比、来源缺失情况。

## 使用原则

- 不绕过验证码。
- 不高频请求官方网站。
- 不采集需要登录或付费的数据。
- 不违反目标网站 robots 或使用条款。
- 每条真实数据必须保留 `sourceName`、`sourceUrl`、`year`、`province`、`updatedAt`。
