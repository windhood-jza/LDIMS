/*
 Navicat Premium Dump SQL

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 80041 (8.0.41)
 Source Host           : localhost:3306
 Source Schema         : ldims_db

 Target Server Type    : MySQL
 Target Server Version : 80041 (8.0.41)
 File Encoding         : 65001

 Date: 17/04/2025 11:24:44
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for departments
-- ----------------------------
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '部门名称',
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '部门编码',
  `parent_id` int NOT NULL DEFAULT 0 COMMENT '父级部门ID，顶级为0',
  `level` tinyint NOT NULL COMMENT '层级：1-一级部门，2-二级部门',
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '排序号',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态: 1-启用, 0-禁用',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deletedAt` datetime NULL DEFAULT NULL COMMENT '逻辑删除时间戳 (由 Sequelize paranoid 管理)',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE,
  INDEX `idx_parent`(`parent_id` ASC) USING BTREE,
  INDEX `idx_code`(`code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '部门表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of departments
-- ----------------------------
INSERT INTO `departments` VALUES (1, '总部', 'HQ', 0, 1, 1, 1, '2025-04-09 09:15:42', '2025-04-09 09:20:10', '2025-04-09 09:20:10');
INSERT INTO `departments` VALUES (2, '技术中心', 'D2', 0, 1, 0, 1, '2025-04-10 00:26:24', '2025-04-10 00:26:24', NULL);
INSERT INTO `departments` VALUES (3, '融合业务部', 'D3', 2, 2, 0, 1, '2025-04-10 00:26:41', '2025-04-10 00:26:41', NULL);
INSERT INTO `departments` VALUES (4, '采购部', 'D4', 2, 2, 1, 1, '2025-04-10 00:26:51', '2025-04-10 00:27:33', '2025-04-10 00:27:33');
INSERT INTO `departments` VALUES (5, '采购部', 'D5', 2, 2, 1, 1, '2025-04-10 00:40:54', '2025-04-14 07:38:10', '2025-04-14 07:38:10');
INSERT INTO `departments` VALUES (6, '综合部', 'D6', 0, 1, 3, 1, '2025-04-10 00:44:21', '2025-04-10 00:44:26', '2025-04-10 00:44:26');
INSERT INTO `departments` VALUES (7, '综合部', 'D7', 2, 2, 3, 1, '2025-04-10 00:44:34', '2025-04-10 00:44:38', '2025-04-10 00:44:38');
INSERT INTO `departments` VALUES (8, '采购部', 'D8', 2, 2, 1, 1, '2025-04-15 01:06:13', '2025-04-15 01:06:13', NULL);
INSERT INTO `departments` VALUES (9, '设备管理部', 'D9', 2, 2, 4, 1, '2025-04-16 08:46:44', '2025-04-16 08:47:11', '2025-04-16 08:47:11');

-- ----------------------------
-- Table structure for doc_types
-- ----------------------------
DROP TABLE IF EXISTS `doc_types`;
CREATE TABLE `doc_types`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '类型名称',
  `parent_id` int NOT NULL DEFAULT 0 COMMENT '父级ID，顶级为0',
  `level` tinyint NOT NULL COMMENT '层级：1-一级，2-二级，3-三级',
  `sort_order` int NOT NULL DEFAULT 0 COMMENT '排序号',
  `created_by` int NOT NULL COMMENT '创建人ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deletedAt` datetime NULL DEFAULT NULL COMMENT '逻辑删除时间戳 (由 Sequelize paranoid 管理)',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_parent`(`parent_id` ASC) USING BTREE,
  INDEX `idx_level`(`level` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 27 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '文档类型表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of doc_types
-- ----------------------------
INSERT INTO `doc_types` VALUES (1, '合同', 0, 1, 0, 1, '2025-04-10 03:44:18', '2025-04-10 03:44:18', NULL);
INSERT INTO `doc_types` VALUES (2, '采购合同', 1, 2, 0, 1, '2025-04-10 03:45:20', '2025-04-10 03:45:20', NULL);
INSERT INTO `doc_types` VALUES (3, '服务合同', 1, 2, 0, 1, '2025-04-10 03:45:40', '2025-04-10 06:00:16', '2025-04-10 06:00:16');
INSERT INTO `doc_types` VALUES (4, '服务合同', 1, 2, 0, 1, '2025-04-10 06:00:28', '2025-04-14 06:45:48', '2025-04-14 06:45:48');
INSERT INTO `doc_types` VALUES (5, '其他合同', 1, 2, 0, 1, '2025-04-10 06:01:04', '2025-04-10 06:01:04', NULL);
INSERT INTO `doc_types` VALUES (6, '招标文件', 0, 1, 0, 1, '2025-04-10 06:02:57', '2025-04-10 06:02:57', NULL);
INSERT INTO `doc_types` VALUES (7, '系统集成', 6, 2, 0, 1, '2025-04-10 06:03:12', '2025-04-10 06:03:12', NULL);
INSERT INTO `doc_types` VALUES (8, '等保测评', 6, 2, 3, 1, '2025-04-10 06:06:13', '2025-04-10 06:06:13', NULL);
INSERT INTO `doc_types` VALUES (9, '安全服务', 6, 2, 1, 1, '2025-04-10 06:06:49', '2025-04-10 06:07:00', '2025-04-10 06:07:00');
INSERT INTO `doc_types` VALUES (10, '安全服务', 6, 2, 1, 1, '2025-04-10 06:11:46', '2025-04-10 06:11:46', NULL);
INSERT INTO `doc_types` VALUES (11, '123', 6, 2, 0, 1, '2025-04-10 06:33:00', '2025-04-10 06:35:23', '2025-04-10 06:35:23');
INSERT INTO `doc_types` VALUES (12, '123', 6, 2, 1, 1, '2025-04-10 06:35:32', '2025-04-14 09:11:57', '2025-04-14 09:11:57');
INSERT INTO `doc_types` VALUES (13, '123', 2, 3, 1, 1, '2025-04-14 03:19:05', '2025-04-14 03:19:08', '2025-04-14 03:19:08');
INSERT INTO `doc_types` VALUES (14, '台红头文件', 0, 1, 0, 1, '2025-04-14 06:57:16', '2025-04-14 06:57:16', NULL);
INSERT INTO `doc_types` VALUES (15, '通知', 0, 1, 0, 1, '2025-04-15 07:34:56', '2025-04-15 07:34:56', NULL);
INSERT INTO `doc_types` VALUES (16, '123', 2, 3, 3, 1, '2025-04-16 06:51:51', '2025-04-16 06:51:56', '2025-04-16 06:51:56');
INSERT INTO `doc_types` VALUES (17, '服务合同', 1, 2, 1, 1, '2025-04-16 09:01:35', '2025-04-16 09:01:35', NULL);
INSERT INTO `doc_types` VALUES (18, '安全服务', 17, 3, 0, 1, '2025-04-16 09:12:50', '2025-04-16 09:15:35', '2025-04-16 09:15:35');
INSERT INTO `doc_types` VALUES (19, '安全服务', 17, 3, 0, 1, '2025-04-16 09:15:52', '2025-04-16 09:15:52', NULL);
INSERT INTO `doc_types` VALUES (20, '等保服务', 17, 3, 1, 1, '2025-04-16 09:15:57', '2025-04-16 09:16:03', NULL);
INSERT INTO `doc_types` VALUES (21, '其他服务', 17, 3, 3, 1, '2025-04-16 09:16:47', '2025-04-16 09:16:47', NULL);
INSERT INTO `doc_types` VALUES (22, '律师函', 0, 1, 0, 1, '2025-04-16 09:17:12', '2025-04-16 09:17:26', '2025-04-16 09:17:26');
INSERT INTO `doc_types` VALUES (23, '律师函', 0, 1, 0, 1, '2025-04-16 09:20:05', '2025-04-16 09:22:28', '2025-04-16 09:22:28');
INSERT INTO `doc_types` VALUES (24, '律师函', 0, 1, 0, 1, '2025-04-16 09:22:35', '2025-04-16 09:22:35', NULL);
INSERT INTO `doc_types` VALUES (25, '律师函', 0, 1, 0, 1, '2025-04-16 09:25:11', '2025-04-17 00:55:20', '2025-04-17 00:55:20');
INSERT INTO `doc_types` VALUES (26, '测试 空格 文档', 0, 1, 0, 1, '2025-04-17 02:13:28', '2025-04-17 02:13:28', NULL);

-- ----------------------------
-- Table structure for documents
-- ----------------------------
DROP TABLE IF EXISTS `documents`;
CREATE TABLE `documents`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `doc_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '文档名称',
  `submitter` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '提交人',
  `receiver` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '接收人',
  `signer` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '落款人, 允许为空',
  `storage_location` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '保管位置',
  `remarks` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '备注说明',
  `handover_date` date NULL DEFAULT NULL COMMENT '交接日期, 允许为空',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '创建人姓名, 允许为空',
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '最后修改人姓名, 允许为空',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deletedAt` datetime NULL DEFAULT NULL COMMENT '逻辑删除时间戳 (由 Sequelize paranoid 管理)',
  `doc_type_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `source_department_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_handover_date`(`handover_date` ASC) USING BTREE,
  INDEX `idx_doc_name`(`doc_name` ASC) USING BTREE,
  FULLTEXT INDEX `idx_content`(`doc_name`, `submitter`, `receiver`, `signer`, `remarks`)
) ENGINE = InnoDB AUTO_INCREMENT = 302 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '文档信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of documents
-- ----------------------------
INSERT INTO `documents` VALUES (99, '合同', '江川', '刘勇', '江川', '624', NULL, '2025-04-14', 'admin', 'admin', '2025-04-14 08:59:21', '2025-04-14 09:01:36', '2025-04-14 09:01:36', '合同', '技术中心');
INSERT INTO `documents` VALUES (100, '启动会纪要', '张经理', '李工', '王总', 'A-101', NULL, '2023-10-01', NULL, NULL, '2025-04-14 09:31:46', '2025-04-14 09:31:46', NULL, '会议纪要', '项目部');
INSERT INTO `documents` VALUES (101, '采购单', '赵采购', '钱库管', NULL, '库房', '加急', '2023-11-05', NULL, NULL, '2025-04-14 09:31:46', '2025-04-14 09:31:46', NULL, '财务凭证', '采购部');
INSERT INTO `documents` VALUES (102, '周报', '周工', '吴主管', NULL, NULL, '本周进展', '2024-01-08', NULL, NULL, '2025-04-14 09:31:46', '2025-04-14 09:31:46', NULL, '工作报告', '研发一部');
INSERT INTO `documents` VALUES (103, '报销单', '郑销售', '财务部', NULL, NULL, '差旅费', NULL, NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '财务凭证', '销售部');
INSERT INTO `documents` VALUES (104, '关于统一邮件签名格式的建议', '屈助理', 'IT部', NULL, NULL, '提高专业形象', '2024-08-28', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '内部建议', '行政部');
INSERT INTO `documents` VALUES (105, '启动会纪要', '张经理', '李工', '王总', 'A-101', NULL, '2023-10-01', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '会议纪要', '项目部');
INSERT INTO `documents` VALUES (106, '采购单', '赵采购', '钱库管', NULL, '库房', '加急', '2023-11-05', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '财务凭证', '采购部');
INSERT INTO `documents` VALUES (107, '周报', '周工', '吴主管', NULL, NULL, '本周进展', '2024-01-08', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '工作报告', '研发一部');
INSERT INTO `documents` VALUES (108, '用户满意度调研问卷结果分析', '秦分析员', '市场总监', NULL, '市场部共享', '包含图表', '2024-06-12', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '市场文档', '市场部');
INSERT INTO `documents` VALUES (109, '设计稿 V1', '冯设计', '陈产品', '史总监', '设计服务器', '初稿', '2024-02-15', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '设计文档', '设计部');
INSERT INTO `documents` VALUES (110, 'XX项目详细设计说明书', '蒋工', '测试组', '沈经理', '文档库/XX项目', 'V1.2 版本', '2024-03-10', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '技术文档', '研发二部');
INSERT INTO `documents` VALUES (111, '供应商XXX公司年度评估报告', '韩采购', '采购总监', NULL, '采购部文件柜', NULL, '2024-04-01', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '评估报告', '采购部');
INSERT INTO `documents` VALUES (112, '关于调整办公区域的通知', '杨助理', '全体员工', '朱经理', NULL, '下周一开始执行', '2024-05-05', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '行政通知', '行政部');
INSERT INTO `documents` VALUES (113, '用户反馈问题分类统计 (当月)', '侯产品助理', '产品经理', NULL, '内部报告', 'Top 3问题已识别', '2024-08-30', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '用户反馈', '产品部');
INSERT INTO `documents` VALUES (114, '服务器例行维护操作记录', '尤工', '许经理', NULL, '运维日志系统', '维护窗口：周日凌晨', '2024-07-01', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '运维记录', 'IT运维部');
INSERT INTO `documents` VALUES (115, '关于进一步加强集团内部信息安全管理与风险控制措施的若干规定（2024修订版）', '何经理', '各部门负责人', '吕总', NULL, '请各部门组织学习并严格遵守', '2023-12-20', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '规章制度', '信息安全部');
INSERT INTO `documents` VALUES (116, '中华人民共和国网络安全法解读与企业合规实践指南（内部培训资料）', '施律师', '各部门合规专员', NULL, '法务部共享盘', '重要！涉及法律风险', '2024-01-25', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '培训资料', '法务部');
INSERT INTO `documents` VALUES (117, '面向大规模分布式系统的高可用架构设计原则与最佳实践案例研究报告', '孔架构师', '技术委员会', NULL, '内部知识库', '包含多种方案对比', '2024-02-28', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '技术研究', '架构部');
INSERT INTO `documents` VALUES (118, '针对XXX行业特定需求的定制化CRM解决方案及其预期投资回报率（ROI）分析', '曹顾问', '销售总监', '严经理', NULL, '提供给重点客户参考', '2024-03-30', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '解决方案', '售前支持部');
INSERT INTO `documents` VALUES (119, '基于机器学习的用户行为预测模型在电商推荐系统中的应用效果评估与优化策略探讨', '华博士', '产品经理团队', NULL, '数据分析平台报告区', '模型准确率提升显著', '2024-04-25', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '数据分析', '数据科学部');
INSERT INTO `documents` VALUES (120, '季度销售数据汇总表', '王销售', '区域经理', NULL, '销售系统导出', NULL, '2024-07-02', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '销售报表', '销售部');
INSERT INTO `documents` VALUES (121, '员工请假申请单', '魏助理', '部门经理', NULL, 'HR系统', '事假申请', '2024-07-05', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '人事流程', '人力资源部');
INSERT INTO `documents` VALUES (122, '软件缺陷跟踪报告 (Bug Report)', '陶测试', '相关开发人员', NULL, 'JIRA系统', '优先级：高', '2024-07-10', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '测试报告', '测试部');
INSERT INTO `documents` VALUES (123, '供应商资质审核文件 - YYY公司', '姜采购', '审核小组', NULL, '供应商档案', '审核通过', '2024-07-15', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '供应商管理', '采购部');
INSERT INTO `documents` VALUES (124, '网站改版项目沟通会议记录', '戚助理', '项目相关人', NULL, '项目管理工具', NULL, '2024-07-18', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '会议纪要', '市场部');
INSERT INTO `documents` VALUES (125, '服务器硬件升级方案 V1.0', '谢工', 'IT经理', NULL, 'IT部文档库', '待审批', '2024-07-20', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '技术方案', 'IT运维部');
INSERT INTO `documents` VALUES (126, '新功能上线发布通知', '邹产品', '全体用户', NULL, '产品公告', '今晚发布', '2024-07-22', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '产品发布', '产品部');
INSERT INTO `documents` VALUES (127, '对外宣传文案 - 新品发布会', '喻文案', '公关部', NULL, '市场部共享', '定稿', '2024-07-25', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '市场文案', '市场部');
INSERT INTO `documents` VALUES (128, '客户回访电话记录 - 王总', '柏销售', '销售经理', NULL, 'CRM', '意向明确', '2024-07-28', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '客户关系', '销售部');
INSERT INTO `documents` VALUES (129, '研发人员技术分享会PPT - 微服务', '水工', '研发团队', NULL, '内部知识库', NULL, '2024-07-30', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '技术分享', '研发一部');
INSERT INTO `documents` VALUES (130, '办公室网络故障处理报告', '窦工', '行政部', NULL, '运维日志', '交换机故障，已解决', '2024-08-01', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '运维记录', 'IT运维部');
INSERT INTO `documents` VALUES (131, '季度培训计划与预算申请', '章培训专员', 'HR经理', NULL, 'HR部门内部', '申请Q4预算', '2024-08-05', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '培训计划', '人力资源部');
INSERT INTO `documents` VALUES (132, '竞品价格策略跟踪分析月报', '云分析员', '市场总监', NULL, '市场分析报告库', '7月数据', '2024-08-08', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '市场分析', '市场部');
INSERT INTO `documents` VALUES (133, '新入职员工背景调查报告 - 李XX', '苏专员', 'HR经理', NULL, '保密文件柜', '无风险', '2024-08-10', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '背景调查', '人力资源部');
INSERT INTO `documents` VALUES (134, '一个非常非常非常非常长的文档名称用来专门测试极端情况下的前端表格单元格内容是否能够正常换行或者显示省略号并且鼠标悬浮时可以显示完整内容', '潘测试', '前端开发', NULL, '测试用例库', '用于UI测试', '2024-08-12', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '测试文档', '测试部');
INSERT INTO `documents` VALUES (135, '系统压力测试报告 V2', '郎测试', '架构部', NULL, '测试报告库', '并发用户数达标', '2024-08-15', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '测试报告', '性能测试组');
INSERT INTO `documents` VALUES (136, '公司知识产权清单', '常律师', '管理层', NULL, '法务部档案室', '截止2024H1', NULL, NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '法律文档', '法务部');
INSERT INTO `documents` VALUES (137, '员工生日福利发放记录', '乐助理', '相关员工', NULL, NULL, '8月份', '2024-08-18', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '员工福利', '行政部');
INSERT INTO `documents` VALUES (138, '生产数据统计分析周报', '丁统计员', '生产经理', NULL, NULL, 'W33数据', '2024-08-19', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '生产报表', '生产部');
INSERT INTO `documents` VALUES (139, '客户案例分享 - ZZZ公司成功经验', '皮编辑', '销售团队', NULL, '公司官网/案例库', '已发布', '2024-08-20', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '成功案例', '市场部');
INSERT INTO `documents` VALUES (140, '这是一个只有标题的简单记录', '录入员A', '接收人B', NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '其他', '未知部门');
INSERT INTO `documents` VALUES (141, '短标题', '测试员', '测试接收', NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '测试', '测试部');
INSERT INTO `documents` VALUES (142, '这是另一个相对较长的文档名称主要目的是为了填充数据并观察列表显示效果', '填充员', '数据管理员', NULL, '数据仓库', NULL, '2024-08-21', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '填充数据', '数据组');
INSERT INTO `documents` VALUES (143, '供应商ABC的合同续签评估', '卞采购', '采购经理', '孙总', '采购系统', '建议续签', '2024-08-22', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '合同评估', '采购部');
INSERT INTO `documents` VALUES (144, '员工社保公积金缴纳明细表', '齐专员', '财务部', NULL, 'HR保密文件', '2024年7月', NULL, NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '薪酬福利', '人力资源部');
INSERT INTO `documents` VALUES (145, '网站服务器迁移计划讨论稿', '元工', '相关部门负责人', NULL, NULL, '内部讨论用', '2024-08-25', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '技术方案', 'IT运维部');
INSERT INTO `documents` VALUES (146, '品牌宣传口号（Slogan）征集活动总结', '步经理', '全体员工', NULL, '公司内网', '评选结果已公示', '2024-08-26', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '品牌活动', '市场部');
INSERT INTO `documents` VALUES (147, '与合作方DDD技术交流会议备忘', '车工', '合作方代表', NULL, NULL, NULL, '2024-08-27', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '会议记录', '研发二部');
INSERT INTO `documents` VALUES (148, '合同', '江川', '张勇', '刘勇', '624房间', '测试', '2025-04-10', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '合同', '技术中心');
INSERT INTO `documents` VALUES (149, '合同', '江川', '张勇', '刘勇', '624房间', '合同数据测试', '2025-04-10', NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, '合同', '技术中心');
INSERT INTO `documents` VALUES (150, '启动会纪要', '张经理', '李工', NULL, 'A-101', NULL, '2023-10-01', NULL, NULL, '2025-04-15 00:26:08', '2025-04-15 00:26:08', NULL, '会议纪要', '项目部');
INSERT INTO `documents` VALUES (151, '采购单', '赵采购', '钱库管', NULL, '库房', '加急', '2023-11-05', NULL, NULL, '2025-04-15 00:26:08', '2025-04-15 00:26:08', NULL, '财务凭证', '采购部');
INSERT INTO `documents` VALUES (152, '周报', '周工', '吴主管', NULL, NULL, '本周进展', '2024-01-08', NULL, NULL, '2025-04-15 00:26:08', '2025-04-15 00:26:08', NULL, '工作报告', '研发一部');
INSERT INTO `documents` VALUES (153, '报销单', '郑销售', '财务部', NULL, NULL, '差旅费', NULL, NULL, NULL, '2025-04-15 00:26:08', '2025-04-15 00:26:08', NULL, '财务凭证', '销售部');
INSERT INTO `documents` VALUES (154, '设计稿 V1', '冯设计', '陈产品', NULL, '设计服务器', '初稿', '2024-02-15', NULL, NULL, '2025-04-15 00:26:08', '2025-04-15 00:26:08', NULL, '设计文档', '设计部');
INSERT INTO `documents` VALUES (155, 'XX项目详细设计说明书', '蒋工', '测试组', NULL, '文档库/XX项目', 'V1.2 版本', '2024-03-10', NULL, NULL, '2025-04-15 00:26:08', '2025-04-15 00:26:08', NULL, '技术文档', '研发二部');
INSERT INTO `documents` VALUES (156, '供应商XXX公司年度评估报告', '韩采购', '采购总监', NULL, '采购部文件柜', NULL, '2024-04-01', NULL, NULL, '2025-04-15 00:26:08', '2025-04-15 00:26:08', NULL, '评估报告', '采购部');
INSERT INTO `documents` VALUES (157, '关于调整办公区域的通知', '杨助理', '全体员工', NULL, NULL, '下周一开始执行', '2024-05-05', NULL, NULL, '2025-04-15 00:26:08', '2025-04-15 00:26:08', NULL, '行政通知', '行政部');
INSERT INTO `documents` VALUES (158, '用户满意度调研问卷结果分析', '秦分析员', '市场总监', NULL, '市场部共享', '包含图表', '2024-06-12', NULL, NULL, '2025-04-15 00:26:08', '2025-04-15 00:26:08', NULL, '市场文档', '市场部');
INSERT INTO `documents` VALUES (159, '关于统一邮件签名格式的建议', '屈助理', 'IT部', NULL, NULL, '提高专业形象', '2024-08-28', NULL, NULL, '2025-04-15 00:26:08', '2025-04-15 00:26:08', NULL, '内部建议', '行政部');
INSERT INTO `documents` VALUES (160, '启动会纪要', '张经理', '李工', '王总', NULL, NULL, NULL, NULL, NULL, '2025-04-15 00:28:04', '2025-04-15 00:28:04', NULL, '会议纪要', '项目部');
INSERT INTO `documents` VALUES (161, '采购单', '赵采购', '钱库管', NULL, NULL, '加急', NULL, NULL, NULL, '2025-04-15 00:28:04', '2025-04-15 00:28:04', NULL, '财务凭证', '采购部');
INSERT INTO `documents` VALUES (162, '周报', '周工', '吴主管', NULL, NULL, '本周进展', NULL, NULL, NULL, '2025-04-15 00:28:04', '2025-04-15 00:28:04', NULL, '工作报告', '研发一部');
INSERT INTO `documents` VALUES (163, '报销单', '郑销售', '财务部', NULL, NULL, '差旅费', NULL, NULL, NULL, '2025-04-15 00:28:04', '2025-04-15 00:28:04', NULL, '财务凭证', '销售部');
INSERT INTO `documents` VALUES (164, '设计稿 V1', '冯设计', '陈产品', '史总监', NULL, '初稿', NULL, NULL, NULL, '2025-04-15 00:28:04', '2025-04-15 00:28:04', NULL, '设计文档', '设计部');
INSERT INTO `documents` VALUES (165, 'XX项目详细设计说明书', '蒋工', '测试组', '沈经理', NULL, 'V1.2 版本', NULL, NULL, NULL, '2025-04-15 00:28:04', '2025-04-15 00:28:04', NULL, '技术文档', '研发二部');
INSERT INTO `documents` VALUES (166, '供应商XXX公司年度评估报告', '韩采购', '采购总监', NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-15 00:28:04', '2025-04-15 00:28:04', NULL, '评估报告', '采购部');
INSERT INTO `documents` VALUES (167, '关于调整办公区域的通知', '杨助理', '全体员工', '朱经理', NULL, '下周一开始执行', NULL, NULL, NULL, '2025-04-15 00:28:04', '2025-04-15 00:28:04', NULL, '行政通知', '行政部');
INSERT INTO `documents` VALUES (168, '用户满意度调研问卷结果分析', '秦分析员', '市场总监', NULL, NULL, '包含图表', NULL, NULL, NULL, '2025-04-15 00:28:04', '2025-04-15 00:28:04', NULL, '市场文档', '市场部');
INSERT INTO `documents` VALUES (169, '关于统一邮件签名格式的建议', '屈助理', 'IT部', NULL, NULL, '提高专业形象', NULL, NULL, NULL, '2025-04-15 00:28:04', '2025-04-15 00:28:04', NULL, '内部建议', '行政部');
INSERT INTO `documents` VALUES (170, '采购单', '赵采购', '钱库管', NULL, '库房', '加急', '2023-11-05', NULL, NULL, '2025-04-15 00:29:54', '2025-04-15 00:29:54', NULL, '财务凭证', '采购部');
INSERT INTO `documents` VALUES (171, '周报', '周工', '吴主管', NULL, NULL, '本周进展', '2024-01-08', NULL, NULL, '2025-04-15 00:29:54', '2025-04-15 00:29:54', NULL, '工作报告', '研发一部');
INSERT INTO `documents` VALUES (172, '用户满意度调研问卷结果分析', '秦分析员', '市场总监', NULL, '市场部共享', '包含图表', '2024-06-12', NULL, NULL, '2025-04-15 00:29:54', '2025-04-15 00:29:54', NULL, '市场文档', '市场部');
INSERT INTO `documents` VALUES (173, '融合生产系统采购合同', '江川', '刘勇', '江川', '624', '', '2025-04-15', 'admin', NULL, '2025-04-15 01:08:40', '2025-04-15 01:08:40', NULL, '合同', '采购部');
INSERT INTO `documents` VALUES (174, '报销单', '郑销售', '财务部', NULL, NULL, '差旅费', NULL, NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '财务凭证', '销售部');
INSERT INTO `documents` VALUES (175, '关于统一邮件签名格式的建议', '屈助理', 'IT部', NULL, NULL, '提高专业形象', '2024-08-28', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '内部建议', '行政部');
INSERT INTO `documents` VALUES (176, '启动会纪要', '张经理', '李工', '王总', 'A-101', NULL, '2023-10-01', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '会议纪要', '项目部');
INSERT INTO `documents` VALUES (177, '采购单', '赵采购', '钱库管', NULL, '库房', '加急', '2023-11-05', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '财务凭证', '采购部');
INSERT INTO `documents` VALUES (178, '周报', '周工', '吴主管', NULL, NULL, '本周进展', '2024-01-08', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '工作报告', '研发一部');
INSERT INTO `documents` VALUES (179, '用户满意度调研问卷结果分析', '秦分析员', '市场总监', NULL, '市场部共享', '包含图表', '2024-06-12', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '市场文档', '市场部');
INSERT INTO `documents` VALUES (180, '设计稿 V1', '冯设计', '陈产品', '史总监', '设计服务器', '初稿', '2024-02-15', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '设计文档', '设计部');
INSERT INTO `documents` VALUES (181, 'XX项目详细设计说明书', '蒋工', '测试组', '沈经理', '文档库/XX项目', 'V1.2 版本', '2024-03-10', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '技术文档', '研发二部');
INSERT INTO `documents` VALUES (182, '供应商XXX公司年度评估报告', '韩采购', '采购总监', NULL, '采购部文件柜', NULL, '2024-04-01', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '评估报告', '采购部');
INSERT INTO `documents` VALUES (183, '关于调整办公区域的通知', '杨助理', '全体员工', '朱经理', NULL, '下周一开始执行', '2024-05-05', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '行政通知', '行政部');
INSERT INTO `documents` VALUES (184, '用户反馈问题分类统计 (当月)', '侯产品助理', '产品经理', NULL, '内部报告', 'Top 3问题已识别', '2024-08-30', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '用户反馈', '产品部');
INSERT INTO `documents` VALUES (185, '服务器例行维护操作记录', '尤工', '许经理', NULL, '运维日志系统', '维护窗口：周日凌晨', '2024-07-01', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '运维记录', 'IT运维部');
INSERT INTO `documents` VALUES (186, '关于进一步加强集团内部信息安全管理与风险控制措施的若干规定（2024修订版）', '何经理', '各部门负责人', '吕总', NULL, '请各部门组织学习并严格遵守', '2023-12-20', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '规章制度', '信息安全部');
INSERT INTO `documents` VALUES (187, '中华人民共和国网络安全法解读与企业合规实践指南（内部培训资料）', '施律师', '各部门合规专员', NULL, '法务部共享盘', '重要！涉及法律风险', '2024-01-25', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '培训资料', '法务部');
INSERT INTO `documents` VALUES (188, '面向大规模分布式系统的高可用架构设计原则与最佳实践案例研究报告', '孔架构师', '技术委员会', NULL, '内部知识库', '包含多种方案对比', '2024-02-28', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '技术研究', '架构部');
INSERT INTO `documents` VALUES (189, '针对XXX行业特定需求的定制化CRM解决方案及其预期投资回报率（ROI）分析', '曹顾问', '销售总监', '严经理', NULL, '提供给重点客户参考', '2024-03-30', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '解决方案', '售前支持部');
INSERT INTO `documents` VALUES (190, '基于机器学习的用户行为预测模型在电商推荐系统中的应用效果评估与优化策略探讨', '华博士', '产品经理团队', NULL, '数据分析平台报告区', '模型准确率提升显著', '2024-04-25', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '数据分析', '数据科学部');
INSERT INTO `documents` VALUES (191, '季度销售数据汇总表', '王销售', '区域经理', NULL, '销售系统导出', NULL, '2024-07-02', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '销售报表', '销售部');
INSERT INTO `documents` VALUES (192, '员工请假申请单', '魏助理', '部门经理', NULL, 'HR系统', '事假申请', '2024-07-05', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '人事流程', '人力资源部');
INSERT INTO `documents` VALUES (193, '软件缺陷跟踪报告 (Bug Report)', '陶测试', '相关开发人员', NULL, 'JIRA系统', '优先级：高', '2024-07-10', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '测试报告', '测试部');
INSERT INTO `documents` VALUES (194, '供应商资质审核文件 - YYY公司', '姜采购', '审核小组', NULL, '供应商档案', '审核通过', '2024-07-15', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '供应商管理', '采购部');
INSERT INTO `documents` VALUES (195, '网站改版项目沟通会议记录', '戚助理', '项目相关人', NULL, '项目管理工具', NULL, '2024-07-18', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '会议纪要', '市场部');
INSERT INTO `documents` VALUES (196, '服务器硬件升级方案 V1.0', '谢工', 'IT经理', NULL, 'IT部文档库', '待审批', '2024-07-20', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '技术方案', 'IT运维部');
INSERT INTO `documents` VALUES (197, '新功能上线发布通知', '邹产品', '全体用户', NULL, '产品公告', '今晚发布', '2024-07-22', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '产品发布', '产品部');
INSERT INTO `documents` VALUES (198, '对外宣传文案 - 新品发布会', '喻文案', '公关部', NULL, '市场部共享', '定稿', '2024-07-25', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '市场文案', '市场部');
INSERT INTO `documents` VALUES (199, '客户回访电话记录 - 王总', '柏销售', '销售经理', NULL, 'CRM', '意向明确', '2024-07-28', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '客户关系', '销售部');
INSERT INTO `documents` VALUES (200, '研发人员技术分享会PPT - 微服务', '水工', '研发团队', NULL, '内部知识库', NULL, '2024-07-30', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '技术分享', '研发一部');
INSERT INTO `documents` VALUES (201, '办公室网络故障处理报告', '窦工', '行政部', NULL, '运维日志', '交换机故障，已解决', '2024-08-01', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '运维记录', 'IT运维部');
INSERT INTO `documents` VALUES (202, '季度培训计划与预算申请', '章培训专员', 'HR经理', NULL, 'HR部门内部', '申请Q4预算', '2024-08-05', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '培训计划', '人力资源部');
INSERT INTO `documents` VALUES (203, '竞品价格策略跟踪分析月报', '云分析员', '市场总监', NULL, '市场分析报告库', '7月数据', '2024-08-08', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '市场分析', '市场部');
INSERT INTO `documents` VALUES (204, '新入职员工背景调查报告 - 李XX', '苏专员', 'HR经理', NULL, '保密文件柜', '无风险', '2024-08-10', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '背景调查', '人力资源部');
INSERT INTO `documents` VALUES (205, '一个非常非常非常非常长的文档名称用来专门测试极端情况下的前端表格单元格内容是否能够正常换行或者显示省略号并且鼠标悬浮时可以显示完整内容', '潘测试', '前端开发', NULL, '测试用例库', '用于UI测试', '2024-08-12', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '测试文档', '测试部');
INSERT INTO `documents` VALUES (206, '系统压力测试报告 V2', '郎测试', '架构部', NULL, '测试报告库', '并发用户数达标', '2024-08-15', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '测试报告', '性能测试组');
INSERT INTO `documents` VALUES (207, '公司知识产权清单', '常律师', '管理层', NULL, '法务部档案室', '截止2024H1', NULL, NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '法律文档', '法务部');
INSERT INTO `documents` VALUES (208, '员工生日福利发放记录', '乐助理', '相关员工', NULL, NULL, '8月份', '2024-08-18', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '员工福利', '行政部');
INSERT INTO `documents` VALUES (209, '生产数据统计分析周报', '丁统计员', '生产经理', NULL, NULL, 'W33数据', '2024-08-19', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '生产报表', '生产部');
INSERT INTO `documents` VALUES (210, '客户案例分享 - ZZZ公司成功经验', '皮编辑', '销售团队', NULL, '公司官网/案例库', '已发布', '2024-08-20', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '成功案例', '市场部');
INSERT INTO `documents` VALUES (211, '这是一个只有标题的简单记录', '录入员A', '接收人B', NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '其他', '未知部门');
INSERT INTO `documents` VALUES (212, '短标题', '测试员', '测试接收', NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '测试', '测试部');
INSERT INTO `documents` VALUES (213, '这是另一个相对较长的文档名称主要目的是为了填充数据并观察列表显示效果', '填充员', '数据管理员', NULL, '数据仓库', NULL, '2024-08-21', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '填充数据', '数据组');
INSERT INTO `documents` VALUES (214, '供应商ABC的合同续签评估', '卞采购', '采购经理', '孙总', '采购系统', '建议续签', '2024-08-22', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '合同评估', '采购部');
INSERT INTO `documents` VALUES (215, '员工社保公积金缴纳明细表', '齐专员', '财务部', NULL, 'HR保密文件', '2024年7月', NULL, NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '薪酬福利', '人力资源部');
INSERT INTO `documents` VALUES (216, '网站服务器迁移计划讨论稿', '元工', '相关部门负责人', NULL, NULL, '内部讨论用', '2024-08-25', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '技术方案', 'IT运维部');
INSERT INTO `documents` VALUES (217, '品牌宣传口号（Slogan）征集活动总结', '步经理', '全体员工', NULL, '公司内网', '评选结果已公示', '2024-08-26', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '品牌活动', '市场部');
INSERT INTO `documents` VALUES (218, '与合作方DDD技术交流会议备忘', '车工', '合作方代表', NULL, NULL, NULL, '2024-08-27', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '会议记录', '研发二部');
INSERT INTO `documents` VALUES (219, '合同', '江川', '张勇', '刘勇', '624房间', '测试', '2025-04-10', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '合同', '技术中心');
INSERT INTO `documents` VALUES (220, '合同', '江川', '张勇', '刘勇', '624房间', '合同数据测试', '2025-04-10', NULL, NULL, '2025-04-16 06:53:10', '2025-04-16 06:53:10', NULL, '合同', '技术中心');
INSERT INTO `documents` VALUES (221, '合同', '江川', '刘勇', '江川', '624', NULL, '2025-04-14', NULL, NULL, '2025-04-16 06:53:42', '2025-04-16 06:53:42', NULL, '合同', '技术中心');
INSERT INTO `documents` VALUES (222, '报销单', '郑销售', '财务部', NULL, NULL, '差旅费', NULL, NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '财务凭证', '销售部');
INSERT INTO `documents` VALUES (223, '关于统一邮件签名格式的建议', '屈助理', 'IT部', NULL, NULL, '提高专业形象', '2024-08-28', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '内部建议', '行政部');
INSERT INTO `documents` VALUES (224, '启动会纪要', '张经理', '李工', '王总', 'A-101', NULL, '2023-10-01', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '会议纪要', '项目部');
INSERT INTO `documents` VALUES (225, '采购单', '赵采购', '钱库管', NULL, '库房', '加急', '2023-11-05', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '财务凭证', '采购部');
INSERT INTO `documents` VALUES (226, '周报', '周工', '吴主管', NULL, NULL, '本周进展', '2024-01-08', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '工作报告', '研发一部');
INSERT INTO `documents` VALUES (227, '用户满意度调研问卷结果分析', '秦分析员', '市场总监', NULL, '市场部共享', '包含图表', '2024-06-12', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '市场文档', '市场部');
INSERT INTO `documents` VALUES (228, '设计稿 V1', '冯设计', '陈产品', '史总监', '设计服务器', '初稿', '2024-02-15', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '设计文档', '设计部');
INSERT INTO `documents` VALUES (229, 'XX项目详细设计说明书', '蒋工', '测试组', '沈经理', '文档库/XX项目', 'V1.2 版本', '2024-03-10', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '技术文档', '研发二部');
INSERT INTO `documents` VALUES (230, '供应商XXX公司年度评估报告', '韩采购', '采购总监', NULL, '采购部文件柜', NULL, '2024-04-01', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '评估报告', '采购部');
INSERT INTO `documents` VALUES (231, '关于调整办公区域的通知', '杨助理', '全体员工', '朱经理', NULL, '下周一开始执行', '2024-05-05', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '行政通知', '行政部');
INSERT INTO `documents` VALUES (232, '用户反馈问题分类统计 (当月)', '侯产品助理', '产品经理', NULL, '内部报告', 'Top 3问题已识别', '2024-08-30', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '用户反馈', '产品部');
INSERT INTO `documents` VALUES (233, '服务器例行维护操作记录', '尤工', '许经理', NULL, '运维日志系统', '维护窗口：周日凌晨', '2024-07-01', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '运维记录', 'IT运维部');
INSERT INTO `documents` VALUES (234, '关于进一步加强集团内部信息安全管理与风险控制措施的若干规定（2024修订版）', '何经理', '各部门负责人', '吕总', NULL, '请各部门组织学习并严格遵守', '2023-12-20', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '规章制度', '信息安全部');
INSERT INTO `documents` VALUES (235, '中华人民共和国网络安全法解读与企业合规实践指南（内部培训资料）', '施律师', '各部门合规专员', NULL, '法务部共享盘', '重要！涉及法律风险', '2024-01-25', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '培训资料', '法务部');
INSERT INTO `documents` VALUES (236, '面向大规模分布式系统的高可用架构设计原则与最佳实践案例研究报告', '孔架构师', '技术委员会', NULL, '内部知识库', '包含多种方案对比', '2024-02-28', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '技术研究', '架构部');
INSERT INTO `documents` VALUES (237, '针对XXX行业特定需求的定制化CRM解决方案及其预期投资回报率（ROI）分析', '曹顾问', '销售总监', '严经理', NULL, '提供给重点客户参考', '2024-03-30', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '解决方案', '售前支持部');
INSERT INTO `documents` VALUES (238, '基于机器学习的用户行为预测模型在电商推荐系统中的应用效果评估与优化策略探讨', '华博士', '产品经理团队', NULL, '数据分析平台报告区', '模型准确率提升显著', '2024-04-25', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '数据分析', '数据科学部');
INSERT INTO `documents` VALUES (239, '季度销售数据汇总表', '王销售', '区域经理', NULL, '销售系统导出', NULL, '2024-07-02', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '销售报表', '销售部');
INSERT INTO `documents` VALUES (240, '员工请假申请单', '魏助理', '部门经理', NULL, 'HR系统', '事假申请', '2024-07-05', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '人事流程', '人力资源部');
INSERT INTO `documents` VALUES (241, '软件缺陷跟踪报告 (Bug Report)', '陶测试', '相关开发人员', NULL, 'JIRA系统', '优先级：高', '2024-07-10', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '测试报告', '测试部');
INSERT INTO `documents` VALUES (242, '供应商资质审核文件 - YYY公司', '姜采购', '审核小组', NULL, '供应商档案', '审核通过', '2024-07-15', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '供应商管理', '采购部');
INSERT INTO `documents` VALUES (243, '网站改版项目沟通会议记录', '戚助理', '项目相关人', NULL, '项目管理工具', NULL, '2024-07-18', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '会议纪要', '市场部');
INSERT INTO `documents` VALUES (244, '服务器硬件升级方案 V1.0', '谢工', 'IT经理', NULL, 'IT部文档库', '待审批', '2024-07-20', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '技术方案', 'IT运维部');
INSERT INTO `documents` VALUES (245, '新功能上线发布通知', '邹产品', '全体用户', NULL, '产品公告', '今晚发布', '2024-07-22', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 09:01:51', '2025-04-16 09:01:51', '产品发布', '产品部');
INSERT INTO `documents` VALUES (246, '对外宣传文案 - 新品发布会', '喻文案', '公关部', NULL, '市场部共享', '定稿', '2024-07-25', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '市场文案', '市场部');
INSERT INTO `documents` VALUES (247, '客户回访电话记录 - 王总', '柏销售', '销售经理', NULL, 'CRM', '意向明确', '2024-07-28', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '客户关系', '销售部');
INSERT INTO `documents` VALUES (248, '研发人员技术分享会PPT - 微服务', '水工', '研发团队', NULL, '内部知识库', NULL, '2024-07-30', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '技术分享', '研发一部');
INSERT INTO `documents` VALUES (249, '办公室网络故障处理报告', '窦工', '行政部', NULL, '运维日志', '交换机故障，已解决', '2024-08-01', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '运维记录', 'IT运维部');
INSERT INTO `documents` VALUES (250, '季度培训计划与预算申请', '章培训专员', 'HR经理', NULL, 'HR部门内部', '申请Q4预算', '2024-08-05', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '培训计划', '人力资源部');
INSERT INTO `documents` VALUES (251, '竞品价格策略跟踪分析月报', '云分析员', '市场总监', NULL, '市场分析报告库', '7月数据', '2024-08-08', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '市场分析', '市场部');
INSERT INTO `documents` VALUES (252, '新入职员工背景调查报告 - 李XX', '苏专员', 'HR经理', NULL, '保密文件柜', '无风险', '2024-08-10', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '背景调查', '人力资源部');
INSERT INTO `documents` VALUES (253, '一个非常非常非常非常长的文档名称用来专门测试极端情况下的前端表格单元格内容是否能够正常换行或者显示省略号并且鼠标悬浮时可以显示完整内容', '潘测试', '前端开发', NULL, '测试用例库', '用于UI测试', '2024-08-12', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '测试文档', '测试部');
INSERT INTO `documents` VALUES (254, '系统压力测试报告 V2', '郎测试', '架构部', NULL, '测试报告库', '并发用户数达标', '2024-08-15', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '测试报告', '性能测试组');
INSERT INTO `documents` VALUES (255, '公司知识产权清单', '常律师', '管理层', NULL, '法务部档案室', '截止2024H1', NULL, NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '法律文档', '法务部');
INSERT INTO `documents` VALUES (256, '员工生日福利发放记录', '乐助理', '相关员工', NULL, NULL, '8月份', '2024-08-18', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '员工福利', '行政部');
INSERT INTO `documents` VALUES (257, '生产数据统计分析周报', '丁统计员', '生产经理', NULL, NULL, 'W33数据', '2024-08-19', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '生产报表', '生产部');
INSERT INTO `documents` VALUES (258, '客户案例分享 - ZZZ公司成功经验', '皮编辑', '销售团队', NULL, '公司官网/案例库', '已发布', '2024-08-20', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '成功案例', '市场部');
INSERT INTO `documents` VALUES (259, '这是一个只有标题的简单记录', '录入员A', '接收人B', NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '其他', '未知部门');
INSERT INTO `documents` VALUES (260, '短标题', '测试员', '测试接收', NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '测试', '测试部');
INSERT INTO `documents` VALUES (261, '这是另一个相对较长的文档名称主要目的是为了填充数据并观察列表显示效果', '填充员', '数据管理员', NULL, '数据仓库', NULL, '2024-08-21', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '填充数据', '数据组');
INSERT INTO `documents` VALUES (262, '供应商ABC的合同续签评估', '卞采购', '采购经理', '孙总', '采购系统', '建议续签', '2024-08-22', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '合同评估', '采购部');
INSERT INTO `documents` VALUES (263, '员工社保公积金缴纳明细表', '齐专员', '财务部', NULL, 'HR保密文件', '2024年7月', NULL, NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '薪酬福利', '人力资源部');
INSERT INTO `documents` VALUES (264, '网站服务器迁移计划讨论稿', '元工', '相关部门负责人', NULL, NULL, '内部讨论用', '2024-08-25', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '技术方案', 'IT运维部');
INSERT INTO `documents` VALUES (265, '品牌宣传口号（Slogan）征集活动总结', '步经理', '全体员工', NULL, '公司内网', '评选结果已公示', '2024-08-26', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '品牌活动', '市场部');
INSERT INTO `documents` VALUES (266, '与合作方DDD技术交流会议备忘', '车工', '合作方代表', NULL, NULL, NULL, '2024-08-27', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '会议记录', '研发二部');
INSERT INTO `documents` VALUES (267, '合同', '江川', '张勇', '刘勇', '624房间', '测试', '2025-04-10', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '合同', '技术中心');
INSERT INTO `documents` VALUES (268, '合同', '江川', '张勇', '刘勇', '624房间', '合同数据测试', '2025-04-10', NULL, NULL, '2025-04-16 06:57:13', '2025-04-16 06:57:13', NULL, '合同', '技术中心');
INSERT INTO `documents` VALUES (269, '1', '江川', '刘勇1', '江川', '624', '', '2025-04-16', 'admin', 'admin', '2025-04-16 09:02:20', '2025-04-16 09:02:51', '2025-04-16 09:02:51', '招标文件', '技术中心');
INSERT INTO `documents` VALUES (270, '针对XXX行业特定需求的定制化CRM解决方案及其预期投资回报率（ROI）分析', '曹顾问', '销售总监', '严经理', NULL, '提供给重点客户参考', '2024-03-30', NULL, NULL, '2025-04-17 00:50:13', '2025-04-17 00:50:13', NULL, '解决方案', '售前支持部');
INSERT INTO `documents` VALUES (271, '基于机器学习的用户行为预测模型在电商推荐系统中的应用效果评估与优化策略探讨', '华博士', '产品经理团队', NULL, '数据分析平台报告区', '模型准确率提升显著', '2024-04-25', NULL, NULL, '2025-04-17 00:50:13', '2025-04-17 00:50:13', NULL, '数据分析', '数据科学部');
INSERT INTO `documents` VALUES (272, '季度销售数据汇总表', '王销售', '区域经理', NULL, '销售系统导出', NULL, '2024-07-02', NULL, NULL, '2025-04-17 00:50:13', '2025-04-17 00:50:13', NULL, '销售报表', '销售部');
INSERT INTO `documents` VALUES (273, '员工请假申请单', '魏助理', '部门经理', NULL, 'HR系统', '事假申请', '2024-07-05', NULL, NULL, '2025-04-17 00:50:13', '2025-04-17 00:50:13', NULL, '人事流程', '人力资源部');
INSERT INTO `documents` VALUES (274, '软件缺陷跟踪报告 (Bug Report)', '陶测试', '相关开发人员', NULL, 'JIRA系统', '优先级：高', '2024-07-10', NULL, NULL, '2025-04-17 00:50:13', '2025-04-17 00:50:13', NULL, '测试报告', '测试部');
INSERT INTO `documents` VALUES (275, '供应商资质审核文件 - YYY公司', '姜采购', '审核小组', NULL, '供应商档案', '审核通过', '2024-07-15', NULL, NULL, '2025-04-17 00:50:13', '2025-04-17 00:50:13', NULL, '供应商管理', '采购部');
INSERT INTO `documents` VALUES (276, '网站改版项目沟通会议记录', '戚助理', '项目相关人', NULL, '项目管理工具', NULL, '2024-07-18', NULL, NULL, '2025-04-17 00:50:13', '2025-04-17 00:50:13', NULL, '会议纪要', '市场部');
INSERT INTO `documents` VALUES (277, '服务器硬件升级方案 V1.0', '谢工', 'IT经理', NULL, 'IT部文档库', '待审批', '2024-07-20', NULL, NULL, '2025-04-17 00:50:13', '2025-04-17 00:50:13', NULL, '技术方案', 'IT运维部');
INSERT INTO `documents` VALUES (278, '对外宣传文案 - 新品发布会', '喻文案', '公关部', NULL, '市场部共享', '定稿', '2024-07-25', NULL, NULL, '2025-04-17 00:50:13', '2025-04-17 00:50:13', NULL, '市场文案', '市场部');
INSERT INTO `documents` VALUES (279, '研发人员技术分享会PPT - 微服务', '水工', '研发团队', NULL, '内部知识库', NULL, '2024-07-30', NULL, NULL, '2025-04-17 00:50:13', '2025-04-17 00:50:13', NULL, '技术分享', '研发一部');
INSERT INTO `documents` VALUES (280, '针对XXX行业特定需求的定制化CRM解决方案及其预期投资回报率（ROI）分析', '曹顾问', '销售总监', '严经理', NULL, '提供给重点客户参考', '2024-03-30', NULL, NULL, '2025-04-17 00:53:35', '2025-04-17 00:53:35', NULL, '解决方案', '售前支持部');
INSERT INTO `documents` VALUES (281, '基于机器学习的用户行为预测模型在电商推荐系统中的应用效果评估与优化策略探讨', '华博士', '产品经理团队', NULL, '数据分析平台报告区', '模型准确率提升显著', '2024-04-25', NULL, NULL, '2025-04-17 00:53:35', '2025-04-17 00:53:35', NULL, '数据分析', '数据科学部');
INSERT INTO `documents` VALUES (282, '季度销售数据汇总表', '王销售', '区域经理', NULL, '销售系统导出', NULL, '2024-07-02', NULL, NULL, '2025-04-17 00:53:35', '2025-04-17 00:53:35', NULL, '销售报表', '销售部');
INSERT INTO `documents` VALUES (283, '员工请假申请单', '魏助理', '部门经理', NULL, 'HR系统', '事假申请', '2024-07-05', NULL, NULL, '2025-04-17 00:53:35', '2025-04-17 00:53:35', NULL, '人事流程', '人力资源部');
INSERT INTO `documents` VALUES (284, '软件缺陷跟踪报告 (Bug Report)', '陶测试', '相关开发人员', NULL, 'JIRA系统', '优先级：高', '2024-07-10', NULL, NULL, '2025-04-17 00:53:35', '2025-04-17 00:53:35', NULL, '测试报告', '测试部');
INSERT INTO `documents` VALUES (285, '供应商资质审核文件 - YYY公司', '姜采购', '审核小组', NULL, '供应商档案', '审核通过', '2024-07-15', NULL, NULL, '2025-04-17 00:53:35', '2025-04-17 00:53:35', NULL, '供应商管理', '采购部');
INSERT INTO `documents` VALUES (286, '网站改版项目沟通会议记录', '戚助理', '项目相关人', NULL, '项目管理工具', NULL, '2024-07-18', NULL, NULL, '2025-04-17 00:53:35', '2025-04-17 00:53:35', NULL, '会议纪要', '市场部');
INSERT INTO `documents` VALUES (287, '服务器硬件升级方案 V1.0', '谢工', 'IT经理', NULL, 'IT部文档库', '待审批', '2024-07-20', NULL, NULL, '2025-04-17 00:53:35', '2025-04-17 00:53:35', NULL, '技术方案', 'IT运维部');
INSERT INTO `documents` VALUES (288, '对外宣传文案 - 新品发布会', '喻文案', '公关部', NULL, '市场部共享', '定稿', '2024-07-25', NULL, NULL, '2025-04-17 00:53:35', '2025-04-17 00:53:35', NULL, '市场文案', '市场部');
INSERT INTO `documents` VALUES (289, '研发人员技术分享会PPT - 微服务', '水工', '研发团队', NULL, '内部知识库', NULL, '2024-07-30', NULL, NULL, '2025-04-17 00:53:35', '2025-04-17 00:53:35', NULL, '技术分享', '研发一部');
INSERT INTO `documents` VALUES (290, '报销单', '郑销售', '财务部', NULL, NULL, '差旅费', NULL, NULL, NULL, '2025-04-17 00:56:41', '2025-04-17 00:56:41', NULL, '财务凭证', '销售部');
INSERT INTO `documents` VALUES (291, '启动会纪要', '张经理', '李工', '王总', 'A-101', NULL, '2023-10-01', NULL, NULL, '2025-04-17 00:56:41', '2025-04-17 00:56:41', NULL, '会议纪要', '项目部');
INSERT INTO `documents` VALUES (292, '采购单', '赵采购', '钱库管', NULL, '库房', '加急', '2023-11-05', NULL, NULL, '2025-04-17 00:56:41', '2025-04-17 00:56:41', NULL, '财务凭证', '采购部');
INSERT INTO `documents` VALUES (293, '周报', '周工', '吴主管', NULL, NULL, '本周进展', '2024-01-08', NULL, NULL, '2025-04-17 00:56:41', '2025-04-17 00:56:41', NULL, '工作报告', '研发一部');
INSERT INTO `documents` VALUES (294, '用户满意度调研问卷结果分析', '秦分析员', '市场总监', NULL, '市场部共享', '包含图表', '2024-06-12', NULL, NULL, '2025-04-17 00:56:41', '2025-04-17 00:56:41', NULL, '市场文档', '市场部');
INSERT INTO `documents` VALUES (295, 'XX项目详细设计说明书', '蒋工', '测试组1', '沈经理', '文档库/XX项目', 'V1.2 版本', '2024-03-10', NULL, 'admin', '2025-04-17 00:56:41', '2025-04-17 02:22:34', NULL, '技术文档', '研发二部');
INSERT INTO `documents` VALUES (296, '供应商XXX公司年度评估报告', '韩采购', '采购总监', NULL, '采购部文件柜', NULL, '2024-04-01', NULL, NULL, '2025-04-17 00:56:41', '2025-04-17 00:56:41', NULL, '评估报告', '采购部');
INSERT INTO `documents` VALUES (297, '关于调整办公区域的通知', '杨助理', '全体员工', '朱经理', NULL, '下周一开始执行', '2024-05-05', NULL, NULL, '2025-04-17 00:56:41', '2025-04-17 00:56:41', NULL, '行政通知', '行政部');
INSERT INTO `documents` VALUES (298, '品牌宣传口号（Slogan）征集活动总结', '步经理', '全体员工', NULL, '公司内网', '评选结果已公示', '2024-08-26', NULL, NULL, '2025-04-17 00:56:41', '2025-04-17 00:56:41', NULL, '品牌活动', '市场部');
INSERT INTO `documents` VALUES (299, '合同', '江川', '张勇', '刘勇', '624房间', '合同数据测试', '2025-04-10', NULL, NULL, '2025-04-17 00:56:41', '2025-04-17 00:56:41', NULL, '合同', '技术中心');
INSERT INTO `documents` VALUES (300, '1', '江川', '马文颖', '刘勇', '', '', '2025-04-16', 'admin', NULL, '2025-04-17 02:14:20', '2025-04-17 02:20:03', '2025-04-17 02:20:03', '合同', '技术中心');
INSERT INTO `documents` VALUES (301, '1', '1', '1', NULL, '', '', '2025-04-15', 'admin', NULL, '2025-04-17 02:22:49', '2025-04-17 02:22:53', '2025-04-17 02:22:53', '合同', '技术中心');

-- ----------------------------
-- Table structure for export_tasks
-- ----------------------------
DROP TABLE IF EXISTS `export_tasks`;
CREATE TABLE `export_tasks`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` int NOT NULL COMMENT '用户ID',
  `task_type` enum('document_export','document_import') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'document_export' COMMENT '任务类型: document_export, document_import',
  `status` tinyint NOT NULL DEFAULT 0 COMMENT '状态：0-待处理，1-处理中，2-完成，3-失败',
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '文件名 (导入时原始文件名/导出时生成文件名)',
  `file_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '文件类型 (e.g., xlsx, csv)',
  `query_criteria` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '导出时使用的查询条件 (JSON)',
  `progress` int NULL DEFAULT 0 COMMENT '导出进度 (0-100)',
  `selected_fields` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '用户选择的导出字段 (JSON 数组)',
  `file_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '文件路径',
  `error_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '错误信息',
  `export_Scope` enum('all','selected','currentPage') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'all' COMMENT '导出范围: all(根据查询条件), selected(根据选中ID), currentPage(根据当前页)',
  `selected_ids` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '选中项的 ID 列表 (JSON 数组)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `currentPageIds` json NULL COMMENT '当前页的 ID 列表 (JSON 数组)',
  `total_rows` int NULL DEFAULT NULL COMMENT '导入文件总行数',
  `processed_rows` int NULL DEFAULT NULL COMMENT '已处理行数',
  `success_count` int NULL DEFAULT NULL COMMENT '成功导入行数',
  `failure_count` int NULL DEFAULT NULL COMMENT '导入失败行数',
  `error_details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '详细错误信息 (例如 JSON 数组 [{row: number, error: string}])',
  `originalFileName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '导入任务的原始文件名',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user`(`user_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_task_type`(`task_type` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 46 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '导出与导入任务表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of export_tasks
-- ----------------------------
INSERT INTO `export_tasks` VALUES (1, 1, 'document_export', 2, 'documents_export_1_2025-04-11T02-11-40-832Z.csv', 'xlsx', '{\"docName\":\"\",\"submitter\":\"\",\"receiver\":\"\",\"docTypeId\":null,\"sourceDepartmentId\":null,\"docTypeNameFilter\":\"\",\"sourceDepartmentNameFilter\":\"\",\"signer\":\"\",\"handoverDateRange\":null}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\uploads\\exports\\documents_export_1_2025-04-11T02-11-40-832Z.csv', NULL, 'all', NULL, '2025-04-11 02:11:40', '2025-04-11 02:11:42', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (2, 1, 'document_export', 2, 'documents_export_1_2025-04-11T02-33-36-812Z.csv', 'xlsx', '{\"docName\":\"\",\"submitter\":\"\",\"receiver\":\"\",\"docTypeId\":null,\"sourceDepartmentId\":null,\"docTypeNameFilter\":\"\",\"sourceDepartmentNameFilter\":\"\",\"signer\":\"\",\"handoverDateRange\":null}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\uploads\\exports\\documents_export_1_2025-04-11T02-33-36-812Z.csv', NULL, 'all', NULL, '2025-04-11 02:33:36', '2025-04-11 02:33:37', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (3, 1, 'document_export', 2, 'documents_export_3_2025-04-11T02-40-25-626Z.xlsx', 'xlsx', '{\"docName\":\"\",\"submitter\":\"\",\"receiver\":\"\",\"docTypeId\":null,\"sourceDepartmentId\":null,\"docTypeNameFilter\":\"\",\"sourceDepartmentNameFilter\":\"\",\"signer\":\"\",\"handoverDateRange\":null}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_3_2025-04-11T02-40-25-626Z.xlsx', NULL, 'all', NULL, '2025-04-11 02:40:25', '2025-04-11 02:40:25', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (4, 1, 'document_export', 2, 'documents_export_4_2025-04-11T02-43-08-536Z.xlsx', 'xlsx', '{\"docName\":\"\",\"submitter\":\"\",\"receiver\":\"\",\"docTypeId\":null,\"sourceDepartmentId\":null,\"docTypeNameFilter\":\"\",\"sourceDepartmentNameFilter\":\"\",\"signer\":\"\",\"handoverDateRange\":null}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_4_2025-04-11T02-43-08-536Z.xlsx', NULL, 'all', NULL, '2025-04-11 02:43:07', '2025-04-11 02:43:08', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (5, 1, 'document_export', 2, 'documents_export_5_2025-04-11T03-02-47-043Z.xlsx', 'xlsx', '{\"docName\":\"\",\"submitter\":\"\",\"receiver\":\"\",\"docTypeId\":null,\"sourceDepartmentId\":null,\"docTypeNameFilter\":\"\",\"sourceDepartmentNameFilter\":\"\",\"signer\":\"\",\"handoverDateRange\":null}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_5_2025-04-11T03-02-47-043Z.xlsx', NULL, 'all', NULL, '2025-04-11 03:02:46', '2025-04-11 03:02:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (6, 1, 'document_export', 3, NULL, 'xlsx', NULL, NULL, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', NULL, 'Unknown column \'docTypeId\' in \'field list\'', 'selected', '[57,97,55,54]', '2025-04-11 06:23:00', '2025-04-11 06:23:01', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (7, 1, 'document_export', 2, 'documents_export_7_2025-04-11T06-24-36-042Z.csv', 'csv', '{\"docName\":\"\",\"submitter\":\"\",\"receiver\":\"\",\"docTypeId\":null,\"sourceDepartmentId\":null,\"docTypeNameFilter\":\"\",\"sourceDepartmentNameFilter\":\"\",\"signer\":\"\",\"handoverDateRange\":null}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_7_2025-04-11T06-24-36-042Z.csv', NULL, 'all', NULL, '2025-04-11 06:24:35', '2025-04-11 06:24:36', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (8, 1, 'document_export', 3, NULL, 'xlsx', NULL, NULL, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', NULL, 'Unknown column \'docTypeId\' in \'field list\'', 'selected', '[56,62,58]', '2025-04-11 06:35:03', '2025-04-11 06:35:04', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (9, 1, 'document_export', 3, NULL, 'xlsx', NULL, NULL, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', NULL, 'Unknown column \'docTypeId\' in \'field list\'', 'selected', '[55,56,62]', '2025-04-11 06:35:24', '2025-04-11 06:35:25', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (10, 1, 'document_export', 2, 'documents_export_10_2025-04-11T06-41-12-451Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_10_2025-04-11T06-41-12-451Z.xlsx', NULL, 'selected', '[55,56,62]', '2025-04-11 06:41:11', '2025-04-11 06:41:12', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (11, 1, 'document_export', 2, 'documents_export_11_2025-04-11T06-43-13-105Z.xlsx', 'xlsx', '{\"docName\":\"\",\"submitter\":\"\",\"receiver\":\"\",\"docTypeId\":null,\"sourceDepartmentId\":null,\"docTypeNameFilter\":\"\",\"sourceDepartmentNameFilter\":\"\",\"signer\":\"\",\"handoverDateRange\":null}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_11_2025-04-11T06-43-13-105Z.xlsx', NULL, 'all', NULL, '2025-04-11 06:43:11', '2025-04-11 06:43:13', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (12, 1, 'document_export', 2, 'documents_export_12_2025-04-11T07-00-58-555Z.xlsx', 'xlsx', '{\"docName\":\"\",\"submitter\":\"\",\"receiver\":\"\",\"docTypeId\":null,\"sourceDepartmentId\":null,\"docTypeNameFilter\":\"\",\"sourceDepartmentNameFilter\":\"\",\"signer\":\"\",\"handoverDateRange\":null}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_12_2025-04-11T07-00-58-555Z.xlsx', NULL, 'all', NULL, '2025-04-11 07:00:58', '2025-04-11 07:00:58', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (13, 1, 'document_export', 2, 'documents_export_13_2025-04-11T07-04-00-667Z.xlsx', 'xlsx', '{\"docName\":\"\",\"submitter\":\"\",\"receiver\":\"\",\"docTypeId\":null,\"sourceDepartmentId\":null,\"docTypeNameFilter\":\"\",\"sourceDepartmentNameFilter\":\"\",\"signer\":\"\",\"handoverDateRange\":null}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_13_2025-04-11T07-04-00-667Z.xlsx', NULL, 'all', NULL, '2025-04-11 07:04:00', '2025-04-11 07:04:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (14, 1, 'document_export', 2, 'documents_export_14_2025-04-11T07-28-00-241Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_14_2025-04-11T07-28-00-241Z.xlsx', NULL, 'currentPage', NULL, '2025-04-11 07:27:59', '2025-04-11 07:28:00', '\"[57,97,54,55,56,62,58,59,60,61,98,63,64,65,66,67,68,69,70,71]\"', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (15, 1, 'document_export', 2, 'documents_export_15_2025-04-11T07-33-11-209Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"remarks\",\"createdByName\",\"updatedByName\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_15_2025-04-11T07-33-11-209Z.xlsx', NULL, 'currentPage', NULL, '2025-04-11 07:33:10', '2025-04-11 07:33:11', '\"[57,97,54,55,56,62,58,59,60,61]\"', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (16, 1, 'document_export', 2, 'documents_export_16_2025-04-14T01-15-40-471Z.xlsx', 'xlsx', '{}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_16_2025-04-14T01-15-40-471Z.xlsx', NULL, 'all', NULL, '2025-04-14 01:15:39', '2025-04-14 01:15:40', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (17, 1, 'document_export', 3, NULL, 'xlsx', NULL, NULL, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', NULL, 'Unexpected non-whitespace character after JSON at position 2 (line 1 column 3)', 'currentPage', NULL, '2025-04-14 01:16:35', '2025-04-14 01:16:36', '[57, 97, 54, 55, 56, 62, 58, 59, 60, 61]', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (18, 1, 'document_export', 2, 'documents_export_18_2025-04-14T01-16-44-509Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_18_2025-04-14T01-16-44-509Z.xlsx', NULL, 'selected', '[54,55,56]', '2025-04-14 01:16:44', '2025-04-14 01:16:44', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (19, 1, 'document_export', 3, NULL, 'xlsx', NULL, NULL, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', NULL, 'Unexpected non-whitespace character after JSON at position 2 (line 1 column 3)', 'currentPage', NULL, '2025-04-14 01:23:56', '2025-04-14 01:23:57', '[57, 97, 54, 55, 56, 62, 58, 59, 60, 61]', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (20, 1, 'document_export', 3, NULL, 'xlsx', NULL, NULL, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', NULL, 'Unexpected non-whitespace character after JSON at position 2 (line 1 column 3)', 'currentPage', NULL, '2025-04-14 01:26:08', '2025-04-14 01:26:08', '[57, 97, 54, 55, 56, 62, 58, 59, 60, 61]', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (21, 1, 'document_export', 2, 'documents_export_21_2025-04-14T01-34-22-159Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_21_2025-04-14T01-34-22-159Z.xlsx', NULL, 'currentPage', NULL, '2025-04-14 01:34:21', '2025-04-14 01:34:22', '[57, 97, 54, 55, 56, 62, 58, 59, 60, 61]', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (22, 1, 'document_export', 2, 'documents_export_22_2025-04-14T02-14-27-235Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_22_2025-04-14T02-14-27-235Z.xlsx', NULL, 'currentPage', NULL, '2025-04-14 02:14:26', '2025-04-14 02:14:27', '[57, 97, 54, 55, 56, 62, 58, 59, 60, 61]', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (23, 1, 'document_export', 2, 'documents_export_23_2025-04-14T08-21-44-921Z.xlsx', 'xlsx', '{}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_23_2025-04-14T08-21-44-921Z.xlsx', NULL, 'all', NULL, '2025-04-14 08:21:44', '2025-04-14 08:21:44', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (24, 1, 'document_export', 2, 'documents_export_24_2025-04-14T08-36-21-852Z.xlsx', 'xlsx', '{}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_24_2025-04-14T08-36-21-852Z.xlsx', NULL, 'all', NULL, '2025-04-14 08:36:20', '2025-04-14 08:36:21', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (25, 1, 'document_export', 2, 'documents_export_25_2025-04-14T08-59-35-677Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_25_2025-04-14T08-59-35-677Z.xlsx', NULL, 'currentPage', NULL, '2025-04-14 08:59:35', '2025-04-14 08:59:35', '[99]', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (26, 1, 'document_import', 3, NULL, 'xlsx', NULL, 5, NULL, '01921cf9-0af8-48bc-a9d2-ff21715be415.xlsx', 'Excel missing required columns: 签收人, 页数, 份数', NULL, NULL, '2025-04-14 09:24:00', '2025-04-14 09:24:01', NULL, NULL, NULL, NULL, NULL, NULL, 'documents_export_14_2025-04-11T07-28-00-241Z.xlsx');
INSERT INTO `export_tasks` VALUES (27, 1, 'document_import', 2, NULL, 'xlsx', NULL, 100, NULL, '257658b8-394f-4278-8d4c-87aa0a15bb50.xlsx', NULL, NULL, NULL, '2025-04-14 09:31:45', '2025-04-14 09:31:46', NULL, 3, 3, 3, 0, NULL, 'documents_export_18_2025-04-14T01-16-44-509Z.xlsx');
INSERT INTO `export_tasks` VALUES (28, 1, 'document_export', 2, 'documents_export_28_2025-04-15T00-17-16-095Z.xlsx', 'xlsx', '{}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_28_2025-04-15T00-17-16-095Z.xlsx', NULL, 'all', NULL, '2025-04-15 00:17:15', '2025-04-15 00:17:16', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (29, 1, 'document_export', 2, 'documents_export_29_2025-04-15T00-21-16-736Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_29_2025-04-15T00-21-16-736Z.xlsx', NULL, 'currentPage', NULL, '2025-04-15 00:21:16', '2025-04-15 00:21:16', '[100, 101, 102]', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (30, 1, 'document_import', 2, NULL, 'xlsx', NULL, 100, NULL, 'acc505c8-1a07-4d93-8045-c8ad2360926b.xlsx', NULL, NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, 47, 47, 47, 0, NULL, 'documents_export_13_2025-04-11T07-04-00-667Z.xlsx');
INSERT INTO `export_tasks` VALUES (31, 1, 'document_import', 2, NULL, 'xlsx', NULL, 100, NULL, 'b13fa181-d6ad-456d-a02b-30fdf1e5c96e.xlsx', NULL, NULL, NULL, '2025-04-15 00:26:08', '2025-04-15 00:26:08', NULL, 10, 10, 10, 0, NULL, 'documents_export_21_2025-04-14T01-34-22-159Z.xlsx');
INSERT INTO `export_tasks` VALUES (32, 1, 'document_import', 2, NULL, 'xlsx', NULL, 100, NULL, 'd6b38733-6fec-40c1-af48-a85790c34100.xlsx', NULL, NULL, NULL, '2025-04-15 00:28:04', '2025-04-15 00:28:04', NULL, 10, 10, 10, 0, NULL, 'documents_export_15_2025-04-11T07-33-11-209Z.xlsx');
INSERT INTO `export_tasks` VALUES (33, 1, 'document_import', 2, NULL, 'xlsx', NULL, 100, NULL, 'd807b06b-a428-408b-80a0-8ec8059422f1.xlsx', NULL, NULL, NULL, '2025-04-15 00:29:54', '2025-04-15 00:29:54', NULL, 3, 3, 3, 0, NULL, 'documents_export_10_2025-04-11T06-41-12-451Z.xlsx');
INSERT INTO `export_tasks` VALUES (34, 1, 'document_import', 2, NULL, 'xlsx', NULL, 100, NULL, 'dc52329f-082f-41f7-ab50-e6d719d580cf.xlsx', NULL, NULL, NULL, '2025-04-16 06:53:09', '2025-04-16 06:53:10', NULL, 47, 47, 47, 0, NULL, 'documents_export_13_2025-04-11T07-04-00-667Z.xlsx');
INSERT INTO `export_tasks` VALUES (35, 1, 'document_import', 2, NULL, 'xlsx', NULL, 100, NULL, 'fa22bfc5-0e04-4d04-b4f0-d391a6cefe75.xlsx', NULL, NULL, NULL, '2025-04-16 06:53:42', '2025-04-16 06:53:42', NULL, 1, 1, 1, 0, NULL, 'documents_export_25_2025-04-14T08-59-35-677Z.xlsx');
INSERT INTO `export_tasks` VALUES (36, 1, 'document_export', 2, 'documents_export_36_2025-04-16T06-56-12-732Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_36_2025-04-16T06-56-12-732Z.xlsx', NULL, 'currentPage', NULL, '2025-04-16 06:56:12', '2025-04-16 06:56:12', '[179, 178, 177, 176, 174, 183, 217, 182, 181, 220]', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (37, 1, 'document_import', 2, NULL, 'xlsx', NULL, 100, NULL, '3ad841a6-ec67-49f3-8750-0606cb5c51b2.xlsx', NULL, NULL, NULL, '2025-04-16 06:57:12', '2025-04-16 06:57:13', NULL, 47, 47, 47, 0, NULL, 'documents_export_13_2025-04-11T07-04-00-667Z.xlsx');
INSERT INTO `export_tasks` VALUES (38, 1, 'document_export', 2, 'documents_export_38_2025-04-16T09-03-09-899Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_38_2025-04-16T09-03-09-899Z.xlsx', NULL, 'currentPage', NULL, '2025-04-16 09:03:09', '2025-04-16 09:03:10', '[248, 246, 244, 243, 242, 241, 240, 239, 238, 237]', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (39, 1, 'document_export', 2, 'documents_export_39_2025-04-17T00-46-22-964Z.xlsx', 'xlsx', '{}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_39_2025-04-17T00-46-22-964Z.xlsx', NULL, 'all', NULL, '2025-04-17 00:46:22', '2025-04-17 00:46:23', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (40, 1, 'document_export', 2, 'documents_export_40_2025-04-17T00-49-29-501Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_40_2025-04-17T00-49-29-501Z.xlsx', NULL, 'currentPage', NULL, '2025-04-17 00:49:29', '2025-04-17 00:49:29', '[248, 246, 244, 243, 242, 241, 240, 239, 238, 237]', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (41, 1, 'document_import', 2, NULL, 'xlsx', NULL, 100, NULL, '8fbfeda0-1efe-4b16-a4ac-51479a74ef99.xlsx', NULL, NULL, NULL, '2025-04-17 00:50:13', '2025-04-17 00:50:13', NULL, 10, 10, 10, 0, NULL, 'documents_export_40_2025-04-17T00-49-29-501Z.xlsx');
INSERT INTO `export_tasks` VALUES (42, 1, 'document_import', 2, NULL, 'xlsx', NULL, 100, NULL, 'd6385581-9ee1-4141-9893-645878ecdef8.xlsx', NULL, NULL, NULL, '2025-04-17 00:53:35', '2025-04-17 00:53:35', NULL, 10, 10, 10, 0, NULL, 'documents_export_40_2025-04-17T00-49-29-501Z.xlsx');
INSERT INTO `export_tasks` VALUES (43, 1, 'document_import', 2, NULL, 'xlsx', NULL, 100, NULL, '5d9d10a5-9877-460a-9920-0a763d7baae5.xlsx', NULL, NULL, NULL, '2025-04-17 00:56:40', '2025-04-17 00:56:42', NULL, 10, 10, 10, 0, NULL, 'documents_export_36_2025-04-16T06-56-12-732Z.xlsx');
INSERT INTO `export_tasks` VALUES (44, 1, 'document_export', 2, 'documents_export_44_2025-04-17T00-57-35-115Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_44_2025-04-17T00-57-35-115Z.xlsx', NULL, 'currentPage', NULL, '2025-04-17 00:57:34', '2025-04-17 00:57:35', '[297, 296, 295, 294, 293, 292, 291, 290, 299, 298]', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (45, 1, 'document_export', 2, 'documents_export_45_2025-04-17T01-01-07-152Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_45_2025-04-17T01-01-07-152Z.xlsx', NULL, 'currentPage', NULL, '2025-04-17 01:01:07', '2025-04-17 01:01:07', '[297, 296, 295, 294, 293, 292, 291, 290, 299, 298]', NULL, NULL, NULL, NULL, NULL, NULL);

-- ----------------------------
-- Table structure for operation_logs
-- ----------------------------
DROP TABLE IF EXISTS `operation_logs`;
CREATE TABLE `operation_logs`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` int NOT NULL COMMENT '操作用户ID',
  `operation_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '操作类型',
  `operation_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '操作内容',
  `ip_address` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'IP地址',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user`(`user_id` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 44 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '操作日志表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of operation_logs
-- ----------------------------
INSERT INTO `operation_logs` VALUES (1, 1, 'USER_CREATE', '创建用户: jiangchuan', '::1', '2025-04-16 07:46:22');
INSERT INTO `operation_logs` VALUES (2, 1, 'USER_DISABLE', '禁用用户: 1', '::1', '2025-04-16 07:47:03');
INSERT INTO `operation_logs` VALUES (3, 1, 'USER_ENABLE', '启用用户: 1', '::1', '2025-04-16 07:47:04');
INSERT INTO `operation_logs` VALUES (4, 1, 'USER_UPDATE', '更新用户: 4', '::1', '2025-04-16 07:48:42');
INSERT INTO `operation_logs` VALUES (5, 1, 'USER_DELETE', '删除用户: 4', '::1', '2025-04-16 07:49:21');
INSERT INTO `operation_logs` VALUES (6, 1, 'USER_DISABLE', '禁用用户：系统管理员(ID: 1)，变更：status: 1 → 0', '::1', '2025-04-16 08:07:00');
INSERT INTO `operation_logs` VALUES (7, 1, 'USER_ENABLE', '启用用户：系统管理员(ID: 1)，变更：status: 0 → 1', '::1', '2025-04-16 08:07:01');
INSERT INTO `operation_logs` VALUES (8, 1, 'USER_CREATE', '创建用户：mawenying(ID: 5)', '::1', '2025-04-16 08:08:29');
INSERT INTO `operation_logs` VALUES (9, 1, 'USER_DISABLE', '禁用用户：马文颖(ID: 5)，变更：status: 1 → 0', '::1', '2025-04-16 08:08:43');
INSERT INTO `operation_logs` VALUES (10, 1, 'USER_ENABLE', '启用用户：马文颖(ID: 5)，变更：status: 0 → 1', '::1', '2025-04-16 08:08:44');
INSERT INTO `operation_logs` VALUES (11, 1, 'USER_UPDATE', '更新用户：马文颖(ID: 5)，变更：id: undefined → 5，role: editor → admin，confirmPassword: undefined → ', '::1', '2025-04-16 08:09:01');
INSERT INTO `operation_logs` VALUES (12, 1, 'USER_DELETE', '删除用户：mawenying(ID: 5)', '::1', '2025-04-16 08:09:42');
INSERT INTO `operation_logs` VALUES (13, 1, 'DEPARTMENT_CREATE', '创建部门: 设备管理部', '::1', '2025-04-16 08:46:45');
INSERT INTO `operation_logs` VALUES (14, 1, 'DEPARTMENT_UPDATE', '更新部门: 设备管理部(ID: 9)', '::1', '2025-04-16 08:47:01');
INSERT INTO `operation_logs` VALUES (15, 1, 'DEPARTMENT_DELETE', '删除部门: 设备管理部(ID: 9)', '::1', '2025-04-16 08:47:11');
INSERT INTO `operation_logs` VALUES (16, 1, 'DOCUMENT_DELETE', '删除文档: 新功能上线发布通知(ID: 245)', '::1', '2025-04-16 09:01:51');
INSERT INTO `operation_logs` VALUES (17, 1, 'DOCUMENT_CREATE', '创建文档: 1', '::1', '2025-04-16 09:02:20');
INSERT INTO `operation_logs` VALUES (18, 1, 'DOCUMENT_UPDATE', '更新文档: 1(ID: 269)', '::1', '2025-04-16 09:02:36');
INSERT INTO `operation_logs` VALUES (19, 1, 'DOCUMENT_DELETE', '删除文档: 1(ID: 269)', '::1', '2025-04-16 09:02:51');
INSERT INTO `operation_logs` VALUES (20, 1, 'USER_DISABLE', '禁用用户：系统管理员(ID: 1)，变更：status: 1 → 0', '::1', '2025-04-16 09:04:07');
INSERT INTO `operation_logs` VALUES (21, 1, 'USER_ENABLE', '启用用户：系统管理员(ID: 1)，变更：status: 0 → 1', '::1', '2025-04-16 09:04:08');
INSERT INTO `operation_logs` VALUES (22, 1, 'USER_UPDATE', '更新用户：系统管理员(ID: 1)，变更：id: undefined → 1，status: 1 → 0，confirmPassword: undefined → ', '::1', '2025-04-16 09:04:10');
INSERT INTO `operation_logs` VALUES (23, 1, 'USER_UPDATE', '更新用户：系统管理员(ID: 1)，变更：id: undefined → 1，status: 0 → 1，confirmPassword: undefined → ', '::1', '2025-04-16 09:04:14');
INSERT INTO `operation_logs` VALUES (24, 1, 'USER_CREATE', '创建用户：jiangchuan(ID: 6)', '::1', '2025-04-16 09:15:27');
INSERT INTO `operation_logs` VALUES (25, 1, 'DOCTYPE_DELETE', '删除文档类型: 安全服务(ID: 18)', '::1', '2025-04-16 09:15:36');
INSERT INTO `operation_logs` VALUES (26, 1, 'DOCTYPE_UPDATE', '更新文档类型: 等保服务(ID: 20)', '::1', '2025-04-16 09:16:03');
INSERT INTO `operation_logs` VALUES (27, 1, 'DOCTYPE_UPDATE', '更新文档类型: 等保服务(ID: 20)', '::1', '2025-04-16 09:16:14');
INSERT INTO `operation_logs` VALUES (28, 1, 'DOCTYPE_DELETE', '删除文档类型: 律师函(ID: 22)', '::1', '2025-04-16 09:17:26');
INSERT INTO `operation_logs` VALUES (29, 1, 'DOCTYPE_DELETE', '删除文档类型: 律师函(ID: 23)', '::1', '2025-04-16 09:22:28');
INSERT INTO `operation_logs` VALUES (30, 1, 'DOCTYPE_CREATE', '创建文档类型: 律师函', '::1', '2025-04-16 09:25:11');
INSERT INTO `operation_logs` VALUES (31, 1, 'DOCTYPE_DELETE', '删除文档类型: 律师函(ID: 25)', '::1', '2025-04-17 00:55:20');
INSERT INTO `operation_logs` VALUES (32, 1, 'DOCUMENT_IMPORT', '发起文档导入任务 (文件: documents_export_36_2025-04-16T06-56-12-732Z.xlsx)', '::1', '2025-04-17 00:56:41');
INSERT INTO `operation_logs` VALUES (33, 1, 'DOCUMENT_IMPORT', '文档导入任务 #43 (文件: documents_export_36_2025-04-16T06-56-12-732Z.xlsx) 完成，成功导入 10 条记录。', 'SYSTEM', '2025-04-17 00:56:42');
INSERT INTO `operation_logs` VALUES (34, 1, 'DOCUMENT_EXPORT', '发起文档导出任务 (范围: currentPage, 类型: xlsx)', '::1', '2025-04-17 00:57:34');
INSERT INTO `operation_logs` VALUES (35, 1, 'DOCUMENT_EXPORT', '发起文档导出任务 (范围: currentPage, 类型: xlsx)', '::1', '2025-04-17 01:01:07');
INSERT INTO `operation_logs` VALUES (36, 1, 'DOCUMENT_EXPORT', '文档导出任务 #45 (文件: documents_export_45_2025-04-17T01-01-07-152Z.xlsx) 处理成功完成。', 'SYSTEM', '2025-04-17 01:01:07');
INSERT INTO `operation_logs` VALUES (37, 1, 'USER_UPDATE', '更新用户：江川(ID: 6)，变更：id: undefined → 6，role: admin → editor，confirmPassword: undefined → ', '::1', '2025-04-17 01:05:51');
INSERT INTO `operation_logs` VALUES (38, 1, 'DOCTYPE_CREATE', '创建文档类型: 测试 空格 文档', '::1', '2025-04-17 02:13:28');
INSERT INTO `operation_logs` VALUES (39, 1, 'DOCUMENT_CREATE', '创建文档: 1', '::1', '2025-04-17 02:14:20');
INSERT INTO `operation_logs` VALUES (40, 1, 'DOCUMENT_DELETE', '删除文档: 1(ID: 300)', '::1', '2025-04-17 02:20:03');
INSERT INTO `operation_logs` VALUES (41, 1, 'DOCUMENT_UPDATE', '更新文档: XX项目详细设计说明书(ID: 295)', '::1', '2025-04-17 02:22:34');
INSERT INTO `operation_logs` VALUES (42, 1, 'DOCUMENT_CREATE', '创建文档: 1', '::1', '2025-04-17 02:22:50');
INSERT INTO `operation_logs` VALUES (43, 1, 'DOCUMENT_DELETE', '删除文档: 1(ID: 301)', '::1', '2025-04-17 02:22:53');

-- ----------------------------
-- Table structure for search_conditions
-- ----------------------------
DROP TABLE IF EXISTS `search_conditions`;
CREATE TABLE `search_conditions`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` int NOT NULL COMMENT '用户ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '条件名称',
  `conditions` json NOT NULL COMMENT '查询条件',
  `is_common` tinyint NOT NULL DEFAULT 0 COMMENT '是否常用',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user`(`user_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '查询条件表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of search_conditions
-- ----------------------------

-- ----------------------------
-- Table structure for system_configs
-- ----------------------------
DROP TABLE IF EXISTS `system_configs`;
CREATE TABLE `system_configs`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '配置键名',
  `config_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '配置值',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '配置项描述',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `config_key`(`config_key` ASC) USING BTREE,
  INDEX `idx_config_key`(`config_key` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '系统配置表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of system_configs
-- ----------------------------
INSERT INTO `system_configs` VALUES (1, 'db_host', 'localhost', '数据库主机地址', '2025-04-15 14:45:06', '2025-04-15 07:33:01');
INSERT INTO `system_configs` VALUES (2, 'db_port', '3306', '数据库端口', '2025-04-15 14:45:06', '2025-04-15 07:33:01');
INSERT INTO `system_configs` VALUES (3, 'db_name', 'LDIMS_DB', '数据库名称', '2025-04-15 14:45:06', '2025-04-15 07:33:01');
INSERT INTO `system_configs` VALUES (4, 'db_user', 'test', '数据库用户名', '2025-04-15 14:45:06', '2025-04-15 07:33:01');
INSERT INTO `system_configs` VALUES (5, 'db_password', '123456', '数据库密码', '2025-04-15 14:45:06', '2025-04-15 07:33:01');
INSERT INTO `system_configs` VALUES (6, 'api_base_url', '/api/v1', '后端 API 基础路径', '2025-04-15 14:45:06', '2025-04-15 07:33:21');
INSERT INTO `system_configs` VALUES (7, 'api_timeout', '5000', 'API 请求超时时间 (毫秒)', '2025-04-15 14:45:06', '2025-04-15 07:33:21');
INSERT INTO `system_configs` VALUES (8, 'log_retention_days', '90', '操作日志保留天数 (0 表示永久)', '2025-04-15 14:45:06', '2025-04-15 14:45:06');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户名',
  `password` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '密码',
  `real_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '真实姓名',
  `role` enum('admin','editor','viewer') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户角色',
  `department_id` int NOT NULL COMMENT '所属部门ID',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态: 1-启用, 0-禁用',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  INDEX `idx_department`(`department_id` ASC) USING BTREE,
  INDEX `idx_username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'admin', 'admin123', '系统管理员', 'admin', 1, 1, '2025-04-09 09:15:55', '2025-04-16 09:04:14');
INSERT INTO `users` VALUES (6, 'jiangchuan', '123456', '江川', 'editor', 2, 1, '2025-04-16 09:15:27', '2025-04-17 01:05:51');

SET FOREIGN_KEY_CHECKS = 1;
