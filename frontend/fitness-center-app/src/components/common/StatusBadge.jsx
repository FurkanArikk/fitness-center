import React from 'react';

const StatusBadge = ({ status, variant }) => {
  // Status texts and color mappings
  const statusConfig = {
    // Member statuses
    active: {
      label: 'Active',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200'
    },
    de_active: {
      label: 'Inactive',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-200'
    },
    hold_on: {
      label: 'On Hold',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-200'
    },
    // Payment statuses
    completed: {
      label: 'Completed',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200'
    },
    'Completed': {
      label: 'Completed',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200'
    },
    pending: {
      label: 'Pending',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200'
    },
    'Pending': {
      label: 'Pending',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200'
    },
    failed: {
      label: 'Failed',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-200'
    },
    'Failed': {
      label: 'Failed',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-200'
    },
    // Payment Type statuses
    'membership fee': {
      label: 'Membership Fee',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-200'
    },
    'Membership Fee': {
      label: 'Membership Fee',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-200'
    },
    'personal training': {
      label: 'Personal Training',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
      borderColor: 'border-purple-200'
    },
    'Personal Training': {
      label: 'Personal Training',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
      borderColor: 'border-purple-200'
    },
    'equipment rental': {
      label: 'Equipment Rental',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-200'
    },
    'Equipment Rental': {
      label: 'Equipment Rental',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-200'
    },
    'class fee': {
      label: 'Class Fee',
      bgColor: 'bg-pink-100',
      textColor: 'text-pink-800',
      borderColor: 'border-pink-200'
    },
    'Class Fee': {
      label: 'Class Fee',
      bgColor: 'bg-pink-100',
      textColor: 'text-pink-800',
      borderColor: 'border-pink-200'
    },
    'other': {
      label: 'Other',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-200'
    },
    'Other': {
      label: 'Other',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-200'
    },
    // Variant-based configurations
    success: {
      label: status || 'Success',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200'
    },
    warning: {
      label: status || 'Warning',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200'
    },
    error: {
      label: status || 'Error',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-200'
    },
    // Gray for unknown statuses
    default: {
      label: status || 'Unknown',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-200'
    }
  };

  // Configuration selection for status
  // Try variant first, then status, then default
  const config = (variant && statusConfig[variant]) || 
                 statusConfig[status] || 
                 statusConfig[status?.toLowerCase()] ||
                 statusConfig.default;
  
  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
      ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;