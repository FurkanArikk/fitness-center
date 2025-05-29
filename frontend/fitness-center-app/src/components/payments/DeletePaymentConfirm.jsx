import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import Button from '../common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';

const DeletePaymentConfirm = ({ isOpen, onClose, onConfirm, payment, isLoading }) => {
  if (!isOpen || !payment) return null;

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
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-pink-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Payment</h3>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>
          <button 
            className="p-2 hover:bg-white hover:bg-opacity-50 rounded-full transition-colors"
            onClick={onClose}
            disabled={isLoading}
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this payment record?
            </p>
            
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Payment ID:</span>
                <span className="text-sm font-semibold text-gray-900">#{payment.payment_id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Member ID:</span>
                <span className="text-sm font-semibold text-gray-900">#{payment.member_id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Amount:</span>
                <span className="text-sm font-semibold text-green-600">{formatCurrency(payment.amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Date:</span>
                <span className="text-sm font-semibold text-gray-900">{formatDate(payment.payment_date)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Description:</span>
                <span className="text-sm font-semibold text-gray-900">{payment.description}</span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle size={16} className="text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm text-red-800 font-medium">Warning!</p>
                  <p className="text-sm text-red-700">
                    This action cannot be undone. The payment record will be permanently deleted from the system.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
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
              Delete Payment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeletePaymentConfirm;
