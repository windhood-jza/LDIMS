import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { resolveExportFilePath } from "../../src/utils/exportPath";

test("resolveExportFilePath resolves a relative path inside exports root", () => {
  const root = path.resolve("exports-root");
  const result = resolveExportFilePath(root, "report.xlsx");

  assert.equal(result, path.join(root, "report.xlsx"));
});

test("resolveExportFilePath accepts an absolute path inside exports root", () => {
  const root = path.resolve("exports-root");
  const filePath = path.join(root, "nested", "report.csv");
  const result = resolveExportFilePath(root, filePath);

  assert.equal(result, filePath);
});

test("resolveExportFilePath rejects empty paths", () => {
  assert.throws(
    () => resolveExportFilePath(path.resolve("exports-root"), ""),
    /无效的导出文件路径/
  );
});

test("resolveExportFilePath rejects paths outside exports root", () => {
  assert.throws(
    () => resolveExportFilePath(path.resolve("exports-root"), path.join("..", "secret.xlsx")),
    /导出文件路径超出导出目录/
  );
});
