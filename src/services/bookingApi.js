import http from './http';

/**
 * 创建新预订
 * @param {Object} bookingData - 预订信息
 * @param {string} bookingData.flightId - 出发航班ID
 * @param {string} [bookingData.returnFlightId] - 返程航班ID（如果有）
 * @param {Array} bookingData.passengers - 乘客信息
 * @param {number} bookingData.totalPrice - 总价格
 * @param {number} bookingData.numberOfPassengers - 乘客数量
 * @returns {Promise<Object>} 预订确认信息，包含往返航班详情
 */
export const createBooking = async (bookingData) => {
  // 确保数据结构匹配后端 BookingDTO
  const payload = {
    flightId: bookingData.flightId,                    // 主航班ID
    returnFlightId: bookingData.returnFlightId,        // 返程航班ID（如果有）
    flightType: bookingData.flightType,                // ONE_WAY 或 ROUND_TRIP
    mainFlightType: bookingData.mainFlightType,        // OUTBOUND 或 RETURN
    numberOfPassengers: bookingData.numberOfPassengers,
    totalPrice: bookingData.totalPrice,
    passengerIds: bookingData.passengerIds            // 乘客ID列表
  };
  
  const response = await http.post('/bookings', payload);
  return response.data;
};

/**
 * 获取用户的所有预订
 * @param {Object} params - 查询参数
 * @param {string} [params.status] - 预订状态 (upcoming/past/all)
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.size=10] - 每页数量
 * @returns {Promise<Array>} 预订列表
 */
export const getBookings = async (params = {}) => {
  const response = await http.get('/bookings', { params });
  return response.data;
};

/**
 * 获取预订详情
 * @param {string} bookingId - 预订ID
 * @returns {Promise<Object>} 预订详细信息
 */
export const getBookingDetails = async (bookingId) => {
  const response = await http.get(`/bookings/${bookingId}`);
  return response.data;
};

/**
 * 取消预订
 * @param {string} bookingId - 预订ID
 * @param {string} [reason] - 取消原因
 * @returns {Promise<Object>} 取消确认信息
 */
export const cancelBooking = async (bookingId, reason) => {
  const response = await http.post(`/bookings/${bookingId}/cancel`, { reason });
  return response.data;
};

/**
 * 修改预订
 * @param {string} bookingId - 预订ID
 * @param {Object} updates - 更新信息
 * @returns {Promise<Object>} 更新后的预订信息
 */
export const updateBooking = async (bookingId, updates) => {
  const response = await http.put(`/bookings/${bookingId}`, updates);
  return response.data;
};

/**
 * 获取预订确认邮件
 * @param {string} bookingId - 预订ID
 * @param {string} email - 邮箱地址
 * @returns {Promise<Object>} 发送确认信息
 */
export const sendBookingConfirmation = async (bookingId, email) => {
  const response = await http.post(`/bookings/${bookingId}/send-confirmation`, { email });
  return response.data;
};

/**
 * 添加乘客到预订
 * @param {string} bookingId - 预订ID
 * @param {Object} passengerData - 乘客信息
 * @returns {Promise<Object>} 更新后的预订信息
 */
export const addPassenger = async (bookingId, passengerData) => {
  const response = await http.post(`/bookings/${bookingId}/passengers`, passengerData);
  return response.data;
};

/**
 * 移除预订中的乘客
 * @param {string} bookingId - 预订ID
 * @param {string} passengerId - 乘客ID
 * @returns {Promise<Object>} 更新后的预订信息
 */
export const removePassenger = async (bookingId, passengerId) => {
  const response = await http.delete(`/bookings/${bookingId}/passengers/${passengerId}`);
  return response.data;
};

/**
 * 获取预订的支付历史
 * @param {string} bookingId - 预订ID
 * @returns {Promise<Array>} 支付历史记录
 */
export const getBookingPaymentHistory = async (bookingId) => {
  const response = await http.get(`/bookings/${bookingId}/payments`);
  return response.data;
};

/**
 * 检查预订状态
 * @param {string} bookingReference - 预订参考号
 * @returns {Promise<Object>} 预订状态信息
 */
export const checkBookingStatus = async (bookingReference) => {
  const response = await http.get('/bookings/status', {
    params: { reference: bookingReference }
  });
  return response.data;
};

/**
 * 获取即将到来的预订
 * @param {number} [limit=5] - 返回数量限制
 * @returns {Promise<Array>} 即将到来的预订列表
 */
export const getUpcomingBookings = async (limit = 5) => {
  const response = await http.get('/bookings/upcoming', {
    params: { limit }
  });
  return response.data;
};

/**
 * 获取过去的预订历史
 * @param {Object} params - 查询参数
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.size=10] - 每页数量
 * @returns {Promise<Array>} 历史预订列表
 */
export const getPastBookings = async (params = {}) => {
  const response = await http.get('/bookings/past', { params });
  return response.data;
};
