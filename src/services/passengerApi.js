import http from './http';

// 获取当前用户的所有乘客信息
export const getUserPassengers = async () => {
  try {
    const response = await http.get('/user-passengers');
    console.log('API response:', response); // 添加调试日志
    return response;
  } catch (error) {
    console.error('Failed to get passenger info:', error);
    throw error;
  }
};

// 创建单个乘客信息
export const createPassenger = async (passenger) => {
  try {
    const response = await http.post('/user-passengers/single', passenger);
    return response;
  } catch (error) {
    console.error('Failed to create passenger:', error);
    throw error;
  }
};

// 更新乘客信息
export const updatePassengers = async (passengers) => {
  try {
    // 清理前端临时ID，避免发送字符串ID到后端
    const cleanedPassengers = passengers.map(passenger => {
      const cleaned = { ...passenger };
      
      // 如果ID是字符串或临时ID，则不发送给后端
      if (typeof cleaned.id === 'string' || cleaned.id === 'self') {
        delete cleaned.id;
      }
      
      // 不发送userId，让后端自动设置
      delete cleaned.userId;
      
      return cleaned;
    });
    
    const response = await http.post('/user-passengers', cleanedPassengers);
    return response.data;
  } catch (error) {
    console.error('Failed to update passenger info:', error);
    throw error;
  }
};

// 删除乘客信息
export const deletePassenger = async (passengerId) => {
  try {
    const response = await http.delete(`/user-passengers/${passengerId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete passenger:', error);
    throw error;
  }
};

// 获取预订关联的乘客信息
export const getBookingPassengers = async (bookingId) => {
  try {
    const response = await http.get(`/bookings/${bookingId}/passengers`);
    return response.data;
  } catch (error) {
    console.error('Failed to get booking passengers:', error);
    throw error;
  }
};

// 为预订添加乘客
export const addBookingPassengers = async (bookingId, passengerIds) => {
  try {
    const response = await http.post(`/bookings/${bookingId}/passengers`, {
      passengerIds
    });
    return response.data;
  } catch (error) {
    console.error('Failed to add booking passengers:', error);
    throw error;
  }
};
