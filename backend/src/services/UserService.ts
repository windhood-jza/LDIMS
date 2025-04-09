import { User, Department } from '../models';
import { Op } from 'sequelize';
import { PageResult } from '../utils/response';
import { UserInfo, CreateUserRequest, UpdateUserRequest } from '../types/user'; // 确保引入了类型
import { Model } from 'sequelize'; // 引入 Model 类型

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

  /**
   * 创建用户
   * @param userData 用户数据 (包含明文密码)
   * @returns 创建后的用户信息
   * @throws 如果用户名已存在或其他数据库错误
   */
  public async createUser(userData: CreateUserRequest): Promise<UserInfo> {
    // 检查用户名是否已存在 (可选)
    const existingUser = await User.findOne({ where: { username: userData.username } });
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    // 创建用户 (明文密码)
    const newUser = await User.create({
      ...userData,
      status: userData.status ?? 1, // 如果 status 未定义，则默认为 1
      // password: hashedPassword, // 如果需要哈希
    });

    // 查询包含部门信息的新用户以返回
    const createdUserWithDept = await this.getUserById(newUser.id);
    if (!createdUserWithDept) {
      // 理论上创建成功后应该能查到，除非立刻被删除
      throw new Error('创建用户后无法立即查询到该用户');
    }
    return createdUserWithDept;
  }

  /**
   * 根据 ID 获取单个用户信息
   * @param id 用户 ID
   * @returns 用户信息 (包含部门名称) 或 null
   */
  public async getUserById(id: number): Promise<UserInfo | null> {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password', 'deletedAt'] }, // 排除敏感信息
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      realName: user.realName,
      role: user.role,
      departmentId: user.departmentId,
      // @ts-ignore user.department 在 include 后应该存在
      departmentName: user.department?.name || 'N/A',
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  /**
   * 更新用户信息
   * @param id 用户 ID
   * @param userData 更新数据 (密码字段可选，如果提供则更新)
   * @returns 更新后的用户信息或 null
   * @throws 如果尝试更新的用户名已存在(被其他用户占用)
   */
  public async updateUser(id: number, userData: UpdateUserRequest): Promise<UserInfo | null> {
    const user = await User.findByPk(id);
    if (!user) {
      return null; // 用户不存在
    }

    // 检查用户名是否冲突 (如果尝试修改用户名)
    if (userData.username && userData.username !== user.username) {
      const existingUser = await User.findOne({ where: { username: userData.username } });
      if (existingUser && existingUser.id !== id) {
        throw new Error('用户名已被其他用户占用');
      }
    }

    // 准备更新数据 (明文密码处理)
    const updateData: Partial<User> = { ...userData };
    // 如果 userData 中没有提供 password，则不更新密码
    if (userData.password === undefined || userData.password === '') {
       // @ts-ignore 确保排除密码字段
      delete updateData.password;
    } 
    // else { // 如果需要哈希
    //   updateData.password = await bcrypt.hash(userData.password, 10);
    // }

    await user.update(updateData);

    // 返回更新后的用户信息 (包含部门)
    return this.getUserById(id);
  }

  /**
   * 删除用户 (软删除)
   * @param id 用户 ID
   * @returns 是否删除成功 (如果用户存在则返回 true)
   */
  public async deleteUser(id: number): Promise<boolean> {
    const user = await User.findByPk(id);
    if (!user) {
      return false; // 用户不存在
    }
    await user.destroy(); // 执行软删除 (需要模型启用 paranoid: true)
    return true;
  }

}

export default new UserService(); 