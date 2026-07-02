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
- `data/gaokao-trusted.sqlite` 已改为本地/构建产物，不再作为长期源码数据提交到 Git；仓库保存官方 raw 文件、清洗 CSV、source manifest、报告和构建脚本。

## 当前数据存储策略

- Git 仓库长期保存：
  - `data/raw/` 下的官方原始文件。
  - `data/processed/` 下的清洗 CSV。
  - `data/sources/` 下的 source manifest 和数据发现状态。
  - 数据报告和构建脚本。
- Git 仓库不再长期保存：
  - `data/gaokao-trusted.sqlite`
  - `data/*.sqlite`
  - `data/*.sqlite3`
- SQLite 用途：本地开发、Vercel 构建和运行前的数据就绪快照。它由 `npm run build:gaokao-sqlite` 根据已提交 CSV 全量重建。
- 当前 API 查询逻辑仍通过 `lib/trusted-gaokao.ts` 的封装读取清洗 CSV；SQLite 不作为唯一运行时数据源，但作为构建完成标记。若缺少 `data/gaokao-trusted.sqlite`，API 返回“可信高考数据库尚未构建，请先运行 npm run build:gaokao-sqlite。”，页面显示“数据服务暂不可用”。
- 不直接提交 SQLite 的原因：
  - 文件已超过 GitHub 50MB 建议阈值，继续导入其他省份后可能接近或超过 GitHub 100MB 单文件限制。
  - SQLite 是可由 CSV 重建的派生产物，提交会增加仓库体积和 Vercel 部署包体积风险。
  - CSV/raw/manifest 更适合做可审计、可 diff 的长期可信数据记录。

## 重建和验证

本地重建数据库：

```bash
npm run build:gaokao-sqlite
```

推荐验证顺序：

```bash
npm run data:validate
npm run build:gaokao-sqlite
npm run lint
npm run build
```

`npm run build` 和 `vercel-build` 都会先运行 `npm run build:gaokao-sqlite`，再执行 `next build`。当前 SQLite 生成脚本只依赖已清洗 CSV 和 Python 标准库 `sqlite3`/`csv`，不依赖 raw xls 解析。

## 已接入省份能力

- 江苏：历史分数参考；官方投档线不含 `min_rank`，不做位次参考。
- 山东：历史位次参考；官方投档表不含最低分，不反推最低分。
- 浙江：历史分数参考 + 历史位次参考；未导入当年官方招生计划，不开放完整推荐。
- 河南：本轮仅完成官方源发现和 raw 证据保存；未找到 2023/2024/2025 普通本科批公开可批量下载的官方投档线或录取线文件，暂不开放历史分数参考、历史位次参考或完整推荐。

## 河南官方源发现状态

- 官方入口：
  - 河南省教育考试院：https://www.haeea.cn/
  - 河南招生考试信息网：https://www.heao.com.cn/path/HNptgz/
- 2026 一分一段/分数段：
  - 来源页面：https://www.heao.com.cn/path/HNptgz/202606/820045207449669.shtml
  - 已保存 raw：
    - `data/raw/provinces/henan/2026-score-segments/henan_2026_score_segments_page.html`
    - `data/raw/provinces/henan/2026-score-segments/henan_2026_score_segments_history.pdf`
    - `data/raw/provinces/henan/2026-score-segments/henan_2026_score_segments_physics.pdf`
  - PDF 无文本层，自动抽取到 `data/pending-review/henan_2026_score_segments_*_pending_review.csv` 为空；状态为 `pending_review`，人工/OCR 复核前不进入 `processed/score-segments`，不参与分数换位次。
- 2023/2024/2025 普通类本科批投档线/录取线：
  - 未找到河南招生考试信息网公开可批量下载的官方 Excel/CSV/PDF/网页表格。
  - 官方数据中心录取统计入口 `https://datacenter.haeea.cn/PagePZQuery/ShowPZLQ.aspx` 在当前环境渲染为空白，无法解析结构化表格。
  - 河南 2026 考生指南说明“考生本人所填报的普通本科批相关专业组投档分数线”通过河南省普通高校招生考生服务平台查询；本轮未绕过考生登录、验证码、考生号或动态口令。
  - 因未获得可信官方批量数据，河南 `admission_scores` 导入 0 条，状态为 `blocked`。
- 2026 招生计划：
  - 来源页面：https://www.heao.com.cn/path/HNptgz/202606/819808524304453.shtml
  - 已保存“2026年招生计划补充说明”页面及 4 个高校补充说明 PDF。
  - 这不是完整分学校、分专业、分计划数的招生计划；官方招生计划查询入口当前不可解析为空白页面，未导入 `admission_plans`。
- 2026 志愿规则：
  - 已保存：
    - `data/raw/provinces/henan/2026-rules/819815591440453.html`
    - `data/raw/provinces/henan/2026-rules/816663211892805.html`
    - `data/raw/provinces/henan/2026-rules/820436374315077.html`
    - `data/raw/provinces/henan/2026-rules/henan_2026_gaokao_q_and_a.pdf`
  - 状态为 `partial`，只作为规则说明和来源证据，不作为结构化推荐数据。
- 河南当前能力：
  - 可用：教育部全国院校名单查询。
  - 不可用：历史分数参考、历史位次参考、分数换位次、招生计划辅助、完整志愿推荐。
  - 不可用原因：缺少 verified/imported 的河南 2023/2024/2025 投档线；2026 分数段 PDF 待人工复核；缺少完整 2026 官方招生计划。
- SQLite 仍是构建产物：`data/gaokao-trusted.sqlite` 不提交到 Git。

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

## ??????

- ????????????? https://eea.gd.gov.cn/ ??????? https://eea.gd.gov.cn/ptgk/ ?
- 2023 ???????????????? https://eea.gd.gov.cn/news/content/post_4221647.html ???????? ZIP??? `data/processed/admission-scores/guangdong/guangdong_2023_undergraduate.csv`?? 4177 ??
- 2024 ???????????????? https://eea.gd.gov.cn/zwgk/sjfb/tjsj/content/post_4458419.html ???????? ZIP??? `data/processed/admission-scores/guangdong/guangdong_2024_undergraduate.csv`?? 4676 ??
- 2025 ???????????????? https://eea.gd.gov.cn/ptgk/content/post_4746781.html ????????? PDF???? PDF??? `data/processed/admission-scores/guangdong/guangdong_2025_undergraduate.csv`?? 5137 ??
- ?? 2023/2024/2025 ??????????????????????????????????????????????????????????????? `major_code`?`major_name` ???????
- ???? `admission_scores` ?? 13990 ????? `verified`?????????????????
- 2026 ????????https://eea.gd.gov.cn/ptgk/content/post_4916165.html ??? PDF ??????? `data/pending-review/guangdong_2026_score_segments_history_pending_review.csv`?570 ??? `data/pending-review/guangdong_2026_score_segments_physics_pending_review.csv`?600 ???? PDF ??????? `pending_review`??????????? `score_segments`??????????
- 2026 ???????????2026???????????????????https://eea.gd.gov.cn/tzgg/content/post_4917333.html ????????????????????????????????? `admission_plans` ?? `missing`????????????????????
- 2026 ????????https://eea.gd.gov.cn/news/content/post_4915636.html ??????? `data/raw/provinces/guangdong/2026-rules/guangdong_2026_volunteer_rules_page.html`???? `partial`?????????????
- `data/gaokao-trusted.sqlite` ??????????? Git???????? raw??? CSV?pending-review?manifest???????????

<!-- SICHUAN_OFFICIAL_DATA:START -->
## 四川官方数据接入状态（2026-07-02）

- 官方站点：四川省教育考试院 https://www.sceea.cn/
- 2023 投档线：已保存本科一批、本科二批官方图片页和原图，状态 pending_review；未导入 admission_scores。
- 2024 投档线：已保存本科一批、本科二批官方图片页和原图，状态 pending_review；未导入 admission_scores。
- 2025 投档线：仅找到普通类本科批次B段投档动态，未找到官方公开明细表，状态 missing。
- 2026 一分一段：已保存历史类、物理类成绩分段统计表原图索引，状态 pending_review；未导入 score_segments，不支持分数换位次。
- 2026 招生计划：已保存官方“2026年普通高校在川招生专业及名额介绍”历史类 160 页、物理类 248 页图片书及两条计划更正通知；因不是结构化 Excel/CSV/网页表格，未导入 admission_plans。
- 2026 规则：已保存《四川省2026年普通高校招生实施规定》和官方志愿辅助系统入口。辅助系统加载验证码脚本，本次不绕过。
- 当前可用能力：仅教育部高校名单查询。
- 当前不可用能力：历史分数参考、历史位次参考、分数换位次、招生计划辅助、完整志愿推荐。
- 不可用原因：投档线和分段表为图片且未人工校验；2025 明细未发现；2026 招生计划未形成可导入结构化数据。
- SQLite 说明：data/gaokao-trusted.sqlite 是构建产物，不提交。
<!-- SICHUAN_OFFICIAL_DATA:END -->
