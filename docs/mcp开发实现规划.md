# LDIMS - MCP 服务开发实现规划

## 📋 项目概览

本文档详细规划 **LDIMS (文档信息管理系统)** 的 **MCP (Model Context Protocol) 服务开发**，包括后端 API 增强和 MCP 服务的完整实现。

### 🎯 主要目标

- 为 LDIMS 系统提供 MCP 协议支持
- 实现文档内容提取和智能搜索功能
- 构建标准化的 AI 模型交互接口

### 📚 参考文档

- `mcp_service_generation_plan.md` - MCP 服务详细设计文档

---

## 🗺️ 开发路线图

```
阶段0: LDIMS后端API增强 ──→ 阶段1: 环境准备 ──→ 阶段2: 核心实现
    ↓                                                      ↓
阶段7: 上线监控 ←── 阶段6: 文档完善 ←── 阶段5: Docker化 ←── 阶段4: 测试
    ↑                                                      ↑
阶段3: API集成联调 ←────────────────────────────────────────┘
```

---

## 📊 总体进度概览

| 阶段                         | 状态        | 进度 | 预计完成时间 |
| ---------------------------- | ----------- | ---- | ------------ |
| 阶段 0: LDIMS 后端 API 增强  | ⚠️ 部分完成 | 60%  | -            |
| 阶段 1: 环境准备与项目初始化 | ❌ 未开始   | 0%   | -            |
| 阶段 2: 核心框架与服务实现   | ❌ 未开始   | 0%   | -            |
| 阶段 3: API 集成与联调       | ❌ 未开始   | 0%   | -            |
| 阶段 4: 测试                 | ❌ 未开始   | 0%   | -            |
| 阶段 5: Docker 化与部署准备  | ❌ 未开始   | 0%   | -            |
| 阶段 6: 文档完善与发布       | ❌ 未开始   | 0%   | -            |
| 阶段 7: 上线与初步监控       | ❌ 未开始   | 0%   | -            |

---

## 🏗️ 详细开发阶段

## 阶段 0️⃣: LDIMS 后端 API 增强 (前提条件)

> **目标**: 完成 MCP 服务所需的 LDIMS 后端 API 开发  
> **负责**: LDIMS 后端团队  
> **状态**: ⚠️ 部分完成 (60%)

### ✅ 已完成任务

#### P0-T4 ✅ 内容搜索 API - Service 层

- **位置**: `src/services/DocumentService.ts`
- **实现**: `searchDocumentsByContent()` 方法
- **功能**: 支持元数据和文件内容的全文搜索
- **特性**: 分页、排序、MySQL MATCH AGAINST

#### P0-T5 ✅ 内容搜索 API - Controller 层

- **位置**: `src/controllers/DocumentController.ts`
- **实现**: `searchDocumentsByContent()` 方法
- **功能**: 参数验证、错误处理、响应格式化

#### P0-T6 ✅ 内容搜索 API - Route 层

- **位置**: `src/routes/document.ts`
- **实现**: `GET /search/content` 路由
- **功能**: 认证、验证、错误处理中间件

### 🔄 待完成任务

#### P0-T1 ✅ DocumentFile 内容提取 API - Service 层

- **位置**: `src/services/DocumentService.ts`
- **需求**: 新增 `getDocumentFileWithContent(fileId: number)` 方法
- **功能**: 返回 DocumentFile 实例及 extractedContent
- **处理**: 文件不存在或内容为空的情况
- **优先级**: 🔴 高
- **🔍 实现状态**: ✅ **已完成** - 已在 DocumentService 类中添加 getDocumentFileWithContent 方法，包含完整的参数验证、错误处理和日志记录
- **详细要求**:
  - 方法签名: `async getDocumentFileWithContent(fileId: number): Promise<DocumentFileContentResponse | null>`
  - 查询 DocumentFile 表，包含所有字段
  - 处理 extractedContent 为 null/空字符串的情况
  - 支持权限检查（如需要）
  - 错误处理：文件不存在返回 null，数据库错误抛出异常
  - 日志记录：记录查询操作和结果
- **验收标准**:
  - 能正确返回文件元数据和提取内容
  - 处理各种异常情况不崩溃
  - 单元测试覆盖率>90%
- **预计工时**: 4 小时

#### P0-T2 ✅ DocumentFile 内容提取 API - Controller 层

- **位置**: `src/controllers/DocumentController.ts`
- **需求**: 新增 `getDocumentFileContent(req, res, next)` 方法
- **功能**: 处理 file_id 参数，返回 JSON 响应
- **优先级**: 🔴 高
- **🔍 实现状态**: ✅ **已完成** - 已在 DocumentController 类中添加 getDocumentFileContent 方法，包含参数验证、Service 调用、错误处理和操作日志记录
- **详细要求**:
  - 路径参数验证：file_id 必须为正整数
  - 调用 Service 层方法获取数据
  - 响应格式化：使用统一的 success/fail 响应格式
  - 错误处理：404(文件不存在)、400(参数错误)、500(服务器错误)
  - 权限验证：确保用户有权访问该文件
  - 操作日志记录
- **API 响应格式**:

  ```typescript
  // 成功响应
  {
    "success": true,
    "code": 200,
    "message": "获取文件内容成功",
    "data": {
      "fileId": 123,
      "fileName": "document.pdf",
      "filePath": "documents/2024/01/document.pdf",
      "extractedContent": "文档提取的文本内容...",
      "processingStatus": "completed",
      "extractedAt": "2024-01-15T10:30:00Z",
      "fileSize": 1024000,
      "mimeType": "application/pdf"
    }
  }

  // 错误响应
  {
    "success": false,
    "code": 404,
    "message": "文件不存在或无权访问"
  }
  ```

- **验收标准**:
  - 参数验证完整准确
  - 错误响应码和消息符合 API 规范
  - 集成测试通过
- **预计工时**: 3 小时

#### P0-T3 ✅ DocumentFile 内容提取 API - Route 层

- **位置**: `src/routes/document.ts`
- **需求**: 新增 `GET /api/document-files/:file_id/content` 路由
- **功能**: 认证和参数校验
- **优先级**: 🔴 高
- **🔍 实现状态**: ✅ **已完成** - 已在路由文件中添加`GET /files/:file_id/content`路由，包含认证、验证和控制器调用
- **详细要求**:
  - 路由路径: `GET /api/document-files/:file_id/content`
  - 中间件链:
    1. `authenticateToken` - JWT 认证
    2. `param("file_id").isInt({gt: 0})` - 参数验证
    3. `handleValidationErrors` - 验证错误处理
    4. `documentController.getDocumentFileContent` - 业务逻辑
  - 支持 CORS（如果需要）
  - 请求限流（可选）
- **路由配置示例**:
  ```typescript
  router.get(
    "/files/:file_id/content",
    authenticateToken,
    [param("file_id").isInt({ gt: 0 }).withMessage("无效的文件ID")],
    handleValidationErrors,
    documentController.getDocumentFileContent
  );
  ```
- **验收标准**:
  - 认证中间件正确工作
  - 参数验证有效
  - 路由正确映射到控制器方法
- **预计工时**: 2 小时

#### P0-T7 ✅ 相关 DTO 和类型定义

- **位置**: `src/types/document.d.ts`
- **需求**: 为文件内容提取创建新的 DTO
- **优先级**: 🟡 中
- **🔍 实现状态**: ✅ **已完成** - 已在类型定义文件中添加 DocumentFileContentResponse 和 DocumentFileContentQuery 接口，提供完整的类型安全保障
- **详细要求**:
  - 定义 DocumentFileContentResponse 接口
  - 定义 DocumentFileContentQuery 接口（如需要）
  - 扩展现有类型以支持新功能
  - 类型定义要完整，支持 TypeScript 严格模式
- **类型定义示例**:

  ```typescript
  export interface DocumentFileContentResponse {
    fileId: number;
    fileName: string;
    filePath: string;
    extractedContent: string | null;
    processingStatus: "pending" | "processing" | "completed" | "failed";
    extractedAt: Date | null;
    fileSize: number;
    mimeType: string;
    documentId: number;
    uploadedAt: Date;
  }

  export interface DocumentFileContentQuery {
    includeMetadata?: boolean;
    format?: "text" | "json";
  }
  ```

- **验收标准**:
  - 类型定义准确完整
  - 与实际 API 响应匹配
  - 通过 TypeScript 编译检查
- **预计工时**: 1 小时

#### P0-T8 ❌ 单元测试与集成测试

- **位置**: `tests/` 目录
- **需求**: 针对新增 API 编写测试
- **优先级**: 🟡 中
- **详细要求**:
  - **单元测试 (tests/unit/)**:
    - `DocumentService.getDocumentFileWithContent()` 方法测试
    - `DocumentController.getDocumentFileContent()` 方法测试
    - Mock 数据库和依赖
    - 覆盖正常流程和异常情况
  - **集成测试 (tests/integration/)**:
    - 完整 API 请求-响应测试
    - 数据库交互测试
    - 认证和权限测试
  - **测试用例覆盖**:
    - 正常获取文件内容
    - 文件不存在
    - 无权访问文件
    - 参数格式错误
    - 数据库连接失败
    - 内容为空的文件
- **测试示例**:

  ```typescript
  describe("DocumentFile Content API", () => {
    describe("GET /api/document-files/:file_id/content", () => {
      it("should return file content for valid file_id", async () => {
        const response = await request(app)
          .get("/api/document-files/123/content")
          .set("Authorization", `Bearer ${validToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.fileId).toBe(123);
        expect(response.body.data.extractedContent).toBeDefined();
      });

      it("should return 404 for non-existent file", async () => {
        const response = await request(app)
          .get("/api/document-files/99999/content")
          .set("Authorization", `Bearer ${validToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });
  });
  ```

- **验收标准**:
  - 测试覆盖率达到 90%以上
  - 所有测试用例通过
  - 包含边界条件测试
- **预计工时**: 6 小时

#### P0-T9 ✅ API 文档更新

- **位置**: API 文档文件
- **需求**: 更新 API 接口说明和示例
- **优先级**: 🟡 中
- **🔍 实现状态**: ✅ **已完成** - 已创建完整的 API 文档，包含 Markdown 格式文档和 OpenAPI 3.0 规范文件
- **详细要求**:
  - 使用 Swagger/OpenAPI 3.0 规范
  - 详细的接口描述和参数说明
  - 请求/响应示例
  - 错误码说明
  - 认证要求说明
- **文档内容包括**:
  ```yaml
  /api/document-files/{file_id}/content:
    get:
      tags:
        - DocumentFiles
      summary: 获取文档文件提取内容
      description: 根据文件ID获取文档文件的元数据和提取的文本内容
      parameters:
        - name: file_id
          in: path
          required: true
          schema:
            type: integer
            minimum: 1
          description: 文档文件ID
      security:
        - bearerAuth: []
      responses:
        "200":
          description: 成功获取文件内容
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/DocumentFileContentResponse"
        "400":
          description: 请求参数错误
        "401":
          description: 未认证
        "403":
          description: 无权访问
        "404":
          description: 文件不存在
        "500":
          description: 服务器内部错误
  ```
- **验收标准**:
  - 文档结构清晰完整
  - 示例代码可运行
  - 与实际 API 行为一致
- **预计工时**: 3 小时

---

## 阶段 1️⃣: MCP环境搭建与基础实现

> **目标**: 基于MCP官方标准搭建开发环境和核心服务框架  
> **负责**: MCP 服务开发团队  
> **状态**: 🔄 进行中 (50%)  
> **总预计工时**: 20 小时

### 🎯 MCP标准规范要求

**核心概念**：
- **Resources（资源）**: 类似文件的数据，可被客户端读取
- **Tools（工具）**: 可被LLM调用的函数（需用户批准）  
- **Prompts（提示）**: 预写的模板，帮助用户完成特定任务

**技术栈要求**：
- **Node.js**: >= 18.0.0
- **TypeScript**: >= 5.5.4
- **MCP SDK**: @modelcontextprotocol/sdk ^1.12.2
- **参数验证**: zod ^3.23.8
- **传输协议**: STDIO/SSE/HTTP

### 📦 环境搭建任务

#### P1-T1 ✅ 开发环境检查
- [x] Node.js v22.14.0 验证
- [x] npm 10.8.1 验证
- [x] TypeScript 5.8.3 全局安装验证
- **状态**: ✅ 已完成
- **验收**: 所有环境工具版本符合MCP要求

#### P1-T2 ✅ 版本控制初始化
- [x] Git仓库初始化
- [x] .gitignore文件创建（Node.js + MCP专用）
- [x] 初始提交完成
- **状态**: ✅ 已完成
- **位置**: `LDIMS/backend_mcp/`

#### P1-T3 ✅ 项目结构创建
- [x] 标准MCP项目目录结构：
```
backend_mcp/
├── src/
│   ├── controllers/     # MCP工具控制器
│   ├── middleware/      # 认证和验证中间件
│   ├── routes/          # HTTP路由（如需要）
│   ├── services/        # 业务逻辑服务
│   ├── types/           # TypeScript类型定义
│   └── utils/           # 工具函数
├── tests/
│   ├── unit/           # 单元测试
│   ├── integration/    # 集成测试
│   └── fixtures/       # 测试数据
├── dist/               # 编译输出
├── docs/               # 项目文档
└── config/             # 配置文件
```
- **状态**: ✅ 已完成

#### P1-T4 ✅ package.json基础配置
- [x] 项目元数据配置
- [x] 脚本命令定义（build, dev, test等）
- [x] 开发环境配置
- **状态**: ✅ 已完成
- **验收**: 基础配置符合MCP项目要求

#### P1-T5 ✅ MCP核心依赖安装

**安装完成 (2025-06-11 20:37)**：

| 依赖分类 | 包名 | 安装版本 | 用途 |
|----------|------|----------|------|
| **MCP核心** | `@modelcontextprotocol/sdk` | **1.12.1** | MCP核心SDK |
| **参数验证** | `zod` | **3.25.61** | 类型安全验证 |
| **Schema转换** | `zod-to-json-schema` | **3.24.5** | JSON Schema生成 |
| **HTTP服务** | `express` | **5.0.1** | Web服务器 |
| **跨域** | `cors` | **2.8.5** | CORS支持 |
| **数据库** | `mysql2` | **3.6.0** | MySQL连接 |
| **环境变量** | `dotenv` | **16.3.1** | 配置管理 |
| **TypeScript** | `typescript` | **5.8.3** | TS编译器 |
| **执行器** | `tsx` | **4.20.1** | TS运行时 |
| **测试框架** | `jest` | **29.7.0** | 单元测试 |
| **代码规范** | `eslint` + `typescript-eslint` | **9.17.0** + **8.34.0** | 代码检查 |

- **状态**: ✅ 已完成
- **实际工时**: 1小时
- **总包数**: 509个包
- **安装状态**: 全部成功，发现12个低风险漏洞（仅影响开发环境）

#### P1-T6 ✅ MCP服务器基础结构
- ✅ Server实例配置（基于@modelcontextprotocol/sdk）
- ✅ STDIO传输协议设置
- ✅ 基础能力声明（Tools/Resources/Prompts）
- ✅ 标准错误处理框架
- ✅ TypeScript配置优化
- ✅ MCP类型定义文件
- **已完成文件**: `src/index.ts`, `src/types/mcp.ts`, `tsconfig.json`
- **状态**: ✅ 已完成
- **实际工时**: 2小时
- **测试结果**: MCP服务器能够正常启动和运行

#### P1-T7 📋 第一个MCP工具实现
- [ ] `get_document_file_content`工具定义
- [ ] Zod参数验证Schema
- [ ] 与LDIMS API集成
- [ ] 标准响应格式实现
- **验收**: 工具能正确调用LDIMS API并返回文档内容
- **预计工时**: 6小时

#### P1-T8 📋 开发环境脚本配置
- [ ] MCP服务器启动脚本（STDIO模式）
- [ ] 开发模式热重载（tsx watch）
- [ ] 测试命令配置
- [ ] 构建和部署脚本
- **关键脚本**: `dev:mcp`, `build:mcp`, `start:mcp`
- **预计工时**: 3小时

#### P1-T9 📋 配置文件优化
- [ ] TypeScript配置（支持MCP SDK）
- [ ] ESLint规则（MCP代码规范）
- [ ] Jest测试配置（MCP工具测试）
- [ ] 环境变量模板（`.env.example`）
- **验收**: 所有配置支持MCP开发
- **预计工时**: 3小时

#### P1-T10 📋 基础测试框架
- [ ] MCP工具单元测试框架
- [ ] 模拟LDIMS API响应
- [ ] 集成测试基础结构
- [ ] 测试数据准备
- **覆盖**: 至少一个MCP工具的完整测试
- **预计工时**: 2小时

#### P1-T11 项目文档

- 初始化 `README.md`
- 项目介绍和使用说明

#### P1-T12 日志模块

- 选型: winston / pino

---

## 阶段 2️⃣: 核心框架与服务实现

> **目标**: 实现 MCP 服务的核心功能  
> **负责**: MCP 服务开发团队  
> **状态**: ❌ 未开始

### 🌐 HTTP 服务框架

#### P2-T1 Express 服务器搭建

- 创建 Express 应用实例
- 配置中间件: JSON 解析、URL 编码等

#### P2-T2 配置加载模块

- 从.env 文件加载配置
- 配置验证和默认值

#### P2-T3 全局错误处理

- **目标**: 建立统一的错误处理机制
- **详细要求**: 自定义错误类，MCP 错误规范
- **验收标准**: 错误处理完整，用户体验友好
- **预计工时**: 2 小时

#### P2-T4 路由与处理器

- 定义 MCP 兼容路由
- 实现请求处理逻辑

#### P2-T5 LDIMS API 调用

- 集成 LDIMS 后端 API
- 初期使用 Mock API 开发

#### P2-T6 响应格式化

- 按 MCP 规范格式化响应
- 数据转换和序列化

#### P2-T7 错误处理

- 实现规划的错误码
- 异常情况处理

### 🔍 searchDocuments Tool

#### P2-T8 路由与处理器

- 定义 MCP 兼容路由
- 实现搜索逻辑

#### P2-T9 输入校验

- 使用 Zod 进行参数验证
- 基于规划的输入 schema

#### P2-T10 LDIMS API 调用

- 集成搜索 API
- 初期使用 Mock API 开发

#### P2-T11 响应格式化

- 按 MCP 规范格式化搜索结果
- 分页和排序处理

#### P2-T12 错误处理

- 搜索异常处理
- 结果为空的情况---

## 阶段 3️⃣: API 集成与联调

> **目标**: 与真实 LDIMS 后端 API 集成  
> **负责**: MCP 服务开发团队 + LDIMS 后端团队  
> **状态**: ❌ 未开始  
> **前置**: 阶段 0 完成

### 🔗 API 集成

#### P3-T1 extracted_content Resource 集成

- 替换 Mock API 为真实 API
- 接口对接和数据格式适配
- 联调测试

#### P3-T2 searchDocuments Tool 集成

- 替换 Mock API 为真实搜索 API
- 参数映射和结果转换
- 联调测试

---

## 阶段 4️⃣: 测试

> **目标**: 全面测试确保服务质量  
> **负责**: MCP 服务开发团队  
> **状态**: ❌ 未开始

### 🧪 测试框架

#### P4-T1 测试环境搭建

- 选择测试框架: Jest / Mocha
- 配置测试脚本和环境

#### P4-T0 API 测试集合

- 创建 Postman/Insomnia 测试集合
- 覆盖正常和异常场景### 🔧 单元测试

#### P4-T2 辅助模块测试

- 配置加载模块测试
- 日志模块测试

#### P4-T3 extracted_content 核心逻辑测试

- Mock LDIMS API
- 测试请求处理和响应格式化

#### P4-T4 searchDocuments 核心逻辑测试

- Mock LDIMS API
- 测试输入校验和错误处理

### 🔄 集成测试

#### P4-T5 extracted_content 集成测试

- HTTP 请求到响应的完整流程
- Mock 后端交互测试

#### P4-T6 searchDocuments 集成测试

- 搜索功能完整流程测试
- 分页和排序测试

### 🚀 端到端测试

#### P4-T7 测试准备

- 准备测试用例和数据
- 配置测试环境

#### P4-T8 extracted_content 端到端测试

- 连接真实开发后端
- 完整功能验证

#### P4-T9 searchDocuments 端到端测试

- 真实搜索功能测试
- 性能和准确性验证

#### P4-T10 测试覆盖率

- 生成覆盖率报告
- 分析和改进---

## 阶段 5️⃣: Docker 化与部署准备

> **目标**: 服务容器化和部署准备  
> **负责**: MCP 服务开发团队  
> **状态**: ❌ 未开始

### 🐳 容器化

#### P5-T1 Dockerfile 编写

- 多阶段构建
- 优化镜像大小
- 安全配置

#### P5-T2 .dockerignore 配置

- 忽略不必要文件
- 减少构建上下文

#### P5-T3 本地 Docker 测试

- 镜像构建测试
- 容器运行验证
- 环境变量传递测试

### 📋 部署准备

#### P5-T4 部署脚本

- 编写部署说明
- 自动化脚本(可选)

#### P5-T5 生产环境配置

- 生产环境.env 模板
- 安全配置检查

---

## 阶段 6️⃣: 文档完善与发布

> **目标**: 完善所有相关文档  
> **负责**: MCP 服务开发团队  
> **状态**: ❌ 未开始### 📖 文档更新

#### P6-T1 README.md 更新

- 详细的安装和配置说明
- API 使用示例
- 故障排除指南

#### P6-T2 代码注释完善

- 关键代码段注释
- API 文档注释

#### P6-T3 API 交互示例

- Postman 集合导出
- 使用示例和最佳实践

### 📋 设计文档同步

#### P6-T4 设计文档更新

- 同步`mcp_service_generation_plan.md`
- 记录设计变更

#### P6-T5 规划文档更新

- 更新本文档
- 反映实际实施情况

---

## 阶段 7️⃣: 上线与初步监控

> **目标**: 服务部署和初步验证  
> **负责**: MCP 服务开发团队 + 运维团队  
> **状态**: ❌ 未开始

### 🚀 部署上线

#### P7-T1 生产环境部署

- 按照部署文档执行
- 环境配置验证

#### P7-T2 部署后验证

- 冒烟测试
- 核心功能验证

#### P7-T3 监控检查

- 日志监控
- 错误检查
- 性能监控---

## 🎯 关键里程碑

### 里程碑 0: 后端 API 就绪 🎯

- **内容**: LDIMS 后端 API 增强完成
- **验收**: 文件内容提取 API 和内容搜索 API 通过测试
- **影响**: 后续所有阶段的前提

### 里程碑 1: 项目框架完成 🏗️

- **内容**: MCP 服务项目初始化和基础框架
- **验收**: 项目结构完整，基础服务可启动
- **影响**: 核心功能开发的基础

### 里程碑 2: 核心功能实现 ⚙️

- **内容**: MCP Resource 和 Tool 实现完成
- **验收**: 基于 Mock API 的功能测试通过
- **影响**: 可进行 API 集成

### 里程碑 3: API 集成完成 🔗

- **内容**: 与真实 LDIMS 后端 API 集成联调
- **验收**: 端到端功能测试通过
- **影响**: 可进行全面测试

### 里程碑 4: 测试完成 ✅

- **内容**: 全面测试通过，达到覆盖率要求
- **验收**: 所有测试用例通过，性能达标
- **影响**: 可进行部署准备

### 里程碑 5: 部署就绪 📦

- **内容**: Docker 化完成，部署文档齐全
- **验收**: 容器化测试通过，部署流程验证
- **影响**: 可进行生产部署

### 里程碑 6: 服务上线 🎉

- **内容**: 成功部署到生产环境
- **验收**: 服务正常运行，监控正常
- **影响**: 项目完成---

## ⚠️ 风险管控

### 🔴 高风险

#### 风险 1: 后端 API 延迟交付

- **影响**: 阻塞 MCP 服务核心功能集成
- **应对**:
  - 加强与后端团队沟通
  - 充分利用 Mock API 并行开发
  - 提前明确接口规范

#### 风险 2: MCP 规范理解偏差

- **影响**: 实现不符合 LLM 调用预期
- **应对**:
  - 定期回顾 MCP 官方文档
  - 早期模拟 LLM 调用测试
  - 寻求 MCP 社区支持

### 🟡 中风险

#### 风险 3: 技术选型不当

- **影响**: 开发效率低，维护困难
- **应对**:
  - 充分调研和 POC 验证
  - 选择成熟稳定的技术栈
  - 预留技术调整时间

#### 风险 4: 测试覆盖不足

- **影响**: 生产环境稳定性问题
- **应对**:
  - 制定明确的测试标准
  - 自动化测试流程
  - 代码审查机制

---

## 📞 联系与协作

### 团队分工

- **LDIMS 后端团队**: 负责阶段 0 的 API 增强
- **MCP 服务开发团队**: 负责阶段 1-7 的 MCP 服务开发
- **运维团队**: 协助阶段 7 的部署和监控

### 沟通机制

- 定期进度同步会议
- 关键节点验收会议
- 问题升级处理机制

---

_最后更新: [待填写]_  
_文档版本: v2.0_
