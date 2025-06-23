import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { formatPrice } from '../utils/formatPrice';

const CancellationConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalPrice } = location.state || { totalPrice: 0 };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Flight Cancelled Successfully
          </h2>
          <p className="mt-2 text-gray-600">
            Your flight has been cancelled and a refund of {formatPrice(totalPrice)} will be processed.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            The refund will be credited to your original payment method within 5-7 business days.
          </p>
          <button
            onClick={() => navigate('/bookings')}
            className="mt-6 w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to My Bookings
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancellationConfirmationPage;
