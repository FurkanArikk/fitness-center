import React from 'react';
import { Edit, CheckCircle, XCircle } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const EquipmentList = ({ equipment = [] }) => {
  if (!equipment.length) {
    return (
      <div className="py-4 text-center text-gray-500">
        No equipment found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b">
            <th className="py-2 px-4 text-left">ID</th>
            <th className="py-2 px-4 text-left">Name</th>
            <th className="py-2 px-4 text-left">Category</th>
            <th className="py-2 px-4 text-left">Status</th>
            <th className="py-2 px-4 text-left">Location</th>
            <th className="py-2 px-4 text-left">Next Maintenance</th>
            <th className="py-2 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {equipment.slice(0, 5).map((item, index) => (
            <tr key={item.equipment_id || index} className="border-b hover:bg-gray-50">
              <td className="py-2 px-4">{item.equipment_id || `EQ-${100 + index}`}</td>
              <td className="py-2 px-4">{item.name}</td>
              <td className="py-2 px-4">{item.category || (index < 4 ? 'Cardio' : 'Strength')}</td>
              <td className="py-2 px-4">
                <StatusBadge 
                  status={item.status || (index === 2 ? 'Maintenance' : 'Active')} 
                  type="equipment" 
                />
              </td>
              <td className="py-2 px-4">{item.location || 'Main Floor'}</td>
              <td className="py-2 px-4">
                {index === 2 ? 'In Progress' : `${15 + (index * 10)} days`}
              </td>
              <td className="py-2 px-4">
                <div className="flex space-x-2">
                  <button className="p-1 text-blue-500 hover:bg-blue-50 rounded">
                    <Edit size={16} />
                  </button>
                  <button className="p-1 text-green-500 hover:bg-green-50 rounded">
                    <CheckCircle size={16} />
                  </button>
                  <button className="p-1 text-red-500 hover:bg-red-50 rounded">
                    <XCircle size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EquipmentList;