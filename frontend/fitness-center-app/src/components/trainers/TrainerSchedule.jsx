import React from 'react';
import { formatFullName } from '../../utils/formatters';

const TrainerSchedule = ({ trainers = [] }) => {
  if (!trainers.length) {
    return (
      <div className="py-4 text-center text-gray-500">
        No trainer schedules available
      </div>
    );
  }

  // Mock schedule data - in a real app this would come from the API
  const getTrainerSchedule = (trainerId) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const classes = [
      { name: 'Yoga', time: '09:00 - 10:00', color: 'bg-blue-100 text-blue-800' },
      { name: 'Pilates', time: '11:00 - 12:00', color: 'bg-green-100 text-green-800' },
      { name: 'HIIT', time: '17:00 - 18:00', color: 'bg-yellow-100 text-yellow-800' },
      { name: 'Spinning', time: '18:00 - 19:00', color: 'bg-purple-100 text-purple-800' }
    ];
    
    return days.reduce((acc, day) => {
      acc[day] = classes[Math.floor(Math.random() * classes.length)];
      return acc;
    }, {});
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b">
            <th className="py-2 px-4 text-left">Trainer</th>
            <th className="py-2 px-4 text-left">Monday</th>
            <th className="py-2 px-4 text-left">Tuesday</th>
            <th className="py-2 px-4 text-left">Wednesday</th>
            <th className="py-2 px-4 text-left">Thursday</th>
            <th className="py-2 px-4 text-left">Friday</th>
          </tr>
        </thead>
        <tbody>
          {trainers.map((trainer) => {
            const schedule = getTrainerSchedule(trainer.id);
            return (
              <tr key={trainer.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4 font-medium">
                  {trainer.staff 
                    ? formatFullName(trainer.staff.first_name, trainer.staff.last_name) 
                    : `Trainer #${trainer.id}`}
                </td>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                  <td key={day} className="py-2 px-4 text-sm">
                    <div className={`p-1 ${schedule[day].color} rounded mb-1`}>
                      {schedule[day].name} ({schedule[day].time})
                    </div>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TrainerSchedule;