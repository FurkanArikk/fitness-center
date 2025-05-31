import React, { useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  UserPlus,
  Users,
  AlertTriangle,
} from "lucide-react";

const AddMemberModal = ({ onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState("personal");

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const submitData = {
      ...formData,
      dateOfBirth: formData.dateOfBirth
        ? new Date(formData.dateOfBirth).toISOString()
        : null,
    };

    onSave(submitData);
  };

  const sections = [
    { id: "personal", name: "Personal Info", icon: User },
    { id: "contact", name: "Contact Info", icon: Phone },
    { id: "emergency", name: "Emergency Contact", icon: Shield },
  ];

  const statusOptions = [
    { value: "active", label: "Active", color: "bg-green-100 text-green-800" },
    {
      value: "de_active",
      label: "Inactive",
      color: "bg-gray-100 text-gray-800",
    },
    {
      value: "on_hold",
      label: "On Hold",
      color: "bg-orange-100 text-orange-800",
    },
  ];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-full p-3">
                <UserPlus className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Add New Member</h3>
                <p className="text-blue-100 mt-1">
                  Create a new fitness center member
                </p>
              </div>
            </div>
            <button
              className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gray-50 px-8 py-4 border-b">
          <div className="flex space-x-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeSection === section.id
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-gray-600 hover:bg-white hover:shadow-sm"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{section.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="px-8 py-6 max-h-[60vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            {activeSection === "personal" && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-blue-100 rounded-full p-2">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">
                    Personal Information
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none transition-all duration-200 ${
                        errors.firstName
                          ? "border-red-300 focus:border-red-500 bg-red-50"
                          : "border-gray-200 focus:border-blue-500 bg-white"
                      }`}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none transition-all duration-200 ${
                        errors.lastName
                          ? "border-red-300 focus:border-red-500 bg-red-50"
                          : "border-gray-200 focus:border-blue-500 bg-white"
                      }`}
                      placeholder="Enter last name"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {errors.lastName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all duration-200"
                      />
                      <Calendar className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all duration-200"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          statusOptions.find(
                            (opt) => opt.value === formData.status
                          )?.color
                        }`}
                      >
                        {
                          statusOptions.find(
                            (opt) => opt.value === formData.status
                          )?.label
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information */}
            {activeSection === "contact" && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-green-100 rounded-full p-2">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">
                    Contact Information
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full border-2 rounded-xl px-4 py-3 pl-11 focus:outline-none transition-all duration-200 ${
                          errors.email
                            ? "border-red-300 focus:border-red-500 bg-red-50"
                            : "border-gray-200 focus:border-blue-500 bg-white"
                        }`}
                        placeholder="member@example.com"
                      />
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full border-2 rounded-xl px-4 py-3 pl-11 focus:outline-none transition-all duration-200 ${
                          errors.phone
                            ? "border-red-300 focus:border-red-500 bg-red-50"
                            : "border-gray-200 focus:border-blue-500 bg-white"
                        }`}
                        placeholder="+1 (555) 123-4567"
                      />
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:border-blue-500 transition-all duration-200 resize-none"
                      placeholder="Enter full address..."
                    />
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            )}

            {/* Emergency Contact */}
            {activeSection === "emergency" && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-red-100 rounded-full p-2">
                    <Shield className="w-5 h-5 text-red-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">
                    Emergency Contact
                  </h4>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-2 text-amber-800">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-medium">Important Information</span>
                  </div>
                  <p className="text-amber-700 mt-2 text-sm">
                    Please provide emergency contact details for safety
                    purposes. This information will be kept confidential.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Emergency Contact Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={handleInputChange}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:border-blue-500 transition-all duration-200"
                        placeholder="Contact person name"
                      />
                      <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Emergency Contact Phone
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={handleInputChange}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:border-blue-500 transition-all duration-200"
                        placeholder="+1 (555) 987-6543"
                      />
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 border-t flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Required fields are marked with *
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding Member...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Add Member</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
