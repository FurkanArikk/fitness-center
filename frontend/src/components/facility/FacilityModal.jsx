import React, { useState, useEffect } from "react";
import {
  X,
  Building2,
  MapPin,
  Phone,
  Clock,
  Users,
  Sparkles,
} from "lucide-react";
import Button from "../common/Button";

const FacilityModal = ({
  isOpen,
  onClose,
  onSave,
  facility = null,
  mode = "add",
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
    address: "",
    phone_number: "",
    capacity: "",
    operating_hours: "",
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (facility && mode === "edit") {
      setFormData({
        name: facility.name || "",
        description: facility.description || "",
        status: facility.status || "active",
        address: facility.address || "",
        phone_number: facility.phone_number || "",
        capacity: facility.capacity?.toString() || "",
        operating_hours: facility.operating_hours || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        status: "active",
        address: "",
        phone_number: "",
        capacity: "",
        operating_hours: "",
      });
    }
    setErrors({});
  }, [facility, mode, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Facility name is required";
    }

    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    if (
      formData.capacity &&
      (isNaN(formData.capacity) || parseInt(formData.capacity) < 0)
    ) {
      newErrors.capacity = "Capacity must be a valid positive number";
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
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
      };

      await onSave(submitData);
      onClose();
    } catch (err) {
      console.error("Error saving facility:", err);
      setErrors({ submit: err.message || "Failed to save facility" });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Modern Header with Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-8 rounded-t-3xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                  {mode === "add" ? "Add New Facility" : "Edit Facility"}
                  <Sparkles className="w-6 h-6 text-white/80" />
                </h2>
                <p className="text-blue-100 font-medium">
                  Create or update facility information
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Facility Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              Facility Name
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              spellCheck={false}
              className={`w-full px-4 py-3 bg-white border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                errors.name ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="Enter facility name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm font-medium">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <MapPin className="w-4 h-4 text-green-500" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              placeholder="Enter facility description"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              Status
              <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className={`w-full px-4 py-3 bg-white border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                errors.status ? "border-red-500" : "border-gray-200"
              }`}
            >
              <option value="active">✅ Active</option>
              <option value="inactive">⏸️ Inactive</option>
              <option value="maintenance">🔧 Maintenance</option>
            </select>
            {errors.status && (
              <p className="text-red-500 text-sm font-medium">
                {errors.status}
              </p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <MapPin className="w-4 h-4 text-red-500" />
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              spellCheck={false}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              placeholder="Enter facility address"
            />
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone Number */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Phone className="w-4 h-4 text-green-500" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) =>
                  handleInputChange("phone_number", e.target.value)
                }
                spellCheck={false}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Capacity */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Users className="w-4 h-4 text-blue-500" />
                Capacity
              </label>
              <input
                type="number"
                min="0"
                value={formData.capacity}
                onChange={(e) => handleInputChange("capacity", e.target.value)}
                spellCheck={false}
                className={`w-full px-4 py-3 bg-white border-2 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                  errors.capacity ? "border-red-500" : "border-gray-200"
                }`}
                placeholder="Enter capacity"
              />
              {errors.capacity && (
                <p className="text-red-500 text-sm font-medium">
                  {errors.capacity}
                </p>
              )}
            </div>
          </div>

          {/* Operating Hours */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Clock className="w-4 h-4 text-purple-500" />
              Operating Hours
            </label>
            <input
              type="text"
              value={formData.operating_hours}
              onChange={(e) =>
                handleInputChange("operating_hours", e.target.value)
              }
              spellCheck={false}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              placeholder="e.g., Mon-Fri 6:00-22:00, Sat-Sun 8:00-20:00"
            />
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200/50 text-red-700 p-4 rounded-2xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="font-semibold">{errors.submit}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-all duration-200 hover:scale-105 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
                  {mode === "add" ? "Add Facility" : "Update Facility"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacilityModal;
