import path from "path";

export const resolveExportFilePath = (
  exportsRoot: string,
  exportFilePath: string
): string => {
  if (!exportFilePath) {
    throw new Error("无效的导出文件路径");
  }

  const rootPath = path.resolve(exportsRoot);
  const fullPath = path.isAbsolute(exportFilePath)
    ? path.resolve(exportFilePath)
    : path.resolve(rootPath, exportFilePath);
  const relativeToRoot = path.relative(rootPath, fullPath);

  if (
    relativeToRoot === "" ||
    relativeToRoot.startsWith("..") ||
    path.isAbsolute(relativeToRoot)
  ) {
    throw new Error("导出文件路径超出导出目录");
  }

  return fullPath;
};
