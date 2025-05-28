import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from '../common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';

const DeletePaymentConfirm = ({ isOpen, onClose, onConfirm, payment, isLoading }) => {
  if (!isOpen || !payment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center space-x-2">
            <AlertTriangle size={20} className="text-red-500" />
            <h3 className="font-semibold text-lg">Delete Payment</h3>
          </div>
          <button 
            className="p-1 hover:bg-gray-100 rounded-full"
            onClick={onClose}
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <p className="text-gray-700 mb-3">
              Are you sure you want to delete this payment record?
            </p>
            
            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payment ID:</span>
                <span className="text-sm font-medium">#{payment.payment_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Member ID:</span>
                <span className="text-sm font-medium">#{payment.member_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="text-sm font-medium">{formatCurrency(payment.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Date:</span>
                <span className="text-sm font-medium">{formatDate(payment.payment_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Description:</span>
                <span className="text-sm font-medium">{payment.description}</span>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-800 font-medium">Warning!</p>
                <p className="text-sm text-red-700">
                  This action cannot be undone. The payment record will be permanently deleted.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => onConfirm(payment.payment_id)}
              isLoading={isLoading}
              disabled={isLoading}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeletePaymentConfirm;
