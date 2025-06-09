import React from "react";
import { useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Users,
} from "lucide-react";

const EditMemberModal = ({ member, onClose, onSave, isLoading }) => {
  if (!member) return null;

  const [errors, setErrors] = useState({});

  // Convert ISO date to American format (mm/dd/yyyy)
  const formatDateToAmerican = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Convert American date format (mm/dd/yyyy) to ISO format
  const convertAmericanDateToISO = (americanDate) => {
    if (!americanDate) return null;
    const dateMatch = americanDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (dateMatch) {
      const [, month, day, year] = dateMatch;
      return new Date(`${year}-${month}-${day}`).toISOString();
    }
    return null;
  };

  // Date validation function - validates American format (mm/dd/yyyy)
  const validateDate = (dateString) => {
    // Check if the date matches mm/dd/yyyy format
    const dateMatch = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!dateMatch) return { isValid: false, error: "Date format must be mm/dd/yyyy" };
    
    const [, month, day, year] = dateMatch;
    const monthNum = parseInt(month, 10);
    const dayNum = parseInt(day, 10);
    const yearNum = parseInt(year, 10);
    
    // Check month range (01-12)
    if (monthNum < 1 || monthNum > 12) {
      return { isValid: false, error: `Invalid month: ${month}. Month must be between 01-12` };
    }
    
    // Check day range (01-31)
    if (dayNum < 1 || dayNum > 31) {
      return { isValid: false, error: `Invalid day: ${day}. Day must be between 01-31` };
    }
    
    // Check year range
    const currentYear = new Date().getFullYear();
    if (yearNum < 1900 || yearNum > currentYear) {
      return { isValid: false, error: `Invalid year: ${year}. Year must be between 1900-${currentYear}` };
    }
    
    // Create a date object and verify it's a valid date
    const dateObj = new Date(yearNum, monthNum - 1, dayNum);
    const isValidDate = dateObj.getFullYear() === yearNum && 
                        dateObj.getMonth() === monthNum - 1 && 
                        dateObj.getDate() === dayNum;
    
    if (!isValidDate) {
      return { isValid: false, error: `${month}/${day}/${year} is not a valid date` };
    }
    
    return { isValid: true, error: null };
  };

  // Handle date input change with formatting and validation
  const handleDateChange = (e) => {
    const { value } = e.target;
    
    // Remove all non-numeric characters
    let cleanValue = value.replace(/\D/g, '');
    
    // Format the value as mm/dd/yyyy
    if (cleanValue.length >= 2) {
      cleanValue = cleanValue.substring(0, 2) + '/' + cleanValue.substring(2);
    }
    if (cleanValue.length >= 5) {
      cleanValue = cleanValue.substring(0, 5) + '/' + cleanValue.substring(5, 9);
    }
    
    // Update the input value
    e.target.value = cleanValue;
    
    // Validate the date if it's complete (10 characters: mm/dd/yyyy)
    if (cleanValue.length === 10) {
      const validation = validateDate(cleanValue);
      if (!validation.isValid) {
        setErrors((prev) => ({
          ...prev,
          dateOfBirth: validation.error
        }));
      } else {
        // Clear error if date is valid
        setErrors((prev) => ({
          ...prev,
          dateOfBirth: ""
        }));
      }
    } else if (cleanValue.length > 0 && cleanValue.length < 10) {
      // Show format hint for incomplete dates
      setErrors((prev) => ({
        ...prev,
        dateOfBirth: "Date format: mm/dd/yyyy (example: 01/15/1990)"
      }));
    } else {
      // Clear error for empty input
      setErrors((prev) => ({
        ...prev,
        dateOfBirth: ""
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate date before submission
    const dateValue = e.target.dateOfBirth.value;
    if (dateValue && dateValue.trim()) {
      const validation = validateDate(dateValue);
      if (!validation.isValid) {
        setErrors({ dateOfBirth: validation.error });
        return;
      }
    }
    
    const formData = {
      firstName: e.target.firstName.value,
      lastName: e.target.lastName.value,
      email: e.target.email.value,
      phone: e.target.phone.value,
      address: e.target.address.value,
      dateOfBirth: convertAmericanDateToISO(e.target.dateOfBirth.value),
      emergencyContactName: e.target.emergencyContactName.value,
      emergencyContactPhone: e.target.emergencyContactPhone.value,
      status: e.target.status.value,
    };
    onSave(formData);
  };

  // Generate avatar for member
  const getAvatarData = () => {
    const firstName = member.firstName || "";
    const lastName = member.lastName || "";
    const initials = `${firstName.charAt(0)}${lastName.charAt(
      0
    )}`.toUpperCase();
    const colors = [
      "bg-gradient-to-br from-blue-400 to-blue-600",
      "bg-gradient-to-br from-green-400 to-green-600",
      "bg-gradient-to-br from-purple-400 to-purple-600",
      "bg-gradient-to-br from-pink-400 to-pink-600",
    ];
    const colorIndex =
      (firstName.charCodeAt(0) + lastName.charCodeAt(0)) % colors.length;
    return { initials, color: colors[colorIndex] };
  };

  const avatarData = getAvatarData();

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`w-16 h-16 rounded-full ${avatarData.color} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
              >
                {avatarData.initials}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <User className="w-6 h-6 mr-2 text-blue-600" />
                  Edit Member Profile
                </h3>
                <p className="text-gray-600 font-medium">
                  Update member information and details
                </p>
              </div>
            </div>
            <button
              className="group p-3 hover:bg-white hover:shadow-md rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200"
              onClick={onClose}
            >
              <X
                size={24}
                className="text-gray-500 group-hover:text-gray-700 group-hover:scale-110 transition-all duration-200"
              />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100">
              <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    defaultValue={member.firstName}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    required
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    defaultValue={member.lastName}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    required
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="dateOfBirth"
                      defaultValue={formatDateToAmerican(member.dateOfBirth)}
                      placeholder="mm/dd/yyyy"
                      pattern="^(0[1-9]|1[0-2])/(0[1-9]|[12]\d|3[01])/\d{4}$"
                      onInput={handleDateChange}
                      className={`w-full border-2 ${errors.dateOfBirth ? 'border-red-300' : 'border-gray-200'} rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md`}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      name="status"
                      defaultValue={member.status}
                      className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md appearance-none"
                    >
                      <option value="active">✅ Active</option>
                      <option value="de_active">❌ Inactive</option>
                      <option value="hold_on">⏸️ On Hold</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl p-6 border border-gray-100">
              <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-green-600" />
                Contact Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      defaultValue={member.email}
                      className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      required
                      placeholder="member@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      defaultValue={member.phone}
                      className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      required
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-4 text-gray-400 w-5 h-5" />
                    <textarea
                      name="address"
                      defaultValue={member.address}
                      className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md resize-none"
                      rows={3}
                      placeholder="Enter full address"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="bg-gradient-to-r from-gray-50 to-red-50 rounded-2xl p-6 border border-gray-100">
              <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Users className="w-5 h-5 mr-2 text-red-600" />
                Emergency Contact
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Contact Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="emergencyContactName"
                      defaultValue={member.emergencyContactName}
                      className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      placeholder="Emergency contact name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      defaultValue={member.emergencyContactPhone}
                      className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      placeholder="Emergency contact phone"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-t border-gray-200">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMemberModal;
