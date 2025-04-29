/**
 * 触发浏览器下载 Blob 数据
 * @param blob 后端返回的 Blob 数据
 * @param filename 用户下载时看到的文件名
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  // 检查 Blob 是否有效
  if (!(blob instanceof Blob)) {
    console.error("[downloadBlob] Invalid Blob object received.");
    // 可以考虑显示错误提示给用户
    return;
  }

  // 创建一个指向 Blob 的临时 URL
  const blobUrl = window.URL.createObjectURL(blob);

  // 创建一个隐藏的 a 标签用于触发下载
  const link = document.createElement("a");
  link.style.display = "none";
  link.href = blobUrl;
  link.download = filename; // 设置下载时的文件名

  // 将 a 标签添加到 DOM 中 (某些浏览器需要)
  document.body.appendChild(link);

  // 模拟点击 a 标签
  try {
    link.click();
  } catch (e) {
    console.error("[downloadBlob] Failed to trigger download click:", e);
    // 可以在这里添加用户提示
  }

  // 从 DOM 中移除 a 标签
  document.body.removeChild(link);

  // 释放 Blob URL
  window.URL.revokeObjectURL(blobUrl);
  console.log(
    `[downloadBlob] Download triggered for ${filename}, Blob URL revoked.`
  );
};
