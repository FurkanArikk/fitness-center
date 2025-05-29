import React, { useState, useEffect } from 'react';
import { X, CreditCard, Banknote, Smartphone } from 'lucide-react';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatters';
import { memberService } from '../../api';

const PaymentModal = ({ isOpen, onClose, onSave, payment = null, members = [], paymentTypes = [], isLoading }) => {
  const [formData, setFormData] = useState({
    member_id: '',
    amount: '',
    payment_method: 'credit_card',
    payment_status: 'completed',
    description: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_type_id: paymentTypes.length > 0 ? paymentTypes[0].payment_type_id || paymentTypes[0].id || 1 : 1 // Default to first payment type or 1
  });

  const [errors, setErrors] = useState({});
  const [currentMember, setCurrentMember] = useState(null);
  const [loadingMember, setLoadingMember] = useState(false);

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
      
      // Edit modunda spesifik member bilgisini çek
      if (payment.member_id) {
        fetchCurrentMember(payment.member_id);
      }
    } else {
      setFormData({
        member_id: '',
        amount: '',
        payment_method: 'credit_card',
        payment_status: 'completed',
        description: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_type_id: paymentTypes.length > 0 ? paymentTypes[0].payment_type_id || paymentTypes[0].id || 1 : 1
      });
      setCurrentMember(null);
    }
    setErrors({});
  }, [payment, isOpen]);

  // Spesifik member bilgisini getiren fonksiyon
  const fetchCurrentMember = async (memberId) => {
    setLoadingMember(true);
    try {
      console.log('[PaymentModal] Fetching member details for ID:', memberId);
      const memberData = await memberService.getMember(memberId);
      console.log('[PaymentModal] Member data received:', memberData);
      setCurrentMember(memberData);
    } catch (error) {
      console.error('[PaymentModal] Error fetching member:', error);
      setCurrentMember(null);
    } finally {
      setLoadingMember(false);
    }
  };

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
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)'
      }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {payment ? 'Edit Payment' : 'Add New Payment'}
              </h3>
              <p className="text-sm text-gray-600">
                {payment ? 'Update payment information' : 'Create a new payment record'}
              </p>
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
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Member Selection / Display */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Member {!payment && '*'}
            </label>
            {payment ? (
              // Display selected member when editing
              <div className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                {loadingMember ? (
                  <span className="text-gray-500">Loading member info...</span>
                ) : currentMember ? (
                  <span className="text-gray-700 font-medium">
                    {(() => {
                      const id = currentMember.id || currentMember.memberId;
                      const firstName = currentMember.firstName || currentMember.first_name || '';
                      const lastName = currentMember.lastName || currentMember.last_name || '';
                      return `${id} - ${firstName} ${lastName}`;
                    })()}
                  </span>
                ) : (
                  <span className="text-red-500">Member information could not be loaded</span>
                )}
              </div>
            ) : (
              // Show dropdown for new payments
              <>
                <select
                  name="member_id"
                  value={formData.member_id}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
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
                  <p className="mt-2 text-sm text-red-600">{errors.member_id}</p>
                )}
              </>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₺) *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
              required
            />
            {errors.amount && (
              <p className="mt-2 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="space-y-3">
              {[
                { value: 'credit_card', label: 'Credit Card', icon: <CreditCard size={16} /> },
                { value: 'cash', label: 'Cash', icon: <Banknote size={16} /> },
                { value: 'bank_transfer', label: 'Bank Transfer', icon: <Smartphone size={16} /> }
              ].map(method => (
                <label key={method.value} className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="payment_method"
                    value={method.value}
                    checked={formData.payment_method === method.value}
                    onChange={handleChange}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <span className="flex items-center space-x-2">
                    {method.icon}
                    <span className="font-medium">{method.label}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Status
            </label>
            <select
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            >
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Payment description"
              required
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Date
            </label>
            <input
              type="date"
              name="payment_date"
              value={formData.payment_date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              required
            />
          </div>

          {/* Payment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Type
            </label>
            <select
              name="payment_type_id"
              value={formData.payment_type_id}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              required
            >
              {paymentTypes.length > 0 ? (
                paymentTypes.map(type => {
                  const typeId = type.payment_type_id || type.id;
                  const typeName = type.type_name || type.name || `Payment Type ${typeId}`;
                  return (
                    <option key={typeId} value={typeId}>
                      {typeName}
                    </option>
                  );
                })
              ) : (
                // Fallback options if API data is not available
                <>
                  <option value={1}>Membership Fee</option>
                  <option value={2}>Personal Training</option>
                  <option value={3}>Equipment Rental</option>
                  <option value={4}>Class Fee</option>
                  <option value={5}>Other</option>
                </>
              )}
            </select>
          </div>

          {/* Summary */}
          {formData.amount && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Payment Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Total Amount:</span>
                  <span className="font-bold text-lg text-green-600">{formatCurrency(formData.amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Method:</span>
                  <div className="flex items-center space-x-2">
                    {getPaymentMethodIcon(formData.payment_method)}
                    <span className="text-sm font-medium">
                      {formData.payment_method === 'credit_card' && 'Credit Card'}
                      {formData.payment_method === 'cash' && 'Cash'}
                      {formData.payment_method === 'bank_transfer' && 'Bank Transfer'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-6">
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
