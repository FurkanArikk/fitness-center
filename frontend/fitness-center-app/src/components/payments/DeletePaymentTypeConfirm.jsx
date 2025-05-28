import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '../common/Button';

const DeletePaymentTypeConfirm = ({ isOpen, onClose, onConfirm, paymentType, isLoading }) => {
  if (!isOpen || !paymentType) return null;

  const handleConfirm = () => {
    onConfirm(paymentType.payment_type_id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Payment Type
              </h3>
              <p className="text-sm text-gray-600">
                This action cannot be undone
              </p>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-700">
              Are you sure you want to delete the payment type{' '}
              <span className="font-semibold">"{paymentType.type_name}"</span>?
            </p>
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">
                <strong>Warning:</strong> This will permanently delete the payment type. 
                Any existing payments using this type will still retain their data, 
                but this type won't be available for new payments.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirm}
              isLoading={isLoading}
              disabled={isLoading}
            >
              Delete Payment Type
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeletePaymentTypeConfirm;
