# qiu.dev

持续构建 Web 工具、AI 应用和实验性项目的个人产品平台。

## 本地运行方式

先安装依赖：

```bash
npm install
```

启动开发服务：

```bash
npm run dev
```

默认访问：

```txt
http://localhost:3000
```

## 构建方式

执行生产构建：

```bash
npm run build
```

本地预览生产构建：

```bash
npm run start
```

## Vercel 部署说明

这是 Next.js 14 App Router 项目，可以导入到 Vercel 后使用默认 Next.js 配置部署。

建议部署前检查：

- `npm run build` 可以通过。
- `app/layout.tsx` 的 `metadataBase` 与正式域名一致。
- `/robots.txt` 和 `/sitemap.xml` 可以访问。
- 所有项目链接、工具链接和联系链接已替换为正式地址。

注意：当前 `PDF 转 Word` 工具在本机调用 Windows 版本地转换引擎。部署到 Vercel 后，Serverless 环境不能直接运行这个本地 EXE。线上使用前需要把转换能力改为独立服务、队列任务或其他可部署的转换后端。

## 新项目接入说明

项目数据统一维护在：

```txt
lib/projects.ts
```

新增项目时，按 `Project` 类型追加数据，并优先补充：

- `slug`
- `title`
- `description`
- `status`
- `type`
- `tags`
- `demoUrl`
- `githubUrl`
- `updatedAt`

如果项目需要展示在首页主推模块，设置：

```ts
featured: true
```

如果项目是可用工具，设置：

```ts
tool: true
```

如果项目处于开发或设计阶段，并希望进入“正在构建”模块，需要填写：

```ts
progress: 60
eta: "2026 Q3"
completed: ["已完成事项"]
nextSteps: ["下一步计划"]
```

开发日志放在：

```txt
content/updates/
```

详细规范见：

```txt
docs/PROJECT_INTEGRATION_GUIDE.md
```
