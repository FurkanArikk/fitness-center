import React, { useState, useEffect } from "react";
import {
  X,
  LogIn,
  Users,
  MapPin,
  Calendar,
  Clock,
  User,
  Building2,
  Sparkles,
  Edit3,
  FileText,
} from "lucide-react";
import Button from "../common/Button";
import { memberService } from "@/api";

const AttendanceModal = ({
  isOpen,
  onClose,
  onSave,
  attendance = null,
  mode = "add",
  facilities = [],
  members = [],
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    member_id: "",
    facility_id: "",
    check_in_time: new Date().toISOString().slice(0, 16), // Format for datetime-local input
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (attendance && mode === "edit") {
      setFormData({
        member_id: attendance.member_id || "",
        facility_id: attendance.facility_id || "",
        check_in_time: attendance.check_in_time
          ? new Date(attendance.check_in_time).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16),
        notes: attendance.notes || "",
      });
    } else {
      setFormData({
        member_id: "",
        facility_id: "",
        check_in_time: new Date().toISOString().slice(0, 16),
        notes: "",
      });
    }
    setErrors({});
  }, [attendance, mode, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.member_id) {
      newErrors.member_id = "Member is required";
    }

    if (!formData.facility_id) {
      newErrors.facility_id = "Facility is required";
    }

    if (!formData.check_in_time) {
      newErrors.check_in_time = "Check-in time is required";
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
        check_in_time: new Date(formData.check_in_time).toISOString(),
      };

      await onSave(submitData);
      onClose();
    } catch (err) {
      console.error("Error saving attendance:", err);
      setErrors({ submit: err.message || "Failed to save attendance record" });
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
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Modern Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 p-6">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <LogIn className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {mode === "add"
                    ? "Record New Check-In"
                    : "Edit Attendance Record"}
                  <Sparkles className="w-4 h-4 text-white/80" />
                </h2>
                <p className="text-blue-100 text-sm">
                  {mode === "add"
                    ? "Record a member's facility check-in"
                    : "Modify attendance record details"}
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
            {/* Member Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                <div className="p-1 bg-blue-100 rounded-lg">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                Member <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.member_id}
                  onChange={(e) =>
                    handleInputChange("member_id", e.target.value)
                  }
                  className={`w-full px-4 py-3 bg-white border rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 appearance-none cursor-pointer ${
                    errors.member_id
                      ? "border-red-400 ring-2 ring-red-200"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <option value="">Select a member</option>
                  {members.map((member) => (
                    <option
                      key={member.member_id || member.id}
                      value={member.member_id || member.id}
                    >
                      {member.first_name} {member.last_name} - {member.email}
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
              {errors.member_id && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <X className="w-3 h-3" />
                  {errors.member_id}
                </p>
              )}
            </div>

            {/* Facility Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                <div className="p-1 bg-purple-100 rounded-lg">
                  <MapPin className="w-4 h-4 text-purple-600" />
                </div>
                Facility <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.facility_id}
                  onChange={(e) =>
                    handleInputChange("facility_id", e.target.value)
                  }
                  className={`w-full px-4 py-3 bg-white border rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 appearance-none cursor-pointer ${
                    errors.facility_id
                      ? "border-red-400 ring-2 ring-red-200"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <option value="">Select a facility</option>
                  {facilities.map((facility) => (
                    <option
                      key={facility.facility_id || facility.id}
                      value={facility.facility_id || facility.id}
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
              {errors.facility_id && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <X className="w-3 h-3" />
                  {errors.facility_id}
                </p>
              )}
            </div>

            {/* Check-in Time */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                <div className="p-1 bg-green-100 rounded-lg">
                  <Clock className="w-4 h-4 text-green-600" />
                </div>
                Check-in Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.check_in_time}
                onChange={(e) =>
                  handleInputChange("check_in_time", e.target.value)
                }
                className={`w-full px-4 py-3 bg-white border rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 ${
                  errors.check_in_time
                    ? "border-red-400 ring-2 ring-red-200"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              />
              {errors.check_in_time && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <X className="w-3 h-3" />
                  {errors.check_in_time}
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                <div className="p-1 bg-orange-100 rounded-lg">
                  <FileText className="w-4 h-4 text-orange-600" />
                </div>
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-white border border-gray-200 hover:border-blue-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 placeholder-gray-500 resize-none"
                placeholder="Add any additional notes..."
              />
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
                className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                <span className="flex items-center gap-2">
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      {mode === "add" ? (
                        <LogIn className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      ) : (
                        <Edit3 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      )}
                      {mode === "add" ? "Record Check-In" : "Update Record"}
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

export default AttendanceModal;
