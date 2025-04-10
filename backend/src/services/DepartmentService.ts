import { Department, User } from '../models'; // 引入 User 用于检查关联
import { Op } from 'sequelize';
import { DepartmentInfo, CreateDepartmentRequest, UpdateDepartmentRequest } from '../types/department';

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
   * @returns 创建后的部门信息
   * @throws 如果同级下名称已存在或其他数据库错误
   */
  public async createDepartment(deptData: CreateDepartmentRequest): Promise<DepartmentInfo> {
    const whereClauseForCheck = {
      name: deptData.name,
      parentId: deptData.parentId === null ? { [Op.is]: null } : deptData.parentId // 处理 null
    };
    const existingDept = await Department.findOne({ where: whereClauseForCheck });
    if (existingDept) {
      throw new Error(`在 ${deptData.parentId ? '此父部门下' : '顶级部门中'} 已存在名为 "${deptData.name}" 的部门`);
    }

    // 只传递模型需要的字段给 create
    const createData = {
      name: deptData.name,
      parentId: deptData.parentId,
      sortOrder: deptData.sortOrder
      // code 和 level 依赖数据库默认值或后续处理
    };
    // @ts-ignore // 暂时忽略 code, level 的缺失，假设数据库有默认值
    const newDept = await Department.create(createData);
    return await this.getDepartmentById(newDept.id) as DepartmentInfo;
  }

  /**
   * 更新部门信息
   * @param id 部门 ID
   * @param deptData 更新数据
   * @returns 更新后的部门信息或 null
   * @throws 如果同级下名称已存在
   */
  public async updateDepartment(id: number, deptData: UpdateDepartmentRequest): Promise<DepartmentInfo | null> {
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
    // 确保不传递 undefined 的 parentId (如果 deptData.parentId 是 undefined)
    // 如果 updatePayload.parentId 在这里是 undefined，Sequelize 会忽略它

    await department.update(updatePayload);
    return this.getDepartmentById(id);
  }

  /**
   * 删除部门 (软删除)
   * @param id 部门 ID
   * @returns 是否删除成功
   * @throws 如果部门下还有子部门
   */
  public async deleteDepartment(id: number): Promise<boolean> {
    const childCount = await Department.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new Error('无法删除，该部门下存在子部门');
    }

    const department = await Department.findByPk(id);
    if (!department) {
      return false;
    }
    await department.destroy();
    return true;
  }

}

export default new DepartmentService(); 