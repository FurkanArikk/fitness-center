import React from 'react';
import Button from '../common/Button';
import StatusBadge from '../common/StatusBadge';

const EquipmentCard = ({ equipment }) => {
  if (!equipment) return null;
  
  // Generate maintenance schedule
  const maintenancePercentage = Math.floor(Math.random() * 100);
  const nextMaintenanceDays = 45 + Math.floor(Math.random() * 45);
  const lastMaintenanceDays = Math.floor(Math.random() * 30);
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">{equipment.name}</h3>
          <StatusBadge status={equipment.status || 'Active'} type="equipment" />
        </div>
        <p className="text-sm text-gray-500 mt-1">Category: {equipment.category || 'Unknown'}</p>
      </div>
      <div className="px-4 pb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-3">
          <span>ID: {equipment.equipment_id || 'N/A'}</span>
          <span>Purchased: {equipment.purchase_date ? new Date(equipment.purchase_date).toLocaleDateString() : 'N/A'}</span>
        </div>
        <div className="mb-3">
          <p className="text-sm font-medium mb-1">Maintenance Status</p>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-green-500 rounded-full" 
              style={{ width: `${maintenancePercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span>Last: {lastMaintenanceDays} days ago</span>
            <span>Next: {nextMaintenanceDays} days</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" size="sm" className="flex-1">Details</Button>
          <Button variant="secondary" size="sm" className="flex-1">Maintenance Log</Button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentCard;