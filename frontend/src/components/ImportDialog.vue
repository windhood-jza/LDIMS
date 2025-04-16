<script setup lang="ts">
import { ref, computed, watch, defineExpose, nextTick } from 'vue';
import { ElDialog, ElUpload, ElButton, ElMessage, ElIcon } from 'element-plus';
import { Upload, FolderOpened, UploadFilled } from '@element-plus/icons-vue';
import type { UploadProps, UploadFile, UploadFiles, UploadRawFile } from 'element-plus';
import { requestImport } from '@/services/api/task'; // 导入请求导入 API
import type { ImportRequestParams } from '@/types/export'; // 导入相关类型

// --- Props and Emits ---
// 2. Remove props definition and related watch blocks
// interface Props {
//   visible: boolean;
// }
// const props = defineProps<Props>();
// const emit = defineEmits(['update:visible']);

// --- 内部状态 ---
const dialogVisible = ref(false); // Keep internal dialogVisible

// // 监听 props.visible 的变化，同步到内部状态
// watch(() => props.visible, (val) => {
//   dialogVisible.value = val;
// });
//
// // 监听内部状态的变化，通过 emit 同步到父组件
// watch(dialogVisible, (val) => {
//   if (!val) {
//     emit('update:visible', false);
//   }
// });

// --- Refs ---
const uploadRef = ref<InstanceType<typeof ElUpload> | null>(null);
const fileToUpload = ref<UploadFile | null>(null);
const isUploading = ref(false); // 防止重复点击

// --- Computed Properties ---
// 上传 URL (与之前 ListView 相同逻辑)
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const uploadUrl = `${VITE_API_BASE_URL}/upload/excel`;

// 上传 Headers (与之前 ListView 相同逻辑)
const uploadHeaders = computed(() => {
  const token = localStorage.getItem('authToken');
  console.log('[ImportDialog] Token from localStorage:', token ? 'found' : 'not found');
  return token ? { Authorization: `Bearer ${token}` } : {};
});

// --- Methods ---
/**
 * @description 打开对话框的方法，由父组件调用
 */
const open = async () => {
    console.log('[ImportDialog] open method called.');
    console.log('[ImportDialog] Current dialogVisible state before change:', dialogVisible.value);
    try {
        resetDialogState(); // 打开时先重置状态
        dialogVisible.value = true;
        console.log('[ImportDialog] dialogVisible set to true. Waiting for nextTick...');
        await nextTick(); // 等待 DOM 更新
        console.log('[ImportDialog] After nextTick. Dialog should now be visible in the DOM.');
        console.log('[ImportDialog] Final dialogVisible state:', dialogVisible.value);
    } catch (error) {
        console.error('[ImportDialog] Error occurred within the open method:', error);
    }
};

/**
 * @description 关闭对话框时触发
 */
const handleClose = () => {
  if (isUploading.value) {
    ElMessage.warning('文件正在上传中，请稍候...');
    return;
  }
  // 重置状态并关闭
  resetDialogState();
  // 6. 修改 handleClose 方法，直接设置 dialogVisible.value = false
  dialogVisible.value = false; // 使用内部变量而不是 emit
};

/**
 * @description 重置对话框状态（清空文件列表等）
 */
const resetDialogState = () => {
  fileToUpload.value = null;
  uploadRef.value?.clearFiles(); // 清空 el-upload 的文件列表
  isUploading.value = false;
};

/**
 * @description 文件状态改变时的钩子
 */
const handleFileChange: UploadProps['onChange'] = (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  console.log('[ImportDialog File Change] File status:', uploadFile.name, uploadFile.status);
  if (uploadFiles.length > 0) {
    fileToUpload.value = uploadFiles[uploadFiles.length - 1]; // 只保留最后一个选择的文件
    // 如果文件过大或类型不对，在 beforeUpload 验证失败时 status 会是 'fail'
    if (uploadFile.status === 'fail') {
        fileToUpload.value = null; // 验证失败则不保留
        uploadRef.value?.clearFiles(); // 清空列表
    }
  } else {
    fileToUpload.value = null;
  }
};

/**
 * @description 文件上传前的钩子 (验证)
 */
const beforeUpload: UploadProps['beforeUpload'] = (rawFile: UploadRawFile) => {
  console.log('[ImportDialog Before Upload] File:', rawFile.name);
  const allowedTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  const maxSizeMB = 50;
  const maxSize = maxSizeMB * 1024 * 1024;
  const isExcel = allowedTypes.includes(rawFile.type) || rawFile.name.endsWith('.xls') || rawFile.name.endsWith('.xlsx');
  const isLtMaxSize = rawFile.size <= maxSize;

  if (!isExcel) {
    ElMessage.error('文件类型错误，请上传 Excel 文件 (.xls, .xlsx)');
    return false;
  }
  if (!isLtMaxSize) {
    ElMessage.error(`文件大小不能超过 ${maxSizeMB}MB!`);
    return false;
  }
  return true;
};

/**
 * @description 手动触发上传按钮点击
 */
const handleManualUpload = () => {
  if (!fileToUpload.value) {
    ElMessage.warning('请先选择一个 Excel 文件');
    return;
  }
  if (isUploading.value) return; // 防止重复提交

  console.log('[ImportDialog Manual Upload] Triggering submit...');
  isUploading.value = true; // 标记为上传中
  uploadRef.value?.submit(); // 触发 el-upload 的上传流程
};

/**
 * @description 文件上传成功钩子
 */
const handleUploadSuccess: UploadProps['onSuccess'] = (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  console.log('[ImportDialog Upload Success] Response:', response);
  isUploading.value = false; // 上传结束

  // 处理后端返回code为201的情况（创建成功）
  if (response && response.code === 201 && response.data) {
    ElMessage.success(response.message || '文件上传成功，导入任务已创建');
    handleClose(); // 上传成功后关闭对话框
    return;
  }

  // 兼容旧版响应格式
  if (response && typeof response.fileName === 'string' && typeof response.originalName === 'string') {
    ElMessage.info('文件上传成功，正在请求后台处理导入任务...');
    const importParams: ImportRequestParams = {
      fileName: response.fileName,
      originalName: response.originalName
    };
    requestImport(importParams)
      .then((importRes: any) => {
        if (importRes?.code === 200) {
           ElMessage.success('后台导入任务已创建！');
           handleClose(); // 导入请求成功后关闭对话框
        } else {
           ElMessage.error(importRes?.message || '触发导入任务失败');
        }
      })
      .catch((err: any) => {
        console.error('[ImportDialog Request Import] API Call Failed:', err);
        const errMsg = err.response?.data?.message || err.message || '请求触发导入任务时出错';
        ElMessage.error(`触发导入任务失败: ${errMsg}`);
      });
  } else {
    console.error('[ImportDialog Upload Success] Invalid upload response:', response);
    ElMessage.error(response?.message || '文件上传接口响应异常');
  }
  // 成功后不清空文件，保留状态显示
};

/**
 * @description 文件上传失败钩子
 */
const handleUploadError: UploadProps['onError'] = (error: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  console.error('[ImportDialog Upload Error] Raw Error:', error);
  isUploading.value = false; // 上传结束
  let message = '文件上传失败';
  try {
      // ... (错误消息解析逻辑与之前 ListView 类似)
      if (error.response && error.response.data) {
          message = error.response.data.message || `上传失败，状态码：${error.response.status}`;
      } else if (error.message) {
          try {
              const errorData = JSON.parse(error.message);
              message = errorData.message ? `文件上传失败: ${errorData.message}` : `文件上传失败: ${error.message}`;
          } catch (e) {
               message = `文件上传失败: ${error.message}`;
          }
      }
  } catch (e) {
       console.error('[ImportDialog Upload Error] Parse error failed:', e);
  }
  ElMessage.error(message);
  // 失败后不清空文件，方便用户查看错误或重试
};

// 4. Expose the open method
defineExpose({
    open,
});

</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="批量导入文档"
    width="600px"
    :modal="true"
    :append-to-body="true"
    @close="handleClose"
    :close-on-click-modal="!isUploading"
    :close-on-press-escape="!isUploading"
    @closed="resetDialogState"
  >
    <div class="import-dialog-content">
      <el-upload
        ref="uploadRef"
        class="upload-importer"
        drag
        :action="uploadUrl"
        :headers="uploadHeaders"
        :limit="1"
        :auto-upload="false"
        :on-change="handleFileChange"
        :before-upload="beforeUpload"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            请上传 .xls 或 .xlsx 格式的 Excel 文件，大小不超过 50MB。
          </div>
        </template>
      </el-upload>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose" :disabled="isUploading">取消</el-button>
        <el-button type="primary" @click="handleManualUpload" :loading="isUploading" :disabled="!fileToUpload">
          确认导入
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.import-dialog-content {
  padding: 20px;
}
/* 可以根据需要添加 .upload-importer 的样式 */
.el-upload__tip {
  text-align: center;
  margin-top: 10px;
  color: #909399;
}
</style> 