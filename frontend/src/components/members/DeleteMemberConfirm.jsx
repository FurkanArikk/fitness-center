import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const DeleteMemberConfirm = ({ member, onClose, onConfirm, isLoading }) => {
  if (!member) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      backgroundColor: 'rgba(0, 0, 0, 0.1)'
    }}>
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-amber-600">
            <AlertTriangle size={24} />
            <h3 className="font-medium text-lg">Delete Member Confirmation</h3>
          </div>
          
          <p>Are you sure you want to delete this member?</p>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <p>
              <span className="font-semibold">Name:</span> {member.firstName} {member.lastName}
            </p>
            {member.email && (
              <p>
                <span className="font-semibold">Email:</span> {member.email}
              </p>
            )}
            {member.phone && (
              <p>
                <span className="font-semibold">Phone:</span> {member.phone}
              </p>
            )}
            <p>
              <span className="font-semibold">Join Date:</span> {formatDate(member.joinDate)}
            </p>
            {member.activeMembership && (
              <p>
                <span className="font-semibold">Active Membership:</span> {member.activeMembership.membershipName}
              </p>
            )}
          </div>
          
          <div className="bg-amber-50 p-3 rounded-md text-amber-800 text-sm">
            <p className="font-medium mb-1">Warning:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>This action cannot be undone.</li>
              <li>All member data will be permanently removed from the system.</li>
              <li>All membership relationships for this member will also be deleted.</li>
              {member.activeMembership && (
                <li>Active membership information will also be deleted.</li>
              )}
              <li>Any attendance records and assessment data will be lost.</li>
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
              onClick={() => onConfirm(member.id)}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Member'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteMemberConfirm;
