import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { resolveStorageFilePath } from "../../src/utils/storagePath";

test("resolveStorageFilePath resolves a relative path inside storage root", () => {
  const root = path.resolve("storage-root");
  const result = resolveStorageFilePath(root, path.join("docs", "file.pdf"));

  assert.equal(result, path.join(root, "docs", "file.pdf"));
});

test("resolveStorageFilePath rejects empty paths", () => {
  assert.throws(
    () => resolveStorageFilePath(path.resolve("storage-root"), ""),
    /无效的文件路径/
  );
});

test("resolveStorageFilePath rejects absolute paths", () => {
  assert.throws(
    () => resolveStorageFilePath(path.resolve("storage-root"), path.resolve("other", "file.pdf")),
    /无效的文件路径/
  );
});

test("resolveStorageFilePath rejects paths outside storage root", () => {
  assert.throws(
    () => resolveStorageFilePath(path.resolve("storage-root"), path.join("..", "secret.txt")),
    /文件路径超出存储目录/
  );
});
