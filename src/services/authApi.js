import http from './http';

/**
 * 用户登录
 * @param {Object} credentials - 登录凭证
 * @param {string} credentials.email - 用户邮箱
 * @param {string} credentials.password - 用户密码
 * @returns {Promise<Object>} 登录响应（包含token和用户信息）
 */
export const login = async ({ email, password }) => {
  try {
    const response = await http.post('/auth/login', { email, password });
    console.log('Raw login response:', response);
    console.log('Login response data:', response.data);
    
    // 检查响应数据的具体结构
    const responseData = response.data;
    console.log('Response data structure:', {
      hasData: !!responseData,
      keys: responseData ? Object.keys(responseData) : [],
      hasToken: responseData?.token ? 'yes' : 'no',
      hasUser: responseData?.user ? 'yes' : 'no',
      dataType: typeof responseData
    });

    // 适应不同的响应格式
    let userData, tokenData;

    if (responseData.data) {
      // 如果数据在data字段中
      userData = responseData.data.user || responseData.data;
      tokenData = responseData.data.token || responseData.token;
    } else {
      // 直接在顶层
      userData = responseData.user || responseData;
      tokenData = responseData.token;
    }

    // 验证提取的数据
    if (!userData || !tokenData) {
      console.error('Failed to extract user or token from response:', responseData);
      throw new Error('Invalid server response format');
    }

    console.log('Extracted data:', {
      user: { ...userData, password: undefined },
      tokenPreview: tokenData.slice(0, 10) + '...'
    });

    return {
      user: userData,
      token: tokenData
    };
  } catch (error) {
    console.error('Login API error:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

/**
 * 用户注册
 * @param {Object} userData - 用户注册信息
 * @param {string} userData.email - 邮箱
 * @param {string} userData.password - 密码
 * @param {string} userData.firstName - 名
 * @param {string} userData.lastName - 姓
 * @param {string} userData.country - 国家
 * @param {string} [userData.phone] - 电话号码（可选）
 * @returns {Promise<Object>} 注册响应
 */
export const register = async (userData) => {
  try {
    console.log('Starting registration process...');
    console.log('Registration data:', {
      ...userData,
      password: '[REDACTED]'
    });

    const response = await http.post('/auth/register', {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      country: userData.country,
      phone: userData.phone || ''
    });
    
    console.log('Registration response:', {
      status: response.status,
      hasData: !!response.data,
      dataStructure: response.data ? Object.keys(response.data) : []
    });

    if (!response.data) {
      throw new Error('注册失败：服务器未返回数据');
    }

    // 处理不同的响应格式
    let processedResponse = {};
    if (response.data.data) {
      // 如果数据在data字段中
      processedResponse = {
        user: response.data.data.user || response.data.data,
        token: response.data.data.token
      };
    } else {
      // 如果数据在顶层
      processedResponse = {
        user: response.data.user || response.data,
        token: response.data.token
      };
    }

    console.log('Processed registration response:', {
      hasUser: !!processedResponse.user,
      hasToken: !!processedResponse.token
    });

    return processedResponse;
  } catch (error) {
    console.error('Registration error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message.includes('Network Error')) {
      throw new Error('网络错误，请检查网络连接');
    }
    throw error;
  }
};

/**
 * 检查用户登录状态
 * @returns {Promise<Object>} 登录状态信息
 */
export const checkAuth = async () => {
  const response = await http.get('/auth/check');
  return response.data;
};

/**
 * 用户登出
 * @returns {Promise<Object>} 登出响应
 */
export const logout = async () => {
  const response = await http.post('/auth/logout');
  return response.data;
};

/**
 * 重置密码请求
 * @param {string} email - 用户邮箱
 * @returns {Promise<Object>} 重置密码响应
 */
export const requestPasswordReset = async (email) => {
  const response = await http.post('/auth/password-reset-request', { email });
  return response.data;
};

/**
 * 重置密码
 * @param {Object} resetData - 重置密码数据
 * @param {string} resetData.token - 重置令牌
 * @param {string} resetData.password - 新密码
 * @returns {Promise<Object>} 重置结果
 */
export const resetPassword = async ({ token, password }) => {
  const response = await http.post('/auth/password-reset', { token, password });
  return response.data;
};

/**
 * 更新用户信息
 * @param {Object} userData - 用户信息更新
 * @returns {Promise<Object>} 更新后的用户信息
 */
export const updateProfile = async (userData) => {
  const response = await http.put('/auth/profile', userData);
  return response.data;
};

/**
 * 更改密码
 * @param {Object} passwordData - 密码更改数据
 * @param {string} passwordData.currentPassword - 当前密码
 * @param {string} passwordData.newPassword - 新密码
 * @returns {Promise<Object>} 更改结果
 */
export const changePassword = async ({ currentPassword, newPassword }) => {
  const response = await http.post('/auth/change-password', {
    currentPassword,
    newPassword
  });
  return response.data;
};

/**
 * 验证邮箱
 * @param {string} token - 验证令牌
 * @returns {Promise<Object>} 验证结果
 */
export const verifyEmail = async (token) => {
  const response = await http.post('/auth/verify-email', { token });
  return response.data;
};

/**
 * 重新发送验证邮件
 * @param {string} email - 用户邮箱
 * @returns {Promise<Object>} 发送结果
 */
export const resendVerification = async (email) => {
  const response = await http.post('/auth/resend-verification', { email });
  return response.data;
};

/**
 * 获取用户详细信息
 * @returns {Promise<Object>} 用户详细信息
 */
export const getUserProfile = async () => {
  const response = await http.get('/auth/profile');
  return response.data;
};

/**
 * 刷新访问令牌
 * @param {string} refreshToken - 刷新令牌
 * @returns {Promise<Object>} 新的访问令牌
 */
export const refreshToken = async (refreshToken) => {
  const response = await http.post('/auth/refresh-token', { refreshToken });
  return response.data;
};
