// 移除了 @Provide, @CoolService, @InjectEntityModel
// import { BaseService } from 'midwayjs-cool-core'; // 也不再需要
// import { InjectEntityModel } from '@midwayjs/typeorm'; // 移除
// import { Repository } from 'typeorm'; // 移除 TypeORM 相关

// 需要确定如何获取 Sequelize 模型实例
// ！！！注意：请将此路径修改为指向您实际的 Sequelize 模型文件！！！
import DocType from '../models/DocType';
// 或者从数据库配置文件导入模型
// import { DocType } from '../config/database'; // 假设数据库配置导出了模型

// ！！！注意：请确认前端是否配置了 @backend-types 别名，或改为相对路径
// 修复：确认 DocTypeListQuery 已在 types/doctype.ts 中定义并导出
import type { DocTypeInfo, CreateDocTypeRequest, UpdateDocTypeRequest, DocTypeListQuery } from '../types/doctype';

// 导入 literal 函数
import sequelize, { literal, Op } from 'sequelize';
import User from '../models/User'; // Needed for createdBy association if you add it
// 移除: 不再需要 calculateLevel
// import { calculateLevel } from '../utils/treeUtils'; // Assuming a utility for level calculation

/**
 * 文档类型服务 (Express 版本)
 */
export class DocTypeService /* extends BaseService */ { // 不再继承 BaseService

  // 需要确定如何访问模型 Repository/Model
  // private docTypeModel = DocType; // 假设从 config 导入
  private docTypeModel = DocType;

  /**
   * 获取文档类型树
   * @returns 返回树形结构的文档类型列表 (DocTypeInfo[])
   */
  async getDocTypeTree(): Promise<DocTypeInfo[]> {
    // 1. 获取所有文档类型 (使用 Sequelize 的 findAll)
    const allDocTypes = await this.docTypeModel.findAll({
      // 修正：移除 MySQL 不支持的 NULLS FIRST，改用 literal 实现顶级节点优先
      order: [
        // 先按 parentId 是否为 0 或 NULL 排序 (0 或 NULL 在前)
        literal('`parentId` IS NULL OR `parentId` = 0 DESC'),
        // 然后按 parentId 升序
        ['parentId', 'ASC'],
        // 最后按 sortOrder 升序
        ['sortOrder', 'ASC']
      ],
      raw: true, // 获取原始数据对象，避免 Sequelize 实例干扰
    });

    // 2. 构建树形结构
    const tree = this.buildTree(allDocTypes as any); // 可能需要类型断言
    return tree;
  }

  /**
   * 辅助函数：构建树形结构
   * @param list 文档类型扁平列表 (raw: true 返回的是普通对象)
   * @param parentId 父节点 ID，默认为 null 或 0 表示顶级节点
   * @returns 返回构建好的树形结构 (DocTypeInfo[])
   */
  private buildTree(list: any[], parentId: number | null = null): DocTypeInfo[] {
    const idToNameMap = new Map<number, string>();
    list.forEach(item => idToNameMap.set(item.id, item.name));

    const tree: DocTypeInfo[] = [];
    for (const item of list) {
      const itemParentId = item.parentId === undefined || item.parentId === 0 ? null : item.parentId;

      const targetParentId = parentId === 0 ? null : parentId;

      if (itemParentId === targetParentId) {
        const children = this.buildTree(list, item.id);
        const parentName = item.parentId ? idToNameMap.get(item.parentId) ?? null : null;

        const node: DocTypeInfo = {
          id: item.id,
          name: item.name,
          parentId: item.parentId === 0 ? null : item.parentId,
          parentName: parentName,
          sort: item.sortOrder ?? 0,
          description: null,
          createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt),
          updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : String(item.updatedAt),
        };

        if (children.length > 0) {
          node.children = children;
        }
        tree.push(node);
      }
    }
    return tree;
  }

  /**
   * 创建文档类型
   * @param data CreateDocTypeRequest
   * @param userId 创建者ID
   * @returns Promise<DocType>
   */
  async create(data: CreateDocTypeRequest, userId: number): Promise<DocType> { // Return DocType
    let level = 1;
    let parent: DocType | null = null;

    if (data.parentId) {
      parent = await DocType.findByPk(data.parentId);
      if (!parent) {
        throw new Error('指定的上级类型不存在');
      }
      // 使用简单的层级计算
      level = parent.level + 1;
      // 可以在这里添加层级限制逻辑, 例如: if (level > 3) throw new Error('最多支持三级');
    } else {
       data.parentId = 0; // Ensure top-level has parentId 0
    }

    // Ensure parentId is not null before creating
    const parentIdToSave = data.parentId ?? 0;

    const newDocType = await DocType.create({
      ...data,
      parentId: parentIdToSave, // Use the determined parentId
      level: level,
      createdBy: userId,
    });
    return newDocType;
  }

  /**
   * 更新文档类型
   * @param id DocType ID
   * @param data UpdateDocTypeRequest
   * @returns Promise<DocType | null>
   */
  async update(id: number, data: UpdateDocTypeRequest): Promise<DocType | null> { // Return DocType
    const docType = await DocType.findByPk(id);
    if (!docType) {
      return null; // Or throw an error ('文档类型未找到')
    }

    let newLevel = docType.level;
    let parent: DocType | null = null;

    // Check if parentId is being updated
    if (data.parentId !== undefined && data.parentId !== docType.parentId) {
        if (data.parentId === id) {
            throw new Error('不能将类型的上级设置为自身');
        }
        if (data.parentId) {
            parent = await DocType.findByPk(data.parentId);
            if (!parent) {
                throw new Error('指定的上级类型不存在');
            }
            // 使用简单的层级计算
            newLevel = parent.level + 1;
            // 可以在这里添加层级限制逻辑
        } else {
            newLevel = 1; // Moving to top level
            data.parentId = 0; // Explicitly set parentId to 0 for top level
        }
    }

    // Prevent updating parentId to null if it wasn't explicitly provided as null or 0
    const parentIdToUpdate = data.parentId === undefined ? docType.parentId : (data.parentId ?? 0);


    await docType.update({
      ...data,
      parentId: parentIdToUpdate,
      level: newLevel !== undefined ? newLevel : docType.level, // Update level if changed
    });
    return docType.reload(); // Return updated instance
  }

  /**
   * 删除文档类型
   * @param id 要删除的文档类型ID
   */
  async delete(id: number): Promise<boolean> {
     // 检查是否存在子类型
     const childrenCount = await this.docTypeModel.count({ where: { parentId: id } });
     if (childrenCount > 0) {
       throw new Error('请先删除该类型下的所有子类型');
     }

     const result = await this.docTypeModel.destroy({ where: { id } });
     return result > 0; // 返回是否成功删除
  }

  /**
   * 获取单个文档类型信息
   * @param id 文档类型ID
   */
  async info(id: number): Promise<DocTypeInfo | null> {
    const docType = await this.docTypeModel.findByPk(id);
    if (!docType) {
      return null;
    }

    let parentName: string | null = null;
    if (docType.parentId) {
      const parent = await this.docTypeModel.findByPk(docType.parentId, { attributes: ['name'] });
      parentName = parent ? parent.name : null;
    }

    // 映射为 DocTypeInfo 结构
    const docTypeInfo: DocTypeInfo = {
      id: docType.id,
      name: docType.name,
      parentId: docType.parentId === 0 ? null : docType.parentId,
      parentName: parentName,
      sort: docType.sortOrder ?? 0,
      // description: docType.description, // 如果模型添加了 description
      description: null,
      createdAt: docType.createdAt.toISOString(),
      updatedAt: docType.updatedAt.toISOString(),
    };
    return docTypeInfo;
  }

  /**
   * 获取文档类型列表 (可带查询条件)
   * @param query 查询参数 (例如: name, parentId)
   */
  async list(query: DocTypeListQuery): Promise<{ list: DocTypeInfo[], total: number }> {
    const where: any = {};
    if (query.name) {
      where.name = { [Op.like]: `%${query.name}%` }; // 模糊查询
    }
    // 修复：正确处理 parentId 的类型 (string | number | null)
    if (query.parentId !== undefined && query.parentId !== null) {
      if (query.parentId === 'null') {
        where.parentId = 0; // 查询顶级节点
      } else if (typeof query.parentId === 'number') {
        where.parentId = query.parentId; // 直接使用数字
      } else if (typeof query.parentId === 'string') {
        const parsedId = parseInt(query.parentId, 10);
        if (!isNaN(parsedId)) {
          where.parentId = parsedId; // 使用解析后的数字
        } else {
          // 可选：处理无效的字符串ID，例如记录警告
          console.warn(`Invalid string parentId provided: ${query.parentId}`);
        }
      }
    }
    // 未来可添加更多筛选条件

    const { count, rows } = await this.docTypeModel.findAndCountAll({
        where,
        order: [['sortOrder', 'ASC']],
        // raw: true, // findAndCountAll 不建议直接用 raw
    });

    // 手动映射为 DocTypeInfo[]，因为不能用 raw: true
    const list = await Promise.all(rows.map(async (docType) => {
         let parentName: string | null = null;
         if (docType.parentId) {
            const parent = await this.docTypeModel.findByPk(docType.parentId, { attributes: ['name'] });
            parentName = parent ? parent.name : null;
         }
         return {
            id: docType.id,
            name: docType.name,
            parentId: docType.parentId === 0 ? null : docType.parentId,
            parentName: parentName,
            sort: docType.sortOrder ?? 0,
            description: null, // 模型暂无 description
            createdAt: docType.createdAt.toISOString(),
            updatedAt: docType.updatedAt.toISOString(),
         };
    }));


    return { list, total: count };
  }

  // --- 未来添加其他 CRUD 方法 (需要 Sequelize 实现) ---
  // async create(data: CreateDocTypeRequest): Promise<DocTypeEntity> { ... }
  // async update(id: number, data: UpdateDocTypeRequest): Promise<DocTypeEntity | null> { ... }
  // async delete(id: number): Promise<void> { ... }
  // async info(id: number): Promise<DocTypeEntity | null> { ... }
  // async list(query: any): Promise<{ list: DocTypeEntity[], total: number }> { ... }
} 