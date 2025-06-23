import http from './http';

/**
 * 获取所有机场列表
 * @returns {Promise<Array>} 机场列表
 */
export const getAirports = async () => {
  const response = await http.get('/airports');
  return response.data.data;
};

/**
 * 根据代码获取机场信息
 * @param {string} code - 机场代码
 * @returns {Promise<Object>} 机场信息
 */
export const getAirportByCode = async (code) => {
  const response = await http.get(`/airports/${code}`);
  return response.data;
};

/**
 * 搜索机场
 * @param {string} query - 搜索关键词（城市名或机场名）
 * @returns {Promise<Array>} 匹配的机场列表
 */
export const searchAirports = async (query) => {
  const response = await http.get('/airports/search', {
    params: { query }
  });
  return response.data;
};

/**
 * 根据城市获取机场列表
 * @param {string} city - 城市名称
 * @returns {Promise<Array>} 该城市的机场列表
 */
export const getAirportsByCity = async (city) => {
  const response = await http.get('/airports/city', {
    params: { city }
  });
  return response.data;
};

/**
 * 获取机场之间的距离
 * @param {string} fromCode - 出发机场代码
 * @param {string} toCode - 到达机场代码
 * @returns {Promise<Object>} 距离信息
 */
export const getAirportDistance = async (fromCode, toCode) => {
  const response = await http.get('/airports/distance', {
    params: { from: fromCode, to: toCode }
  });
  return response.data;
};

/**
 * 格式化机场选项为 Select 组件使用的格式
 * @param {Array} airports - 机场列表
 * @returns {Array} 格式化后的选项列表
 */
export const formatAirportOptions = (airports) => {
  if (!Array.isArray(airports)) {
    console.error('Invalid airports data:', airports);
    return [];
  }
  
  return airports.map(airport => {
    if (!airport || !airport.code) {
      console.error('Invalid airport data:', airport);
      return null;
    }
    return {
      value: airport.code,
      label: `${airport.city || ''} (${airport.code}) - ${airport.name || ''}`,
      airport: airport
    };
  }).filter(Boolean); // 移除无效的选项
};

/**
 * 验证机场代码是否有效
 * @param {string} code - 机场代码
 * @returns {Promise<boolean>} 是否有效
 */
export const validateAirportCode = async (code) => {
  try {
    await getAirportByCode(code);
    return true;
  } catch (error) {
    return false;
  }
};
