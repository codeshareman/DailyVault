/**
 * DailyVault 路径与安全边界工具。
 * by AI.Coding
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CURRENT_FILE = fileURLToPath(import.meta.url);
const SERVER_ROOT = path.resolve(path.dirname(CURRENT_FILE), '..', '..');
const DEFAULT_VAULT_ROOT = path.resolve(SERVER_ROOT, '..');

/**
 * 获取 Vault 根目录；允许测试或部署通过 DAILYVAULT_ROOT 覆盖。
 */
export function getVaultRoot() {
  return path.resolve(process.env.DAILYVAULT_ROOT || DEFAULT_VAULT_ROOT);
}

/**
 * 将 Vault 相对路径安全解析为绝对路径，阻止路径穿越。
 */
export function resolveVaultPath(relativePath = '.') {
  const root = getVaultRoot();
  const target = path.resolve(root, relativePath);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    throw new Error(`路径逃逸 DailyVault 根目录：${relativePath}`);
  }
  return target;
}

/**
 * 把绝对路径转换回 Vault 相对路径，便于 API 返回稳定证据路径。
 */
export function toVaultRelative(absolutePath) {
  return path.relative(getVaultRoot(), absolutePath).split(path.sep).join('/');
}

/**
 * 确保目标文件父目录存在。
 */
export async function ensureParentDir(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
}
