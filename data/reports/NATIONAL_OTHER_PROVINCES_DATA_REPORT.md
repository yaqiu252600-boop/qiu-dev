# 全国非江苏省份高考数据接入报告

生成时间：2026-07-02T02:12:42.597Z

## 本次边界

- 本次处理明确排除了江苏；江苏数据由独立任务处理，本报告不覆盖江苏配置、原始文件、清洗文件或导入结果。
- 本次目标是官方源发现、状态登记、可下载公开数据线索识别，以及 missing/blocked/failed 标记，不强行一次性导入全国数据。
- 未找到公开可信数据时只记录状态，不使用系统补全学校、专业、分数线、位次或招生计划。

## provinces.json 覆盖省份

北京、天津、河北、山西、内蒙古、辽宁、吉林、黑龙江、上海、浙江、安徽、福建、江西、山东、河南、湖北、湖南、广东、广西、海南、重庆、四川、贵州、云南、西藏、陕西、甘肃、青海、宁夏、新疆

## 第一批官方站点发现结果

| 省份 | 官方机构 | 官方站点 | 高考栏目 | 当前状态 |
| --- | --- | --- | --- | --- |
| 河北 | 河北省教育考试院 | https://www.hebeea.edu.cn/ | https://www.hebeea.edu.cn/html/ptgk/ | blocked |
| 浙江 | 浙江省教育考试院 | https://www.zjzs.net/ | https://www.zjzs.net/ | checked |
| 安徽 | 安徽省教育招生考试院 | https://www.ahzsks.cn/ | https://www.ahzsks.cn/ptgxzs/ | checked |
| 山东 | 山东省教育招生考试院 | https://www.sdzk.cn/ | https://www.sdzk.cn/NewsList.aspx?BCID=4 | checked |
| 河南 | 河南省教育考试院 / 河南招生考试信息网 | https://www.haeea.cn/ | https://www.heao.com.cn/path/HNptgz/ | checked |
| 湖北 | 湖北省教育考试院 | http://www.hbea.edu.cn/ | http://www.hbea.edu.cn/html/ptgk/ | checked |
| 湖南 | 湖南省教育考试院 / 湖南招生考试信息港 | https://www.hneeb.cn/ | https://www.hneeb.cn/hnxxg/741/index.htm | checked |
| 广东 | 广东省教育考试院 | https://eea.gd.gov.cn/ | https://eea.gd.gov.cn/ptgk/ | checked |
| 四川 | 四川省教育考试院 | https://www.sceea.cn/ | https://www.sceea.cn/List/NewsList_30.html | blocked |

## 分省数据状态

| 省份 | 一分一段 2026 | 投档线 2023 | 投档线 2024 | 投档线 2025 | 招生计划 2026 | 志愿规则 2026 | 当前支持能力 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 北京 | missing | missing | missing | missing | missing | missing | 仅院校查询 |
| 天津 | missing | missing | missing | missing | missing | missing | 仅院校查询 |
| 河北 | blocked | blocked | blocked | blocked | blocked | blocked | 仅院校查询 |
| 山西 | missing | missing | missing | missing | missing | missing | 仅院校查询 |
| 内蒙古 | missing | missing | missing | missing | missing | missing | 仅院校查询 |
| 辽宁 | missing | missing | missing | missing | missing | missing | 仅院校查询 |
| 吉林 | missing | missing | missing | missing | missing | missing | 仅院校查询 |
| 黑龙江 | missing | missing | missing | missing | missing | missing | 仅院校查询 |
| 上海 | missing | missing | missing | missing | missing | missing | 仅院校查询 |
| 浙江 | pending_review | verified | verified | verified | missing | partial | 仅院校查询、可查投档线、可做分数参考、可做位次参考 |
| 安徽 | missing | missing | missing | missing | missing | missing | 仅院校查询 |
| 福建 | missing | missing | missing | missing | missing | missing | 仅院校查询 |
| 江西 | missing | missing | missing | missing | missing | missing | 仅院校查询 |
| 山东 | partial | verified | verified | verified | partial | partial | 仅院校查询、可查投档线、可做位次参考 |
| 河南 | pending_review | blocked | blocked | blocked | missing | partial | 仅院校查询 |
| 湖北 | partial | missing | missing | missing | missing | missing | 仅院校查询 |
| 湖南 | missing | missing | missing | missing | missing | missing | 仅院校查询 |
| 广东 | missing | missing | missing | missing | partial | partial | 仅院校查询 |
| 广西 | missing | missing | missing | missing | missing | missing | 仅院校查询 |
| 海南 | missing | missing | missing | missing | missing | missing | 仅院校查询 |
| 重庆 | missing | missing | missing | missing | missing | missing | 仅院校查询 |
| 四川 | blocked | blocked | blocked | blocked | blocked | blocked | 仅院校查询 |
| 贵州 | missing | missing | missing | missing | missing | missing | 仅院校查询 |
| 云南 | missing | missing | missing | missing | missing | missing | 仅院校查询 |
| 西藏 | missing | missing | missing | missing | missing | missing | 仅院校查询 |
| 陕西 | missing | missing | missing | missing | missing | missing | 仅院校查询 |
| 甘肃 | missing | missing | missing | missing | missing | missing | 仅院校查询 |
| 青海 | missing | missing | missing | missing | missing | missing | 仅院校查询 |
| 宁夏 | missing | missing | missing | missing | missing | missing | 仅院校查询 |
| 新疆 | missing | missing | missing | missing | missing | missing | 仅院校查询 |

## verified 数据

- 浙江 / 2023 / admission_scores / 浙江省教育考试院 / https://www.zjzs.net/art/2023/7/19/art_45_2052.html
- 浙江 / 2024 / admission_scores / 浙江省教育考试院 / https://www.zjzs.net/art/2024/7/21/art_155_9900.html
- 浙江 / 2025 / admission_scores / 浙江省教育考试院 / https://www.zjzs.net/art/2025/7/21/art_45_11467.html
- 山东 / 2023 / admission_scores / 山东省教育招生考试院 / https://www.sdzk.cn/NewsInfo.aspx?NewsID=6297
- 山东 / 2024 / admission_scores / 山东省教育招生考试院 / https://www.sdzk.cn/NewsInfo.aspx?NewsID=6680
- 山东 / 2025 / admission_scores / 山东省教育招生考试院 / https://www.sdzk.cn/NewsInfo.aspx?NewsID=6996

## imported 数据

- 无

## pending_review 数据

- 浙江 / 2026 / score_segments / 浙江省教育考试院 / https://www.zjzs.net/art/2026/6/26/art_45_12452.html

## partial 数据

- 浙江 / 2026 / province_rules / 浙江省教育考试院 / https://www.zjzs.net/art/2026/6/17/art_45_12386.html
- 山东 / 2026 / admission_plans / 山东省教育招生考试院 / https://www.sdzk.cn/NewsInfo.aspx?NewsID=7278
- 山东 / 2026 / province_rules / 山东省教育招生考试院 / https://www.sdzk.cn/NewsInfo.aspx?NewsID=7265
- 山东 / 2026 / score_segments / 山东省教育招生考试院 / https://www.sdzk.cn/NewsInfo.aspx?NewsID=7272
- 湖北 / 2026 / score_segments / 湖北省教育考试院 / http://www.hbea.edu.cn/html/2026-06/15963.html
- 广东 / 2026 / admission_plans / 广东省教育考试院 / https://eea.gd.gov.cn/tzgg/content/post_4917333.html
- 广东 / 2026 / province_rules / 广东省教育考试院 / https://eea.gd.gov.cn/news/content/post_4915636.html

## missing 数据

- 浙江 / 2026 / admission_plans / 浙江省教育考试院 / https://www.zjzs.net/art/2026/6/18/art_45_12398.html
- 安徽 / 2026 / admission_plans / 安徽省教育招生考试院 / https://www.ahzsks.cn/ptgxzs/
- 安徽 / 2023 / admission_scores / 安徽省教育招生考试院 / https://www.ahzsks.cn/ptgxzs/
- 安徽 / 2024 / admission_scores / 安徽省教育招生考试院 / https://www.ahzsks.cn/ptgxzs/
- 安徽 / 2025 / admission_scores / 安徽省教育招生考试院 / https://www.ahzsks.cn/ptgxzs/
- 安徽 / 2026 / province_rules / 安徽省教育招生考试院 / https://www.ahzsks.cn/ptgxzs/
- 安徽 / 2026 / score_segments / 安徽省教育招生考试院 / https://www.ahzsks.cn/ptgxzs/
- 湖北 / 2026 / admission_plans / 湖北省教育考试院 / http://www.hbea.edu.cn/html/ptgk/
- 湖北 / 2023 / admission_scores / 湖北省教育考试院 / http://www.hbea.edu.cn/html/ptgk/
- 湖北 / 2024 / admission_scores / 湖北省教育考试院 / http://www.hbea.edu.cn/html/ptgk/
- 湖北 / 2025 / admission_scores / 湖北省教育考试院 / http://www.hbea.edu.cn/html/ptgk/
- 湖北 / 2026 / province_rules / 湖北省教育考试院 / http://www.hbea.edu.cn/html/ptgk/
- 湖南 / 2026 / admission_plans / 湖南省教育考试院 / 湖南招生考试信息港 / https://www.hneeb.cn/hnxxg/741/index.htm
- 湖南 / 2023 / admission_scores / 湖南省教育考试院 / 湖南招生考试信息港 / https://www.hneeb.cn/hnxxg/741/index.htm
- 湖南 / 2024 / admission_scores / 湖南省教育考试院 / 湖南招生考试信息港 / https://www.hneeb.cn/hnxxg/741/index.htm
- 湖南 / 2025 / admission_scores / 湖南省教育考试院 / 湖南招生考试信息港 / https://www.hneeb.cn/hnxxg/741/index.htm
- 湖南 / 2026 / province_rules / 湖南省教育考试院 / 湖南招生考试信息港 / https://www.hneeb.cn/hnxxg/741/index.htm
- 湖南 / 2026 / score_segments / 湖南省教育考试院 / 湖南招生考试信息港 / https://www.hneeb.cn/hnxxg/741/index.htm
- 广东 / 2023 / admission_scores / 广东省教育考试院 / https://eea.gd.gov.cn/ptgk/
- 广东 / 2024 / admission_scores / 广东省教育考试院 / https://eea.gd.gov.cn/ptgk/
- 广东 / 2025 / admission_scores / 广东省教育考试院 / https://eea.gd.gov.cn/ptgk/
- 广东 / 2026 / score_segments / 广东省教育考试院 / https://eea.gd.gov.cn/ptgk/

## blocked 数据

- 河北 / 2026 / admission_plans / 河北省教育考试院 / https://www.hebeea.edu.cn/
- 河北 / 2023 / admission_scores / 河北省教育考试院 / https://www.hebeea.edu.cn/
- 河北 / 2024 / admission_scores / 河北省教育考试院 / https://www.hebeea.edu.cn/
- 河北 / 2025 / admission_scores / 河北省教育考试院 / https://www.hebeea.edu.cn/
- 河北 / 2026 / province_rules / 河北省教育考试院 / https://www.hebeea.edu.cn/
- 河北 / 2026 / score_segments / 河北省教育考试院 / https://www.hebeea.edu.cn/
- 四川 / 2026 / admission_plans / 四川省教育考试院 / https://www.sceea.cn/
- 四川 / 2023 / admission_scores / 四川省教育考试院 / https://www.sceea.cn/
- 四川 / 2024 / admission_scores / 四川省教育考试院 / https://www.sceea.cn/
- 四川 / 2025 / admission_scores / 四川省教育考试院 / https://www.sceea.cn/
- 四川 / 2026 / province_rules / 四川省教育考试院 / https://www.sceea.cn/
- 四川 / 2026 / score_segments / 四川省教育考试院 / https://www.sceea.cn/

## 河南本轮更新

- 河南 / 2026 / score_segments / 河南招生考试信息网 / https://www.heao.com.cn/path/HNptgz/202606/820045207449669.shtml / pending_review
- 河南 / 2023 / admission_scores / 河南省教育考试院 / 河南招生考试信息网 / https://datacenter.haeea.cn/PagePZQuery/ShowPZLQ.aspx / blocked
- 河南 / 2024 / admission_scores / 河南省教育考试院 / 河南招生考试信息网 / https://datacenter.haeea.cn/PagePZQuery/ShowPZLQ.aspx / blocked
- 河南 / 2025 / admission_scores / 河南省教育考试院 / 河南招生考试信息网 / https://pzwb.haeea.cn/PZService/default.aspx / blocked
- 河南 / 2026 / admission_plans / 河南招生考试信息网 / https://www.heao.com.cn/path/HNptgz/202606/819808524304453.shtml / missing
- 河南 / 2026 / province_rules / 河南招生考试信息网 / https://www.heao.com.cn/path/HNptgz/202606/819815591440453.shtml / partial

说明：本轮已保存河南 2026 分数段 PDF、招生计划补充说明、志愿填报指南和百问百答等官方 raw 文件；未找到 2023/2024/2025 普通本科批公开可批量下载的官方投档线或录取线，因此未导入河南 `admission_scores`。PDF 分数段没有文本层，待人工/OCR 复核前不进入正式 `score_segments`。

## failed 数据

## 下一步建议

- 优先继续第一批省份：浙江、山东、河南、广东、四川、湖北、湖南、安徽、河北。
- 对第一批省份逐个进入考试院站内高考栏目和公告列表，优先找 Excel、CSV 或网页表格；PDF 只能先保留原文件并进入人工校验。
- 招生计划如果只有总量公告或需要纸质书、登录、验证码、付费渠道，应继续标记 missing 或 blocked，不进入 admission_plans。
- 等某省同时具备 verified 一分一段、含 min_rank 的 admission_scores、当年 admission_plans 后，再开放完整志愿辅助分析。
