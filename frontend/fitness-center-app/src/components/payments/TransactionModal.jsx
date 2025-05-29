import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Save, Loader, CheckCircle, CreditCard } from 'lucide-react';
import Button from '../common/Button';

const TransactionModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  transaction = null, 
  payments = [], 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    payment_id: '',
    transaction_date: '',
    transaction_status: 'pending',
    transaction_reference: '',
    processor_type: 'stripe'
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processSuccess, setProcessSuccess] = useState(false);

  useEffect(() => {
    if (transaction) {
      // Edit mode
      setFormData({
        payment_id: transaction.payment_id || '',
        transaction_date: transaction.transaction_date ? 
          new Date(transaction.transaction_date).toISOString().slice(0, 16) : '',
        transaction_status: transaction.transaction_status || 'pending',
        transaction_reference: transaction.transaction_reference || '',
        processor_type: transaction.processor_type || 'stripe'
      });
    } else {
      // Add mode
      setFormData({
        payment_id: '',
        transaction_date: new Date().toISOString().slice(0, 16),
        transaction_status: 'pending',
        transaction_reference: '',
        processor_type: 'stripe'
      });
    }
    setErrors({});
    setProcessing(false);
    setProcessSuccess(false);
  }, [transaction, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.payment_id) {
      newErrors.payment_id = 'Payment selection is required';
    }

    if (!formData.transaction_date) {
      newErrors.transaction_date = 'Transaction date is required';
    }

    if (!formData.transaction_status) {
      newErrors.transaction_status = 'Transaction status is required';
    }

    if (!formData.transaction_reference.trim()) {
      newErrors.transaction_reference = 'Reference number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateGatewayResponse = (processorType, status = 'succeeded') => {
    const authCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const transactionId = Math.random().toString(36).substring(2, 15);
    
    const responses = {
      stripe: {
        processor: 'Stripe',
        status: status,
        transaction_id: `pi_${transactionId}`,
        auth_code: authCode,
        amount_captured: formData.payment_id ? 'auto' : 0,
        currency: 'usd',
        created: Math.floor(Date.now() / 1000),
        description: `Payment for transaction ${formData.transaction_reference}`,
        metadata: {
          integration_check: 'accept_a_payment'
        }
      },
      paypal: {
        processor: 'PayPal',
        status: status,
        transaction_id: `PAY-${transactionId.toUpperCase()}`,
        auth_code: authCode,
        payer_id: `PAYER${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        payment_method: 'paypal',
        currency_code: 'USD',
        create_time: new Date().toISOString(),
        intent: 'sale'
      },
      visa: {
        processor: 'Visa',
        status: status,
        transaction_id: `VSA${transactionId.toUpperCase()}`,
        auth_code: authCode,
        card_type: 'credit',
        last_four: Math.floor(1000 + Math.random() * 9000).toString(),
        exp_month: Math.floor(1 + Math.random() * 12),
        exp_year: new Date().getFullYear() + Math.floor(1 + Math.random() * 5),
        avs_result: 'Y',
        cvv_result: 'M'
      },
      mastercard: {
        processor: 'Mastercard',
        status: status,
        transaction_id: `MC${transactionId.toUpperCase()}`,
        auth_code: authCode,
        card_type: 'credit',
        last_four: Math.floor(1000 + Math.random() * 9000).toString(),
        exp_month: Math.floor(1 + Math.random() * 12),
        exp_year: new Date().getFullYear() + Math.floor(1 + Math.random() * 5),
        network_response_code: '00',
        processor_response_code: 'A'
      },
      amex: {
        processor: 'American Express',
        status: status,
        transaction_id: `AMEX${transactionId.toUpperCase()}`,
        auth_code: authCode,
        card_type: 'credit',
        last_four: Math.floor(1000 + Math.random() * 9000).toString(),
        exp_month: Math.floor(1 + Math.random() * 12),
        exp_year: new Date().getFullYear() + Math.floor(1 + Math.random() * 5),
        service_code: '101',
        approval_code: authCode
      },
      bank_transfer: {
        processor: 'Bank Transfer',
        status: status,
        transaction_id: `BT${transactionId.toUpperCase()}`,
        auth_code: authCode,
        transfer_type: 'ach',
        routing_number: '021000021',
        account_type: 'checking',
        settlement_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      cash: {
        processor: 'Cash',
        status: status,
        transaction_id: `CASH${transactionId.toUpperCase()}`,
        auth_code: authCode,
        payment_method: 'cash',
        received_by: 'Front Desk',
        receipt_number: `RC${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        timestamp: new Date().toISOString()
      },
      other: {
        processor: 'Other',
        status: status,
        transaction_id: `OTH${transactionId.toUpperCase()}`,
        auth_code: authCode,
        payment_method: 'manual',
        processed_by: 'Administrator',
        notes: 'Manual payment processing'
      }
    };
    
    return JSON.stringify(responses[processorType] || responses.other);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setProcessing(true);
    setProcessSuccess(false);
    
    try {
      // Payment processing animasyonu - 2 saniye bekle
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Gateway response oluştur
      const gatewayResponse = generateGatewayResponse(formData.processor_type, 'succeeded');
      
      const submitData = {
        ...formData,
        transaction_date: new Date(formData.transaction_date).toISOString(),
        payment_id: parseInt(formData.payment_id),
        gateway_response: gatewayResponse
      };

      setProcessing(false);
      setProcessSuccess(true);
      
      // Success animasyonu göster
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      setProcessing(false);
      setProcessSuccess(false);
      setErrors({ submit: 'An error occurred while saving the transaction. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto"
      onClick={handleBackdropClick}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)'
      }}
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-black opacity-25"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div 
          className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 relative z-[10000]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {transaction ? 'Edit Transaction' : 'Create New Transaction'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X size={24} />
            </button>
          </div>

          {/* Error message */}
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-1 text-sm text-red-700">{errors.submit}</div>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment <span className="text-red-500">*</span>
              </label>
              <select
                name="payment_id"
                value={formData.payment_id}
                onChange={handleChange}
                className={`w-full border rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.payment_id ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={!!transaction} // Payment ID değiştirilemez edit modunda
              >
                <option value="">Select payment</option>
                {payments.map(payment => (
                  <option key={payment.payment_id} value={payment.payment_id}>
                    #{payment.payment_id} - {payment.member_name || `Member #${payment.member_id}`} - ${payment.amount}
                  </option>
                ))}
              </select>
              {errors.payment_id && (
                <p className="mt-1 text-sm text-red-600">{errors.payment_id}</p>
              )}
            </div>

            {/* Transaction Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Date <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="transaction_date"
                value={formData.transaction_date}
                onChange={handleChange}
                className={`w-full border rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.transaction_date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.transaction_date && (
                <p className="mt-1 text-sm text-red-600">{errors.transaction_date}</p>
              )}
            </div>

            {/* Transaction Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Status <span className="text-red-500">*</span>
              </label>
              <select
                name="transaction_status"
                value={formData.transaction_status}
                onChange={handleChange}
                className={`w-full border rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.transaction_status ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="pending">Pending</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
              {errors.transaction_status && (
                <p className="mt-1 text-sm text-red-600">{errors.transaction_status}</p>
              )}
            </div>

            {/* Transaction Reference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="transaction_reference"
                value={formData.transaction_reference}
                onChange={handleChange}
                placeholder="e.g. TXN123456789"
                className={`w-full border rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.transaction_reference ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.transaction_reference && (
                <p className="mt-1 text-sm text-red-600">{errors.transaction_reference}</p>
              )}
            </div>

            {/* Processor Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CreditCard size={16} className="inline mr-1" />
                Payment Processor <span className="text-red-500">*</span>
              </label>
              <select
                name="processor_type"
                value={formData.processor_type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="stripe">💳 Stripe</option>
                <option value="paypal">🅿️ PayPal</option>
                <option value="visa">💳 Visa</option>
                <option value="mastercard">💳 Mastercard</option>
                <option value="amex">💳 American Express</option>
                <option value="bank_transfer">🏦 Bank Transfer</option>
                <option value="cash">💵 Cash</option>
                <option value="other">🔧 Other</option>
              </select>
              {errors.processor_type && (
                <p className="mt-1 text-sm text-red-600">{errors.processor_type}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Gateway response will be generated automatically</p>
            </div>

            {/* Processing Animation */}
            {(processing || processSuccess) && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-3">
                  {processing && (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="text-blue-700 font-medium">Processing payment...</span>
                    </>
                  )}
                  {processSuccess && !processing && (
                    <>
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <span className="text-green-700 font-medium">Payment processed successfully!</span>
                    </>
                  )}
                </div>
                {processing && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
                  </div>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={saving || processing}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={saving || processing}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : processSuccess ? (
                  <>
                    <CheckCircle size={16} />
                    Success!
                  </>
                ) : saving ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {transaction ? 'Update' : 'Process Payment'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
