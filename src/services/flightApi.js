import http from './http';

/**
 * 搜索航班
 * @param {Object} params - 搜索参数
 * @param {string} params.from - 出发地机场代码
 * @param {string} params.to - 目的地机场代码
 * @param {string} params.departDate - 出发日期 (YYYY-MM-DD)
 * @param {string} [params.returnDate] - 返回日期 (YYYY-MM-DD)，可选
 * @param {number} [params.passengers=1] - 乘客数量
 * @param {string} [params.class='ECONOMY'] - 舱位等级 (ECONOMY/BUSINESS/FIRST)
 * @returns {Promise<Array>} 航班列表
 */
export const searchFlights = async ({
  from,
  to,
  departDate,
  returnDate,
  passengers = 1,
  class: cabinClass = 'ECONOMY'
}) => {
  const response = await http.get('/flights/search', {
    params: {
      from,
      to,
      departDate,
      returnDate,
      passengers,
      class: cabinClass
    }
  });
  console.log('Search Flights Response:', response.data);
  
  try {
    const flights = response.data.data || [];
    if (!Array.isArray(flights)) {
      console.error('Invalid flights data format:', flights);
      return [];
    }

    // 处理和验证每个航班数据
    return flights.map(flight => ({
      id: flight.id,
      airline: {
        name: flight.airline || 'Unknown Airline',
        code: (flight.flightNumber || '').slice(0, 2),
        logo: flight.airlineLogo || null
      },
      flightNumber: flight.flightNumber || 'XX000',
      departureTime: flight.departureTime || new Date().toISOString(),
      arrivalTime: flight.arrivalTime || new Date().toISOString(),
      departureAirport: {
        code: flight.departureAirport?.code || 'XXX',
        name: flight.departureAirport?.name || 'Unknown Airport'
      },
      arrivalAirport: {
        code: flight.arrivalAirport?.code || 'XXX',
        name: flight.arrivalAirport?.name || 'Unknown Airport'
      },
      price: Number(flight.price) || 0,
      duration: Number(flight.duration) || 0,
      stops: Number(flight.stops) || 0,
      aircraft: flight.aircraft || null
    }));
  } catch (error) {
    console.error('Error processing flights data:', error);
    return [];
  }
};

/**
 * 获取航班详情
 * @param {string} flightId - 航班ID
 * @returns {Promise<Object>} 航班详细信息
 */
export const getFlightDetails = async (flightId) => {
  const response = await http.get(`/flights/${flightId}`);
  return response.data.data;
};

/**
 * 获取航班价格详情
 * @param {string} flightId - 航班ID
 * @param {number} passengers - 乘客数量
 * @param {string} [cabinClass='ECONOMY'] - 舱位等级
 * @returns {Promise<Object>} 价格详情
 */
export const getFlightPricing = async (flightId, passengers, cabinClass = 'ECONOMY') => {
  const response = await http.get(`/flights/${flightId}/pricing`, {
    params: { passengers, class: cabinClass }
  });
  return response.data.data;
};

/**
 * 检查航班座位可用性
 * @param {string} flightId - 航班ID
 * @param {string} [cabinClass='ECONOMY'] - 舱位等级
 * @returns {Promise<Object>} 座位可用性信息
 */
export const checkSeatAvailability = async (flightId, cabinClass = 'ECONOMY') => {
  const response = await http.get(`/flights/${flightId}/seats`, {
    params: { class: cabinClass }
  });
  return response.data.data;
};

/**
 * 获取航班状态
 * @param {string} flightNumber - 航班号
 * @param {string} date - 日期 (YYYY-MM-DD)
 * @returns {Promise<Object>} 航班状态信息
 */
export const getFlightStatus = async (flightNumber, date) => {
  const response = await http.get('/flights/status', {
    params: { flightNumber, date }
  });
  return response.data.data;
};

/**
 * 获取热门航线
 * @param {number} [limit=10] - 返回数量限制
 * @returns {Promise<Array>} 热门航线列表
 */
export const getPopularRoutes = async (limit = 10) => {
  const response = await http.get('/flights/popular-routes', {
    params: { limit }
  });
  return response.data.data;
};

/**
 * 获取特价航班
 * @param {string} [from] - 出发地机场代码（可选）
 * @param {string} [to] - 目的地机场代码（可选）
 * @returns {Promise<Array>} 特价航班列表
 */
export const getPromotionalFlights = async (from, to) => {
  const response = await http.get('/flights/promotions', {
    params: { from, to }
  });
  return response.data.data;
};

/**
 * 计算航班总价
 * @param {Object} flight - 航班信息
 * @param {number} passengers - 乘客数量
 * @param {string} [cabinClass='ECONOMY'] - 舱位等级
 * @returns {Object} 价格明细
 */
export const calculateTotalPrice = (flight, passengers, cabinClass = 'ECONOMY') => {
  const basePrice = flight.price * passengers;
  const taxes = basePrice * 0.1; // 假设税费为10%
  const fees = 25 * passengers; // 假设每位乘客服务费25美元
  
  return {
    basePrice,
    taxes,
    fees,
    total: basePrice + taxes + fees
  };
};

/**
 * 格式化航班时间
 * @param {string} time - 时间字符串
 * @returns {string} 格式化后的时间
 */
export const formatFlightTime = (time) => {
  return new Date(time).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};
