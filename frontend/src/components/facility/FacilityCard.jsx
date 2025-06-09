import React from 'react';
import { 
  MapPin, 
  Users, 
  Phone, 
  Clock,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const FacilityCard = ({ facility, onEdit, onDelete, onViewDetails }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-yellow-600 bg-yellow-100';
      case 'maintenance':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'inactive':
        return <AlertTriangle size={16} className="text-yellow-600" />;
      case 'maintenance':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Activity size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {facility.name}
            </h3>
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <MapPin size={14} className="mr-1" />
              {facility.address || 'No address provided'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(facility.status)}
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(facility.status)}`}>
              {facility.status || 'Active'}
            </span>
          </div>
        </div>

        {/* Facility Type */}
        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
            {facility.facility_type || 'General'}
          </span>
        </div>

        {/* Description */}
        {facility.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {facility.description}
          </p>
        )}

        {/* Details */}
        <div className="space-y-2 mb-4">
          {facility.capacity && (
            <div className="flex items-center text-sm text-gray-600">
              <Users size={14} className="mr-2 text-gray-400" />
              <span>Capacity: {facility.capacity} people</span>
            </div>
          )}
          
          {facility.phone_number && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone size={14} className="mr-2 text-gray-400" />
              <span>{facility.phone_number}</span>
            </div>
          )}
          
          {facility.operating_hours && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock size={14} className="mr-2 text-gray-400" />
              <span>{facility.operating_hours}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            onClick={() => onViewDetails && onViewDetails(facility)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View Details
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(facility)}
              className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(facility)}
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

export default FacilityCard;
