<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="60%"
    :before-close="handleClose"
    draggable
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="isViewMode ? {} : rules"
      label-width="100px"
      v-loading="loading"
      :disabled="isViewMode"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="文档名称" prop="doc_name">
            <el-input
              v-model="formData.doc_name"
              placeholder="请输入文档名称"
              :disabled="isViewMode"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="文档类型" prop="docTypeName">
            <el-input
              v-if="isViewMode"
              :model-value="formData.docTypeName"
              disabled
              placeholder="---"
            />
            <template v-else-if="!isEditingDocType">
              <el-input
                :model-value="formData.docTypeName"
                disabled
                placeholder="未指定"
                style="width: calc(100% - 70px); margin-right: 8px"
              />
              <el-button @click="isEditingDocType = true" :disabled="isViewMode"
                >更改</el-button
              >
            </template>
            <el-tree-select
              v-else
              :model-value="formData.docTypeId"
              @update:modelValue="handleDocTypeChange"
              placeholder="请选择新文档类型"
              :data="props.docTypeTreeData"
              :props="treeProps"
              check-strictly
              :render-after-expand="false"
              clearable
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="来源部门" prop="sourceDepartmentName">
            <el-input
              v-if="isViewMode"
              :model-value="formData.sourceDepartmentName"
              disabled
              placeholder="---"
            />
            <template v-else-if="!isEditingDepartment">
              <el-input
                :model-value="formData.sourceDepartmentName"
                disabled
                placeholder="未指定"
                style="width: calc(100% - 70px); margin-right: 8px"
              />
              <el-button
                @click="isEditingDepartment = true"
                :disabled="isViewMode"
                >更改</el-button
              >
            </template>
            <el-tree-select
              v-else
              :model-value="formData.sourceDepartmentId"
              @update:modelValue="handleDepartmentChange"
              placeholder="请选择新来源部门"
              :data="props.departmentTreeData"
              :props="treeProps"
              check-strictly
              :render-after-expand="false"
              clearable
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="交接日期" prop="handoverDate">
            <el-date-picker
              v-model="formData.handoverDate"
              type="date"
              placeholder="选择交接日期"
              value-format="YYYY-MM-DD"
              style="width: 100%"
              :disabled="isViewMode"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="提交人" prop="submitter">
            <el-input
              v-model="formData.submitter"
              placeholder="请输入提交人"
              :disabled="isViewMode"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="接收人" prop="receiver">
            <el-input
              v-model="formData.receiver"
              placeholder="请输入接收人"
              :disabled="isViewMode"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="签署人" prop="signer">
            <el-input
              v-model="formData.signer"
              placeholder="请输入签署人 (可选)"
              :disabled="isViewMode"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="存放位置" prop="storageLocation">
            <el-input
              v-model="formData.storageLocation"
              placeholder="请输入存放位置 (可选)"
              :disabled="isViewMode"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="备注" prop="remarks">
        <el-input
          v-model="formData.remarks"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息 (可选)"
          :disabled="isViewMode"
        />
      </el-form-item>
    </el-form>

    <!-- === 文件管理区域 (编辑模式) === -->
    <div v-if="!isViewMode" class="file-management-area">
      <el-divider content-position="left">文件管理</el-divider>

      <!-- 文件列表 -->
      <el-table
        :data="associatedFiles"
        style="width: 100%"
        border
        size="small"
        v-loading="loading"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="fileName" label="文件名" show-overflow-tooltip />
        <el-table-column prop="fileType" label="类型" width="120">
          <template #default="{ row }">
            <span>{{ getFriendlyFileType(row.fileType) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fileSize" label="大小" width="100">
          <template #default="{ row }">
            {{ (row.fileSize / 1024).toFixed(2) }} KB
          </template>
        </el-table-column>
        <el-table-column prop="processingStatus" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.processingStatus)" size="small">
              {{ getFriendlyStatus(row.processingStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              @click="handleDownloadFile(row)"
              :loading="downloadingFiles[row.id]"
            >
              下载
            </el-button>
            <!-- 可以在这里添加查看按钮等 -->
          </template>
        </el-table-column>
      </el-table>

      <!-- 如果当前是新增模式，显示"请先保存基本信息"的提示 -->
      <div
        v-if="mode === 'add' && !isMetadataSaved"
        class="metadata-not-saved-tip"
      >
        <el-alert
          title="请先保存基本信息才能上传文件"
          type="info"
          :closable="false"
          show-icon
        />
      </div>

      <!-- 文件上传 -->
      <div style="margin-top: 20px">
        <el-upload
          ref="uploadRef"
          v-model:file-list="filesToUpload"
          action=""
          :auto-upload="false"
          multiple
          :limit="10"
          :on-exceed="handleUploadExceed"
          :disabled="isViewMode || (mode === 'add' && !isMetadataSaved)"
          :headers="uploadHeaders"
        >
          <template #trigger>
            <el-button
              type="primary"
              :disabled="isViewMode || (mode === 'add' && !isMetadataSaved)"
              >选择文件</el-button
            >
          </template>
          <template #tip>
            <div class="el-upload__tip">
              支持 PDF, Word, JPG, PNG 等格式，最多上传 10 个文件。
              <span style="color: red; margin-left: 10px"
                >注意：上传新文件将替换所有现有文件！</span
              >
            </div>
          </template>
        </el-upload>
      </div>

      <!-- 操作按钮 -->
      <div style="margin-top: 15px; text-align: right">
        <el-button
          type="danger"
          @click="handleClearAllFiles"
          :disabled="
            isViewMode ||
            associatedFiles.length === 0 ||
            (mode === 'add' && !isMetadataSaved)
          "
          :loading="loading"
          v-if="!isViewMode"
        >
          清空文件
        </el-button>
        <el-button
          type="success"
          @click="handleUploadFiles"
          :disabled="
            isViewMode ||
            filesToUpload.length === 0 ||
            (mode === 'add' && !isMetadataSaved)
          "
          :loading="loading"
          v-if="!isViewMode"
        >
          上传选中文件
        </el-button>
      </div>
    </div>
    <!-- === 文件管理区域结束 === -->

    <!-- === 文件查看区域 (查看模式) === -->
    <div v-if="isViewMode && associatedFiles.length > 0" class="file-view-area">
      <el-divider content-position="left">关联文件</el-divider>

      <!-- 文件列表 (水平滚动) -->
      <div class="file-list-container">
        <div
          v-for="(file, index) in associatedFiles"
          :key="file.id"
          class="file-item"
          :class="{ selected: selectedFile?.id === file.id }"
          @click="selectFileForView(file)"
        >
          <el-icon :size="32"><Document /></el-icon>
          <!-- 通用文档图标 -->
          <span class="file-item-label">文件 {{ index + 1 }}</span>
        </div>
      </div>

      <!-- 分隔线 -->
      <el-divider></el-divider>

      <!-- 选中文件详情与预览 -->
      <div v-if="selectedFile" class="selected-file-details">
        <h4>{{ selectedFile.fileName }}</h4>
        <!-- 显示完整文件名 -->
        <el-descriptions
          :column="2"
          border
          size="small"
          style="margin-top: 10px"
        >
          <el-descriptions-item label="类型">
            {{ getFriendlyFileType(selectedFile.fileType) }}
          </el-descriptions-item>
          <el-descriptions-item label="大小">
            {{ (selectedFile.fileSize / 1024).toFixed(2) }} KB
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag
              :type="getStatusTagType(selectedFile.processingStatus)"
              size="small"
            >
              {{ getFriendlyStatus(selectedFile.processingStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作">
            <el-button
              type="primary"
              link
              size="small"
              @click="handleDownloadFile(selectedFile)"
              :loading="downloadingFiles[selectedFile.id]"
            >
              下载文件
            </el-button>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 预览区域 -->
        <div class="preview-area" style="margin-top: 15px; text-align: center">
          <div
            v-if="imageLoading"
            class="preview-placeholder"
            style="padding: 20px; color: #909399"
          >
            加载预览中...
          </div>

          <!-- 图片缩略图卡片 -->
          <div
            v-else-if="hasImageFiles && associatedFiles.length > 0"
            class="image-gallery-wrapper"
          >
            <!-- 左箭头 -->
            <div
              class="gallery-arrow gallery-arrow-left"
              v-if="hasScrollableGallery"
              @click="scrollGallery('left')"
              :class="{ disabled: isAtLeftEdge }"
            >
              <el-icon :size="24"><ArrowLeft /></el-icon>
            </div>

            <!-- 图片画廊 -->
            <div ref="galleryRef" class="images-gallery">
              <div
                v-for="(file, index) in imageFiles"
                :key="file.id"
                class="image-thumbnail-card"
                :class="{ selected: selectedFile?.id === file.id }"
                @click="selectFileForView(file)"
              >
                <div class="thumbnail-container">
                  <img
                    v-if="fileImageUrls[file.id]"
                    :src="fileImageUrls[file.id]"
                    alt="图片预览"
                    class="thumbnail-image"
                  />
                  <div v-else class="thumbnail-placeholder">加载中...</div>
                  <div
                    class="thumbnail-overlay"
                    @click.stop="openImageViewer(file.id)"
                  >
                    <span
                      ><el-icon><ZoomIn /></el-icon> 点击查看大图</span
                    >
                  </div>
                </div>
                <div class="thumbnail-footer">
                  <span class="file-type">{{
                    getFriendlyFileType(file.fileType)
                  }}</span>
                  <span class="file-size"
                    >{{ (file.fileSize / 1024).toFixed(0) }} KB</span
                  >
                </div>
              </div>
            </div>

            <!-- 右箭头 -->
            <div
              class="gallery-arrow gallery-arrow-right"
              v-if="hasScrollableGallery"
              @click="scrollGallery('right')"
              :class="{ disabled: isAtRightEdge }"
            >
              <el-icon :size="24"><ArrowRight /></el-icon>
            </div>
          </div>

          <!-- PDF处理方式保持不变 -->
          <div
            v-else-if="isPdfType(selectedFile.fileType)"
            class="file-action-card"
          >
            <div class="icon-container">
              <el-icon :size="32"><Document /></el-icon>
            </div>
            <div class="action-info">
              <div class="file-type">
                {{ getFriendlyFileType(selectedFile.fileType) }}
              </div>
              <el-link
                :href="`/api/v1/documents/files/${selectedFile.id}/download`"
                type="primary"
                target="_blank"
                :underline="false"
                class="action-link"
              >
                在新标签页中打开
                <el-icon class="el-icon--right"><View /></el-icon>
              </el-link>
            </div>
          </div>

          <!-- 不支持预览的文件 -->
          <div v-else-if="selectedFile" class="file-action-card">
            <div class="icon-container">
              <el-icon :size="32"><Document /></el-icon>
            </div>
            <div class="action-info">
              <div class="file-type">
                {{ getFriendlyFileType(selectedFile.fileType) }}
              </div>
              <el-link
                type="primary"
                @click="handleDownloadFile(selectedFile)"
                :underline="false"
                class="action-link"
              >
                下载后查看
                <el-icon class="el-icon--right"><Download /></el-icon>
              </el-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- === 文件查看区域结束 === -->

    <!-- 图片查看器组件 -->
    <el-image-viewer
      v-if="imageViewerVisible"
      :url-list="currentViewingUrls"
      :initial-index="imageViewerIndex"
      :hide-on-click-modal="true"
      @close="imageViewerVisible = false"
    />

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">{{
          isViewMode ? "关闭" : "取消"
        }}</el-button>
        <el-button
          v-if="!isViewMode"
          type="primary"
          @click="handleSubmit"
          :loading="loading"
          >确定</el-button
        >
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  computed,
  nextTick,
  defineExpose,
  onBeforeUnmount,
  watch,
  onMounted,
} from "vue";
import {
  ElDialog,
  ElForm,
  ElMessage,
  FormInstance,
  FormRules,
  ElInput,
  ElRow,
  ElCol,
  ElButton,
  ElDatePicker,
  ElTreeSelect,
  ElTable,
  ElTableColumn,
  ElUpload,
  ElDivider,
  ElMessageBox,
  ElSelect,
  ElOption,
  type UploadProps,
  type UploadUserFile,
  type UploadRawFile,
  type UploadInstance,
  ElTag,
  ElIcon,
  ElDescriptions,
  ElDescriptionsItem,
  ElEmpty,
  ElImage,
  ElLink,
  ElImageViewer,
} from "element-plus";
import type {
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DocumentInfo,
  SimplifiedDocumentFile as DocumentFile,
} from "@/types/document";
import type { TreeNode } from "@/types/common";
import type { DocTypeInfo } from "@backend-types/doctype";
import type { DepartmentInfo } from "@backend-types/department";
import {
  createDocument,
  updateDocument,
  uploadFiles as apiUploadFiles,
  deleteAllFiles as apiDeleteAllFiles,
  startProcessing as apiStartProcessing,
  downloadFile as apiDownloadFile,
  getDocumentInfo,
  getFilePreviewBlob,
} from "@/services/api/document";
import { getDocTypeList } from "@/services/api/doctype";
import { getDepartmentList } from "@/services/api/department";
import { downloadBlob } from "@/utils/download";
import {
  Document,
  View,
  Download,
  ZoomIn,
  ArrowLeft,
  ArrowRight,
} from "@element-plus/icons-vue";

interface Props {
  docTypeTreeData: TreeNode[];
  departmentTreeData: TreeNode[];
}
const props = defineProps<Props>();

const emit = defineEmits(["success"]);

const dialogVisible = ref(false);
const loading = ref(false);
const formRef = ref<FormInstance>();
const mode = ref<"add" | "edit" | "view">("add");
const currentId = ref<number | null>(null);

const isEditingDocType = ref(false);
const isEditingDepartment = ref(false);

const getInitialFormData = () => ({
  doc_name: "",
  docTypeId: null as number | null,
  docTypeName: "" as string | null,
  sourceDepartmentId: null as number | null,
  sourceDepartmentName: "" as string | null,
  submitter: "",
  receiver: "",
  signer: null as string | null,
  storageLocation: null as string | null,
  handoverDate: undefined as string | undefined,
  remarks: "",
});
let formData = reactive(getInitialFormData());

const associatedFiles = ref<DocumentFile[]>([]);
const isMetadataSaved = ref(false);
const filesToUpload = ref<UploadUserFile[]>([]);
const uploadRef = ref<UploadInstance>();

const documentTypes = ref<DocTypeInfo[]>([]);
const departments = ref<DepartmentInfo[]>([]);

const isViewMode = computed(() => mode.value === "view");
const dialogTitle = computed(() => {
  if (mode.value === "add") return "新增文档";
  if (mode.value === "edit") return "编辑文档";
  return "查看文档详情";
});
const treeProps = { value: "id", label: "name", children: "children" };

const canStartProcessing = computed(() => {
  return associatedFiles.value.some(
    (file) => file.processingStatus === "pending"
  );
});

const uploadHeaders = computed(() => {
  const token = localStorage.getItem("authToken");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
});

const rules = reactive<FormRules>({
  doc_name: [{ required: true, message: "请输入文档名称", trigger: "blur" }],
  submitter: [{ required: true, message: "请输入提交人", trigger: "blur" }],
  receiver: [{ required: true, message: "请输入接收人", trigger: "blur" }],
  signer: [{ max: 50, message: "签章人名称过长", trigger: "blur" }],
  storageLocation: [{ max: 100, message: "存放位置过长", trigger: "blur" }],
  remarks: [{ max: 1000, message: "备注过长", trigger: "blur" }],
});

const selectedFile = ref<DocumentFile | null>(null);

const downloadingFiles = ref<Record<number, boolean>>({});

const imageLoading = ref(false);
const fileImageUrls = ref<Record<number, string>>({});
const imageViewerVisible = ref(false);
const imageViewerIndex = ref(0);
const currentViewingUrls = ref<string[]>([]);

const imageFiles = computed(() => {
  return associatedFiles.value.filter((file) => isImageType(file.fileType));
});

const hasImageFiles = computed(() => {
  return imageFiles.value.length > 0;
});

watch(
  associatedFiles,
  (newFiles) => {
    if (newFiles.length > 0) {
      const imagesToLoad = newFiles.filter((file) =>
        isImageType(file.fileType)
      );
      imagesToLoad.forEach((file) => {
        if (!fileImageUrls.value[file.id]) {
          loadImagePreview(file.id);
        }
      });
    }
  },
  { immediate: true }
);

const fetchOptions = async () => {
  loading.value = true;
  try {
    const [docTypeRes, deptRes] = await Promise.all([
      getDocTypeList(),
      getDepartmentList(),
    ]);

    documentTypes.value = docTypeRes?.list || docTypeRes || [];
    departments.value = deptRes || [];
    console.log("Fetched document types:", documentTypes.value);
    console.log("Fetched departments:", departments.value);
  } catch (error) {
    ElMessage.error("获取文档类型或部门列表失败");
    console.error("Failed to fetch options:", error);
    documentTypes.value = [];
    departments.value = [];
  } finally {
    loading.value = false;
  }
};

const open = (type: "add" | "edit" | "view", data?: DocumentInfo) => {
  console.log("[Dialog] Open called with type:", type, "and data:", data);
  mode.value = type;
  dialogVisible.value = true;
  loading.value = false;
  currentId.value = null;
  associatedFiles.value = []; // Reset associated files initially
  selectedFile.value = null;

  isEditingDocType.value = type === "add";
  isEditingDepartment.value = type === "add";

  const parseId = (id: number | string | undefined | null): number | null => {
    if (id === undefined || id === null || id === "") {
      return null;
    }
    if (typeof id === "number") {
      return id;
    }
    const parsed = parseInt(id, 10);
    return isNaN(parsed) ? null : parsed;
  };

  nextTick(async () => {
    // Make nextTick callback async
    formRef.value?.resetFields();
    Object.assign(formData, getInitialFormData());
    console.log(
      "[Dialog] FormData after reset:",
      JSON.parse(JSON.stringify(formData))
    );

    if ((type === "edit" || type === "view") && data && data.id) {
      const docId = data.id;
      currentId.value = docId;
      isMetadataSaved.value = true; // Metadata exists

      // Populate basic form data immediately from list data (for responsiveness)
      formData.doc_name = data.docName ?? "";
      formData.submitter = data.submitter ?? "";
      formData.receiver = data.receiver ?? "";
      formData.signer = data.signer ?? null;
      formData.storageLocation = data.storageLocation ?? null;
      formData.handoverDate = data.handoverDate ?? undefined;
      formData.remarks = data.remarks ?? "";
      formData.sourceDepartmentId = parseId(data.sourceDepartmentId) as
        | number
        | null;
      formData.sourceDepartmentName = data.departmentName ?? null;
      // Keep docTypeId and docTypeName handling as is for now
      const docTypeIdFromData = parseId(data.docTypeId);
      const typeNodeExists = props.docTypeTreeData?.some((node) =>
        checkNodeExists(node, docTypeIdFromData)
      );
      formData.docTypeId = typeNodeExists ? docTypeIdFromData : null;
      formData.docTypeName = typeNodeExists ? data.docTypeName ?? null : null; // Use ?? to handle undefined

      console.log(
        "[Dialog] FormData populated (initial from list data):",
        JSON.parse(JSON.stringify(formData))
      );

      // --- Fetch full document details including files ---
      loading.value = true; // Show loading while fetching details
      try {
        console.log(`[Dialog] Fetching full details for document ID: ${docId}`);
        const fullData = await getDocumentInfo(docId);
        if (fullData) {
          console.log("[Dialog] Full details fetched:", fullData);
          // Optionally re-populate form data from fullData for consistency,
          // but primarily update associatedFiles
          associatedFiles.value = fullData.files || [];
          console.log(
            "[Dialog] Associated files updated from full details:",
            associatedFiles.value
          );

          // Set default active tab if files exist
          if (associatedFiles.value.length > 0) {
            selectFileForView(associatedFiles.value[0]);
          }
          // Re-populate form data from fullData *if necessary*
          // Example: If list data might be stale
          formData.doc_name = fullData.docName ?? formData.doc_name; // Keep existing if null
          // ... update other fields similarly if needed ...
        } else {
          console.error(`[Dialog] Document details not found for ID: ${docId}`);
          ElMessage.error("无法加载文档详情和文件列表");
        }
      } catch (error) {
        console.error(
          `[Dialog] Error fetching document details for ID ${docId}:`,
          error
        );
        ElMessage.error("加载文档详情失败");
        associatedFiles.value = []; // Ensure files are empty on error
      } finally {
        loading.value = false;
      }
      // --- End fetch full details ---
    } else if (type === "add") {
      associatedFiles.value = [];
      isMetadataSaved.value = false;
    }
  });
};

const checkNodeExists = (
  node: any,
  targetId: number | null | undefined
): boolean => {
  if (!node || targetId === null || targetId === undefined) return false;
  if (node.id === targetId) return true;
  if (node.children && node.children.length > 0) {
    return node.children.some((child: any) => checkNodeExists(child, targetId));
  }
  return false;
};

const handleDocTypeChange = (selectedId: number | null) => {
  formData.docTypeId = selectedId;
  const findNodeById = (
    nodes: TreeNode[] | undefined,
    targetId: number | null
  ): TreeNode | null => {
    if (!nodes || targetId === null) return null;
    for (const node of nodes) {
      if (node.id === targetId) return node;
      if (node.children && node.children.length > 0) {
        const found = findNodeById(node.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };
  const selectedNode = findNodeById(props.docTypeTreeData, selectedId);
  formData.docTypeName = selectedNode ? selectedNode.name : null;
  console.log(
    `[Dialog] DocType changed. Selected ID: ${selectedId}, Updated Name: ${formData.docTypeName}`
  );
};

const handleDepartmentChange = (selectedId: number | null) => {
  formData.sourceDepartmentId = selectedId;
  const findNodeById = (
    nodes: TreeNode[] | undefined,
    targetId: number | null
  ): TreeNode | null => {
    if (!nodes || targetId === null) return null;
    for (const node of nodes) {
      if (node.id === targetId) return node;
      if (node.children && node.children.length > 0) {
        const found = findNodeById(node.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };
  const selectedNode = findNodeById(props.departmentTreeData, selectedId);
  formData.sourceDepartmentName = selectedNode ? selectedNode.name : null;
  console.log(
    `[Dialog] Department changed. Selected ID: ${selectedId}, Updated Name: ${formData.sourceDepartmentName}`
  );
};

const handleSubmit = async () => {
  if (isViewMode.value || !formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    let payload: Partial<CreateDocumentRequest | UpdateDocumentRequest> = {
      docName: formData.doc_name,
      submitter: formData.submitter,
      receiver: formData.receiver,
      signer: formData.signer ?? undefined,
      storageLocation: formData.storageLocation ?? undefined,
      handoverDate: formData.handoverDate,
      remarks: formData.remarks,
      docTypeId: formData.docTypeId,
      sourceDepartmentId: formData.sourceDepartmentId,
    };
    let savedDocumentId: number | null = null;

    console.log("[Dialog] Submitting data:", payload);

    if (mode.value === "add") {
      const newDocument = await createDocument(
        payload as CreateDocumentRequest
      );
      if (newDocument && newDocument.id) {
        savedDocumentId = newDocument.id;
        currentId.value = savedDocumentId;
        ElMessage.success("文档新增成功");
      } else {
        throw new Error("创建文档后未能获取到有效的文档 ID");
      }
    } else if (mode.value === "edit" && currentId.value) {
      await updateDocument(currentId.value, payload as UpdateDocumentRequest);
      savedDocumentId = currentId.value;
      ElMessage.success("文档更新成功");
    }

    if (savedDocumentId && canStartProcessing.value) {
      console.log(
        `[handleSubmit] Document ${savedDocumentId} saved/updated. Checking for pending files...`
      );
      console.log(
        `[handleSubmit] Pending files detected (canStartProcessing=${canStartProcessing.value}). Attempting to automatically start processing.`
      );
      try {
        await handleStartProcessing();
      } catch (processingError) {
        console.error(
          "[handleSubmit] Auto-triggering processing failed:",
          processingError
        );
        ElMessage.error("文档已保存，但自动触发文件处理失败。");
      }
    } else {
      console.log(
        `[handleSubmit] Document ${savedDocumentId} saved/updated. No pending files found (canStartProcessing=${canStartProcessing.value}).`
      );
    }

    dialogVisible.value = false;
    emit("success");
  } catch (error) {
    console.error("提交文档失败:", error);
    ElMessage.error(
      `操作失败: ${(error as Error)?.message || "请检查表单或联系管理员"}`
    );
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  if (loading.value) return;

  // 清理所有创建的Object URL
  Object.values(fileImageUrls.value).forEach((url) => {
    if (url) URL.revokeObjectURL(url);
  });
  fileImageUrls.value = {};

  dialogVisible.value = false;
};

const handleDownloadFile = async (file: DocumentFile) => {
  if (!file || !file.id || !file.fileName) return;
  downloadingFiles.value[file.id] = true;
  try {
    await apiDownloadFile(file.id, file.fileName);
  } catch (error) {
    console.error("Download file error:", error);
    ElMessage.error("下载文件失败");
  } finally {
    downloadingFiles.value[file.id] = false;
  }
};

const handleUploadExceed: UploadProps["onExceed"] = (files, uploadFiles) => {
  ElMessage.warning(
    `当前限制选择 10 个文件，本次选择了 ${files.length} 个文件，共选择了 ${
      files.length + uploadFiles.length
    } 个文件`
  );
};

const handleClearAllFiles = async () => {
  if (!currentId.value || associatedFiles.value.length === 0) return;

  try {
    await ElMessageBox.confirm(
      "确定要清空该文档下的所有关联文件吗？此操作不可恢复。",
      "警告",
      {
        confirmButtonText: "确定清空",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    loading.value = true;
    await apiDeleteAllFiles(currentId.value);
    ElMessage.success("所有文件已清空");
    associatedFiles.value = [];
    filesToUpload.value = [];
    uploadRef.value?.clearFiles();
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("Clear all files error:", error);
      ElMessage.error(error.message || "清空文件失败");
    }
  } finally {
    loading.value = false;
  }
};

const handleUploadFiles = async () => {
  if (!currentId.value || filesToUpload.value.length === 0) return;

  const formDataInstance = new FormData();
  filesToUpload.value.forEach((file) => {
    if (file.raw) {
      formDataInstance.append("files", file.raw);
    }
  });

  loading.value = true;
  try {
    const res = await apiUploadFiles(currentId.value!, formDataInstance);
    ElMessage.success("文件上传成功");
    associatedFiles.value = res.files || [];
    console.log(
      "[Upload Success] Associated files updated (check fileName):",
      JSON.parse(JSON.stringify(associatedFiles.value))
    );
    filesToUpload.value = [];
    uploadRef.value?.clearFiles();
  } catch (error: any) {
    console.error("Upload files error:", error);
    ElMessage.error(error.message || "文件上传失败");
  } finally {
    loading.value = false;
  }
};

const handleStartProcessing = async () => {
  if (!currentId.value || !canStartProcessing.value) {
    console.warn(
      "[handleStartProcessing] No current ID or no processable files."
    );
    return;
  }

  try {
    const res = await apiStartProcessing(currentId.value);
    ElMessage.success(`已成功触发 ${res.triggeredCount} 个文件的处理任务`);
  } catch (error: any) {
    console.error("Start processing error:", error);
    throw error;
  }
};

const getFriendlyFileType = (mimeType: string): string => {
  if (!mimeType) return "未知";
  const lowerMime = mimeType.toLowerCase();

  if (lowerMime.includes("pdf")) return "PDF 文件";
  if (lowerMime.includes("wordprocessingml")) return "Word 文档"; // .docx
  if (lowerMime.includes("msword")) return "Word 文档"; // .doc
  if (lowerMime.includes("spreadsheetml")) return "Excel 表格"; // .xlsx
  if (lowerMime.includes("excel") || lowerMime.includes("ms-excel"))
    return "Excel 表格"; // .xls
  if (lowerMime.includes("presentationml")) return "PPT 演示文稿"; // .pptx
  if (lowerMime.includes("powerpoint") || lowerMime.includes("ms-powerpoint"))
    return "PPT 演示文稿"; // .ppt
  if (lowerMime.startsWith("image/jpeg")) return "JPEG 图像";
  if (lowerMime.startsWith("image/png")) return "PNG 图像";
  if (lowerMime.startsWith("image/gif")) return "GIF 图像";
  if (lowerMime.startsWith("image/bmp")) return "BMP 图像";
  if (lowerMime.startsWith("text/plain")) return "纯文本";
  if (lowerMime.startsWith("application/zip")) return "ZIP 压缩包";
  if (lowerMime.startsWith("application/x-rar-compressed")) return "RAR 压缩包";

  // 返回原始类型的前一部分作为备用
  return lowerMime.split("/")[0] || "未知文件";
};

const getFriendlyStatus = (status: string): string => {
  switch (status) {
    case "pending":
      return "待处理";
    case "processing":
      return "处理中";
    case "completed":
      return "已完成";
    case "failed":
      return "处理失败";
    default:
      return "未知状态";
  }
};

const getStatusTagType = (
  status: string
): "success" | "warning" | "info" | "danger" => {
  switch (status) {
    case "pending":
      return "warning";
    case "processing":
      return "info";
    case "completed":
      return "success";
    case "failed":
      return "danger";
    default:
      return "info";
  }
};

const isImageType = (mimeType: string): boolean => {
  // Exclude BMP from direct image preview due to browser compatibility issues
  const lowerMime = mimeType.toLowerCase();
  return lowerMime.startsWith("image/") && lowerMime !== "image/bmp";
};

const isPdfType = (mimeType: string): boolean => {
  return mimeType === "application/pdf";
};

const selectFileForView = (file: DocumentFile) => {
  selectedFile.value = file;
  console.log("[Dialog] File selected for view:", file);
};

const loadImagePreview = async (fileId: number) => {
  // 如果已经有URL了，直接返回
  if (fileImageUrls.value[fileId]) {
    return;
  }

  try {
    console.log(`[Dialog] Loading image preview for file ID: ${fileId}`);
    const blob = await getFilePreviewBlob(fileId);
    const objectUrl = URL.createObjectURL(blob);
    fileImageUrls.value[fileId] = objectUrl;
    console.log(`[Dialog] Created Object URL for file ${fileId}: ${objectUrl}`);
  } catch (error) {
    console.error(`Failed to load image preview for file ${fileId}:`, error);
    ElMessage.error("加载图片预览失败");
  }
};

// 打开图片查看器
const openImageViewer = (fileId: number) => {
  // 获取当前文件在图片文件数组中的索引
  const fileIndex = imageFiles.value.findIndex((file) => file.id === fileId);
  if (fileIndex === -1) return;

  // 准备所有图片URL的数组
  currentViewingUrls.value = imageFiles.value
    .map((file) => fileImageUrls.value[file.id])
    .filter((url) => url); // 过滤掉未加载完成的URL

  // 设置初始索引并打开查看器
  imageViewerIndex.value = fileIndex;
  imageViewerVisible.value = true;
};

// 滚动画廊相关
const galleryRef = ref<HTMLElement | null>(null);
const hasScrollableGallery = ref(false);
const isAtLeftEdge = ref(true);
const isAtRightEdge = ref(false);

// 检查画廊是否可滚动
const checkGalleryScrollable = () => {
  if (!galleryRef.value) return;

  const gallery = galleryRef.value;
  // 如果内容宽度大于容器宽度，则可滚动
  hasScrollableGallery.value = gallery.scrollWidth > gallery.clientWidth;

  // 检查是否在边缘
  isAtLeftEdge.value = gallery.scrollLeft <= 5; // 5px的容差值
  isAtRightEdge.value =
    gallery.scrollWidth - gallery.scrollLeft - gallery.clientWidth <= 5;

  console.log(
    "[Gallery] Scrollable:",
    hasScrollableGallery.value,
    "Width:",
    gallery.scrollWidth,
    "Client:",
    gallery.clientWidth,
    "ScrollLeft:",
    gallery.scrollLeft,
    "Left edge:",
    isAtLeftEdge.value,
    "Right edge:",
    isAtRightEdge.value
  );
};

// 画廊滚动
const scrollGallery = (direction: "left" | "right") => {
  if (!galleryRef.value) return;

  const gallery = galleryRef.value;
  const scrollAmount = 200; // 每次滚动的像素

  if (direction === "left" && !isAtLeftEdge.value) {
    gallery.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  } else if (direction === "right" && !isAtRightEdge.value) {
    gallery.scrollBy({ left: scrollAmount, behavior: "smooth" });
  }

  // 滚动后更新状态 (使用setTimeout以确保动画完成后检查)
  setTimeout(() => {
    checkGalleryScrollable();
  }, 300);
};

// 监听窗口大小变化和画廊内容变化
onMounted(() => {
  if (galleryRef.value) {
    // 检查初始状态
    nextTick(() => {
      checkGalleryScrollable();
    });

    // 监听滚动事件
    galleryRef.value.addEventListener("scroll", checkGalleryScrollable);

    // 监听窗口大小变化
    window.addEventListener("resize", checkGalleryScrollable);
  }
});

// 在画廊内容变化时检查滚动状态
watch(
  imageFiles,
  () => {
    nextTick(() => {
      checkGalleryScrollable();
    });
  },
  { deep: true }
);

// 组件卸载前移除监听器
onBeforeUnmount(() => {
  if (galleryRef.value) {
    galleryRef.value.removeEventListener("scroll", checkGalleryScrollable);
  }
  window.removeEventListener("resize", checkGalleryScrollable);

  // 清理所有创建的Object URL
  Object.values(fileImageUrls.value).forEach((url) => {
    if (url) URL.revokeObjectURL(url);
  });
});

defineExpose({
  open,
});
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}

.file-management-area {
  margin-top: 20px;
}

.file-view-area {
  margin-top: 20px;
}

.file-list-container {
  display: flex;
  overflow-x: auto;
  padding-bottom: 10px; /* Add padding for scrollbar */
  white-space: nowrap;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 10px;
}

.file-item {
  display: inline-flex; /* Changed to inline-flex for alignment */
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px; /* Fixed width */
  height: 80px; /* Fixed height */
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin-right: 10px;
  cursor: pointer;
  transition: border-color 0.3s, background-color 0.3s;
  flex-shrink: 0; /* Prevent shrinking */
  text-align: center;
}

.file-item:hover {
  border-color: #c0c4cc;
}

.file-item.selected {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.file-item .el-icon {
  margin-bottom: 5px;
}

.file-item-label {
  font-size: 12px;
  color: #606266;
  overflow: hidden; /* Prevent long text overflow */
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%; /* Ensure label takes full width for ellipsis */
  padding: 0 5px; /* Add padding to label */
}

.selected-file-details {
  margin-top: 15px;
}

.selected-file-details h4 {
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
}

.preview-area {
  margin-top: 15px;
  text-align: center;
}

.preview-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 200px; /* Or match el-image height */
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

/* 图片缩略图卡片样式 */
.image-thumbnail-card {
  width: 180px; /* 稍微减小宽度 */
  flex-shrink: 0; /* 防止缩小 */
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  background-color: white;
}

.image-thumbnail-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

/* 选中状态样式 */
.image-thumbnail-card.selected {
  box-shadow: 0 0 0 4px #409eff, 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.thumbnail-container {
  position: relative;
  height: 150px;
  overflow: hidden;
  background-color: #f5f7fa;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.thumbnail-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #909399;
  font-size: 14px;
}

.thumbnail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-thumbnail-card:hover .thumbnail-overlay {
  opacity: 1;
}

.thumbnail-overlay span {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

.thumbnail-footer {
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #ebeef5;
  background-color: #f8f9fa;
}

.file-type {
  color: #606266;
  font-size: 13px;
}

.file-size {
  color: #909399;
  font-size: 12px;
}

/* 文件操作卡片样式 */
.file-action-card {
  display: inline-flex;
  align-items: center;
  padding: 20px;
  border-radius: 8px;
  background-color: #f8f9fa;
  border: 1px solid #ebeef5;
  width: 240px;
  margin: 0 auto;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background-color: #ecf5ff;
  border-radius: 8px;
  margin-right: 16px;
  color: #409eff;
}

.action-info {
  flex: 1;
  text-align: left;
}

.action-link {
  margin-top: 8px;
  display: flex;
  align-items: center;
  font-size: 14px;
}

/* 图片画廊包装容器 */
.image-gallery-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0;
  margin: 0 auto;
}

/* 图片画廊布局 */
.images-gallery {
  display: flex;
  flex-wrap: nowrap; /* 改为不换行 */
  overflow-x: auto; /* 允许水平滚动 */
  gap: 10px; /* 减小间距 */
  margin: 0 auto;
  padding: 15px; /* 增加内边距，确保边框完全可见 */
  scroll-behavior: smooth;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  max-width: 100%;
}

/* 隐藏滚动条 */
.images-gallery::-webkit-scrollbar {
  display: none;
}

/* 导航箭头 */
.gallery-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
  color: #409eff;
  flex-shrink: 0;
}

.gallery-arrow:hover {
  background-color: #ecf5ff;
}

.gallery-arrow.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: #909399;
}

.gallery-arrow-left {
  margin-right: 10px;
}

.gallery-arrow-right {
  margin-left: 10px;
}
</style>
