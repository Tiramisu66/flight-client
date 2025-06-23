/**
 * 格式化价格为货币显示
 * @param {number} amount - 价格金额
 * @param {string} currency - 货币代码，默认为 'USD'
 * @param {string} locale - 地区设置，默认为 'en-US'
 * @returns {string} 格式化后的价格字符串
 */
export const formatPrice = (amount, currency = 'USD', locale = 'en-US') => {
  if (typeof amount !== 'number') {
    console.warn('formatPrice: amount must be a number');
    return '';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    console.error('Error formatting price:', error);
    return `${currency} ${amount.toFixed(2)}`;
  }
};

/**
 * 格式化价格范围
 * @param {number} minPrice - 最低价格
 * @param {number} maxPrice - 最高价格
 * @param {string} currency - 货币代码，默认为 'USD'
 * @param {string} locale - 地区设置，默认为 'en-US'
 * @returns {string} 格式化后的价格范围字符串
 */
export const formatPriceRange = (minPrice, maxPrice, currency = 'USD', locale = 'en-US') => {
  if (typeof minPrice !== 'number' || typeof maxPrice !== 'number') {
    console.warn('formatPriceRange: prices must be numbers');
    return '';
  }

  if (minPrice === maxPrice) {
    return formatPrice(minPrice, currency, locale);
  }

  return `${formatPrice(minPrice, currency, locale)} - ${formatPrice(maxPrice, currency, locale)}`;
};

/**
 * 格式化价格为简短显示（不显示小数）
 * @param {number} amount - 价格金额
 * @param {string} currency - 货币代码，默认为 'USD'
 * @param {string} locale - 地区设置，默认为 'en-US'
 * @returns {string} 格式化后的简短价格字符串
 */
export const formatShortPrice = (amount, currency = 'USD', locale = 'en-US') => {
  if (typeof amount !== 'number') {
    console.warn('formatShortPrice: amount must be a number');
    return '';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  } catch (error) {
    console.error('Error formatting short price:', error);
    return `${currency} ${Math.round(amount)}`;
  }
};

/**
 * 计算折扣价格
 * @param {number} originalPrice - 原价
 * @param {number} discountPercent - 折扣百分比
 * @returns {number} 折扣后的价格
 */
export const calculateDiscountedPrice = (originalPrice, discountPercent) => {
  if (typeof originalPrice !== 'number' || typeof discountPercent !== 'number') {
    console.warn('calculateDiscountedPrice: inputs must be numbers');
    return originalPrice;
  }

  return originalPrice * (1 - discountPercent / 100);
};

/**
 * 格式化折扣显示
 * @param {number} discountPercent - 折扣百分比
 * @returns {string} 格式化后的折扣字符串
 */
export const formatDiscount = (discountPercent) => {
  if (typeof discountPercent !== 'number') {
    console.warn('formatDiscount: discount must be a number');
    return '';
  }

  return `-${Math.round(discountPercent)}%`;
};

/**
 * 格式化价格差异
 * @param {number} priceDiff - 价格差异
 * @param {string} currency - 货币代码，默认为 'USD'
 * @param {string} locale - 地区设置，默认为 'en-US'
 * @returns {string} 格式化后的价格差异字符串
 */
export const formatPriceDifference = (priceDiff, currency = 'USD', locale = 'en-US') => {
  if (typeof priceDiff !== 'number') {
    console.warn('formatPriceDifference: price difference must be a number');
    return '';
  }

  const prefix = priceDiff > 0 ? '+' : '';
  return `${prefix}${formatPrice(priceDiff, currency, locale)}`;
};
