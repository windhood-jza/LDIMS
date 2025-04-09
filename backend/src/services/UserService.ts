import { User, Department } from '../models';
import { Op } from 'sequelize';
import { PageResult } from '../utils/response';
import { UserInfo } from '../types/user'; // 假设创建用户相关的类型文件

interface UserListQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  departmentId?: number;
  role?: string;
  status?: number;
}

class UserService {
  /**
   * 获取用户列表（分页、搜索、筛选）
   * @param query - 查询参数
   * @returns 分页的用户列表数据
   */
  public async getUsers(query: UserListQuery): Promise<PageResult<UserInfo>> {
    const { page = 1, pageSize = 20, keyword, departmentId, role, status } = query;
    const offset = (page - 1) * pageSize;

    // 构建查询条件 (WHERE 子句)
    const whereClause: any = {};
    if (keyword) {
      // 搜索用户名或真实姓名
      whereClause[Op.or] = [
        { username: { [Op.like]: `%${keyword}%` } },
        { realName: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (departmentId) {
      whereClause.departmentId = departmentId;
    }
    if (role) {
      whereClause.role = role;
    }
    if (status !== undefined && status !== null) {
      whereClause.status = status;
    }

    // 查询用户和关联的部门信息
    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      limit: pageSize,
      offset: offset,
      order: [['createdAt', 'DESC']], // 默认按创建时间降序
      attributes: { exclude: ['password', 'deletedAt'] }, // 排除敏感信息
      include: [
        {
          model: Department,
          as: 'department', // 与 User 模型中定义的关联别名一致
          attributes: ['id', 'name'] // 只查询部门的 ID 和名称
        }
      ]
    });

    // 格式化返回数据
    const userList: UserInfo[] = rows.map(user => ({
      id: user.id,
      username: user.username,
      realName: user.realName,
      role: user.role,
      departmentId: user.departmentId,
      // @ts-ignore user.department 在 include 后应该存在
      departmentName: user.department?.name || 'N/A', // 获取关联的部门名称
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }));

    return {
      list: userList,
      total: count,
      page: page,
      pageSize: pageSize,
    };
  }

  // --- 后续添加 createUser, getUserById, updateUser, deleteUser 方法 ---

}

export default new UserService(); 