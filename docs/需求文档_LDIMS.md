# LDIMS (文档信息管理系统) 需求文档

## 1. 项目概述
LDIMS是一个用于管理文档信息的系统，支持文档信息的录入、存储、查询和统计分析等功能。

## 2. 需求状态跟踪

### 2.1 已确认需求
1. 系统基础架构
   - 采用三级目录结构：年度/部门/文档类型
   - 支持数据修改追踪
   - 实现逻辑删除机制

2. 基础字段设置
   - 必填字段：文档编号（唯一标识）、文档名称、创建日期、文档类型
   - 选填字段：关联部门、保管位置（物理柜编号）、关键词标签、备注说明

3. 技术架构选型
   - 前端技术栈：Vue3 + Element Plus
     - 使用 TypeScript 进行开发
     - 采用 Vite 作为构建工具
     - 响应式设计，支持PC端优先
   - 后端技术栈：Node.js + Express
     - 使用 TypeScript 进行开发
     - RESTful API 设计
     - JWT 认证机制
   - 数据库：MySQL 8.0
     - 使用 Sequelize ORM
   - 部署方式：本地部署
     - 支持开发、测试、生产环境

4. 文档信息录入需求
   - 文档编号：使用数据库自增ID，不需要特殊编号规则
   - 文档类型管理：
     - 支持多级分类（至少2级子层级）
     - 文档类型可配置
     - 支持类型的增删改查
   - Excel批量导入功能：
     - 支持数据预览功能
     - 实时显示导入进度
     - 错误提示详细信息（包含行号、错误原因）
     - 支持导入任务的暂停与继续

5. 数据存储管理需求
   - 数据备份：
     - 支持手动导出数据为Excel格式
     - 不需要自动备份功能
   - 数据删除与恢复：
     - 采用逻辑删除机制
     - 支持已删除数据的恢复功能
     - 支持手动清除已删除的数据
     - 不记录删除原因
   - 存储说明：
     - 仅存储文档信息，不存储实际文档
     - 不需要设置存储容量限制

6. 智能查询系统需求
   - 搜索功能：
     - 支持模糊查询
     - 支持多字段组合查询
     - 不需要标签检索功能
   - 查询结果展示：
     - 默认按创建日期排序
     - 支持自定义字段排序
     - 每页显示数量可配置
     - 查询结果表格或列表中，文档名称过长时应能自动换行显示，避免破坏表格布局。
   - 数据导出功能：
     - 支持自定义选择导出字段
     - 支持选择导出文件格式（Excel、CSV）
     - 导出作为异步任务处理，不影响系统响应
     - 不限制导出数据量
   - 查询条件管理：
     - 支持保存常用查询条件
     - 支持查询条件快速选择
     - 记录最近的查询历史

7. 统计报表需求
   - 统计维度：
     - 支持按部门统计文档数量
     - 支持按文档类型统计分布
     - 支持按时间维度统计趋势（月度、季度、年度）
   - 图表展示：
     - 支持多种图表类型（柱状图、饼图、折线图）
     - 支持图表和数据表格的切换展示
     - 支持图表交互操作（钻取、筛选）
   - 数据更新：
     - 提供手动刷新功能
     - 页面加载时自动获取最新数据
   - 报表导出：
     - 支持图表导出为图片
     - 支持数据导出为Excel
     - 支持自定义导出模板

8. 权限管理需求
   - 角色设置：
     - 系统管理员：系统最高权限
       - 可进行所有操作
       - 负责系统配置管理
       - 用户权限管理
     - 录入员：
       - 可进行文档信息录入
       - 可进行文档信息修改
       - 可进行文档信息查询
       - 不可进行系统配置管理
     - 查看员：
       - 仅可查看文档信息
       - 可导出查询结果
       - 可查看统计报表
       - 不可进行信息录入和修改
   - 权限控制：
     - 基于角色的访问控制（RBAC）
     - 菜单级别权限控制
     - 按钮级别权限控制
   - 操作日志：
     - 记录用户登录日志
     - 记录重要操作日志（如批量导入、批量删除等）

9. 非功能性需求
   - 并发用户数：支持50人同时在线操作
   - 浏览器要求：支持主流浏览器最新版本
   - 运行环境：本地服务器部署

### 2.2 待确认需求
[待补充]

## 3. 详细需求列表

### 3.1 技术架构相关
- [ ] 确定前端技术栈
- [ ] 确定后端技术栈
- [ ] 确定数据库类型
- [ ] 确定部署方式

### 3.2 功能需求

#### 3.2.0 通用功能要求
- **输入数据验证**: 系统在接收用户输入（如新增、编辑文档、用户、部门、文档类型等）时，必须进行数据有效性验证。验证应包括：必填项检查、数据类型检查（如日期、数字）、长度限制检查，并对可能引起问题的特殊字符进行处理或提示。验证不通过时，应向用户提供清晰的错误提示信息，阻止无效数据提交。
- **数据库连接与启动行为**:
  - 后端服务应使用标准的数据库驱动程序 (如 Sequelize) 连接数据库。
  - 服务启动时不强制要求数据库连接必须成功。如果连接失败，服务应能正常启动。
  - 服务启动后，若数据库连接失败或未配置，应在系统界面（如系统设置页面）明确提示用户需要配置数据库。
  - 提供数据库配置界面（参考系统设置页面），允许用户输入或修改连接参数。
  - 数据库配置更改后，需要重启后端服务才能生效。

#### 3.2.1 文档信息录入
- [x] 确定文档编号的生成规则：使用数据库自增ID
- [x] 确定Excel导入模板的具体字段和格式：
  - 导入模板的列应与导出时可选的字段一致。
  - 字段顺序建议与文档信息表字段顺序保持一致。
  - **空值处理**: 对于数据库表中允许为空的字段（如 `storage_location`, `remarks`），如果导入的Excel单元格为空，应视为 `NULL` 或空字符串插入，不报错。对于数据库定义为 `NOT NULL` 的字段，如果Excel单元格为空，则该行记录导入失败，并记录到错误详情中。
- [x] 确定文档类型的预设选项：支持多级分类，可配置
- [x] 确定批量导入时的错误处理机制：支持预览、进度显示和详细错误信息

#### 3.2.2 数据存储管理
- [x] 确定数据备份策略：支持手动导出Excel
- [x] 确定修改记录的保存期限：不保存修改记录
- [x] 确定删除数据的恢复机制：支持手动恢复，支持手动清除
- [x] 确定存储容量限制：不限制（仅存储信息）

#### 3.2.3 智能查询系统
- [x] 确定搜索引擎的选择：使用MySQL全文索引
- [x] 确定高级搜索的具体筛选条件：支持多字段组合查询
- [x] 确定导出文件的格式选项：支持Excel、CSV，异步处理
- [x] 确定查询结果的排序规则：默认按创建日期排序，支持自定义排序

#### 3.2.4 统计报表
- [x] 确定报表更新频率：手动刷新
- [x] 确定自定义报表的配置方式：支持多维度统计
- [x] 确定图表类型的选择：支持多种图表类型和交互
- [x] 确定报表导出格式：支持图片和Excel格式

#### 3.2.5 权限管理
- [x] 确定具体的角色类型及权限：系统管理员、录入员、查看员三种角色
- [x] 确定跨部门数据访问规则：基于角色控制
- [x] 确定权限变更的审批流程：由系统管理员直接管理
- [x] 确定敏感操作的日志记录范围：登录日志和重要操作日志

## 4. 非功能性需求
- [x] 确定系统性能指标：支持50人并发
- [x] 确定并发用户数：50人
- [x] 确定数据安全等级：普通安全级别
- [x] 确定系统可用性要求：工作时间可用
- [x] 确定响应时间要求：普通响应速度

## 5. 项目时间节点
[待补充]

## 6. 变更记录
| 日期 | 变更内容 | 变更人 |
|------|----------|--------|
| 当前 | 新增非功能性需求 | AI助手 |
| 当前 | 新增权限管理相关需求 | AI助手 |
| 当前 | 新增统计报表相关需求 | AI助手 |
| 当前 | 新增智能查询系统相关需求 | AI助手 |
| 当前 | 新增数据存储管理相关需求 | AI助手 |
| 当前 | 新增文档信息录入相关需求 | AI助手 |
| 当前 | 修改 documents 表，created_by 和 updated_by 存储真实姓名 | AI助手 |
| 当前 | 修改 documents 表，year 改为 handover_date (DATE) | AI助手 |
| 当前 | 新增查询结果中文档名称自动换行的要求 | AI助手 |
| 当前 | 新增通用输入数据有效性验证的要求 | AI助手 |
| 当前 | 新增数据库设计章节 | AI助手 |
| 当前 | 增加数据库连接和启动行为需求 | AI助手 |
| 当前 | 明确Excel导入模板和空值处理规则 | AI助手 |
| 当前 | API: DepartmentNode 响应增加 parentName 字段 | AI助手 |
| 当前 | 修改 documents 表和API，允许多个字段为空 | AI助手 |
| 当前 | 新增数据库创建脚本 | AI助手 |

## 7. 数据库设计

### 7.0 数据库创建脚本
```sql
CREATE DATABASE LDIMS_DB
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### 7.1 数据库表结构

#### 7.1.1 用户表（users）
用于存储系统用户信息
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(50) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    role ENUM('admin', 'editor', 'viewer') NOT NULL COMMENT '用户角色',
    department_id INT NOT NULL COMMENT '所属部门ID',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-启用, 0-禁用',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_department (department_id),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

#### 7.1.2 部门表（departments）
存储部门信息，支持两级部门结构
```sql
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    name VARCHAR(100) NOT NULL COMMENT '部门名称',
    code VARCHAR(50) NOT NULL UNIQUE COMMENT '部门编码',
    parent_id INT NOT NULL DEFAULT 0 COMMENT '父级部门ID，顶级为0',
    level TINYINT NOT NULL COMMENT '层级：1-一级部门，2-二级部门',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '排序号',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-启用, 0-禁用',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    INDEX idx_parent (parent_id),
    INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门表';
```

#### 7.1.3 文档类型表（doc_types）
用于存储文档分类信息，支持多级分类
```sql
CREATE TABLE doc_types (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    name VARCHAR(100) NOT NULL COMMENT '类型名称',
    parent_id INT NOT NULL DEFAULT 0 COMMENT '父级ID，顶级为0',
    level TINYINT NOT NULL COMMENT '层级：1-一级，2-二级，3-三级',
    sort_order INT NOT NULL DEFAULT 0 COMMENT '排序号',
    created_by INT NOT NULL COMMENT '创建人ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    INDEX idx_parent (parent_id),
    INDEX idx_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档类型表';
```

#### 7.1.4 文档信息表（documents）
存储文档的基本信息
```sql
CREATE TABLE documents (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    doc_name VARCHAR(255) NOT NULL COMMENT '文档名称',
    doc_type_id INT COMMENT '文档类型ID, 允许为空',
    source_department_id INT NOT NULL COMMENT '来源部门ID',
    submitter VARCHAR(50) NOT NULL COMMENT '提交人',
    receiver VARCHAR(50) NOT NULL COMMENT '接收人',
    signer VARCHAR(50) COMMENT '落款人, 允许为空',
    storage_location VARCHAR(100) COMMENT '保管位置',
    remarks TEXT COMMENT '备注说明',
    handover_date DATE COMMENT '交接日期, 允许为空',
    created_by VARCHAR(50) COMMENT '创建人姓名, 允许为空',
    updated_by VARCHAR(50) COMMENT '最后修改人姓名, 允许为空',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '是否删除',
    INDEX idx_doc_type (doc_type_id),
    INDEX idx_department (source_department_id),
    INDEX idx_handover_date (handover_date),
    INDEX idx_doc_name (doc_name),
    FULLTEXT INDEX idx_content (doc_name, submitter, receiver, signer, remarks)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文档信息表';
```

#### 7.1.5 查询条件表（search_conditions）
存储用户保存的查询条件
```sql
CREATE TABLE search_conditions (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id INT NOT NULL COMMENT '用户ID',
    name VARCHAR(100) NOT NULL COMMENT '条件名称',
    conditions JSON NOT NULL COMMENT '查询条件',
    is_common TINYINT NOT NULL DEFAULT 0 COMMENT '是否常用',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='查询条件表';
```

#### 7.1.6 操作日志表（operation_logs）
记录系统重要操作日志
```sql
CREATE TABLE operation_logs (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id INT NOT NULL COMMENT '操作用户ID',
    operation_type VARCHAR(50) NOT NULL COMMENT '操作类型',
    operation_content TEXT NOT NULL COMMENT '操作内容',
    ip_address VARCHAR(50) NOT NULL COMMENT 'IP地址',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';
```

#### 7.1.7 导出任务表（export_tasks）
记录异步导出任务
```sql
CREATE TABLE export_tasks (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    user_id INT NOT NULL COMMENT '用户ID',
    task_type VARCHAR(50) NOT NULL COMMENT '任务类型：文档导出/报表导出',
    status TINYINT NOT NULL DEFAULT 0 COMMENT '状态：0-待处理，1-处理中，2-完成，3-失败',
    file_path VARCHAR(255) COMMENT '文件路径',
    error_message TEXT COMMENT '错误信息',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='导出任务表';
```

### 7.2 索引设计说明

1. 用户表（users）
   - 主键索引：id
   - 唯一索引：username（用户登录）
   - 普通索引：department_id（按部门查询用户）

2. 部门表（departments）
   - 主键索引：id
   - 唯一索引：code（部门编码）
   - 普通索引：parent_id（查询子部门）

3. 文档类型表（doc_types）
   - 主键索引：id
   - 普通索引：parent_id, level（类型树形结构查询）

4. 文档信息表（documents）
   - 主键索引：id
   - 普通索引：doc_type_id（按类型查询）
   - 普通索引：source_department_id（按部门查询）
   - 普通索引：year（按年度查询）
   - 普通索引：doc_name（按文档名称查询）
   - 全文索引：(doc_name, submitter, receiver, signer, remarks)（全文检索）

5. 查询条件表（search_conditions）
   - 主键索引：id
   - 普通索引：user_id（按用户查询保存的条件）

6. 操作日志表（operation_logs）
   - 主键索引：id
   - 普通索引：user_id（按用户查询日志）
   - 普通索引：created_at（按时间查询日志）

7. 导出任务表（export_tasks）
   - 主键索引：id
   - 普通索引：user_id（按用户查询任务）
   - 普通索引：status（按状态查询任务）

### 7.3 初始化数据

#### 7.3.1 初始化SQL语句
```sql
-- 创建默认的根部门（总部）
INSERT INTO departments (
    name, 
    code, 
    parent_id, 
    level, 
    sort_order, 
    status
) VALUES (
    '总部', 
    'HQ', 
    0, 
    1, 
    1, 
    1
);

-- 创建系统管理员账号
INSERT INTO users (
    username, 
    password, 
    real_name, 
    role, 
    department_id,
    status
) VALUES (
    'admin',
    'admin123',
    '系统管理员',
    'admin',
    1,  -- 总部的ID
    1
);
```

#### 7.3.2 密码管理说明
- 密码以明文形式存储
- 密码修改功能：
  - 需要输入原密码和新密码
  - 新密码需要输入两次以确认
  - 不强制密码复杂度要求

## 8. API接口设计

### 8.1 接口规范

#### 8.1.1 请求规范
- 基础路径：`/api/v1`
- 请求方法：
  - GET：查询数据
  - POST：创建数据
  - PUT：更新数据
  - DELETE：删除数据
- 请求头：
  ```json
  {
    "Content-Type": "application/json"
  }
  ```

#### 8.1.2 响应规范
- 统一响应格式：
  ```typescript
  interface ApiResponse<T> {
    code: number;      // 状态码：200-成功，其他-失败
    message: string;   // 响应消息
    data?: T;         // 响应数据
  }
  ```
- 分页响应格式：
  ```typescript
  interface PageResult<T> {
    list: T[];        // 数据列表
    total: number;    // 总记录数
    page: number;     // 当前页码
    pageSize: number; // 每页大小
  }
  ```
- 常用状态码：
  - 200：成功
  - 400：请求参数错误
  - 404：资源不存在
  - 500：服务器错误

### 8.2 认证相关接口

#### 8.2.1 用户登录
- 请求路径：POST /api/v1/auth/login
- 请求参数：
  ```typescript
  interface LoginRequest {
    username: string;  // 用户名
    password: string;  // 密码
  }
  ```
- 响应数据：
  ```typescript
  interface LoginResponse {
    user: {
      id: number;     // 用户ID
      username: string;// 用户名
      realName: string;// 真实姓名
      role: string;   // 角色
      departmentId: number; // 部门ID
    }
  }
  ```

#### 8.2.2 修改密码
- 请求路径：POST /api/v1/auth/change-password
- 请求参数：
  ```typescript
  interface ChangePasswordRequest {
    oldPassword: string;  // 原密码
    newPassword: string;  // 新密码
    confirmPassword: string;  // 确认新密码
  }
  ```
- 响应数据：无

### 8.3 用户管理接口

#### 8.3.1 获取用户列表
- 请求路径：GET /api/v1/users
- 请求参数：
  ```typescript
  interface UserListRequest {
    page?: number;     // 页码，默认1
    pageSize?: number; // 每页大小，默认20
    keyword?: string;  // 搜索关键词（用户名/真实姓名）
    departmentId?: number; // 部门ID
    role?: string;    // 角色
    status?: number;  // 状态：1-启用，0-禁用
  }
  ```
- 响应数据：
  ```typescript
  interface UserInfo {
    id: number;
    username: string;
    realName: string;
    role: string;
    departmentId: number;
    departmentName: string;
    status: number;
    createdAt: string;
    updatedAt: string;
  }
  type UserListResponse = PageResult<UserInfo>;
  ```

#### 8.3.2 创建用户
- 请求路径：POST /api/v1/users
- 请求参数：
  ```typescript
  interface CreateUserRequest {
    username: string;
    password: string;
    realName: string;
    role: string;
    departmentId: number;
    status?: number;  // 默认1
  }
  ```
- 响应数据：
  ```typescript
  interface CreateUserResponse {
    id: number;  // 新创建的用户ID
  }
  ```

#### 8.3.3 更新用户
- 请求路径：PUT /api/v1/users/:id
- 请求参数：
  ```typescript
  interface UpdateUserRequest {
    realName?: string;
    role?: string;
    departmentId?: number;
    status?: number;
  }
  ```
- 响应数据：无

#### 8.3.4 删除用户
- 请求路径：DELETE /api/v1/users/:id
- 请求参数：无
- 响应数据：无

### 8.4 部门管理接口

#### 8.4.1 获取部门树
- 请求路径：GET /api/v1/departments/tree
- 请求参数：无
- 响应数据：
  ```typescript
  interface DepartmentNode {
    id: number;
    name: string;
    code: string;
    parentId: number;
    parentName?: string;
    level: number;
    sortOrder: number;
    status: number;
    children?: DepartmentNode[];
  }
  type DepartmentTreeResponse = DepartmentNode[];
  ```

#### 8.4.2 创建部门
- 请求路径：POST /api/v1/departments
- 请求参数：
  ```typescript
  interface CreateDepartmentRequest {
    name: string;
    code: string;
    parentId: number;
    level: number;
    sortOrder?: number;
    status?: number;
  }
  ```
- 响应数据：
  ```typescript
  interface CreateDepartmentResponse {
    id: number;  // 新创建的部门ID
  }
  ```

#### 8.4.3 更新部门
- 请求路径：PUT /api/v1/departments/:id
- 请求参数：
  ```typescript
  interface UpdateDepartmentRequest {
    name?: string;
    code?: string;
    sortOrder?: number;
    status?: number;
  }
  ```
- 响应数据：无

#### 8.4.4 删除部门
- 请求路径：DELETE /api/v1/departments/:id
- 请求参数：无
- 响应数据：无

### 8.5 文档类型管理接口

#### 8.5.1 获取文档类型树
- 请求路径：GET /api/v1/doc-types/tree
- 请求参数：无
- 响应数据：
  ```typescript
  interface DocTypeNode {
    id: number;
    name: string;
    parentId: number;
    level: number;
    sortOrder: number;
    children?: DocTypeNode[];
  }
  type DocTypeTreeResponse = DocTypeNode[];
  ```

#### 8.5.2 创建文档类型
- 请求路径：POST /api/v1/doc-types
- 请求参数：
  ```typescript
  interface CreateDocTypeRequest {
    name: string;
    parentId: number;
    level: number;
    sortOrder?: number;
  }
  ```
- 响应数据：
  ```typescript
  interface CreateDocTypeResponse {
    id: number;  // 新创建的文档类型ID
  }
  ```

#### 8.5.3 更新文档类型
- 请求路径：PUT /api/v1/doc-types/:id
- 请求参数：
  ```typescript
  interface UpdateDocTypeRequest {
    name?: string;
    sortOrder?: number;
  }
  ```
- 响应数据：无

#### 8.5.4 删除文档类型
- 请求路径：DELETE /api/v1/doc-types/:id
- 请求参数：无
- 响应数据：无

### 8.6 文档信息管理接口

#### 8.6.1 获取文档列表
- 请求路径：GET /api/v1/documents
- 请求参数：
  ```typescript
  interface DocumentListRequest {
    page?: number;     // 页码，默认1
    pageSize?: number; // 每页大小，默认20
    keyword?: string;  // 搜索关键词
    docTypeId?: number;// 文档类型ID
    departmentId?: number; // 来源部门ID
    year?: number;     // 年度
    submitter?: string;// 提交人
    receiver?: string; // 接收人
    signer?: string;   // 落款人
    startDate?: string;// 创建开始日期
    endDate?: string;  // 创建结束日期
    handoverStartDate?: string; // 交接开始日期
    handoverEndDate?: string;   // 交接结束日期
    sortField?: string;// 排序字段
    sortOrder?: 'asc' | 'desc'; // 排序方向
  }
  ```
- 响应数据：
  ```typescript
  interface DocumentInfo {
    id: number;
    docName: string;
    docTypeId: number | null; // 允许 null
    docTypeName: string | null; // 允许 null
    sourceDepartmentId: number;
    sourceDepartmentName: string;
    submitter: string;
    receiver: string;
    signer: string | null; // 允许 null
    storageLocation: string | null;
    remarks: string | null;
    handoverDate: string | null; // 允许 null
    createdBy: string | null; // 允许 null
    updatedBy: string | null; // 允许 null
    createdAt: string;
    updatedAt: string;
  }
  type DocumentListResponse = PageResult<DocumentInfo>;
  ```

#### 8.6.2 创建文档
- 请求路径：POST /api/v1/documents
- 请求参数：
  ```typescript
  interface CreateDocumentRequest {
    docName: string;
    docTypeId?: number | null; // 改为可选或允许 null
    sourceDepartmentId: number;
    submitter: string;
    receiver: string;
    signer?: string | null; // 改为可选或允许 null
    storageLocation?: string; // 本身可选
    remarks?: string; // 本身可选
    handoverDate?: string | null; // 改为可选或允许 null
    // created_by 和 updated_by 由后端处理
  }
  ```
- 响应数据：
  ```typescript
  interface CreateDocumentResponse {
    id: number;  // 新创建的文档ID
  }
  ```

#### 8.6.3 更新文档
- 请求路径：PUT /api/v1/documents/:id
- 请求参数：
  ```typescript
  interface UpdateDocumentRequest {
    docName?: string;
    docTypeId?: number | null; // 改为可选或允许 null
    sourceDepartmentId?: number;
    submitter?: string;
    receiver?: string;
    signer?: string | null; // 改为可选或允许 null
    storageLocation?: string;
    remarks?: string;
    handoverDate?: string | null; // 改为可选或允许 null
    year?: number;
    handoverDate?: string; // 交接日期
  }
  ```
- 响应数据：无

#### 8.6.4 删除文档
- 请求路径：DELETE /api/v1/documents/:id
- 请求参数：无
- 响应数据：无

#### 8.6.5 批量导入文档
- 请求路径：POST /api/v1/documents/import
- 请求参数：
  ```typescript
  interface ImportDocumentsRequest {
    file: File;  // Excel文件
  }
  ```
- 响应数据：
  ```typescript
  interface ImportDocumentsResponse {
    taskId: string;  // 导入任务ID
    totalCount: number;  // 总记录数
  }
  ```

#### 8.6.6 获取导入进度
- 请求路径：GET /api/v1/documents/import/:taskId/progress
- 请求参数：无
- 响应数据：
  ```typescript
  interface ImportProgressResponse {
    taskId: string;
    status: 'processing' | 'completed' | 'failed';
    progress: number;  // 0-100
    successCount: number;
    failCount: number;
    errors?: Array<{
      row: number;
      message: string;
    }>;
  }
  ```

#### 8.6.7 导出文档
- 请求路径：POST /api/v1/documents/export
- 请求参数：
  ```typescript
  interface ExportDocumentsRequest {
    conditions?: DocumentListRequest;  // 查询条件
    fields?: string[];  // 导出字段
    fileType: 'excel' | 'csv';  // 文件类型
  }
  ```
- 响应数据：
  ```typescript
  interface ExportDocumentsResponse {
    taskId: string;  // 导出任务ID
  }
  ```

### 8.7 统计报表接口

#### 8.7.1 获取部门文档统计
- 请求路径：GET /api/v1/statistics/department
- 请求参数：
  ```typescript
  interface DepartmentStatsRequest {
    year?: number;  // 年度
    startDate?: string;  // 开始日期
    endDate?: string;   // 结束日期
  }
  ```
- 响应数据：
  ```typescript
  interface DepartmentStats {
    departmentId: number;
    departmentName: string;
    count: number;
  }
  type DepartmentStatsResponse = DepartmentStats[];
  ```

#### 8.7.2 获取文档类型统计
- 请求路径：GET /api/v1/statistics/doc-type
- 请求参数：
  ```typescript
  interface DocTypeStatsRequest {
    year?: number;
    departmentId?: number;
    startDate?: string;
    endDate?: string;
  }
  ```
- 响应数据：
  ```typescript
  interface DocTypeStats {
    docTypeId: number;
    docTypeName: string;
    count: number;
    children?: DocTypeStats[];
  }
  type DocTypeStatsResponse = DocTypeStats[];
  ```

#### 8.7.3 获取时间趋势统计
- 请求路径：GET /api/v1/statistics/trend
- 请求参数：
  ```typescript
  interface TrendStatsRequest {
    type: 'month' | 'quarter' | 'year';  // 统计类型
    year?: number;
    departmentId?: number;
    docTypeId?: number;
  }
  ```
- 响应数据：
  ```typescript
  interface TrendStats {
    period: string;  // 时间段
    count: number;   // 数量
  }
  type TrendStatsResponse = TrendStats[];
  ```

#### 8.7.4 导出统计报表
- 请求路径：POST /api/v1/statistics/export
- 请求参数：
  ```typescript
  interface ExportStatsRequest {
    type: 'department' | 'docType' | 'trend';  // 报表类型
    conditions: DepartmentStatsRequest | DocTypeStatsRequest | TrendStatsRequest;
    fileType: 'excel' | 'image';  // 导出类型
  }
  ```
- 响应数据：
  ```typescript
  interface ExportStatsResponse {
    taskId: string;  // 导出任务ID
  }
  ```

### 8.8 通用接口

#### 8.8.1 获取枚举选项
- 请求路径：GET /api/v1/enums/:type
- 请求参数：
  ```typescript
  type EnumType = 'userRole' | 'taskStatus' | 'exportFileType';
  ```
- 响应数据：
  ```typescript
  interface EnumOption {
    value: string | number;
    label: string;
  }
  type EnumResponse = EnumOption[];
  ```

#### 8.8.2 上传文件
- 请求路径：POST /api/v1/upload
- 请求参数：
  ```typescript
  interface UploadRequest {
    file: File;  // 文件对象
    type: 'excel' | 'image';  // 文件类型
  }
  ```
- 响应数据：
  ```typescript
  interface UploadResponse {
    url: string;  // 文件访问地址
    path: string; // 文件存储路径
    name: string; // 文件名称
    size: number; // 文件大小（字节）
  }
  ```

#### 8.8.3 下载文件
- 请求路径：GET /api/v1/download
- 请求参数：
  ```typescript
  interface DownloadRequest {
    path: string;  // 文件路径
  }
  ```
- 响应数据：文件流

### 8.9 任务管理接口

#### 8.9.1 获取任务列表
- 请求路径：GET /api/v1/tasks
- 请求参数：
  ```typescript
  interface TaskListRequest {
    page?: number;     // 页码，默认1
    pageSize?: number; // 每页大小，默认20
    type?: string;     // 任务类型：import/export
    status?: string;   // 任务状态
    startDate?: string;// 开始日期
    endDate?: string;  // 结束日期
  }
  ```
- 响应数据：
  ```typescript
  interface TaskInfo {
    id: string;
    userId: number;
    userName: string;
    taskType: string;
    status: string;
    progress: number;
    filePath?: string;
    errorMessage?: string;
    createdAt: string;
    updatedAt: string;
  }
  type TaskListResponse = PageResult<TaskInfo>;
  ```

#### 8.9.2 获取任务详情
- 请求路径：GET /api/v1/tasks/:id
- 请求参数：无
- 响应数据：
  ```typescript
  interface TaskDetailResponse extends TaskInfo {
    details: {
      totalCount?: number;
      successCount?: number;
      failCount?: number;
      errors?: Array<{
        row?: number;
        message: string;
      }>;
    }
  }
  ```

#### 8.9.3 取消任务
- 请求路径：POST /api/v1/tasks/:id/cancel
- 请求参数：无
- 响应数据：无

#### 8.9.4 删除任务
- 请求路径：DELETE /api/v1/tasks/:id
- 请求参数：无
- 响应数据：无

### 8.10 系统管理接口

#### 8.10.1 获取系统配置
- 请求路径：GET /api/v1/system/config
- 请求参数：无
- 响应数据：
  ```typescript
  interface SystemConfig {
    uploadConfig: {
      maxSize: number;        // 最大上传大小（MB）
      allowedTypes: string[]; // 允许的文件类型
    };
    exportConfig: {
      maxRecords: number;     // 单次导出最大记录数
      timeout: number;        // 导出超时时间（秒）
    };
    importConfig: {
      maxRecords: number;     // 单次导入最大记录数
      timeout: number;        // 导入超时时间（秒）
    };
  }
  ```

#### 8.10.2 更新系统配置
- 请求路径：PUT /api/v1/system/config
- 请求参数：
  ```typescript
  type UpdateConfigRequest = Partial<SystemConfig>;
  ```
- 响应数据：无

#### 8.10.3 获取系统状态
- 请求路径：GET /api/v1/system/status
- 请求参数：无
- 响应数据：
  ```typescript
  interface SystemStatus {
    version: string;          // 系统版本
    startTime: string;        // 启动时间
    uptime: number;          // 运行时长（秒）
    activeUsers: number;     // 当前在线用户数
    taskCount: {             // 任务统计
      total: number;         // 总任务数
      processing: number;    // 处理中任务数
      waiting: number;       // 等待中任务数
    };
    systemLoad: {           // 系统负载
      cpu: number;          // CPU使用率
      memory: number;       // 内存使用率
      disk: number;         // 磁盘使用率
    };
  }
  ```
