import React from 'react';

const StatusBadge = ({ status }) => {
  // Durum metinleri ve renk eşleştirmeleri
  const statusConfig = {
    // Aktif üyeler için yeşil
    active: {
      label: 'Active',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200'
    },
    // Pasif/İnaktif üyeler için kırmızı
    de_active: {
      label: 'Inactive',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-200'
    },
    // Beklemedeki üyeler için turuncu
    hold_on: {
      label: 'On Hold',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-200'
    },
    // Bilinmeyen durumlar için gri
    default: {
      label: 'Unknown',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-200'
    }
  };

  // Durum için yapılandırma seçimi
  const config = statusConfig[status] || statusConfig.default;
  
  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
      ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;