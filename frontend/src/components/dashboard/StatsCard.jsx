import React from 'react';
import { Users } from 'lucide-react';

const StatsCard = ({ title, value, change, color = 'bg-blue-500', icon = <Users size={20} /> }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`${color} h-10 w-10 rounded-full flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      {change && (
        <p className={`text-xs mt-2 ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
          {change} vs. last month
        </p>
      )}
    </div>
  );
};

export default StatsCard;