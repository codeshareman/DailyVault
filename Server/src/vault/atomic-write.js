/**
 * 原子写入工具，避免 Markdown 写一半导致 Vault 损坏。
 * by AI.Coding
 */
import { rename, unlink, writeFile } from 'node:fs/promises';
import { ensureParentDir } from '../config/paths.js';

/**
 * 先写临时文件再 rename，保证同卷原子替换。
 */
export async function atomicWriteFile(filePath, content) {
  await ensureParentDir(filePath);
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
  await writeFile(tempPath, content, 'utf8');
  try {
    await rename(tempPath, filePath);
  } catch (error) {
    try {
      await unlink(tempPath);
    } catch (cleanupError) {
      error.cleanupError = cleanupError;
    }
    error.message = `原子写入失败：${filePath}，临时路径 ${tempPath}：${error.message}`;
    throw error;
  }
}
