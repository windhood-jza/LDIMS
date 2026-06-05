# LDIMS - 融合业务部文档管理系统

## 项目简介

LDIMS (Lean Document Information Management System) 是一个为技术中心融合业务部设计的文档信息管理系统。旨在提供一个集中、高效的平台，用于文档的录入、存储、分类、查询、统计分析、导入导出等功能，以提升部门内部文档管理的效率和规范性。

## 主要功能

### 核心功能
*   **仪表盘:** 提供系统关键指标概览（文档总数、类型数、部门数、用户数）以及文档按类型、部门的分布图表。
*   **文档管理:**
    *   文档信息录入、编辑、查看、删除（软删除）。
    *   支持按文档名称、提交人、接收人、签章人、文档类型、来源部门、交接日期等多种条件进行组合搜索和筛选。
    *   分页展示文档列表。
    *   **多文件支持:** 每个文档记录可关联多个文件（PDF、Word、图片等），支持文件顺序管理。
*   **文档类型管理:** 树状结构管理文档分类（支持多级）。
*   **部门管理:** 树状结构管理组织部门（支持两级）。
*   **用户管理:** 系统用户增删改查、状态启用/禁用、密码重置。

### 导入导出
*   支持将筛选后的文档数据批量导出为 Excel 或 CSV 文件（异步任务处理）。
*   支持通过上传 Excel 文件批量导入文档信息（异步任务处理）。
*   提供任务列表查看导入导出进度、状态和下载结果文件。
*   导入时提供详细的错误信息（行号、错误原因）。

### 智能内容处理
*   **内容提取:** 自动从上传的文件中提取文本内容。
    *   优先使用 MarkItDown 转换 Office/PDF 文档为 Markdown。
    *   对图片或扫描版 PDF 使用 PaddleOCR 进行文字识别。
*   **全文搜索:** 基于 MySQL 全文索引，支持跨多文件内容搜索。

### 统计与日志
*   **统计报表:** 提供按文档类型、来源部门统计文档数量的图表展示。
*   **操作日志:** 记录关键操作（用户管理、文档操作等）的日志，便于审计追踪。
*   **认证与授权:** 基于 JWT 的用户登录认证，支持三种角色（管理员、录入员、查看员）。

## 技术栈

### 后端
| 类别 | 技术 |
|------|------|
| 框架 | Node.js + Express.js |
| 语言 | TypeScript |
| 数据库 | MySQL + Sequelize ORM |
| 认证 | JSON Web Token (JWT) + bcryptjs |
| 输入验证 | express-validator |
| 文件处理 | Multer (上传), xlsx (Excel读写) |
| 任务队列 | BullMQ (异步任务处理) |
| 内容提取 | MarkItDown, PaddleOCR (Python集成) |
| 其他 | dotenv, cors, body-parser, morgan |

### 前端
| 类别 | 技术 |
|------|------|
| 框架 | Vue 3 (Composition API) |
| 构建工具 | Vite |
| 语言 | TypeScript |
| UI 库 | Element Plus |
| 路由 | Vue Router |
| 状态管理 | Vue Reactivity (`ref`, `reactive`, `computed`) |
| HTTP 请求 | Axios (封装在 `src/services/api/`) |
| 图表 | ECharts |

### MCP 服务
独立的服务模块，提供 AI 工具接口，支持通过 Model Context Protocol 与 LDIMS 数据交互。

## 项目结构

```
LDIMS/
├── backend/                    # Node.js + Express 后端服务
│   ├── src/
│   │   ├── config/             # 数据库、Redis、存储配置
│   │   ├── controllers/        # 控制器层
│   │   ├── models/            # Sequelize 数据模型
│   │   ├── routes/            # API 路由
│   │   ├── services/          # 业务逻辑层
│   │   ├── middleware/        # 中间件（认证、验证、上传）
│   │   ├── types/            # TypeScript 类型定义
│   │   ├── utils/            # 工具函数
│   │   ├── queues/           # BullMQ 任务队列
│   │   └── workers/          # 后台内容提取 Worker
│   ├── venv/                  # Python 虚拟环境（内容提取）
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Vue 3 前端应用
│   ├── src/
│   │   ├── components/        # 通用组件
│   │   ├── views/            # 页面组件
│   │   ├── layouts/          # 布局组件
│   │   ├── services/api/     # API 调用封装
│   │   ├── router/           # Vue Router 配置
│   │   └── types/            # 类型定义
│   ├── package.json
│   └── vite.config.ts
│
├── backend_mcp/               # MCP 服务器（AI 工具接口）
│   ├── src/
│   │   ├── services/          # LDIMS API 调用封装
│   │   ├── http/              # HTTP 服务器模式
│   │   └── index.ts           # MCP 入口
│   ├── scripts/               # 工具脚本（Token生成、连接测试）
│   └── README.md              # MCP 服务详细文档
│
├── packages/
│   └── types/                # 前后端共享 TypeScript 类型包
│
├── db_sql/                    # 数据库脚本
├── docs/                      # 项目文档
│   ├── 需求文档_LDIMS.md       # 完整需求规格
│   ├── 实现规划.md             # 分阶段开发计划
│   ├── 新功能规划.md           # 多文件+OCR+MCP 扩展规划
│   └── 本地化安装部署.md       # 离线部署指南
│
└── README.md
```

## 环境要求

| 组件 | 要求 |
|------|------|
| Node.js | v18 或更高版本（LTS 推荐） |
| npm | 与 Node.js 一起安装 |
| MySQL | 5.7 或更高版本 |
| Python | 3.10+（用于内容提取功能） |

## 安装与配置

### 1. 克隆仓库

```bash
git clone <your-repository-url>
cd LDIMS
```

### 2. 后端配置

```bash
cd backend
npm install
```

创建 `.env` 文件：

```ini
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ldims_db
DB_USER=root
DB_PASSWORD=your_db_password

# 后端服务端口
PORT=3000

# JWT 签名密钥（务必修改为复杂字符串）
JWT_SECRET=your_very_secret_jwt_key

# Node.js 环境
NODE_ENV=development
```

### 3. 数据库初始化

```bash
mysql -u root -p
```

```sql
CREATE DATABASE IF NOT EXISTS ldims_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

执行 `db_sql/ldims_db.sql` 中的建表语句，并插入默认数据：

```sql
-- 默认部门
INSERT INTO departments (name, code, parent_id, level, sort_order, status)
VALUES ('总部', 'HQ', 0, 1, 1, 1);

-- 默认管理员用户
INSERT INTO users (username, password, real_name, role, department_id, status)
VALUES ('admin', 'admin123', '系统管理员', 'admin', 1, 1);
```

### 4. 前端配置

```bash
cd ../frontend
npm install
```

创建 `frontend/.env.development`：

```ini
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_API_TIMEOUT=5000
```

## 运行项目

### 开发模式

**后端：**

```bash
cd backend
npm run dev
# 服务运行在 http://localhost:3000
```

**前端：**

```bash
cd frontend
npm run dev
# 服务运行在 http://localhost:5173
```

### 生产构建

**后端：**

```bash
cd backend
npm run build
npm start
```

**前端：**

```bash
cd frontend
npm run build
# 构建产物在 frontend/dist/
```

## MCP 服务配置

LDIMS 提供独立的 MCP 服务器，允许 AI 工具（如 Cursor、Claude Desktop）直接与系统交互。

### 生成认证 Token

```bash
cd backend_mcp
node scripts/get-long-term-token.js
```

### 在 Claude Desktop 中配置

编辑 `~/.config/Claude/claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "ldims": {
      "command": "node",
      "args": ["D:/DEV/LDIMS/backend_mcp/dist/index.js"],
      "env": {
        "LDIMS_API_BASE_URL": "http://localhost:3000",
        "LDIMS_AUTH_TOKEN": "your_long_term_token_here"
      }
    }
  }
}
```

详细配置请参考 [backend_mcp/README.md](backend_mcp/README.md)。

## API 文档

后端 API 基础路径：`/api/v1`

| 模块 | 端点 | 说明 |
|------|------|------|
| 认证 | POST `/auth/login` | 用户登录 |
| | POST `/auth/change-password` | 修改密码 |
| 用户 | GET/POST/PUT/DELETE `/users` | 用户 CRUD |
| 部门 | GET `/departments/tree` | 获取部门树 |
| | GET/POST/PUT/DELETE `/departments/:id` | 部门 CRUD |
| 文档类型 | GET `/doc-types/tree` | 获取类型树 |
| | GET/POST/PUT/DELETE `/doc-types/:id` | 类型 CRUD |
| 文档 | GET `/documents` | 文档列表（搜索、分页） |
| | POST/PUT/DELETE `/documents/:id` | 文档 CRUD |
| | POST `/documents/export` | 导出文档 |
| | POST `/documents/import` | 导入文档 |
| 文件 | POST `/documents/:id/files` | 上传文件 |
| | GET `/files/:file_id/download` | 下载文件 |
| 统计 | GET `/statistics/department` | 按部门统计 |
| | GET `/statistics/doc-type` | 按类型统计 |
| 任务 | GET `/tasks` | 导入导出任务列表 |
| 系统 | GET/PUT `/system/config` | 系统配置 |
| | GET `/system/logs` | 操作日志 |

详细 API 设计请参考 `docs/需求文档_LDIMS.md` 中的 API 接口设计章节。

## 数据库设计

| 表名 | 用途 |
|------|------|
| `users` | 用户管理（角色：admin/editor/viewer） |
| `departments` | 部门树（支持两级） |
| `doc_types` | 文档类型树（支持多级） |
| `documents` | 文档核心信息 |
| `document_files` | 文档关联文件（支持多文件） |
| `operation_logs` | 操作日志审计 |
| `export_tasks` | 导入导出任务跟踪 |
| `search_conditions` | 保存的查询条件 |
| `system_configs` | 系统配置项 |

详细表结构请参考 `docs/需求文档_LDIMS.md` 的数据库设计章节。

## 项目文档

| 文档 | 说明 |
|------|------|
| `docs/需求文档_LDIMS.md` | 完整需求规格说明书 |
| `docs/实现规划.md` | 分阶段开发计划（含进度追踪） |
| `docs/新功能规划.md` | 多文件支持、OCR、MCP 扩展规划 |
| `docs/本地化安装部署.md` | 离线环境完整部署指南 |
| `docs/开发环境系统运行步骤.md` | 开发环境运行说明 |
| `docs/docker_deploy.md` | Docker 部署指南 |
| `docs/本地原生开发环境运行步骤.md` | 本地原生开发说明 |
| `docs/mcp开发实现规划.md` | MCP 服务开发规划 |
| `docs/项目结构重构_共享类型包.md` | 共享类型包设计 |
| `backend_mcp/README.md` | MCP 服务详细文档 |

## 默认账户

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |

> ⚠️ 生产环境请立即修改默认密码！

## 许可证

ISC 