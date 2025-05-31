import React, { useState, useEffect } from "react";
import {
  User,
  Award,
  Calendar,
  Star,
  CheckCircle,
  AlertCircle,
  Plus,
  ExternalLink,
} from "lucide-react";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import Loader from "@/components/common/Loader";
import { staffService } from "@/api";

const AddTrainerModal = ({ isOpen, onClose, onTrainerCreated }) => {
  // Dynamic field configuration based on API schema
  const trainerFields = {
    staff_id: {
      type: "foreign_key",
      label: "Staff Member",
      required: true,
      relatedEntity: "staff",
      displayField: (staff) =>
        `${staff.first_name} ${staff.last_name} - ${staff.position}`,
      valueField: "staff_id",
      allowCreate: true,
    },
    specialization: {
      type: "select_or_text",
      label: "Specialization",
      required: true,
      options: [
        "Weight Loss",
        "Strength Training",
        "Cardio Fitness",
        "Yoga and Flexibility",
        "Sports Training",
        "Senior Fitness",
        "Rehabilitation",
        "Nutrition Coaching",
        "CrossFit",
        "Pilates",
        "Functional Training",
        "Bodybuilding",
      ],
    },
    certification: {
      type: "select_or_text",
      label: "Certification",
      required: true,
      options: [
        "NASM Certified Personal Trainer",
        "ACE Personal Trainer",
        "ACSM Certified Personal Trainer",
        "NSCA Certified Strength and Conditioning Specialist",
        "ISSA Certified Personal Trainer",
        "Registered Yoga Teacher (RYT)",
        "CrossFit Level 1 Trainer",
        "Pilates Instructor Certification",
        "Precision Nutrition Level 1",
        "PADI Fitness Specialist",
      ],
    },
    experience: {
      type: "number",
      label: "Experience (years)",
      required: true,
      min: 0,
      max: 50,
      validation: (value) => {
        const num = parseInt(value);
        if (isNaN(num) || num < 0 || num > 50) {
          return "Experience must be between 0 and 50 years";
        }
        return null;
      },
    },
    rating: {
      type: "number",
      label: "Initial Rating",
      required: true,
      min: 1.0,
      max: 5.0,
      step: 0.1,
      validation: (value) => {
        const num = parseFloat(value);
        if (isNaN(num) || num < 1.0 || num > 5.0) {
          return "Rating must be between 1.0 and 5.0";
        }
        return null;
      },
    },
    is_active: {
      type: "boolean",
      label: "Active Status",
      required: false,
      defaultValue: true,
      description: "Set trainer as active (can receive assignments)",
    },
  };

  // Form state - dynamically initialize based on field config
  const [formData, setFormData] = useState(() => {
    const initialData = {};
    Object.entries(trainerFields).forEach(([fieldName, config]) => {
      initialData[fieldName] =
        config.defaultValue ?? (config.type === "boolean" ? false : "");
    });
    return initialData;
  });

  // UI state
  const [relatedData, setRelatedData] = useState({
    staff: [],
  });
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form validation state
  const [errors, setErrors] = useState({});

  // Staff creation modal state
  const [showStaffModal, setShowStaffModal] = useState(false);

  // Fetch related data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchRelatedData();
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    const initialData = {};
    Object.entries(trainerFields).forEach(([fieldName, config]) => {
      initialData[fieldName] =
        config.defaultValue ??
        (config.type === "boolean" ? config.defaultValue ?? false : "");
    });
    setFormData(initialData);
    setErrors({});
    setError("");
    setSuccess(false);
  };

  const fetchRelatedData = async () => {
    setDataLoading(true);
    try {
      // Fetch staff members for foreign key relationship
      const staffData = await staffService.getStaff();
      const availableStaff = Array.isArray(staffData)
        ? staffData.filter((staff) => staff.status === "Active")
        : [];

      setRelatedData({
        staff: availableStaff,
      });
    } catch (err) {
      console.error("Failed to fetch related data:", err);
      setError("Failed to load required data. Please try again.");
    } finally {
      setDataLoading(false);
    }
  };

  const handleInputChange = (fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    Object.entries(trainerFields).forEach(([fieldName, config]) => {
      const value = formData[fieldName];

      // Required field validation
      if (config.required) {
        if (config.type === "boolean") {
          // Boolean fields don't need validation for required
        } else if (!value || (typeof value === "string" && !value.trim())) {
          newErrors[fieldName] = `${config.label} is required`;
          return;
        }
      }

      // Custom validation
      if (value && config.validation) {
        const validationError = config.validation(value);
        if (validationError) {
          newErrors[fieldName] = validationError;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Prepare data for API - convert types as needed
      const trainerData = {};

      Object.entries(trainerFields).forEach(([fieldName, config]) => {
        const value = formData[fieldName];

        switch (config.type) {
          case "foreign_key":
          case "number":
            if (fieldName === "staff_id" || fieldName === "experience") {
              trainerData[fieldName] = parseInt(value);
            } else if (fieldName === "rating") {
              trainerData[fieldName] = parseFloat(value);
            }
            break;
          case "boolean":
            trainerData[fieldName] = Boolean(value);
            break;
          default:
            trainerData[fieldName] =
              typeof value === "string" ? value.trim() : value;
        }
      });

      const newTrainer = await staffService.createTrainer(trainerData);

      setSuccess(true);

      // Call the callback to update the trainers list
      if (onTrainerCreated) {
        onTrainerCreated(newTrainer);
      }

      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Failed to create trainer:", err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to create trainer. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleStaffCreated = (newStaff) => {
    // Add new staff to the list and select it
    setRelatedData((prev) => ({
      ...prev,
      staff: [...prev.staff, newStaff],
    }));
    setFormData((prev) => ({
      ...prev,
      staff_id: newStaff.staff_id || newStaff.id,
    }));
    setShowStaffModal(false);
  };

  const renderField = (fieldName, config) => {
    const value = formData[fieldName];
    const hasError = errors[fieldName];

    switch (config.type) {
      case "foreign_key":
        return (
          <div key={fieldName}>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                  <User size={14} className="text-blue-600" />
                </div>
                {config.label} {config.required && "*"}
              </div>
            </label>
            {dataLoading ? (
              <div className="flex items-center justify-center py-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
                <Loader
                  size="sm"
                  message={`Loading ${config.relatedEntity}...`}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  value={value}
                  onChange={(e) => handleInputChange(fieldName, e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 bg-white shadow-sm hover:shadow-md ${
                    hasError
                      ? "border-red-300 focus:border-red-400 focus:ring-red-400"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  disabled={loading}
                >
                  <option value="">Select {config.label}</option>
                  {relatedData[config.relatedEntity]?.map((item) => (
                    <option
                      key={item[config.valueField]}
                      value={item[config.valueField]}
                    >
                      {config.displayField(item)}
                    </option>
                  ))}
                </select>
                {config.allowCreate && (
                  <button
                    type="button"
                    onClick={() => setShowStaffModal(true)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="p-1 bg-white/20 rounded-lg">
                      <Plus size={14} />
                    </div>
                    Create New {config.label}
                  </button>
                )}
              </div>
            )}
            {hasError && (
              <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1">
                <AlertCircle size={14} />
                {hasError}
              </p>
            )}
          </div>
        );

      case "select_or_text":
        return (
          <div key={fieldName}>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg">
                  <Award size={14} className="text-purple-600" />
                </div>
                {config.label} {config.required && "*"}
              </div>
            </label>
            <div className="space-y-3">
              <select
                value={config.options.includes(value) ? value : ""}
                onChange={(e) => handleInputChange(fieldName, e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 bg-white shadow-sm hover:shadow-md ${
                  hasError
                    ? "border-red-300 focus:border-red-400 focus:ring-red-400"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                disabled={loading}
              >
                <option value="">Select {config.label}</option>
                {config.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder={`Or enter custom ${config.label.toLowerCase()}`}
                value={value}
                onChange={(e) => handleInputChange(fieldName, e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 bg-white shadow-sm hover:shadow-md ${
                  hasError
                    ? "border-red-300 focus:border-red-400 focus:ring-red-400"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                disabled={loading}
              />
            </div>
            {hasError && (
              <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1">
                <AlertCircle size={14} />
                {hasError}
              </p>
            )}
          </div>
        );

      case "number":
        const icon = fieldName === "experience" ? Calendar : Star;
        const colorScheme = fieldName === "experience" ? "emerald" : "amber";
        return (
          <div key={fieldName}>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 bg-gradient-to-br from-${colorScheme}-100 to-${colorScheme}-200 rounded-lg`}
                >
                  {React.createElement(icon, {
                    size: 14,
                    className: `text-${colorScheme}-600`,
                  })}
                </div>
                {config.label} {config.required && "*"}
              </div>
            </label>
            <input
              type="number"
              min={config.min}
              max={config.max}
              step={config.step}
              value={value}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-${colorScheme}-400 focus:border-${colorScheme}-400 transition-all duration-200 bg-white shadow-sm hover:shadow-md ${
                hasError
                  ? "border-red-300 focus:border-red-400 focus:ring-red-400"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              placeholder={
                config.placeholder || `Enter ${config.label.toLowerCase()}`
              }
              disabled={loading}
            />
            {hasError && (
              <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1">
                <AlertCircle size={14} />
                {hasError}
              </p>
            )}
          </div>
        );

      case "boolean":
        return (
          <div
            key={fieldName}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-100"
          >
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) =>
                    handleInputChange(fieldName, e.target.checked)
                  }
                  className="sr-only"
                  disabled={loading}
                />
                <div
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                    value
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-500 shadow-md"
                      : "bg-white border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {value && <CheckCircle size={16} className="text-white" />}
                </div>
              </div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {config.description || config.label}
              </span>
            </label>
            {hasError && (
              <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1">
                <AlertCircle size={14} />
                {hasError}
              </p>
            )}
          </div>
        );

      default:
        return (
          <div key={fieldName}>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
                  <div className="w-3.5 h-3.5 bg-gray-600 rounded-sm"></div>
                </div>
                {config.label} {config.required && "*"}
              </div>
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 bg-white shadow-sm hover:shadow-md ${
                hasError
                  ? "border-red-300 focus:border-red-400 focus:ring-red-400"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              placeholder={`Enter ${config.label.toLowerCase()}`}
              disabled={loading}
            />
            {hasError && (
              <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1">
                <AlertCircle size={14} />
                {hasError}
              </p>
            )}
          </div>
        );
    }
  };

  if (success) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Trainer Created Successfully"
        size="md"
      >
        <div className="p-6 text-center">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Trainer Added Successfully!
          </h3>
          <p className="text-gray-600 mb-4">
            The new trainer has been added to your team.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Add New Trainer"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 text-red-700 px-5 py-4 rounded-xl flex items-center shadow-sm">
              <div className="p-1.5 bg-red-200 rounded-lg mr-3">
                <AlertCircle size={16} className="text-red-600" />
              </div>
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Dynamically render all fields */}
          {Object.entries(trainerFields).map(([fieldName, config]) => {
            // Group smaller fields
            if (["experience", "rating"].includes(fieldName)) {
              return null; // Will be handled in the grid below
            }
            return renderField(fieldName, config);
          })}

          {/* Grid for smaller fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField("experience", trainerFields.experience)}
            {renderField("rating", trainerFields.rating)}
          </div>

          {/* Boolean fields at the end */}
          {Object.entries(trainerFields)
            .filter(([_, config]) => config.type === "boolean")
            .map(([fieldName, config]) => renderField(fieldName, config))}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || dataLoading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <div className="p-1 bg-white/20 rounded-lg">
                    <Loader size="sm" />
                  </div>
                  Creating...
                </>
              ) : (
                <>
                  <div className="p-1 bg-white/20 rounded-lg">
                    <CheckCircle size={16} />
                  </div>
                  Create Trainer
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Staff Creation Modal - Simple placeholder for now */}
      {showStaffModal && (
        <Modal
          isOpen={showStaffModal}
          onClose={() => setShowStaffModal(false)}
          title="Create New Staff Member"
          size="md"
        >
          <div className="p-6 text-center">
            <ExternalLink size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Staff Creation
            </h3>
            <p className="text-gray-600 mb-4">
              Please navigate to the Staff Management section to create a new
              staff member, then return here to assign them as a trainer.
            </p>
            <Button
              variant="secondary"
              onClick={() => setShowStaffModal(false)}
            >
              Close
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default AddTrainerModal;
