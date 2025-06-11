# LDIMS 文档文件内容提取 API 文档

## 📄 概述

本文档描述了 LDIMS 系统中文档文件内容提取 API 的详细规范，该 API 允许客户端获取已上传文档文件的元数据和提取的文本内容。

---

## 🔗 API 接口规范

### 基础信息

- **Base URL**: `http://localhost:5000/api/documents`
- **API 版本**: v1.0
- **认证方式**: Bearer Token (JWT)
- **内容类型**: `application/json`

---

## 📋 接口详情

### GET /files/{file_id}/content

获取指定文档文件的提取内容和元数据信息。

#### 🔑 认证要求

```
Authorization: Bearer <JWT_TOKEN>
```

#### 📥 请求参数

##### 路径参数 (Path Parameters)

| 参数名    | 类型    | 必填 | 描述                               | 示例  |
| --------- | ------- | ---- | ---------------------------------- | ----- |
| `file_id` | integer | ✅   | 文档文件的唯一标识符，必须为正整数 | `123` |

##### 查询参数 (Query Parameters)

| 参数名            | 类型    | 必填 | 默认值 | 描述                             |
| ----------------- | ------- | ---- | ------ | -------------------------------- |
| `includeMetadata` | boolean | ❌   | `true` | 是否包含文件元数据信息           |
| `format`          | string  | ❌   | `json` | 响应格式，可选值: `json`, `text` |

#### 📤 响应格式

##### 成功响应 (200 OK)

```json
{
  "success": true,
  "code": 200,
  "message": "获取文件内容成功",
  "data": {
    "fileId": 123,
    "fileName": "技术方案.pdf",
    "filePath": "documents/2024/01/tech-proposal.pdf",
    "extractedContent": "这是一份技术方案文档...\n\n## 项目背景\n\n本项目旨在...",
    "processingStatus": "completed",
    "extractedAt": null,
    "fileSize": 2048576,
    "mimeType": "application/pdf",
    "documentId": 45,
    "uploadedAt": "2024-01-15T08:30:00.000Z"
  }
}
```

##### 错误响应

###### 400 Bad Request - 参数验证失败

```json
{
  "success": false,
  "code": 400,
  "message": "参数验证失败",
  "data": [
    {
      "msg": "无效的文件ID",
      "param": "file_id",
      "location": "params"
    }
  ]
}
```

###### 401 Unauthorized - 未认证

```json
{
  "success": false,
  "code": 401,
  "message": "未提供有效的认证令牌"
}
```

###### 403 Forbidden - 无权访问

```json
{
  "success": false,
  "code": 403,
  "message": "无权访问该文件"
}
```

###### 404 Not Found - 文件不存在

```json
{
  "success": false,
  "code": 404,
  "message": "文件不存在或已被删除"
}
```

###### 500 Internal Server Error - 服务器错误

```json
{
  "success": false,
  "code": 500,
  "message": "服务器内部错误，请稍后重试"
}
```

---

## 📊 数据模型

### DocumentFileContentResponse

| 字段名             | 类型           | 描述                     | 示例                                    |
| ------------------ | -------------- | ------------------------ | --------------------------------------- |
| `fileId`           | number         | 文件的唯一标识符         | `123`                                   |
| `fileName`         | string         | 原始文件名               | `"技术方案.pdf"`                        |
| `filePath`         | string         | 文件在服务器上的存储路径 | `"documents/2024/01/tech-proposal.pdf"` |
| `extractedContent` | string \| null | 从文件中提取的文本内容   | `"这是一份技术方案文档..."`             |
| `processingStatus` | string         | 文件处理状态             | `"completed"`                           |
| `extractedAt`      | string \| null | 内容提取时间 (ISO 8601)  | `null`                                  |
| `fileSize`         | number         | 文件大小 (字节)          | `2048576`                               |
| `mimeType`         | string         | 文件 MIME 类型           | `"application/pdf"`                     |
| `documentId`       | number         | 关联的文档 ID            | `45`                                    |
| `uploadedAt`       | string         | 文件上传时间 (ISO 8601)  | `"2024-01-15T08:30:00.000Z"`            |

### 处理状态枚举值

| 状态值         | 描述         |
| -------------- | ------------ |
| `pending`      | 等待处理     |
| `processing`   | 正在处理     |
| `completed`    | 处理完成     |
| `failed`       | 处理失败     |
| `ocr_fallback` | OCR 备用处理 |

---

## 🔧 使用示例

### cURL 示例

```bash
# 获取文件内容
curl -X GET \
  "http://localhost:5000/api/documents/files/123/content" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# 只获取文本内容，不包含元数据
curl -X GET \
  "http://localhost:5000/api/documents/files/123/content?includeMetadata=false&format=text" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### JavaScript (Axios) 示例

```javascript
// 使用 axios 请求
const getFileContent = async (fileId, token) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/documents/files/${fileId}/content`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      console.log("文件内容:", response.data.data.extractedContent);
      return response.data.data;
    } else {
      console.error("获取失败:", response.data.message);
    }
  } catch (error) {
    if (error.response) {
      // 服务器响应了错误状态码
      console.error("Error:", error.response.data.message);
    } else {
      // 请求发送失败或网络错误
      console.error("Request failed:", error.message);
    }
  }
};

// 调用示例
getFileContent(123, "your-jwt-token-here");
```

### Python (requests) 示例

```python
import requests
import json

def get_file_content(file_id, token):
    """获取文档文件内容"""
    url = f"http://localhost:5000/api/documents/files/{file_id}/content"

    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }

    try:
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            data = response.json()
            if data['success']:
                print("文件内容获取成功")
                return data['data']
            else:
                print(f"获取失败: {data['message']}")
        else:
            print(f"HTTP错误: {response.status_code}")

    except requests.exceptions.RequestException as e:
        print(f"请求异常: {e}")

    return None

# 使用示例
file_data = get_file_content(123, 'your-jwt-token-here')
if file_data:
    print(f"文件名: {file_data['fileName']}")
    print(f"内容: {file_data['extractedContent'][:100]}...")
```

---

## 🚨 错误处理

### 常见错误场景及处理建议

| 错误码 | 场景             | 建议处理方式                     |
| ------ | ---------------- | -------------------------------- |
| 400    | 文件 ID 格式错误 | 验证 fileId 是否为正整数         |
| 401    | Token 过期或无效 | 重新登录获取新 Token             |
| 403    | 无权访问文件     | 检查用户权限设置                 |
| 404    | 文件不存在       | 确认文件 ID 是否正确             |
| 500    | 服务器内部错误   | 稍后重试，如持续出现请联系管理员 |

### 重试机制建议

```javascript
const getFileContentWithRetry = async (fileId, token, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await getFileContent(fileId, token);
      return response;
    } catch (error) {
      if (error.response?.status === 500 && attempt < maxRetries) {
        // 服务器错误时重试
        console.log(`第${attempt}次请求失败，${2 ** attempt}秒后重试...`);
        await new Promise((resolve) =>
          setTimeout(resolve, 2 ** attempt * 1000)
        );
        continue;
      }
      throw error; // 其他错误或最后一次重试失败时抛出
    }
  }
};
```

---

## 🔐 安全考虑

### JWT Token 安全

- Token 应存储在安全位置（如 httpOnly Cookie）
- 定期刷新 Token 以降低泄露风险
- 设置合理的 Token 过期时间

### API 访问控制

- 实施请求频率限制以防止滥用
- 记录访问日志用于审计
- 验证用户对特定文件的访问权限

### 数据保护

- 敏感内容的访问应有额外的权限验证
- 考虑对提取内容进行脱敏处理
- 定期审查文件访问权限

---

## 📈 性能与限制

### 性能指标

- **响应时间**: 通常 < 500ms (P95)
- **并发处理**: 支持最大 100 个并发请求
- **内容大小**: 支持最大 10MB 的提取内容

### 使用限制

- **请求频率**: 每个用户每分钟最多 100 次请求
- **文件大小**: 支持的文件大小上限为 50MB
- **支持格式**: PDF, DOC, DOCX, TXT, RTF 等

### 性能优化建议

- 启用 HTTP 缓存头以减少重复请求
- 考虑使用分页或内容截断处理大文件
- 实施内容压缩以减少传输大小

---

## 🧪 测试指南

### 测试用例

1. **正常场景测试**

   ```bash
   # 测试正常获取文件内容
   curl -X GET "http://localhost:5000/api/documents/files/1/content" \
     -H "Authorization: Bearer valid_token"
   ```

2. **参数验证测试**

   ```bash
   # 测试无效文件ID
   curl -X GET "http://localhost:5000/api/documents/files/abc/content" \
     -H "Authorization: Bearer valid_token"
   ```

3. **权限测试**
   ```bash
   # 测试无效Token
   curl -X GET "http://localhost:5000/api/documents/files/1/content" \
     -H "Authorization: Bearer invalid_token"
   ```

### 测试数据

建议使用以下测试数据进行 API 验证：

| 文件 ID | 文件名          | 状态       | 预期结果       |
| ------- | --------------- | ---------- | -------------- |
| 1       | test.pdf        | completed  | 成功返回内容   |
| 2       | processing.docx | processing | 返回处理中状态 |
| 99999   | 不存在          | -          | 404 错误       |

---

## 📝 变更日志

### v1.0.0 (2024-01-15)

- ✅ 新增文档文件内容提取 API
- ✅ 支持 JWT 认证
- ✅ 添加参数验证和错误处理
- ✅ 实现完整的响应格式规范

---

## 🤝 联系方式

如有问题或建议，请联系：

- **开发团队**: dev@ldims.com
- **技术支持**: support@ldims.com
- **文档维护**: docs@ldims.com

---

## 📚 相关文档

- [LDIMS API 总体文档](./API_Overview.md)
- [认证和授权指南](./Authentication.md)
- [错误处理规范](./Error_Handling.md)
- [开发环境搭建](./Development_Setup.md)
