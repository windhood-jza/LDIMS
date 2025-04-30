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

    <div v-if="!isViewMode" class="file-management-area">
      <el-divider content-position="left">文件管理</el-divider>

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
              @click="handleDownloadFileInEdit(row)"
              :loading="downloadingEditFiles[row.id]"
            >
              下载
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div style="margin-top: 20px">
        <el-upload
          ref="uploadRef"
          v-model:file-list="filesToUpload"
          action=""
          :auto-upload="false"
          multiple
          :limit="10"
          :on-exceed="handleUploadExceed"
          :headers="uploadHeaders"
          :http-request="() => undefined"
          :before-upload="() => !loading"
          :disabled="loading"
        >
          <template #trigger>
            <el-button type="primary" :disabled="loading">选择文件</el-button>
          </template>
          <template #tip>
            <div class="el-upload__tip">
              支持 PDF, Word, JPG, PNG 等格式，最多上传 10 个文件。
              <span style="color: #e6a23c; margin-left: 5px"
                >注意：PDF、JPG、PNG 可直接预览，其他格式需下载后查看。</span
              >
              <span v-if="mode === 'edit'" style="color: red; margin-left: 10px"
                >注意：上传新文件将替换所有现有文件！</span
              >
            </div>
          </template>
        </el-upload>
      </div>

      <div style="margin-top: 15px; text-align: right">
        <el-button
          type="danger"
          @click="handleClearAllFiles"
          :disabled="associatedFiles.length === 0 || loading"
          :loading="loading"
        >
          清空文件
        </el-button>
        <el-button
          type="success"
          @click="() => handleUploadFiles()"
          :disabled="filesToUpload.length === 0 || loading || mode === 'add'"
          :loading="loading"
        >
          上传选中文件
        </el-button>
      </div>
    </div>

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
  ElLink,
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
  downloadFile as apiDownloadFileInEdit,
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

const userModifiedDocType = ref(false);
const userModifiedDepartment = ref(false);

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
  return "查看文档信息";
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

const downloadingEditFiles = ref<Record<number, boolean>>({});

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
  associatedFiles.value = [];
  filesToUpload.value = [];
  uploadRef.value?.clearFiles();

  isEditingDocType.value = type === "add";
  isEditingDepartment.value = type === "add";

  userModifiedDocType.value = false;
  userModifiedDepartment.value = false;

  const parseId = (id: number | string | undefined | null): number | null => {
    if (id === undefined || id === null || id === "") return null;
    if (typeof id === "number") return id;
    const parsed = parseInt(id, 10);
    return isNaN(parsed) ? null : parsed;
  };

  nextTick(async () => {
    formRef.value?.resetFields();
    Object.assign(formData, getInitialFormData());

    if ((type === "edit" || type === "view") && data && data.id) {
      const docId = data.id;
      currentId.value = docId;
      isMetadataSaved.value = true;

      loading.value = true;
      try {
        console.log(
          `[Dialog] Fetching details for document ID: ${docId} (Mode: ${type})`
        );
        const fullData = await getDocumentInfo(docId);
        if (fullData) {
          formData.doc_name = fullData.docName ?? "";
          formData.submitter = fullData.submitter ?? "";
          formData.receiver = fullData.receiver ?? "";
          formData.signer = fullData.signer ?? null;
          formData.storageLocation = fullData.storageLocation ?? null;
          formData.handoverDate = fullData.handoverDate ?? undefined;
          formData.remarks = fullData.remarks ?? "";
          formData.sourceDepartmentId = parseId(fullData.sourceDepartmentId);
          formData.sourceDepartmentName = fullData.sourceDepartmentName ?? null;
          const docTypeIdFromData = parseId(fullData.docTypeId);
          const typeNodeExists = props.docTypeTreeData?.some((node) =>
            checkNodeExists(node, docTypeIdFromData)
          );
          formData.docTypeId = typeNodeExists ? docTypeIdFromData : null;
          formData.docTypeName = typeNodeExists
            ? fullData.docTypeName ?? null
            : null;

          if (type === "edit") {
            associatedFiles.value = fullData.files || [];
            console.log(
              "[Dialog] Associated files updated for edit list:",
              associatedFiles.value
            );
          } else {
            associatedFiles.value = [];
          }
        } else {
          console.error(`[Dialog] Document details not found for ID: ${docId}`);
          ElMessage.error("无法加载文档详情");
        }
      } catch (error) {
        console.error(
          `[Dialog] Error fetching details for ID ${docId}:`,
          error
        );
        ElMessage.error("加载文档详情失败");
      } finally {
        loading.value = false;
      }
    } else if (type === "add") {
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
  userModifiedDocType.value = true;
  console.log(
    `[Dialog] DocType changed. Selected ID: ${selectedId}, Updated Name: ${formData.docTypeName}, User Modified: ${userModifiedDocType.value}`
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
  userModifiedDepartment.value = true;
  console.log(
    `[Dialog] Department changed. Selected ID: ${selectedId}, Updated Name: ${formData.sourceDepartmentName}, User Modified: ${userModifiedDepartment.value}`
  );
};

const handleSubmit = async () => {
  if (mode.value === "view" || !formRef.value) return;

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
    };

    if (userModifiedDocType.value) {
      payload.docTypeId = formData.docTypeId;
    }

    if (userModifiedDepartment.value) {
      payload.sourceDepartmentId = formData.sourceDepartmentId;
    }

    let savedDocumentId: number | null = null;
    let isNewDocument = false;

    console.log("[Dialog] Submitting data:", payload);

    if (mode.value === "add") {
      const newDocument = await createDocument(
        payload as CreateDocumentRequest
      );
      if (newDocument && newDocument.id) {
        savedDocumentId = newDocument.id;
        currentId.value = savedDocumentId;
        isNewDocument = true;
        ElMessage.success("文档新增成功");
      } else {
        throw new Error("创建文档后未能获取到有效的文档 ID");
      }
    } else if (mode.value === "edit" && currentId.value) {
      await updateDocument(currentId.value, payload as UpdateDocumentRequest);
      savedDocumentId = currentId.value;
      ElMessage.success("文档更新成功");
    }

    if (savedDocumentId && filesToUpload.value.length > 0) {
      console.log(
        `[handleSubmit] Document ${mode.value} successful (ID: ${savedDocumentId}). Uploading ${filesToUpload.value.length} selected files.`
      );
      try {
        await handleUploadFiles(savedDocumentId);
      } catch (uploadError) {
        console.error(
          "[handleSubmit] Uploading files after save failed:",
          uploadError
        );
        ElMessage.error("文档信息已保存，但文件上传失败。");
      }
    } else if (savedDocumentId && isNewDocument && canStartProcessing.value) {
      console.log(
        `[handleSubmit] Document ${savedDocumentId} saved. Checking for pending files...`
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
    } else if (savedDocumentId) {
      console.log(
        `[handleSubmit] Document ${savedDocumentId} ${mode.value} successful. No files selected for upload or no pending processing needed.`
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
  dialogVisible.value = false;
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

const handleUploadFiles = async (docIdParam?: number) => {
  const targetDocId = docIdParam ?? currentId.value;
  if (!targetDocId || filesToUpload.value.length === 0) return;

  const formDataInstance = new FormData();
  filesToUpload.value.forEach((file) => {
    if (file.raw) {
      formDataInstance.append("files", file.raw);
    }
  });

  loading.value = true;
  try {
    const res = await apiUploadFiles(targetDocId, formDataInstance);
    ElMessage.success("文件上传成功");
    associatedFiles.value = res.files || [];
    console.log(
      "[Upload Success] Associated files updated:",
      JSON.parse(JSON.stringify(associatedFiles.value))
    );
    filesToUpload.value = [];
    uploadRef.value?.clearFiles();
    if (!docIdParam && canStartProcessing.value) {
      console.log(
        "[handleUploadFiles] Standalone upload successful. Triggering processing."
      );
      await handleStartProcessing();
    }
  } catch (error: any) {
    console.error("Upload files error:", error);
    ElMessage.error(error.message || "文件上传失败");
    throw error;
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

const handleDownloadFileInEdit = async (file: DocumentFile) => {
  if (!file || !file.id || !file.fileName) return;
  downloadingEditFiles.value[file.id] = true;
  try {
    await apiDownloadFileInEdit(file.id, file.fileName);
  } catch (error) {
    console.error("Download file error in edit:", error);
    ElMessage.error("下载文件失败");
  } finally {
    downloadingEditFiles.value[file.id] = false;
  }
};

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

.metadata-not-saved-tip {
  margin-top: 15px;
  margin-bottom: 10px;
}

.el-upload__tip {
  font-size: 12px;
  color: #606266;
  margin-top: 7px;
}
</style>
