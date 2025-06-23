import React from 'react';
import PropTypes from 'prop-types';

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
};

const colors = {
  white: 'border-white',
  blue: 'border-blue-500',
  gray: 'border-gray-500'
};

const LoadingSpinner = ({ size = 'md', color = 'blue', className = '' }) => {
  return (
    <div className="flex justify-center items-center">
      <div
        className={`
          animate-spin
          rounded-full
          border-2
          border-t-transparent
          ${sizes[size]}
          ${colors[color]}
          ${className}
        `}
        role="status"
        aria-label="loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['white', 'blue', 'gray']),
  className: PropTypes.string
};

export default LoadingSpinner;
