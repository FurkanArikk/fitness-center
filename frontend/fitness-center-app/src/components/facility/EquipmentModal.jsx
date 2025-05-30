import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../common/Button';

const EquipmentModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  equipment = null, 
  mode = 'add', 
  facilities = [],
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'cardio',
    status: 'working',
    brand: '',
    model: '',
    purchase_date: '',
    last_maintenance_date: '',
    next_maintenance_date: '',
    facility_id: ''
  });
  
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (equipment && mode === 'edit') {
      setFormData({
        name: equipment.name || '',
        description: equipment.description || '',
        category: equipment.category || 'cardio',
        status: equipment.status || 'working',
        brand: equipment.brand || '',
        model: equipment.model || '',
        purchase_date: equipment.purchase_date ? equipment.purchase_date.split('T')[0] : '',
        last_maintenance_date: equipment.last_maintenance_date ? equipment.last_maintenance_date.split('T')[0] : '',
        next_maintenance_date: equipment.next_maintenance_date ? equipment.next_maintenance_date.split('T')[0] : '',
        facility_id: equipment.facility_id?.toString() || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'cardio',
        status: 'working',
        brand: '',
        model: '',
        purchase_date: '',
        last_maintenance_date: '',
        next_maintenance_date: '',
        facility_id: ''
      });
    }
    setErrors({});
  }, [equipment, mode, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Equipment name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    if (formData.purchase_date && formData.last_maintenance_date) {
      if (new Date(formData.last_maintenance_date) < new Date(formData.purchase_date)) {
        newErrors.last_maintenance_date = 'Last maintenance date cannot be before purchase date';
      }
    }

    if (formData.last_maintenance_date && formData.next_maintenance_date) {
      if (new Date(formData.next_maintenance_date) <= new Date(formData.last_maintenance_date)) {
        newErrors.next_maintenance_date = 'Next maintenance date must be after last maintenance date';
      }
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
        facility_id: formData.facility_id ? parseInt(formData.facility_id) : null,
        purchase_date: formData.purchase_date || null,
        last_maintenance_date: formData.last_maintenance_date || null,
        next_maintenance_date: formData.next_maintenance_date || null
      };
      
      await onSave(submitData);
      onClose();
    } catch (err) {
      console.error('Error saving equipment:', err);
      setErrors({ submit: err.message || 'Failed to save equipment' });
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'add' ? 'Add New Equipment' : 'Edit Equipment'}
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
          {/* Equipment Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Equipment Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter equipment name"
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
              placeholder="Enter equipment description"
            />
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="cardio">Cardio</option>
                <option value="strength">Strength</option>
                <option value="functional">Functional</option>
                <option value="free_weights">Free Weights</option>
                <option value="accessories">Accessories</option>
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
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
                <option value="working">Working</option>
                <option value="maintenance">Maintenance</option>
                <option value="broken">Broken</option>
                <option value="out_of_order">Out of Order</option>
              </select>
              {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
            </div>
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter brand"
              />
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter model"
              />
            </div>
          </div>

          {/* Facility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facility
            </label>
            <select
              value={formData.facility_id}
              onChange={(e) => handleInputChange('facility_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a facility (optional)</option>
              {facilities.map(facility => (
                <option key={facility.facility_id} value={facility.facility_id}>
                  {facility.name}
                </option>
              ))}
            </select>
          </div>

          {/* Purchase Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Date
            </label>
            <input
              type="date"
              value={formData.purchase_date}
              onChange={(e) => handleInputChange('purchase_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Last Maintenance Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Maintenance Date
              </label>
              <input
                type="date"
                value={formData.last_maintenance_date}
                onChange={(e) => handleInputChange('last_maintenance_date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.last_maintenance_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.last_maintenance_date && <p className="text-red-500 text-sm mt-1">{errors.last_maintenance_date}</p>}
            </div>

            {/* Next Maintenance Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next Maintenance Date
              </label>
              <input
                type="date"
                value={formData.next_maintenance_date}
                onChange={(e) => handleInputChange('next_maintenance_date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.next_maintenance_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.next_maintenance_date && <p className="text-red-500 text-sm mt-1">{errors.next_maintenance_date}</p>}
            </div>
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
              {saving ? 'Saving...' : mode === 'add' ? 'Add Equipment' : 'Update Equipment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentModal;
