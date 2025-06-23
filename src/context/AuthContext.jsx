import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  login as apiLogin, 
  register as apiRegister, 
  logout as apiLogout, 
  checkAuth,
  updateProfile 
} from '../services/authApi';
import { getUserPassengers, updatePassengers, createPassenger } from '../services/passengerApi';
import http from '../services/http';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 检查用户是否已经登录
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found');
          setLoading(false);
          return;
        }

        // 设置 axios 默认 header
        http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        console.log('Checking auth status...');
        const response = await checkAuth();
        const userData = response.data?.user || response.data;
        
        if (userData) {
          console.log('User authenticated:', userData);
          setUser(userData);
        } else {
          console.error('Invalid user data received:', response.data);
          throw new Error('Invalid user data');
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // 清除无效的认证信息
        localStorage.removeItem('token');
        delete http.defaults.headers.common['Authorization'];
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    console.log('Initializing auth...');
    initializeAuth();

    return () => {
      // 清理函数
      setLoading(true); // 重置加载状态
    };
  }, []);

  const login = useCallback(async (credentials) => {
    setError(null);
    try {
      console.log('Attempting login with credentials:', { email: credentials.email });
      const response = await apiLogin(credentials);
      
      // apiLogin已经验证了响应格式并返回了正确的结构
      const { user, token } = response;
      console.log('Login successful:', { user: { ...user, password: undefined }, token: token?.slice(0, 10) + '...' });
      
      // 保存token
      localStorage.setItem('token', token);
      
      // 设置请求头
      http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // 设置用户状态
      setUser(user);
      return { user, token };
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.message);
      setUser(null);
      localStorage.removeItem('token');
      delete http.defaults.headers.common['Authorization'];
      throw error;
    }
  }, []);

  const register = useCallback(async (userData) => {
    setError(null);
    try {
      const response = await apiRegister(userData);
      
      // 检查响应格式
      let userInfo, tokenValue;
      
      if (response.data) {
        // 如果响应数据在data字段中
        if (response.data.data) {
          userInfo = response.data.data.user || response.data.data;
          tokenValue = response.data.data.token;
        } else {
          userInfo = response.data.user || response.data;
          tokenValue = response.data.token;
        }
      } else {
        // 如果响应直接包含数据
        userInfo = response.user || userData;
        tokenValue = response.token;
      }

      // 验证必要的数据
      if (!userInfo) {
        throw new Error('Registration failed: User data not received');
      }

      // 如果有token就保存
      if (tokenValue) {
        localStorage.setItem('token', tokenValue);
        // 设置请求头，这样后续的请求可以带上token
        http.defaults.headers.common['Authorization'] = `Bearer ${tokenValue}`;
      }

      // 创建默认乘客信息
      try {
        const passengerData = {
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          email: userInfo.email,
          phone: userInfo.phone || null,
          isDefault: true
        };
        
        await createPassenger(passengerData);
      } catch (error) {
        console.error('Failed to create default passenger:', error);
      }

      setUser(userInfo);
      return { user: userInfo, token: tokenValue };
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
      // 清除用户状态
      setUser(null);
      // 清除本地存储
      localStorage.removeItem('token');
      // 清除 HTTP 请求头
      delete http.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Logout failed:', error);
      // 即使 API 调用失败，也要清除本地状态
      setUser(null);
      localStorage.removeItem('token');
      delete http.defaults.headers.common['Authorization'];
    }
  }, []);

  const updateUserProfile = useCallback(async (updatedProfile) => {
    try {
      const response = await updateProfile(updatedProfile);
      const updatedUser = response.data || response;
      setUser(prev => ({
        ...prev,
        ...updatedUser
      }));
      return updatedUser;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }, []);

  const getPassengerInfo = useCallback(async () => {
    try {
      const response = await getUserPassengers();
      return response.data || [];
    } catch (error) {
      console.error('Failed to get passenger info:', error);
      return [];
    }
  }, []);

  const updatePassengerInfo = useCallback(async (passengers) => {
    try {
      const response = await updatePassengers(passengers);
      return response;
    } catch (error) {
      console.error('Failed to update passenger info:', error);
      throw error;
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUserProfile,
    getPassengerInfo,
    updatePassengerInfo
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
