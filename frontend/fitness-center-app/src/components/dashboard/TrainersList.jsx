import React from 'react';
import { Award } from 'lucide-react';
import Card from '../common/Card';

const TrainersList = ({ trainers = [] }) => {
  return (
    <Card title="Popular Trainers">
      {trainers.length === 0 ? (
        <p className="text-center text-gray-500 py-4">No trainers available</p>
      ) : (
        trainers.map((trainer) => (
          <div key={trainer.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg mb-2">
            <img src={`/api/placeholder/50/50`} alt={`${trainer.staff?.first_name || 'Trainer'}`} className="w-12 h-12 rounded-full" />
            <div className="flex-1">
              <h4 className="font-medium">{trainer.staff ? `${trainer.staff.first_name} ${trainer.staff.last_name}` : `Trainer #${trainer.id}`}</h4>
              <p className="text-sm text-gray-500">{trainer.specialization}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center text-yellow-500">
                <span className="font-medium mr-1">{trainer.rating}</span>
                <Award size={16} />
              </div>
              <p className="text-xs text-gray-500">{trainer.experience} years exp.</p>
            </div>
          </div>
        ))
      )}
    </Card>
  );
};

export default TrainersList;