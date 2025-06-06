import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '../common/Button';

const DeleteFacilityConfirm = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  facility, 
  isLoading = false 
}) => {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error deleting facility:', error);
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen || !facility) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)'
      }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            Delete Facility
          </h3>

          {/* Message */}
          <p className="text-sm text-gray-600 text-center mb-6">
            Are you sure you want to delete "<span className="font-medium text-gray-900">{facility.name}</span>"? 
            This action cannot be undone.
          </p>

          {/* Facility Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-gray-900">{facility.name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium text-gray-900 capitalize">{facility.facility_type || 'N/A'}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-gray-900 capitalize">{facility.status || 'N/A'}</span>
              </div>
              {facility.address && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-medium text-gray-900">{facility.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Deleting...' : 'Delete Facility'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteFacilityConfirm;
