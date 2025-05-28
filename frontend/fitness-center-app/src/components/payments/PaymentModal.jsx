import React, { useState, useEffect } from 'react';
import { X, CreditCard, Banknote, Smartphone } from 'lucide-react';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatters';

const PaymentModal = ({ isOpen, onClose, onSave, payment = null, members = [], isLoading }) => {
  const [formData, setFormData] = useState({
    member_id: '',
    amount: '',
    payment_method: 'credit_card',
    payment_status: 'completed',
    description: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_type_id: 1 // Default payment type
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (payment) {
      setFormData({
        member_id: payment.member_id || '',
        amount: payment.amount || '',
        payment_method: payment.payment_method || 'credit_card',
        payment_status: payment.payment_status || 'completed',
        description: payment.description || '',
        payment_date: payment.payment_date ? payment.payment_date.split('T')[0] : new Date().toISOString().split('T')[0],
        payment_type_id: payment.payment_type_id || 1
      });
    } else {
      setFormData({
        member_id: '',
        amount: '',
        payment_method: 'credit_card',
        payment_status: 'completed',
        description: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_type_id: 1
      });
    }
    setErrors({});
  }, [payment, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    // Only validate member_id for new payments
    if (!payment && !formData.member_id) {
      newErrors.member_id = 'Member selection is required';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Format the data according to backend expectations
    const paymentData = {
      member_id: parseInt(formData.member_id),
      amount: parseFloat(formData.amount),
      payment_method: formData.payment_method,
      payment_status: formData.payment_status,
      description: formData.description.trim(),
      payment_date: new Date(formData.payment_date + 'T00:00:00.000Z').toISOString(),
      payment_type_id: parseInt(formData.payment_type_id)
    };

    console.log('Sending payment data:', paymentData); // Debug log

    onSave(paymentData);
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

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard size={16} className="text-blue-500" />;
      case 'cash':
        return <Banknote size={16} className="text-green-500" />;
      case 'bank_transfer':
        return <Smartphone size={16} className="text-purple-500" />;
      default:
        return <CreditCard size={16} className="text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold text-lg">
            {payment ? 'Edit Payment' : 'Add New Payment'}
          </h3>
          <button 
            className="p-1 hover:bg-gray-100 rounded-full"
            onClick={onClose}
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Member Selection / Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Member {!payment && '*'}
            </label>
            {payment ? (
              // Display selected member when editing
              <div className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
                <span className="text-gray-700">
                  {(() => {
                    const selectedMember = members.find(m => m.id === formData.member_id || m.memberId === formData.member_id);
                    if (selectedMember) {
                      const id = selectedMember.id || selectedMember.memberId;
                      const firstName = selectedMember.firstName || selectedMember.first_name || '';
                      const lastName = selectedMember.lastName || selectedMember.last_name || '';
                      return `${id} - ${firstName} ${lastName}`;
                    }
                    return 'Member not found';
                  })()}
                </span>
              </div>
            ) : (
              // Show dropdown for new payments
              <>
                <select
                  name="member_id"
                  value={formData.member_id}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.member_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select a member</option>
                  {members.map(member => {
                    const id = member.id || member.memberId;
                    const firstName = member.firstName || member.first_name || '';
                    const lastName = member.lastName || member.last_name || '';
                    return (
                      <option key={id} value={id}>
                        {id} - {firstName} {lastName}
                      </option>
                    );
                  })}
                </select>
                {errors.member_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.member_id}</p>
                )}
              </>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₺) *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
              required
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <div className="space-y-2">
              {[
                { value: 'credit_card', label: 'Credit Card', icon: <CreditCard size={16} /> },
                { value: 'cash', label: 'Cash', icon: <Banknote size={16} /> },
                { value: 'bank_transfer', label: 'Bank Transfer', icon: <Smartphone size={16} /> }
              ].map(method => (
                <label key={method.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="payment_method"
                    value={method.value}
                    checked={formData.payment_method === method.value}
                    onChange={handleChange}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="flex items-center space-x-2">
                    {method.icon}
                    <span>{method.label}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Payment description"
              required
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date
            </label>
            <input
              type="date"
              name="payment_date"
              value={formData.payment_date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Payment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Type
            </label>
            <select
              name="payment_type_id"
              value={formData.payment_type_id}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value={1}>Membership Fee</option>
              <option value={2}>Personal Training</option>
              <option value={3}>Equipment Rental</option>
              <option value={4}>Class Fee</option>
              <option value={5}>Other</option>
            </select>
          </div>

          {/* Summary */}
          {formData.amount && (
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Summary</h4>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Amount:</span>
                <span className="font-semibold text-lg">{formatCurrency(formData.amount)}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-600">Method:</span>
                <div className="flex items-center space-x-1">
                  {getPaymentMethodIcon(formData.payment_method)}
                  <span className="text-sm">
                    {formData.payment_method === 'credit_card' && 'Credit Card'}
                    {formData.payment_method === 'cash' && 'Cash'}
                    {formData.payment_method === 'bank_transfer' && 'Bank Transfer'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
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
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {payment ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
