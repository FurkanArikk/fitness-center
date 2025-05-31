import React, { useState, useEffect } from 'react';
import { X, LogIn, Users, MapPin, Clock } from 'lucide-react';
import Button from '../common/Button';

const CheckInModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  facilities = [],
  members = [],
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    member_id: '',
    facility_id: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        member_id: '',
        facility_id: '',
        notes: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.member_id) {
      newErrors.member_id = 'Üye seçimi zorunludur';
    }

    if (!formData.facility_id) {
      newErrors.facility_id = 'Tesis seçimi zorunludur';
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
        member_id: parseInt(formData.member_id),
        facility_id: parseInt(formData.facility_id),
        check_in_time: new Date().toISOString(),
        notes: formData.notes || ''
      };
      
      await onSave(submitData);
      onClose();
    } catch (err) {
      console.error('Error recording check-in:', err);
      setErrors({ submit: err.message || 'Giriş kaydı oluşturulamadı' });
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

  const getCurrentTime = () => {
    return new Date().toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <LogIn className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Hızlı Giriş Kaydı
              </h3>
              <p className="text-sm text-gray-600 mt-1 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {getCurrentTime()}
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
              <Users className="inline h-4 w-4 mr-1" />
              Üye <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.member_id}
              onChange={(e) => handleInputChange('member_id', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.member_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Üye seçin</option>
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
              <MapPin className="inline h-4 w-4 mr-1" />
              Tesis <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.facility_id}
              onChange={(e) => handleInputChange('facility_id', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.facility_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Tesis seçin</option>
              {facilities.map(facility => (
                <option key={facility.facility_id || facility.id} value={facility.facility_id || facility.id}>
                  {facility.name}
                </option>
              ))}
            </select>
            {errors.facility_id && <p className="text-red-500 text-sm mt-1">{errors.facility_id}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notlar
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="İsteğe bağlı notlar..."
            />
          </div>

          {/* Current Time Display */}
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700">Giriş Zamanı:</span>
              <span className="text-sm font-semibold text-green-800">{getCurrentTime()}</span>
            </div>
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
              İptal
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {saving ? 'Kaydediliyor...' : 'Giriş Kaydet'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckInModal;