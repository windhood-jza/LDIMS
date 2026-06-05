# AGENTS.md

## 项目概览

LDIMS 是一个文档资料管理系统，包含前端、后端、MCP 服务、共享类型包、数据库脚本和 Docker 部署配置。

主要模块：

- `frontend/`: Vue 3 + Vite + TypeScript + Element Plus 前端应用
- `backend/`: Node.js + Express + TypeScript 后端 API
- `backend_mcp/`: 独立 MCP 服务，用于让 AI 工具访问 LDIMS 数据
- `packages/types/`: 前后端共享 TypeScript 类型
- `db_sql/`: MySQL 数据库初始化和数据脚本
- `docs/`: 需求、设计、运行、部署、MCP 相关文档
- `nginx/`: 生产部署用 Nginx 配置模板

## 工作方式

- 正常沟通、解释、代码注释和文档优先使用中文。
- 做文件操作前先确认当前工作目录。
- 改动保持小范围，优先沿用现有项目结构和代码风格。
- 不读取或复制 `.env`、密钥、证书、Cookie、缓存、会话数据等敏感内容。
- 不随意清理、重置或恢复工作区中已有的无关变更。
- 修改代码后，根据影响范围运行对应验证命令。

## 项目记忆文件

为了让多个对话能够共享项目上下文，除本文件外，优先使用以下两个长期维护文件：

- `docs/CONTEXT.md`: 项目长期上下文总览。用于记录系统当前阶段、核心业务流程、重要技术决策、架构约定、已知风险、运行环境注意事项，以及后续对话需要知道的背景。
- `docs/TODO.md`: 跨对话任务清单。用于记录尚未完成的工作、待确认问题、下一步建议、已阻塞事项，以及每个任务的简短状态。

更新机制：

- 每次开始较大的新任务前，先阅读 `AGENTS.md`、`docs/CONTEXT.md` 和 `docs/TODO.md`。如果后两个文件不存在，可以根据当前项目事实创建简洁初版。
- 当本次对话发现了会影响后续工作的长期事实时，更新 `docs/CONTEXT.md`。例如架构决策、重要接口约定、环境坑、数据模型变化、部署方式变化。
- 当本次对话新增、完成、推迟或阻塞了后续工作时，更新 `docs/TODO.md`。任务描述要具体，状态要清楚，避免只写“优化一下”这类模糊事项。
- 不把临时推理、聊天过程、敏感信息、密钥、私有缓存路径、一次性命令输出写入项目记忆文件。
- 更新项目记忆文件时保持简洁，优先追加高价值信息；过期内容应改写或移除，避免让后续对话读到误导性上下文。
- 如果用户明确说“暂时不要更新文档”或类似要求，本次任务不更新 `docs/CONTEXT.md` 和 `docs/TODO.md`。

## 常用命令

前端：

```bash
cd frontend
npm install
npm run dev
npm run build
```

后端：

```bash
cd backend
npm install
npm run dev
npm run build
npm run start:worker:dev
```

MCP 服务：

```bash
cd backend_mcp
npm install
npm run type-check
npm test
npm run build
```

Docker 部署：

```bash
docker compose up -d --build
```

## 当前注意事项

- 当前仓库内多个子项目的 `node_modules` 可能不存在，构建前需要先分别安装依赖。
- 工作区可能存在大量既有变更，例如历史上跟踪过的 `frontend/node_modules`、`frontend/dist` 或压缩包被删除。不要把这些状态误认为本次任务产生的变更。
- `.gitignore` 已包含 `node_modules/`、`dist/`、`.env`、压缩包、证书等规则，但仓库历史中可能已有相关文件被跟踪。
- 项目包含中文源码注释和文档。若终端显示 `鏂囨。` 这类乱码，通常是 UTF-8 内容被 GBK/ANSI 解码导致。读取中文文件时优先显式使用 UTF-8，例如 PowerShell 中使用 `Get-Content -Encoding UTF8`。

## 验证建议

- 只改前端时，优先运行 `frontend` 下的 `npm run build`。
- 只改后端时，优先运行 `backend` 下的 `npm run build`。
- 只改 MCP 服务时，优先运行 `backend_mcp` 下的 `npm run type-check` 和相关测试。
- 涉及 API 契约时，同步检查 `packages/types/`、后端路由/控制器、前端 `services/api/`。
- 涉及文档文件上传、内容提取或搜索时，额外关注 `DocumentService`、`DocumentFile`、BullMQ worker、Python 脚本和数据库字段。

## 业务重点

- 文档元数据管理：文档名称、类型、来源部门、提交人、接收人、签收人、交接日期、存储位置、备注。
- 多文件附件：一个文档可关联多个文件，保留文件顺序、路径、类型、大小、处理状态和提取内容。
- 内容提取：通过 Python 集成 MarkItDown 和 PaddleOCR，提取结果写入 `document_files.extracted_content`。
- 导入导出：Excel/CSV 导入导出通过异步任务处理。
- 权限：基于 JWT 和角色控制，包含管理员、录入员、查看员等角色。
- MCP：为 AI 工具提供文档搜索、文件内容读取、元数据查询等能力。
