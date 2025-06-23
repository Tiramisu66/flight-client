import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * 格式化日期为指定格式
 * @param {string|Date} date - 要格式化的日期
 * @param {string} formatStr - 格式化字符串，默认为 'yyyy-MM-dd'
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date, formatStr = 'yyyy-MM-dd') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

/**
 * 格式化日期和时间
 * @param {string|Date} date - 要格式化的日期
 * @returns {string} 格式化后的日期和时间字符串
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'yyyy-MM-dd HH:mm');
};

/**
 * 格式化时间
 * @param {string|Date} date - 要格式化的日期
 * @returns {string} 格式化后的时间字符串
 */
export const formatTime = (date) => {
  return formatDate(date, 'HH:mm');
};

/**
 * 格式化为相对时间
 * @param {string|Date} date - 要格式化的日期
 * @returns {string} 相对时间字符串
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

/**
 * 格式化为友好的日期显示
 * @param {string|Date} date - 要格式化的日期
 * @returns {string} 友好的日期字符串
 */
export const formatFriendlyDate = (date) => {
  return formatDate(date, 'MMM d, yyyy');
};

/**
 * 格式化为友好的日期和时间显示
 * @param {string|Date} date - 要格式化的日期
 * @returns {string} 友好的日期和时间字符串
 */
export const formatFriendlyDateTime = (date) => {
  return formatDate(date, 'MMM d, yyyy HH:mm');
};

/**
 * 格式化为短日期显示
 * @param {string|Date} date - 要格式化的日期
 * @returns {string} 短日期字符串
 */
export const formatShortDate = (date) => {
  return formatDate(date, 'MM/dd');
};

/**
 * 格式化为短日期和时间显示
 * @param {string|Date} date - 要格式化的日期
 * @returns {string} 短日期和时间字符串
 */
export const formatShortDateTime = (date) => {
  return formatDate(date, 'MM/dd HH:mm');
};

/**
 * 格式化为周几显示
 * @param {string|Date} date - 要格式化的日期
 * @returns {string} 周几字符串
 */
export const formatWeekday = (date) => {
  return formatDate(date, 'EEEE');
};

/**
 * 格式化为短周几显示
 * @param {string|Date} date - 要格式化的日期
 * @returns {string} 短周几字符串
 */
export const formatShortWeekday = (date) => {
  return formatDate(date, 'EEE');
};

/**
 * 格式化为月份显示
 * @param {string|Date} date - 要格式化的日期
 * @returns {string} 月份字符串
 */
export const formatMonth = (date) => {
  return formatDate(date, 'MMMM');
};

/**
 * 格式化为短月份显示
 * @param {string|Date} date - 要格式化的日期
 * @returns {string} 短月份字符串
 */
export const formatShortMonth = (date) => {
  return formatDate(date, 'MMM');
};
