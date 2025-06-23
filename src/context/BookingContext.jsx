import React, { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { createBooking, getBookings, getBookingDetails } from '../services/bookingApi';

const BookingContext = createContext(null);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [selectedOutboundFlight, setSelectedOutboundFlight] = useState(null);
  const [selectedReturnFlight, setSelectedReturnFlight] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 加载用户的所有预订
  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getBookings();
      setBookings(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 创建新预订
  const createNewBooking = useCallback(async (bookingData) => {
    setLoading(true);
    setError(null);
    try {
      // 过滤掉不需要的字段，确保包含flightType和mainFlightType
      const payload = {
        flightId: bookingData.flightId,
        returnFlightId: bookingData.returnFlightId,
        passengerIds: bookingData.passengerIds,
        numberOfPassengers: bookingData.numberOfPassengers,
        totalPrice: bookingData.totalPrice,
        flightType: bookingData.flightType,
        mainFlightType: bookingData.mainFlightType,
      };
      const response = await createBooking(payload);
      // 确保新预订被正确添加到状态中
      const newBooking = response.data;
      setBookings(prev => {
        // 检查是否已存在相同ID的预订
        const exists = prev.some(booking => booking.id === newBooking.id);
        if (exists) {
          return prev.map(booking => 
            booking.id === newBooking.id ? newBooking : booking
          );
        }
        return [...prev, newBooking];
      });
      return newBooking;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 选择出发航班
  const selectOutboundFlight = useCallback((flight) => {
    setSelectedOutboundFlight(flight);
  }, []);

  // 选择返程航班
  const selectReturnFlight = useCallback((flight) => {
    setSelectedReturnFlight(flight);
  }, []);

  // 清除选择的航班
  const clearSelectedFlights = useCallback(() => {
    setSelectedOutboundFlight(null);
    setSelectedReturnFlight(null);
  }, []);

  // 获取即将到来的预订
  const getUpcomingBookings = useCallback(() => {
    const now = new Date();
    return bookings.filter(booking => {
      // 对于往返航班，使用返程航班时间（如果有）或出发航班时间
      const relevantTime = booking.returnFlight 
        ? new Date(booking.returnFlight.departureTime)
        : new Date(booking.flight.departureTime);
      return relevantTime > now;
    });
  }, [bookings]);

  // 获取过去的预订
  const getPastBookings = useCallback(() => {
    const now = new Date();
    return bookings.filter(booking => {
      // 对于往返航班，使用返程航班时间（如果有）或出发航班时间
      const relevantTime = booking.returnFlight 
        ? new Date(booking.returnFlight.arrivalTime)
        : new Date(booking.flight.arrivalTime);
      return relevantTime <= now;
    });
  }, [bookings]);

  // 计算总价格（包括所有费用）
  const calculateTotalPrice = useCallback((outboundFlight, returnFlight, passengers) => {
    let totalPrice = 0;
    
    if (outboundFlight) {
      const outboundBasePrice = outboundFlight.price * passengers;
      const outboundTaxes = outboundBasePrice * 0.1; // 10% tax
      totalPrice += outboundBasePrice + outboundTaxes;
    }
    
    if (returnFlight) {
      const returnBasePrice = returnFlight.price * passengers;
      const returnTaxes = returnBasePrice * 0.1; // 10% tax
      totalPrice += returnBasePrice + returnTaxes;
    }
    
    const fees = 25 * passengers; // $25 per passenger service fee
    return totalPrice + fees;
  }, []);

  const getBookingById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getBookingDetails(id);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    selectedOutboundFlight,
    selectedReturnFlight,
    bookings,
    loading,
    error,
    selectOutboundFlight,
    selectReturnFlight,
    clearSelectedFlights,
    createNewBooking,
    loadBookings,
    getUpcomingBookings,
    getPastBookings,
    calculateTotalPrice,
    getBookingById
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

BookingProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default BookingContext;
