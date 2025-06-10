import React, { useState, useEffect } from "react";
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
  CreditCard,
  Star,
  DollarSign,
  FileText,
  Clock,
  Check,
} from "lucide-react";
import { memberService } from "@/api";

const AddMemberModal = ({ onClose, onSave, isLoading, error }) => {
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
  
  // Membership related state
  const [memberships, setMemberships] = useState([]);
  const [loadingMemberships, setLoadingMemberships] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [membershipBenefits, setMembershipBenefits] = useState([]);
  const [loadingBenefits, setLoadingBenefits] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [contractSigned, setContractSigned] = useState(true);
  const [assignMembership, setAssignMembership] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    
    // Validate date of birth if provided
    if (formData.dateOfBirth && formData.dateOfBirth.trim()) {
      const validation = validateDate(formData.dateOfBirth);
      if (!validation.isValid) {
        newErrors.dateOfBirth = validation.error;
      }
    }

    // If membership assignment is enabled and no membership is selected
    if (assignMembership && !selectedMembership) {
      newErrors.membership = "Please select a membership plan";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate specific section
  const validateSection = (sectionId) => {
    const sectionErrors = {};

    switch (sectionId) {
      case "personal":
        if (!formData.firstName.trim())
          sectionErrors.firstName = "First name is required";
        if (!formData.lastName.trim()) 
          sectionErrors.lastName = "Last name is required";
        // Validate date of birth if provided
        if (formData.dateOfBirth && formData.dateOfBirth.trim()) {
          const validation = validateDate(formData.dateOfBirth);
          if (!validation.isValid) {
            sectionErrors.dateOfBirth = validation.error;
          }
        }
        break;
        
      case "contact":
        if (!formData.email.trim()) 
          sectionErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email))
          sectionErrors.email = "Email is invalid";
        if (!formData.phone.trim()) 
          sectionErrors.phone = "Phone number is required";
        break;
        
      case "emergency":
        // Emergency contact is optional, no required fields
        break;
        
      case "membership":
        if (assignMembership && !selectedMembership) {
          sectionErrors.membership = "Please select a membership plan";
        }
        break;
    }

    return Object.keys(sectionErrors).length === 0;
  };

  // Check if section is completed
  const isSectionCompleted = (sectionId) => {
    return validateSection(sectionId);
  };

  // Check if section has errors (incomplete)
  const isSectionIncomplete = (sectionId) => {
    return !validateSection(sectionId);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle date of birth formatting for American format (mm/dd/yyyy)
    if (name === "dateOfBirth") {
      // Remove all non-numeric characters
      let cleanValue = value.replace(/\D/g, '');
      
      // Format the value as mm/dd/yyyy
      if (cleanValue.length >= 2) {
        cleanValue = cleanValue.substring(0, 2) + '/' + cleanValue.substring(2);
      }
      if (cleanValue.length >= 5) {
        cleanValue = cleanValue.substring(0, 5) + '/' + cleanValue.substring(5, 9);
      }
      
      setFormData((prev) => ({
        ...prev,
        [name]: cleanValue,
      }));
      
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
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name] && name !== "dateOfBirth") {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check all sections for completion
    const incompleteSections = [];
    sections.forEach(section => {
      if (!validateSection(section.id)) {
        incompleteSections.push(section.name);
      }
    });

    if (incompleteSections.length > 0) {
      // Show error for incomplete sections
      const errorMessage = `Please complete the following sections: ${incompleteSections.join(', ')}`;
      setErrors({ 
        ...errors, 
        general: errorMessage 
      });
      
      // Navigate to the first incomplete section
      const firstIncompleteSection = sections.find(section => !validateSection(section.id));
      if (firstIncompleteSection) {
        setActiveSection(firstIncompleteSection.id);
      }
      
      return;
    }

    if (!validateForm()) return;

    // Convert American date format (mm/dd/yyyy) to ISO format
    let isoDateOfBirth = null;
    if (formData.dateOfBirth) {
      const dateMatch = formData.dateOfBirth.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (dateMatch) {
        const [, month, day, year] = dateMatch;
        isoDateOfBirth = new Date(`${year}-${month}-${day}`).toISOString();
      }
    }

    const submitData = {
      ...formData,
      dateOfBirth: isoDateOfBirth,
      // Include membership data if selected
      membership: assignMembership && selectedMembership ? {
        membershipId: selectedMembership,
        startDate: startDate,
        paymentStatus: paymentMethod === 'cash' ? 'paid' : 'pending',
        contractSigned: contractSigned,
      } : null,
    };

    onSave(submitData);
  };

  // Load memberships when component mounts
  useEffect(() => {
    const fetchMemberships = async () => {
      setLoadingMemberships(true);
      try {
        const data = await memberService.getMemberships(true);
        if (Array.isArray(data)) {
          setMemberships(data);
          if (data.length > 0) {
            setSelectedMembership(data[0].id);
            fetchMembershipBenefits(data[0].id);
          }
        }
      } catch (error) {
        console.error("Error loading memberships:", error);
      } finally {
        setLoadingMemberships(false);
      }
    };

    fetchMemberships();
  }, []);

  const fetchMembershipBenefits = async (membershipId) => {
    if (!membershipId) return;

    setLoadingBenefits(true);
    try {
      const benefits = await memberService.getMembershipBenefits(membershipId);
      setMembershipBenefits(benefits);
    } catch (error) {
      console.error(
        `Error loading benefits for membership ${membershipId}:`,
        error
      );
    } finally {
      setLoadingBenefits(false);
    }
  };

  const handleMembershipChange = (id) => {
    setSelectedMembership(id);
    fetchMembershipBenefits(id);

    if (errors.membership) {
      setErrors({ ...errors, membership: "" });
    }
  };

  const sections = [
    { id: "personal", name: "Personal Info", icon: User },
    { id: "contact", name: "Contact Info", icon: Phone },
    { id: "emergency", name: "Emergency Contact", icon: Shield },
    { id: "membership", name: "Membership", icon: CreditCard },
  ];

  const getCurrentSectionIndex = () => {
    return sections.findIndex(section => section.id === activeSection);
  };

  const goToNextSection = () => {
    const currentIndex = getCurrentSectionIndex();
    const currentSectionId = sections[currentIndex].id;
    
    // Check if current section is valid before proceeding
    if (!validateSection(currentSectionId)) {
      // Show specific errors for current section
      const currentSectionErrors = {};
      
      switch (currentSectionId) {
        case "personal":
          if (!formData.firstName.trim())
            currentSectionErrors.firstName = "First name is required";
          if (!formData.lastName.trim()) 
            currentSectionErrors.lastName = "Last name is required";
          // Validate date of birth if provided
          if (formData.dateOfBirth && formData.dateOfBirth.trim()) {
            const validation = validateDate(formData.dateOfBirth);
            if (!validation.isValid) {
              currentSectionErrors.dateOfBirth = validation.error;
            }
          }
          break;
          
        case "contact":
          if (!formData.email.trim()) 
            currentSectionErrors.email = "Email is required";
          else if (!/\S+@\S+\.\S+/.test(formData.email))
            currentSectionErrors.email = "Email is invalid";
          if (!formData.phone.trim()) 
            currentSectionErrors.phone = "Phone number is required";
          break;
          
        case "membership":
          if (assignMembership && !selectedMembership) {
            currentSectionErrors.membership = "Please select a membership plan";
          }
          break;
      }
      
      setErrors({ ...errors, ...currentSectionErrors });
      return;
    }
    
    // Clear general error when moving to next section successfully
    if (errors.general) {
      const { general, ...otherErrors } = errors;
      setErrors(otherErrors);
    }
    
    if (currentIndex < sections.length - 1) {
      setActiveSection(sections[currentIndex + 1].id);
    }
  };

  const goToPreviousSection = () => {
    const currentIndex = getCurrentSectionIndex();
    if (currentIndex > 0) {
      setActiveSection(sections[currentIndex - 1].id);
    }
  };

  const isLastSection = () => {
    return activeSection === "membership";
  };

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
            {sections.map((section, index) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              const currentIndex = getCurrentSectionIndex();
              const isCompleted = currentIndex > index && isSectionCompleted(section.id);
              const isIncomplete = currentIndex > index && isSectionIncomplete(section.id);
              
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 relative ${
                    isActive
                      ? "bg-blue-500 text-white shadow-md"
                      : isCompleted
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : isIncomplete
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "text-gray-600 hover:bg-white hover:shadow-sm"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{section.name}</span>
                  {isCompleted && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {isIncomplete && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((getCurrentSectionIndex() + 1) / sections.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="px-8 py-6 max-h-[60vh] overflow-y-auto">
          {/* General Error Message */}
          {errors.general && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Validation Error</span>
              </div>
              <p className="text-red-700 mt-2 text-sm">
                {errors.general}
              </p>
            </div>
          )}

          {/* Server Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-red-700 mt-2 text-sm">
                {error}
              </p>
            </div>
          )}
          
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
                        type="text"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        placeholder="mm/dd/yyyy"
                        pattern="^(0[1-9]|1[0-2])/(0[1-9]|[12]\d|3[01])/\d{4}$"
                        className={`w-full border-2 rounded-xl px-4 py-3 focus:outline-none transition-all duration-200 ${
                          errors.dateOfBirth
                            ? "border-red-300 focus:border-red-500 bg-red-50"
                            : "border-gray-200 focus:border-blue-500 bg-white"
                        }`}
                      />
                      <Calendar className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.dateOfBirth && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {errors.dateOfBirth}
                      </p>
                    )}
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

            {/* Membership Assignment */}
            {activeSection === "membership" && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-purple-100 rounded-full p-2">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">
                    Membership Assignment
                  </h4>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <Star className="w-5 h-5" />
                    <span className="font-medium">Optional Step</span>
                  </div>
                  <p className="text-blue-700 mt-2 text-sm">
                    You can assign a membership plan now or skip this step and assign it later.
                  </p>
                </div>

                {/* Assign Membership Toggle */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assignMembership}
                      onChange={(e) => setAssignMembership(e.target.checked)}
                      className="h-5 w-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-bold text-gray-700">
                        Assign Membership Plan
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Check this to assign a membership plan to the new member
                      </p>
                    </div>
                  </label>
                </div>

                {/* Membership Selection */}
                {assignMembership && (
                  <div className="space-y-6">
                    {/* Membership Error Message */}
                    {errors.membership && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center space-x-2 text-red-800">
                          <AlertTriangle className="w-5 h-5" />
                          <span className="font-medium">Selection Required</span>
                        </div>
                        <p className="text-red-700 mt-2 text-sm">
                          {errors.membership}
                        </p>
                      </div>
                    )}
                    
                    {loadingMemberships ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">Loading membership plans...</p>
                      </div>
                    ) : memberships.length === 0 ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                        <div className="flex items-center space-x-3">
                          <div className="bg-amber-100 rounded-full p-2">
                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-bold text-amber-800 text-lg">
                              No Active Membership Plans
                            </p>
                            <p className="text-amber-700 mt-1">
                              Please create a membership plan before assigning to members.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Membership Plan Selection */}
                        <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl p-6 border border-gray-100">
                          <h5 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <Star className="w-5 h-5 mr-2 text-purple-600" />
                            Select Membership Plan
                          </h5>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-3">
                                Available Plans *
                              </label>
                              <div className="grid gap-4">
                                {memberships.map((membership) => (
                                  <label
                                    key={membership.id}
                                    className={`flex items-center p-4 bg-white rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                      selectedMembership === membership.id
                                        ? "border-purple-500 bg-purple-50 shadow-md"
                                        : "border-gray-200 hover:border-purple-300"
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name="membership"
                                      value={membership.id}
                                      checked={selectedMembership === membership.id}
                                      onChange={() => handleMembershipChange(membership.id)}
                                      className="h-5 w-5 text-purple-600 border-2 border-gray-300 focus:ring-purple-500 focus:ring-2"
                                    />
                                    <div className="ml-4 flex-1">
                                      <div className="flex items-center justify-between">
                                        <h6 className="font-bold text-gray-800 text-lg">
                                          {membership.membershipName}
                                        </h6>
                                        <div className="flex items-center space-x-2">
                                          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-bold">
                                            <DollarSign className="w-4 h-4 inline mr-1" />
                                            {membership.price}
                                          </span>
                                          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                                            <Clock className="w-4 h-4 inline mr-1" />
                                            {membership.duration} months
                                          </span>
                                        </div>
                                      </div>
                                      {membership.description && (
                                        <p className="text-gray-600 mt-2 text-sm">
                                          {membership.description}
                                        </p>
                                      )}
                                    </div>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Membership Details */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100">
                          <h5 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-blue-600" />
                            Membership Details
                          </h5>

                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2">
                                Start Date *
                              </label>
                              <div className="relative">
                                <input
                                  type="date"
                                  value={startDate}
                                  onChange={(e) => setStartDate(e.target.value)}
                                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all duration-200"
                                />
                                <Calendar className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2">
                                Payment Method *
                              </label>
                              <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all duration-200"
                              >
                                <option value="cash">💵 Cash</option>
                                <option value="credit_card">💳 Credit Card</option>
                                <option value="debit_card">💳 Debit Card</option>
                                <option value="bank_transfer">🏦 Bank Transfer</option>
                                <option value="check">📝 Check</option>
                              </select>
                            </div>
                          </div>

                          {/* Contract Agreement */}
                          <div className="mt-6">
                            <label className="flex items-center p-4 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-all duration-200">
                              <input
                                type="checkbox"
                                checked={contractSigned}
                                onChange={(e) => setContractSigned(e.target.checked)}
                                className="h-5 w-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                              />
                              <div className="ml-3">
                                <span className="text-sm font-bold text-gray-700">
                                  Contract Agreement
                                </span>
                                <p className="text-xs text-gray-500 mt-1">
                                  Member has read and signed the membership contract
                                </p>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* Benefits Preview */}
                        {selectedMembership && membershipBenefits.length > 0 && (
                          <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl p-6 border border-gray-100">
                            <h5 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                              <Star className="w-5 h-5 mr-2 text-green-600" />
                              Included Benefits
                            </h5>
                            <div className="grid gap-3">
                              {membershipBenefits.map((benefit, index) => (
                                <div
                                  key={index}
                                  className="flex items-center space-x-3 bg-white rounded-xl p-3 shadow-sm"
                                >
                                  <div className="bg-green-100 rounded-full p-1">
                                    <Check className="w-4 h-4 text-green-600" />
                                  </div>
                                  <span className="font-medium text-gray-800">
                                    {benefit.benefitName}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
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
            {getCurrentSectionIndex() > 0 && (
              <button
                type="button"
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                onClick={goToPreviousSection}
                disabled={isLoading}
              >
                Previous
              </button>
            )}
            
            <button
              type="button"
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            
            {isLastSection() ? (
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
            ) : (
              <button
                type="button"
                onClick={goToNextSection}
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <span>Next</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
