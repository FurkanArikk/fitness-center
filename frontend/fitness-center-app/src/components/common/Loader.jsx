import React from 'react';

const Loader = ({ size = 'medium', message = 'Loading...' }) => {
  const sizeClass = {
    small: 'h-6 w-6 border-2',
    medium: 'h-12 w-12 border-4',
    large: 'h-16 w-16 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`${sizeClass[size]} animate-spin rounded-full border-b-2 border-blue-500`}></div>
      {message && <p className="mt-4 text-gray-500">{message}</p>}
    </div>
  );
};

export default Loader;