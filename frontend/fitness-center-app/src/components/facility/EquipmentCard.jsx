import React from 'react';
import { 
  Wrench,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Calendar,
  Tag
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const EquipmentCard = ({ equipment, onEdit, onDelete, onViewDetails }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'working':
        return 'text-green-600 bg-green-100';
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-100';
      case 'broken':
      case 'out_of_order':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'working':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'maintenance':
        return <Wrench size={16} className="text-yellow-600" />;
      case 'broken':
      case 'out_of_order':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Activity size={16} className="text-gray-600" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'cardio':
        return 'bg-blue-100 text-blue-800';
      case 'strength':
        return 'bg-purple-100 text-purple-800';
      case 'functional':
        return 'bg-green-100 text-green-800';
      case 'free_weights':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {equipment.name}
            </h3>
            {equipment.brand && equipment.model && (
              <div className="text-sm text-gray-500 mb-2">
                {equipment.brand} - {equipment.model}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(equipment.status)}
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(equipment.status)}`}>
              {equipment.status || 'Working'}
            </span>
          </div>
        </div>

        {/* Category */}
        <div className="mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${getCategoryColor(equipment.category)}`}>
            <Tag size={12} className="mr-1" />
            {equipment.category || 'General'}
          </span>
        </div>

        {/* Description */}
        {equipment.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {equipment.description}
          </p>
        )}

        {/* Details */}
        <div className="space-y-2 mb-4">
          {equipment.purchase_date && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar size={14} className="mr-2 text-gray-400" />
              <span>Purchased: {formatDate(equipment.purchase_date)}</span>
            </div>
          )}
          
          {equipment.last_maintenance_date && (
            <div className="flex items-center text-sm text-gray-600">
              <Wrench size={14} className="mr-2 text-gray-400" />
              <span>Last Maintenance: {formatDate(equipment.last_maintenance_date)}</span>
            </div>
          )}
          
          {equipment.next_maintenance_date && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar size={14} className="mr-2 text-yellow-500" />
              <span>Next Maintenance: {formatDate(equipment.next_maintenance_date)}</span>
            </div>
          )}
        </div>

        {/* Maintenance Alert */}
        {equipment.next_maintenance_date && new Date(equipment.next_maintenance_date) <= new Date() && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center text-sm text-yellow-800">
              <AlertTriangle size={14} className="mr-2" />
              <span>Maintenance Due</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            onClick={() => onViewDetails && onViewDetails(equipment)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View Details
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(equipment)}
              className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(equipment)}
              className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentCard;
