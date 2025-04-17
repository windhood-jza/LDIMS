# LDIMS - 融合业务部文档管理系统

## 项目简介

LDIMS (Lean Document Information Management System) 是一个为技术中心融合业务部设计的文档信息管理系统。旨在提供一个集中、高效的平台，用于文档的录入、存储、分类、查询、统计分析、导入导出等功能，以提升部门内部文档管理的效率和规范性。

## 主要功能

*   **仪表盘:** 提供系统关键指标概览（文档总数、类型数、部门数、用户数）以及文档按类型、部门的分布图表。
*   **文档管理:**
    *   文档信息录入、编辑、查看、删除（软删除）。
    *   支持按文档名称、提交人、接收人、签章人、文档类型、来源部门、交接日期等多种条件进行组合搜索和筛选。
    *   分页展示文档列表。
*   **文档类型管理:** 树状结构管理文档分类。
*   **部门管理:** 树状结构管理组织部门。
*   **用户管理:** 系统用户增删改查、状态启用/禁用、密码重置。
*   **导入导出:**
    *   支持将筛选后的文档数据批量导出为 Excel 或 CSV 文件（异步任务处理）。
    *   支持通过上传 Excel 文件批量导入文档信息（异步任务处理）。
    *   提供任务列表查看导入导出进度、状态和下载结果文件。
*   **统计报表:** 提供按文档类型、来源部门统计文档数量的图表展示。
*   **系统设置:** (基础) 查看操作日志。
*   **操作日志:** 记录关键操作（用户管理、文档操作等）的日志，便于审计追踪。
*   **认证与授权:** 基于 JWT 的用户登录认证。

## 技术栈

**后端:**

*   **框架:** Node.js, Express.js
*   **语言:** TypeScript
*   **数据库:** MySQL
*   **ORM:** Sequelize
*   **认证:** JSON Web Token (JWT)
*   **输入验证:** express-validator
*   **文件处理:** Multer (上传), xlsx (Excel 读写)
*   **其他:** dotenv (环境变量), cors, body-parser, bcryptjs (密码处理)

**前端:**

*   **框架:** Vue 3 (Composition API)
*   **构建工具:** Vite
*   **语言:** TypeScript
*   **UI 库:** Element Plus
*   **路由:** Vue Router
*   **状态管理:** Vue Reactivity (`ref`, `reactive`, `computed`)
*   **HTTP 请求:** Axios (封装在 `src/services/api/`)
*   **图表:** ECharts

## 环境要求

*   Node.js (建议使用 LTS 版本，例如 v18 或 v20+)
*   npm (通常随 Node.js 一起安装) 或 yarn
*   MySQL (建议 5.7 或更高版本)

## 安装与配置

1.  **克隆仓库:**
    ```bash
    git clone <your-repository-url>
    cd LDIMS
    ```

2.  **后端配置:**
    *   进入后端目录: `cd backend`
    *   安装依赖: `npm install`
    *   创建 `.env` 文件: 复制 `.env.example` (如果存在) 或手动创建 `.env` 文件。
    *   配置环境变量 (参考下面的 "环境变量" 部分):
        *   `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (数据库连接信息)
        *   `PORT` (后端服务运行端口, 可选, 默认 3000)
        *   `JWT_SECRET` (用于签发和验证 Token 的密钥，**务必修改为一个复杂且保密的字符串**)
    *   **数据库初始化:**
        *   确保你的 MySQL 服务正在运行。
        *   手动或使用数据库管理工具连接到 MySQL。
        *   创建数据库 (如果 `.env` 中配置的 `DB_NAME` 库不存在的话): `CREATE DATABASE IF NOT EXISTS ldims_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
        *   执行数据库表结构初始化。这可能需要：
            *   查找项目中的 `*.sql` 文件或 Sequelize Migrations/Seeders (根据项目实际情况)。
            *   或者，如果数据库表结构是手动管理的，确保所有必需的表已根据设计创建。
            *   **重要:** 需要执行包含创建默认"总部"部门和"admin"用户的初始化 SQL。

3.  **前端配置:**
    *   回到项目根目录: `cd ..` (如果还在 backend 目录)
    *   进入前端目录: `cd frontend`
    *   安装依赖: `npm install`
    *   创建开发环境变量文件: 复制或创建 `.env.development` 文件。
    *   配置 `VITE_API_BASE_URL`: 指向你的本地后端 API 地址 (通常是 `http://localhost:3000/api/v1`，端口号与后端 `.env` 文件中的 `PORT` 一致)。
    *   (可选) 创建生产环境变量文件 `.env.production`，并配置生产环境的 `VITE_API_BASE_URL`。

## 运行项目

1.  **启动后端服务 (开发模式):**
    *   进入后端目录: `cd backend`
    *   运行开发命令: `npm run dev`
    *   服务将运行在 `.env` 文件中 `PORT` 指定的端口 (默认 3000)。

2.  **启动前端服务 (开发模式):**
    *   进入前端目录: `cd frontend`
    *   运行开发命令: `npm run dev`
    *   Vite 会启动开发服务器，并输出访问地址 (通常是 `http://localhost:5173` 或类似端口)。
    *   在浏览器中打开该地址即可访问系统。

## 构建生产环境

1.  **构建后端:**
    *   进入后端目录: `cd backend`
    *   运行构建命令: `npm run build`
    *   编译后的 JavaScript 文件将输出到 `dist` 目录。
    *   你可以使用 `npm start` 来运行构建后的应用 (需要先设置好生产环境的 `.env`)。

2.  **构建前端:**
    *   进入前端目录: `cd frontend`
    *   确保 `.env.production` 文件中的 `VITE_API_BASE_URL` 已配置为**实际部署的后端 API 地址**。
    *   运行构建命令: `npm run build`
    *   优化后的静态文件将输出到 `dist` 目录。将此目录下的内容部署到你的 Web 服务器 (如 Nginx) 或静态文件托管服务。

## 环境变量

环境变量用于配置应用的敏感信息和环境特定参数。请**不要**将包含真实密码或密钥的 `.env` 文件提交到版本控制系统 (Git)。

**后端 (`backend/.env`):**

```ini
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ldims_db
DB_USER=root
DB_PASSWORD=your_db_password # 替换为你的数据库密码

# 后端服务端口 (可选)
PORT=3000

# JWT 签名密钥 (重要! 请修改为长且随机的字符串)
JWT_SECRET=your_very_secret_jwt_key 

# Node.js 环境 (可选, development 或 production)
# NODE_ENV=development 
```

**前端 (`frontend/.env.development`):**

```ini
# 开发环境 API 基础路径
VITE_API_BASE_URL=http://localhost:3000/api/v1

# 开发环境 API 超时时间 (毫秒)
VITE_API_TIMEOUT=5000 
```

**前端 (`frontend/.env.production`):**

```ini
# 生产环境 API 基础路径 (部署前务必修改!)
VITE_API_BASE_URL=https://your-production-api-domain.com/api/v1 

# 生产环境 API 超时时间 (毫秒)
VITE_API_TIMEOUT=10000
```

## 项目结构概览

```
LDIMS/
├── backend/
│   ├── src/
│   │   ├── config/         # 数据库连接、环境配置等
│   │   ├── controllers/    # Express 控制器，处理 HTTP 请求
│   │   ├── middleware/     # Express 中间件 (如认证、错误处理)
│   │   ├── models/         # Sequelize 数据模型定义及关联
│   │   ├── routes/         # API 路由定义
│   │   ├── services/       # 业务逻辑层
│   │   ├── types/          # TypeScript 类型定义 (接口, DTOs)
│   │   ├── utils/          # 工具函数 (如 API 响应格式化)
│   │   └── app.ts          # Express 应用入口文件
│   ├── .env                # 环境变量 (本地)
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── assets/         # 静态资源 (图片, SVG)
│   │   ├── components/     # 可复用的 Vue 组件
│   │   ├── layouts/        # 页面布局组件 (如 DefaultLayout)
│   │   ├── router/         # Vue Router 配置
│   │   ├── services/       # API 请求封装
│   │   ├── styles/         # 全局样式、变量
│   │   ├── types/          # TypeScript 类型定义
│   │   ├── utils/          # 工具函数
│   │   └── views/          # 页面级 Vue 组件
│   ├── .env.development    # 开发环境变量
│   ├── .env.production     # 生产环境变量
│   ├── index.html          # SPA 入口 HTML
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts      # Vite 配置文件
└── README.md               # 项目说明文件
```

## API 文档

本项目目前没有自动生成的 API 文档。请参考后端 `src/routes/` 和 `src/controllers/` 下的代码来了解具体的 API 端点和请求/响应格式。

## 贡献指南

(如果需要多人协作，可以在此添加贡献指南，如代码风格、提交流程等)

## 许可证

(根据你的选择指定许可证，例如 ISC, MIT 等) 