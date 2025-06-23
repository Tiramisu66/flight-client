import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { ArrowLongRightIcon, ClockIcon } from '@heroicons/react/24/outline';
import { formatPrice } from '../utils/formatPrice';

const FlightCard = ({ 
  flight, 
  onSelect, 
  selected = false,
  className = '' 
}) => {
  // 验证必要的数据并提供默认值
  if (!flight) {
    console.error('Flight data is null or undefined');
    return null;
  }

  const {
    airline = { name: 'Unknown Airline', code: 'XX', logo: null },
    departureTime = new Date().toISOString(),
    arrivalTime = new Date().toISOString(),
    departureAirport: rawDepartureAirport,
    arrivalAirport: rawArrivalAirport,
    price = 0,
    stops = 0
  } = flight;

  // 处理机场信息
  const departureAirport = typeof rawDepartureAirport === 'string' 
    ? { code: rawDepartureAirport, name: rawDepartureAirport }
    : rawDepartureAirport || { code: 'N/A', name: '未知机场' };

  const arrivalAirport = typeof rawArrivalAirport === 'string'
    ? { code: rawArrivalAirport, name: rawArrivalAirport }
    : rawArrivalAirport || { code: 'N/A', name: '未知机场' };

  console.log('Processing flight data:', {
    airline,
    departureTime,
    arrivalTime,
    departureAirport,
    arrivalAirport,
    price,
    stops
  });

  // 根据起飞降落时间计算 duration
  const calculateDuration = () => {
    const depTime = new Date(departureTime);
    const arrTime = new Date(arrivalTime);
    const diffInMilliseconds = arrTime - depTime;
    return diffInMilliseconds / (1000 * 60 * 60); // 转换为小时
  };

  const duration = calculateDuration();

  const formatTime = (dateString) => {
    return format(new Date(dateString), 'HH:mm');
  };

  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h${m ? ` ${m}m` : ''}`;
  };

  return (
    <div 
      className={`
        ${selected ? 'ring-2 ring-blue-500' : 'hover:border-blue-500'}
        border rounded-lg p-4 bg-white shadow-sm transition-all cursor-pointer
        ${className}
      `}
      onClick={() => onSelect(flight)}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        {/* Airline Info */}
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            {airline.code.toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{airline.name}</p>
            <p className="text-sm text-gray-500">{flight.flightNumber}</p>
          </div>
        </div>

        {/* Flight Times */}
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">
              {formatTime(departureTime)}
            </p>
            <p className="text-sm text-gray-500">{departureAirport.name}</p>
          </div>

          <div className="flex flex-col items-center px-4">
            <div className="relative w-24 h-1">
              <ArrowLongRightIcon className="absolute -top-2 right-0 h-5 w-20 text-blue-700" />
            </div>
            <div className="flex items-center mt-1">
              <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
              <span className="text-xs text-gray-500">
                {formatDuration(duration)}
              </span>
            </div>
            {stops > 0 && (
              <span className="text-xs text-orange-500 mt-1">
                {stops} stop{stops > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">
              {formatTime(arrivalTime)}
            </p>
            <p className="text-sm text-gray-500">{arrivalAirport.name}</p>
          </div>
        </div>

        {/* Price */}
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            {formatPrice(price)}
          </p>
          <p className="text-sm text-gray-500">per person</p>
        </div>
      </div>

      {/* Additional Info (expandable on mobile) */}
      <div className="mt-4 pt-4 border-t border-gray-200 sm:hidden">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            From: {departureAirport.name}
          </p>
          <p className="text-sm text-gray-600">
            To: {arrivalAirport.name}
          </p>
          {flight.aircraft && (
            <p className="text-sm text-gray-600">
              Aircraft: {flight.aircraft.type}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

FlightCard.propTypes = {
  flight: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    airline: PropTypes.shape({
      name: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
      logo: PropTypes.string
    }).isRequired,
    flightNumber: PropTypes.string.isRequired,
    departureTime: PropTypes.string.isRequired,
    arrivalTime: PropTypes.string.isRequired,
    departureAirport: PropTypes.shape({
      code: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    arrivalAirport: PropTypes.shape({
      code: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    price: PropTypes.number.isRequired,
    stops: PropTypes.number.isRequired,
    aircraft: PropTypes.shape({
      type: PropTypes.string,
      seatsMap: PropTypes.string
    })
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  selected: PropTypes.bool,
  className: PropTypes.string
};

export default FlightCard;