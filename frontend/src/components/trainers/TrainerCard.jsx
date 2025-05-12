import React from 'react';
import { Award } from 'lucide-react';
import Button from '../common/Button';
import { formatFullName } from '../../utils/formatters';

const TrainerCard = ({ trainer }) => {
  if (!trainer) return null;
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-4">
          <img 
            src={`/api/placeholder/50/50`} 
            alt={trainer.staff?.first_name || 'Trainer'} 
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h3 className="font-bold text-lg">
              {trainer.staff 
                ? formatFullName(trainer.staff.first_name, trainer.staff.last_name) 
                : `Trainer #${trainer.id}`}
            </h3>
            <p className="text-sm text-gray-500">{trainer.specialization}</p>
            <div className="flex items-center mt-1 text-yellow-500">
              <span className="mr-1">{trainer.rating}</span>
              <Award size={16} />
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <p className="text-sm text-gray-600 mb-4">
          <strong>Certification:</strong> {trainer.certification}<br />
          <strong>Experience:</strong> {trainer.experience} years
        </p>
        <div className="flex gap-2">
          <Button variant="primary" size="sm" className="flex-1">Profile</Button>
          <Button variant="secondary" size="sm" className="flex-1">Classes</Button>
        </div>
      </div>
    </div>
  );
};

export default TrainerCard;