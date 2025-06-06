import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Edit,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  Settings,
} from "lucide-react";
import Button from "../common/Button";

const PaymentMethodsModal = ({ isOpen, onClose, isLoading = false }) => {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      name: "Credit Card",
      value: "credit_card",
      icon: "CreditCard",
      enabled: true,
    },
    { id: 2, name: "Cash", value: "cash", icon: "Banknote", enabled: true },
    {
      id: 3,
      name: "Bank Transfer",
      value: "bank_transfer",
      icon: "Smartphone",
      enabled: true,
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    value: "",
    icon: "CreditCard",
  });

  const iconOptions = [
    { value: "CreditCard", label: "Credit Card", component: CreditCard },
    { value: "Banknote", label: "Banknote", component: Banknote },
    { value: "Smartphone", label: "Mobile/Transfer", component: Smartphone },
  ];

  const getIconComponent = (iconName) => {
    const iconOption = iconOptions.find((opt) => opt.value === iconName);
    return iconOption ? iconOption.component : CreditCard;
  };

  const handleAddMethod = () => {
    setFormData({ name: "", value: "", icon: "CreditCard" });
    setEditingMethod(null);
    setShowAddForm(true);
  };

  const handleEditMethod = (method) => {
    setFormData({
      name: method.name,
      value: method.value,
      icon: method.icon,
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
      setPaymentMethods((prev) =>
        prev.map((method) =>
          method.id === editingMethod.id ? { ...method, ...formData } : method
        )
      );
    } else {
      // Add new method
      const newMethod = {
        id: Date.now(),
        ...formData,
        enabled: true,
      };
      setPaymentMethods((prev) => [...prev, newMethod]);
    }

    setShowAddForm(false);
    setEditingMethod(null);
    setFormData({ name: "", value: "", icon: "CreditCard" });
  };

  const handleDeleteMethod = (methodId) => {
    setPaymentMethods((prev) =>
      prev.filter((method) => method.id !== methodId)
    );
  };

  const handleToggleMethod = (methodId) => {
    setPaymentMethods((prev) =>
      prev.map((method) =>
        method.id === methodId
          ? { ...method, enabled: !method.enabled }
          : method
      )
    );
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingMethod(null);
    setFormData({ name: "", value: "", icon: "CreditCard" });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        background:
          "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        style={{
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        {/* Header */}
        <div
          className="px-8 py-6 border-b border-gray-100"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Payment Methods</h3>
                <p className="text-blue-100 text-sm">
                  Configure available payment options
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="!p-2 hover:bg-white/20 text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Add New Method Button */}
          {!showAddForm && (
            <div className="mb-8">
              <Button
                onClick={handleAddMethod}
                className="w-full h-14 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 10px 25px rgba(102, 126, 234, 0.3)",
                }}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Payment Method
              </Button>
            </div>
          )}

          {/* Add/Edit Form */}
          {showAddForm && (
            <div
              className="mb-8 p-6 rounded-xl border-2"
              style={{
                background:
                  "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                borderColor: "rgba(102, 126, 234, 0.2)",
              }}
            >
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                {editingMethod
                  ? "Edit Payment Method"
                  : "Add New Payment Method"}
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Method Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter payment method name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Method Value
                  </label>
                  <input
                    type="text"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        value: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter method value (e.g., credit_card)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, icon: e.target.value }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {iconOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleSaveMethod}
                    className="flex-1 h-12 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
                    style={{
                      background:
                        "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    {editingMethod ? "Update Method" : "Add Method"}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1 h-12 font-semibold rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Methods List */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Current Payment Methods
            </h4>

            {paymentMethods.map((method) => {
              const IconComponent = getIconComponent(method.icon);
              return (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 rounded-xl border transition-all duration-300 hover:shadow-lg"
                  style={{
                    background: method.enabled
                      ? "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)"
                      : "rgba(156, 163, 175, 0.1)",
                    borderColor: method.enabled
                      ? "rgba(102, 126, 234, 0.2)"
                      : "rgba(156, 163, 175, 0.3)",
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        background: method.enabled
                          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          : "rgba(156, 163, 175, 0.5)",
                      }}
                    >
                      <IconComponent
                        className={`w-6 h-6 ${
                          method.enabled ? "text-white" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <h5
                        className={`font-semibold ${
                          method.enabled ? "text-gray-800" : "text-gray-500"
                        }`}
                      >
                        {method.name}
                      </h5>
                      <p
                        className={`text-sm ${
                          method.enabled ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        {method.value}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={method.enabled}
                        onChange={() => handleToggleMethod(method.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditMethod(method)}
                      className="!p-2 hover:bg-blue-50 text-blue-600"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMethod(method.id)}
                      className="!p-2 hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <Button
              onClick={onClose}
              className="px-8 py-3 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
              }}
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodsModal;
