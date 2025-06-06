import React, { useState, useEffect } from "react";
import {
  X,
  Package,
  DollarSign,
  Calendar,
  FileText,
  Sparkles,
  CheckCircle,
} from "lucide-react";

const EditMembershipModal = ({ membership, onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    durationMonths: 1,
    price: 0,
    active: true,
  });

  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // If membership object is not empty (update case)
    if (membership && Object.keys(membership).length > 0) {
      setFormData({
        name: membership.membershipName || "",
        description: membership.description || "",
        durationMonths: membership.duration || 1,
        price: membership.price || 0,
        active: membership.isActive ?? true,
      });
    } else {
      // Default values for new creation
      setFormData({
        name: "",
        description: "",
        durationMonths: 1,
        price: 0,
        active: true,
      });
    }
    setErrors({});
  }, [membership]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Membership name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Membership name must be at least 3 characters";
    }

    if (formData.durationMonths < 1 || formData.durationMonths > 60) {
      newErrors.durationMonths = "Duration must be between 1 and 60 months";
    }

    if (formData.price < 0) {
      newErrors.price = "Price cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? Number(value)
          : value,
    });

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Map the form data to match backend API expectations
    const apiData = {
      membershipName: formData.name, // Backend expects 'membershipName' not 'name'
      description: formData.description,
      duration: formData.durationMonths, // Backend expects 'duration' not 'durationMonths'
      price: formData.price,
      isActive: formData.active, // Backend expects 'isActive' not 'active'
    };

    console.log("[EditMembershipModal] Sending data to API:", apiData);
    onSave(apiData);
  };

  // Determine title text
  const isNewMembership = !membership || Object.keys(membership).length === 0;
  const modalTitle = isNewMembership
    ? "Add Membership Type"
    : "Edit Membership Type";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fadeIn"
      style={{
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        backgroundColor: "rgba(0, 0, 0, 0.15)",
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform animate-slideUp">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-xl p-2">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{modalTitle}</h3>
                <p className="text-blue-100 text-sm">
                  {isNewMembership
                    ? "Create a new membership plan for your fitness center"
                    : "Update membership plan details"}
                </p>
              </div>
            </div>
            <button
              className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200 text-white"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-2 right-20 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
          <div
            className="absolute bottom-3 right-12 w-1 h-1 bg-white/40 rounded-full animate-pulse"
            style={{ animationDelay: "0.5s" }}
          ></div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Membership Name */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <FileText className="w-4 h-4 mr-2 text-blue-500" />
              Membership Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Premium Gold, Basic Plan"
              className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-200 focus:outline-none ${
                errors.name
                  ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              }`}
              required
            />
            {errors.name && (
              <p className="text-red-500 text-xs flex items-center">
                <X className="w-3 h-3 mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <FileText className="w-4 h-4 mr-2 text-purple-500" />
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the benefits and features of this membership..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 transition-all duration-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 resize-none"
              rows={3}
            />
          </div>

          {/* Duration and Price Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <Calendar className="w-4 h-4 mr-2 text-green-500" />
                Duration (months) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="durationMonths"
                  value={formData.durationMonths}
                  onChange={handleChange}
                  min={1}
                  max={60}
                  className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-200 focus:outline-none ${
                    errors.durationMonths
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  }`}
                  required
                />
              </div>
              {errors.durationMonths && (
                <p className="text-red-500 text-xs flex items-center">
                  <X className="w-3 h-3 mr-1" />
                  {errors.durationMonths}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <DollarSign className="w-4 h-4 mr-2 text-amber-500" />
                Price ($) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-200 focus:outline-none ${
                    errors.price
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  }`}
                  required
                />
              </div>
              {errors.price && (
                <p className="text-red-500 text-xs flex items-center">
                  <X className="w-3 h-3 mr-1" />
                  {errors.price}
                </p>
              )}
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Sparkles className="w-5 h-5 text-emerald-500 mr-2" />
                <div>
                  <label
                    htmlFor="active"
                    className="text-sm font-semibold text-gray-700 cursor-pointer"
                  >
                    Active Status
                  </label>
                  <p className="text-xs text-gray-500">
                    {formData.active
                      ? "This membership will be available for purchase"
                      : "This membership will be hidden from customers"}
                  </p>
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="relative w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-green-500"></div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-lg flex items-center space-x-2"
              disabled={isLoading}
            >
              {/* Background Animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Content */}
              <div className="relative flex items-center space-x-2">
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    {isNewMembership ? (
                      <Package className="w-4 h-4" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    <span>{isNewMembership ? "Create" : "Update"}</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EditMembershipModal;
