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
        console.debug('[DocumentService] list called with query:', JSON.stringify(query));

        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 10;
        const docName = (query as any).docName;
        const submitter = (query as any).submitter;
        const receiver = (query as any).receiver;
        const docTypeId = query.docTypeId;
        const sourceDepartmentId = query.sourceDepartmentId;
        const signer = query.signer;
        const handoverDateStart = query.handoverDateStart;
        const handoverDateEnd = query.handoverDateEnd;
        const sortField = query.sortField;
        const sortOrder = query.sortOrder;

        let pageNum = parseInt(String(page), 10);
        let pageSizeNum = parseInt(String(pageSize), 10);
        if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
        if (isNaN(pageSizeNum) || pageSizeNum < 1) pageSizeNum = 10;
        else if (pageSizeNum > 1000) pageSizeNum = 1000;

        const offset = (pageNum - 1) * pageSizeNum;
        const limit = pageSizeNum;

        const where: WhereOptions<Document> = {}; 
        if (docName) where.docName = { [Op.like]: `%${docName}%` }; 
        if (submitter) where.submitter = { [Op.like]: `%${submitter}%` };
        if (receiver) where.receiver = { [Op.like]: `%${receiver}%` };
        if (signer) where.signer = { [Op.like]: `%${signer}%` };

        // Temporarily disable ID filters
        if (docTypeId !== undefined && docTypeId !== null) {
            console.warn(`[DocumentService] TODO: Filtering by docTypeId (${docTypeId}) disabled.`);
        }
        if (sourceDepartmentId !== undefined && sourceDepartmentId !== null) {
            console.warn(`[DocumentService] TODO: Filtering by sourceDepartmentId (${sourceDepartmentId}) disabled.`);
        }

        if (handoverDateStart || handoverDateEnd) {
            const handoverDateWhere: any = {}; 
            if (handoverDateStart) handoverDateWhere[Op.gte] = new Date(handoverDateStart);
            if (handoverDateEnd) {
                const endDate = new Date(handoverDateEnd);
                endDate.setHours(23, 59, 59, 999);
                handoverDateWhere[Op.lte] = endDate;
            }
            where.handoverDate = handoverDateWhere; 
        }

        const order: Order = sortField && sortOrder
            ? [[sortField, sortOrder === 'DESC' ? 'DESC' : 'ASC']] 
            : [['createdAt', 'DESC']]; 

        console.debug('[DocumentService] Document Raw Attributes:', Document.rawAttributes);
        console.debug('[DocumentService] Sequelize findAndCountAll args:', JSON.stringify({ where, order, offset, limit }));

        try {
            const { count, rows } = await Document.findAndCountAll({
                where,
                order,
                offset,
                limit,
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
            });

            console.debug(`[DocumentService] Sequelize findAndCountAll returned ${rows.length} records.`);
            console.debug(`[DocumentService] Sequelize findAndCountAll returned total count: ${count}.`);

            const formattedList = rows.map((doc: Document) => this.formatDocumentInfo(doc));
            return { list: formattedList, total: count };
        } catch (error) {
            console.error('[DocumentService] Error fetching documents:', error);
            const message = (error instanceof Error) ? error.message : 'Unknown error';
            throw new Error(`列表查询失败: ${message}`); 
        }
    }

    /**
     * @description 格式化 Sequelize 文档实例为 DocumentInfo 接口格式
     * @private
     * @param {Document} document - Sequelize 文档实例
     * @returns {DocumentInfo}
     */
    private formatDocumentInfo(document: Document): DocumentInfo {
        const docTypeName = document.docTypeName; 
        const sourceDepartmentName = document.sourceDepartmentName;

        const result: Omit<DocumentInfo, 'docTypeId' | 'sourceDepartmentId'> & { docTypeName: string; departmentName: string } = { 
            id: document.id,
            docName: document.docName, 
            docTypeName: docTypeName ?? 'N/A',        
            departmentName: sourceDepartmentName ?? 'N/A', 
            submitter: document.submitter,
            receiver: document.receiver,
            signer: document.signer,
            storageLocation: document.storageLocation,
            handoverDate: document.handoverDate,
            remarks: document.remarks,
            createdBy: document.createdBy,
            createdByName: document.createdBy ?? 'N/A', 
            updatedBy: document.updatedBy,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        };
        // 临时恢复 as any
        return result as any; 
    }
} 