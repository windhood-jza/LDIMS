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
 * @classdesc 提供文档信息管理的服务
 */
export class DocumentService {

    /**
     * @description 创建新文档
     * @param {CreateDocumentRequest} data - 创建数据
     * @param {string} creatorName - 创建者姓名/标识符
     * @returns {Promise<Document>} 返回创建的文档实例
     */
    async create(data: CreateDocumentRequest, creatorName: string | null): Promise<Document> {
        try {
            // 从 data 中提取模型需要的字段
            const documentData = {
                docName: data.docName,
                sourceDepartmentId: data.sourceDepartmentId,
                submitter: data.submitter,
                receiver: data.receiver,
                docTypeId: data.docTypeId ?? null, // 处理可选和 null
                signer: data.signer ?? null,
                storageLocation: data.storageLocation,
                remarks: data.remarks,
                handoverDate: data.handoverDate ? new Date(data.handoverDate) : null, // 处理日期和 null
                createdBy: creatorName, // 使用传入的创建者姓名
            };

            // 过滤掉 undefined 的字段，避免覆盖模型默认值
            Object.keys(documentData).forEach((key) => {
                const k = key as keyof typeof documentData;
                if (documentData[k] === undefined) {
                    // 修正 TS7053: 显式将 documentData 断言为 any 进行删除
                    delete (documentData as any)[k];
                }
            });

            const newDocument = await Document.create(documentData);
            return newDocument;
        } catch (error: any) {
            console.error('Error creating document:', error);
            // 可以根据 error.name === 'SequelizeValidationError' 等进行更细致处理
            throw new Error(`创建文档失败: ${error.message}`);
        }
    }

    /**
     * @description 更新文档信息
     * @param {number} id - 文档ID
     * @param {UpdateDocumentRequest} data - 更新数据
     * @param {string} updaterName - 操作用户姓名/标识符
     * @returns {Promise<Document | null>} 返回更新后的文档实例，如果未找到则返回 null
     */
    async update(id: number, data: UpdateDocumentRequest, updaterName: string | null): Promise<Document | null> {
        try {
            const document = await Document.findByPk(id);
            if (!document) {
                return null;
            }

            // 构造更新数据，只包含传入的字段
            const updateData: any = { ...data };

            // 处理 handoverDate 类型
            if (updateData.handoverDate && typeof updateData.handoverDate === 'string') {
                updateData.handoverDate = new Date(updateData.handoverDate);
            }
             // 如果 handoverDate 明确传入 null，也需要处理
            else if (updateData.hasOwnProperty('handoverDate') && updateData.handoverDate === null) {
                 updateData.handoverDate = null;
            }

             // 处理 docTypeId null
            if (updateData.hasOwnProperty('docTypeId') && updateData.docTypeId === null) {
                updateData.docTypeId = null;
            }
            // 处理 signer null
             if (updateData.hasOwnProperty('signer') && updateData.signer === null) {
                updateData.signer = null;
            }

            // 添加 updatedBy
            updateData.updatedBy = updaterName;

            // 过滤掉 DTO 中不存在于模型或不应直接更新的字段（如果需要）
            // delete updateData.someFieldNotIntheModel;

            await document.update(updateData);
            return document.reload();
        } catch (error: any) {
            console.error(`Error updating document ${id}:`, error);
            throw new Error(`更新文档失败: ${error.message}`);
        }
    }

    /**
     * @description 删除文档 (软删除)
     * @param {number} id - 文档ID
     * @param {string} deleterName - 操作用户ID (用于权限检查或记录)
     * @returns {Promise<boolean>} 返回是否删除成功
     */
    // 注意: delete 操作的用户标识符可能不需要，取决于业务逻辑
    async delete(id: number, deleterName?: string | null): Promise<boolean> {
        try {
            const document = await Document.findByPk(id);
            if (!document) {
                throw new Error('文档未找到');
            }

            // 可选：权限检查，例如检查是否是创建者或管理员
            // if (document.createdBy !== deleterName && !isAdmin(deleterName)) ...

            const affectedRows = await Document.destroy({ where: { id } });
            return affectedRows > 0;
        } catch (error: any) {
            console.error(`Error deleting document ${id}:`, error);
            throw new Error(`删除文档失败: ${error.message}`);
        }
    }

    /**
     * @description 获取单个文档详情 (包含关联信息)
     * @param {number} id - 文档ID
     * @returns {Promise<DocumentInfo | null>} 返回文档详情 (DTO 格式)，如果未找到则返回 null
     */
    async info(id: number): Promise<DocumentInfo | null> {
        try {
            const document = await Document.findByPk(id, {
                include: [
                    // 注意: as 别名需要与 models/index.ts (或模型关联定义处) 保持一致
                    { model: DocType, as: 'docType', attributes: ['name'] }, // 假设别名为 docType
                    { model: Department, as: 'sourceDepartment', attributes: ['name'] }, // 假设别名为 sourceDepartment
                    // createdBy 现在是 string, 不需要关联 User 模型获取名字了，除非你想显示用户的其他信息
                    // { model: User, as: 'CreatedByUser', attributes: ['realName'] }
                ]
            });

            if (!document) {
                return null;
            }

            return this.formatDocumentInfo(document);
        } catch (error: any) {
            console.error(`Error fetching document info ${id}:`, error);
            throw new Error(`获取文档详情失败: ${error.message}`);
        }
    }

    /**
     * @description 获取文档列表 (支持查询、分页、排序)
     * @param {DocumentListQuery} query - 查询参数
     * @returns {Promise<{ list: DocumentInfo[], total: number }>} 返回文档列表 (DTO 格式) 和总数
     */
    async list(query: DocumentListQuery): Promise<{ list: DocumentInfo[], total: number }> {
        try {
            const {
                page = 1,
                pageSize = 10,
                keyword,
                docTypeId,
                sourceDepartmentId, // 修正
                signer,
                handoverDateStart,
                handoverDateEnd,
                sortField = 'createdAt',
                sortOrder = 'DESC'
            } = query;

            const offset = (Number(page) - 1) * Number(pageSize);
            const limit = Number(pageSize);

            const where: WhereOptions<any> = {};

            if (keyword) {
                // 同时搜索文档名称、提交人、接收人、签章人
                (where as any)[Op.or] = [
                    { docName: { [Op.like]: `%${keyword}%` } }, // 修正
                    { submitter: { [Op.like]: `%${keyword}%` } },
                    { receiver: { [Op.like]: `%${keyword}%` } },
                    { signer: { [Op.like]: `%${keyword}%` } }
                ];
            }
            if (docTypeId) {
                where.docTypeId = Number(docTypeId);
            }
            if (sourceDepartmentId) {
                where.sourceDepartmentId = Number(sourceDepartmentId); // 修正
            }
            if (signer && !keyword) {
                where.signer = { [Op.like]: `%${signer}%` };
            }
            if (handoverDateStart && handoverDateEnd) {
                where.handoverDate = {
                    [Op.between]: [new Date(handoverDateStart), new Date(handoverDateEnd)]
                };
            } else if (handoverDateStart) {
                where.handoverDate = { [Op.gte]: new Date(handoverDateStart) };
            } else if (handoverDateEnd) {
                where.handoverDate = { [Op.lte]: new Date(handoverDateEnd) };
            }

            // 修正：更新允许的排序字段
            const allowedSortFields = ['id', 'docName', 'handoverDate', 'signer', 'createdAt', 'updatedAt', 'submitter', 'receiver'];
            const validSortField = allowedSortFields.includes(sortField) ? sortField : 'createdAt';
            const validSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';
            // 注意：如果字段名在数据库中不同 (e.g., source_department_id)，排序时需要用数据库字段名
            const order: Order = [[validSortField, validSortOrder]];

            const { count, rows } = await Document.findAndCountAll({
                where,
                include: [
                    { model: DocType, as: 'docType', attributes: ['name'] }, // 修正别名
                    { model: Department, as: 'sourceDepartment', attributes: ['name'] } // 修正别名
                ],
                limit,
                offset,
                order,
                distinct: true,
            });

            const list = rows.map(doc => this.formatDocumentInfo(doc));

            return { list, total: count };
        } catch (error: any) {
            console.error('Error fetching document list:', error);
            throw new Error(`获取文档列表失败: ${error.message}`);
        }
    }

    /**
     * @description 格式化 Sequelize 文档实例为 DocumentInfo 接口格式
     * @private
     * @param {Document} document - Sequelize 文档实例
     * @returns {DocumentInfo}
     */
    private formatDocumentInfo(document: Document): DocumentInfo {
        // 修正：使用模型定义的别名访问关联数据
        const docType = (document as any).docType;
        const department = (document as any).sourceDepartment;
        // createdBy 是字符串，不需要关联 User

        return {
            id: document.id,
            docName: document.docName, // 修正
            docTypeId: document.docTypeId, // 模型中允许 null
            docTypeName: docType?.name ?? '未知类型',
            sourceDepartmentId: document.sourceDepartmentId, // 修正
            departmentName: department?.name ?? '未知部门',
            submitter: document.submitter, // 新增
            receiver: document.receiver, // 新增
            signer: document.signer, // 模型中允许 null
            storageLocation: document.storageLocation, // 新增
            handoverDate: document.handoverDate, // 模型中允许 null
            remarks: document.remarks, // 模型中允许 null
            createdBy: document.createdBy, // 模型中是 string | null
            createdByName: document.createdBy ?? '未知用户', // 直接使用 createdBy 字符串
            updatedBy: document.updatedBy, // 新增
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        };
    }

} 