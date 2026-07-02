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
    description: "上传文本型 PDF 后在线生成可下载的 Word 文件，适合合同、报告、说明书等带文字层的 PDF。",
    longDescription:
      "这是 qiu.dev 的在线 PDF 转 Word 工具。当前版本在服务器端提取 PDF 文本并生成可编辑 Word 文件，不再依赖本地 Windows 转换程序；扫描件图片版暂不支持 OCR。",
    status: "live",
    type: "工具",
    tags: ["Next.js", "PDF", "Word"],
    demoUrl: "/tools/pdf-to-word",
    githubUrl: "https://github.com/",
    featured: true,
    tool: true,
    progress: 100,
    updatedAt: "2026-06-29",
    eta: "已上线",
    completed: ["完成上传与转换流程", "完成 Word 文件下载", "改为线上可运行的转换方式"],
    nextSteps: ["补充扫描件 OCR", "优化复杂版式还原"],
  },
  {
    slug: "video-tools",
    title: "视频链接下载器",
    description:
      "粘贴视频链接，自动解析可用资源；能下载的直接下载，受限内容给出清晰提示。",
    longDescription:
      "面向公开视频资源的双通道下载工具。用户输入视频链接后，系统会优先检测公开视频直链和可服务端下载资源；如果服务端不能下载但存在候选媒体资源，会提供浏览器直连下载。工具不接入 Cookie、登录态或 DRM 绕过能力，遇到登录、人机验证、年龄认证、私密权限或受保护内容时会给出清晰提示。",
    status: "live",
    type: "工具",
    tags: ["Next.js", "视频下载", "SSRF 防护", "下载工具"],
    demoUrl: "/tools/video-tools",
    githubUrl: "https://github.com/",
    featured: false,
    tool: true,
    progress: 100,
    updatedAt: "2026-07-01",
    eta: "已上线",
    completed: ["完成双通道链接解析", "完成 token 下载接口", "完成平台验证类错误提示"],
    nextSteps: ["接入自部署 cobalt 服务", "补充更多平台兼容性测试", "增加长视频队列处理"],
  },
  {
    slug: "daily-fortune",
    title: "每日一签",
    description: "生成今日签文、签位、关键词、宜忌提醒和传统文化娱乐解读。",
    longDescription:
      "每日一签工具使用日期作为随机种子，让同一天结果相对稳定。内容定位为传统文化娱乐参考，包含签文、今日关键词、宜忌、事业、感情、财富、健康生活提醒以及适合分享的结果卡片。",
    status: "live",
    type: "传统文化工具",
    tags: ["Next.js", "传统文化", "每日一签"],
    demoUrl: "/tools/daily-fortune",
    githubUrl: "https://github.com/",
    featured: false,
    tool: true,
    progress: 100,
    updatedAt: "2026-07-02",
    eta: "已上线",
    completed: ["完成日期种子生成", "完成分享卡片", "完成合规免责声明"],
    nextSteps: ["补充更多签文模板", "优化分享图片导出"],
  },
  {
    slug: "bazi",
    title: "八字排盘工具",
    description: "输入出生日期时间，生成四柱八字、五行分布、十神关系与传统命理文化解读。",
    longDescription:
      "八字排盘工具基于 lunar-javascript 生成年柱、月柱、日柱、时柱、生肖、天干地支、五行统计、十神关系、藏干、纳音和基础文化解读。第一版不保存用户出生信息，不连接数据库，并提供详细报告变现预览、PDF 打印导出和分享卡片。",
    status: "live",
    type: "传统文化工具",
    tags: ["Next.js", "八字排盘", "五行", "四柱"],
    demoUrl: "/tools/bazi",
    githubUrl: "https://github.com/",
    featured: false,
    tool: true,
    progress: 100,
    updatedAt: "2026-07-02",
    eta: "已上线",
    completed: ["完成四柱排盘", "完成高级报告锁定展示", "完成 PDF 与分享预览"],
    nextSteps: ["接入真实订单系统", "扩展阴历和真太阳时"],
  },
  {
    slug: "name",
    title: "取名推荐",
    description: "根据姓氏、风格偏好和传统五行文化生成名字灵感与寓意参考。",
    longDescription:
      "取名推荐工具不会保存用户输入信息，不连接数据库。用户可以选择名字字数、风格、是否结合五行、避开用字和指定辈分字，首版生成至少 20 个名字灵感。",
    status: "live",
    type: "传统文化工具",
    tags: ["Next.js", "取名", "五行", "名字寓意"],
    demoUrl: "/tools/name",
    githubUrl: "https://github.com/",
    featured: false,
    tool: true,
    progress: 100,
    updatedAt: "2026-07-02",
    eta: "已上线",
    completed: ["完成取名表单", "完成 20 条推荐结果", "完成隐私提示"],
    nextSteps: ["扩展字库", "补充更多拼音和字义来源"],
  },
  {
    slug: "auspicious-date",
    title: "良辰吉日",
    description: "按事项和日期范围筛选传统黄历参考日期，支持周末与冲煞过滤。",
    longDescription:
      "良辰吉日工具基于 lunar-javascript 提供农历、宜忌、冲煞和吉神信息，支持结婚、搬家、开业、领证、装修、入宅、签约、出行等民俗文化参考场景，不支持医疗、法律、投资等重大决策。",
    status: "live",
    type: "传统文化工具",
    tags: ["Next.js", "黄历", "良辰吉日", "农历"],
    demoUrl: "/tools/auspicious-date",
    githubUrl: "https://github.com/",
    featured: false,
    tool: true,
    progress: 100,
    updatedAt: "2026-07-02",
    eta: "已上线",
    completed: ["完成黄历筛选", "完成生肖冲煞过滤", "完成高风险场景拦截"],
    nextSteps: ["扩展事项类型", "优化推荐指数解释"],
  },
  {
    slug: "droidlink",
    title: "DroidLink 手机电脑连接工具",
    description:
      "Android 手机与 Windows 电脑之间的局域网互联工具，已完成二维码配对、双向文件互传、历史记录和断开连接流程。",
    longDescription:
      "DroidLink 是一个 Android 手机与 Windows 电脑之间的本地互联工具。当前 V0.2 已经交付 Windows 单文件程序、原生 Android APK、二维码或 6 位配对码连接、手机到电脑与电脑到手机的双向文件传输、传输历史、接收目录持久化和本地安全授权。手机投屏、鼠标键盘控制、剪贴板同步和更多连接方式属于后续阶段。",
    status: "dev",
    type: "Windows / Android 工具",
    tags: ["Android", "Windows", "局域网互传", "二维码配对"],
    demoUrl: "/tools/droidlink",
    githubUrl: "https://github.com/",
    featured: false,
    tool: true,
    progress: 68,
    updatedAt: "2026-06-21",
    eta: "V0.2 可用，投屏阶段待开发",
    completed: [
      "完成 Windows 单文件 EXE 和原生 Android APK",
      "完成二维码或手动地址 + 6 位一次性配对码",
      "完成手机与电脑之间的双向文件传输",
      "完成传输历史、接收目录持久化和主动断开连接",
      "完成源码、使用说明和构建文档打包",
    ],
    nextSteps: [
      "加入手机投屏到电脑",
      "加入鼠标键盘控制手机",
      "补充 USB、蓝牙等更多连接方式",
      "增加剪贴板同步和手机文件管理",
    ],
  },
  {
    slug: "gaokao-volunteer",
    title: "高考志愿数据查询与辅助分析工具",
    description: "基于教育部高校名单和省级官方源状态的高考数据查询工具。",
    longDescription:
      "面向高考志愿填报场景的可信数据工具。当前版本已接入教育部 2026 年全国普通高等学校名单；江苏数据由独立任务继续处理，非江苏省份已建立官方源发现、数据状态登记和 missing/blocked/partial 报告框架。缺失数据会明确显示暂无可信数据，不使用系统生成内容补齐。",
    status: "dev",
    type: "教育 / 数据工具",
    tags: ["Next.js", "官方数据", "教育", "数据查询"],
    demoUrl: "/tools/gaokao-volunteer",
    githubUrl: "https://github.com/",
    featured: false,
    tool: true,
    progress: 72,
    updatedAt: "2026-07-01",
    eta: "2026 Q3",
    completed: [
      "导入教育部 2026 高校名单",
      "清洗江苏 2025 普通类本科批投档线",
      "新增可信数据 API 与数据来源页",
      "新增江苏 2023/2024 官方附件下载与导入脚本",
      "新增江苏 2026 逐分段 pending-review 流程",
      "新增非江苏全国省份配置和第一批官方源发现报告",
    ],
    nextSteps: [
      "继续复核第一批省份官方公告内页和附件",
      "只导入公开可下载且可校验的结构化数据",
      "等待江苏独立任务完成后再汇总全国覆盖状态",
    ],
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
