import { Op, WhereOptions, Order, Transaction } from "sequelize";
import sequelize from "../config/database";
import { fn, col, literal } from "sequelize";
import path from "path";
import fs from "fs/promises";
import Document from "../models/Document";
import DocumentFile from "../models/DocumentFile";
import User from "../models/User";
import DocType from "../models/DocType";
import Department from "../models/Department";
import sanitizeFilename from "sanitize-filename"; // 引入 sanitize-filename
import {
  DocumentInfo,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DocumentListQuery,
  SimplifiedDocumentFile, // 导入简化的文件类型
  DocumentContentSearchQuery,
  DocumentFileContentResponse,
} from "../types/document.d";
import { OperationLogService } from "./OperationLogService";
import { OperationType } from "@ldims/types";
import { Request } from "express";
import { getStoragePath } from "../config/storage";
import { contentExtractionQueue } from "../queues/contentExtractionQueue"; // <--- 导入 BullMQ 队列
import { logger } from "../utils/logger";
// 假设有一个任务队列服务接口或类
// import { TaskQueueService } from './TaskQueueService';

// 辅助函数：净化名称，移除或替换非法字符，并限制长度
const sanitizeName = (name: string, maxLength: number = 200): string => {
  // 1. 使用 sanitize-filename 库处理基本非法字符
  const sanitized = sanitizeFilename(name, { replacement: "_" }); // 使用下划线替换
  // 2. 移除可能的多余的点或下划线
  const cleaned = sanitized.replace(/[_.]+/g, "_").replace(/^_+|_+$/g, "");
  // 3. 截断到指定长度
  return cleaned.slice(0, maxLength);
};

// 新增：尝试修复可能的文件名乱码 (latin1 -> utf8)
const fixEncodingIssue = (originalName: string): string => {
  try {
    // 一个简单的检测：如果包含非ASCII字符但用 Buffer.from(name, 'utf8').toString('latin1') 后不含非ASCII高位字符，则可能是误编码
    // 或者直接检查是否包含典型的 latin1 误编码模式 (可能不完全准确)
    // 简化检测：如果包含非扩展 ASCII 字符，就尝试转换
    // 注意：这可能错误地转换本身就是 latin1 的文件名，但中文场景下更可能需要转换
    if (/[^\x00-ÿ]/.test(originalName)) {
      // 包含非 Latin1 字符，可能已经是 UTF8，直接返回
      return originalName;
    }
    // 如果只包含 Latin1 字符，但我们怀疑它是错误编码的 UTF8，则尝试转换
    // （这种检测逻辑比较粗糙，需要根据实际情况调整）
    const suspectedUtf8Buffer = Buffer.from(originalName, "latin1");
    const reEncodedUtf8 = suspectedUtf8Buffer.toString("utf8");

    // 检查转换后的结果是否包含有效的多字节 UTF8 字符 (一个简单的启发式方法)
    if (reEncodedUtf8 !== originalName && /[^\x00-]/.test(reEncodedUtf8)) {
      console.warn(
        `[fixEncodingIssue] Potential encoding issue detected for: "${originalName}". Converted to UTF-8: "${reEncodedUtf8}"`
      );
      return reEncodedUtf8;
    }

    // 如果转换后无变化或不包含多字节字符，认为原始的就是正确的 (或无法修复)
    return originalName;
  } catch (error) {
    console.error(
      `[fixEncodingIssue] Error during encoding fix for ${originalName}:`,
      error
    );
    return originalName; // 出错时返回原始名称
  }
};

/**
 * @class DocumentService
 * @classdesc 提供文档信息管理的服务 (使用 Sequelize)
 */
export class DocumentService {
  /**
   * @description 创建新文档 (使用 Sequelize)
   * @param {CreateDocumentRequest} data - 创建数据
   * @param {string | null} creatorName - 创建者姓名/标识符
   * @param {Request} [req] - Express请求对象，用于记录日志
   * @returns {Promise<Document>} 返回创建的 Sequelize 文档实例
   */
  async create(
    data: CreateDocumentRequest,
    creatorName: string | null,
    req?: Request
  ): Promise<Document> {
    console.debug(
      "[DocumentService] create called with data:",
      JSON.stringify(data)
    );

    // 假设请求类型中有 sourceDepartmentId
    const { docTypeId, sourceDepartmentId, ...restData } = data;

    let docTypeName: string | undefined = undefined;
    let sourceDepartmentName: string | undefined = undefined;

    // --- 使用 Sequelize 查找名称 ---
    if (docTypeId) {
      const docType = await DocType.findByPk(docTypeId);
      if (!docType) {
        console.warn(
          `[DocumentService] DocType with ID ${docTypeId} not found during creation.`
        );
      } else {
        docTypeName = docType.name;
      }
    }
    if (sourceDepartmentId) {
      const department = await Department.findByPk(sourceDepartmentId);
      if (!department) {
        console.warn(
          `[DocumentService] Department with ID ${sourceDepartmentId} not found during creation.`
        );
      } else {
        sourceDepartmentName = department.name;
      }
    }
    console.debug(
      `[DocumentService] Looked up names: type='${docTypeName}', department='${sourceDepartmentName}'`
    );

    try {
      // 准备 Sequelize 创建数据
      const documentData = {
        ...restData,
        docTypeName: docTypeName, // 存储名称 (假设模型已更新或将更新)
        sourceDepartmentName: sourceDepartmentName, // 存储名称 (假设模型已更新或将更新)
        createdBy: creatorName, // 使用传入的 creatorName
        // 不再存储 docTypeId, sourceDepartmentId
      };

      // 修正：需要明确告知 TS 我们添加了新字段，或等待模型更新
      console.debug(
        "[DocumentService] Sequelize create args:",
        JSON.stringify(documentData)
      );
      const newDocument = await Document.create(documentData as any); // 使用 as any 暂时绕过类型检查
      console.debug(
        "[DocumentService] Document created successfully:",
        newDocument.id
      );

      // 记录操作日志
      if (req) {
        await OperationLogService.logFromRequest(
          req,
          OperationType.DOCUMENT_CREATE,
          `创建文档: ${data.docName}`
        );
      }

      return newDocument;
    } catch (error) {
      console.error("[DocumentService] Error creating document:", error);
      // 修正：检查 Sequelize 错误类型
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to create document: ${message}`);
    }
  }

  /**
   * @description 更新文档信息 (使用 Sequelize)
   * @param {number} id - 文档ID
   * @param {UpdateDocumentRequest} data - 更新数据
   * @param {string | null} updaterName - 操作用户姓名/标识符
   * @param {Request} [req] - Express请求对象，用于记录日志
   * @returns {Promise<Document | null>} 返回更新后的 Sequelize 文档实例，如果未找到则返回 null
   */
  async update(
    id: number,
    data: UpdateDocumentRequest,
    updaterName: string | null,
    req?: Request
  ): Promise<Document | null> {
    console.debug(
      `[DocumentService] update called for ID ${id} with data:`,
      JSON.stringify(data)
    );
    const { docTypeId, sourceDepartmentId, ...restData } = data; // 假设 DTO 使用 sourceDepartmentId

    const document = await Document.findByPk(id);
    if (!document) {
      console.warn(
        `[DocumentService] Document with ID ${id} not found for update.`
      );
      return null;
    }

    let namesToUpdate: {
      docTypeName?: string | null;
      sourceDepartmentName?: string | null;
    } = {};

    // --- 使用 Sequelize 查找名称 ---
    if (docTypeId !== undefined) {
      if (docTypeId === null) {
        namesToUpdate.docTypeName = null;
      } else {
        const docType = await DocType.findByPk(docTypeId);
        if (!docType) {
          console.warn(
            `[DocumentService] DocType with ID ${docTypeId} not found during update.`
          );
          namesToUpdate.docTypeName = null;
        } else {
          namesToUpdate.docTypeName = docType.name;
        }
      }
    }

    if (sourceDepartmentId !== undefined) {
      if (sourceDepartmentId === null) {
        namesToUpdate.sourceDepartmentName = null;
      } else {
        const department = await Department.findByPk(sourceDepartmentId);
        if (!department) {
          console.warn(
            `[DocumentService] Department with ID ${sourceDepartmentId} not found during update.`
          );
          namesToUpdate.sourceDepartmentName = null;
        } else {
          namesToUpdate.sourceDepartmentName = department.name;
        }
      }
    }

    console.debug(
      `[DocumentService] Data to update:`,
      JSON.stringify(restData)
    );
    console.debug(
      `[DocumentService] Names to update:`,
      JSON.stringify(namesToUpdate)
    );

    try {
      // 更新实例属性
      Object.assign(document, restData);
      // 显式更新名称字段 (假设模型将更新)
      (document as any).docTypeName =
        namesToUpdate.docTypeName !== undefined
          ? namesToUpdate.docTypeName
          : (document as any).docTypeName;
      (document as any).sourceDepartmentName =
        namesToUpdate.sourceDepartmentName !== undefined
          ? namesToUpdate.sourceDepartmentName
          : (document as any).sourceDepartmentName;
      document.updatedBy = updaterName; // 使用传入的 updaterName

      await document.save();
      console.debug(
        "[DocumentService] Document updated successfully:",
        document.id
      );

      // 记录操作日志
      if (req) {
        await OperationLogService.logFromRequest(
          req,
          OperationType.DOCUMENT_UPDATE,
          `更新文档: ${document.docName}(ID: ${id})`
        );
      }

      return document;
    } catch (error) {
      console.error(`[DocumentService] Error updating document ${id}:`, error);
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to update document: ${message}`);
    }
  }

  /**
   * @description 删除文档 (软删除 - 假设模型配置了 paranoid: true)
   * @param {number} id - 文档ID
   * @param {string | null} [deleterName] - 操作用户ID (可选)
   * @param {Request} [req] - Express请求对象，用于记录日志
   * @returns {Promise<boolean>} 返回是否删除成功 (影响的行数 > 0)
   */
  async delete(
    id: number,
    deleterName?: string | null,
    req?: Request
  ): Promise<boolean> {
    console.debug(
      `[DocumentService] delete called for ID ${id} by ${deleterName}`
    );
    try {
      // 记录文档名称用于日志
      const document = await Document.findByPk(id);
      if (!document) {
        console.warn(
          `[DocumentService] Document with ID ${id} not found or already deleted.`
        );
        return false;
      }

      const docName = document.docName;

      // Sequelize 的 destroy 配合 paranoid: true 实现软删除
      const affectedRows = await Document.destroy({ where: { id } });
      if (affectedRows > 0) {
        console.debug(
          `[DocumentService] Document soft deleted successfully: ID ${id}`
        );
        // 可选：记录删除者，如果模型有 deletedBy 字段
        // await Document.update({ deletedBy: deleterName }, { where: { id }, paranoid: false });

        // 记录操作日志
        if (req) {
          await OperationLogService.logFromRequest(
            req,
            OperationType.DOCUMENT_DELETE,
            `删除文档: ${docName}(ID: ${id})`
          );
        }

        return true;
      } else {
        console.warn(
          `[DocumentService] Document with ID ${id} not found or already deleted.`
        );
        return false;
      }
    } catch (error: any) {
      console.error(`Error deleting document ${id}:`, error);
      throw new Error(`删除文档失败: ${error.message}`);
    }
  }

  /**
   * @description 获取单个文档详情 (使用 Sequelize)，包含关联文件信息
   * @param {number} id - 文档ID
   * @returns {Promise<DocumentInfo | null>} 返回文档详情 (DTO 格式)，如果未找到则返回 null
   */
  async info(id: number): Promise<DocumentInfo | null> {
    console.debug(`[DocumentService] info called for ID ${id}`);
    try {
      const document = await Document.findByPk(id, {
        attributes: [
          "id",
          "docName",
          "docTypeName",
          "sourceDepartmentName",
          "submitter",
          "receiver",
          "signer",
          "storageLocation",
          "remarks",
          "handoverDate",
          "createdBy",
          "updatedBy",
          "createdAt",
          "updatedAt",
        ],
        include: [
          {
            model: DocumentFile,
            as: "documentFiles", // 确保与模型定义中的别名一致
            attributes: [
              // 指定需要加载的文件属性
              "id",
              "fileName",
              "fileType",
              "fileSize",
              "sequence",
              "processingStatus",
              "createdAt",
              "updatedAt",
            ],
            required: false, // 使用 LEFT JOIN 即使没有文件也返回文档信息
            order: [["sequence", "ASC"]], // 按顺序排列文件
          },
        ],
        // paranoid: true 查询默认排除已删除
      });

      if (!document) {
        console.warn(`[DocumentService] Document with ID ${id} not found.`);
        return null;
      }

      // 调用更新后的 formatDocumentInfo 来包含文件信息
      return this.formatDocumentInfo(document);
    } catch (error: any) {
      console.error(`Error fetching document info ${id}:`, error);
      throw new Error(`获取文档详情失败: ${error.message}`);
    }
  }

  /**
   * @description 获取文档列表 (使用 Sequelize)，包含文件数量
   * @param {DocumentListQuery} query - 查询参数
   * @returns {Promise<{ list: DocumentInfo[], total: number }>} 返回文档列表 (DTO 格式) 和总数
   */
  async list(
    query: DocumentListQuery
  ): Promise<{ list: DocumentInfo[]; total: number }> {
    console.debug("--- [DocumentService] list method entry ---");
    console.debug(
      "[DocumentService] Received raw query:",
      JSON.stringify(query, null, 2)
    );

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const { limit, offset } = this.getPagination(page, pageSize);

    // 先根据传入的 ID 解析出对应的名称，避免后续 where 条件出现 undefined
    let resolvedDocTypeName: string | undefined;
    if (query.docTypeId) {
      const docType = await DocType.findByPk(query.docTypeId);
      resolvedDocTypeName = docType?.name;
    }

    let resolvedDepartmentName: string | undefined;
    if (query.sourceDepartmentId) {
      const dept = await Department.findByPk(query.sourceDepartmentId);
      resolvedDepartmentName = dept?.name;
    }

    // 构建 Where 条件 (与之前类似)
    const where = this.buildListWhereClause({
      ...query,
      docTypeName: resolvedDocTypeName ?? query.docTypeName,
      departmentName: resolvedDepartmentName ?? query.departmentName,
    } as DocumentListQuery);

    // 构建 Order 条件 (与之前类似)
    const order = this.buildListOrderClause(query);

    console.debug(
      "[DocumentService] Constructed WHERE clause:",
      JSON.stringify(where, null, 2)
    );
    console.debug(
      "[DocumentService] Constructed ORDER clause:",
      JSON.stringify(order)
    );

    // Sequelize 查询选项
    const findOptions: any = {
      where: where,
      attributes: [
        // 选择 Document 模型的所有属性
        ...Object.keys(Document.getAttributes()),
        // 添加文件计数字段
        [fn("COUNT", col("documentFiles.id")), "fileCount"],
      ],
      include: [
        {
          model: DocumentFile,
          as: "documentFiles",
          attributes: [], // 不需要在顶层结果中包含文件具体信息，只需要计数
          required: false, // 使用 LEFT JOIN 即使没有文件也返回文档
          duplicating: false, // 重要：与 group 和 limit 一起使用时防止重复计数问题
        },
      ],
      group: ["Document.id"], // 按文档 ID 分组以正确计数
      order: order,
      subQuery: false, // 必须设置 false 当 include 与 limit/offset 和 group 一起使用时，以正确应用 limit
    };

    // 应用分页 (如果需要)
    if (pageSize > 0) {
      findOptions.limit = limit;
      findOptions.offset = offset;
    }

    try {
      console.debug(
        "[DocumentService] Executing findAndCountAll...",
        findOptions
      );
      // 注意：当使用 group 时，findAndCountAll 的 count 可能不是预期的总文档数，
      // 而是分组的数量。我们需要单独计算总数。

      // 1. 先计算符合条件的总文档数 (不分组，不分页)
      const totalCount = await Document.count({ where: where });

      // 2. 再查询分页后的数据 (带分组和计数)
      const result = await Document.findAll(findOptions);

      console.debug(
        `[DocumentService] Found ${result.length} documents for the current page.`
      );

      // 格式化结果，包含 fileCount
      const list = result.map((doc: any) => {
        const formattedDoc = this.formatDocumentInfo(doc);
        // 从原始查询结果中获取 fileCount (Sequelize 会将其放在 dataValues 中)
        formattedDoc.fileCount = parseInt(
          doc.getDataValue("fileCount") || "0",
          10
        );
        return formattedDoc;
      });

      console.debug("--- [DocumentService] list method exit ---");
      return { list, total: totalCount }; // 返回分页数据和正确的总数
    } catch (error: any) {
      console.error(
        "[DocumentService] Error during findAndCountAll/findAll:",
        error
      );
      console.debug("--- [DocumentService] list method exit (with error) ---");
      throw new Error(`获取文档列表失败: ${error.message}`);
    }
  }

  // 辅助方法：获取分页参数
  private getPagination(
    page: number,
    pageSize: number
  ): { limit: number; offset: number } {
    let pageNum = parseInt(String(page), 10);
    let pageSizeNum = parseInt(String(pageSize), 10);
    if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
    if (isNaN(pageSizeNum) || pageSizeNum < 1)
      pageSizeNum = 10; // 默认 pageSize 10
    else if (pageSizeNum > 1000) pageSizeNum = 1000;

    const offset = (pageNum - 1) * pageSizeNum;
    const limit = pageSizeNum > 0 ? pageSizeNum : -1; // pageSize <= 0 表示获取所有

    return { limit: limit > 0 ? limit : 999999, offset }; // 如果 limit 是 -1，Sequelize 可能需要一个大数字
  }

  // 辅助方法：构建列表查询的 Where 子句
  private buildListWhereClause(
    query: DocumentListQuery
  ): WhereOptions<Document> {
    const where: WhereOptions<Document> = {};
    if (query.docName) where.docName = { [Op.like]: `%${query.docName}%` };
    if (query.submitter)
      where.submitter = { [Op.like]: `%${query.submitter}%` };
    if (query.receiver) where.receiver = { [Op.like]: `%${query.receiver}%` };
    if (query.signer) where.signer = { [Op.like]: `%${query.signer}%` };

    // 处理文档类型过滤
    if (query.docTypeId) {
      // 如果已经解析到名称才写入 where，避免 undefined
      if (query.docTypeName) {
        where.docTypeName = query.docTypeName;
      }
    } else if (query.docTypeNameFilter) {
      where.docTypeName = { [Op.like]: `%${query.docTypeNameFilter}%` };
    }

    // 处理来源部门过滤
    if (query.sourceDepartmentId) {
      if (query.departmentName) {
        where.sourceDepartmentName = query.departmentName;
      }
    } else if (query.sourceDepartmentNameFilter) {
      where.sourceDepartmentName = {
        [Op.like]: `%${query.sourceDepartmentNameFilter}%`,
      };
    }

    // 处理交接日期范围
    if (query.handoverStartDate && query.handoverEndDate) {
      where.handoverDate = {
        [Op.between]: [query.handoverStartDate, query.handoverEndDate],
      };
    } else if (query.handoverStartDate) {
      where.handoverDate = { [Op.gte]: query.handoverStartDate };
    } else if (query.handoverEndDate) {
      where.handoverDate = { [Op.lte]: query.handoverEndDate };
    }

    return where;
  }

  // 辅助方法：构建列表查询的 Order 子句
  private buildListOrderClause(query: DocumentListQuery): Order {
    let order: Order = [["createdAt", "DESC"]];
    const allowedSortFields = ["id", "docName", "handoverDate", "createdAt"]; // 添加更多允许排序的字段
    if (query.sortField && allowedSortFields.includes(query.sortField)) {
      const sortOrder = query.sortOrder === "DESC" ? "DESC" : "ASC";
      // 需要确保排序字段属于主表 Document，否则需要指定关联
      order = [[query.sortField, sortOrder]];
    }
    return order;
  }

  /**
   * @description 格式化从数据库获取的文档信息为前端所需的格式，可能包含文件列表或文件计数
   * @param document Sequelize 文档模型实例 (可能已加载 documentFiles 关联或包含 fileCount)
   * @returns {DocumentInfo} 格式化后的文档信息对象
   * @public
   */
  public formatDocumentInfo(document: Document | any): DocumentInfo {
    // 允许 any 以处理 fileCount
    // 格式化关联的文件信息 (如果存在)
    const files: SimplifiedDocumentFile[] = (
      (document.documentFiles || []) as DocumentFile[]
    ).map((file) => ({
      id: file.id,
      fileName: file.fileName,
      fileType: file.fileType,
      fileSize: file.fileSize,
      sequence: file.sequence,
      processingStatus: file.processingStatus,
      extractedContent: file.extractedContent,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    }));

    const info: DocumentInfo = {
      id: document.id,
      docName: document.docName,
      docTypeName: document.docTypeName,
      departmentName: document.sourceDepartmentName,
      submitter: document.submitter,
      receiver: document.receiver,
      signer: document.signer,
      storageLocation: document.storageLocation,
      remarks: document.remarks,
      handoverDate: document.handoverDate,
      createdByName: document.createdBy,
      updatedBy: document.updatedBy,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      files: files.length > 0 ? files : undefined, // 只有加载了才包含 files 数组
      // fileCount 会在 list 方法中单独添加
    };

    // 如果 doc 包含 fileCount (来自 list 查询), 添加它
    // Sequelize 将聚合结果放在 dataValues 中
    if (document.dataValues && document.dataValues.fileCount !== undefined) {
      info.fileCount = parseInt(document.dataValues.fileCount, 10);
    }

    return info;
  }

  /**
   * @description 根据 ID 列表获取文档详情
   * @param {number[]} ids - 文档 ID 数组
   * @returns {Promise<DocumentInfo[]>}
   */
  async getByIds(ids: number[]): Promise<DocumentInfo[]> {
    console.debug(`[DocumentService] getByIds called with IDs:`, ids);
    if (!ids || ids.length === 0) {
      return [];
    }

    try {
      // 构建 include 配置 (与 list 方法保持一致)
      const include = [
        {
          model: DocType,
          attributes: ["name"], // 只获取名称
          required: false, // 使用 LEFT JOIN
        },
        {
          model: Department,
          as: "sourceDepartment", // 使用别名
          attributes: ["name"],
          required: false,
        },
        {
          model: User,
          as: "creator", // 假设关联别名是 creator
          attributes: ["username"], // 获取用户名
          required: false,
        },
        {
          model: User,
          as: "updater", // 假设关联别名是 updater
          attributes: ["username"], // 获取用户名
          required: false,
        },
      ];

      const documents = await Document.findAll({
        attributes: [
          "id",
          "docName",
          "submitter",
          "receiver",
          "signer",
          "storageLocation",
          "remarks",
          "handoverDate",
          "createdBy",
          "updatedBy",
          "createdAt",
          "updatedAt",
        ],
        where: {
          id: { [Op.in]: ids },
        },
        include: include,
        // 导出选中项时通常不需要特定排序，按 ID 默认排序即可
      });

      console.debug(
        `[DocumentService] Found ${documents.length} documents by IDs.`
      );

      // 添加日志：检查从 findAll 返回的原始文档的 sourceDepartmentName
      console.debug("[DocumentService] Raw documents from findAll (getByIds):");
      documents.forEach((doc, index) => {
        // 直接打印原始 Sequelize 实例上的值
        console.debug(
          `  Doc ${index}: ID=${doc.id}, sourceDepartmentName='${doc.get(
            "sourceDepartmentName"
          )}'`
        );
      });

      // 格式化结果
      const list = documents.map((doc) => this.formatDocumentInfo(doc));

      return list;
    } catch (error: any) {
      console.error(
        `[DocumentService] Error fetching documents by IDs:`,
        error
      );
      throw new Error(`根据 ID 获取文档失败: ${error.message}`);
    }
  }

  /**
   * @description 删除指定文档关联的所有文件记录和物理文件。
   *              此方法应在一个事务中执行。
   * @param {number} documentId - 文档 ID。
   * @param {Transaction} [transaction] - 可选的外部事务。
   * @param {string} [docNameForPath] - 文档名，用于确定要删除的子文件夹路径。
   * @returns {Promise<void>}
   * @throws 如果数据库操作或文件删除失败，则抛出错误。
   */
  async deleteAllFilesForDocument(
    documentId: number,
    transaction?: Transaction,
    docNameForPath?: string // 新增参数，用于删除文件夹
  ): Promise<void> {
    console.debug(
      `[DocumentService] deleteAllFilesForDocument called for document ID ${documentId}`
    );
    const t = transaction || (await sequelize.transaction());
    let documentFolderPath: string | null = null; // 用于存储文档文件夹路径

    try {
      const filesToDelete = await DocumentFile.findAll({
        where: { documentId },
        transaction: t,
        attributes: ["id", "filePath"],
      });

      const storageRoot = await getStoragePath();
      let folderPathToDelete: string | null = null;

      // 如果传入了 docNameForPath，计算文件夹路径
      if (docNameForPath) {
        const sanitizedDocName = sanitizeName(docNameForPath);
        if (sanitizedDocName) {
          folderPathToDelete = path.join(storageRoot, sanitizedDocName);
          console.debug(
            `[DocumentService] Target folder path for deletion: ${folderPathToDelete}`
          );
        }
      }

      if (filesToDelete.length > 0) {
        console.debug(
          `[DocumentService] Found ${filesToDelete.length} files to delete for document ID ${documentId}.`
        );

        const deletePromises = filesToDelete.map(async (file) => {
          if (!file.filePath) return;
          const fullPath = path.join(storageRoot, file.filePath);
          try {
            await fs.unlink(fullPath);
            console.debug(
              `[DocumentService] Deleted physical file: ${fullPath}`
            );
          } catch (error: any) {
            if (error.code === "ENOENT") {
              console.warn(
                `[DocumentService] Physical file not found, skipping delete: ${fullPath}`
              );
            } else {
              console.error(
                `[DocumentService] Failed to delete physical file ${fullPath}:`,
                error
              );
              // 考虑是否抛出错误
            }
          }
        });
        await Promise.all(deletePromises);

        const deletedDbRows = await DocumentFile.destroy({
          where: {
            documentId: documentId,
          },
          transaction: t,
        });
        console.debug(
          `[DocumentService] Deleted ${deletedDbRows} file records from DB for document ID ${documentId}.`
        );
      } else {
        console.debug(
          `[DocumentService] No associated files found for document ID ${documentId}. No files to delete.`
        );
      }

      // 尝试删除文档子文件夹（仅当文件夹路径确定且为空时）
      if (folderPathToDelete) {
        try {
          await fs.rmdir(folderPathToDelete);
          console.debug(
            `[DocumentService] Successfully removed empty document folder: ${folderPathToDelete}`
          );
        } catch (rmdirError: any) {
          // 如果删除失败（例如目录非空或其他原因），记录警告，但不认为是关键错误
          if (rmdirError.code === "ENOENT") {
            console.warn(
              `[DocumentService] Document folder not found, skipping removal: ${folderPathToDelete}`
            );
          } else {
            console.warn(
              `[DocumentService] Failed to remove document folder (may not be empty): ${folderPathToDelete}`,
              rmdirError
            );
          }
        }
      }

      if (!transaction) {
        await t.commit();
        console.debug(
          `[DocumentService] deleteAllFilesForDocument transaction committed for document ID ${documentId}.`
        );
      }
    } catch (error: any) {
      if (!transaction) {
        await t.rollback();
        console.error(
          `[DocumentService] deleteAllFilesForDocument transaction rolled back for document ID ${documentId}:`,
          error
        );
      }
      throw new Error(
        `Failed to delete all files for document ${documentId}: ${error.message}`
      );
    }
  }

  /**
   * @description 上传一批新的文件替换指定文档的所有旧文件。
   *              此方法在一个事务中执行 "先删后增"。
   *              文件将被存储在 `[存储根路径]/[净化后文档名]/序号_净化后原始文件名(截断)_时间戳.ext`
   * @param {number} documentId - 文档 ID。
   * @param {Express.Multer.File[]} uploadedFiles - Multer 处理后的文件信息数组 (已保存到临时路径)。
   * @returns {Promise<DocumentFile[]>} 返回创建的 DocumentFile 实例数组。
   * @throws 如果文档不存在、文件处理失败或数据库操作失败，则抛出错误。
   */
  async uploadAndReplaceFiles(
    documentId: number,
    uploadedFiles: Express.Multer.File[]
  ): Promise<DocumentFile[]> {
    console.debug(
      `[DocumentService] uploadAndReplaceFiles called for document ID ${documentId} with ${uploadedFiles.length} files.`
    );

    const document = await Document.findByPk(documentId, {
      attributes: ["id", "docName"], // 需要 docName 来创建文件夹
    });

    if (!document) {
      // 清理 Multer 上传的临时文件
      await this.cleanupTemporaryFiles(uploadedFiles);
      throw new Error(`Document with ID ${documentId} not found.`);
    }

    const sanitizedDocName = sanitizeName(document.docName);
    if (!sanitizedDocName) {
      // 如果文档名净化后为空，无法创建文件夹
      await this.cleanupTemporaryFiles(uploadedFiles);
      throw new Error(
        `Invalid document name for creating storage folder: ${document.docName}`
      );
    }

    const t = await sequelize.transaction();
    const createdFileRecords: DocumentFile[] = [];
    const storageRoot = await getStoragePath();
    const documentFolderPath = path.join(storageRoot, sanitizedDocName);
    const MAX_FILENAME_BASE_LENGTH = 180; // 为序号、时间戳、分隔符和扩展名留出余量

    try {
      // 1. 删除旧文件和记录 (传递文档名用于删除旧文件夹)
      await this.deleteAllFilesForDocument(documentId, t, document.docName);
      console.debug(
        `[DocumentService] Old files and folder potentially cleaned for document ID ${documentId}.`
      );

      // 2. 确保新的文档子文件夹存在
      await fs.mkdir(documentFolderPath, { recursive: true });
      logger.debug(
        `[DocumentService] Ensured document folder exists for document ID ${documentId}.`
      );

      // 3. 处理并移动新文件
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const sequence = i;

        // 获取文件扩展名 (仍需从原始文件名获取)
        const originalName = file.originalname;
        const fixedOriginalName = fixEncodingIssue(originalName); // 保留修复逻辑以正确获取扩展名
        const extension = path.extname(fixedOriginalName);

        // 使用文档名生成文件名基础部分
        const docName = document.docName;
        const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
        // 注意：这里的 sanitizedDocName 是文件夹名，我们用文档名生成净化后的文件名基础
        const sanitizedDocNameBase = sanitizeName(
          docName,
          MAX_FILENAME_BASE_LENGTH
        );

        // 构建最终存储文件名 (基于文档名)
        const finalFilename = `${sequence}_${sanitizedDocNameBase}_${timestamp}${extension}`;
        // 文件夹路径使用之前净化过的文档名 sanitizedDocName
        const finalRelativePath = path.join(sanitizedDocName, finalFilename);
        const finalFullPath = path.join(storageRoot, finalRelativePath);

        logger.info(
          `[DocumentService] Processing uploaded file #${sequence} for document ID ${documentId}: mimetype=${file.mimetype}, size=${file.size}`
        );

        // 将 Multer 保存的临时文件重命名/移动到最终位置
        try {
          await fs.rename(file.path, finalFullPath);
          logger.info(
            `[DocumentService] Uploaded file #${sequence} moved to managed storage for document ID ${documentId}.`
          );
        } catch (renameError) {
          logger.error(
            `[DocumentService] Failed to move uploaded file #${sequence} for document ID ${documentId}:`,
            renameError
          );
          throw new Error(
            `Failed to move uploaded file #${sequence}: ${
              (renameError as Error).message
            }`
          );
        }

        // 创建数据库记录
        const fileData = {
          documentId: documentId,
          fileName: finalFilename, // 存储基于文档名生成的最终文件名
          filePath: finalRelativePath,
          fileType: file.mimetype,
          fileSize: file.size,
          sequence: sequence,
          processingStatus: "pending" as const,
        };
        logger.debug(
          `[DocumentService] Creating DocumentFile record for document ID ${documentId}, file #${sequence}.`
        );
        const newFileRecord = await DocumentFile.create(fileData, {
          transaction: t,
        });
        createdFileRecords.push(newFileRecord);
      }

      logger.info(
        `[DocumentService] ${createdFileRecords.length} new file records created and files moved for document ID ${documentId}.`
      );

      // 4. 提交事务
      await t.commit();
      logger.debug(
        `[DocumentService] uploadAndReplaceFiles transaction committed for document ID ${documentId}.`
      );

      return createdFileRecords;
    } catch (error: any) {
      // 5. 回滚事务
      await t.rollback();
      console.error(
        `[DocumentService] uploadAndReplaceFiles transaction rolled back for document ID ${documentId}:`,
        error
      );

      // 尝试清理本次操作中已移动或创建的文件及文件夹
      await this.cleanupFailedUpload(
        uploadedFiles,
        documentFolderPath,
        createdFileRecords,
        storageRoot
      );

      throw new Error(
        `Failed to upload and replace files for document ${documentId}: ${error.message}`
      );
    }
  }

  // 辅助方法：清理上传的临时文件
  private async cleanupTemporaryFiles(files: Express.Multer.File[]) {
    console.warn(
      "[DocumentService] Cleaning up temporary files due to error before processing."
    );
    const cleanupPromises = files.map((file) =>
      fs
        .unlink(file.path)
        .catch((err) =>
          console.warn(
            "[DocumentService] Failed to cleanup temporary uploaded file:",
            err
          )
        )
    );
    await Promise.all(cleanupPromises);
  }

  // 辅助方法：清理失败的上传操作（已移动的文件和可能创建的文件夹）
  private async cleanupFailedUpload(
    originalFiles: Express.Multer.File[], // 原始 Multer 文件信息（用于日志）
    folderPath: string,
    createdRecords: DocumentFile[],
    storageRoot: string
  ) {
    console.warn(
      "[DocumentService] Cleaning up files and folder due to failed upload transaction."
    );

    // 1. 删除已在数据库中创建记录对应的新文件
    const deleteFilePromises = createdRecords.map((record) => {
      if (!record.filePath) return Promise.resolve();
      const fullPath = path.join(storageRoot, record.filePath);
      return fs
        .unlink(fullPath)
        .catch((err) =>
          console.warn(
            `[DocumentService] Failed to cleanup newly created file record ${record.id} after rollback:`,
            err
          )
        );
    });
    await Promise.all(deleteFilePromises);

    // 2. 尝试删除文档文件夹（如果为空）
    try {
      await fs.rmdir(folderPath);
      console.warn(
        "[DocumentService] Removed document folder after rollback."
      );
    } catch (rmdirError: any) {
      if (rmdirError.code !== "ENOENT" && rmdirError.code !== "ENOTEMPTY") {
        console.warn(
          "[DocumentService] Failed to remove document folder after rollback:",
          rmdirError
        );
      }
    }

    // 3. 尝试删除 Multer 可能遗留的临时文件（以防万一重命名失败但未被捕获）
    await this.cleanupTemporaryFiles(originalFiles);
  }

  /**
   * @description 触发指定文档下状态为 'pending' 的文件的后台处理。
   *              将任务添加到 BullMQ 内容提取队列。
   * @param {number} documentId - 文档 ID。
   * @returns {Promise<{ triggeredCount: number }>} 返回添加到队列的文件数量。
   * @throws 如果文档不存在或添加任务失败，则抛出错误。
   */
  async triggerFileProcessing(
    documentId: number
  ): Promise<{ triggeredCount: number }> {
    console.debug(
      `[DocumentService] triggerFileProcessing called for document ID ${documentId}.`
    );

    // 1. 检查文档是否存在
    const document = await Document.findByPk(documentId, {
      attributes: ["id"],
    });
    if (!document) {
      console.warn(
        `[DocumentService] Document with ID ${documentId} not found when triggering processing.`
      );
      throw new Error(`Document with ID ${documentId} not found.`);
    }

    // 2. 查找所有状态为 'pending' 的关联文件
    const pendingFiles = await DocumentFile.findAll({
      where: {
        documentId: documentId,
        processingStatus: "pending",
      },
      attributes: ["id", "filePath"], // 修改：同时获取 ID 和文件路径
    });

    if (pendingFiles.length === 0) {
      console.log(
        `[DocumentService] No pending files found for document ID ${documentId}. Processing trigger skipped.`
      );
      return { triggeredCount: 0 };
    }

    console.log(
      `[DocumentService] Found ${pendingFiles.length} pending files for document ID ${documentId}. Adding to content extraction queue...`
    );

    // 3. 将任务添加到 BullMQ 队列
    let addedJobsCount = 0;
    const jobPromises = [];

    for (const file of pendingFiles) {
      console.debug(
        `[DocumentService] Adding job for file ID: ${file.id} with path: ${file.filePath}`
      );
      // 检查 filePath 是否存在
      if (!file.filePath) {
        console.warn(
          `[DocumentService] Skipping job for file ID: ${file.id} because filePath is null or empty.`
        );
        continue; // 跳过没有文件路径的记录
      }
      // 添加任务到队列，作业名称 'process-file'，数据包含 fileId 和 filePath
      const jobPromise = contentExtractionQueue
        .add("process-file", { fileId: file.id, filePath: file.filePath }) // 修改：传递 filePath
        .then((job) => {
          console.log(
            `[DocumentService] Job added successfully for file ID: ${file.id}, Job ID: ${job.id}`
          );
          addedJobsCount++;
          // --- 可选：更新状态为 'queued' ---
          // 注意：这会增加一次数据库写入，并且需要 'queued' 状态支持
          // return DocumentFile.update({ processingStatus: 'queued' }, { where: { id: file.id } });
        })
        .catch((error) => {
          console.error(
            `[DocumentService] Failed to add job for file ID: ${file.id}`,
            error
          );
          // 可以选择记录错误，或者如果一个失败则整体失败 (通过抛出错误)
          // throw new Error(`Failed to add job for file ${file.id}: ${error.message}`);
        });
      jobPromises.push(jobPromise);
    }

    try {
      // 等待所有添加任务的操作完成（或部分失败，取决于上面的 catch 逻辑）
      await Promise.all(jobPromises);
      console.log(
        `[DocumentService] Finished adding jobs for document ID ${documentId}. Total added: ${addedJobsCount}`
      );
      // 返回成功添加到队列的数量
      return { triggeredCount: addedJobsCount };
    } catch (error: any) {
      // 如果在 Promise.all 中有任务添加失败并抛出了错误
      console.error(
        `[DocumentService] Error occurred while adding jobs for document ID ${documentId}:`,
        error
      );
      throw new Error(
        `Failed to add all processing jobs for document ${documentId}: ${error.message}`
      );
    }
  }

  /**
   * @description Searches documents based on text content in metadata and extracted file content.
   * @param {DocumentContentSearchQuery} query - Search query parameters including searchText, page, and pageSize.
   * @returns {Promise<{ list: DocumentInfo[], total: number }>} Returns a list of matching documents and the total count.
   */
  async searchDocumentsByContent(
    query: DocumentContentSearchQuery
  ): Promise<{ list: DocumentInfo[]; total: number }> {
    console.debug(
      "--- [DocumentService] searchDocumentsByContent method entry ---"
    );
    console.debug(
      "[DocumentService] Received search query:",
      JSON.stringify(query, null, 2)
    );

    const { searchText, page = 1, pageSize = 10 } = query;
    const { limit, offset } = this.getPagination(page, pageSize);

    if (!searchText || searchText.trim() === "") {
      console.warn(
        "[DocumentService] searchDocumentsByContent called with empty searchText."
      );
      return { list: [], total: 0 };
    }

    // 将搜索文本分割成多个关键词，支持空格分隔
    const keywords = searchText
      .trim()
      .split(/\s+/)
      .filter((keyword) => keyword.length > 0);
    console.debug(`[DocumentService] Search keywords:`, keywords);

    // 为每个关键词创建搜索条件
    const documentMatchConditions = keywords.map((keyword) => {
      const keywordEscaped = sequelize.escape(keyword);
      return literal(
        `(Document.doc_name LIKE CONCAT('%', ${keywordEscaped}, '%') OR Document.remarks LIKE CONCAT('%', ${keywordEscaped}, '%') OR Document.submitter LIKE CONCAT('%', ${keywordEscaped}, '%') OR Document.receiver LIKE CONCAT('%', ${keywordEscaped}, '%') OR Document.signer LIKE CONCAT('%', ${keywordEscaped}, '%'))`
      );
    });

    // 为每个关键词创建文件内容搜索条件
    const fileContentMatchConditions = keywords.map((keyword) => {
      const keywordEscaped = sequelize.escape(keyword);
      return literal(
        `EXISTS (SELECT 1 FROM \`document_files\` AS df WHERE df.\`document_id\` = \`Document\`.\`id\` AND df.\`extracted_content\` LIKE CONCAT('%', ${keywordEscaped}, '%'))`
      );
    });

    // 组合所有搜索条件：任何一个关键词匹配就算匹配
    const combinedWhereCondition = {
      [Op.or]: [...documentMatchConditions, ...fileContentMatchConditions],
    };

    // Base findOptions, similar to list but with the new where clause
    const findOptions: any = {
      attributes: [
        ...Object.keys(Document.getAttributes()),
        [fn("COUNT", col("documentFiles.id")), "fileCount"], // Keep fileCount for consistency
      ],
      include: [
        {
          model: DocumentFile,
          as: "documentFiles",
          attributes: [], // 移除具体字段以避免GROUP BY冲突
          required: false,
          duplicating: false,
        },
      ],
      where: combinedWhereCondition,
      group: ["Document.id"],
      // Default order for search results (can be by relevance if DB supports it well, or createdAt)
      // For now, using createdAt as a default. Relevance scoring might require more complex queries.
      order:
        query.sortField && query.sortOrder
          ? [[query.sortField, query.sortOrder]]
          : [["createdAt", "DESC"]],
      subQuery: false,
    };

    // Apply pagination
    if (pageSize > 0) {
      findOptions.limit = limit;
      findOptions.offset = offset;
    }

    try {
      console.debug(
        "[DocumentService] Executing search query with options:",
        JSON.stringify(findOptions, null, 2)
      );

      // 1. Count total matching documents (without pagination, but with the search condition)
      const total = await Document.count({ where: combinedWhereCondition });

      // 2. Find paginated documents
      const documents = await Document.findAll(findOptions);

      console.debug(
        `[DocumentService] Found ${documents.length} documents for the current search page.`
      );

      const list = documents.map((doc: any) => {
        const formattedDoc = this.formatDocumentInfo(doc);
        formattedDoc.fileCount = parseInt(
          doc.getDataValue("fileCount") || "0",
          10
        );
        return formattedDoc;
      });

      // 如果有搜索结果，批量获取文档文件的extractedContent
      if (list.length > 0) {
        const documentIds = list.map((doc) => doc.id);

        // 批量查询所有相关文档的文件和extractedContent
        const documentFiles = await DocumentFile.findAll({
          where: {
            documentId: { [Op.in]: documentIds },
            extractedContent: { [Op.ne]: null }, // 只获取有内容的文件
          },
          attributes: [
            "id",
            "fileName",
            "extractedContent",
            "documentId",
            "fileType",
            "processingStatus",
            "sequence",
            "fileSize",
          ],
          order: [
            ["documentId", "ASC"],
            ["sequence", "ASC"],
          ],
        });

        // 将文件信息按 documentId 分组
        const filesByDocId = documentFiles.reduce((acc, file) => {
          const docId = file.documentId;
          if (!acc[docId]) {
            acc[docId] = [];
          }
          acc[docId].push(file);
          return acc;
        }, {} as Record<number, DocumentFile[]>);

        // 更新list中的文档，添加文件信息
        list.forEach((doc) => {
          if (filesByDocId[doc.id]) {
            doc.files = filesByDocId[doc.id].map((file) => ({
              id: file.id,
              fileName: file.fileName,
              extractedContent: file.extractedContent,
              fileType: file.fileType,
              processingStatus: file.processingStatus,
              sequence: file.sequence,
              fileSize: file.fileSize, // 添加缺失的 fileSize 字段
            }));
          }
        });
      }

      console.debug(
        "--- [DocumentService] searchDocumentsByContent method exit ---"
      );
      return { list, total };
    } catch (error: any) {
      console.error(
        "[DocumentService] Error during searchDocumentsByContent:",
        error
      );
      console.debug(
        "--- [DocumentService] searchDocumentsByContent method exit (with error) ---"
      );
      throw new Error(`内容搜索失败: ${error.message}`);
    }
  }

  /**
   * @description 获取指定文档文件的详细信息和提取内容
   * @param {number} fileId - 文档文件ID
   * @returns {Promise<DocumentFileContentResponse | null>} 返回文件详细信息和提取内容，文件不存在时返回null
   */
  async getDocumentFileWithContent(
    fileId: number
  ): Promise<DocumentFileContentResponse | null> {
    console.debug(
      `[DocumentService] getDocumentFileWithContent called for file ID: ${fileId}`
    );

    try {
      // 验证输入参数
      if (!fileId || fileId <= 0) {
        console.warn(`[DocumentService] Invalid file ID provided: ${fileId}`);
        return null;
      }

      // 查询文档文件，包含所有必要字段
      const documentFile = await DocumentFile.findByPk(fileId, {
        attributes: [
          "id",
          "fileName",
          "filePath",
          "extractedContent",
          "processingStatus",
          "fileSize",
          "fileType",
          "documentId",
          "createdAt",
          "updatedAt",
        ],
      });

      if (!documentFile) {
        console.info(
          `[DocumentService] Document file with ID ${fileId} not found`
        );
        return null;
      }

      // 构建响应对象
      const response: DocumentFileContentResponse = {
        fileId: documentFile.id,
        fileName: documentFile.fileName,
        filePath: documentFile.filePath,
        extractedContent: documentFile.extractedContent,
        processingStatus: documentFile.processingStatus as any,
        extractedAt: null, // DocumentFile模型中没有extractedAt字段，设为null
        fileSize: documentFile.fileSize,
        mimeType: documentFile.fileType || "application/octet-stream", // 使用fileType字段
        documentId: documentFile.documentId,
        uploadedAt: documentFile.createdAt,
      };

      console.debug(
        `[DocumentService] Successfully retrieved file content for ID ${fileId}. ` +
          `Processing status: ${response.processingStatus}, ` +
          `Content length: ${
            response.extractedContent ? response.extractedContent.length : 0
          } chars`
      );

      return response;
    } catch (error: any) {
      console.error(
        `[DocumentService] Error retrieving file content for ID ${fileId}:`,
        error
      );
      throw new Error(`获取文件内容失败: ${error.message}`);
    }
  }
}
