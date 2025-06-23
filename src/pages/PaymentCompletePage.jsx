import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useBooking } from '../context/BookingContext';
import LoadingSpinner from '../components/LoadingSpinner';

const PaymentCompletePage = () => {
  const navigate = useNavigate();
  const { createNewBooking } = useBooking();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const bookingCreated = useRef(false);

  useEffect(() => {
    const createBooking = async () => {
      // 如果已经创建过预订，直接返回
      if (bookingCreated.current) {
        return;
      }

      try {
        // 从localStorage获取订单数据
        const bookingData = JSON.parse(localStorage.getItem('pendingBooking'));
        if (!bookingData) {
          throw new Error('No booking data found');
        }

        // 标记预订已创建
        bookingCreated.current = true;

        // 创建订单
        await createNewBooking(bookingData);
        
        // 清除localStorage中的订单数据
        localStorage.removeItem('pendingBooking');
        
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to create booking');
        setLoading(false);
        // 如果创建失败，重置标志以允许重试
        bookingCreated.current = false;
      }
    };

    createBooking();
  }, [createNewBooking]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => {
              // 重置标志以允许重试
              bookingCreated.current = false;
              navigate('/booking/review');
            }}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Review
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-8">
          Your booking has been confirmed and your payment has been processed successfully.
        </p>
        <button
          onClick={() => navigate('/bookings')}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          View My Bookings
        </button>
      </div>
    </div>
  );
};

export default PaymentCompletePage;
