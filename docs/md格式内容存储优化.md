# Markdown 格式内容存储优化方案

## 1. 现状分析
- MarkItDown 可将可解析文档（DOCX、含文本层 PDF 等）直接转换为 Markdown，并存入 `document_files.extracted_content`。
- 对纯图像 PDF、扫描件或图片文件，脚本使用 **PaddleOCR** 仅输出纯文本，Markdown 语法与布局信息（标题、列表、表格）全部丢失。
- 表格在 OCR 流程中被拆分为连续文字，无法还原为结构化数据。
- 当前数据库列类型为 `TEXT`，当内容较长或需要结构化查询时效率受限。

## 2. 优化目标
1. 所有文件统一生成 **高质量 Markdown**。
2. 自动提取表格、标题、段落等结构信息，并转换为 Markdown 表格语法。
3. 同步保存 **结构化 JSON**，便于全文检索、向量化与二次加工。
4. 支持长文档分页/分块存储，减轻单行 `LONGTEXT` 读取压力。
5. 保证可追溯：原文件 → 解析/OCR → Markdown & JSON。

## 3. 关键技术路线
### 3.1 引入 PP-Structure / PP-ChatOCR
- 升级 `paddleocr`，启用 `PPStructure` 或 `PPChatOCRv4Doc` 管线。
- 当文件需 OCR 时：
  1. 初始化 `structure_system = PPStructure(layout=True, table=True, ocr=True, ...)`
  2. 遍历结果节点区分 **text / heading / table / image**。
  3. 表格节点使用 `table2csv` 再转 Markdown 表格。

### 3.2 Markdown 构建策略
- **段落**：原文字 + 空行。
- **标题**：按字号/置信度映射 `#`-`###`。
- **表格**：基于二维数组生成 `| col1 | col2 |` 样式表格。
- **图像**：裁剪后上传对象存储，Markdown 引用 `![alt](url)`。
## 4. 数据库存储优化
| 字段 | 类型 | 说明 |
|------|------|------|
| extracted_content | LONGTEXT | 完整 Markdown |
| structured_json   | JSON     | 段落数组、表格数组、图片元数据等 |
| char_count        | INT      | 字符计数便于统计 |

- 为 `extracted_content` 建立 **FULLTEXT** 索引（InnoDB ≥5.7）。
- 对 `structured_json` 常用路径，创建 **虚拟列 + BTree** 索引，如 `page_num`、`table_count`。

## 5. 实施步骤
1. **依赖升级**
   `pip install -U paddleocr paddlepaddle`
2. **脚本改造**
   - 保留 MarkItDown 流程
   - 新增 `process_with_ppstructure()`
   - 统一 Markdown 构建与 JSON 输出
3. **数据库迁移**
   ```sql
   ALTER TABLE document_files
     ADD COLUMN structured_json JSON NULL,
     MODIFY extracted_content LONGTEXT;
   ```
4. **历史数据回填**：批量重跑 OCR，经 Worker 分批写回。
5. **监控与回退**：记录脚本版本号，异常可回滚旧字段。

## 6. 风险与应对
- **OCR 精度不足**：对低置信度文本高亮，增加人工校对流程。
- **性能开销**：表格解析耗时，使用 BullMQ 队列并发 + 结果缓存。
- **数据量激增**：单文档建议 <10 MB；超出时分页存储至 `document_pages` 子表。
