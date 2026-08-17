/**
 * Daily 日期工具：统一接受 YYYY-MM-DD 或 YYYYMMDD，并输出模板所需的格式。
 */

/**
 * 把 Date 转成 YYYY-MM-DD。
 */
export function formatDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 把 Date 转成 YYYYMMDD，用于审计日志文件名。
 */
export function formatCompactDate(date = new Date()) {
  return formatDate(date).replaceAll('-', '');
}

/**
 * 规范化用户传入日期，接受 YYYY-MM-DD 或 YYYYMMDD；无效时抛 statusCode=400。
 */
export function normalizeDate(input = formatDate()) {
  if (/^\d{8}$/.test(input)) {
    return `${input.slice(0, 4)}-${input.slice(4, 6)}-${input.slice(6, 8)}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }
  const error = new Error(`日期无效，期望 YYYY-MM-DD 或 YYYYMMDD：${input}`);
  error.statusCode = 400;
  throw error;
}

/**
 * 返回 Daily 文件名使用的 YYYYMMDD。
 */
export function dailyFileStem(input = formatDate()) {
  return normalizeDate(input).replaceAll('-', '');
}

export function isoWeek(input = formatDate()) {
  const date = new Date(`${normalizeDate(input)}T00:00:00Z`);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((date.getTime() - yearStart) / 86_400_000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function chineseWeekday(input = formatDate()) {
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return weekdays[new Date(`${normalizeDate(input)}T00:00:00Z`).getUTCDay()];
}
