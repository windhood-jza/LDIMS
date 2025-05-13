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

 Date: 12/05/2025 16:23:22
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
) ENGINE = InnoDB AUTO_INCREMENT = 17 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '部门表' ROW_FORMAT = Dynamic;

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
INSERT INTO `departments` VALUES (8, '采购部', 'D8', 2, 2, 1, 1, '2025-04-15 01:06:13', '2025-04-17 09:18:40', '2025-04-17 09:18:40');
INSERT INTO `departments` VALUES (9, '设备管理部', 'D9', 2, 2, 4, 1, '2025-04-16 08:46:44', '2025-04-16 08:47:11', '2025-04-16 08:47:11');
INSERT INTO `departments` VALUES (10, '采购部', 'D10', 2, 2, 1, 1, '2025-04-17 09:18:53', '2025-04-17 09:59:44', '2025-04-17 09:59:44');
INSERT INTO `departments` VALUES (11, '采购部', 'D11', 2, 2, 2, 1, '2025-04-18 00:36:13', '2025-04-18 00:36:42', NULL);
INSERT INTO `departments` VALUES (12, '规划部', 'D12', 2, 2, 1, 1, '2025-04-18 00:36:24', '2025-04-18 00:36:38', NULL);
INSERT INTO `departments` VALUES (13, '其他部', 'D13', 2, 2, 0, 1, '2025-04-18 00:36:51', '2025-04-18 00:36:51', NULL);
INSERT INTO `departments` VALUES (14, '1', 'D14', 3, 3, 45, 1, '2025-04-18 00:43:43', '2025-04-18 00:48:38', '2025-04-18 00:48:38');
INSERT INTO `departments` VALUES (15, '1', 'D15', 2, 2, 45, 1, '2025-04-18 00:51:21', '2025-04-18 00:51:21', NULL);
INSERT INTO `departments` VALUES (16, '2', 'D16', 2, 2, 4, 1, '2025-04-18 00:54:09', '2025-04-18 00:54:09', NULL);

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
) ENGINE = InnoDB AUTO_INCREMENT = 29 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '文档类型表' ROW_FORMAT = Dynamic;

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
INSERT INTO `doc_types` VALUES (27, '1', 0, 1, 0, 1, '2025-04-17 09:14:41', '2025-04-17 09:14:47', '2025-04-17 09:14:47');
INSERT INTO `doc_types` VALUES (28, '1', 20, 4, 2, 1, '2025-04-18 00:30:35', '2025-04-18 00:30:38', '2025-04-18 00:30:38');

-- ----------------------------
-- Table structure for document_files
-- ----------------------------
DROP TABLE IF EXISTS `document_files`;
CREATE TABLE `document_files`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `document_id` int NOT NULL,
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '原始文件名',
  `file_path` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '存储路径(相对根目录, 含子目录和结构化文件名)',
  `file_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '文件MIME类型或扩展名',
  `file_size` bigint NOT NULL COMMENT '文件大小(字节)',
  `sequence` int NOT NULL DEFAULT 0 COMMENT '文件顺序索引(从0开始)',
  `extracted_content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '提取/识别的内容',
  `processing_status` enum('pending','processing','completed','failed','ocr_fallback') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '内容处理状态',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_document_id`(`document_id` ASC) USING BTREE,
  INDEX `idx_document_id_sequence`(`document_id` ASC, `sequence` ASC) USING BTREE,
  FULLTEXT INDEX `idx_ft_extracted_content`(`extracted_content`),
  CONSTRAINT `fk_document_id` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 79 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '文档关联文件表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of document_files
-- ----------------------------
INSERT INTO `document_files` VALUES (16, 393, '0_运维服务台运行通知X3_20250429T071054644Z.docx', '运维服务台运行通知X3\\0_运维服务台运行通知X3_20250429T071054644Z.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 783653, 0, NULL, 'processing', '2025-04-29 07:10:54', '2025-04-29 07:10:56');
INSERT INTO `document_files` VALUES (17, 387, '0_安徽台索贝人员信息表_20250429T071430271Z.pdf', '安徽台索贝人员信息表\\0_安徽台索贝人员信息表_20250429T071430271Z.pdf', 'application/pdf', 838291, 0, NULL, 'processing', '2025-04-29 07:14:30', '2025-04-29 07:14:35');
INSERT INTO `document_files` VALUES (18, 387, '1_安徽台索贝人员信息表_20250429T071430295Z.pdf', '安徽台索贝人员信息表\\1_安徽台索贝人员信息表_20250429T071430295Z.pdf', 'application/pdf', 431560, 1, NULL, 'processing', '2025-04-29 07:14:30', '2025-04-29 07:14:35');
INSERT INTO `document_files` VALUES (19, 382, '0_24年（12月）制播机房检查表_20250429T071613231Z.pdf', '24年（12月）制播机房检查表\\0_24年（12月）制播机房检查表_20250429T071613231Z.pdf', 'application/pdf', 819338, 0, NULL, 'processing', '2025-04-29 07:16:13', '2025-04-29 07:16:17');
INSERT INTO `document_files` VALUES (20, 382, '1_24年（12月）制播机房检查表_20250429T071613247Z.pdf', '24年（12月）制播机房检查表\\1_24年（12月）制播机房检查表_20250429T071613247Z.pdf', 'application/pdf', 1345993, 1, NULL, 'processing', '2025-04-29 07:16:13', '2025-04-29 07:16:17');
INSERT INTO `document_files` VALUES (21, 382, '2_24年（12月）制播机房检查表_20250429T071613256Z.pdf', '24年（12月）制播机房检查表\\2_24年（12月）制播机房检查表_20250429T071613256Z.pdf', 'application/pdf', 872247, 2, NULL, 'processing', '2025-04-29 07:16:13', '2025-04-29 07:16:17');
INSERT INTO `document_files` VALUES (22, 382, '3_24年（12月）制播机房检查表_20250429T071613262Z.pdf', '24年（12月）制播机房检查表\\3_24年（12月）制播机房检查表_20250429T071613262Z.pdf', 'application/pdf', 3167879, 3, NULL, 'processing', '2025-04-29 07:16:13', '2025-04-29 07:16:17');
INSERT INTO `document_files` VALUES (23, 382, '4_24年（12月）制播机房检查表_20250429T071613272Z.pdf', '24年（12月）制播机房检查表\\4_24年（12月）制播机房检查表_20250429T071613272Z.pdf', 'application/pdf', 8013098, 4, NULL, 'processing', '2025-04-29 07:16:13', '2025-04-29 07:16:17');
INSERT INTO `document_files` VALUES (24, 382, '5_24年（12月）制播机房检查表_20250429T071613279Z.pdf', '24年（12月）制播机房检查表\\5_24年（12月）制播机房检查表_20250429T071613279Z.pdf', 'application/pdf', 838291, 5, NULL, 'processing', '2025-04-29 07:16:13', '2025-04-29 07:16:17');
INSERT INTO `document_files` VALUES (25, 382, '6_24年（12月）制播机房检查表_20250429T071613288Z.pdf', '24年（12月）制播机房检查表\\6_24年（12月）制播机房检查表_20250429T071613288Z.pdf', 'application/pdf', 431560, 6, NULL, 'processing', '2025-04-29 07:16:13', '2025-04-29 07:16:17');
INSERT INTO `document_files` VALUES (26, 388, '0_付款申请-索贝_20250429T074206564Z.bmp', '付款申请-索贝\\0_付款申请-索贝_20250429T074206564Z.bmp', 'image/bmp', 6912054, 0, NULL, 'processing', '2025-04-29 07:42:06', '2025-04-29 07:42:08');
INSERT INTO `document_files` VALUES (27, 388, '1_付款申请-索贝_20250429T074206575Z.bmp', '付款申请-索贝\\1_付款申请-索贝_20250429T074206575Z.bmp', 'image/bmp', 6912054, 1, NULL, 'processing', '2025-04-29 07:42:06', '2025-04-29 07:42:08');
INSERT INTO `document_files` VALUES (28, 388, '2_付款申请-索贝_20250429T074206584Z.bmp', '付款申请-索贝\\2_付款申请-索贝_20250429T074206584Z.bmp', 'image/bmp', 6912054, 2, NULL, 'processing', '2025-04-29 07:42:06', '2025-04-29 07:42:08');
INSERT INTO `document_files` VALUES (29, 391, '0_新闻制播系统升级采购_20250429T074443349Z.jpg', '新闻制播系统升级采购\\0_新闻制播系统升级采购_20250429T074443349Z.jpg', 'image/jpeg', 497221, 0, NULL, 'processing', '2025-04-29 07:44:43', '2025-04-29 07:44:44');
INSERT INTO `document_files` VALUES (30, 390, '0_25年01月份全台网机房保洁表_20250429T080634408Z.jpg', '25年01月份全台网机房保洁表\\0_25年01月份全台网机房保洁表_20250429T080634408Z.jpg', 'image/jpeg', 69801, 0, NULL, 'processing', '2025-04-29 08:06:34', '2025-04-29 08:06:35');
INSERT INTO `document_files` VALUES (31, 390, '1_25年01月份全台网机房保洁表_20250429T080634418Z.jpg', '25年01月份全台网机房保洁表\\1_25年01月份全台网机房保洁表_20250429T080634418Z.jpg', 'image/jpeg', 34472, 1, NULL, 'processing', '2025-04-29 08:06:34', '2025-04-29 08:06:35');
INSERT INTO `document_files` VALUES (32, 390, '2_25年01月份全台网机房保洁表_20250429T080634430Z.jpg', '25年01月份全台网机房保洁表\\2_25年01月份全台网机房保洁表_20250429T080634430Z.jpg', 'image/jpeg', 497221, 2, NULL, 'processing', '2025-04-29 08:06:34', '2025-04-29 08:06:35');
INSERT INTO `document_files` VALUES (36, 411, '0_测试同步文件上传_20250430T004902333Z.jpg', '测试同步文件上传\\0_测试同步文件上传_20250430T004902333Z.jpg', 'image/jpeg', 69801, 0, NULL, 'processing', '2025-04-30 00:49:02', '2025-04-30 00:49:02');
INSERT INTO `document_files` VALUES (37, 411, '1_测试同步文件上传_20250430T004902344Z.jpg', '测试同步文件上传\\1_测试同步文件上传_20250430T004902344Z.jpg', 'image/jpeg', 34472, 1, NULL, 'processing', '2025-04-30 00:49:02', '2025-04-30 00:49:02');
INSERT INTO `document_files` VALUES (38, 412, '0_测试文档上传2_20250430T005147933Z.jpg', '测试文档上传2\\0_测试文档上传2_20250430T005147933Z.jpg', 'image/jpeg', 497221, 0, NULL, 'pending', '2025-04-30 00:51:47', '2025-04-30 00:51:47');
INSERT INTO `document_files` VALUES (39, 394, '0_播出媒资存储升级函_20250430T010049549Z.doc', '播出媒资存储升级函\\0_播出媒资存储升级函_20250430T010049549Z.doc', 'application/msword', 13824, 0, NULL, 'processing', '2025-04-30 01:00:49', '2025-04-30 01:00:49');
INSERT INTO `document_files` VALUES (43, 386, '0_制播运维合同第一包-索贝_20250430T044229723Z.pdf', '制播运维合同第一包-索贝\\0_制播运维合同第一包-索贝_20250430T044229723Z.pdf', 'application/pdf', 163554, 0, '一、项目基本情况\r\n\r\n项目名称 多业务模式融媒传播技术综合应用平台 ——5G+IT 智能制播系统\r\n\r\n完成人\r\n\r\n完成单位\r\n\r\n孙庆 谢鹏 沈晓峰 马威 王彤 李振辉 张武 张莹 王飞 刘冬梅\r\n\r\n安徽广播电视台\r\n\r\n任务来源\r\n\r\n安徽广播电视台自主研发集成的系统项目\r\n\r\n- 1 -\r\n\r\n工作报告\r\n\r\n一、项目研究任务来源、立项\r\n\r\n本项目由安徽广播电视台自主立项，旨在响应国家媒体融合\r\n\r\n发展战略，突破传统广电制播技术瓶颈，构建适应全媒体时代的\r\n\r\n高效、智能、标准化的融媒传播技术体系。项目以“5G+IT”为\r\n\r\n核心技术路径，聚焦多业务模式融合、智能生产流程优化及跨域\r\n\r\n协同能力提升，为媒体行业提供可复制的技术解决方案。\r\n\r\n1. 行业需求驱动：媒体融合向纵深发展，传统广电制播系\r\n\r\n统面临设备重、流程长、跨域协作难等痛点，难以满足全媒体矩\r\n\r\n阵传播需求。\r\n\r\n2. 技术革新契机：5G、AI、云计算等新一代信息技术快速\r\n\r\n发展，为构建轻量化、移动化、网络化的新型制播系统提供技术\r\n\r\n基础。\r\n\r\n3. 战略价值：通过技术创新提升主流媒体传播效能，助力\r\n\r\n构建全媒体传播格局，强化舆论引导能力。\r\n\r\n二、成果的主要创新性、先进性和成熟性\r\n\r\n1. 创新性\r\n\r\n架构创新：首创“IP+基带”双轨并行架构，实现广电制作\r\n\r\n域与传输域深度融合。\r\n\r\nAI 智作突破：自主研发 AI 数字人主播、智能摄像机、智能\r\n\r\n- 2 -\r\n\r\n导播等模块，实现从内容生产到分发的全流程智能化。\r\n\r\n多模态融合传输完成双模式生产系统模式：现场制作与远程\r\n\r\n制作双模式灵活切换，降低制作成本 40%，缩短响应时间 50%。\r\n\r\n2. 先进性\r\n\r\n采 用 5G+ 公 有 云 / 私 有 云 混 合 网 络 架 构 ， 支 持 多 协 议\r\n\r\n（SRT/RTMP/NDI 等）信号实时转码与动态调度。基于 CPU/GPU\r\n\r\n协同处理，实现无限制图层叠加与复杂特效实时渲染。\r\n\r\n3. 成熟性\r\n\r\n系统已稳定支撑 140 余场重大节目制作，全媒体直播发稿量\r\n\r\n显著提升，验证了技术可靠性与场景适应性。\r\n\r\n五、成果推广应用前景\r\n\r\n1. 媒体行业：可广泛应用于各级广播电视台、新媒体机构，\r\n\r\n提升融媒体生产效能与传播影响力。\r\n\r\n2. 垂直领域拓展：适用于教育直播、企业宣传、大型赛事\r\n\r\n转播等场景，满足多业态内容制作需求。\r\n\r\n3. 技术迭代方向：未来可深度融合 AIGC 技术，构建“智能\r\n\r\n策划-自动生产-精准分发”全链条生态，持续释放技术价值。\r\n\r\n- 3 -', 'completed', '2025-04-30 04:42:29', '2025-04-30 04:42:32');
INSERT INTO `document_files` VALUES (44, 385, '0_索贝项目经理任命-董先进_20250430T044436545Z.doc', '索贝项目经理任命-董先进\\0_索贝项目经理任命-董先进_20250430T044436545Z.doc', 'application/msword', 14848, 0, NULL, 'failed', '2025-04-30 04:44:36', '2025-04-30 04:44:38');
INSERT INTO `document_files` VALUES (46, 384, '0_索贝项目经理任命-姚伟_20250430T044754944Z.jpg', '索贝项目经理任命-姚伟\\0_索贝项目经理任命-姚伟_20250430T044754944Z.jpg', 'image/jpeg', 69801, 0, NULL, 'failed', '2025-04-30 04:47:54', '2025-04-30 04:47:56');
INSERT INTO `document_files` VALUES (47, 381, '0_全台网索贝运维二包采购合同_20250430T050015644Z.docx', '全台网索贝运维二包采购合同\\0_全台网索贝运维二包采购合同_20250430T050015644Z.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 86197, 0, '《安徽广播电视台全媒体AI协同生产与智能内容管理平台》技术鉴定意见\r\n\r\n2025年4月27日，中国电影电视技术学会受安徽广播电视台委托，中国电影电视技术学会组织召开了《安徽广播电视台全媒体AI协同生产与智能内容管理平台》项目鉴定会。会议由中国电影电视技术学会秘书长韩强主持，鉴定委员会主任由中广电广播电影电视设计研究院原副院长林长海担任，委员来自国家广播电视总局科技委员会、清华大学、安徽省广播电视监测台、中国广电安徽网络股份有限公司、合肥市广播电视台(名单附后)。\r\n\r\n鉴定委员会听取了项目的工作报告、技术报告、检测报告、查新报告和用户报告，经质询和讨论，形成意见如下：\r\n\r\n1.该项目通过深度融合人工智能、大数据、云计算等技术，搭建了全媒体AI协同生产与智能内容管理平台，实现了内容生产的协同化和内容管理的智能化，同时具备支持4K内容业务的能力，满足了高清、超高清内容的全流程管理需求。\r\n\r\n2.该项目利用数据指针接口和文件自映射交互逻辑，实现了音视频内容的快速定位，有效降低了网络带宽需求，显著提升了系统运行效率和资源利用效率。\r\n\r\n3.该项目采用低码率内容文件预览上传，选定内容后再进行高码率文件处理的双轨共享机制，有效降低了网络资源消耗，提高了内容共享效率。\r\n\r\n鉴定委员会认为，该项目具有创新性，达到国内先进水平，同意通过技术鉴定。\r\n\r\n鉴定委员会主任:\r\n\r\n2025年4月27日', 'completed', '2025-04-30 05:00:15', '2025-04-30 05:00:19');
INSERT INTO `document_files` VALUES (49, 383, '0_24年12月份全台网机房保洁表_20250430T050956399Z.jpg', '24年12月份全台网机房保洁表\\0_24年12月份全台网机房保洁表_20250430T050956399Z.jpg', 'image/jpeg', 34472, 0, NULL, 'failed', '2025-04-30 05:09:56', '2025-04-30 05:09:59');
INSERT INTO `document_files` VALUES (50, 375, '0_播出媒资存储升级函_20250430T051504078Z.jpg', '播出媒资存储升级函\\0_播出媒资存储升级函_20250430T051504078Z.jpg', 'image/jpeg', 69801, 0, 'download https://paddleocr.bj.bcebos.com/PP-OCRv4/chinese/ch_PP-OCRv4_det_infer.tar to C:\\Users\\Administrator/.paddleocr/whl\\det\\ch\\ch_PP-OCRv4_det_infer\\ch_PP-OCRv4_det_infer.tar\r\ndownload https://paddleocr.bj.bcebos.com/PP-OCRv4/chinese/ch_PP-OCRv4_rec_infer.tar to C:\\Users\\Administrator/.paddleocr/whl\\rec\\ch\\ch_PP-OCRv4_rec_infer\\ch_PP-OCRv4_rec_infer.tar\r\ndownload https://paddleocr.bj.bcebos.com/dygraph_v2.0/ch/ch_ppocr_mobile_v2.0_cls_infer.tar to C:\\Users\\Administrator/.paddleocr/whl\\cls\\ch_ppocr_mobile_v2.0_cls_infer\\ch_ppocr_mobile_v2.0_cls_infer.tar\r\nYourHAL Wallet address\r\nhal1kj9f5le0lspxt8rcyc6vnn9yyfk9aqm5fd9kpq\r\nProvideyour e-mail address and name\r\nE-Mail address\r\nFirst name (as it appears in your passport)\r\nPlease use Latin characters,forexample,ifyournameis���ã�iu\r\nXiang)please enter only Xiang.\r\nAlso,omit any accents in your name,so please enter Jurgen as\r\nSubmit', 'completed', '2025-04-30 05:15:04', '2025-04-30 05:15:21');
INSERT INTO `document_files` VALUES (61, 372, '0_新闻制播系统升级采购_20250430T062333836Z.pdf', '新闻制播系统升级采购\\0_新闻制播系统升级采购_20250430T062333836Z.pdf', 'application/pdf', 643409, 0, '证书\n为表彰中国电影电视技术学会科学技术奖\n获得者，特颁发此证书。\n项目名称：电视全台制播网统一监控平台\n奖励等级：二等奖\n获奖单位：安徽广播电视台\n主要完成人：吴玉友、张圆圆、王 郑、汪崇珊、马文颖、江川、\n高明会、徐志斌、何金龙、华思阳\n电视\n中国电影电视技术学会\n会\nx\n登记证书编号：国科奖社第0073号', 'completed', '2025-04-30 06:23:33', '2025-04-30 06:23:41');
INSERT INTO `document_files` VALUES (62, 371, '0_25年01月份全台网机房保洁表_20250430T062851812Z.pdf', '25年01月份全台网机房保洁表\\0_25年01月份全台网机房保洁表_20250430T062851812Z.pdf', 'application/pdf', 29034, 0, '验证登记\n验证意见\n验证意见\n年完成公需课学\n时、专业课、64学\n验证单位（盖章）\n2021年8月1日\n年月日\n验证意见\n验证意见\n验证单位（盖章）\n验证单位（盖章）\n年月日\n年月日', 'completed', '2025-04-30 06:28:51', '2025-04-30 06:29:00');
INSERT INTO `document_files` VALUES (63, 410, '0_1_20250509T065722963Z.png', '1\\0_1_20250509T065722963Z.png', 'image/png', 150855, 0, '语音识别\nDeepSeek在人事场景的落地实践(姓名:方雅琪,部门:人事部,工具: DeepSeek)\nDeepSeek在人事场景的落地实践(姓名:方雅琪, 部门:人事部, 工具: DeepSeek)\n文本内容生成\nDeepSeek赋能公文和行政工作(姓名:杨晨,部门:办公室,工具:DeepSeek)\n事务管理\nDeepSeek应用场景分享与体会(姓名:刘翼博,部门:产业中心, 工具: DeepSeek)\n文本内容分析\nDeepSeek在人事场景的落地实践(姓名:方雅琪,部门:人事部,工具: DeepSeek）\n通过通义AI生成歌词、sonu定制国风曲目、可灵/即梦补充视频素\n材，构建完整创作链路，产出爆款视频（姓名：任荣荣，部门：安徽视\n短视频创作\n讯, 工具: 通义Al, Sonu, 可灵, 即梦)\n智能融合应用：AIGC赋能短视频创作 (姓名:罗霄,部门:制作中心,工具:AIGC)\nCoze搭建工作流，自动批量生产热点资讯 (姓名:刘宪龙,部门:媒体融合发展部,工具:\n智能体构造\nCoze、飞书多维表格、DeepSeek) \nDeepSeek在新闻策划创意生产中的应用(姓名:韩锦,部门:新闻频率中心, 工具:\nDeepSeek)\nAIGC在海报制作中的运用 (姓名:张卉,部门:视讯中心, 工具: DeepSeek,即梦AI) \nAI微短剧全流程制作学习心得(姓名：万强,部门:影视剧中心,工具:豆 \n包、DeepSeek、即梦Al、剪映)\n文本内容生成\n智能融合应用：AIGC赋能短视频创作 (姓名:罗霄,部门:制作中心, 工具: DeepSeek,即\n梦AI,海绵音乐,海螺视频,剪映)\nAI应用场景\n智能文本工厂：AI驱动短视频文案批量化生产 (姓名:李振辉,部门:制作中心, 工\n具:DeepSeek,多维表格)\n通过通义AI生成歌词、sonu定制国风曲目、可灵/即梦补充视频素\n材，构建完整创作链路，产出爆款视频（姓名：任荣荣，部门：安徽视\n讯, 工具: 通义Al, Sonu, 可灵, 即梦) \nAI赋能新闻采编：创新与展望 (姓名:方博,部门:经视中心,工具:未明确提及)\nAIGC在海报制作中的运用 (姓名:张卉, 部门:视讯中心, 工具: DeepSeek,即梦AI) \n文生图\nAI微短剧全流程制作学习心得 (姓名:万强,部门:影视剧中心, 工具:豆包、DeepSeek、\n即梦AI、剪映)\n智能融合应用： AIGC赋能短视频创作 (姓名: 罗霄,部门:制作中心, 工具: DeepSeek,即\n梦AI,海绵音乐,海螺视频,剪映)\n通过通义AI生成歌词、sonu定制国风曲目、可灵/即梦补充视频素材，构建完整创作链\n路。产出爆款视频 (姓名: 任荣荣, 部门: 安徽视讯, 工具: 通义Al, Sonu, 可灵, 即梦)\nAI赋能新闻采编：创新与展望(姓名:方博,部门:经视中心,工具:未明确提及)\n楚王的盛宴： AI技术在融合创新视频中的应用 (姓名:倪志强, 部门:农业农村中心, 工具: 未明确提及) \n图生视频\nAl微短剧全流程制作学习心得(姓名：万强,部门:影视剧中心,工具:豆包、DeepSeek、\n即梦AI、剪映)\n节目策划创意和内容生产\n智能融合应用：AIGC赋能短视频创作 (姓名:罗霄,部门:制作中心,工具: DeepSeek,即\n梦AI,海绵音乐,海螺视频,剪映)\n通过通义AI生成歌词、sonu定制国风曲目、可灵/即梦补充视频素材，构建完整创作链路,\n产出爆款视频(姓名：任荣荣,部门]:安徽视讯,工具:通义Al, Sonu)\nAI生成歌词\n智能融合应用：AIGC赋能短视频创作 (姓名:罗霄,部门:制作中心, 工具: DeepSeek,即 \n梦AI,海绵音乐,海螺视频,剪映)\n通过通义AI生成歌词、sonu定制国风曲目、可灵/即梦补充视\n频素材，构建完整创作链路，产出爆款视频(姓名：任荣荣，部\n门:安徽视讯, 工具: Sonu) \nAI编曲\n智能融合应用：AIGC赋能短视频创作 (姓名:罗霄,部门:制作中心, 工具: DeepSeek,即\n梦AI,海绵音乐,海螺视频,剪映)\nAI赋能新闻采编：创新与展望 (姓名:方博,部门:经视中心, 工具:未明确提及)\nAI配音\n智能融合应用：AIGC赋能短视频创作 (姓名: 罗霄,部门:制作中心, 工具: DeepSeek,即 \n梦AI,海绵音乐,海螺视频,剪映)\n声音处理\nAI软件在声音制作中的应用 (姓名:柯文灿 部门:制作中心, 工具:未明确提及)\n用人工智能辅助软件开发，助力网站首页头条审核（姓名:刘家俊、江维，部门:新媒体中\n心,I具:DeepSeek,Grok,OpenAl)\n利用DeepSeek开发微信小程序，赋能黄梅飘香平台运营（姓名:孙忻，部门:新媒体中心,\nI具:DeepSeek,Cursor,HBuilder)\n用DeepSeek编写“演播厅报价管理软件” （姓名:邱建川，部门:制作中心,工\n代码软件编写\n具:DeepSeek)\n借DeepSeek之力，节目生产降本增效保安全（姓名:柯文灿，部门:制作中心,工\n具:DeepSeek,Cursor,豆包)\n人工智能应用的思考与探索-\n—AI生成提词器软件（姓名:王飞，部门:制作中心,工\n具:DeepSeek)\nAI数字人与广电直播系统 (姓名:马威，部门:制作中心,工具:未明确提及)\n-场科技与创意的双向奔赴(姓名:史百惠。部门:新闻中心,工具:未明确提及)\n数字人\n“AI东风”汇入“两会春风”：创新浪潮下的机遇与挑战（姓名：丁剑，部门:新闻\n中心,工具:未明确提及)\nAI赋能新闻采编：创新与展望(姓名：方博,部门：经视中心,工具:未明确提及)', 'completed', '2025-05-09 06:57:22', '2025-05-09 06:58:21');
INSERT INTO `document_files` VALUES (64, 392, '0_文体戴本祠退休_20250509T070412371Z.pdf', '文体戴本祠退休\\0_文体戴本祠退休_20250509T070412371Z.pdf', 'application/pdf', 1658405, 0, '方媛\n新闻综合广播频率\n编辑\n10\n费倩茜\n生活广播频率\n编辑\n11\n庄媛\n生活广播频率\n编辑\n12\n李鑫\n交通广播频率\n编辑\n13\n吴寒芬\n交通广播频率\n编辑\n14\n王菁芳\n戏曲广播频率\n编辑\n15\n关子祥\n网络广播电视台\n编辑\n16\n刘雪瑶\n新闻中心\n记者\n17\n胡君\n新闻中心\n记者\n18\n孙辉\n科教频道\n记者\n19\n荣卉佳\n科教频道\n记者\n20\n汪成军\n经济生活频道\n记者\n21\n方婷婷\n经济生活频道\n记者\n22\n陆叶\n经济生活频道\n记者\n23\n赵盛\n经济生活频道\n记者\n24\n胡诚\n经济生活频道\n记者\n25\n江剑\n经济生活频道\n记者\n26\n段潇雪\n公共频道\n记者\n27\n李楠\n公共频道\n记者\n28\n刘朝祥\n新闻综合广播频率\n记者\n29\n马文颖\n科技处\n工程师\n30\n周仪\n科技处\n工程师\n31\n江川\n科技处\n工程师\n32\n陈明\n播控中心\n工程师\n33\n查雯\n播控中心\n工程师\n播\n34\n梁蓉\n播控中心\n工程师\n徽\n35\n姚笛\n播控中心\n工程师\n视\n安\n汇川同志仍在绷事部\n6\n2022\n2', 'completed', '2025-05-09 07:04:12', '2025-05-09 07:04:26');
INSERT INTO `document_files` VALUES (65, 389, '0_25年（01月）制播机房检查表_20250509T070717233Z.pdf', '25年（01月）制播机房检查表\\0_25年（01月）制播机房检查表_20250509T070717233Z.pdf', 'application/pdf', 724324, 0, '证书\n证书号：2022-科技进步奖-0562\n为表彰中国电影电视技术学会科学技术奖\n获得者，特颁发此证书。\n项目名称：基于分布式数据存储和单网架构的制播系统\n在线升级改造\n奖励等级：二\n等奖\n获奖单位：安徽广播电视台\n主要完成人：1丁国祥，2徐志斌，3张圆圆，4马文颖，5江川，\n6王炎,7何金龙,8蔡潇玲,9华思阳,10丁俊锋\n中国电\n电视\n会\n登记证书编号：国科奖社第0073号', 'completed', '2025-05-09 07:07:17', '2025-05-09 07:07:25');
INSERT INTO `document_files` VALUES (66, 380, '0_安徽台合作单位人员信息表_20250509T071445700Z.pdf', '安徽台合作单位人员信息表\\0_安徽台合作单位人员信息表_20250509T071445700Z.pdf', 'application/pdf', 1521028, 0, '人事处永久25\n安徽广播电视台文件\n皖广电人字〔2017]23号\n关于陈平等240名专业技术人员\n及工勤技能人员岗位聘任的通知\n各部门：\n根据安徽省人力资源和社会保障厅《事业单位人员聘任\n确认函》（皖人社事函〔2017］327号）和岗位设置的有关规\n定，经台党委会研究，决定对陈平等55名在编人员、徐志\n斌等185名聘用人员进行岗位聘任，聘期自2017\n年了\n起，其中冉然、孙益民、司斯等3位同志聘期自\n3016\n徽\n月算起。\n安\n口\n特此通知。\n组织人事部\n附件：1.在编人员岗位聘任名单\n2.聘用人员岗位聘任名单\n多\n安徽广电视者', 'completed', '2025-05-09 07:14:45', '2025-05-09 07:14:54');
INSERT INTO `document_files` VALUES (67, 365, '0_索贝项目经理任命-姚伟_20250509T072033564Z.pdf', '索贝项目经理任命-姚伟\\0_索贝项目经理任命-姚伟_20250509T072033564Z.pdf', 'application/pdf', 1370381, 0, '硕士研究生\n毕业证书\n研究生\n性别男，一九八四年二\n月十六\n日生，于\n江川\n九月至二〇〇九年〇六〇月在\n信号与信息处理\n二00年\n专业学习，学制三年，修完硕士研究生培养计划规定的全部课程，成绩合格,\n毕业论文答辩通过\n胡社翠\n培养单位：五邑\n校(院、所)长:\n邑大\nM\n证书编号：113491200902000028\n二〇〇九年六月十五日\n中华人民共和国教育部学历证书查询网址：http://www.chsi.com.cn', 'completed', '2025-05-09 07:20:33', '2025-05-09 07:20:42');
INSERT INTO `document_files` VALUES (68, 336, '0_运维服务台运行通知X3_20250509T072237504Z.pdf', '运维服务台运行通知X3\\0_运维服务台运行通知X3_20250509T072237504Z.pdf', 'application/pdf', 1658405, 0, '方媛\n新闻综合广播频率\n编辑\n10\n费倩茜\n生活广播频率\n编辑\n11\n庄媛\n生活广播频率\n编辑\n12\n李鑫\n交通广播频率\n编辑\n13\n吴寒芬\n交通广播频率\n编辑\n14\n王菁芳\n戏曲广播频率\n编辑\n15\n关子祥\n网络广播电视台\n编辑\n16\n刘雪瑶\n新闻中心\n记者\n17\n胡君\n新闻中心\n记者\n18\n孙辉\n科教频道\n记者\n19\n荣卉佳\n科教频道\n记者\n20\n汪成军\n经济生活频道\n记者\n21\n方婷婷\n经济生活频道\n记者\n22\n陆叶\n经济生活频道\n记者\n23\n赵盛\n经济生活频道\n记者\n24\n胡诚\n经济生活频道\n记者\n25\n江剑\n经济生活频道\n记者\n26\n段潇雪\n公共频道\n记者\n27\n李楠\n公共频道\n记者\n28\n刘朝祥\n新闻综合广播频率\n记者\n29\n马文颖\n科技处\n工程师\n30\n周仪\n科技处\n工程师\n31\n江川\n科技处\n工程师\n32\n陈明\n播控中心\n工程师\n33\n查雯\n播控中心\n工程师\n播\n34\n梁蓉\n播控中心\n工程师\n徽\n35\n姚笛\n播控中心\n工程师\n视\n安\n汇川同志仍在绷事部\n6\n2022\n2', 'completed', '2025-05-09 07:22:37', '2025-05-09 07:22:47');
INSERT INTO `document_files` VALUES (69, 373, '0_文体戴本祠退休_20250509T073229970Z.pdf', '文体戴本祠退休\\0_文体戴本祠退休_20250509T073229970Z.pdf', 'application/pdf', 774885, 0, '年度考核证明\n「2）同志近年的年度考核依次为：\n2017年度：今\n2018年度：伏秀\n2019年度：合格\n2020 年度：伏秀\n2021年度：伏秀\n特此证明。\n播\n组织人事部', 'completed', '2025-05-09 07:32:29', '2025-05-09 07:32:37');
INSERT INTO `document_files` VALUES (70, 344, '0_24年（12月）制播机房检查表_20250509T073502668Z.pdf', '24年（12月）制播机房检查表\\0_24年（12月）制播机房检查表_20250509T073502668Z.pdf', 'application/pdf', 639982, 0, '荣誉证书\n证书号：2019-3-38\n为表彰2019年王选新闻科学技术奖获奖单位，\n特颁发此证书。\n项目名称：基于4G传输技术的多通道集群新闻直播系统\n获奖等级：三等奖\n获奖者：吴玉友\n张圆圆\n薛标薛\n岩\n何金龙\n马文颖\n江川\n苏媛媛\n江崇珊\n武技术\n中国新闻技术工作者联合会\n2019年6月\n中\n《王选新闻科学技术奖》是经国家科技部批准设立的全国传媒界唯-\n的科学技术奖\n会', 'completed', '2025-05-09 07:35:02', '2025-05-09 07:35:15');
INSERT INTO `document_files` VALUES (71, 345, '0_24年12月份全台网机房保洁表_20250509T073732245Z.pdf', '24年12月份全台网机房保洁表\\0_24年12月份全台网机房保洁表_20250509T073732245Z.pdf', 'application/pdf', 643409, 0, '证书\n为表彰中国电影电视技术学会科学技术奖\n获得者，特颁发此证书。\n项目名称：电视全台制播网统一监控平台\n奖励等级：二等奖\n获奖单位：安徽广播电视台\n主要完成人：吴玉友、张圆圆、王 郑、汪崇珊、马文颖、江川、\n高明会、徐志斌、何金龙、华思阳\n电视\n中国电影电视技术学会\n会\nx\n登记证书编号：国科奖社第0073号', 'completed', '2025-05-09 07:37:32', '2025-05-09 07:37:41');
INSERT INTO `document_files` VALUES (72, 355, '0_运维服务台运行通知X3_20250509T074005591Z.pdf', '运维服务台运行通知X3\\0_运维服务台运行通知X3_20250509T074005591Z.pdf', 'application/pdf', 1521028, 0, '人事处永久25\n安徽广播电视台文件\n皖广电人字〔2017]23号\n关于陈平等240名专业技术人员\n及工勤技能人员岗位聘任的通知\n各部门：\n根据安徽省人力资源和社会保障厅《事业单位人员聘任\n确认函》（皖人社事函〔2017］327号）和岗位设置的有关规\n定，经台党委会研究，决定对陈平等55名在编人员、徐志\n斌等185名聘用人员进行岗位聘任，聘期自2017\n年了\n起，其中冉然、孙益民、司斯等3位同志聘期自\n3016\n徽\n月算起。\n安\n口\n特此通知。\n组织人事部\n附件：1.在编人员岗位聘任名单\n2.聘用人员岗位聘任名单\n多\n安徽广电视者', 'completed', '2025-05-09 07:40:05', '2025-05-09 07:40:17');
INSERT INTO `document_files` VALUES (73, 354, '0_文体戴本祠退休_20250509T074932943Z.pdf', '文体戴本祠退休\\0_文体戴本祠退休_20250509T074932943Z.pdf', 'application/pdf', 312290, 0, '个人申报专业技术资格诚信承诺书\n本人系安微广播电视台\n_（单位）工作人员，现申报播电视1\n系列（专业）副高级专业技术资格。本人承诺所提交的\n所有评审材料（包括学历、职称、奖励证书及论文、业绩证\n明等材料）均为真实。如材料提供虚假、失实，本人自愿从\n通报之日起三年内停止申报专业技术资格，并接受人社等部\n门的处理。\n承诺人签名:w\n2022年9月1日\n徽\n技术中心', 'completed', '2025-05-09 07:49:32', '2025-05-09 07:49:41');
INSERT INTO `document_files` VALUES (74, 342, '0_安徽台合作单位人员信息表_20250509T075154427Z.pdf', '安徽台合作单位人员信息表\\0_安徽台合作单位人员信息表_20250509T075154427Z.pdf', 'application/pdf', 1015252, 0, '工作经历证明\n兹证明江川同志（身份证号：340104198402162017），男，\n于2014 年7月至今，在安徽广播电视台工作，从事工程技\n术岗位工作，具体如下：\n2013年8月至 2015 年8月：电视技术办公室网络科,\n从事系统规划、建设和运维工作;\n2015 年9月至2021年6月：科技处网络一科，从事系\n统规划、建设和运维工作：\n2021年7月至今：技术中心、融合业务部，从事系统规\n划、建设和运维工作;\n特此证明！\n播\n电\n接术中\n台\n安\n技2241年8月31日\n苏媛媛', 'completed', '2025-05-09 07:51:54', '2025-05-09 07:52:02');
INSERT INTO `document_files` VALUES (75, 346, '0_索贝项目经理任命-姚伟_20250509T075634324Z.pdf', '索贝项目经理任命-姚伟\\0_索贝项目经理任命-姚伟_20250509T075634324Z.pdf', 'application/pdf', 1658405, 0, '方媛\n新闻综合广播频率\n编辑\n10\n费倩茜\n生活广播频率\n编辑\n11\n庄媛\n生活广播频率\n编辑\n12\n李鑫\n交通广播频率\n编辑\n13\n吴寒芬\n交通广播频率\n编辑\n14\n王菁芳\n戏曲广播频率\n编辑\n15\n关子祥\n网络广播电视台\n编辑\n16\n刘雪瑶\n新闻中心\n记者\n17\n胡君\n新闻中心\n记者\n18\n孙辉\n科教频道\n记者\n19\n荣卉佳\n科教频道\n记者\n20\n汪成军\n经济生活频道\n记者\n21\n方婷婷\n经济生活频道\n记者\n22\n陆叶\n经济生活频道\n记者\n23\n赵盛\n经济生活频道\n记者\n24\n胡诚\n经济生活频道\n记者\n25\n江剑\n经济生活频道\n记者\n26\n段潇雪\n公共频道\n记者\n27\n李楠\n公共频道\n记者\n28\n刘朝祥\n新闻综合广播频率\n记者\n29\n马文颖\n科技处\n工程师\n30\n周仪\n科技处\n工程师\n31\n江川\n科技处\n工程师\n32\n陈明\n播控中心\n工程师\n33\n查雯\n播控中心\n工程师\n播\n34\n梁蓉\n播控中心\n工程师\n徽\n35\n姚笛\n播控中心\n工程师\n视\n安\n汇川同志仍在绷事部\n6\n2022\n2', 'completed', '2025-05-09 07:56:34', '2025-05-09 07:56:48');
INSERT INTO `document_files` VALUES (76, 362, '0_全台网索贝运维二包采购合同_20250509T075841446Z.png', '全台网索贝运维二包采购合同\\0_全台网索贝运维二包采购合同_20250509T075841446Z.png', 'image/png', 476552, 0, '姓名江川\n性别男民族汉\n出生1984年2月16日\n住址安徽省合肥市包河区太湖\n401室\n公民身份号码340104198402162017\n中华人民共和国\n居民身份证\n签发机关合肥市公安局包河分局\n有效期限2010.08.25-2030.08.25', 'completed', '2025-05-09 07:58:41', '2025-05-09 07:58:48');
INSERT INTO `document_files` VALUES (77, 353, '0_新闻制播系统升级采购_20250509T084215717Z.pdf', '新闻制播系统升级采购\\0_新闻制播系统升级采购_20250509T084215717Z.pdf', 'application/pdf', 744900, 0, '24\n中、初级专业技术资格直接认定人员名单\n25\n26\n确定专业\n序号\n所在部门\n姓名\n任职时间\n27\n技术职务\n28\n1\n卫视频道\n黄蓓\n编辑\n2017.04\n29\n2\n经济生活频道\n陈\n国\n编辑\n2017.04\n30\n3\n经济生活频道\n刘利\n编辑\n2017.04\n31\n4\n经济生活频道\n汪成军\n记者\n2017.04\n32\n５\n科教频道\n荣卉佳\n记者\n2017.04\n33\n6\n国际频道\n姜敏\n编辑\n2017.04\n34\n7\n新闻中心\n石宇\n编辑\n2017.04\n35\n8\n经济生活频道\n方婷婷\n记者\n2017.04\n36\n9\n新闻中心\n刘雪瑶\n记者\n2017.04\n37\n10\n新闻中心\n胡\n君\n记者\n2017.04\n38\n11\n经济生活频道\n陆\n叶\n记者\n2017.04\n39\n12\n经济生活频道\n赵\n盛\n记者\n2017.04\n40\n13\n公共频道\n江\n剑\n记者\n2017.04\n41\n14\n公共频道\n段潇雪\n记者\n2017.04\n42\n15\n公共频道\n李\n楠\n记者\n2017.04\n43\n16\n经济生活频道\n胡\n诚\n记者\n2017.04\n44\n17\n播控中心\n梁\n蓉\n工程师\n20播04\n45\n18\n淮南发射台\n孙\n奇\n工程师\n安\n46\n19\n科技处\n江\n川\n工程师\n2017.04\n47\n20\n卫星地球站\n余\n升\n工程师\n48\n21\n卫星地球站\n贾\n莉\n工程师\n2017.04\n6\n22\n播控中心\n姚笛\n工程师\n2017.04\n50\n23\n芜湖发射台\n王家琦\n工程师\n2017.04\n-2 -', 'completed', '2025-05-09 08:42:15', '2025-05-09 08:42:35');
INSERT INTO `document_files` VALUES (78, 413, '0_test_20250509T084308897Z.pdf', 'test\\0_test_20250509T084308897Z.pdf', 'application/pdf', 1658405, 0, NULL, 'pending', '2025-05-09 08:43:08', '2025-05-09 08:43:08');

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
) ENGINE = InnoDB AUTO_INCREMENT = 414 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '文档信息表' ROW_FORMAT = Dynamic;

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
INSERT INTO `documents` VALUES (297, '关于调整办公区域的通知', '杨助理', '全体员工', '朱经理', NULL, '下周一开始执行', '2024-05-05', NULL, NULL, '2025-04-17 00:56:41', '2025-04-17 09:59:50', '2025-04-17 09:59:50', '行政通知', '行政部');
INSERT INTO `documents` VALUES (298, '品牌宣传口号（Slogan）征集活动总结', '步经理', '全体员工', NULL, '公司内网', '评选结果已公示', '2024-08-26', NULL, NULL, '2025-04-17 00:56:41', '2025-04-17 00:56:41', NULL, '品牌活动', '市场部');
INSERT INTO `documents` VALUES (299, '合同', '江川', '张勇', '刘勇', '624房间', '合同数据测试', '2025-04-10', NULL, NULL, '2025-04-17 00:56:41', '2025-04-17 00:56:41', NULL, '合同', '技术中心');
INSERT INTO `documents` VALUES (300, '1', '江川', '马文颖', '刘勇', '', '', '2025-04-16', 'admin', NULL, '2025-04-17 02:14:20', '2025-04-17 02:20:03', '2025-04-17 02:20:03', '合同', '技术中心');
INSERT INTO `documents` VALUES (301, '1', '1', '1', NULL, '', '', '2025-04-15', 'admin', NULL, '2025-04-17 02:22:49', '2025-04-17 02:22:53', '2025-04-17 02:22:53', '合同', '技术中心');
INSERT INTO `documents` VALUES (302, '报销单', '郑销售', '财务部', NULL, NULL, '差旅费', NULL, NULL, NULL, '2025-04-18 00:35:52', '2025-04-18 00:35:52', NULL, '财务凭证', '销售部');
INSERT INTO `documents` VALUES (303, '启动会纪要', '张经理', '李工', '王总', 'A-101', NULL, '2023-10-01', NULL, NULL, '2025-04-18 00:35:52', '2025-04-18 00:35:52', NULL, '会议纪要', '项目部');
INSERT INTO `documents` VALUES (304, '采购单', '赵采购', '钱库管', NULL, '库房', '加急', '2023-11-05', NULL, NULL, '2025-04-18 00:35:52', '2025-04-18 00:35:52', NULL, '财务凭证', '采购部');
INSERT INTO `documents` VALUES (305, '周报', '周工', '吴主管', NULL, NULL, '本周进展', '2024-01-08', NULL, NULL, '2025-04-18 00:35:52', '2025-04-18 00:35:52', NULL, '工作报告', '研发一部');
INSERT INTO `documents` VALUES (306, '用户满意度调研问卷结果分析', '秦分析员', '市场总监', NULL, '市场部共享', '包含图表', '2024-06-12', NULL, NULL, '2025-04-18 00:35:52', '2025-04-18 00:35:52', NULL, '市场文档', '市场部');
INSERT INTO `documents` VALUES (307, 'XX项目详细设计说明书', '蒋工', '测试组', '沈经理', '文档库/XX项目', 'V1.2 版本', '2024-03-10', NULL, NULL, '2025-04-18 00:35:52', '2025-04-18 00:35:52', NULL, '技术文档', '研发二部');
INSERT INTO `documents` VALUES (308, '供应商XXX公司年度评估报告', '韩采购', '采购总监', NULL, '采购部文件柜', NULL, '2024-04-01', NULL, NULL, '2025-04-18 00:35:52', '2025-04-18 00:35:52', NULL, '评估报告', '采购部');
INSERT INTO `documents` VALUES (309, '关于调整办公区域的通知', '杨助理', '全体员工', '朱经理', NULL, '下周一开始执行', '2024-05-05', NULL, NULL, '2025-04-18 00:35:52', '2025-04-18 00:35:52', NULL, '行政通知', '行政部');
INSERT INTO `documents` VALUES (310, '品牌宣传口号（Slogan）征集活动总结', '步经理', '全体员工', NULL, '公司内网', '评选结果已公示', '2024-08-26', NULL, NULL, '2025-04-18 00:35:52', '2025-04-18 00:35:52', NULL, '品牌活动', '市场部');
INSERT INTO `documents` VALUES (311, '合同', '江川', '张勇', '刘勇', '624房间', '合同数据测试', '2025-04-10', NULL, NULL, '2025-04-18 00:35:52', '2025-04-18 00:35:52', NULL, '合同', '技术中心');
INSERT INTO `documents` VALUES (312, '1', '1', '1', NULL, NULL, '', '2025-04-18', 'admin', NULL, '2025-04-18 01:22:50', '2025-04-18 01:22:50', NULL, '合同', '技术中心');
INSERT INTO `documents` VALUES (313, '合同', '江川', '张勇', '刘勇', '624房间', '合同数据测试', '2025-04-10', NULL, NULL, '2025-04-22 07:10:00', '2025-04-22 07:10:00', NULL, '合同', '技术中心');
INSERT INTO `documents` VALUES (314, '1', '1', '1', NULL, NULL, NULL, '2025-04-18', NULL, NULL, '2025-04-22 07:10:00', '2025-04-22 07:10:00', NULL, '合同', '技术中心');
INSERT INTO `documents` VALUES (315, '新闻制播系统升级采购', '秦岭', '刘勇', NULL, '635室', '蒋  蓓', '2024-11-04', NULL, NULL, '2025-04-22 09:15:23', '2025-04-22 09:15:23', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (316, '文体戴本祠退休', '李跃', '刘勇', NULL, '635室', '董先进', '2024-11-05', NULL, NULL, '2025-04-22 09:15:23', '2025-04-22 09:15:23', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (317, '运维服务台运行通知X3', '秦岭', '刘勇', NULL, '635室', '部门章', '2024-11-06', NULL, NULL, '2025-04-22 09:15:23', '2025-04-22 09:15:23', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (318, '播出媒资存储升级函', '江川', '刘勇', NULL, '635室', '部门章', '2024-11-11', NULL, NULL, '2025-04-22 09:15:23', '2025-04-22 09:15:23', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (319, '索贝支持《直播安徽》报告', '秦岭', '刘勇', NULL, '635室', '丁国祥', '2024-11-11', NULL, NULL, '2025-04-22 09:15:23', '2025-04-22 09:15:23', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (320, '索贝支持文体直播马拉松报告', '秦岭', '刘勇', NULL, '635室', '沈晓峰', '2024-11-21', NULL, NULL, '2025-04-22 09:15:23', '2025-04-22 09:15:23', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (321, '24年（11月）制播机房检查表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2024-12-02', NULL, NULL, '2025-04-22 09:15:23', '2025-04-22 09:15:23', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (322, '24年11月份全台网机房保洁表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2024-12-02', NULL, NULL, '2025-04-22 09:15:23', '2025-04-22 09:15:23', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (323, '安徽台合作单位人员信息表', '秦岭', '刘勇', NULL, '635室', '/', '2024-12-04', NULL, NULL, '2025-04-22 09:15:23', '2025-04-22 09:15:23', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (324, '全台网索贝运维二包采购合同', '秦岭', '刘勇', NULL, '635室', '沈晓峰', '2024-12-04', NULL, NULL, '2025-04-22 09:15:23', '2025-04-22 09:15:23', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (325, '24年（12月）制播机房检查表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2024-12-31', NULL, NULL, '2025-04-22 09:15:23', '2025-04-22 09:15:23', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (326, '24年12月份全台网机房保洁表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2024-12-31', NULL, NULL, '2025-04-22 09:15:23', '2025-04-22 09:15:23', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (327, '索贝项目经理任命-姚伟', '秦岭', '刘勇', NULL, '635室', '索贝章', '2025-01-01', NULL, NULL, '2025-04-22 09:15:23', '2025-04-22 09:15:23', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (328, '索贝项目经理任命-董先进', '秦岭', '刘勇', NULL, '635室', '索贝章', '2025-01-01', NULL, NULL, '2025-04-22 09:15:23', '2025-04-22 09:15:23', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (329, '制播运维合同第一包-索贝', '秦岭', '刘勇', NULL, '635室', '台/索贝章', '2025-01-09', NULL, NULL, '2025-04-22 09:15:23', '2025-04-22 09:15:23', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (330, '安徽台索贝人员信息表', '秦岭', '刘勇', NULL, '635室', '索贝章', '2025-01-09', NULL, NULL, '2025-04-22 09:15:23', '2025-04-22 09:15:23', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (331, '付款申请-索贝', '秦岭', '刘勇', NULL, '635室', '沈晓峰', '2025-01-24', NULL, NULL, '2025-04-22 09:15:23', '2025-04-22 09:15:23', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (332, '25年（01月）制播机房检查表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2025-01-31', NULL, NULL, '2025-04-22 09:15:23', '2025-04-22 09:15:23', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (333, '25年01月份全台网机房保洁表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2025-01-31', NULL, NULL, '2025-04-22 09:15:23', '2025-04-22 09:15:23', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (334, '新闻制播系统升级采购', '秦岭', '刘勇', NULL, '635室', '蒋  蓓', '2024-11-04', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (335, '文体戴本祠退休', '李跃', '刘勇', NULL, '635室', '董先进', '2024-11-05', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (336, '运维服务台运行通知X3', '秦岭', '刘勇', NULL, '635室', '部门章', '2024-11-06', NULL, 'admin', '2025-04-23 02:23:34', '2025-05-09 07:23:01', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (337, '播出媒资存储升级函', '江川', '刘勇', NULL, '635室', '部门章', '2024-11-11', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (338, '索贝支持《直播安徽》报告', '秦岭', '刘勇', NULL, '635室', '丁国祥', '2024-11-11', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (339, '索贝支持文体直播马拉松报告', '秦岭', '刘勇', NULL, '635室', '沈晓峰', '2024-11-21', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (340, '24年（11月）制播机房检查表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2024-12-02', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (341, '24年11月份全台网机房保洁表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2024-12-02', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (342, '安徽台合作单位人员信息表', '秦岭', '刘勇', NULL, '635室', '/', '2024-12-04', NULL, 'admin', '2025-04-23 02:23:34', '2025-05-09 07:52:09', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (343, '全台网索贝运维二包采购合同', '秦岭', '刘勇', NULL, '635室', '沈晓峰', '2024-12-04', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (344, '24年（12月）制播机房检查表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2024-12-31', NULL, 'admin', '2025-04-23 02:23:34', '2025-05-09 07:35:05', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (345, '24年12月份全台网机房保洁表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2024-12-31', NULL, 'admin', '2025-04-23 02:23:34', '2025-05-09 07:37:33', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (346, '索贝项目经理任命-姚伟', '秦岭', '刘勇', NULL, '635室', '索贝章', '2025-01-01', NULL, 'admin', '2025-04-23 02:23:34', '2025-05-09 07:56:35', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (347, '索贝项目经理任命-董先进', '秦岭', '刘勇', NULL, '635室', '索贝章', '2025-01-01', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (348, '制播运维合同第一包-索贝', '秦岭', '刘勇', NULL, '635室', '台/索贝章', '2025-01-09', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (349, '安徽台索贝人员信息表', '秦岭', '刘勇', NULL, '635室', '索贝章', '2025-01-09', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (350, '付款申请-索贝', '秦岭', '刘勇', NULL, '635室', '沈晓峰', '2025-01-24', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (351, '25年（01月）制播机房检查表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2025-01-31', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (352, '25年01月份全台网机房保洁表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2025-01-31', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (353, '新闻制播系统升级采购', '秦岭', '刘勇', NULL, '635室', '蒋  蓓', '2024-11-04', NULL, 'admin', '2025-04-23 02:23:34', '2025-05-09 08:42:17', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (354, '文体戴本祠退休', '李跃', '刘勇', NULL, '635室', '董先进', '2024-11-05', NULL, 'admin', '2025-04-23 02:23:34', '2025-05-09 07:49:36', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (355, '运维服务台运行通知X3', '秦岭', '刘勇', NULL, '635室', '部门章', '2024-11-06', NULL, 'admin', '2025-04-23 02:23:34', '2025-05-09 07:40:06', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (356, '播出媒资存储升级函', '江川', '刘勇', NULL, '635室', '部门章', '2024-11-11', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (357, '索贝支持《直播安徽》报告', '秦岭', '刘勇', NULL, '635室', '丁国祥', '2024-11-11', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (358, '索贝支持文体直播马拉松报告', '秦岭', '刘勇', NULL, '635室', '沈晓峰', '2024-11-21', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (359, '24年（11月）制播机房检查表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2024-12-02', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (360, '24年11月份全台网机房保洁表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2024-12-02', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (361, '安徽台合作单位人员信息表', '秦岭', '刘勇', NULL, '635室', '/', '2024-12-04', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (362, '全台网索贝运维二包采购合同', '秦岭', '刘勇', NULL, '635室', '沈晓峰', '2024-12-04', NULL, 'admin', '2025-04-23 02:23:34', '2025-05-09 07:58:42', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (363, '24年（12月）制播机房检查表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2024-12-31', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (364, '24年12月份全台网机房保洁表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2024-12-31', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (365, '索贝项目经理任命-姚伟', '秦岭', '刘勇', NULL, '635室', '索贝章', '2025-01-01', NULL, 'admin', '2025-04-23 02:23:34', '2025-05-09 07:20:36', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (366, '索贝项目经理任命-董先进', '秦岭', '刘勇', NULL, '635室', '索贝章', '2025-01-01', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (367, '制播运维合同第一包-索贝', '秦岭', '刘勇', NULL, '635室', '台/索贝章', '2025-01-09', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (368, '安徽台索贝人员信息表', '秦岭', '刘勇', NULL, '635室', '索贝章', '2025-01-09', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (369, '付款申请-索贝', '秦岭', '刘勇', NULL, '635室', '沈晓峰', '2025-01-24', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (370, '25年（01月）制播机房检查表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2025-01-31', NULL, 'admin', '2025-04-23 02:23:34', '2025-04-30 01:05:34', NULL, '招标文件', '本部门');
INSERT INTO `documents` VALUES (371, '25年01月份全台网机房保洁表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2025-01-31', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (372, '新闻制播系统升级采购', '秦岭', '刘勇', NULL, '635室', '蒋  蓓', '2024-11-04', NULL, 'admin', '2025-04-23 02:23:34', '2025-04-30 01:05:25', NULL, NULL, '技术中心');
INSERT INTO `documents` VALUES (373, '文体戴本祠退休', '李跃', '刘勇', NULL, '635室', '董先进', '2024-11-05', NULL, 'admin', '2025-04-23 02:23:34', '2025-05-09 07:32:31', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (374, '运维服务台运行通知X3', '秦岭', '刘勇', NULL, '635室', '部门章', '2024-11-06', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (375, '播出媒资存储升级函', '江川', '刘勇', NULL, '635室', '部门章', '2024-11-11', NULL, 'admin', '2025-04-23 02:23:34', '2025-04-30 05:16:30', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (376, '索贝支持《直播安徽》报告', '秦岭', '刘勇', NULL, '635室', '丁国祥', '2024-11-11', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (377, '索贝支持文体直播马拉松报告', '秦岭', '刘勇', NULL, '635室', '沈晓峰', '2024-11-21', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (378, '24年（11月）制播机房检查表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2024-12-02', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (379, '24年11月份全台网机房保洁表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2024-12-02', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (380, '安徽台合作单位人员信息表', '秦岭', '刘勇', NULL, '635室', '/', '2024-12-04', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (381, '全台网索贝运维二包采购合同', '秦岭', '刘勇', NULL, '635室', '沈晓峰', '2024-12-04', NULL, 'admin', '2025-04-23 02:23:34', '2025-04-30 05:00:26', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (382, '24年（12月）制播机房检查表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2024-12-31', NULL, 'admin', '2025-04-23 02:23:34', '2025-04-29 07:16:17', NULL, NULL, NULL);
INSERT INTO `documents` VALUES (383, '24年12月份全台网机房保洁表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2024-12-31', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (384, '索贝项目经理任命-姚伟', '秦岭', '刘勇', NULL, '635室', '索贝章', '2025-01-01', NULL, 'admin', '2025-04-23 02:23:34', '2025-04-30 04:47:48', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (385, '索贝项目经理任命-董先进', '秦岭', '刘勇', NULL, '635室', '索贝章', '2025-01-01', NULL, 'admin', '2025-04-23 02:23:34', '2025-04-30 04:44:40', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (386, '制播运维合同第一包-索贝', '秦岭', '刘勇', NULL, '635室', '台/索贝章', '2025-01-09', NULL, 'admin', '2025-04-23 02:23:34', '2025-04-30 04:30:22', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (387, '安徽台索贝人员信息表', '秦岭', '刘勇', NULL, '635室', '索贝章', '2025-01-09', NULL, 'admin', '2025-04-23 02:23:34', '2025-04-29 07:14:35', NULL, NULL, NULL);
INSERT INTO `documents` VALUES (388, '付款申请-索贝', '秦岭', '刘勇', NULL, '635室', '沈晓峰', '2025-01-24', NULL, 'admin', '2025-04-23 02:23:34', '2025-04-29 07:42:08', NULL, NULL, NULL);
INSERT INTO `documents` VALUES (389, '25年（01月）制播机房检查表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2025-01-31', NULL, 'admin', '2025-04-23 02:23:34', '2025-04-29 07:41:27', NULL, NULL, NULL);
INSERT INTO `documents` VALUES (390, '25年01月份全台网机房保洁表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2025-01-31', NULL, 'admin', '2025-04-23 02:23:34', '2025-04-29 08:06:35', NULL, NULL, NULL);
INSERT INTO `documents` VALUES (391, '新闻制播系统升级采购', '秦岭', '刘勇', NULL, '635室', '蒋  蓓', '2024-11-04', NULL, 'admin', '2025-04-23 02:23:34', '2025-04-29 07:41:30', NULL, NULL, NULL);
INSERT INTO `documents` VALUES (392, '文体戴本祠退休', '李跃', '刘勇', NULL, '635室', '董先进', '2024-11-05', NULL, 'admin', '2025-04-23 02:23:34', '2025-05-09 07:02:49', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (393, '运维服务台运行通知X3', '秦岭', '刘勇', NULL, '635室', '部门章', '2024-11-06', NULL, 'admin', '2025-04-23 02:23:34', '2025-04-29 06:54:03', NULL, NULL, NULL);
INSERT INTO `documents` VALUES (394, '播出媒资存储升级函', '江川', '刘勇', NULL, '635室', '部门章', '2024-11-11', NULL, 'admin', '2025-04-23 02:23:34', '2025-04-30 01:00:51', NULL, NULL, NULL);
INSERT INTO `documents` VALUES (395, '索贝支持《直播安徽》报告', '秦岭', '刘勇', NULL, '635室', '丁国祥', '2024-11-11', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (396, '索贝支持文体直播马拉松报告', '秦岭', '刘勇', NULL, '635室', '沈晓峰', '2024-11-21', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (397, '24年（11月）制播机房检查表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2024-12-02', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (398, '24年11月份全台网机房保洁表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2024-12-02', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (399, '安徽台合作单位人员信息表', '秦岭', '刘勇', NULL, '635室', '/', '2024-12-04', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (400, '全台网索贝运维二包采购合同', '秦岭', '刘勇', NULL, '635室', '沈晓峰', '2024-12-04', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (401, '24年（12月）制播机房检查表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2024-12-31', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (402, '24年12月份全台网机房保洁表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2024-12-31', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (403, '索贝项目经理任命-姚伟', '秦岭', '刘勇', NULL, '635室', '索贝章', '2025-01-01', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (404, '索贝项目经理任命-董先进', '秦岭', '刘勇', NULL, '635室', '索贝章', '2025-01-01', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (405, '制播运维合同第一包-索贝', '秦岭', '刘勇', NULL, '635室', '台/索贝章', '2025-01-09', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (406, '安徽台索贝人员信息表', '秦岭', '刘勇', NULL, '635室', '索贝章', '2025-01-09', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (407, '付款申请-索贝', '秦岭', '刘勇', NULL, '635室', '沈晓峰', '2025-01-24', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (408, '25年（01月）制播机房检查表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2025-01-31', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (409, '25年01月份全台网机房保洁表', '李跃', '刘勇', NULL, '635室', '徐志斌', '2025-01-31', NULL, NULL, '2025-04-23 02:23:34', '2025-04-23 02:23:34', NULL, NULL, '本部门');
INSERT INTO `documents` VALUES (410, '1', '1', '1', NULL, NULL, '', '2025-04-28', 'admin', 'admin', '2025-04-29 06:49:32', '2025-04-29 09:33:20', NULL, NULL, '技术中心');
INSERT INTO `documents` VALUES (411, '测试同步文件上传', '江川', '刘勇', NULL, '624', '', '2025-04-30', 'admin', 'admin', '2025-04-30 00:48:05', '2025-04-30 00:48:51', NULL, NULL, NULL);
INSERT INTO `documents` VALUES (412, '测试文档上传2', '五毛', '一块', NULL, NULL, '', '2025-04-22', 'admin', NULL, '2025-04-30 00:51:47', '2025-04-30 00:51:47', NULL, '台红头文件', '技术中心');
INSERT INTO `documents` VALUES (413, 'test', '1', '1', '1', '1', '', '2025-05-14', 'admin', NULL, '2025-05-09 08:43:08', '2025-05-09 08:43:08', NULL, '合同', '技术中心');

-- ----------------------------
-- Table structure for export_tasks
-- ----------------------------
DROP TABLE IF EXISTS `export_tasks`;
CREATE TABLE `export_tasks`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` int NOT NULL COMMENT '用户ID',
  `related_file_id` int NULL DEFAULT NULL COMMENT '关联的文件ID (用于内容提取等任务)',
  `task_type` enum('document_export','document_import','contentExtraction') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '任务类型: document_export, document_import, contentExtraction',
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
  INDEX `idx_task_type`(`task_type` ASC) USING BTREE,
  INDEX `idx_related_file`(`related_file_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 56 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '导出与导入任务表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of export_tasks
-- ----------------------------
INSERT INTO `export_tasks` VALUES (1, 1, NULL, 'document_export', 2, 'documents_export_1_2025-04-11T02-11-40-832Z.csv', 'xlsx', '{\"docName\":\"\",\"submitter\":\"\",\"receiver\":\"\",\"docTypeId\":null,\"sourceDepartmentId\":null,\"docTypeNameFilter\":\"\",\"sourceDepartmentNameFilter\":\"\",\"signer\":\"\",\"handoverDateRange\":null}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\uploads\\exports\\documents_export_1_2025-04-11T02-11-40-832Z.csv', NULL, 'all', NULL, '2025-04-11 02:11:40', '2025-04-11 02:11:42', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (2, 1, NULL, 'document_export', 2, 'documents_export_1_2025-04-11T02-33-36-812Z.csv', 'xlsx', '{\"docName\":\"\",\"submitter\":\"\",\"receiver\":\"\",\"docTypeId\":null,\"sourceDepartmentId\":null,\"docTypeNameFilter\":\"\",\"sourceDepartmentNameFilter\":\"\",\"signer\":\"\",\"handoverDateRange\":null}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\uploads\\exports\\documents_export_1_2025-04-11T02-33-36-812Z.csv', NULL, 'all', NULL, '2025-04-11 02:33:36', '2025-04-11 02:33:37', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (3, 1, NULL, 'document_export', 2, 'documents_export_3_2025-04-11T02-40-25-626Z.xlsx', 'xlsx', '{\"docName\":\"\",\"submitter\":\"\",\"receiver\":\"\",\"docTypeId\":null,\"sourceDepartmentId\":null,\"docTypeNameFilter\":\"\",\"sourceDepartmentNameFilter\":\"\",\"signer\":\"\",\"handoverDateRange\":null}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_3_2025-04-11T02-40-25-626Z.xlsx', NULL, 'all', NULL, '2025-04-11 02:40:25', '2025-04-11 02:40:25', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (4, 1, NULL, 'document_export', 2, 'documents_export_4_2025-04-11T02-43-08-536Z.xlsx', 'xlsx', '{\"docName\":\"\",\"submitter\":\"\",\"receiver\":\"\",\"docTypeId\":null,\"sourceDepartmentId\":null,\"docTypeNameFilter\":\"\",\"sourceDepartmentNameFilter\":\"\",\"signer\":\"\",\"handoverDateRange\":null}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_4_2025-04-11T02-43-08-536Z.xlsx', NULL, 'all', NULL, '2025-04-11 02:43:07', '2025-04-11 02:43:08', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (5, 1, NULL, 'document_export', 2, 'documents_export_5_2025-04-11T03-02-47-043Z.xlsx', 'xlsx', '{\"docName\":\"\",\"submitter\":\"\",\"receiver\":\"\",\"docTypeId\":null,\"sourceDepartmentId\":null,\"docTypeNameFilter\":\"\",\"sourceDepartmentNameFilter\":\"\",\"signer\":\"\",\"handoverDateRange\":null}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_5_2025-04-11T03-02-47-043Z.xlsx', NULL, 'all', NULL, '2025-04-11 03:02:46', '2025-04-11 03:02:47', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (6, 1, NULL, 'document_export', 3, NULL, 'xlsx', NULL, NULL, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', NULL, 'Unknown column \'docTypeId\' in \'field list\'', 'selected', '[57,97,55,54]', '2025-04-11 06:23:00', '2025-04-11 06:23:01', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (7, 1, NULL, 'document_export', 2, 'documents_export_7_2025-04-11T06-24-36-042Z.csv', 'csv', '{\"docName\":\"\",\"submitter\":\"\",\"receiver\":\"\",\"docTypeId\":null,\"sourceDepartmentId\":null,\"docTypeNameFilter\":\"\",\"sourceDepartmentNameFilter\":\"\",\"signer\":\"\",\"handoverDateRange\":null}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_7_2025-04-11T06-24-36-042Z.csv', NULL, 'all', NULL, '2025-04-11 06:24:35', '2025-04-11 06:24:36', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (8, 1, NULL, 'document_export', 3, NULL, 'xlsx', NULL, NULL, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', NULL, 'Unknown column \'docTypeId\' in \'field list\'', 'selected', '[56,62,58]', '2025-04-11 06:35:03', '2025-04-11 06:35:04', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (9, 1, NULL, 'document_export', 3, NULL, 'xlsx', NULL, NULL, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', NULL, 'Unknown column \'docTypeId\' in \'field list\'', 'selected', '[55,56,62]', '2025-04-11 06:35:24', '2025-04-11 06:35:25', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (10, 1, NULL, 'document_export', 2, 'documents_export_10_2025-04-11T06-41-12-451Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_10_2025-04-11T06-41-12-451Z.xlsx', NULL, 'selected', '[55,56,62]', '2025-04-11 06:41:11', '2025-04-11 06:41:12', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (11, 1, NULL, 'document_export', 2, 'documents_export_11_2025-04-11T06-43-13-105Z.xlsx', 'xlsx', '{\"docName\":\"\",\"submitter\":\"\",\"receiver\":\"\",\"docTypeId\":null,\"sourceDepartmentId\":null,\"docTypeNameFilter\":\"\",\"sourceDepartmentNameFilter\":\"\",\"signer\":\"\",\"handoverDateRange\":null}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_11_2025-04-11T06-43-13-105Z.xlsx', NULL, 'all', NULL, '2025-04-11 06:43:11', '2025-04-11 06:43:13', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (12, 1, NULL, 'document_export', 2, 'documents_export_12_2025-04-11T07-00-58-555Z.xlsx', 'xlsx', '{\"docName\":\"\",\"submitter\":\"\",\"receiver\":\"\",\"docTypeId\":null,\"sourceDepartmentId\":null,\"docTypeNameFilter\":\"\",\"sourceDepartmentNameFilter\":\"\",\"signer\":\"\",\"handoverDateRange\":null}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_12_2025-04-11T07-00-58-555Z.xlsx', NULL, 'all', NULL, '2025-04-11 07:00:58', '2025-04-11 07:00:58', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (13, 1, NULL, 'document_export', 2, 'documents_export_13_2025-04-11T07-04-00-667Z.xlsx', 'xlsx', '{\"docName\":\"\",\"submitter\":\"\",\"receiver\":\"\",\"docTypeId\":null,\"sourceDepartmentId\":null,\"docTypeNameFilter\":\"\",\"sourceDepartmentNameFilter\":\"\",\"signer\":\"\",\"handoverDateRange\":null}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_13_2025-04-11T07-04-00-667Z.xlsx', NULL, 'all', NULL, '2025-04-11 07:04:00', '2025-04-11 07:04:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (14, 1, NULL, 'document_export', 2, 'documents_export_14_2025-04-11T07-28-00-241Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_14_2025-04-11T07-28-00-241Z.xlsx', NULL, 'currentPage', NULL, '2025-04-11 07:27:59', '2025-04-11 07:28:00', '\"[57,97,54,55,56,62,58,59,60,61,98,63,64,65,66,67,68,69,70,71]\"', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (15, 1, NULL, 'document_export', 2, 'documents_export_15_2025-04-11T07-33-11-209Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"remarks\",\"createdByName\",\"updatedByName\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_15_2025-04-11T07-33-11-209Z.xlsx', NULL, 'currentPage', NULL, '2025-04-11 07:33:10', '2025-04-11 07:33:11', '\"[57,97,54,55,56,62,58,59,60,61]\"', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (16, 1, NULL, 'document_export', 2, 'documents_export_16_2025-04-14T01-15-40-471Z.xlsx', 'xlsx', '{}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_16_2025-04-14T01-15-40-471Z.xlsx', NULL, 'all', NULL, '2025-04-14 01:15:39', '2025-04-14 01:15:40', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (17, 1, NULL, 'document_export', 3, NULL, 'xlsx', NULL, NULL, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', NULL, 'Unexpected non-whitespace character after JSON at position 2 (line 1 column 3)', 'currentPage', NULL, '2025-04-14 01:16:35', '2025-04-14 01:16:36', '[57, 97, 54, 55, 56, 62, 58, 59, 60, 61]', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (18, 1, NULL, 'document_export', 2, 'documents_export_18_2025-04-14T01-16-44-509Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_18_2025-04-14T01-16-44-509Z.xlsx', NULL, 'selected', '[54,55,56]', '2025-04-14 01:16:44', '2025-04-14 01:16:44', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (19, 1, NULL, 'document_export', 3, NULL, 'xlsx', NULL, NULL, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', NULL, 'Unexpected non-whitespace character after JSON at position 2 (line 1 column 3)', 'currentPage', NULL, '2025-04-14 01:23:56', '2025-04-14 01:23:57', '[57, 97, 54, 55, 56, 62, 58, 59, 60, 61]', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (20, 1, NULL, 'document_export', 3, NULL, 'xlsx', NULL, NULL, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', NULL, 'Unexpected non-whitespace character after JSON at position 2 (line 1 column 3)', 'currentPage', NULL, '2025-04-14 01:26:08', '2025-04-14 01:26:08', '[57, 97, 54, 55, 56, 62, 58, 59, 60, 61]', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (21, 1, NULL, 'document_export', 2, 'documents_export_21_2025-04-14T01-34-22-159Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_21_2025-04-14T01-34-22-159Z.xlsx', NULL, 'currentPage', NULL, '2025-04-14 01:34:21', '2025-04-14 01:34:22', '[57, 97, 54, 55, 56, 62, 58, 59, 60, 61]', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (22, 1, NULL, 'document_export', 2, 'documents_export_22_2025-04-14T02-14-27-235Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_22_2025-04-14T02-14-27-235Z.xlsx', NULL, 'currentPage', NULL, '2025-04-14 02:14:26', '2025-04-14 02:14:27', '[57, 97, 54, 55, 56, 62, 58, 59, 60, 61]', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (23, 1, NULL, 'document_export', 2, 'documents_export_23_2025-04-14T08-21-44-921Z.xlsx', 'xlsx', '{}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_23_2025-04-14T08-21-44-921Z.xlsx', NULL, 'all', NULL, '2025-04-14 08:21:44', '2025-04-14 08:21:44', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (24, 1, NULL, 'document_export', 2, 'documents_export_24_2025-04-14T08-36-21-852Z.xlsx', 'xlsx', '{}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_24_2025-04-14T08-36-21-852Z.xlsx', NULL, 'all', NULL, '2025-04-14 08:36:20', '2025-04-14 08:36:21', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (25, 1, NULL, 'document_export', 2, 'documents_export_25_2025-04-14T08-59-35-677Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_25_2025-04-14T08-59-35-677Z.xlsx', NULL, 'currentPage', NULL, '2025-04-14 08:59:35', '2025-04-14 08:59:35', '[99]', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (26, 1, NULL, 'document_import', 3, NULL, 'xlsx', NULL, 5, NULL, '01921cf9-0af8-48bc-a9d2-ff21715be415.xlsx', 'Excel missing required columns: 签收人, 页数, 份数', NULL, NULL, '2025-04-14 09:24:00', '2025-04-14 09:24:01', NULL, NULL, NULL, NULL, NULL, NULL, 'documents_export_14_2025-04-11T07-28-00-241Z.xlsx');
INSERT INTO `export_tasks` VALUES (27, 1, NULL, 'document_import', 2, NULL, 'xlsx', NULL, 100, NULL, '257658b8-394f-4278-8d4c-87aa0a15bb50.xlsx', NULL, NULL, NULL, '2025-04-14 09:31:45', '2025-04-14 09:31:46', NULL, 3, 3, 3, 0, NULL, 'documents_export_18_2025-04-14T01-16-44-509Z.xlsx');
INSERT INTO `export_tasks` VALUES (28, 1, NULL, 'document_export', 2, 'documents_export_28_2025-04-15T00-17-16-095Z.xlsx', 'xlsx', '{}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_28_2025-04-15T00-17-16-095Z.xlsx', NULL, 'all', NULL, '2025-04-15 00:17:15', '2025-04-15 00:17:16', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (29, 1, NULL, 'document_export', 2, 'documents_export_29_2025-04-15T00-21-16-736Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_29_2025-04-15T00-21-16-736Z.xlsx', NULL, 'currentPage', NULL, '2025-04-15 00:21:16', '2025-04-15 00:21:16', '[100, 101, 102]', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (30, 1, NULL, 'document_import', 2, NULL, 'xlsx', NULL, 100, NULL, 'acc505c8-1a07-4d93-8045-c8ad2360926b.xlsx', NULL, NULL, NULL, '2025-04-15 00:21:59', '2025-04-15 00:21:59', NULL, 47, 47, 47, 0, NULL, 'documents_export_13_2025-04-11T07-04-00-667Z.xlsx');
INSERT INTO `export_tasks` VALUES (31, 1, NULL, 'document_import', 2, NULL, 'xlsx', NULL, 100, NULL, 'b13fa181-d6ad-456d-a02b-30fdf1e5c96e.xlsx', NULL, NULL, NULL, '2025-04-15 00:26:08', '2025-04-15 00:26:08', NULL, 10, 10, 10, 0, NULL, 'documents_export_21_2025-04-14T01-34-22-159Z.xlsx');
INSERT INTO `export_tasks` VALUES (32, 1, NULL, 'document_import', 2, NULL, 'xlsx', NULL, 100, NULL, 'd6b38733-6fec-40c1-af48-a85790c34100.xlsx', NULL, NULL, NULL, '2025-04-15 00:28:04', '2025-04-15 00:28:04', NULL, 10, 10, 10, 0, NULL, 'documents_export_15_2025-04-11T07-33-11-209Z.xlsx');
INSERT INTO `export_tasks` VALUES (33, 1, NULL, 'document_import', 2, NULL, 'xlsx', NULL, 100, NULL, 'd807b06b-a428-408b-80a0-8ec8059422f1.xlsx', NULL, NULL, NULL, '2025-04-15 00:29:54', '2025-04-15 00:29:54', NULL, 3, 3, 3, 0, NULL, 'documents_export_10_2025-04-11T06-41-12-451Z.xlsx');
INSERT INTO `export_tasks` VALUES (34, 1, NULL, 'document_import', 2, NULL, 'xlsx', NULL, 100, NULL, 'dc52329f-082f-41f7-ab50-e6d719d580cf.xlsx', NULL, NULL, NULL, '2025-04-16 06:53:09', '2025-04-16 06:53:10', NULL, 47, 47, 47, 0, NULL, 'documents_export_13_2025-04-11T07-04-00-667Z.xlsx');
INSERT INTO `export_tasks` VALUES (35, 1, NULL, 'document_import', 2, NULL, 'xlsx', NULL, 100, NULL, 'fa22bfc5-0e04-4d04-b4f0-d391a6cefe75.xlsx', NULL, NULL, NULL, '2025-04-16 06:53:42', '2025-04-16 06:53:42', NULL, 1, 1, 1, 0, NULL, 'documents_export_25_2025-04-14T08-59-35-677Z.xlsx');
INSERT INTO `export_tasks` VALUES (36, 1, NULL, 'document_export', 2, 'documents_export_36_2025-04-16T06-56-12-732Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_36_2025-04-16T06-56-12-732Z.xlsx', NULL, 'currentPage', NULL, '2025-04-16 06:56:12', '2025-04-16 06:56:12', '[179, 178, 177, 176, 174, 183, 217, 182, 181, 220]', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (37, 1, NULL, 'document_import', 2, NULL, 'xlsx', NULL, 100, NULL, '3ad841a6-ec67-49f3-8750-0606cb5c51b2.xlsx', NULL, NULL, NULL, '2025-04-16 06:57:12', '2025-04-16 06:57:13', NULL, 47, 47, 47, 0, NULL, 'documents_export_13_2025-04-11T07-04-00-667Z.xlsx');
INSERT INTO `export_tasks` VALUES (38, 1, NULL, 'document_export', 2, 'documents_export_38_2025-04-16T09-03-09-899Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_38_2025-04-16T09-03-09-899Z.xlsx', NULL, 'currentPage', NULL, '2025-04-16 09:03:09', '2025-04-16 09:03:10', '[248, 246, 244, 243, 242, 241, 240, 239, 238, 237]', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (39, 1, NULL, 'document_export', 2, 'documents_export_39_2025-04-17T00-46-22-964Z.xlsx', 'xlsx', '{}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_39_2025-04-17T00-46-22-964Z.xlsx', NULL, 'all', NULL, '2025-04-17 00:46:22', '2025-04-17 00:46:23', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (40, 1, NULL, 'document_export', 2, 'documents_export_40_2025-04-17T00-49-29-501Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_40_2025-04-17T00-49-29-501Z.xlsx', NULL, 'currentPage', NULL, '2025-04-17 00:49:29', '2025-04-17 00:49:29', '[248, 246, 244, 243, 242, 241, 240, 239, 238, 237]', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (41, 1, NULL, 'document_import', 2, NULL, 'xlsx', NULL, 100, NULL, '8fbfeda0-1efe-4b16-a4ac-51479a74ef99.xlsx', NULL, NULL, NULL, '2025-04-17 00:50:13', '2025-04-17 00:50:13', NULL, 10, 10, 10, 0, NULL, 'documents_export_40_2025-04-17T00-49-29-501Z.xlsx');
INSERT INTO `export_tasks` VALUES (42, 1, NULL, 'document_import', 2, NULL, 'xlsx', NULL, 100, NULL, 'd6385581-9ee1-4141-9893-645878ecdef8.xlsx', NULL, NULL, NULL, '2025-04-17 00:53:35', '2025-04-17 00:53:35', NULL, 10, 10, 10, 0, NULL, 'documents_export_40_2025-04-17T00-49-29-501Z.xlsx');
INSERT INTO `export_tasks` VALUES (43, 1, NULL, 'document_import', 2, NULL, 'xlsx', NULL, 100, NULL, '5d9d10a5-9877-460a-9920-0a763d7baae5.xlsx', NULL, NULL, NULL, '2025-04-17 00:56:40', '2025-04-17 00:56:42', NULL, 10, 10, 10, 0, NULL, 'documents_export_36_2025-04-16T06-56-12-732Z.xlsx');
INSERT INTO `export_tasks` VALUES (44, 1, NULL, 'document_export', 2, 'documents_export_44_2025-04-17T00-57-35-115Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_44_2025-04-17T00-57-35-115Z.xlsx', NULL, 'currentPage', NULL, '2025-04-17 00:57:34', '2025-04-17 00:57:35', '[297, 296, 295, 294, 293, 292, 291, 290, 299, 298]', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (45, 1, NULL, 'document_export', 2, 'documents_export_45_2025-04-17T01-01-07-152Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_45_2025-04-17T01-01-07-152Z.xlsx', NULL, 'currentPage', NULL, '2025-04-17 01:01:07', '2025-04-17 01:01:07', '[297, 296, 295, 294, 293, 292, 291, 290, 299, 298]', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (46, 1, NULL, 'document_export', 2, 'documents_export_46_2025-04-18T00-31-52-553Z.xlsx', 'xlsx', '{}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_46_2025-04-18T00-31-52-553Z.xlsx', NULL, 'all', NULL, '2025-04-18 00:31:52', '2025-04-18 00:31:52', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (47, 1, NULL, 'document_export', 2, 'documents_export_47_2025-04-18T00-32-16-241Z.xlsx', 'xlsx', '{}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_47_2025-04-18T00-32-16-241Z.xlsx', NULL, 'all', NULL, '2025-04-18 00:32:16', '2025-04-18 00:32:16', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (48, 1, NULL, 'document_export', 2, 'documents_export_48_2025-04-18T00-35-18-914Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_48_2025-04-18T00-35-18-914Z.xlsx', NULL, 'currentPage', NULL, '2025-04-18 00:35:18', '2025-04-18 00:35:18', '[298, 296, 295, 294, 293, 292, 291, 290, 299, 289]', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (49, 1, NULL, 'document_export', 2, 'documents_export_49_2025-04-18T00-35-21-590Z.xlsx', 'xlsx', '{}', 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_49_2025-04-18T00-35-21-590Z.xlsx', NULL, 'all', NULL, '2025-04-18 00:35:21', '2025-04-18 00:35:21', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (50, 1, NULL, 'document_import', 2, NULL, 'xlsx', NULL, 100, NULL, 'da09dd38-67d9-41c1-9aad-0d7fdf39bb5a.xlsx', NULL, NULL, NULL, '2025-04-18 00:35:52', '2025-04-18 00:35:52', NULL, 10, 10, 10, 0, NULL, 'documents_export_36_2025-04-16T06-56-12-732Z.xlsx');
INSERT INTO `export_tasks` VALUES (51, 1, NULL, 'document_export', 2, 'documents_export_51_2025-04-22T07-09-13-812Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_51_2025-04-22T07-09-13-812Z.xlsx', NULL, 'selected', '[312,311]', '2025-04-22 07:09:13', '2025-04-22 07:09:13', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `export_tasks` VALUES (52, 1, NULL, 'document_import', 2, NULL, 'xlsx', NULL, 100, NULL, 'ee3547b2-a906-492e-856e-223f9dac82ee.xlsx', NULL, NULL, NULL, '2025-04-22 07:09:59', '2025-04-22 07:10:00', NULL, 2, 2, 2, 0, NULL, 'documents_export_51_2025-04-22T07-09-13-812Z.xlsx');
INSERT INTO `export_tasks` VALUES (53, 1, NULL, 'document_import', 2, NULL, 'xlsx', NULL, 100, NULL, '6cd1be1d-fbc5-4289-94c7-8984eebc5948.xlsx', NULL, NULL, NULL, '2025-04-22 09:15:23', '2025-04-22 09:15:23', NULL, 19, 19, 19, 0, NULL, '1.xlsx');
INSERT INTO `export_tasks` VALUES (54, 1, NULL, 'document_import', 2, NULL, 'xlsx', NULL, 100, NULL, '0e69a08b-4f64-43bf-b5f6-fafd8280ad31.xlsx', NULL, NULL, NULL, '2025-04-23 02:23:33', '2025-04-23 02:23:34', NULL, 76, 76, 76, 0, NULL, '2.xlsx');
INSERT INTO `export_tasks` VALUES (55, 1, NULL, 'document_export', 2, 'documents_export_55_2025-04-23T02-41-13-649Z.xlsx', 'xlsx', NULL, 100, '[\"id\",\"docName\",\"docTypeName\",\"sourceDepartmentName\",\"submitter\",\"receiver\",\"signer\",\"handoverDate\",\"storageLocation\",\"remarks\",\"createdByName\",\"createdAt\",\"updatedByName\",\"updatedAt\"]', 'D:\\DEV\\LDIMS\\backend\\exports\\documents_export_55_2025-04-23T02-41-13-649Z.xlsx', NULL, 'currentPage', NULL, '2025-04-23 02:41:13', '2025-04-23 02:41:13', '[394, 393, 392, 391, 390, 389, 388, 387, 386, 385]', NULL, NULL, NULL, NULL, NULL, NULL);

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
) ENGINE = InnoDB AUTO_INCREMENT = 154 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '操作日志表' ROW_FORMAT = Dynamic;

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
INSERT INTO `operation_logs` VALUES (44, 1, 'USER_CREATE', '创建用户：mwy(ID: 7)', '::1', '2025-04-17 03:30:51');
INSERT INTO `operation_logs` VALUES (45, 1, 'USER_DISABLE', '禁用用户：江川(ID: 6)，变更：status: 1 → 0', '::1', '2025-04-17 03:30:56');
INSERT INTO `operation_logs` VALUES (46, 1, 'USER_ENABLE', '启用用户：江川(ID: 6)，变更：status: 0 → 1', '::1', '2025-04-17 03:30:57');
INSERT INTO `operation_logs` VALUES (47, 1, 'PASSWORD_RESET', '重置密码：马文颖(ID: 7)', '::1', '2025-04-17 06:59:06');
INSERT INTO `operation_logs` VALUES (48, 1, 'USER_DISABLE', '禁用用户：马文颖(ID: 7)，变更：status: 1 → 0', '::1', '2025-04-17 08:33:49');
INSERT INTO `operation_logs` VALUES (49, 1, 'USER_ENABLE', '启用用户：马文颖(ID: 7)，变更：status: 0 → 1', '::1', '2025-04-17 08:33:50');
INSERT INTO `operation_logs` VALUES (50, 1, 'DOCTYPE_CREATE', '创建文档类型: 1', '::1', '2025-04-17 09:14:42');
INSERT INTO `operation_logs` VALUES (51, 1, 'DOCTYPE_DELETE', '删除文档类型: 1(ID: 27)', '::1', '2025-04-17 09:14:47');
INSERT INTO `operation_logs` VALUES (52, 1, 'DEPARTMENT_DELETE', '删除部门: 采购部(ID: 8)', '::1', '2025-04-17 09:18:40');
INSERT INTO `operation_logs` VALUES (53, 1, 'DEPARTMENT_CREATE', '创建部门: 采购部', '::1', '2025-04-17 09:18:54');
INSERT INTO `operation_logs` VALUES (54, 1, 'DEPARTMENT_DELETE', '删除部门: 采购部(ID: 10)', '::1', '2025-04-17 09:59:44');
INSERT INTO `operation_logs` VALUES (55, 1, 'DOCUMENT_DELETE', '删除文档: 关于调整办公区域的通知(ID: 297)', '::1', '2025-04-17 09:59:50');
INSERT INTO `operation_logs` VALUES (56, 1, 'DOCTYPE_CREATE', '创建文档类型: 1', '::1', '2025-04-18 00:30:35');
INSERT INTO `operation_logs` VALUES (57, 1, 'DOCTYPE_DELETE', '删除文档类型: 1(ID: 28)', '::1', '2025-04-18 00:30:38');
INSERT INTO `operation_logs` VALUES (58, 1, 'DOCUMENT_EXPORT', '发起文档导出任务 (范围: all, 类型: xlsx)', '::1', '2025-04-18 00:31:52');
INSERT INTO `operation_logs` VALUES (59, 1, 'DOCUMENT_EXPORT', '文档导出任务 #46 (文件: documents_export_46_2025-04-18T00-31-52-553Z.xlsx) 处理成功完成。', 'SYSTEM', '2025-04-18 00:31:52');
INSERT INTO `operation_logs` VALUES (60, 1, 'DOCUMENT_EXPORT', '发起文档导出任务 (范围: all, 类型: xlsx)', '::1', '2025-04-18 00:32:16');
INSERT INTO `operation_logs` VALUES (61, 1, 'DOCUMENT_EXPORT', '文档导出任务 #47 (文件: documents_export_47_2025-04-18T00-32-16-241Z.xlsx) 处理成功完成。', 'SYSTEM', '2025-04-18 00:32:16');
INSERT INTO `operation_logs` VALUES (62, 1, 'DOCUMENT_EXPORT', '发起文档导出任务 (范围: currentPage, 类型: xlsx)', '::1', '2025-04-18 00:35:18');
INSERT INTO `operation_logs` VALUES (63, 1, 'DOCUMENT_EXPORT', '文档导出任务 #48 (文件: documents_export_48_2025-04-18T00-35-18-914Z.xlsx) 处理成功完成。', 'SYSTEM', '2025-04-18 00:35:18');
INSERT INTO `operation_logs` VALUES (64, 1, 'DOCUMENT_EXPORT', '发起文档导出任务 (范围: all, 类型: xlsx)', '::1', '2025-04-18 00:35:21');
INSERT INTO `operation_logs` VALUES (65, 1, 'DOCUMENT_EXPORT', '文档导出任务 #49 (文件: documents_export_49_2025-04-18T00-35-21-590Z.xlsx) 处理成功完成。', 'SYSTEM', '2025-04-18 00:35:21');
INSERT INTO `operation_logs` VALUES (66, 1, 'DOCUMENT_IMPORT', '发起文档导入任务 (文件: documents_export_36_2025-04-16T06-56-12-732Z.xlsx)', '::1', '2025-04-18 00:35:52');
INSERT INTO `operation_logs` VALUES (67, 1, 'DOCUMENT_IMPORT', '文档导入任务 #50 (文件: documents_export_36_2025-04-16T06-56-12-732Z.xlsx) 完成，成功导入 10 条记录。', 'SYSTEM', '2025-04-18 00:35:52');
INSERT INTO `operation_logs` VALUES (68, 1, 'DEPARTMENT_CREATE', '创建部门: 采购部', '::1', '2025-04-18 00:36:13');
INSERT INTO `operation_logs` VALUES (69, 1, 'DEPARTMENT_CREATE', '创建部门: 规划部', '::1', '2025-04-18 00:36:24');
INSERT INTO `operation_logs` VALUES (70, 1, 'DEPARTMENT_UPDATE', '更新部门: 规划部(ID: 12)', '::1', '2025-04-18 00:36:38');
INSERT INTO `operation_logs` VALUES (71, 1, 'DEPARTMENT_UPDATE', '更新部门: 采购部(ID: 11)', '::1', '2025-04-18 00:36:42');
INSERT INTO `operation_logs` VALUES (72, 1, 'DEPARTMENT_CREATE', '创建部门: 其他部', '::1', '2025-04-18 00:36:51');
INSERT INTO `operation_logs` VALUES (73, 1, 'DEPARTMENT_CREATE', '创建部门: 1', '::1', '2025-04-18 00:43:43');
INSERT INTO `operation_logs` VALUES (74, 1, 'DEPARTMENT_DELETE', '删除部门: 1(ID: 14)', '::1', '2025-04-18 00:48:38');
INSERT INTO `operation_logs` VALUES (75, 1, 'DEPARTMENT_CREATE', '创建部门: 1', '::1', '2025-04-18 00:51:21');
INSERT INTO `operation_logs` VALUES (76, 1, 'DEPARTMENT_CREATE', '创建部门: 2', '::1', '2025-04-18 00:54:09');
INSERT INTO `operation_logs` VALUES (77, 1, 'USER_DISABLE', '禁用用户：马文颖(ID: 7)，变更：status: 1 → 0', '::1', '2025-04-18 01:02:34');
INSERT INTO `operation_logs` VALUES (78, 1, 'USER_ENABLE', '启用用户：马文颖(ID: 7)，变更：status: 0 → 1', '::1', '2025-04-18 01:02:34');
INSERT INTO `operation_logs` VALUES (79, 1, 'USER_CREATE', '创建用户：slh(ID: 8)', '::1', '2025-04-18 01:03:26');
INSERT INTO `operation_logs` VALUES (80, 1, 'PASSWORD_RESET', '重置密码：马文颖(ID: 7)', '::1', '2025-04-18 01:03:30');
INSERT INTO `operation_logs` VALUES (81, 1, 'USER_DISABLE', '禁用用户：江川(ID: 6)，变更：status: 1 → 0', '::1', '2025-04-18 01:03:34');
INSERT INTO `operation_logs` VALUES (82, 1, 'DOCUMENT_CREATE', '创建文档: 1', '::1', '2025-04-18 01:22:50');
INSERT INTO `operation_logs` VALUES (83, 1, 'USER_CREATE', '创建用户：liuyong(ID: 9)', '::1', '2025-04-18 06:40:17');
INSERT INTO `operation_logs` VALUES (84, 1, 'DOCUMENT_EXPORT', '发起文档导出任务 (范围: selected, 类型: xlsx)', '::1', '2025-04-22 07:09:13');
INSERT INTO `operation_logs` VALUES (85, 1, 'DOCUMENT_EXPORT', '文档导出任务 #51 (文件: documents_export_51_2025-04-22T07-09-13-812Z.xlsx) 处理成功完成。', 'SYSTEM', '2025-04-22 07:09:13');
INSERT INTO `operation_logs` VALUES (86, 1, 'DOCUMENT_IMPORT', '发起文档导入任务 (文件: documents_export_51_2025-04-22T07-09-13-812Z.xlsx)', '::1', '2025-04-22 07:09:59');
INSERT INTO `operation_logs` VALUES (87, 1, 'DOCUMENT_IMPORT', '文档导入任务 #52 (文件: documents_export_51_2025-04-22T07-09-13-812Z.xlsx) 完成，成功导入 2 条记录。', 'SYSTEM', '2025-04-22 07:10:00');
INSERT INTO `operation_logs` VALUES (88, 1, 'DOCUMENT_IMPORT', '发起文档导入任务 (文件: 1.xlsx)', '::1', '2025-04-22 09:15:23');
INSERT INTO `operation_logs` VALUES (89, 1, 'DOCUMENT_IMPORT', '文档导入任务 #53 (文件: 1.xlsx) 完成，成功导入 19 条记录。', 'SYSTEM', '2025-04-22 09:15:23');
INSERT INTO `operation_logs` VALUES (90, 1, 'DOCUMENT_IMPORT', '发起文档导入任务 (文件: 2.xlsx)', '::1', '2025-04-23 02:23:34');
INSERT INTO `operation_logs` VALUES (91, 1, 'DOCUMENT_IMPORT', '文档导入任务 #54 (文件: 2.xlsx) 完成，成功导入 76 条记录。', 'SYSTEM', '2025-04-23 02:23:34');
INSERT INTO `operation_logs` VALUES (92, 1, 'DOCUMENT_EXPORT', '发起文档导出任务 (范围: currentPage, 类型: xlsx)', '::1', '2025-04-23 02:41:13');
INSERT INTO `operation_logs` VALUES (93, 1, 'DOCUMENT_EXPORT', '文档导出任务 #55 (文件: documents_export_55_2025-04-23T02-41-13-649Z.xlsx) 处理成功完成。', 'SYSTEM', '2025-04-23 02:41:13');
INSERT INTO `operation_logs` VALUES (94, 1, 'DOCUMENT_CREATE', '创建文档: 1', '::1', '2025-04-29 06:49:32');
INSERT INTO `operation_logs` VALUES (95, 1, 'DOCUMENT_UPDATE', '更新文档: 1(ID: 410)', '::1', '2025-04-29 06:53:46');
INSERT INTO `operation_logs` VALUES (96, 1, 'DOCUMENT_UPDATE', '更新文档: 运维服务台运行通知X3(ID: 393)', '::1', '2025-04-29 06:54:03');
INSERT INTO `operation_logs` VALUES (97, 1, 'DOCUMENT_UPDATE', '更新文档: 运维服务台运行通知X3(ID: 393)', '::1', '2025-04-29 07:10:56');
INSERT INTO `operation_logs` VALUES (98, 1, 'DOCUMENT_UPDATE', '更新文档: 安徽台索贝人员信息表(ID: 387)', '::1', '2025-04-29 07:14:35');
INSERT INTO `operation_logs` VALUES (99, 1, 'DOCUMENT_UPDATE', '更新文档: 24年（12月）制播机房检查表(ID: 382)', '::1', '2025-04-29 07:16:17');
INSERT INTO `operation_logs` VALUES (100, 1, 'DOCUMENT_UPDATE', '更新文档: 25年（01月）制播机房检查表(ID: 389)', '::1', '2025-04-29 07:41:27');
INSERT INTO `operation_logs` VALUES (101, 1, 'DOCUMENT_UPDATE', '更新文档: 新闻制播系统升级采购(ID: 391)', '::1', '2025-04-29 07:41:30');
INSERT INTO `operation_logs` VALUES (102, 1, 'DOCUMENT_UPDATE', '更新文档: 付款申请-索贝(ID: 388)', '::1', '2025-04-29 07:42:08');
INSERT INTO `operation_logs` VALUES (103, 1, 'DOCUMENT_UPDATE', '更新文档: 新闻制播系统升级采购(ID: 391)', '::1', '2025-04-29 07:44:44');
INSERT INTO `operation_logs` VALUES (104, 1, 'DOCUMENT_UPDATE', '更新文档: 25年01月份全台网机房保洁表(ID: 390)', '::1', '2025-04-29 08:06:35');
INSERT INTO `operation_logs` VALUES (105, 1, 'DOCUMENT_UPDATE', '更新文档: 1(ID: 410)', '::1', '2025-04-29 09:33:20');
INSERT INTO `operation_logs` VALUES (106, 1, 'DOCUMENT_CREATE', '创建文档: 测试同步文件上传', '::1', '2025-04-30 00:48:05');
INSERT INTO `operation_logs` VALUES (107, 1, 'DOCUMENT_UPDATE', '更新文档: 测试同步文件上传(ID: 411)', '::1', '2025-04-30 00:48:51');
INSERT INTO `operation_logs` VALUES (108, 1, 'DOCUMENT_UPDATE', '更新文档: 测试同步文件上传(ID: 411)', '::1', '2025-04-30 00:49:03');
INSERT INTO `operation_logs` VALUES (109, 1, 'DOCUMENT_CREATE', '创建文档: 测试文档上传2', '::1', '2025-04-30 00:51:47');
INSERT INTO `operation_logs` VALUES (110, 1, 'DOCUMENT_UPDATE', '更新文档: 播出媒资存储升级函(ID: 394)', '::1', '2025-04-30 01:00:51');
INSERT INTO `operation_logs` VALUES (111, 1, 'DOCUMENT_UPDATE', '更新文档: 新闻制播系统升级采购(ID: 372)', '::1', '2025-04-30 01:05:17');
INSERT INTO `operation_logs` VALUES (112, 1, 'DOCUMENT_UPDATE', '更新文档: 新闻制播系统升级采购(ID: 372)', '::1', '2025-04-30 01:05:25');
INSERT INTO `operation_logs` VALUES (113, 1, 'DOCUMENT_UPDATE', '更新文档: 25年（01月）制播机房检查表(ID: 370)', '::1', '2025-04-30 01:05:34');
INSERT INTO `operation_logs` VALUES (114, 1, 'DOCUMENT_UPDATE', '更新文档: 制播运维合同第一包-索贝(ID: 386)', '::1', '2025-04-30 04:30:22');
INSERT INTO `operation_logs` VALUES (115, 1, 'DOCUMENT_UPDATE', '更新文档: 制播运维合同第一包-索贝(ID: 386)', '::1', '2025-04-30 04:37:20');
INSERT INTO `operation_logs` VALUES (116, 1, 'DOCUMENT_UPDATE', '更新文档: 制播运维合同第一包-索贝(ID: 386)', '::1', '2025-04-30 04:44:16');
INSERT INTO `operation_logs` VALUES (117, 1, 'DOCUMENT_UPDATE', '更新文档: 索贝项目经理任命-董先进(ID: 385)', '::1', '2025-04-30 04:44:40');
INSERT INTO `operation_logs` VALUES (118, 1, 'DOCUMENT_UPDATE', '更新文档: 索贝项目经理任命-姚伟(ID: 384)', '::1', '2025-04-30 04:47:48');
INSERT INTO `operation_logs` VALUES (119, 1, 'DOCUMENT_UPDATE', '更新文档: 索贝项目经理任命-姚伟(ID: 384)', '::1', '2025-04-30 04:47:58');
INSERT INTO `operation_logs` VALUES (120, 1, 'DOCUMENT_UPDATE', '更新文档: 全台网索贝运维二包采购合同(ID: 381)', '::1', '2025-04-30 05:00:26');
INSERT INTO `operation_logs` VALUES (121, 1, 'DOCUMENT_UPDATE', '更新文档: 播出媒资存储升级函(ID: 375)', '::1', '2025-04-30 05:16:30');
INSERT INTO `operation_logs` VALUES (122, 1, 'DOCUMENT_UPDATE', '更新文档: 1(ID: 410)', '::1', '2025-05-09 06:57:44');
INSERT INTO `operation_logs` VALUES (123, 1, 'ATTACHMENT_CLEAR', '清空了文档ID 392 的所有附件', '::1', '2025-05-09 07:02:48');
INSERT INTO `operation_logs` VALUES (124, 1, 'DOCUMENT_UPDATE', '更新文档: 文体戴本祠退休(ID: 392)', '::1', '2025-05-09 07:02:49');
INSERT INTO `operation_logs` VALUES (125, 1, 'ATTACHMENT_UPLOAD', '文档ID 392 上传了 1 个文件: å·¥ç¨å¸èæååé¡µ_æ±å·.pdf', '::1', '2025-05-09 07:04:12');
INSERT INTO `operation_logs` VALUES (126, 1, 'DOCUMENT_UPDATE', '更新文档: 文体戴本祠退休(ID: 392)', '::1', '2025-05-09 07:04:15');
INSERT INTO `operation_logs` VALUES (127, 1, 'ATTACHMENT_UPLOAD', '文档ID 389 上传了 1 个文件: 2022å¹´çµå½±çµè§ææ¯å­¦ä¼ç§å­¦ææ¯å¥äºç­å¥_æ±å·.pdf', '::1', '2025-05-09 07:07:17');
INSERT INTO `operation_logs` VALUES (128, 1, 'DOCUMENT_UPDATE', '更新文档: 25年（01月）制播机房检查表(ID: 389)', '::1', '2025-05-09 07:07:22');
INSERT INTO `operation_logs` VALUES (129, 1, 'ATTACHMENT_UPLOAD', '文档ID 380 上传了 1 个文件: å·¥ç¨å¸èæé¦é¡µ_æ±å·.pdf', '::1', '2025-05-09 07:14:45');
INSERT INTO `operation_logs` VALUES (130, 1, 'ATTACHMENT_UPLOAD', '文档ID 365 上传了 1 个文件: ç¡å£«æ¯ä¸_æ±å·.pdf', '::1', '2025-05-09 07:20:33');
INSERT INTO `operation_logs` VALUES (131, 1, 'DOCUMENT_UPDATE', '更新文档: 索贝项目经理任命-姚伟(ID: 365)', '::1', '2025-05-09 07:20:37');
INSERT INTO `operation_logs` VALUES (132, 1, 'ATTACHMENT_UPLOAD', '文档ID 336 上传了 1 个文件: å·¥ç¨å¸èæååé¡µ_æ±å·.pdf', '::1', '2025-05-09 07:22:37');
INSERT INTO `operation_logs` VALUES (133, 1, 'DOCUMENT_UPDATE', '更新文档: 运维服务台运行通知X3(ID: 336)', '::1', '2025-05-09 07:23:01');
INSERT INTO `operation_logs` VALUES (134, 1, 'ATTACHMENT_UPLOAD', '文档ID 373 上传了 1 个文件: å¹´åº¦èæ ¸è¯æ_æ±å·.pdf', '::1', '2025-05-09 07:32:30');
INSERT INTO `operation_logs` VALUES (135, 1, 'DOCUMENT_UPDATE', '更新文档: 文体戴本祠退休(ID: 373)', '::1', '2025-05-09 07:32:31');
INSERT INTO `operation_logs` VALUES (136, 1, 'ATTACHMENT_UPLOAD', '文档ID 344 上传了 1 个文件: 2019å¹´çéæ°é»ç§å­¦ææ¯å¥ä¸ç­å¥_æ±å·.pdf', '::1', '2025-05-09 07:35:02');
INSERT INTO `operation_logs` VALUES (137, 1, 'DOCUMENT_UPDATE', '更新文档: 24年（12月）制播机房检查表(ID: 344)', '::1', '2025-05-09 07:35:05');
INSERT INTO `operation_logs` VALUES (138, 1, 'ATTACHMENT_UPLOAD', '文档ID 345 上传了 1 个文件: 2017å¹´çµå½±çµè§ææ¯å­¦ä¼ç§å­¦ææ¯å¥äºç­å¥_æ±å·.pdf', '::1', '2025-05-09 07:37:32');
INSERT INTO `operation_logs` VALUES (139, 1, 'DOCUMENT_UPDATE', '更新文档: 24年12月份全台网机房保洁表(ID: 345)', '::1', '2025-05-09 07:37:33');
INSERT INTO `operation_logs` VALUES (140, 1, 'ATTACHMENT_UPLOAD', '文档ID 355 上传了 1 个文件: å·¥ç¨å¸èæé¦é¡µ_æ±å·.pdf', '::1', '2025-05-09 07:40:05');
INSERT INTO `operation_logs` VALUES (141, 1, 'DOCUMENT_UPDATE', '更新文档: 运维服务台运行通知X3(ID: 355)', '::1', '2025-05-09 07:40:07');
INSERT INTO `operation_logs` VALUES (142, 1, 'ATTACHMENT_UPLOAD', '文档ID 354 上传了 1 个文件: è¯ä¿¡æ¿è¯ºä¹¦_æ±å·.pdf', '::1', '2025-05-09 07:49:32');
INSERT INTO `operation_logs` VALUES (143, 1, 'DOCUMENT_UPDATE', '更新文档: 文体戴本祠退休(ID: 354)', '::1', '2025-05-09 07:49:36');
INSERT INTO `operation_logs` VALUES (144, 1, 'ATTACHMENT_UPLOAD', '文档ID 342 上传了 1 个文件: å·¥ä½ç»åè¯æ_æ±å·.pdf', '::1', '2025-05-09 07:51:54');
INSERT INTO `operation_logs` VALUES (145, 1, 'DOCUMENT_UPDATE', '更新文档: 安徽台合作单位人员信息表(ID: 342)', '::1', '2025-05-09 07:52:09');
INSERT INTO `operation_logs` VALUES (146, 1, 'ATTACHMENT_UPLOAD', '文档ID 346 上传了 1 个文件: 工程师聘文名单页_江川.pdf', '::1', '2025-05-09 07:56:34');
INSERT INTO `operation_logs` VALUES (147, 1, 'DOCUMENT_UPDATE', '更新文档: 索贝项目经理任命-姚伟(ID: 346)', '::1', '2025-05-09 07:56:35');
INSERT INTO `operation_logs` VALUES (148, 1, 'ATTACHMENT_UPLOAD', '文档ID 362 上传了 1 个文件: 0_全台网索贝运维二包采购合同_20250509T075841446Z.png', '::1', '2025-05-09 07:58:41');
INSERT INTO `operation_logs` VALUES (149, 1, 'DOCUMENT_UPDATE', '更新文档: 全台网索贝运维二包采购合同(ID: 362)', '::1', '2025-05-09 07:58:42');
INSERT INTO `operation_logs` VALUES (150, 1, 'ATTACHMENT_UPLOAD', '文档ID 353 上传了 1 个文件: 0_新闻制播系统升级采购_20250509T084215717Z.pdf', '::ffff:127.0.0.1', '2025-05-09 08:42:15');
INSERT INTO `operation_logs` VALUES (151, 1, 'DOCUMENT_UPDATE', '更新文档: 新闻制播系统升级采购(ID: 353)', '::ffff:127.0.0.1', '2025-05-09 08:42:17');
INSERT INTO `operation_logs` VALUES (152, 1, 'DOCUMENT_CREATE', '创建文档: test', '::1', '2025-05-09 08:43:08');
INSERT INTO `operation_logs` VALUES (153, 1, 'ATTACHMENT_UPLOAD', '文档ID 413 上传了 1 个文件: 0_test_20250509T084308897Z.pdf', '::1', '2025-05-09 08:43:08');

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
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '系统配置表' ROW_FORMAT = Dynamic;

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
INSERT INTO `system_configs` VALUES (9, 'FILE_STORAGE_PATH', 'D:\\UPLOAD_FILES', '上传文件的本地存储根路径', '2025-04-28 15:45:25', '2025-04-29 07:08:34');

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
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'admin', 'admin123', '系统管理员', 'admin', 1, 1, '2025-04-09 09:15:55', '2025-04-16 09:04:14');
INSERT INTO `users` VALUES (6, 'jiangchuan', '123456', '江川', 'editor', 2, 0, '2025-04-16 09:15:27', '2025-04-18 01:03:34');
INSERT INTO `users` VALUES (7, 'mwy', '123456', '马文颖', 'admin', 2, 1, '2025-04-17 03:30:51', '2025-04-18 01:02:34');
INSERT INTO `users` VALUES (8, 'slh', '123456', '孙龙唤', 'admin', 2, 1, '2025-04-18 01:03:26', '2025-04-18 01:03:26');
INSERT INTO `users` VALUES (9, 'liuyong', '123456', '刘勇', 'admin', 2, 1, '2025-04-18 06:40:17', '2025-04-18 06:40:17');

SET FOREIGN_KEY_CHECKS = 1;
