import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import Card from '../common/Card';

const ClassManagement = ({ classes = [] }) => {
  if (!classes.length) {
    return (
      <Card title="Class Management">
        <p className="text-center text-gray-500 py-4">No classes available</p>
      </Card>
    );
  }

  return (
    <Card title="Class Management">
      <div className="space-y-3">
        {classes.map((classItem) => (
          <div key={classItem.class_id} className="p-3 border rounded-lg hover:bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{classItem.class_name}</p>
                <p className="text-sm text-gray-500">
                  Duration: {classItem.duration} min | Capacity: {classItem.capacity}
                </p>
                {classItem.difficulty && (
                  <p className="text-xs text-gray-500">Level: {classItem.difficulty}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <button className="p-1 text-blue-500 hover:bg-blue-50 rounded">
                  <Edit size={16} />
                </button>
                <button className="p-1 text-red-500 hover:bg-red-50 rounded">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ClassManagement;