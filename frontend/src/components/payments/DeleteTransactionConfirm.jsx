import React from 'react';

const DeleteTransactionConfirm = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  transaction,
  loading = false 
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(transaction.transaction_id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Delete Transaction
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            
            {transaction && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                <div className="text-sm text-gray-600">
                  <p><span className="font-medium">Transaction ID:</span> {transaction.transaction_id}</p>
                  <p><span className="font-medium">Reference:</span> {transaction.transaction_reference || 'N/A'}</p>
                  <p><span className="font-medium">Date:</span> {new Date(transaction.transaction_date).toLocaleDateString('en-US')}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                      transaction.transaction_status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : transaction.transaction_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : transaction.transaction_status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {transaction.transaction_status === 'completed' ? 'Completed' :
                       transaction.transaction_status === 'pending' ? 'Pending' :
                       transaction.transaction_status === 'failed' ? 'Failed' :
                       transaction.transaction_status === 'cancelled' ? 'Cancelled' :
                       transaction.transaction_status}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </div>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteTransactionConfirm;
