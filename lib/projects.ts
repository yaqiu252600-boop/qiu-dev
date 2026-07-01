export type Project = {
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

export const projects: Project[] = [
  {
    slug: "pdf-to-word",
    title: "PDF 转 Word",
    description: "PDF 转 Word 工具，调用本地或自托管转换引擎生成可编辑 Word 文档。",
    longDescription:
      "这是 qiu.dev 的第一个可用工具项目。当前已接入本地 PDF 转 Word 转换引擎，支持上传 PDF、调用本机或自托管转换程序生成可编辑 Word 文档，并提供下载链接。部署到 Vercel 时需要额外配置独立转换服务，不能直接运行本地 Windows EXE。",
    status: "live",
    type: "工具",
    tags: ["Next.js", "TypeScript", "Route Handler"],
    demoUrl: "/tools/pdf-to-word",
    githubUrl: "https://github.com/",
    featured: true,
    tool: true,
    progress: 100,
    updatedAt: "2026-06-29",
    eta: "已上线",
    completed: ["完成上传与转换流程", "完成可编辑 Word 文件下载", "接入工具入口页面"],
    nextSteps: ["优化复杂版式还原", "增加文件大小与格式提示"],
  },
  {
    slug: "video-tools",
    title: "视频文案提取与下载",
    description: "输入公开视频链接，提取标题、简介、字幕文案，并选择可用清晰度下载视频。",
    longDescription:
      "面向公开视频处理的实用工具。用户输入视频链接后，系统会解析视频标题、简介、可用字幕和可直接下载的合并音视频格式，支持复制文案、导出 TXT，并按清晰度生成下载文件。工具不接入登录态、Cookie 或 DRM 绕过能力，只处理用户有权使用的公开视频内容。",
    status: "live",
    type: "工具",
    tags: ["Next.js", "视频处理", "字幕提取", "下载工具"],
    demoUrl: "/tools/video-tools",
    githubUrl: "https://github.com/",
    featured: false,
    tool: true,
    progress: 100,
    updatedAt: "2026-06-30",
    eta: "已上线",
    completed: ["完成视频链接解析", "完成文案提取与复制", "完成清晰度选择下载"],
    nextSteps: ["补充更多平台兼容性测试", "增加长视频队列处理", "优化失败原因提示"],
  },
  {
    slug: "gaokao-volunteer",
    title: "高考志愿数据查询与辅助分析工具",
    description: "基于教育部高校名单和江苏官方投档线的数据查询与辅助分析工具。",
    longDescription:
      "面向高考志愿填报场景的可信数据工具。当前版本已接入教育部 2026 年全国普通高等学校名单，并从江苏省教育考试院官方 PDF 清洗江苏 2025 普通类本科批投档线；缺失的一分一段、招生计划和录取线会明确显示暂无可信数据，不使用系统生成内容补齐。",
    status: "dev",
    type: "教育 / 数据工具",
    tags: ["Next.js", "官方数据", "教育", "数据查询"],
    demoUrl: "/tools/gaokao-volunteer",
    githubUrl: "https://github.com/",
    featured: false,
    tool: true,
    progress: 70,
    updatedAt: "2026-07-01",
    eta: "2026 Q3",
    completed: ["导入教育部 2026 高校名单", "清洗江苏 2025 普通类本科批投档线", "新增可信数据 API 与数据来源页"],
    nextSteps: ["校验江苏 2026 逐分段图片表格", "继续接入江苏 2023、2024 官方投档线", "寻找可公开下载的招生计划数据"],
  },
  {
    slug: "career-planner",
    title: "职业规划助手",
    description: "根据兴趣、技能和学习背景生成职业路径与学习建议。",
    longDescription:
      "面向学生和职场新人的职业规划工具。项目会把用户的兴趣、技能、学习背景和目标行业组合起来，生成可执行的职业路径和学习计划。",
    status: "design",
    type: "AI / 职业规划",
    tags: ["Vue.js", "AI", "Product Design"],
    demoUrl: "/projects/career-planner",
    githubUrl: "https://github.com/",
    progress: 35,
    updatedAt: "2026-06-29",
    eta: "2026 Q4",
    completed: ["核心用户画像梳理", "路径推荐信息架构", "首版页面结构设计"],
    nextSteps: ["完善问题引导流程", "设计职业路径评分逻辑", "整理技能图谱数据"],
  },
  {
    slug: "todo-app",
    title: "待办清单应用",
    description: "面向个人效率的轻量任务管理应用，支持基础任务流转。",
    longDescription:
      "一个简洁的任务管理 Web 应用，用于练习可复用表单、列表状态、任务筛选和本地数据持久化。",
    status: "live",
    type: "Web 应用",
    tags: ["Next.js", "TypeScript", "Local Storage"],
    demoUrl: "/projects/todo-app",
    githubUrl: "https://github.com/",
    progress: 100,
    updatedAt: "2026-06-28",
    eta: "已上线",
    completed: ["任务新增与完成状态", "本地存储", "基础筛选"],
    nextSteps: ["增加标签分组", "补充键盘快捷操作"],
  },
  {
    slug: "weather-app",
    title: "天气查询应用",
    description: "简洁的城市天气查询应用，适合快速查看实时天气信息。",
    longDescription:
      "一个轻量天气查询项目，重点验证 API 请求、加载状态、错误提示和移动端信息布局。",
    status: "live",
    type: "Web 应用",
    tags: ["React", "API", "UI"],
    demoUrl: "/projects/weather-app",
    githubUrl: "https://github.com/",
    progress: 100,
    updatedAt: "2026-06-27",
    eta: "已上线",
    completed: ["城市查询", "天气结果展示", "错误状态处理"],
    nextSteps: ["增加多日预报", "增加常用城市收藏"],
  },
  {
    slug: "ai-chat-assistant",
    title: "AI 聊天助手",
    description: "面向日常问答和知识整理的 AI 对话助手实验项目。",
    longDescription:
      "一个 AI 对话产品实验，重点探索日常问答、资料整理、上下文管理和对话体验的产品边界。",
    status: "dev",
    type: "AI 应用",
    tags: ["Next.js", "AI", "Chat"],
    demoUrl: "/projects/ai-chat-assistant",
    githubUrl: "https://github.com/",
    updatedAt: "2026-06-26",
    eta: "规划中",
    completed: ["确定基础使用场景", "整理对话页面需求"],
    nextSteps: ["设计消息数据结构", "接入模型调用接口"],
  },
]

export const statusText: Record<Project["status"], string> = {
  live: "已上线",
  dev: "开发中",
  design: "设计中",
  planned: "计划中",
}

export function getFeaturedProject() {
  return projects.find((project) => project.featured) ?? projects[0]
}

export function getRecentProjects(limit = 6) {
  return [...projects]
    .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))
    .slice(0, limit)
}

export function getBuildingProjects() {
  return projects.filter(
    (project) =>
      (project.status === "dev" || project.status === "design") &&
      typeof project.progress === "number" &&
      project.progress < 100,
  )
}

export function getToolProjects() {
  return projects.filter((project) => project.tool)
}

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug)
}

export function getRelatedProjects(project: Project, limit = 3) {
  return projects
    .filter((item) => item.slug !== project.slug)
    .sort((a, b) => {
      const sameTypeA = a.type === project.type ? 0 : 1
      const sameTypeB = b.type === project.type ? 0 : 1
      return sameTypeA - sameTypeB
    })
    .slice(0, limit)
}

export function getProjectStats() {
  const buildingCount = getBuildingProjects().length
  const liveToolCount = projects.filter(
    (project) => project.tool && project.status === "live",
  ).length

  return [
    { label: "项目", value: `${projects.length}+` },
    { label: "构建中", value: `${buildingCount}` },
    { label: "已上线工具", value: `${liveToolCount}` },
  ]
}
