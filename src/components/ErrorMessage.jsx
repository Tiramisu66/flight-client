import React from 'react';
import PropTypes from 'prop-types';
import { XCircleIcon } from '@heroicons/react/24/solid';

const types = {
  error: 'bg-red-50 text-red-700',
  warning: 'bg-yellow-50 text-yellow-700',
  info: 'bg-blue-50 text-blue-700'
};

const icons = {
  error: 'text-red-400',
  warning: 'text-yellow-400',
  info: 'text-blue-400'
};

const ErrorMessage = ({ 
  message, 
  type = 'error',
  onClose,
  className = ''
}) => {
  if (!message) return null;

  return (
    <div className={`rounded-md p-4 ${types[type]} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className={`h-5 w-5 ${icons[type]}`} aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">
            {message}
          </p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${type === 'error' ? 'text-red-500 hover:bg-red-100 focus:ring-red-600' :
                    type === 'warning' ? 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600' :
                    'text-blue-500 hover:bg-blue-100 focus:ring-blue-600'}`}
                onClick={onClose}
              >
                <span className="sr-only">Dismiss</span>
                <XCircleIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ErrorMessage.propTypes = {
  message: PropTypes.string,
  type: PropTypes.oneOf(['error', 'warning', 'info']),
  onClose: PropTypes.func,
  className: PropTypes.string
};

export default ErrorMessage;
