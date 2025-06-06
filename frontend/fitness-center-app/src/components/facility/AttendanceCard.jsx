import React from 'react';
import { Clock, MapPin, User, Edit, Trash2, LogOut } from 'lucide-react';
import Button from '../common/Button';

const AttendanceCard = ({ 
  attendance, 
  onEdit, 
  onDelete, 
  onCheckOut, 
  showActions = true 
}) => {
  if (!attendance) return null;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return dateString;
    }
  };

  // Calculate duration if both check-in and check-out times exist
  const calculateDuration = () => {
    if (!attendance.check_in_time || !attendance.check_out_time) return null;
    
    try {
      const checkIn = new Date(attendance.check_in_time);
      const checkOut = new Date(attendance.check_out_time);
      const diffMs = checkOut - checkIn;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (diffHours > 0) {
        return `${diffHours}s ${diffMinutes}dk`;
      } else {
        return `${diffMinutes}dk`;
      }
    } catch (err) {
      return null;
    }
  };

  const duration = calculateDuration();
  const isActive = attendance.check_in_time && !attendance.check_out_time;

  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 p-4 hover:shadow-md transition-shadow ${
      isActive ? 'border-l-green-500 bg-green-50' : 'border-l-gray-300'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
            <User className={`h-4 w-4 ${isActive ? 'text-green-600' : 'text-gray-600'}`} />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">
              {attendance.member_name || `Üye ID: ${attendance.member_id}`}
            </h4>
            {isActive && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Clock className="h-3 w-3 mr-1" />
                Aktif
              </span>
            )}
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center space-x-1">
            {isActive && onCheckOut && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCheckOut(attendance)}
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(attendance)}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(attendance)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Facility Info */}
      <div className="flex items-center space-x-2 mb-3">
        <MapPin className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-700">
          {attendance.facility_name || `Tesis ID: ${attendance.facility_id}`}
        </span>
      </div>

      {/* Time Information */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Giriş:</span>
          <span className="text-sm text-gray-900">
            {formatDate(attendance.check_in_time)}
          </span>
        </div>
        
        {attendance.check_out_time && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Çıkış:</span>
            <span className="text-sm text-gray-900">
              {formatDate(attendance.check_out_time)}
            </span>
          </div>
        )}
        
        {duration && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Süre:</span>
            <span className="text-sm font-semibold text-blue-600">{duration}</span>
          </div>
        )}
      </div>

      {/* Notes */}
      {attendance.notes && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Not:</span> {attendance.notes}
          </p>
        </div>
      )}

      {/* Status Indicator */}
      {isActive && (
        <div className="mt-3 pt-3 border-t border-green-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-700">Tesiste aktif</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600">Çevrimiçi</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceCard;