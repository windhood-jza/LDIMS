# LDIMS - MCP 服务生成规划设计

## 1. 引言

本文档旨在规划和设计一个模型上下文协议 (Model Context Protocol, MCP) 服务，作为 LDIMS (文档信息管理系统) 与大型语言模型 (LLM) 之间的桥梁。目标是使 LLM 能够通过标准化的接口与 LDIMS 进行交互，实现基于自然语言的文档检索和内容问答等高级功能。

## 2. 核心原则

- **标准化接口**: 遵循 MCP 规范，提供统一的数据和工具访问方式。
- **上下文感知**: 使 LLM 能够获取执行任务所需的 LDIMS 文档上下文。
- **能力分离**: 清晰地区分数据获取 (Resources) 和操作执行 (Tools)。
- **可扩展性**: 设计应考虑到未来可能增加的新功能和数据源。

## 3. 传输方式选择

为了确保网络可访问性和可扩展性，MCP 服务将采用 **Streamable HTTP** 作为主要的传输方式。

- **推荐使用 `express` 框架** (或其他 Node.js HTTP 框架) 来搭建 HTTP 服务器。
- **初步可以从无会话 (Stateless) 模式开始设计**，如果后续有复杂的状态管理需求，再考虑引入会话管理机制。

## 4. MCP 能力定义

### 4.1. Resource: `extracted_content`

- **Purpose**: Retrieve the extracted text content from a specific document in the LDIMS system.
- **MCP Type**: `Resource`
- **URI Pattern**: `ldims://docs/{document_id}/extracted_content`
  - `{document_id}`: The unique identifier of the document in LDIMS system.
- **Description for LLM**:
  ```
  This resource provides access to the full extracted text content of a document stored in the LDIMS system.
  Use this when you need to:
  - Read the actual content of a specific document
  - Answer questions about the content of a known document
  - Analyze or understand the details within a document
  The content is pre-processed and extracted from various file formats (PDF, DOCX, etc.) into plain text.
  ```
- **Response Format**:
  ```json
  {
    "contents": [
      {
        "uri": "ldims://docs/{document_id}/extracted_content",
        "text": "The complete extracted text content of the document...",
        "metadata": {
          "documentName": "Original document name",
          "extractedAt": "ISO timestamp",
          "format": "Original document format"
        }
      }
    ]
  }
  ```
- **Implementation Notes**: The MCP server calls LDIMS backend API to fetch the `extracted_content` based on the provided `document_id`.

- **Error Handling**:
  - **Standard HTTP Status Codes**:
    - `200 OK`: Content successfully retrieved.
    - `202 Accepted`: The content is still being processed or is not yet available. The response body SHOULD include a JSON object with a `status` field indicating the current processing state (e.g., `{"status": "processing", "message": "Content extraction is in progress. Please try again later."}`).
    - `404 Not Found`: The requested `document_id` does not exist, or no `extracted_content` is associated with it. The response body SHOULD be a JSON object: `{"isError": true, "errorCode": "RESOURCE_NOT_FOUND", "errorMessage": "Document or its content not found."}`.
    - `403 Forbidden`: The user/LLM does not have permission to access the content. The response body SHOULD be: `{"isError": true, "errorCode": "FORBIDDEN", "errorMessage": "Access to the requested content is forbidden."}`.
    - `409 Conflict`: The content extraction failed, or the content is in a state that prevents retrieval. The response body SHOULD be: `{"isError": true, "errorCode": "CONTENT_UNAVAILABLE_OR_FAILED", "errorMessage": "Content extraction failed or content is in an unusable state.", "errorDetails": { ... }}`.
    - `500 Internal Server Error` / `503 Service Unavailable`: For general server-side errors or if the LDIMS backend is unavailable. The response body SHOULD be: `{"isError": true, "errorCode": "SERVER_ERROR", "errorMessage": "An unexpected error occurred on the server."}`.
  - **JSON Error Response Body**: For `4xx` and `5xx` errors, the response body should ideally be a JSON object containing at least:
    - `isError: true`
    - `errorCode: string` (e.g., "RESOURCE_NOT_FOUND", "PROCESSING_FAILED")
    - `errorMessage: string` (A human-readable error message)
    - `errorDetails: object` (Optional, for more specific error information)

### 4.2. Tool: `searchDocuments`

- **Purpose**: Search for relevant documents in LDIMS based on natural language queries.
- **MCP Type**: `Tool`
- **Tool Name**: `searchDocuments`
- **Description for LLM**:

  ```
  This tool helps you find relevant documents in the LDIMS system based on natural language queries.
  Use this tool when you need to:
  - Find documents matching specific topics or content
  - Locate documents containing particular information
  - Search across all documents using keywords or natural language
  - Get a list of relevant documents before accessing their content

  The tool performs semantic search across document contents and metadata, returning the most relevant matches.
  Each result includes the document name and ID, which you can use with the extracted_content resource
  to access the full content.
  ```

- **Input Schema** (using `zod`):

  ```typescript
  {
    // The natural language or keyword query to search for documents
    query: z.string().describe(
      "The search query in natural language or keywords. Be specific and include key terms related to the information you're looking for."
    ),

    // Optional: Maximum number of results to return (default: 5)
    maxResults: z.number().optional().default(5).describe(
      "Maximum number of documents to return in the results. Use a larger number if you need more comprehensive results."
    ),

    // Optional: Search filters
    filters: z.object({
      // Date range for document creation/modification
      dateFrom: z.string().optional().describe("Start date for filtering documents (ISO format)"),
      dateTo: z.string().optional().describe("End date for filtering documents (ISO format)"),

      // Document metadata filters
      documentType: z.string().optional().describe("Filter by document type/format"),
      submitter: z.string().optional().describe("Filter by document submitter"),

      // Search mode configuration
      searchMode: z.enum(['exact', 'semantic']).optional().default('semantic')
        .describe("The search mode to use: 'exact' for precise matches, 'semantic' for meaning-based matches")
    }).optional()
  }
  ```

- **Response Format** (`content` field, JSON string):
  ```json
  {
    "results": [
      {
        "documentId": "doc_xyz",
        "documentName": "Q4 2023 Sales Strategy.docx",
        "relevanceScore": 0.85,
        "matchedContext": "...relevant excerpt from the document...",
        "metadata": {
          "createdAt": "2023-12-01T10:00:00Z",
          "submitter": "John Doe",
          "documentType": "Strategy Document"
        }
      }
    ],
    "totalMatches": 10,
    "searchMetadata": {
      "executionTime": "0.123s",
      "searchMode": "semantic"
    }
  }
  ```
- **Implementation Logic**:
  1. Receives tool invocation with search parameters
  2. Translates the query and filters into LDIMS backend search API parameters
  3. Executes search using MySQL FULLTEXT search capabilities
  4. Formats and returns results with relevance scores and metadata
  5. Optionally extracts and includes matching context snippets

## 5. 用户场景实现方案

### 5.1. 场景一: 用户通过自然语言，让 LLM 通过 MCP 查找到是否有相关内容，并且返回相关的文档名称。

1.  用户向 LLM 提供自然语言描述（例如："查找关于去年第四季度销售策略的文档"）。
2.  LLM 将此描述作为 `query` 参数，调用 MCP 服务的 `searchDocuments` **Tool**。
3.  MCP 服务执行搜索，并将匹配的文档列表（包含文档名称和 ID）返回给 LLM。
4.  LLM 将文档名称呈现给用户。

### 5.2. 场景二: 用户通过自然语言询问包含在某个文档中的内容，但并不知道文档名字。MCP 服务需要通过 LLM 提供答案和文档名称。

**推荐方案 (两步法，LLM 主导问答):**

1.  **文档定位**:
    - 用户向 LLM 提出自然语言问题（例如："我们的客户服务改进计划中提到了哪些关键指标？"）。
    - LLM 将此问题作为 `query` 参数，调用 MCP 服务的 `searchDocuments` **Tool**。
    - MCP 服务返回最相关的文档列表。
2.  **内容获取与问答**:
    - LLM 根据 `searchDocuments` 返回的结果，可能会向用户确认具体是哪个文档，或者自行选择最相关的一个（或多个）文档。
    - 对于选定的文档 (假设其 ID 为 `{selected_document_id}`), LLM 通过 MCP 客户端调用 `readResource` 方法，请求 URI `ldims://docs/{selected_document_id}/extracted_content` 来获取该文档的完整提取内容。
    - MCP 服务通过 `extracted_content` **Resource** 返回文档内容。
    - LLM 接收到文档内容后，结合用户的原始问题，利用其自身的理解和生成能力来生成答案。
    - LLM 将生成的答案连同来源文档名称 (从 `searchDocuments` 结果或通过其他方式获取) 一并返回给用户。

**未来可考虑的优化:**

- 可以开发一个更高级的 `Tool`，例如 `answerQuestionFromDocument`，输入 `documentId` 和 `question`，由 MCP 服务器（可能再次调用 LLM）来直接生成基于特定文档内容的答案。

## 6. 对 LDIMS 后端的要求

- **文档唯一标识符**: 需要有稳定可靠的 `document_id`。

- **内容提取 API (需要新增/增强)**:

  - 需要提供一个**新的、高效的 API 端点**，允许根据文件 ID (`file_id`) 直接获取单个 `DocumentFile` 的完整信息，特别是 `extractedContent` 字段（当 `processingStatus` 为 'completed' 时）。例如: `GET /api/document-files/:file_id/content` 或 `GET /api/document-files/:file_id` 返回包含 `extractedContent` 的完整对象。
  - _或者_，可考虑增强现有 `GET /api/documents/:id` 接口（即 `DocumentService.info()`），使其能够选择性地在其返回的关联文件对象 (`SimplifiedDocumentFile`) 中包含 `extractedContent` 字段。

- **内容搜索 API (需要新增/增强)**:

  - 需要提供一个**新的 API 端点**，或者**显著增强**现有的 `GET /api/documents/` 搜索接口（即 `DocumentService.list()`），以支持对 `document_files.extracted_content` 列进行高效的全文搜索。
  - 此接口应能接受自然语言查询或关键词。
  - 返回结果应为匹配的文档列表（包含 `documentId`, `documentName`），理想情况下能提供相关度排序。

- **API 效率与数据库优化**:

  - 上述新增/增强的 API 必须设计为高效的，特别是在处理大量数据和高并发请求时。
  - 后端数据库配置需要进行检查和优化，以支持高效的全文搜索。
  - （此处的具体建议已移至下面的"数据库配置现状与建议"小节）

- **数据库配置现状与建议 (基于 `ldims_db_new.sql`)**:

  - **数据库类型**: 系统后端使用 MySQL 数据库。
