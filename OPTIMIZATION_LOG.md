# 优化更新记录

本文档用于记录项目开发过程中的功能优化、体验改进和验证结果，避免混入竞赛材料、长期上下文或任务清单文档。

## 2026-06-06 文档管理页列表宽度自适应优化

### 背景

文档管理页面的文档列表在不同显示器分辨率下展示不够稳定，主要表现为表格列宽固定、页面容易被横向撑开，且操作列中的多个按钮在较窄空间下可能换行。

### 调整内容

- 在文档表格外层增加横向滚动容器，让窄屏时滚动限制在表格区域内。
- 将文档名称、文档类型、来源部门、提交人、接收人、签章人、创建人等内容列由固定宽度调整为 `min-width`，提升宽屏下的空间利用率。
- 保留选择框、ID、日期、创建时间、操作列的固定宽度，保证交互和日期展示稳定。
- 将操作列宽度调整为 300px，并使用单行 flex 布局，保证“查看 / 编辑 / 预览文件 / 删除”四个按钮尽量同一行展示。
- 允许搜索筛选组在窄屏下换行，避免搜索区撑破页面。

### 涉及文件

- `frontend/src/views/DocumentListView.vue`

### 验证情况

- 已运行 `frontend` 下的 `npm run build`，构建通过。
- 本地前端开发服务运行在 `http://127.0.0.1:5173/`。
- 本地后端开发服务运行在 `http://127.0.0.1:3000/`。
- 后端已通过本地 `.env` 使用 `test / 123456` 连接 MySQL。
- Redis 未连接，本次文档列表页面展示验证不依赖 Redis。

### 复检重点

- 宽屏下表格是否能充分铺满文档管理内容区域。
- 窄屏下页面整体是否不被表格撑破，而是在表格内部横向滚动。
- 操作列是否固定在右侧。
- 操作列四个按钮是否保持一行展示。

## 2026-06-08 项目基础加固优化

### 背景

在项目体检过程中发现，后端附件下载和上传流程存在运行日志暴露物理路径的风险，前端请求层和登录页仍有开发期调试日志，后端测试脚本也仍是占位命令。为提升演示稳定性、安全性和后续可维护性，在 `codex/project-hardening-basics` 分支上完成一轮基础加固。

### 调整内容

- 增加后端存储路径解析工具 `resolveStorageFilePath`，拒绝空路径、绝对路径和 `../` 越界路径。
- 单文件下载和批量附件打包下载统一使用路径安全工具解析文件路径，避免异常 `filePath` 跳出存储根目录。
- 增加前端轻量 `logger`，移除请求拦截器和登录页中 token、用户对象、请求参数等直接输出。
- 增加后端轻量 `logger`，支持 `LOG_LEVEL=debug/info/warn/error`，生产默认更收敛。
- 收口上传流程日志：不再输出临时物理路径、最终物理路径、相对存储路径和完整文件记录对象；保留文档 ID、文件序号、MIME、大小和处理阶段，便于测试观察。
- 后端启动时输出当前日志配置，便于确认 `.env` 中的 `LOG_LEVEL` 是否生效。
- 后端 `npm test` 接入 Node 内置测试运行器和 `ts-node/register`，并新增路径安全单元测试。
- 在本地和 Docker 示例环境配置中补充 `LOG_LEVEL`：本地开发示例为 `debug`，Docker/生产示例为 `warn`。
- 本地测试环境整理为后端端口 `3000`、数据库 `127.0.0.1:3306 / ldims_db`、Redis `127.0.0.1:6379`，避免本地直启时误用 Docker 内部主机名 `db` / `redis`。

### 涉及文件

- `backend/src/utils/storagePath.ts`
- `backend/src/utils/logger.ts`
- `backend/src/controllers/DocumentController.ts`
- `backend/src/services/DocumentService.ts`
- `backend/src/middleware/authenticateToken.ts`
- `backend/src/app.ts`
- `backend/package.json`
- `backend/tests/utils/storagePath.test.ts`
- `frontend/src/utils/logger.ts`
- `frontend/src/services/request.ts`
- `frontend/src/views/LoginView.vue`
- `backend/.env.example`
- `env.example`
- `.env.docker.sample`

### 验证情况

- 已运行 `backend` 下的 `npm test`，4 个路径安全测试全部通过。
- 已运行 `backend` 下的 `npm run build`，构建通过。
- 已运行 `frontend` 下的 `npm run build`，构建通过；仅保留 Vite 大 chunk 警告。
- 已通过 `http://127.0.0.1:3000/api/v1/health` 验证后端健康接口返回 200，数据库连接状态为 `true`。
- 已通过 `http://127.0.0.1:5173/api/v1/health` 验证前端 Vite 代理可转发到后端。
- 已做上传流程人工复测，并针对日志仍有物理路径输出的问题追加收口；后续复测应确认后端终端只显示无物理路径的上传阶段日志。

### 当前分支与提交

- 当前优化分支：`codex/project-hardening-basics`
- 相关提交：
  - `0f523184` 增强附件文件路径安全校验
  - `6efe13e1` 收口前后端开发期敏感日志
  - `83cf2317` 补充后端最小测试入口
  - `02bc9b76` 收口上传流程中的文件路径日志
  - `bd5b3eb4` 补充日志级别环境配置
  - `b95781f9` 增强上传日志可见性

### 复检重点

- 后端启动日志中应显示 `LOG_LEVEL=debug`，用于确认本地开发日志配置生效。
- 上传附件时，后端终端可显示文档 ID、文件序号、MIME、大小和处理阶段，但不应显示 `D:\...` 这类完整物理路径。
- 登录和请求过程中，前端控制台不应显示 token、完整用户对象或请求参数明细。
- 下载和批量打包下载应正常工作；异常路径应被后端拒绝。

### 后续修正

- 修复后端 `logger` 在模块加载时提前缓存 `LOG_LEVEL` 的问题。由于 `app.ts` 中 `dotenv.config()` 可能晚于静态导入执行，旧实现会导致 `.env` 中的日志级别没有生效；现已改为每次输出日志时读取当前环境变量。
- 新增 `backend/tests/utils/logger.test.ts`，覆盖“先导入 logger、后设置 `LOG_LEVEL`”时日志级别仍能生效的场景。
- 进一步加固本地开发日志可见性：将 `.env` 加载提前到业务模块导入前；后端启动时的端口和日志级别改为直接 `console.log` 输出，不再受 `LOG_LEVEL` 过滤；`debug/info` 级别统一走 `console.log`，避免不同终端对 `console.debug/info` 展示不一致；`LOG_LEVEL` 支持大小写和前后空格容错。

## 2026-06-09 安全与日志收口优化

### 背景

在基础加固完成后继续检查发现，导出任务下载链路仍会向前端暴露 `filePath`，下载时直接使用任务中的文件路径；内容提取服务和 worker 仍存在完整路径、任务数据或提取内容片段输出；Docker Compose 未显式传递 `LOG_LEVEL`；本地真实 Docker 环境文件也需要明确避免误提交。

### 调整内容

- 新建优化分支：`codex/security-log-hardening`。
- 导出任务下载增加导出目录边界校验，新增 `backend/src/utils/exportPath.ts` 和 `backend/tests/utils/exportPath.test.ts`。
- 导出任务列表和详情不再向前端返回 `filePath`，改为返回 `canDownload`，前端下载按钮改用该字段判断。
- 内容提取服务改用 `resolveStorageFilePath` 解析文件路径，不再输出完整物理路径和提取内容片段。
- content extraction worker / processor 接入后端 logger，不再打印完整 `job.data`；同时修复 sandbox processor 向内容处理服务传参不一致的问题。
- `docker-compose.yaml` 的 backend 和 worker 环境变量显式传入 `LOG_LEVEL`。
- `.gitignore` 明确忽略 `.env.docker` 和 `backend/.env.docker`，避免真实环境配置误提交。

### 验证情况

- 已运行 `backend` 下的 `npm test`，10 个测试全部通过。
- 已运行 `backend` 下的 `npm run build`，构建通过。
- 已运行 `frontend` 下的 `npm run build`，构建通过；仍保留 Vite 大 chunk 警告。
