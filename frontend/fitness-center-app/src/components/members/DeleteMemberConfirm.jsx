import React from 'react';

const DeleteMemberConfirm = ({ member, onClose, onConfirm, isLoading }) => {
  if (!member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h3 className="text-xl font-semibold mb-4">Delete Member</h3>
        <p className="mb-6">
          Are you sure you want to delete <span className="font-medium">{member.firstName} {member.lastName}</span>?
        </p>
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
            onClick={() => onConfirm(member.id)}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteMemberConfirm;
