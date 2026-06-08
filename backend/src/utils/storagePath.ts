import path from "path";

export const resolveStorageFilePath = (
  storageRoot: string,
  relativePath: string
): string => {
  if (!relativePath || path.isAbsolute(relativePath)) {
    throw new Error("无效的文件路径");
  }

  const rootPath = path.resolve(storageRoot);
  const fullPath = path.resolve(rootPath, relativePath);
  const relativeToRoot = path.relative(rootPath, fullPath);

  if (
    relativeToRoot === "" ||
    relativeToRoot.startsWith("..") ||
    path.isAbsolute(relativeToRoot)
  ) {
    throw new Error("文件路径超出存储目录");
  }

  return fullPath;
};
