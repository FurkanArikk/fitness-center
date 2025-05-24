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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User size={16} className="inline mr-1" />
              {config.label} {config.required && "*"}
            </label>
            {dataLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader
                  size="sm"
                  message={`Loading ${config.relatedEntity}...`}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  value={value}
                  onChange={(e) => handleInputChange(fieldName, e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    hasError ? "border-red-300" : "border-gray-300"
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
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={<Plus size={16} />}
                    onClick={() => setShowStaffModal(true)}
                    disabled={loading}
                  >
                    Create New {config.label}
                  </Button>
                )}
              </div>
            )}
            {hasError && (
              <p className="mt-1 text-sm text-red-600">{hasError}</p>
            )}
          </div>
        );

      case "select_or_text":
        return (
          <div key={fieldName}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Award size={16} className="inline mr-1" />
              {config.label} {config.required && "*"}
            </label>
            <div className="space-y-2">
              <select
                value={config.options.includes(value) ? value : ""}
                onChange={(e) => handleInputChange(fieldName, e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  hasError ? "border-red-300" : "border-gray-300"
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  hasError ? "border-red-300" : "border-gray-300"
                }`}
                disabled={loading}
              />
            </div>
            {hasError && (
              <p className="mt-1 text-sm text-red-600">{hasError}</p>
            )}
          </div>
        );

      case "number":
        const icon = fieldName === "experience" ? Calendar : Star;
        return (
          <div key={fieldName}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {React.createElement(icon, {
                size: 16,
                className: "inline mr-1",
              })}
              {config.label} {config.required && "*"}
            </label>
            <input
              type="number"
              min={config.min}
              max={config.max}
              step={config.step}
              value={value}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                hasError ? "border-red-300" : "border-gray-300"
              }`}
              placeholder={
                config.placeholder || `Enter ${config.label.toLowerCase()}`
              }
              disabled={loading}
            />
            {hasError && (
              <p className="mt-1 text-sm text-red-600">{hasError}</p>
            )}
          </div>
        );

      case "boolean":
        return (
          <div key={fieldName}>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleInputChange(fieldName, e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={loading}
              />
              <span className="ml-2 text-sm text-gray-700">
                {config.description || config.label}
              </span>
            </label>
            {hasError && (
              <p className="mt-1 text-sm text-red-600">{hasError}</p>
            )}
          </div>
        );

      default:
        return (
          <div key={fieldName}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {config.label} {config.required && "*"}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                hasError ? "border-red-300" : "border-gray-300"
              }`}
              placeholder={`Enter ${config.label.toLowerCase()}`}
              disabled={loading}
            />
            {hasError && (
              <p className="mt-1 text-sm text-red-600">{hasError}</p>
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle size={20} className="mr-2 flex-shrink-0" />
              <span>{error}</span>
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
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || dataLoading}
              icon={loading ? null : <CheckCircle size={18} />}
            >
              {loading ? (
                <div className="flex items-center">
                  <Loader size="sm" className="mr-2" />
                  Creating...
                </div>
              ) : (
                "Create Trainer"
              )}
            </Button>
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
