import React from 'react';
import { AlertTriangle } from 'lucide-react';

const DeleteMembershipConfirm = ({ membership, onClose, onConfirm, isLoading }) => {
  if (!membership) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-amber-600">
            <AlertTriangle size={24} />
            <h3 className="font-medium text-lg">Delete Membership Type</h3>
          </div>
          
          <p>Are you sure you want to delete this membership type?</p>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <p>
              <span className="font-semibold">Name:</span> {membership.membershipName}
            </p>
            <p>
              <span className="font-semibold">Duration:</span> {membership.duration} month{membership.duration !== 1 ? 's' : ''}
            </p>
            <p>
              <span className="font-semibold">Price:</span> ${membership.price}
            </p>
            <p>
              <span className="font-semibold">Status:</span> {membership.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
          
          <div className="bg-amber-50 p-3 rounded-md text-amber-800 text-sm">
            <p className="font-medium mb-1">Warning:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>This action cannot be undone.</li>
              <li>All membership type data will be permanently removed.</li>
              <li>Members who are currently using this membership type may be affected.</li>
            </ul>
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

export default DeleteMembershipConfirm;
