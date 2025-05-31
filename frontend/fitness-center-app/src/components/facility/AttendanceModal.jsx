import React, { useState, useEffect } from 'react';
import { X, LogIn, Users, MapPin } from 'lucide-react';
import Button from '../common/Button';
import { memberService } from '@/api';

const AttendanceModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  attendance = null, 
  mode = 'add',
  facilities = [],
  members = [],
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    member_id: '',
    facility_id: '',
    check_in_time: new Date().toISOString().slice(0, 16), // Format for datetime-local input
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (attendance && mode === 'edit') {
      setFormData({
        member_id: attendance.member_id || '',
        facility_id: attendance.facility_id || '',
        check_in_time: attendance.check_in_time ? 
          new Date(attendance.check_in_time).toISOString().slice(0, 16) : 
          new Date().toISOString().slice(0, 16),
        notes: attendance.notes || ''
      });
    } else {
      setFormData({
        member_id: '',
        facility_id: '',
        check_in_time: new Date().toISOString().slice(0, 16),
        notes: ''
      });
    }
    setErrors({});
  }, [attendance, mode, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.member_id) {
      newErrors.member_id = 'Member is required';
    }

    if (!formData.facility_id) {
      newErrors.facility_id = 'Facility is required';
    }

    if (!formData.check_in_time) {
      newErrors.check_in_time = 'Check-in time is required';
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
        member_id: parseInt(formData.member_id),
        facility_id: parseInt(formData.facility_id),
        check_in_time: new Date(formData.check_in_time).toISOString()
      };
      
      await onSave(submitData);
      onClose();
    } catch (err) {
      console.error('Error saving attendance:', err);
      setErrors({ submit: err.message || 'Failed to save attendance record' });
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <LogIn className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {mode === 'add' ? 'Record New Check-In' : 'Edit Attendance Record'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {mode === 'add' ? 'Record a member\'s facility check-in' : 'Modify attendance record details'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Member Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Member <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.member_id}
              onChange={(e) => handleInputChange('member_id', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.member_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a member</option>
              {members.map(member => (
                <option key={member.member_id || member.id} value={member.member_id || member.id}>
                  {member.first_name} {member.last_name} - {member.email}
                </option>
              ))}
            </select>
            {errors.member_id && <p className="text-red-500 text-sm mt-1">{errors.member_id}</p>}
          </div>

          {/* Facility Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facility <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.facility_id}
              onChange={(e) => handleInputChange('facility_id', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.facility_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a facility</option>
              {facilities.map(facility => (
                <option key={facility.facility_id || facility.id} value={facility.facility_id || facility.id}>
                  {facility.name}
                </option>
              ))}
            </select>
            {errors.facility_id && <p className="text-red-500 text-sm mt-1">{errors.facility_id}</p>}
          </div>

          {/* Check-in Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-in Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.check_in_time}
              onChange={(e) => handleInputChange('check_in_time', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.check_in_time ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.check_in_time && <p className="text-red-500 text-sm mt-1">{errors.check_in_time}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any additional notes..."
            />
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
              <p className="text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
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
              {saving ? 'Saving...' : (mode === 'add' ? 'Record Check-In' : 'Update Record')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceModal;