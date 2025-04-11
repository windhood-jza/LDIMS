import { Op, WhereOptions, Order } from 'sequelize';
import Document from '../models/Document';
import User from '../models/User';
import DocType from '../models/DocType';
import Department from '../models/Department';
import {
    DocumentInfo,
    CreateDocumentRequest,
    UpdateDocumentRequest,
    DocumentListQuery
} from '../types/document.d';

/**
 * @class DocumentService
 * @classdesc 提供文档信息管理的服务 (使用 Sequelize)
 */
export class DocumentService {

    /**
     * @description 创建新文档 (使用 Sequelize)
     * @param {CreateDocumentRequest} data - 创建数据
     * @param {string | null} creatorName - 创建者姓名/标识符
     * @returns {Promise<Document>} 返回创建的 Sequelize 文档实例
     */
    async create(data: CreateDocumentRequest, creatorName: string | null): Promise<Document> {
        console.debug('[DocumentService] create called with data:', JSON.stringify(data));

        // 假设请求类型中有 sourceDepartmentId
        const { docTypeId, sourceDepartmentId, ...restData } = data;

        let docTypeName: string | undefined = undefined;
        let sourceDepartmentName: string | undefined = undefined;

        // --- 使用 Sequelize 查找名称 ---
        if (docTypeId) {
            const docType = await DocType.findByPk(docTypeId);
            if (!docType) {
                console.warn(`[DocumentService] DocType with ID ${docTypeId} not found during creation.`);
            } else {
                docTypeName = docType.name;
            }
        }
        if (sourceDepartmentId) {
            const department = await Department.findByPk(sourceDepartmentId);
            if (!department) {
                console.warn(`[DocumentService] Department with ID ${sourceDepartmentId} not found during creation.`);
            } else {
                sourceDepartmentName = department.name;
            }
        }
        console.debug(`[DocumentService] Looked up names: type='${docTypeName}', department='${sourceDepartmentName}'`);

        try {
            // 准备 Sequelize 创建数据
            const documentData = {
                ...restData,
                docTypeName: docTypeName,           // 存储名称 (假设模型已更新或将更新)
                sourceDepartmentName: sourceDepartmentName, // 存储名称 (假设模型已更新或将更新)
                createdBy: creatorName,           // 使用传入的 creatorName
                // 不再存储 docTypeId, sourceDepartmentId
            };

            // 修正：需要明确告知 TS 我们添加了新字段，或等待模型更新
            console.debug('[DocumentService] Sequelize create args:', JSON.stringify(documentData));
            const newDocument = await Document.create(documentData as any); // 使用 as any 暂时绕过类型检查
            console.debug('[DocumentService] Document created successfully:', newDocument.id);
            return newDocument;
        } catch (error) {
            console.error('[DocumentService] Error creating document:', error);
            // 修正：检查 Sequelize 错误类型
            const message = (error instanceof Error) ? error.message : 'Unknown error';
            throw new Error(`Failed to create document: ${message}`);
        }
    }

    /**
     * @description 更新文档信息 (使用 Sequelize)
     * @param {number} id - 文档ID
     * @param {UpdateDocumentRequest} data - 更新数据
     * @param {string | null} updaterName - 操作用户姓名/标识符
     * @returns {Promise<Document | null>} 返回更新后的 Sequelize 文档实例，如果未找到则返回 null
     */
    async update(id: number, data: UpdateDocumentRequest, updaterName: string | null): Promise<Document | null> {
        console.debug(`[DocumentService] update called for ID ${id} with data:`, JSON.stringify(data));
        const { docTypeId, sourceDepartmentId, ...restData } = data; // 假设 DTO 使用 sourceDepartmentId

        const document = await Document.findByPk(id);
        if (!document) {
            console.warn(`[DocumentService] Document with ID ${id} not found for update.`);
            return null;
        }

        let namesToUpdate: { docTypeName?: string | null; sourceDepartmentName?: string | null } = {};

        // --- 使用 Sequelize 查找名称 --- 
        if (docTypeId !== undefined) {
            if (docTypeId === null) {
                namesToUpdate.docTypeName = null;
            } else {
                const docType = await DocType.findByPk(docTypeId);
                if (!docType) {
                    console.warn(`[DocumentService] DocType with ID ${docTypeId} not found during update.`);
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
                     console.warn(`[DocumentService] Department with ID ${sourceDepartmentId} not found during update.`);
                     namesToUpdate.sourceDepartmentName = null;
                 } else {
                     namesToUpdate.sourceDepartmentName = department.name;
                 }
             }
        }

        console.debug(`[DocumentService] Data to update:`, JSON.stringify(restData));
        console.debug(`[DocumentService] Names to update:`, JSON.stringify(namesToUpdate));

        try {
            // 更新实例属性
            Object.assign(document, restData);
            // 显式更新名称字段 (假设模型将更新)
            (document as any).docTypeName = namesToUpdate.docTypeName !== undefined ? namesToUpdate.docTypeName : (document as any).docTypeName;
            (document as any).sourceDepartmentName = namesToUpdate.sourceDepartmentName !== undefined ? namesToUpdate.sourceDepartmentName : (document as any).sourceDepartmentName;
            document.updatedBy = updaterName; // 使用传入的 updaterName

            await document.save();
            console.debug('[DocumentService] Document updated successfully:', document.id);
            return document;
        } catch (error) {
            console.error(`[DocumentService] Error updating document ${id}:`, error);
            const message = (error instanceof Error) ? error.message : 'Unknown error';
            throw new Error(`Failed to update document: ${message}`);
        }
    }

    /**
     * @description 删除文档 (软删除 - 假设模型配置了 paranoid: true)
     * @param {number} id - 文档ID
     * @param {string | null} [deleterName] - 操作用户ID (可选)
     * @returns {Promise<boolean>} 返回是否删除成功 (影响的行数 > 0)
     */
    async delete(id: number, deleterName?: string | null): Promise<boolean> {
        console.debug(`[DocumentService] delete called for ID ${id} by ${deleterName}`);
        try {
            // Sequelize 的 destroy 配合 paranoid: true 实现软删除
            const affectedRows = await Document.destroy({ where: { id } });
            if (affectedRows > 0) {
                console.debug(`[DocumentService] Document soft deleted successfully: ID ${id}`);
                 // 可选：记录删除者，如果模型有 deletedBy 字段
                // await Document.update({ deletedBy: deleterName }, { where: { id }, paranoid: false });
                return true;
            } else {
                console.warn(`[DocumentService] Document with ID ${id} not found or already deleted.`);
                return false;
            }
        } catch (error: any) {
            console.error(`Error deleting document ${id}:`, error);
            throw new Error(`删除文档失败: ${error.message}`);
        }
    }

    /**
     * @description 获取单个文档详情 (使用 Sequelize)
     * @param {number} id - 文档ID
     * @returns {Promise<DocumentInfo | null>} 返回文档详情 (DTO 格式)，如果未找到则返回 null
     */
    async info(id: number): Promise<DocumentInfo | null> {
        console.debug(`[DocumentService] info called for ID ${id}`);
        try {
            const document = await Document.findByPk(id, {
                 // 修正：attributes 使用模型属性名 (camelCase)
                 attributes: [
                    'id',
                    'docName',
                    'docTypeName',
                    'sourceDepartmentName',
                    'submitter',
                    'receiver',
                    'signer',
                    'storageLocation',
                    'remarks',
                    'handoverDate',
                    'createdBy',
                    'updatedBy',
                    'createdAt',
                    'updatedAt',
                 ],
                 // paranoid: true 查询默认排除已删除
            });

            if (!document) {
                 console.warn(`[DocumentService] Document with ID ${id} not found.`);
                return null;
            }

            return this.formatDocumentInfo(document);
        } catch (error: any) {
            console.error(`Error fetching document info ${id}:`, error);
            throw new Error(`获取文档详情失败: ${error.message}`);
        }
    }

    /**
     * @description 获取文档列表 (使用 Sequelize)
     * @param {DocumentListQuery} query - 查询参数
     * @returns {Promise<{ list: DocumentInfo[], total: number }>} 返回文档列表 (DTO 格式) 和总数
     */
    async list(query: DocumentListQuery): Promise<{ list: DocumentInfo[], total: number }> {
        console.debug('--- [DocumentService] list method entry ---'); // Log entry
        console.debug('[DocumentService] Received raw query:', JSON.stringify(query, null, 2)); // Log raw query

        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 10;

        // 从 query 中获取所有可能的参数
        const docName = query.docName;
        const submitter = query.submitter;
        const receiver = query.receiver;
        const signer = query.signer;
        const docTypeId = query.docTypeId; // 获取类型 ID
        const sourceDepartmentId = query.sourceDepartmentId; // 获取部门 ID
        const docTypeNameFilter = query.docTypeNameFilter; // **新增**: 获取类型名称模糊查询
        const sourceDepartmentNameFilter = query.sourceDepartmentNameFilter; // **新增**: 获取部门名称模糊查询
        const handoverStartDate = query.handoverStartDate; // 获取日期开始
        const handoverEndDate = query.handoverEndDate;   // 获取日期结束
        const sortField = query.sortField;
        const sortOrder = query.sortOrder === 'DESC' ? 'DESC' : 'ASC'; // 修正：使用大写的 'DESC' 进行比较

        // 分页计算
        let pageNum = parseInt(String(page), 10);
        let pageSizeNum = parseInt(String(pageSize), 10);
        if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
        if (isNaN(pageSizeNum) || pageSizeNum < 1) pageSizeNum = 10;
        else if (pageSizeNum > 1000) pageSizeNum = 1000; // 防止过大的 pageSize

        const offset = (pageNum - 1) * pageSizeNum;
        const limit = pageSizeNum;

        // 构建 Where 条件
        const where: WhereOptions<Document> = {};
        if (docName) where.docName = { [Op.like]: `%${docName}%` };
        if (submitter) where.submitter = { [Op.like]: `%${submitter}%` };
        if (receiver) where.receiver = { [Op.like]: `%${receiver}%` };
        if (signer) where.signer = { [Op.like]: `%${signer}%` };

        // **修改**: 处理文档类型过滤 (ID 优先，否则用模糊文本)
        if (docTypeId) {
            const docType = await DocType.findByPk(docTypeId);
            if (docType) {
                where.docTypeName = docType.name; // 精确匹配
            } else {
                console.warn(`[DocumentService] DocType with ID ${docTypeId} not found for filtering. Returning empty list.`);
                where.id = -1;
            }
        } else if (docTypeNameFilter) { // 如果没有传 ID，但传了模糊文本
            where.docTypeName = { [Op.like]: `%${docTypeNameFilter}%` }; // 模糊匹配
        }

        // **修改**: 处理来源部门过滤 (ID 优先，否则用模糊文本)
        if (sourceDepartmentId) {
            const department = await Department.findByPk(sourceDepartmentId);
            if (department) {
                where.sourceDepartmentName = department.name; // 精确匹配
            } else {
                console.warn(`[DocumentService] Department with ID ${sourceDepartmentId} not found for filtering. Returning empty list.`);
                where.id = -1;
            }
        } else if (sourceDepartmentNameFilter) { // 如果没有传 ID，但传了模糊文本
            where.sourceDepartmentName = { [Op.like]: `%${sourceDepartmentNameFilter}%` }; // 模糊匹配
        }

        // 处理交接日期范围
        if (handoverStartDate && handoverEndDate) {
            where.handoverDate = {
                [Op.between]: [handoverStartDate, handoverEndDate],
            };
        } else if (handoverStartDate) {
            where.handoverDate = {
                [Op.gte]: handoverStartDate, // 大于等于开始日期
            };
        } else if (handoverEndDate) {
            where.handoverDate = {
                [Op.lte]: handoverEndDate, // 小于等于结束日期
            };
        }

        // 构建 Order 条件
        let order: Order = [['createdAt', 'DESC']]; // 默认按创建时间降序
        if (sortField && ['id', 'docName', 'handoverDate', 'createdAt'].includes(sortField)) {
             order = [[sortField, sortOrder]];
        }

        console.debug('[DocumentService] Constructed WHERE clause:', JSON.stringify(where, null, 2));
        console.debug('[DocumentService] Constructed ORDER clause:', JSON.stringify(order));

        // **修改**: 分页/获取所有数据的选项
        const findOptions: any = {
            where: where,
            attributes: [
               'id', 'docName', 'docTypeName', 'sourceDepartmentName',
               'submitter', 'receiver', 'signer', 'storageLocation', 'remarks',
               'handoverDate', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt',
            ],
            order: order,
        };

        if (pageSizeNum > 0) { // 只有 pageSize 大于 0 时才应用分页
            findOptions.limit = limit;
            findOptions.offset = offset;
        } else {
            console.debug('[DocumentService] pageSize <= 0, fetching all records.');
            // 不需要设置 limit 和 offset，获取所有匹配项
        }

        try {
             console.debug('[DocumentService] Executing findAndCountAll...', findOptions);
            const result = await Document.findAndCountAll(findOptions);
            console.debug(`[DocumentService] findAndCountAll finished. Found ${result.count} documents.`);

            const list = result.rows.map(doc => this.formatDocumentInfo(doc));

            console.debug('--- [DocumentService] list method exit ---');
            return { list, total: result.count };

        } catch (error: any) {
            console.error('[DocumentService] Error during findAndCountAll:', error); // Log error during execution
            console.debug('--- [DocumentService] list method exit (with error) ---'); // Log exit on error
            throw new Error(`获取文档列表失败: ${error.message}`);
        }
    }

    /**
    * @description 格式化 Sequelize 文档实例为 DTO
    * @param {Document} document - Sequelize 文档实例
    * @returns {DocumentInfo} 返回 DTO 对象
    */
    private formatDocumentInfo(document: Document): DocumentInfo {
         // --- Temporarily revert createdByName logic ---
         const creatorUsername = document.createdBy ?? null; // Use createdBy directly for now

        const result = {
            id: document.id,
            docName: document.docName,
            docTypeName: document.docTypeName ?? null,
            departmentName: document.sourceDepartmentName ?? null,
            submitter: document.submitter ?? null,
            receiver: document.receiver ?? null,
            signer: document.signer ?? null,
            storageLocation: document.storageLocation ?? null,
            remarks: document.remarks ?? null,
            handoverDate: document.handoverDate ?? null,
             createdByName: creatorUsername, // Assign the temporary value
            updatedBy: document.updatedBy ?? null,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        };
        return result;
    }
} 