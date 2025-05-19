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

          <!-- PDF Preview -->
          <div
            v-else-if="selectedFile && isPdfType(selectedFile.fileType)"
            class="pdf-preview-container"
          >
            <div class="pdf-toolbar">
              <el-button-group>
                <el-button
                  type="primary"
                  plain
                  size="small"
                  @click="prevPage"
                  :disabled="currentPage <= 1"
                >
                  <el-icon><ArrowLeft /></el-icon> 上一页
                </el-button>
                <el-button type="primary" plain size="small">
                  {{ currentPage }} / {{ totalPages }}
                </el-button>
                <el-button
                  type="primary"
                  plain
                  size="small"
                  @click="nextPage"
                  :disabled="currentPage >= totalPages"
                >
                  下一页 <el-icon><ArrowRight /></el-icon>
                </el-button>
              </el-button-group>
              <el-button-group>
                <el-button
                  type="primary"
                  plain
                  size="small"
                  @click="zoomOut"
                  :disabled="scale <= 0.5"
                >
                  <el-icon><ZoomOut /></el-icon>
                </el-button>
                <el-button
                  type="primary"
                  plain
                  size="small"
                  @click="zoomIn"
                  :disabled="scale >= 2.0"
                >
                  <el-icon><ZoomIn /></el-icon>
                </el-button>
              </el-button-group>
              <el-button
                type="primary"
                link
                size="small"
                @click="handleDownloadFile(selectedFile)"
              >
                <el-icon><Download /></el-icon> 下载PDF
              </el-button>
            </div>
            <div class="pdf-container">
              <canvas ref="pdfCanvas" class="pdf-canvas"></canvas>
            </div>
            <div v-if="pdfLoading" class="pdf-loading-overlay">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>加载PDF中...</span>
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
        <el-button @click="() => handleClose()">关闭</el-button>
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
  shallowRef,
  toRaw,
} from "vue";
import {
  ElDialog,
  ElMessage,
  ElButton,
  ElTag,
  ElIcon,
  ElDescriptions,
  ElDescriptionsItem,
  ElEmpty,
  ElLink,
  ElImageViewer,
  ElDivider,
  ElButtonGroup,
} from "element-plus";
import type { SimplifiedDocumentFile as DocumentFile } from "@/types/document";
import {
  getDocumentInfo,
  downloadFile as apiDownloadFile,
  getFilePreviewBlob,
} from "@/services/api/document";
import {
  Document,
  Download,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  ArrowRight,
  Loading,
} from "@element-plus/icons-vue";
// 移除全局PDF.js导入，改为在需要时动态加载
import type {
  PDFDocumentProxy,
  RenderTask,
} from "pdfjs-dist/types/src/display/api";

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

// PDF related state
const pdfCanvas = ref<HTMLCanvasElement | null>(null);
const pdfLoading = ref(false);
const pdfDocument = shallowRef<PDFDocumentProxy | null>(null);
const currentPage = ref(1);
const totalPages = ref(0);
const scale = ref(1.0);
const currentRenderTask = ref<RenderTask | null>(null);

// 添加变量标记PDF.js是否已加载
const pdfJsLoaded = ref(false);

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

  // Reset PDF state
  pdfDocument.value = null;
  currentPage.value = 1;
  totalPages.value = 0;
  scale.value = 1.0;

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

const handleClose = (done?: () => void) => {
  // Clean up object URLs
  Object.values(fileImageUrls.value).forEach((url) => {
    if (url) URL.revokeObjectURL(url);
  });
  fileImageUrls.value = {};

  // Clean up PDF document
  if (pdfDocument.value) {
    pdfDocument.value.destroy();
    pdfDocument.value = null;
  }

  // 取消可能正在进行的渲染任务
  if (currentRenderTask.value) {
    currentRenderTask.value.cancel();
    currentRenderTask.value = null;
  }

  dialogVisible.value = false;
  if (done) done();
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

  // 如果是PDF文件，加载PDF预览
  if (isPdfType(file.fileType)) {
    loadPdfPreview(file.id);
  } else {
    // 清理PDF资源
    if (pdfDocument.value) {
      pdfDocument.value.destroy();
      pdfDocument.value = null;
    }
  }
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

// 动态加载PDF.js库并初始化
const loadPdfJs = async () => {
  // 如果已经加载，直接返回之前加载的模块
  if (pdfJsLoaded.value) {
    // 确保返回的是Promise，以便调用者可以用await
    return Promise.resolve(await import("pdfjs-dist"));
  }

  try {
    pdfLoading.value = true;
    // 动态导入PDF.js
    const pdfjsModule = await import("pdfjs-dist");

    // --- 配置 workerSrc 指向 public 目录下的 .mjs 文件 ---
    pdfjsModule.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    // ------------------------------------------------------

    pdfJsLoaded.value = true;
    return pdfjsModule; // 返回加载的模块
  } catch (error) {
    console.error("Failed to load PDF.js:", error);
    ElMessage.error("PDF预览组件加载失败");
    throw error; // 重新抛出错误，让调用者知道失败了
  } finally {
    pdfLoading.value = false;
  }
};

// PDF预览相关函数
const loadPdfPreview = async (fileId: number) => {
  if (!fileId) return;

  // 重置PDF状态
  currentPage.value = 1;
  totalPages.value = 0;
  scale.value = 1.0;

  if (pdfDocument.value) {
    pdfDocument.value.destroy();
    pdfDocument.value = null;
  }

  pdfLoading.value = true;

  try {
    // 动态加载PDF.js
    const pdfjsModule = await loadPdfJs();
    if (!pdfjsModule) {
      throw new Error("PDF.js加载失败");
    }

    const blob = await getFilePreviewBlob(fileId);
    const arrayBuffer = await blob.arrayBuffer();

    // 使用动态导入的pdfjsLib
    const pdf = await pdfjsModule.getDocument({ data: arrayBuffer }).promise;

    pdfDocument.value = pdf;
    totalPages.value = pdf.numPages;

    // 渲染第一页
    renderPage();
  } catch (error) {
    console.error(`Failed to load PDF preview for file ${fileId}:`, error);
    ElMessage.error(
      "PDF预览加载失败: " +
        (error instanceof Error ? error.message : String(error))
    );
  } finally {
    pdfLoading.value = false;
  }
};

const renderPage = async () => {
  // --- 先取消任务 ---
  if (currentRenderTask.value) {
    currentRenderTask.value.cancel();
    currentRenderTask.value = null;
  }
  // ----------------

  // 确保 pdfDocument 和 canvas 都已准备好
  const doc = pdfDocument.value; // 使用局部变量简化访问
  const canvas = pdfCanvas.value;
  if (!doc || !canvas) return;

  try {
    pdfLoading.value = true;
    const pageProxy = await doc.getPage(currentPage.value);

    // --- 使用 toRaw 获取原始 page 对象 ---
    const page = toRaw(pageProxy);
    // ------------------------------------

    const viewport = page.getViewport({ scale: scale.value });
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("无法获取canvas上下文");
    }

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    const renderTask = page.render(renderContext);
    currentRenderTask.value = renderTask;

    await renderTask.promise;
    currentRenderTask.value = null;
  } catch (error: any) {
    if (error && error.name !== "RenderingCancelledException") {
      console.error("渲染PDF页面失败:", error);
      // 避免重复显示渲染错误，因为 cancel 也会触发 error
      // ElMessage.error('PDF页面渲染失败');
    }
    currentRenderTask.value = null;
  } finally {
    pdfLoading.value = false;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    // 注意：currentPage 的变化会触发 watch，watch 里会调用 renderPage
    // 所以这里不需要直接调用 renderPage()
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    // 注意：currentPage 的变化会触发 watch，watch 里会调用 renderPage
    // 所以这里不需要直接调用 renderPage()
  }
};

const zoomIn = () => {
  if (scale.value < 2.0) {
    scale.value += 0.25;
    // 注意：scale 的变化会触发 watch，watch 里会调用 renderPage
    // 所以这里不需要直接调用 renderPage()
  }
};

const zoomOut = () => {
  if (scale.value > 0.5) {
    scale.value -= 0.25;
    // 注意：scale 的变化会触发 watch，watch 里会调用 renderPage
    // 所以这里不需要直接调用 renderPage()
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

// 监听PDF相关状态变化 (currentPage, scale)
watch([currentPage, scale], () => {
  // --- 在 watch 回调开始时取消任务 ---
  if (currentRenderTask.value) {
    currentRenderTask.value.cancel();
    currentRenderTask.value = null;
  }
  // -----------------------------------
  if (pdfDocument.value) {
    renderPage();
  }
});

// 监听selectedFile变化，确保在PDF文件被选中时渲染PDF
watch(selectedFile, (newFile) => {
  // --- 在 watch 回调开始时取消任务 ---
  if (currentRenderTask.value) {
    currentRenderTask.value.cancel();
    currentRenderTask.value = null;
  }
  // -----------------------------------
  if (newFile && isPdfType(newFile.fileType)) {
    nextTick(() => {
      if (pdfDocument.value) {
        // 如果文档对象已存在 (切换回已加载的 PDF)
        renderPage();
      } else {
        // 如果文档对象不存在 (首次加载或切换到新 PDF)
        loadPdfPreview(newFile.id);
      }
    });
  }
});

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

  // 创建隐藏的<script>标签并加载worker文件到public目录
  // 这是为了确保worker文件可用，但不会阻塞页面加载
  if (!document.getElementById("pdf-worker-loader")) {
    const script = document.createElement("script");
    script.id = "pdf-worker-loader";
    script.setAttribute("data-pdfjs-src", "/pdf.worker.min.mjs");
    document.head.appendChild(script);
  }
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

  // 取消可能正在进行的渲染任务
  if (currentRenderTask.value) {
    currentRenderTask.value.cancel();
    currentRenderTask.value = null;
  }

  // 清理PDF资源
  if (pdfDocument.value) {
    pdfDocument.value.destroy();
    pdfDocument.value = null;
  }
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

/* PDF预览相关样式 */
.pdf-preview-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0 auto;
  max-width: 800px;
}

.pdf-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px 4px 0 0;
  margin-bottom: 1px;
}

.pdf-container {
  position: relative;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 0 0 4px 4px;
  min-height: 500px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow: auto;
  padding: 10px;
}

.pdf-canvas {
  max-width: 100%;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.pdf-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.pdf-loading-overlay .el-icon {
  font-size: 32px;
  color: #409eff;
  margin-bottom: 10px;
}

.dialog-footer {
  text-align: right;
}
</style>
