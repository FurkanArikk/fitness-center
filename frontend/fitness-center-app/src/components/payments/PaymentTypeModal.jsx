import React, { useState, useEffect } from "react";
import {
  X,
  Settings,
  Info,
  Save,
  Loader,
  CheckCircle,
  Tag,
  FileText,
  ToggleLeft,
  ToggleRight,
  Sparkles,
} from "lucide-react";
import Button from "../common/Button";

const PaymentTypeModal = ({
  isOpen,
  onClose,
  onSave,
  paymentType = null,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (paymentType) {
      setFormData({
        name: paymentType.type_name || "",
        description: paymentType.description || "",
        is_active:
          paymentType.is_active !== undefined ? paymentType.is_active : true,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        is_active: true,
      });
    }
    setErrors({});
  }, [paymentType, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Payment type name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
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
      is_active: formData.is_active,
    };

    console.log("Sending payment type data:", paymentTypeData);
    onSave(paymentTypeData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto border border-gray-200 transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8 border-b border-gray-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-200 rounded-2xl shadow-lg">
              <Settings className="h-8 w-8 text-indigo-700" />
            </div>
            <div>
              <h3 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {paymentType ? "Edit Payment Type" : "Add New Payment Type"}
              </h3>
              <p className="text-sm text-gray-600 font-medium mt-1">
                {paymentType
                  ? "Update payment type information below"
                  : "Create a new payment type for the system"}
              </p>
            </div>
          </div>
          <button
            className="p-3 hover:bg-white hover:bg-opacity-70 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-105"
            onClick={onClose}
            disabled={isLoading}
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Payment Type Name */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
              <Tag size={16} className="text-indigo-600" />
              <span>Payment Type Name *</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full border-2 rounded-xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md font-medium ${
                errors.name
                  ? "border-red-500 focus:ring-red-100 focus:border-red-500"
                  : "border-gray-200"
              }`}
              placeholder="e.g., Membership Fee, Personal Training, Day Pass"
              required
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-600 font-semibold flex items-center space-x-1">
                <span>⚠</span>
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
              <FileText size={16} className="text-purple-600" />
              <span>Description *</span>
            </label>
            <div className="relative">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`w-full border-2 rounded-xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md font-medium resize-none ${
                  errors.description
                    ? "border-red-500 focus:ring-red-100 focus:border-red-500"
                    : "border-gray-200"
                }`}
                placeholder="Provide a detailed description of this payment type and when it should be used..."
                required
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400 font-medium">
                {formData.description.length}/500
              </div>
            </div>
            {errors.description && (
              <p className="mt-2 text-sm text-red-600 font-semibold flex items-center space-x-1">
                <span>⚠</span>
                <span>{errors.description}</span>
              </p>
            )}
          </div>

          {/* Active Status */}
          <div className="space-y-4">
            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
              <Sparkles size={16} className="text-green-600" />
              <span>Payment Type Status</span>
            </label>

            <div className="bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl p-6 border-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      formData.is_active
                        ? "bg-gradient-to-br from-green-100 to-emerald-200"
                        : "bg-gradient-to-br from-gray-100 to-red-200"
                    }`}
                  >
                    {formData.is_active ? (
                      <ToggleRight className="h-8 w-8 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h4
                      className={`text-lg font-bold ${
                        formData.is_active ? "text-green-700" : "text-gray-600"
                      }`}
                    >
                      {formData.is_active
                        ? "✅ Active Payment Type"
                        : "❌ Inactive Payment Type"}
                    </h4>
                    <p className="text-sm text-gray-600 font-medium mt-1">
                      {formData.is_active
                        ? "This payment type is available for new payments"
                        : "This payment type is hidden from payment options"}
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="relative w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-100 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-600 shadow-lg"></div>
                </label>
              </div>

              <div className="mt-4 p-4 bg-white bg-opacity-70 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-2 text-sm">
                  <Info size={16} className="text-blue-500" />
                  <span className="font-medium text-gray-700">
                    Inactive payment types won't appear in payment selection
                    menus but existing payments will remain visible.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
              className="px-8 py-3 font-bold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="px-8 py-3 font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>
                    {paymentType ? "💾 Update Type" : "✨ Create Type"}
                  </span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentTypeModal;
