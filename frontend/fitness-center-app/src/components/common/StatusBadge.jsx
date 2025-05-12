import React from 'react';

const StatusBadge = ({ status, type = 'default' }) => {
  const getStatusColors = () => {
    if (type === 'payment') {
      switch (status.toLowerCase()) {
        case 'completed':
          return 'bg-green-100 text-green-800';
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'failed':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    } else if (type === 'equipment') {
      switch (status.toLowerCase()) {
        case 'active':
          return 'bg-green-100 text-green-800';
        case 'maintenance':
          return 'bg-yellow-100 text-yellow-800';
        case 'out-of-order':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    } else {
      switch (status.toLowerCase()) {
        case 'active':
          return 'bg-green-100 text-green-800';
        case 'inactive':
          return 'bg-gray-100 text-gray-800';
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        default:
          return 'bg-blue-100 text-blue-800';
      }
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColors()}`}>
      {status}
    </span>
  );
};

export default StatusBadge;