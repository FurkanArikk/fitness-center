import React, { useState, useEffect } from "react";
import {
  X,
  Package,
  Sparkles,
  Wrench,
  Calendar,
  Settings,
  MapPin,
} from "lucide-react";
import Button from "../common/Button";

const EquipmentModal = ({
  isOpen,
  onClose,
  onSave,
  equipment = null,
  mode = "add",
  facilities = [],
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "cardio",
    status: "working",
    brand: "",
    model: "",
    purchase_date: "",
    last_maintenance_date: "",
    next_maintenance_date: "",
    facility_id: "",
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (equipment && mode === "edit") {
      setFormData({
        name: equipment.name || "",
        description: equipment.description || "",
        category: equipment.category || "cardio",
        status: equipment.status || "working",
        brand: equipment.brand || "",
        model: equipment.model || "",
        purchase_date: equipment.purchase_date
          ? equipment.purchase_date.split("T")[0]
          : "",
        last_maintenance_date: equipment.last_maintenance_date
          ? equipment.last_maintenance_date.split("T")[0]
          : "",
        next_maintenance_date: equipment.next_maintenance_date
          ? equipment.next_maintenance_date.split("T")[0]
          : "",
        facility_id: equipment.facility_id?.toString() || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        category: "cardio",
        status: "working",
        brand: "",
        model: "",
        purchase_date: "",
        last_maintenance_date: "",
        next_maintenance_date: "",
        facility_id: "",
      });
    }
    setErrors({});
  }, [equipment, mode, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Equipment name is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    if (formData.purchase_date && formData.last_maintenance_date) {
      if (
        new Date(formData.last_maintenance_date) <
        new Date(formData.purchase_date)
      ) {
        newErrors.last_maintenance_date =
          "Last maintenance date cannot be before purchase date";
      }
    }

    if (formData.last_maintenance_date && formData.next_maintenance_date) {
      if (
        new Date(formData.next_maintenance_date) <=
        new Date(formData.last_maintenance_date)
      ) {
        newErrors.next_maintenance_date =
          "Next maintenance date must be after last maintenance date";
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
        facility_id: formData.facility_id
          ? parseInt(formData.facility_id)
          : null,
        purchase_date: formData.purchase_date || null,
        last_maintenance_date: formData.last_maintenance_date || null,
        next_maintenance_date: formData.next_maintenance_date || null,
      };

      await onSave(submitData);
      onClose();
    } catch (err) {
      console.error("Error saving equipment:", err);
      setErrors({ submit: err.message || "Failed to save equipment" });
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
        backgroundColor: "rgba(0, 0, 0, 0.15)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Modern Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-800 p-6">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {mode === "add" ? "Add New Equipment" : "Edit Equipment"}
                  <Sparkles className="w-4 h-4 text-white/80" />
                </h2>
                <p className="text-emerald-100 text-sm">
                  {mode === "add"
                    ? "Create a new equipment record"
                    : "Modify equipment details"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl border border-white/30 hover:border-white/50 transition-all duration-200 hover:scale-110"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Equipment Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                <div className="p-1 bg-emerald-100 rounded-lg">
                  <Package className="w-4 h-4 text-emerald-600" />
                </div>
                Equipment Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                spellCheck={false}
                className={`w-full px-4 py-3 bg-white border rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all duration-200 placeholder-gray-500 ${
                  errors.name
                    ? "border-red-400 ring-2 ring-red-200"
                    : "border-gray-200 hover:border-emerald-300"
                }`}
                placeholder="Enter equipment name"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <X className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                <div className="p-1 bg-blue-100 rounded-lg">
                  <Settings className="w-4 h-4 text-blue-600" />
                </div>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={4}
                className="w-full px-4 py-3 bg-white border border-gray-200 hover:border-emerald-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all duration-200 placeholder-gray-500 resize-none"
                placeholder="Enter equipment description"
              />
            </div>

            {/* Two column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  <div className="p-1 bg-purple-100 rounded-lg">
                    <Wrench className="w-4 h-4 text-purple-600" />
                  </div>
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    className={`w-full px-4 py-3 bg-white border rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all duration-200 appearance-none cursor-pointer ${
                      errors.category
                        ? "border-red-400 ring-2 ring-red-200"
                        : "border-gray-200 hover:border-emerald-300"
                    }`}
                  >
                    <option value="cardio">Cardio</option>
                    <option value="strength">Strength</option>
                    <option value="functional">Functional</option>
                    <option value="free_weights">Free Weights</option>
                    <option value="accessories">Accessories</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {errors.category && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.category}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  <div className="p-1 bg-green-100 rounded-lg">
                    <Sparkles className="w-4 h-4 text-green-600" />
                  </div>
                  Status <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                    className={`w-full px-4 py-3 bg-white border rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all duration-200 appearance-none cursor-pointer ${
                      errors.status
                        ? "border-red-400 ring-2 ring-red-200"
                        : "border-gray-200 hover:border-emerald-300"
                    }`}
                  >
                    <option value="working">Working</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="broken">Broken</option>
                    <option value="out_of_order">Out of Order</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {errors.status && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.status}
                  </p>
                )}
              </div>
            </div>

            {/* Two column layout - Brand & Model */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Brand */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  <div className="p-1 bg-blue-100 rounded-lg">
                    <Settings className="w-4 h-4 text-blue-600" />
                  </div>
                  Brand
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleInputChange("brand", e.target.value)}
                  spellCheck={false}
                  className="w-full px-4 py-3 bg-white border border-gray-200 hover:border-emerald-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all duration-200 placeholder-gray-500"
                  placeholder="Enter brand"
                />
              </div>

              {/* Model */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  <div className="p-1 bg-indigo-100 rounded-lg">
                    <Settings className="w-4 h-4 text-indigo-600" />
                  </div>
                  Model
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => handleInputChange("model", e.target.value)}
                  spellCheck={false}
                  className="w-full px-4 py-3 bg-white border border-gray-200 hover:border-emerald-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all duration-200 placeholder-gray-500"
                  placeholder="Enter model"
                />
              </div>
            </div>

            {/* Facility */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                <div className="p-1 bg-pink-100 rounded-lg">
                  <MapPin className="w-4 h-4 text-pink-600" />
                </div>
                Facility
              </label>
              <div className="relative">
                <select
                  value={formData.facility_id}
                  onChange={(e) =>
                    handleInputChange("facility_id", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-white border border-gray-200 hover:border-emerald-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="">Select a facility (optional)</option>
                  {facilities.map((facility) => (
                    <option
                      key={facility.facility_id}
                      value={facility.facility_id}
                    >
                      {facility.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Purchase Date */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                <div className="p-1 bg-orange-100 rounded-lg">
                  <Calendar className="w-4 h-4 text-orange-600" />
                </div>
                Purchase Date
              </label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) =>
                  handleInputChange("purchase_date", e.target.value)
                }
                className="w-full px-4 py-3 bg-white border border-gray-200 hover:border-emerald-300 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all duration-200"
              />
            </div>

            {/* Two column layout - Maintenance Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Last Maintenance Date */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  <div className="p-1 bg-green-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-green-600" />
                  </div>
                  Last Maintenance Date
                </label>
                <input
                  type="date"
                  value={formData.last_maintenance_date}
                  onChange={(e) =>
                    handleInputChange("last_maintenance_date", e.target.value)
                  }
                  className={`w-full px-4 py-3 bg-white border rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all duration-200 ${
                    errors.last_maintenance_date
                      ? "border-red-400 ring-2 ring-red-200"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                />
                {errors.last_maintenance_date && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.last_maintenance_date}
                  </p>
                )}
              </div>

              {/* Next Maintenance Date */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  <div className="p-1 bg-orange-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-orange-600" />
                  </div>
                  Next Maintenance Date
                </label>
                <input
                  type="date"
                  value={formData.next_maintenance_date}
                  onChange={(e) =>
                    handleInputChange("next_maintenance_date", e.target.value)
                  }
                  className={`w-full px-4 py-3 bg-white border rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 transition-all duration-200 ${
                    errors.next_maintenance_date
                      ? "border-red-400 ring-2 ring-red-200"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                />
                {errors.next_maintenance_date && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.next_maintenance_date}
                  </p>
                )}
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200/50 text-red-700 p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <X className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Error</h3>
                    <p className="text-sm">{errors.submit}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200/50">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:scale-105 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="group px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                <span className="flex items-center gap-2">
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      {mode === "add" ? "Add Equipment" : "Update Equipment"}
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EquipmentModal;
