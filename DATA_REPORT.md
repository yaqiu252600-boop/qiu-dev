# 高考志愿数据接入报告

更新时间：2026-07-01

## 当前结论

- 已接入教育部 2026 年全国普通高等学校名单，结构化 2952 条院校记录。
- 已接入江苏省教育考试院 2025 年普通类本科批次平行志愿投档线，结构化 4306 条记录。
- 已接入江苏省教育考试院 2024 年普通类本科批次平行志愿投档线，结构化 3975 条记录。
- 已接入江苏省教育考试院 2023 年普通类本科批次平行志愿投档线，结构化 3663 条记录。
- 已接入浙江省教育考试院 2025 年普通类第一段平行投档分数线表，结构化 17890 条记录。
- 已接入浙江省教育考试院 2024 年普通类第一段平行投档分数线表，结构化 17241 条记录。
- 已接入浙江省教育考试院 2023 年普通类第一段平行投档分数线表，结构化 16808 条记录。
- 浙江官方表同时提供分数线、位次和计划数，可做历史分数参考与历史位次参考；因未导入 2026 当年官方招生计划，不开放完整推荐。
- 江苏 2026 年逐分段表已保存官方 JPG 原图；当前环境没有可信 OCR 引擎，只生成 pending-review CSV 表头和 OCR 报告，不参与位次换算。
- 浙江 2026 年普通高校招生成绩分数段表已保存官方 PDF；尚未清洗为正式 `score_segments`，不参与分数到位次换算。
- 江苏 2026 招生计划只确认到总量说明页面，未找到公开可批量下载的分学校、分专业组、分专业结构化数据，已记录为 `missing`。
- 当前推荐接口只基于已导入的 `admission_scores` 数据；没有 `min_rank` 时只输出“历史投档最低分参考”，不输出“位次冲稳保”。

## 已验证数据

### 教育部 2026 全国普通高等学校名单

- 来源名称：中华人民共和国教育部
- 来源页面：https://www.moe.gov.cn/jyb_xxgk/s5743/s5744/202606/t20260618_1441074.html
- 原始文件：
  - `data/raw/moe/moe_universities_2026.html`
  - `data/raw/moe/W020260618416094865984_moe_universities_2026.xls`
- 清洗文件：`data/processed/universities/moe_universities_2026.csv`
- 行数：2952
- 状态：verified

### 江苏 2025 普通类本科批次平行志愿投档线

- 来源名称：江苏省教育考试院
- 来源页面：https://www.jseea.cn/webfile/index/index_zkxx/2025-07-18/7846267149297614848.html
- 原始文件：
  - `data/raw/jiangsu/2025-admission-scores/jiangsu_2025_undergraduate_history.pdf`
  - `data/raw/jiangsu/2025-admission-scores/jiangsu_2025_undergraduate_physics.pdf`
- 清洗文件：`data/processed/admission-scores/jiangsu_2025_undergraduate.csv`
- 行数：4306
- 状态：verified
- 限制：官方 PDF 未提供最低位次，`min_rank` 留空，只能用于历史投档最低分参考。

### 江苏 2024 普通类本科批次平行志愿投档线

- 来源名称：江苏省教育考试院
- 来源页面：https://www.jseea.cn/webfile/index/index_zkxx/2024-07-18/7219509116052443136.html
- 原始文件：
  - `data/raw/jiangsu/2024-admission-scores/jiangsu_2024_undergraduate_history.xls`
  - `data/raw/jiangsu/2024-admission-scores/jiangsu_2024_undergraduate_physics.xls`
- 清洗文件：
  - `data/processed/admission-scores/jiangsu_2024_undergraduate_history.csv`
  - `data/processed/admission-scores/jiangsu_2024_undergraduate_physics.csv`
- 行数：3975
- 状态：verified
- 限制：官方 xls 未提供最低位次，`min_rank` 留空，只能用于历史投档最低分参考。

### 江苏 2023 普通类本科批次平行志愿投档线

- 来源名称：江苏省教育考试院
- 来源页面：https://www.jseea.cn/webfile/index/index_zkxx/2023-07-18/7086888854866628608.html
- 原始文件：
  - `data/raw/jiangsu/2023-admission-scores/jiangsu_2023_undergraduate_physics.xls`
  - `data/raw/jiangsu/2023-admission-scores/jiangsu_2023_undergraduate_history.xls`
- 清洗文件：
  - `data/processed/admission-scores/jiangsu_2023_undergraduate_physics.csv`
  - `data/processed/admission-scores/jiangsu_2023_undergraduate_history.csv`
- 行数：3663
- 状态：verified
- 限制：官方 xls 未提供最低位次，`min_rank` 留空，只能用于历史投档最低分参考。

### 浙江 2025 普通类第一段平行投档分数线表

- 来源名称：浙江省教育考试院
- 来源页面：https://www.zjzs.net/art/2025/7/21/art_45_11467.html
- 原始文件：
  - `data/raw/provinces/zhejiang/2025-admission-scores/zhejiang_2025_regular_first_segment_page.html`
  - `data/raw/provinces/zhejiang/2025-admission-scores/zhejiang_2025_regular_first_segment.xls`
- 清洗文件：`data/processed/admission-scores/zhejiang/zhejiang_2025_regular_first_segment.csv`
- 行数：17890
- 状态：verified
- 字段：官方表提供学校代号、学校名称、专业代号、专业名称、计划数、分数线和位次。

### 浙江 2024 普通类第一段平行投档分数线表

- 来源名称：浙江省教育考试院
- 来源页面：https://www.zjzs.net/art/2024/7/21/art_155_9900.html
- 原始文件：
  - `data/raw/provinces/zhejiang/2024-admission-scores/zhejiang_2024_regular_first_segment_page.html`
  - `data/raw/provinces/zhejiang/2024-admission-scores/zhejiang_2024_regular_first_segment.xls`
- 清洗文件：`data/processed/admission-scores/zhejiang/zhejiang_2024_regular_first_segment.csv`
- 行数：17241
- 状态：verified
- 字段：官方表提供学校代号、学校名称、专业代号、专业名称、计划数、分数线和位次。

### 浙江 2023 普通类第一段平行投档分数线表

- 来源名称：浙江省教育考试院
- 来源页面：https://www.zjzs.net/art/2023/7/19/art_45_2052.html
- 原始文件：
  - `data/raw/provinces/zhejiang/2023-admission-scores/zhejiang_2023_regular_first_segment_page.html`
  - `data/raw/provinces/zhejiang/2023-admission-scores/zhejiang_2023_regular_first_segment.xls`
- 清洗文件：`data/processed/admission-scores/zhejiang/zhejiang_2023_regular_first_segment.csv`
- 行数：16808
- 状态：verified
- 字段：官方表提供学校代号、学校名称、专业代号、专业名称、计划数、分数线和位次。

## 已定位但待校验

### 江苏 2024 官方附件

- 来源页面：https://www.jseea.cn/webfile/index/index_zkxx/2024-07-18/7219509116052443136.html
- 官方附件：
  - https://www.jseea.cn/webfile/upload/2024/07-18/09-11-430408314109108.xls
  - https://www.jseea.cn/webfile/upload/2024/07-18/11-00-490856-746889704.xls
- 当前状态：已保存并导入；因原表不含 `min_rank`，不可参与位次推荐。

### 江苏 2023 官方附件

- 来源页面：https://www.jseea.cn/webfile/index/index_zkxx/2023-07-18/7086888854866628608.html
- 官方附件：
  - https://www.jseea.cn/webfile/upload/2023/07-18/10-05-510166-183377989.xls
  - https://www.jseea.cn/webfile/upload/2023/07-18/10-05-510148-1404562985.xls
- 当前状态：已保存并导入；因原表不含 `min_rank`，不可参与位次推荐。

### 江苏 2026 普通类逐分段统计表

- 来源页面：https://www.jseea.cn/webfile/index/index_zkxx/2026-06-24/7475494421979467776.html
- 原始文件：
  - `data/raw/jiangsu/2026-score-segments/jseea_2026_score_segments_page.html`
  - `data/raw/jiangsu/2026-score-segments/jiangsu_2026_history_score_segment.jpg`
  - `data/raw/jiangsu/2026-score-segments/jiangsu_2026_physics_score_segment.jpg`
- OCR 输出：
  - `data/pending-review/jiangsu_2026_score_segments_history_ocr.csv`
  - `data/pending-review/jiangsu_2026_score_segments_physics_ocr.csv`
- OCR 报告：`data/pending-review/jiangsu_2026_score_segments_ocr_report.json`
- 当前状态：pending_review，未人工确认前不导入 `score_segments`。

### 浙江 2026 普通高校招生成绩分数段表

- 来源页面：https://www.zjzs.net/art/2026/6/26/art_45_12452.html
- 原始文件：
  - `data/raw/provinces/zhejiang/2026-score-segments/zhejiang_2026_score_segments_page.html`
  - `data/raw/provinces/zhejiang/2026-score-segments/zhejiang_2026_score_segments_total.pdf`
- 当前状态：pending_review，尚未清洗为正式 `score_segments`，不参与分数到位次换算。

### 浙江 2026 志愿规则

- 来源页面：
  - https://www.zjzs.net/art/2026/6/13/art_45_12375.html
  - https://www.zjzs.net/art/2026/6/17/art_45_12386.html
- 原始文件：
  - `data/raw/provinces/zhejiang/2026-province-rules/zhejiang_2026_online_volunteer_notice.html`
  - `data/raw/provinces/zhejiang/2026-province-rules/zhejiang_2026_volunteer_rules_page.html`
- 当前状态：partial，已保存官方页面，尚未结构化为 `province_rules`。

## 缺失数据

### 江苏 2026 招生计划

- 来源页面：https://www.jseea.cn/webfile/index/index_zkxx/2026-06-23/7474808080111243264.html
- 缺失记录：`data/sources/missing_jiangsu_2026_admission_plans.json`
- 状态：missing
- 原因：未找到公开可批量下载的分学校、分专业组、分专业招生计划结构化数据。
- 限制：只有招生计划总量说明不能用于专业组推荐。

### 浙江 2026 招生计划

- 来源页面：https://www.zjzs.net/art/2026/6/18/art_45_12398.html
- 原始文件：
  - `data/raw/provinces/zhejiang/2026-admission-plans/zhejiang_2026_admission_plans_index.html`
  - `data/raw/provinces/zhejiang/2026-admission-plans/zhejiang_2026_admission_work_notice.html`
- 状态：missing
- 原因：未找到普通高考分学校、分专业的公开可批量下载结构化招生计划文件。
- 限制：没有当年官方招生计划时，不开放完整推荐。

## 本次保护规则

- 没有 `min_rank` 时，不展示“位次冲稳保”。
- 没有 verified 逐分段表时，不允许分数换位次。
- 没有当年官方招生计划时，推荐结果必须提示不能代表今年实际可报专业或招生人数。
- 不存在的学校搜索返回空结果，不生成学校。
- 所有正式数据必须保留 `source_name`、`source_url`、`source_updated_at`。
