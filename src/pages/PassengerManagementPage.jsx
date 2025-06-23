import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const PassengerManagementPage = () => {
  const navigate = useNavigate();
  const { user, updatePassengerInfo, getPassengerInfo } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [passengers, setPassengers] = useState([]);

  // 初始化乘客信息，包含用户自己
  useEffect(() => {
    const loadPassengerInfo = async () => {
      try {
        setLoading(true);
        const savedPassengers = await getPassengerInfo();
        
        setPassengers(savedPassengers || []);
      } catch (err) {
        console.error('Failed to load passenger info:', err);
        setError('Failed to load passenger information');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadPassengerInfo();
    }
  }, [user, getPassengerInfo]);

  const handlePassengerChange = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index] = {
      ...newPassengers[index],
      [field]: value
    };
    setPassengers(newPassengers);
    setIsFormDirty(true);
  };

  const addPassenger = () => {
    const newPassenger = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      isDefault: false
    };
    setPassengers([...passengers, newPassenger]);
    setIsFormDirty(true);
  };

  const removePassenger = (index) => {
    if (passengers.length > 1 && !passengers[index].isDefault) {
      const newPassengers = passengers.filter((_, i) => i !== index);
      setPassengers(newPassengers);
      setIsFormDirty(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updatePassengerInfo(passengers);
      setIsFormDirty(false);
    } catch (err) {
      const errorMessage = err.message || 'Failed to update passenger information';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (isFormDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Passenger Management</h2>
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Back
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Manage your frequently used passenger information for faster booking.
            </p>

            {error && (
              <ErrorMessage
                message={error}
                className="mb-6"
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {passengers.map((passenger, index) => (
                <div key={passenger.id || index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {passenger.isDefault ? 'Primary Passenger (You)' : `Passenger ${index + 1}`}
                    </h3>
                    {!passenger.isDefault && passengers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePassenger(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={passenger.firstName}
                        onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={passenger.lastName}
                        onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={passenger.email}
                        onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={passenger.phone}
                        onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={addPassenger}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  + Add Another Passenger
                </button>

                {isFormDirty && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {loading ? <LoadingSpinner size="sm" color="white" /> : 'Save Changes'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerManagementPage;
