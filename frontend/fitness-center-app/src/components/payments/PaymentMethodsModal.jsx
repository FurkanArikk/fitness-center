import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, CreditCard, Banknote, Smartphone } from 'lucide-react';
import Button from '../common/Button';

const PaymentMethodsModal = ({ isOpen, onClose, isLoading = false }) => {
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, name: 'Credit Card', value: 'credit_card', icon: 'CreditCard', enabled: true },
    { id: 2, name: 'Cash', value: 'cash', icon: 'Banknote', enabled: true },
    { id: 3, name: 'Bank Transfer', value: 'bank_transfer', icon: 'Smartphone', enabled: true }
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    icon: 'CreditCard'
  });

  const iconOptions = [
    { value: 'CreditCard', label: 'Credit Card', component: CreditCard },
    { value: 'Banknote', label: 'Banknote', component: Banknote },
    { value: 'Smartphone', label: 'Mobile/Transfer', component: Smartphone }
  ];

  const getIconComponent = (iconName) => {
    const iconOption = iconOptions.find(opt => opt.value === iconName);
    return iconOption ? iconOption.component : CreditCard;
  };

  const handleAddMethod = () => {
    setFormData({ name: '', value: '', icon: 'CreditCard' });
    setEditingMethod(null);
    setShowAddForm(true);
  };

  const handleEditMethod = (method) => {
    setFormData({
      name: method.name,
      value: method.value,
      icon: method.icon
    });
    setEditingMethod(method);
    setShowAddForm(true);
  };

  const handleSaveMethod = () => {
    if (!formData.name.trim() || !formData.value.trim()) {
      return;
    }

    if (editingMethod) {
      // Update existing method
      setPaymentMethods(prev => prev.map(method => 
        method.id === editingMethod.id 
          ? { ...method, ...formData }
          : method
      ));
    } else {
      // Add new method
      const newMethod = {
        id: Date.now(),
        ...formData,
        enabled: true
      };
      setPaymentMethods(prev => [...prev, newMethod]);
    }

    setShowAddForm(false);
    setEditingMethod(null);
    setFormData({ name: '', value: '', icon: 'CreditCard' });
  };

  const handleDeleteMethod = (methodId) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
  };

  const handleToggleMethod = (methodId) => {
    setPaymentMethods(prev => prev.map(method => 
      method.id === methodId 
        ? { ...method, enabled: !method.enabled }
        : method
    ));
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingMethod(null);
    setFormData({ name: '', value: '', icon: 'CreditCard' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
              <p className="text-sm text-gray-500">Manage available payment methods</p>
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

        <div className="space-y-4">
          {/* Add New Method Button */}
          {!showAddForm && (
            <Button
              variant="outline"
              icon={<Plus size={18} />}
              onClick={handleAddMethod}
              className="w-full"
            >
              Add New Payment Method
            </Button>
          )}

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="text-sm font-medium text-gray-900 mb-4">
                {editingMethod ? 'Edit Payment Method' : 'Add New Payment Method'}
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Method Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Credit Card, PayPal"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Method Value (used in code)
                  </label>
                  <input
                    type="text"
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                    placeholder="e.g., credit_card, paypal"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {iconOptions.map((option) => {
                      const IconComponent = option.component;
                      return (
                        <label
                          key={option.value}
                          className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                            formData.icon === option.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="icon"
                            value={option.value}
                            checked={formData.icon === option.value}
                            onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                            className="sr-only"
                          />
                          <IconComponent className="w-5 h-5 text-gray-600" />
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveMethod}
                    disabled={!formData.name.trim() || !formData.value.trim()}
                    className="flex-1"
                  >
                    {editingMethod ? 'Update' : 'Add'} Method
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Methods List */}
          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const IconComponent = getIconComponent(method.icon);
              return (
                <div
                  key={method.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    method.enabled ? 'bg-white' : 'bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{method.name}</h4>
                      <p className="text-sm text-gray-500">{method.value}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={method.enabled}
                        onChange={() => handleToggleMethod(method.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Enabled</span>
                    </label>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditMethod(method)}
                      className="!p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMethod(method.id)}
                      className="!p-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end mt-8 pt-6 border-t">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodsModal;
