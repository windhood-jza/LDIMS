import { Department, User } from '../models'; // 引入 User 用于检查关联
import { Op } from 'sequelize';
import { DepartmentInfo, CreateDepartmentRequest, UpdateDepartmentRequest } from '@ldims/types';
import { OperationLogService } from './OperationLogService'; // 引入日志服务
import { OperationType } from '@ldims/types'; // 引入操作类型枚举
import { Request } from 'express'; // 引入 Request 类型

interface DeptMap { [key: number]: DepartmentInfo & { raw?: Department } } // raw is optional

class DepartmentService {

  /**
   * 获取所有部门列表 (基础)
   * @returns 部门信息数组
   */
  public async getDepartmentList(): Promise<DepartmentInfo[]> {
    const departments = await Department.findAll({
      order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']], // 按排序号和创建时间排序
      attributes: ['id', 'name', 'parentId', 'sortOrder', 'createdAt', 'updatedAt'] // 选择所需字段
    });

    // 格式化数据 (可选，取决于前端需要)
    return departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      parentId: dept.parentId,
      sortOrder: dept.sortOrder,
      createdAt: dept.createdAt.toISOString(),
      updatedAt: dept.updatedAt.toISOString(),
    }));
  }

  /**
   * 获取部门树结构
   * @returns 部门树信息数组
   */
  public async getDepartmentTree(): Promise<DepartmentInfo[]> {
    const departments = await Department.findAll({
      order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']],
      attributes: ['id', 'name', 'parentId', 'sortOrder', 'createdAt', 'updatedAt']
    });

    const departmentMap: DeptMap = {};
    const tree: DepartmentInfo[] = [];

    departments.forEach(dept => {
      departmentMap[dept.id] = {
        id: dept.id,
        name: dept.name,
        parentId: dept.parentId,
        sortOrder: dept.sortOrder,
        createdAt: dept.createdAt.toISOString(),
        updatedAt: dept.updatedAt.toISOString(),
        children: [],
      };
    });

    departments.forEach(dept => {
      const deptNode = departmentMap[dept.id];
      if (dept.parentId && departmentMap[dept.parentId]) {
        deptNode.parentName = departmentMap[dept.parentId].name;
        departmentMap[dept.parentId].children?.push(deptNode);
      } else {
        tree.push(deptNode);
      }
    });

    return tree;
  }

  /**
   * 根据 ID 获取单个部门信息
   * @param id 部门 ID
   * @returns 部门信息或 null
   */
  public async getDepartmentById(id: number): Promise<DepartmentInfo | null> {
    const dept = await Department.findByPk(id, {
      attributes: ['id', 'name', 'parentId', 'sortOrder', 'createdAt', 'updatedAt']
    });

    if (!dept) return null;

    let parentName: string | undefined = undefined;
    if (dept.parentId) {
      const parentDept = await Department.findByPk(dept.parentId, { attributes: ['name'] });
      parentName = parentDept?.name;
    }

    return {
      id: dept.id,
      name: dept.name,
      parentId: dept.parentId,
      parentName: parentName,
      sortOrder: dept.sortOrder,
      createdAt: dept.createdAt.toISOString(),
      updatedAt: dept.updatedAt.toISOString(),
    };
  }

  /**
   * 创建新部门
   * @param deptData 部门数据
   * @param userId 操作用户ID
   * @param req Express请求对象，用于记录日志
   * @returns 创建后的部门信息
   * @throws 如果同级下名称已存在(未删除的)或父部门不存在
   */
  public async createDepartment(deptData: CreateDepartmentRequest, userId: number = 0, req?: Request): Promise<DepartmentInfo> {
    // 1. 检查同级下名称是否重复 (只检查未删除的)
    const whereClauseForCheck = {
      name: deptData.name,
      parentId: deptData.parentId === null ? { [Op.is]: null } : deptData.parentId
    };
    const existingDept = await Department.findOne({ 
        where: whereClauseForCheck 
        // paranoid: false // 移除此选项，恢复默认行为(只查未删除的)
    });
    if (existingDept) {
      // 恢复原始错误消息
      const message = `在 ${deptData.parentId ? '此父部门下' : '顶级部门中'} 已存在名为 "${deptData.name}" 的部门`;
      throw new Error(message);
    }

    // 2. 计算 level
    let level = 1; // Default for top-level
    if (deptData.parentId) {
      const parentDept = await Department.findByPk(deptData.parentId);
      if (!parentDept) {
        throw new Error(`指定的上级部门 (ID: ${deptData.parentId}) 不存在`);
      }
      // @ts-ignore - Assume parentDept.level exists and is number
      level = parentDept.level + 1;
    }

    // 3. 创建部门 (包含临时 code 和计算好的 level)
    const tempCode = `TEMP_${Date.now()}`; // 生成临时 code
    const createData: { name: string; parentId?: number; sortOrder: number; level: number; code: string } = {
      name: deptData.name,
      sortOrder: deptData.sortOrder ?? 0,
      level: level,
      code: tempCode, // 先使用临时 code 满足 NOT NULL 约束
    };
    if (deptData.parentId !== null) {
      createData.parentId = deptData.parentId;
    }
    const newDept = await Department.create(createData);

    // 4. 更新为最终的 code (使用 D + ID)
    const finalCode = 'D' + newDept.id;
    await newDept.update({ code: finalCode });

    // 5. 返回包含最终 code 和 parentName 的信息
    const createdDeptInfo = await this.getDepartmentById(newDept.id);
    if (!createdDeptInfo) { 
        throw new Error('创建部门后无法查询到信息');
    }

    // 记录操作日志
    if (req) {
      await OperationLogService.logFromRequest(
        req, 
        OperationType.DEPARTMENT_CREATE, 
        `创建部门: ${deptData.name}`
      );
    }

    return createdDeptInfo;
  }

  /**
   * 更新部门信息
   * @param id 部门 ID
   * @param deptData 更新数据
   * @param userId 操作用户ID
   * @param req Express请求对象，用于记录日志
   * @returns 更新后的部门信息或 null
   * @throws 如果同级下名称已存在
   */
  public async updateDepartment(id: number, deptData: UpdateDepartmentRequest, userId: number = 0, req?: Request): Promise<DepartmentInfo | null> {
    const department = await Department.findByPk(id);
    if (!department) {
      return null;
    }

    const parentIdToCheck = deptData.parentId !== undefined ? deptData.parentId : department.parentId;
    const nameToCheck = deptData.name !== undefined ? deptData.name : department.name;

    // 检查名称冲突
    if ((deptData.name && deptData.name !== department.name) || (deptData.parentId !== undefined && deptData.parentId !== department.parentId)) {
      const whereClauseForCheck = {
        name: nameToCheck,
        parentId: parentIdToCheck === null ? { [Op.is]: null } : parentIdToCheck, // 处理 null
        id: { [Op.ne]: id }
      };
       const existingDept = await Department.findOne({ where: whereClauseForCheck });
       if (existingDept) {
         throw new Error(`在 ${parentIdToCheck ? '目标父部门下' : '顶级部门中'} 已存在名为 "${nameToCheck}" 的部门`);
       }
    }

    // 循环依赖检查
    if (deptData.parentId !== undefined && deptData.parentId !== null) {
        if (deptData.parentId === id) {
             throw new Error('不能将部门设置为自身的子部门');
        }
    }

    // 准备更新数据，显式处理 parentId 的 null 值
    const updatePayload: { [key: string]: any } = {};
    if (deptData.name !== undefined) updatePayload.name = deptData.name;
    if (deptData.parentId !== undefined) updatePayload.parentId = deptData.parentId; // null is acceptable here for update
    if (deptData.sortOrder !== undefined) updatePayload.sortOrder = deptData.sortOrder;

    await department.update(updatePayload);
    const updatedDept = await this.getDepartmentById(id);

    // 记录操作日志
    if (req && updatedDept) {
      await OperationLogService.logFromRequest(
        req, 
        OperationType.DEPARTMENT_UPDATE, 
        `更新部门: ${updatedDept.name}(ID: ${id})`
      );
    }

    return updatedDept;
  }

  /**
   * 删除部门 (软删除)
   * @param id 部门 ID
   * @param userId 操作用户ID
   * @param req Express请求对象，用于记录日志
   * @returns 是否删除成功
   * @throws 如果部门下还有子部门
   */
  public async deleteDepartment(id: number, userId: number = 0, req?: Request): Promise<boolean> {
    const childCount = await Department.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new Error('无法删除，该部门下存在子部门');
    }

    const department = await Department.findByPk(id);
    if (!department) {
      return false;
    }

    // 记录部门名称用于日志记录
    const deptName = department.name;

    await department.destroy();

    // 记录操作日志
    if (req) {
      await OperationLogService.logFromRequest(
        req, 
        OperationType.DEPARTMENT_DELETE, 
        `删除部门: ${deptName}(ID: ${id})`
      );
    }

    return true;
  }

}

export default new DepartmentService(); 