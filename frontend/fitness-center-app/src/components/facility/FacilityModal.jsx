import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../common/Button';

const FacilityModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  facility = null, 
  mode = 'add', 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    facility_type: 'gym',
    status: 'active',
    address: '',
    phone_number: '',
    capacity: '',
    operating_hours: ''
  });
  
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (facility && mode === 'edit') {
      setFormData({
        name: facility.name || '',
        description: facility.description || '',
        facility_type: facility.facility_type || 'gym',
        status: facility.status || 'active',
        address: facility.address || '',
        phone_number: facility.phone_number || '',
        capacity: facility.capacity?.toString() || '',
        operating_hours: facility.operating_hours || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        facility_type: 'gym',
        status: 'active',
        address: '',
        phone_number: '',
        capacity: '',
        operating_hours: ''
      });
    }
    setErrors({});
  }, [facility, mode, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Facility name is required';
    }

    if (!formData.facility_type) {
      newErrors.facility_type = 'Facility type is required';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    if (formData.capacity && (isNaN(formData.capacity) || parseInt(formData.capacity) < 0)) {
      newErrors.capacity = 'Capacity must be a valid positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const submitData = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null
      };
      
      await onSave(submitData);
      onClose();
    } catch (err) {
      console.error('Error saving facility:', err);
      setErrors({ submit: err.message || 'Failed to save facility' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'add' ? 'Add New Facility' : 'Edit Facility'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Facility Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facility Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              spellCheck={false}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter facility name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter facility description"
            />
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Facility Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facility Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.facility_type}
                onChange={(e) => handleInputChange('facility_type', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.facility_type ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="gym">Gym</option>
                <option value="pool">Pool</option>
                <option value="studio">Studio</option>
                <option value="court">Court</option>
                <option value="sauna">Sauna</option>
                <option value="locker_room">Locker Room</option>
              </select>
              {errors.facility_type && <p className="text-red-500 text-sm mt-1">{errors.facility_type}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.status ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
              {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              spellCheck={false}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter facility address"
            />
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                spellCheck={false}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity
              </label>
              <input
                type="number"
                min="0"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', e.target.value)}
                spellCheck={false}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.capacity ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter capacity"
              />
              {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
            </div>
          </div>

          {/* Operating Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operating Hours
            </label>
            <input
              type="text"
              value={formData.operating_hours}
              onChange={(e) => handleInputChange('operating_hours', e.target.value)}
              spellCheck={false}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Mon-Fri 6:00-22:00, Sat-Sun 8:00-20:00"
            />
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? 'Saving...' : mode === 'add' ? 'Add Facility' : 'Update Facility'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacilityModal;
