<template>
  <el-dialog
    v-model="dialogVisible"
    title="查看附件"
    width="55%"
    :before-close="handleClose"
    draggable
    destroy-on-close
    class="file-view-dialog"
  >
    <div v-loading="loading">
      <!-- File list (horizontal scroll) -->
      <div v-if="associatedFiles.length > 0" class="file-list-container">
        <div
          v-for="(file, index) in associatedFiles"
          :key="file.id"
          class="file-item"
          :class="{ selected: selectedFile?.id === file.id }"
          @click="selectFileForView(file)"
        >
          <el-icon :size="32"><Document /></el-icon>
          <span class="file-item-label">文件 {{ index + 1 }}</span>
        </div>
      </div>
      <el-empty v-else description="该文档没有关联附件" />

      <!-- Divider -->
      <el-divider v-if="associatedFiles.length > 0"></el-divider>

      <!-- Selected file details & preview -->
      <div v-if="selectedFile" class="selected-file-details">
        <h4>{{ selectedFile.fileName }}</h4>
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

        <!-- Preview Area -->
        <div class="preview-area" style="margin-top: 15px; text-align: center">
          <div v-if="imageLoading" class="preview-placeholder">
            加载预览中...
          </div>

          <!-- Image Gallery -->
          <div
            v-else-if="hasImageFiles && associatedFiles.length > 0"
            class="image-gallery-wrapper"
          >
            <div
              class="gallery-arrow gallery-arrow-left"
              v-if="hasScrollableGallery"
              @click="scrollGallery('left')"
              :class="{ disabled: isAtLeftEdge }"
            >
              <el-icon :size="24"><ArrowLeft /></el-icon>
            </div>
            <div ref="galleryRef" class="images-gallery">
              <div
                v-for="file in imageFiles"
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
            <div
              class="gallery-arrow gallery-arrow-right"
              v-if="hasScrollableGallery"
              @click="scrollGallery('right')"
              :class="{ disabled: isAtRightEdge }"
            >
              <el-icon :size="24"><ArrowRight /></el-icon>
            </div>
          </div>

          <!-- PDF -->
          <div
            v-else-if="selectedFile && isPdfType(selectedFile.fileType)"
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

          <!-- Other non-previewable files -->
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

    <!-- Image Viewer Component -->
    <el-image-viewer
      v-if="imageViewerVisible"
      :url-list="currentViewingUrls"
      :initial-index="imageViewerIndex"
      :hide-on-click-modal="true"
      @close="imageViewerVisible = false"
    />

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  nextTick,
  defineExpose,
  onBeforeUnmount,
  watch,
  onMounted,
} from "vue";
import {
  ElDialog,
  ElMessage,
  ElButton,
  ElTable,
  ElTableColumn,
  ElTag,
  ElIcon,
  ElDescriptions,
  ElDescriptionsItem,
  ElEmpty,
  ElLink,
  ElImageViewer,
  ElDivider,
} from "element-plus";
import type { SimplifiedDocumentFile as DocumentFile } from "@/types/document";
import {
  getDocumentInfo,
  downloadFile as apiDownloadFile,
  getFilePreviewBlob,
} from "@/services/api/document";
import { downloadBlob } from "@/utils/download";
import {
  Document,
  View,
  Download,
  ZoomIn,
  ArrowLeft,
  ArrowRight,
  Paperclip,
} from "@element-plus/icons-vue"; // Added Paperclip

const dialogVisible = ref(false);
const loading = ref(false);
const currentDocId = ref<number | null>(null);
const associatedFiles = ref<DocumentFile[]>([]);
const selectedFile = ref<DocumentFile | null>(null);
const downloadingFiles = ref<Record<number, boolean>>({});

// Image preview related state
const imageLoading = ref(false); // Might need refinement based on which image is loading
const fileImageUrls = ref<Record<number, string>>({});
const imageViewerVisible = ref(false);
const imageViewerIndex = ref(0);
const currentViewingUrls = ref<string[]>([]);

const imageFiles = computed(() =>
  associatedFiles.value.filter((file) => isImageType(file.fileType))
);
const hasImageFiles = computed(() => imageFiles.value.length > 0);

// Gallery scroll related state
const galleryRef = ref<HTMLElement | null>(null);
const hasScrollableGallery = ref(false);
const isAtLeftEdge = ref(true);
const isAtRightEdge = ref(false);

const open = async (documentId: number) => {
  currentDocId.value = documentId;
  dialogVisible.value = true;
  loading.value = true;
  associatedFiles.value = [];
  selectedFile.value = null;
  fileImageUrls.value = {}; // Reset image URLs

  try {
    const fullData = await getDocumentInfo(documentId);
    if (fullData && fullData.files) {
      associatedFiles.value = fullData.files;
      if (associatedFiles.value.length > 0) {
        // Select the first file by default
        selectFileForView(associatedFiles.value[0]);
        // Preload image previews
        preloadImagePreviews(associatedFiles.value);
      }
    } else {
      ElMessage.error("无法加载附件列表");
    }
  } catch (error) {
    console.error(`Error fetching files for document ID ${documentId}:`, error);
    ElMessage.error("加载附件列表失败");
  } finally {
    loading.value = false;
    // Check gallery scroll state after data loads
    nextTick(() => checkGalleryScrollable());
  }
};

const handleClose = () => {
  // Clean up object URLs
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

const getFriendlyFileType = (mimeType: string): string => {
  // (Keep the existing implementation from DocumentFormDialog)
  if (!mimeType) return "未知";
  const lowerMime = mimeType.toLowerCase();
  if (lowerMime.includes("pdf")) return "PDF 文件";
  if (lowerMime.includes("wordprocessingml")) return "Word 文档";
  if (lowerMime.includes("msword")) return "Word 文档";
  if (lowerMime.includes("spreadsheetml")) return "Excel 表格";
  if (lowerMime.includes("excel") || lowerMime.includes("ms-excel"))
    return "Excel 表格";
  if (lowerMime.includes("presentationml")) return "PPT 演示文稿";
  if (lowerMime.includes("powerpoint") || lowerMime.includes("ms-powerpoint"))
    return "PPT 演示文稿";
  if (lowerMime.startsWith("image/jpeg")) return "JPEG 图像";
  if (lowerMime.startsWith("image/png")) return "PNG 图像";
  if (lowerMime.startsWith("image/gif")) return "GIF 图像";
  if (lowerMime.startsWith("image/bmp")) return "BMP 图像";
  if (lowerMime.startsWith("text/plain")) return "纯文本";
  if (lowerMime.startsWith("application/zip")) return "ZIP 压缩包";
  if (lowerMime.startsWith("application/x-rar-compressed")) return "RAR 压缩包";
  return lowerMime.split("/")[0] || "未知文件";
};

const getFriendlyStatus = (status: string): string => {
  // (Keep the existing implementation from DocumentFormDialog)
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
  // (Keep the existing implementation from DocumentFormDialog)
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
  // (Keep the existing implementation from DocumentFormDialog)
  const lowerMime = mimeType.toLowerCase();
  return lowerMime.startsWith("image/") && lowerMime !== "image/bmp";
};

const isPdfType = (mimeType: string): boolean => {
  // (Keep the existing implementation from DocumentFormDialog)
  return mimeType === "application/pdf";
};

const selectFileForView = (file: DocumentFile) => {
  selectedFile.value = file;
};

const preloadImagePreviews = (files: DocumentFile[]) => {
  files.forEach((file) => {
    if (isImageType(file.fileType) && !fileImageUrls.value[file.id]) {
      loadImagePreview(file.id);
    }
  });
};

const loadImagePreview = async (fileId: number) => {
  if (fileImageUrls.value[fileId]) return; // Don't reload if exists
  imageLoading.value = true; // Show loading indicator
  try {
    const blob = await getFilePreviewBlob(fileId);
    const objectUrl = URL.createObjectURL(blob);
    fileImageUrls.value[fileId] = objectUrl;
  } catch (error) {
    console.error(`Failed to load image preview for file ${fileId}:`, error);
    // Optionally set a placeholder or error state for this specific image
  } finally {
    imageLoading.value = false; // Hide loading indicator
  }
};

const openImageViewer = (fileId: number) => {
  // (Keep the existing implementation from DocumentFormDialog)
  const fileIndex = imageFiles.value.findIndex((file) => file.id === fileId);
  if (fileIndex === -1) return;
  currentViewingUrls.value = imageFiles.value
    .map((file) => fileImageUrls.value[file.id])
    .filter((url): url is string => !!url);
  imageViewerIndex.value = fileIndex;
  imageViewerVisible.value = true;
};

// Gallery Scroll Logic (Keep the existing implementation)
const checkGalleryScrollable = () => {
  if (!galleryRef.value) return;
  const gallery = galleryRef.value;
  hasScrollableGallery.value = gallery.scrollWidth > gallery.clientWidth;
  isAtLeftEdge.value = gallery.scrollLeft <= 5;
  isAtRightEdge.value =
    gallery.scrollWidth - gallery.scrollLeft - gallery.clientWidth <= 5;
};

const scrollGallery = (direction: "left" | "right") => {
  if (!galleryRef.value) return;
  const gallery = galleryRef.value;
  const scrollAmount = 200;
  if (direction === "left" && !isAtLeftEdge.value) {
    gallery.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  } else if (direction === "right" && !isAtRightEdge.value) {
    gallery.scrollBy({ left: scrollAmount, behavior: "smooth" });
  }
  setTimeout(() => checkGalleryScrollable(), 300);
};

// Watchers and Lifecycle hooks for gallery
watch(
  imageFiles,
  () => {
    nextTick(() => checkGalleryScrollable());
  },
  { deep: true }
);

onMounted(() => {
  // Use nextTick to ensure the element exists before adding listeners
  nextTick(() => {
    if (galleryRef.value) {
      checkGalleryScrollable();
      galleryRef.value.addEventListener("scroll", checkGalleryScrollable);
      window.addEventListener("resize", checkGalleryScrollable);
    }
  });
});

onBeforeUnmount(() => {
  if (galleryRef.value) {
    galleryRef.value.removeEventListener("scroll", checkGalleryScrollable);
  }
  window.removeEventListener("resize", checkGalleryScrollable);
  // Clean up object URLs
  Object.values(fileImageUrls.value).forEach((url) => {
    if (url) URL.revokeObjectURL(url);
  });
});

// Expose the open method
defineExpose({ open });
</script>

<style scoped>
/* Copy relevant styles from DocumentFormDialog for file-view-area, file-list-container, file-item, etc. */
.file-view-dialog :deep(.el-dialog__body) {
  padding-top: 10px; /* Reduce top padding */
}

.file-list-container {
  display: flex;
  overflow-x: auto;
  padding-bottom: 10px; /* Add padding for scrollbar */
  white-space: nowrap;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 15px; /* Add margin below list */
}

.file-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin-right: 10px;
  cursor: pointer;
  transition: border-color 0.3s, background-color 0.3s;
  flex-shrink: 0;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  padding: 0 5px;
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
  min-height: 150px; /* Ensure placeholder has height */
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 14px;
  border-radius: 4px;
}

/* Image gallery styles */
.image-gallery-wrapper {
  position: relative;
  display: flex; /* Keep flex for arrow alignment */
  align-items: center;
  justify-content: center; /* Center the gallery container itself */
  width: 100%;
  padding: 0; /* Remove padding if arrows are inside */
  margin: 0 auto;
}
.images-gallery {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 10px;
  /* Removed margin: 0 auto; - centering handled by wrapper */
  padding: 15px; /* Keep padding for content spacing */
  scroll-behavior: smooth;
  -ms-overflow-style: none;
  scrollbar-width: none;
  /* Removed max-width: 100%; and flex-grow: 1; Let content define width */
}
.images-gallery::-webkit-scrollbar {
  display: none;
}
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
  flex-shrink: 0; /* Ensure arrows don't shrink */
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

/* Image thumbnail card styles (copy from DocumentFormDialog) */
.image-thumbnail-card {
  width: 180px;
  flex-shrink: 0;
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

/* File action card styles (copy from DocumentFormDialog) */
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
.dialog-footer {
  text-align: right;
}
</style>
