# 高考志愿数据接入报告

更新时间：2026-07-01

## 当前结论

- 已接入教育部 2026 年全国普通高等学校名单，结构化 2952 条院校记录。
- 已接入江苏省教育考试院 2025 年普通类本科批次平行志愿投档线，结构化 4306 条记录。
- 江苏 2026 年逐分段表已保存官方原图，但尚未完成可靠 OCR 或人工复核，未进入正式推荐数据。
- 江苏 2026 年招生计划、江苏 2023/2024 年本科批投档线暂未接入，不使用替代数据或推测数据。
- 当前推荐接口只基于已导入的 `admission_scores` 数据，不使用 AI 生成院校、专业、分数线、位次或招生计划。

## 已导入数据

### 教育部 2026 全国普通高等学校名单

- 来源名称：中华人民共和国教育部
- 来源页面：https://www.moe.gov.cn/jyb_xxgk/s5743/s5744/202606/t20260618_1441074.html
- 原始文件：
  - `data/raw/moe/moe_universities_2026.html`
  - `data/raw/moe/W020260618416094865984_moe_universities_2026.xls`
- 清洗文件：`data/processed/universities/moe_universities_2026.csv`
- 入库表：`universities`
- 行数：2952

### 江苏 2025 普通类本科批次平行志愿投档线

- 来源名称：江苏省教育考试院
- 来源页面：https://www.jseea.cn/webfile/index/index_zkxx/2025-07-18/7846267149297614848.html
- 原始文件：
  - `data/raw/jiangsu/2025-admission-scores/jiangsu_2025_undergraduate_history.pdf`
  - `data/raw/jiangsu/2025-admission-scores/jiangsu_2025_undergraduate_physics.pdf`
- 清洗文件：`data/processed/admission-scores/jiangsu_2025_undergraduate.csv`
- 入库表：`admission_scores`
- 行数：4306
- 限制：官方 PDF 当前清洗到投档最低分；PDF 未提供最低位次，`min_rank` 暂为空。

## 待校验数据

### 江苏 2026 普通高考逐分段统计表

- 来源名称：江苏省教育考试院
- 来源页面：https://www.jseea.cn/webfile/index/index_zkxx/2026-06-24/7475494421979467776.html
- 原始文件：
  - `data/raw/jiangsu/2026-score-segments/jseea_2026_score_segments_page.html`
  - `data/raw/jiangsu/2026-score-segments/jiangsu_2026_history_score_segment.jpg`
  - `data/raw/jiangsu/2026-score-segments/jiangsu_2026_physics_score_segment.jpg`
- 待复核文件：
  - `data/pending-review/jiangsu_2026_history_score_segments_pending_review.csv`
  - `data/pending-review/jiangsu_2026_physics_score_segments_pending_review.csv`
- 状态：待人工校验或可靠 OCR 后才能导入 `score_segments`。

## 暂未接入数据

- 江苏 2026 招生计划：未找到可直接公开下载、无需登录或验证码的结构化官方文件。
- 江苏 2024 普通类本科批投档线：待定位官方文件。
- 江苏 2023 普通类本科批投档线：待定位官方文件。
- 全国其他省份录取分数线、一分一段表和招生计划：待逐省接入。

## 数据目录

- `data/raw/`：官方原始下载文件。
- `data/processed/universities/`：清洗后的院校数据。
- `data/processed/score-segments/`：清洗并复核后的一分一段数据。
- `data/processed/admission-scores/`：清洗后的投档线或录取分数数据。
- `data/processed/admission-plans/`：清洗后的招生计划数据。
- `data/pending-review/`：已获取但尚未复核的数据。
- `data/rejected/`：校验失败或来源不合格的数据。
- `data/sources/source_manifest.json`：数据来源登记清单。
- `data/schema.sql`：SQLite 表结构。
- `data/gaokao-trusted.sqlite`：当前可信数据快照。

## 上线限制

- 当前系统可以提供全国高校名单查询。
- 当前系统可以基于江苏 2025 本科批投档最低分做辅助分析。
- 当前系统不能给出 2026 江苏录取概率、招生计划匹配或最低位次判断。
- 缺少可信数据时，页面和 API 必须返回“暂无可信数据”，不能生成或补全。
