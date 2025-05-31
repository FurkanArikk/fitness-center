import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Button from '../common/Button';

const DeleteAttendanceConfirm = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  attendance,
  isLoading = false 
}) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!attendance) return;
    
    setDeleting(true);
    try {
      await onConfirm(attendance.attendance_id);
      onClose();
    } catch (err) {
      console.error('Error deleting attendance:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen || !attendance) return null;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return dateString;
    }
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Katılım Kaydını Sil
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Bu işlem geri alınamaz
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={deleting}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Bu katılım kaydını silmek istediğinizden emin misiniz?
            </p>
            
            {/* Attendance Details */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Üye:</span>
                <span className="text-sm text-gray-900">
                  {attendance.member_name || `ID: ${attendance.member_id}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Tesis:</span>
                <span className="text-sm text-gray-900">
                  {attendance.facility_name || `ID: ${attendance.facility_id}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Giriş Zamanı:</span>
                <span className="text-sm text-gray-900">
                  {formatDate(attendance.check_in_time)}
                </span>
              </div>
              {attendance.check_out_time && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Çıkış Zamanı:</span>
                  <span className="text-sm text-gray-900">
                    {formatDate(attendance.check_out_time)}
                  </span>
                </div>
              )}
              {attendance.notes && (
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-600">Notlar:</span>
                  <p className="text-sm text-gray-900 mt-1">{attendance.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={deleting}
            >
              İptal
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Siliniyor...' : 'Sil'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAttendanceConfirm;