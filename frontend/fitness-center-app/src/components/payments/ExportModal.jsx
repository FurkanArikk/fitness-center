import React, { useState } from 'react';
import { X, Download, FileText, Calendar, Filter } from 'lucide-react';
import Button from '../common/Button';

const ExportModal = ({ isOpen, onClose, onExport, isLoading = false }) => {
  const [exportSettings, setExportSettings] = useState({
    format: 'excel',
    dateRange: 'last_month',
    startDate: '',
    endDate: '',
    includeFields: {
      member_name: true,
      amount: true,
      payment_method: true,
      payment_status: true,
      payment_date: true,
      description: true
    },
    filterByStatus: 'all'
  });

  const formatOptions = [
    { value: 'excel', label: 'Excel (.xlsx)', icon: FileText },
    { value: 'csv', label: 'CSV (.csv)', icon: FileText }
  ];

  const dateRangeOptions = [
    { value: 'last_week', label: 'Son 7 Gün' },
    { value: 'last_month', label: 'Son 30 Gün' },
    { value: 'last_quarter', label: 'Son 3 Ay' },
    { value: 'this_year', label: 'Bu Yıl' },
    { value: 'custom', label: 'Özel Tarih Aralığı' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Tüm Durumlar' },
    { value: 'completed', label: 'Tamamlandı' },
    { value: 'pending', label: 'Beklemede' },
    { value: 'failed', label: 'Başarısız' }
  ];

  const fieldOptions = [
    { key: 'member_name', label: 'Üye Adı' },
    { key: 'amount', label: 'Tutar' },
    { key: 'payment_method', label: 'Ödeme Yöntemi' },
    { key: 'payment_status', label: 'Durum' },
    { key: 'payment_date', label: 'Ödeme Tarihi' },
    { key: 'description', label: 'Açıklama' }
  ];

  const handleSettingChange = (field, value) => {
    setExportSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFieldToggle = (fieldKey) => {
    setExportSettings(prev => ({
      ...prev,
      includeFields: {
        ...prev.includeFields,
        [fieldKey]: !prev.includeFields[fieldKey]
      }
    }));
  };

  const handleExport = () => {
    onExport(exportSettings);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)'
      }}
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Dışa Aktar</h3>
              <p className="text-sm text-gray-500">Ödeme verilerini dışa aktarın</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="!p-1"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Dosya Formatı
            </label>
            <div className="grid grid-cols-2 gap-3">
              {formatOptions.map((format) => (
                <label
                  key={format.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    exportSettings.format === format.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={format.value}
                    checked={exportSettings.format === format.value}
                    onChange={(e) => handleSettingChange('format', e.target.value)}
                    className="sr-only"
                  />
                  <format.icon className="w-5 h-5 mr-3 text-gray-500" />
                  <span className="text-sm font-medium">{format.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Calendar className="w-4 h-4 inline mr-2" />
              Tarih Aralığı
            </label>
            <select
              value={exportSettings.dateRange}
              onChange={(e) => handleSettingChange('dateRange', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {dateRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Date Range */}
          {exportSettings.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başlangıç Tarihi
                </label>
                <input
                  type="date"
                  value={exportSettings.startDate}
                  onChange={(e) => handleSettingChange('startDate', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bitiş Tarihi
                </label>
                <input
                  type="date"
                  value={exportSettings.endDate}
                  onChange={(e) => handleSettingChange('endDate', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Filter className="w-4 h-4 inline mr-2" />
              Durum Filtresi
            </label>
            <select
              value={exportSettings.filterByStatus}
              onChange={(e) => handleSettingChange('filterByStatus', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Include Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Dahil Edilecek Alanlar
            </label>
            <div className="grid grid-cols-2 gap-3">
              {fieldOptions.map((field) => (
                <label
                  key={field.key}
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={exportSettings.includeFields[field.key]}
                    onChange={() => handleFieldToggle(field.key)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm font-medium">{field.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            İptal
          </Button>
          <Button
            onClick={handleExport}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Aktarılıyor...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Dışa Aktar</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
