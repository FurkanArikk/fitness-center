import React, { useState, useEffect } from "react";
import { X, Gift, Sparkles, Check } from "lucide-react";

const EditBenefitModal = ({
  benefit,
  onClose,
  onSave,
  memberships = [],
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    benefit_name: "",
    benefit_description: "",
    membership_id: "",
  });

  useEffect(() => {
    // If benefit object exists (update case)
    if (benefit && Object.keys(benefit).length > 0) {
      setFormData({
        benefit_name: benefit.benefitName || benefit.benefit_name || "",
        benefit_description:
          benefit.benefitDescription || benefit.benefit_description || "",
        membership_id: benefit.membershipId || benefit.membership_id || "",
      });
    } else {
      // Default values for new creation
      // If there's a membership_id in benefit object (from filter), use it,
      // or if memberships array is not empty, use the first membership
      setFormData({
        benefit_name: "",
        benefit_description: "",
        membership_id:
          benefit && benefit.membership_id
            ? benefit.membership_id
            : memberships.length > 0
            ? memberships[0].id
            : "",
      });
    }
  }, [benefit, memberships]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    setFormData({
      ...formData,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  // Determine title text
  const isNewBenefit = !benefit || Object.keys(benefit).length === 0;
  const modalTitle = isNewBenefit
    ? "Add New Benefit Type"
    : "Edit Benefit Type";

  // Get theme colors based on selected membership
  const getThemeColors = (membershipId) => {
    const selectedMembership = memberships.find(
      (m) => m.id === parseInt(membershipId)
    );
    const membershipName =
      selectedMembership?.membershipName?.toLowerCase() || "";

    if (membershipName.includes("basic")) {
      return {
        gradient: "from-blue-500 to-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-600",
        accent: "bg-blue-500",
      };
    } else if (membershipName.includes("premium")) {
      return {
        gradient: "from-purple-500 to-purple-600",
        bg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-600",
        accent: "bg-purple-500",
      };
    } else if (membershipName.includes("gold")) {
      return {
        gradient: "from-amber-500 to-yellow-500",
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-600",
        accent: "bg-amber-500",
      };
    } else if (membershipName.includes("platinum")) {
      return {
        gradient: "from-slate-600 to-slate-700",
        bg: "bg-slate-50",
        border: "border-slate-200",
        text: "text-slate-600",
        accent: "bg-slate-600",
      };
    }
    return {
      gradient: "from-blue-500 to-purple-600",
      bg: "bg-gray-50",
      border: "border-gray-200",
      text: "text-gray-600",
      accent: "bg-gray-500",
    };
  };

  const theme = getThemeColors(formData.membership_id);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full transform transition-all duration-300 scale-100 overflow-hidden">
        {/* Header with gradient */}
        <div
          className={`relative p-6 bg-gradient-to-r ${theme.gradient} text-white overflow-hidden`}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-20 h-20 border border-white/20 rounded-full"></div>
            <div className="absolute top-8 right-8 w-16 h-16 border border-white/20 rounded-full"></div>
            <div className="absolute bottom-4 left-12 w-12 h-12 border border-white/20 rounded-full"></div>
          </div>

          <div className="relative flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{modalTitle}</h3>
                <p className="text-white/80 mt-1">
                  {isNewBenefit
                    ? "Create a new benefit for members"
                    : "Update benefit information"}
                </p>
              </div>
            </div>

            <button
              className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200 backdrop-blur-sm"
              onClick={onClose}
              disabled={isLoading}
            >
              <X size={24} />
            </button>
          </div>

          {/* Sparkle Effects */}
          <div className="absolute inset-0 pointer-events-none">
            <Sparkles className="absolute top-6 right-16 w-4 h-4 text-white/30 animate-pulse" />
            <Sparkles
              className="absolute bottom-8 left-20 w-3 h-3 text-white/20 animate-pulse"
              style={{ animationDelay: "1s" }}
            />
            <Sparkles
              className="absolute top-12 left-1/2 w-2 h-2 text-white/40 animate-pulse"
              style={{ animationDelay: "2s" }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Benefit Name Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Benefit Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="benefit_name"
                value={formData.benefit_name}
                onChange={handleChange}
                className={`w-full border-2 ${theme.border} rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 placeholder-gray-400 text-gray-900 font-medium`}
                placeholder="Enter benefit name (e.g., 'Free Towel Service')"
                required
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    formData.benefit_name ? theme.accent : "bg-gray-300"
                  } transition-colors duration-300`}
                ></div>
              </div>
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <div className="relative">
              <textarea
                name="benefit_description"
                value={formData.benefit_description}
                onChange={handleChange}
                className={`w-full border-2 ${theme.border} rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 placeholder-gray-400 text-gray-900 resize-none`}
                rows={4}
                placeholder="Describe the benefit in detail..."
                disabled={isLoading}
              />
              <div className="absolute bottom-3 right-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    formData.benefit_description ? theme.accent : "bg-gray-300"
                  } transition-colors duration-300`}
                ></div>
              </div>
            </div>
          </div>

          {/* Membership Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Associated Membership <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="membership_id"
                value={formData.membership_id}
                onChange={handleChange}
                className={`w-full border-2 ${theme.border} rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 text-gray-900 font-medium bg-white appearance-none`}
                required
                disabled={isLoading}
              >
                <option value="">Select a membership plan</option>
                {memberships.map((membership) => {
                  const membershipTheme = getThemeColors(membership.id);
                  return (
                    <option key={membership.id} value={membership.id}>
                      {membership.membershipName} - ${membership.price}
                    </option>
                  );
                })}
              </select>

              {/* Custom Dropdown Arrow */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className={`w-5 h-5 ${theme.text}`}
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

            {/* Membership Preview */}
            {formData.membership_id && (
              <div
                className={`mt-3 p-4 ${theme.bg} ${theme.border} border-2 rounded-xl`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${theme.accent}`}></div>
                  <div>
                    <p className={`font-semibold ${theme.text}`}>
                      {
                        memberships.find(
                          (m) => m.id === parseInt(formData.membership_id)
                        )?.membershipName
                      }
                    </p>
                    <p className="text-gray-600 text-sm">
                      $
                      {
                        memberships.find(
                          (m) => m.id === parseInt(formData.membership_id)
                        )?.price
                      }{" "}
                      membership plan
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              className="px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={`group relative overflow-hidden px-8 py-3 bg-gradient-to-r ${theme.gradient} hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              disabled={
                isLoading || !formData.benefit_name || !formData.membership_id
              }
            >
              {/* Background Animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Button Content */}
              <div className="relative flex items-center space-x-2">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 transform group-hover:scale-110 transition-transform duration-300" />
                    <span>
                      {isNewBenefit ? "Create Benefit" : "Update Benefit"}
                    </span>
                  </>
                )}
              </div>

              {/* Sparkle Effect */}
              {!isLoading && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-2 left-3 w-1 h-1 bg-white rounded-full animate-ping"></div>
                  <div
                    className="absolute top-3 right-4 w-1 h-1 bg-white rounded-full animate-ping"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="absolute bottom-2 left-6 w-1 h-1 bg-white rounded-full animate-ping"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBenefitModal;
