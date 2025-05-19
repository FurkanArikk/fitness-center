import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { AlertTriangle } from 'lucide-react';

const DeleteMembershipConfirm = ({ membership, onClose, onConfirm, isLoading }) => {
  if (!membership) return null;

  return (
    <Modal
      title="Confirm Deletion"
      onClose={onClose}
      size="small"
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-3 text-amber-600">
          <AlertTriangle size={24} />
          <h3 className="font-medium">Are you sure you want to delete this membership plan?</h3>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <p>
            <span className="font-semibold">Name:</span> {membership.name}
          </p>
          <p>
            <span className="font-semibold">Duration:</span> {membership.durationMonths} months
          </p>
          <p>
            <span className="font-semibold">Price:</span> ₺{membership.price}
          </p>
        </div>
        
        <div className="bg-amber-50 p-3 rounded-md text-amber-800 text-sm">
          <p>Warning: This action cannot be undone. Members who are currently using this membership plan won't be affected.</p>
        </div>
        
        <div className="flex justify-end space-x-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => onConfirm(membership.id)}
            isLoading={isLoading}
          >
            Delete Membership
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteMembershipConfirm;
