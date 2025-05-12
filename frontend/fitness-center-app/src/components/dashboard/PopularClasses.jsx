import React from 'react';
import Card from '../common/Card';

const PopularClasses = () => {
  const popularClasses = [
    { name: 'Yoga', attendance: 85, color: 'bg-blue-500' },
    { name: 'CrossFit', attendance: 78, color: 'bg-green-500' },
    { name: 'Spinning', attendance: 72, color: 'bg-yellow-500' },
    { name: 'Pilates', attendance: 65, color: 'bg-purple-500' },
    { name: 'Zumba', attendance: 58, color: 'bg-pink-500' },
  ];

  return (
    <Card title="Popular Classes">
      {popularClasses.map((cls, index) => (
        <div key={index} className="mb-4 last:mb-0">
          <div className="flex justify-between items-center mb-1">
            <span>{cls.name}</span>
            <span className="text-sm text-gray-500">{cls.attendance}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`${cls.color} h-2.5 rounded-full`}
              style={{ width: `${cls.attendance}%` }}
            ></div>
          </div>
        </div>
      ))}
    </Card>
  );
};

export default PopularClasses;