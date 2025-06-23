import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const RegisterSuccessPage = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // 自动倒计时
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 单独处理导航逻辑
  useEffect(() => {
    if (countdown <= 0) {
      navigate('/login');
    }
  }, [countdown, navigate]);

  const handleManualRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            registered successfully！
          </h2>
          <p className="mt-4 text-gray-600">
            {countdown}秒后自动跳转到登录页面
          </p>
          <button
            onClick={handleManualRedirect}
            className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            立即登录
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterSuccessPage;
