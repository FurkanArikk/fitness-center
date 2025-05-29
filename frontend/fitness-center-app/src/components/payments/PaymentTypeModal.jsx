import React, { useState, useEffect } from 'react';
import { X, Settings, Info } from 'lucide-react';
import Button from '../common/Button';

const PaymentTypeModal = ({ isOpen, onClose, onSave, paymentType = null, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (paymentType) {
      setFormData({
        name: paymentType.type_name || '',
        description: paymentType.description || '',
        is_active: paymentType.is_active !== undefined ? paymentType.is_active : true
      });
    } else {
      setFormData({
        name: '',
        description: '',
        is_active: true
      });
    }
    setErrors({});
  }, [paymentType, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Payment type name is required';
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

    const paymentTypeData = {
      type_name: formData.name.trim(),
      description: formData.description.trim(),
      is_active: formData.is_active
    };

    console.log('Sending payment type data:', paymentTypeData);
    onSave(paymentTypeData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {paymentType ? 'Edit Payment Type' : 'Add New Payment Type'}
              </h3>
              <p className="text-sm text-gray-600">
                {paymentType ? 'Update payment type information' : 'Create a new payment type'}
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
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Type Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Membership Fee"
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
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
              placeholder="Description of the payment type"
              required
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Active Status */}
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="text-blue-600 focus:ring-blue-500 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Active Payment Type
              </span>
            </label>
            <p className="mt-1 text-sm text-gray-500">
              Inactive payment types won't be available for new payments
            </p>
          </div>

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
              {paymentType ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentTypeModal;
