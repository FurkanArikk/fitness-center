import React from 'react';
import Card from '../common/Card';
import { formatTime } from '../../utils/formatters';

const ClassCalendar = ({ schedules = [] }) => {
  // Group schedules by day of the week
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const schedulesByDay = days.reduce((acc, day) => {
    acc[day] = schedules.filter(
      schedule => schedule.day_of_week?.toLowerCase() === day.toLowerCase()
    );
    return acc;
  }, {});
  
  // Set colors for different class types
  const getClassColor = (className) => {
    const colors = {
      'yoga': 'bg-blue-100 text-blue-800',
      'pilates': 'bg-green-100 text-green-800',
      'spinning': 'bg-purple-100 text-purple-800',
      'hiit': 'bg-yellow-100 text-yellow-800',
      'zumba': 'bg-pink-100 text-pink-800',
      'crossfit': 'bg-red-100 text-red-800',
    };
    
    const key = Object.keys(colors).find(k => 
      className?.toLowerCase().includes(k)
    );
    
    return colors[key] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card title="Class Schedule">
      <div className="grid grid-cols-7 gap-4">
        {days.map((day, i) => (
          <div key={i} className="text-center">
            <div className="font-medium mb-2">{day}</div>
            {schedulesByDay[day].length === 0 ? (
              <div className="p-2 bg-gray-100 text-gray-500 rounded-md">
                No classes
              </div>
            ) : (
              schedulesByDay[day].map((schedule, index) => (
                <div 
                  key={index} 
                  className={`p-2 ${getClassColor(schedule.class_name)} rounded-md mb-2`}
                >
                  <div className="font-medium">{schedule.class_name}</div>
                  <div className="text-xs">{formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}</div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ClassCalendar;