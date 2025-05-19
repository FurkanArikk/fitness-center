import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const DeleteMemberMembershipConfirm = ({ memberMembership, membershipDetails, onClose, onConfirm, isLoading }) => {
  if (!memberMembership) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-amber-600">
            <AlertTriangle size={24} />
            <h3 className="font-medium text-lg">Delete Membership Confirmation</h3>
          </div>
          
          <p>Are you sure you want to delete this membership record?</p>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <p>
              <span className="font-semibold">Membership:</span> {membershipDetails?.membershipName || `ID: ${memberMembership.membershipId}`}
            </p>
            <p>
              <span className="font-semibold">Period:</span> {formatDate(memberMembership.startDate)} - {formatDate(memberMembership.endDate)}
            </p>
            <p>
              <span className="font-semibold">Payment:</span> {memberMembership.paymentStatus.charAt(0).toUpperCase() + memberMembership.paymentStatus.slice(1)}
            </p>
          </div>
          
          <div className="bg-amber-50 p-3 rounded-md text-amber-800 text-sm">
            <p>Warning: This action cannot be undone. This will permanently remove this membership record.</p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Membership'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteMemberMembershipConfirm;
