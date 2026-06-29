# qiu.dev 新项目接入规范

这份文档用于把新的 Web coding 项目接入 qiu.dev。目标是让首页、项目页、详情页、工具页和最近更新都保持数据驱动，新增项目时尽量不改页面代码。

## 1. 新项目接入目标

新增项目时，只维护两类内容：

- 在 `lib/projects.ts` 增加一个 `Project` 数据对象。
- 如有开发日志，在 `content/updates/` 新增一篇 Markdown。

页面会自动读取数据并更新：

- 首页主推项目
- 首页精选项目
- 首页正在构建
- 首页最近更新
- `/projects`
- `/projects/[slug]`
- `/tools`

## 2. 项目数据结构说明

项目统一维护在 `lib/projects.ts`，类型如下：

```ts
type Project = {
  slug: string
  title: string
  description: string
  longDescription?: string
  status: "live" | "dev" | "design" | "planned"
  type: string
  tags: string[]
  demoUrl?: string
  githubUrl?: string
  featured?: boolean
  tool?: boolean
  progress?: number
  updatedAt?: string
  eta?: string
  completed?: string[]
  nextSteps?: string[]
}
```

字段说明：

- `slug`：项目唯一标识，用于 `/projects/[slug]`。
- `title`：项目名称。
- `description`：首页和卡片简介。
- `longDescription`：详情页长描述。
- `status`：项目状态，可选 `live`、`dev`、`design`、`planned`。
- `type`：项目类型，例如 `工具`、`AI / 教育`、`Web 应用`。
- `tags`：技术栈标签。
- `demoUrl`：在线演示地址。
- `githubUrl`：GitHub 地址。
- `featured`：是否为首页主推项目。
- `tool`：是否属于可用工具，会进入 `/tools`。
- `progress`：开发进度，0 到 100。
- `updatedAt`：最后更新时间，建议使用 `YYYY-MM-DD`。
- `eta`：预计上线时间，例如 `2026 Q3` 或 `已上线`。
- `completed`：最近完成事项。
- `nextSteps`：下一步计划。

## 3. 如何在 lib/projects.ts 新增项目

在 `projects` 数组中追加一个对象：

```ts
{
  slug: "new-tool",
  title: "新工具",
  description: "一句话说明这个项目解决什么问题。",
  longDescription: "更完整地说明项目背景、目标用户、核心能力和后续迭代方向。",
  status: "dev",
  type: "Web 工具",
  tags: ["Next.js", "TypeScript", "AI"],
  demoUrl: "/projects/new-tool",
  githubUrl: "https://github.com/",
  progress: 40,
  updatedAt: "2026-06-29",
  eta: "2026 Q3",
  completed: ["完成产品需求梳理"],
  nextSteps: ["完成首版页面开发"],
}
```

## 4. 如何设置 featured

设置 `featured: true` 后，项目会成为首页主推候选。

首页只展示一个主推项目。如果多个项目设置了 `featured: true`，会取 `projects` 数组中第一个匹配的项目。

建议：

- 同一时间只保留一个 `featured: true`。
- 主推项目应优先选择已上线或接近上线的项目。

## 5. 如何设置 tool

如果项目是一个可直接使用的工具，设置：

```ts
tool: true
```

设置后项目会自动出现在 `/tools` 页面。

注意：

- 工具项目也应该保留 `/projects/[slug]` 详情页。
- `demoUrl` 应指向真实工具入口，例如 `/tools/pdf-to-word`。

## 6. 如何进入正在构建

项目会出现在首页“正在构建”模块，需要同时满足：

- `status` 为 `dev` 或 `design`
- `progress` 是数字
- `progress` 小于 100

建议同时填写：

- `eta`
- `completed`
- `nextSteps`

这样模块内容会更可信。

## 7. 如何新增 content/updates 日志

开发日志放在：

```txt
content/updates/
```

文件命名：

```txt
YYYY-MM-DD-project-slug.md
```

示例：

```md
---
date: "2026-07-01"
project: "gaokao-volunteer"
title: "完成推荐算法初版"
type: "dev"
---

完成高考志愿辅助系统推荐算法初版，支持根据分数、省份和科类生成基础志愿建议。
```

字段说明：

- `date`：更新日期。
- `project`：项目 slug，必须能在 `lib/projects.ts` 找到。
- `title`：更新标题。
- `type`：更新类型，可用 `dev`、`design`、`live` 等。

首页会自动展示最近 3 条更新。项目详情页会自动展示与当前项目 slug 匹配的日志。

## 8. 如何检查 /projects/[slug]

新增项目后访问：

```txt
/projects/你的项目slug
```

检查内容：

- 项目名称正确
- 状态标签正确
- 类型和技术栈正确
- 在线演示按钮可点击
- GitHub 按钮可点击
- 更新时间、进度、预计上线时间正确
- 最近完成和下一步计划正确
- 相关开发日志能显示
- 不存在的 slug 返回 404

## 9. 新项目接入检查清单

- [ ] 已在 `lib/projects.ts` 新增项目
- [ ] `slug` 唯一
- [ ] `status` 使用合法值
- [ ] `type` 使用中文优先
- [ ] `tags` 已填写
- [ ] `demoUrl` 可点击
- [ ] `githubUrl` 可点击
- [ ] 如需主推，已设置 `featured: true`
- [ ] 如是工具，已设置 `tool: true`
- [ ] 如在构建中，已填写 `progress`、`eta`、`completed`、`nextSteps`
- [ ] 如有更新，已新增 `content/updates/` Markdown
- [ ] `/projects` 显示正常
- [ ] `/projects/[slug]` 显示正常
- [ ] `/tools` 显示正常
- [ ] 首页最近更新显示正常
- [ ] `npm run build` 通过

## 10. 给 Codex 的新增项目模板

请根据 docs/PROJECT_INTEGRATION_GUIDE.md，把以下新项目接入 qiu.dev 网站。

项目名称：
项目 slug：
项目描述：
长描述：
项目状态：live / dev / design / planned
项目类型：
技术栈：
Demo 地址：
GitHub 地址：
是否 Featured：
是否 Tool：
开发进度：
预计上线：
最近完成：
下一步计划：
更新时间：
更新日志标题：
更新日志内容：

要求：
- 不要重建项目
- 按现有数据结构接入
- 保证首页、/projects、/projects/[slug]、/tools、最近更新正常显示
- 保证 npm run build 通过
