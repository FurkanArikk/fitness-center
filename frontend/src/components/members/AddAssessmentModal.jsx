import React, { useState } from 'react';
import { 
  X, 
  User, 
  Calendar, 
  Weight, 
  Ruler, 
  Target, 
  FileText,
  Activity
} from 'lucide-react';
import Button from '../common/Button';

const AddAssessmentModal = ({ member, onSave, onClose, isLoading }) => {
  // Get today's date in mm/dd/yyyy format
  const today = new Date();
  const todayFormatted = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
  
  // Get default next assessment date (1 month from now) in mm/dd/yyyy format
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const defaultNextDate = `${String(nextMonth.getMonth() + 1).padStart(2, '0')}/${String(nextMonth.getDate()).padStart(2, '0')}/${nextMonth.getFullYear()}`;

  const [formData, setFormData] = useState({
    memberId: member?.id || '',
    trainerId: 1, // Default trainer ID, should be replaced with a trainer selector
    weight: '',
    height: '',
    bmi: '',
    bodyFatPercentage: '',
    notes: '',
    goalsSet: '',  // Added as required by API
    assessmentDate: todayFormatted,
    nextAssessmentDate: defaultNextDate // Added as required by API
  });

  const [errors, setErrors] = useState({});

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
    if (yearNum < 1900 || yearNum > currentYear + 10) {
      return { isValid: false, error: `Invalid year: ${year}. Year must be between 1900-${currentYear + 10}` };
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

  // Convert American date format (mm/dd/yyyy) to ISO format (yyyy-mm-dd)
  const convertAmericanDateToISO = (americanDate) => {
    if (!americanDate) return null;
    const dateMatch = americanDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (dateMatch) {
      const [, month, day, year] = dateMatch;
      return `${year}-${month}-${day}`;
    }
    return null;
  };

  // Handle date input change with formatting and validation
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    
    // Remove all non-numeric characters
    let cleanValue = value.replace(/\D/g, '');
    
    // Format the value as mm/dd/yyyy
    if (cleanValue.length >= 2) {
      cleanValue = cleanValue.substring(0, 2) + '/' + cleanValue.substring(2);
    }
    if (cleanValue.length >= 5) {
      cleanValue = cleanValue.substring(0, 5) + '/' + cleanValue.substring(5, 9);
    }
    
    // Update form data
    setFormData(prev => ({ ...prev, [name]: cleanValue }));
    
    // Validate the date if it's complete (10 characters: mm/dd/yyyy)
    if (cleanValue.length === 10) {
      const validation = validateDate(cleanValue);
      if (!validation.isValid) {
        setErrors((prev) => ({
          ...prev,
          [name]: validation.error
        }));
      } else {
        // Clear error if date is valid
        setErrors((prev) => ({
          ...prev,
          [name]: ""
        }));
      }
    } else if (cleanValue.length > 0 && cleanValue.length < 10) {
      // Show format hint for incomplete dates
      setErrors((prev) => ({
        ...prev,
        [name]: "Date format: mm/dd/yyyy (example: 01/15/2025)"
      }));
    } else {
      // Clear error for empty input
      setErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Recalculate when form data changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Auto-calculate BMI when weight or height changes
      if ((name === 'weight' || name === 'height') && newData.weight && newData.height) {
        const heightInMeters = newData.height / 100; // cm to meters
        const bmi = (newData.weight / (heightInMeters * heightInMeters)).toFixed(1);
        newData.bmi = bmi;
      }
      
      return newData;
    });

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
    
    // Validate required fields
    const newErrors = {};
    
    if (!formData.weight) newErrors.weight = "Weight is required";
    if (!formData.height) newErrors.height = "Height is required";
    if (!formData.goalsSet.trim()) newErrors.goalsSet = "Goals are required";
    
    // Validate dates
    if (!formData.assessmentDate) {
      newErrors.assessmentDate = "Assessment date is required";
    } else {
      const validation = validateDate(formData.assessmentDate);
      if (!validation.isValid) {
        newErrors.assessmentDate = validation.error;
      }
    }
    
    if (!formData.nextAssessmentDate) {
      newErrors.nextAssessmentDate = "Next assessment date is required";
    } else {
      const validation = validateDate(formData.nextAssessmentDate);
      if (!validation.isValid) {
        newErrors.nextAssessmentDate = validation.error;
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Create a copy of the form data before sending to API
    const submitData = { ...formData };
    
    // Convert string values to appropriate numeric types
    submitData.weight = parseFloat(submitData.weight);
    submitData.height = parseFloat(submitData.height);
    submitData.bmi = parseFloat(submitData.bmi);
    submitData.trainerId = parseInt(submitData.trainerId);
    
    // Convert bodyFatPercentage only if it exists
    if (submitData.bodyFatPercentage) {
      submitData.bodyFatPercentage = parseFloat(submitData.bodyFatPercentage);
    }
    
    // Convert American date format to ISO format for API
    submitData.assessmentDate = convertAmericanDateToISO(submitData.assessmentDate) + "T00:00:00Z";
    submitData.nextAssessmentDate = convertAmericanDateToISO(submitData.nextAssessmentDate) + "T00:00:00Z";
    
    console.log('Sending assessment with formatted data:', submitData);
    onSave(submitData);
  };

  // Generate avatar for member
  const getAvatarData = () => {
    const firstName = member?.firstName || "";
    const lastName = member?.lastName || "";
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    const colors = [
      "bg-gradient-to-br from-blue-400 to-blue-600",
      "bg-gradient-to-br from-green-400 to-green-600",
      "bg-gradient-to-br from-purple-400 to-purple-600",
      "bg-gradient-to-br from-pink-400 to-pink-600",
    ];
    const colorIndex = (firstName.charCodeAt(0) + lastName.charCodeAt(0)) % colors.length;
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
                  <Activity className="w-6 h-6 mr-2 text-blue-600" />
                  New Assessment
                </h3>
                <p className="text-gray-600 font-medium">
                  {member?.firstName} {member?.lastName}
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
            {/* Assessment Dates Section */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100">
              <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Assessment Dates
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Assessment Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="assessmentDate"
                      value={formData.assessmentDate}
                      onChange={handleDateChange}
                      placeholder="mm/dd/yyyy"
                      pattern="^(0[1-9]|1[0-2])/(0[1-9]|[12]\d|3[01])/\d{4}$"
                      className={`w-full border-2 ${errors.assessmentDate ? 'border-red-300' : 'border-gray-200'} rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md`}
                      required
                    />
                    {errors.assessmentDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.assessmentDate}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Next Assessment Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="nextAssessmentDate"
                      value={formData.nextAssessmentDate}
                      onChange={handleDateChange}
                      placeholder="mm/dd/yyyy"
                      pattern="^(0[1-9]|1[0-2])/(0[1-9]|[12]\d|3[01])/\d{4}$"
                      className={`w-full border-2 ${errors.nextAssessmentDate ? 'border-red-300' : 'border-gray-200'} rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md`}
                      required
                    />
                    {errors.nextAssessmentDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.nextAssessmentDate}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Physical Measurements Section */}
            <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl p-6 border border-gray-100">
              <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Weight className="w-5 h-5 mr-2 text-green-600" />
                Physical Measurements
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Weight (kg) *
                  </label>
                  <div className="relative">
                    <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      className={`w-full border-2 ${errors.weight ? 'border-red-300' : 'border-gray-200'} rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md`}
                      placeholder="Enter weight in kg"
                      required
                    />
                    {errors.weight && (
                      <p className="text-red-500 text-sm mt-1">{errors.weight}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Height (cm) *
                  </label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      min="0"
                      className={`w-full border-2 ${errors.height ? 'border-red-300' : 'border-gray-200'} rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md`}
                      placeholder="Enter height in cm"
                      required
                    />
                    {errors.height && (
                      <p className="text-red-500 text-sm mt-1">{errors.height}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    BMI (Auto-calculated) *
                  </label>
                  <div className="relative">
                    <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="bmi"
                      value={formData.bmi}
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-gray-50 shadow-sm"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-calculated from weight and height</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Body Fat Percentage (%)
                  </label>
                  <div className="relative">
                    <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="bodyFatPercentage"
                      value={formData.bodyFatPercentage}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      placeholder="Enter body fat percentage"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Goals and Notes Section */}
            <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl p-6 border border-gray-100">
              <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Target className="w-5 h-5 mr-2 text-purple-600" />
                Goals & Notes
              </h4>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Goals Set *
                  </label>
                  <div className="relative">
                    <Target className="absolute left-3 top-4 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="goalsSet"
                      value={formData.goalsSet}
                      onChange={handleChange}
                      className={`w-full border-2 ${errors.goalsSet ? 'border-red-300' : 'border-gray-200'} rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md`}
                      placeholder="e.g. Weight loss, muscle gain, improve endurance"
                      required
                    />
                    {errors.goalsSet && (
                      <p className="text-red-500 text-sm mt-1">{errors.goalsSet}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-4 text-gray-400 w-5 h-5" />
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={4}
                      className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md resize-none"
                      placeholder="Enter any additional notes or observations"
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
                "Save Assessment"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAssessmentModal;
