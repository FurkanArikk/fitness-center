import React, { useState, useEffect } from "react";
import {
  Calendar,
  Info,
  CreditCard,
  Star,
  Check,
  X,
  DollarSign,
  FileText,
  Clock,
} from "lucide-react";
import { memberService } from "@/api";

const AssignMembershipModal = ({ member, onClose, onSave, isLoading }) => {
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
  const [errors, setErrors] = useState({});

  // Generate avatar for member
  const getAvatarData = () => {
    const firstName = member?.firstName || "";
    const lastName = member?.lastName || "";
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

  // Load memberships
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

  const validateForm = () => {
    const newErrors = {};

    if (!selectedMembership)
      newErrors.membership = "Please select a membership plan";
    if (!startDate) newErrors.startDate = "Start date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const selectedPlan = memberships.find((m) => m.id === selectedMembership);

      const start = new Date(startDate);
      const end = new Date(start);
      end.setMonth(end.getMonth() + (selectedPlan?.duration || 1));

      const membershipData = {
        memberId: member.id,
        membershipId: selectedMembership,
        startDate,
        endDate: end.toISOString().split("T")[0],
        paymentMethod,
        paymentStatus: paymentMethod === "cash" ? "paid" : "pending",
        contractSigned: true,
      };

      console.log("Sending membership data:", membershipData);
      onSave(membershipData);
    }
  };

  const getSelectedMembershipDetails = () => {
    return memberships.find((m) => m.id === selectedMembership);
  };

  const selectedPlan = getSelectedMembershipDetails();

  // Get membership badge styling
  const getMembershipBadgeClass = (membershipName) => {
    const name = membershipName?.toLowerCase() || "";
    if (name.includes("basic"))
      return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200";
    if (name.includes("premium"))
      return "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-200";
    if (name.includes("gold"))
      return "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border border-amber-200";
    if (name.includes("platinum"))
      return "bg-gradient-to-r from-gray-700 to-gray-800 text-gray-100 border border-gray-600";
    return "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-200";
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case "cash":
        return "💵";
      case "credit_card":
        return "💳";
      case "bank_transfer":
        return "🏦";
      default:
        return "💰";
    }
  };

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
        <div className="bg-gradient-to-r from-green-50 to-blue-50 px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`w-16 h-16 rounded-full ${avatarData.color} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
              >
                {avatarData.initials}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <CreditCard className="w-6 h-6 mr-2 text-green-600" />
                  Assign Membership
                </h3>
                <p className="text-gray-600 font-medium">
                  Assign a membership plan to{" "}
                  {member ? `${member.firstName} ${member.lastName}` : "Member"}
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
            {loadingMemberships ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">
                  Loading membership plans...
                </p>
              </div>
            ) : memberships.length === 0 ? (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-2xl border border-amber-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                    <Info className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-800 text-lg">
                      No Active Membership Plans
                    </p>
                    <p className="text-amber-700 mt-1">
                      Please create a membership plan before assigning to
                      members.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Membership Selection */}
                <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl p-6 border border-gray-100">
                  <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-green-600" />
                    Select Membership Plan
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Available Plans *
                      </label>
                      <div className="grid gap-4">
                        {memberships.map((plan) => (
                          <div
                            key={plan.id}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                              selectedMembership === plan.id
                                ? "border-green-500 bg-green-50 shadow-lg transform scale-105"
                                : "border-gray-200 bg-white hover:border-green-300 hover:shadow-md"
                            }`}
                            onClick={() => handleMembershipChange(plan.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                    selectedMembership === plan.id
                                      ? "border-green-500 bg-green-500"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {selectedMembership === plan.id && (
                                    <Check className="w-4 h-4 text-white" />
                                  )}
                                </div>
                                <div>
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getMembershipBadgeClass(
                                      plan.membershipName
                                    )}`}
                                  >
                                    ⭐ {plan.membershipName}
                                  </span>
                                  <p className="text-gray-600 mt-1 text-sm">
                                    {plan.description}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-green-600">
                                  ${plan.price}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {plan.duration} month
                                  {plan.duration !== 1 ? "s" : ""}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {errors.membership && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <X className="w-4 h-4 mr-1" />
                          {errors.membership}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Selected Plan Details */}
                {selectedPlan && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-gray-100">
                    <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                      <Info className="w-5 h-5 mr-2 text-blue-600" />
                      Plan Details & Benefits
                    </h4>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-700">
                              Plan Name:
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-bold ${getMembershipBadgeClass(
                                selectedPlan.membershipName
                              )}`}
                            >
                              {selectedPlan.membershipName}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-700">
                              Duration:
                            </span>
                            <span className="flex items-center text-gray-600">
                              <Clock className="w-4 h-4 mr-1" />
                              {selectedPlan.duration} month
                              {selectedPlan.duration !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-700">
                              Price:
                            </span>
                            <span className="text-2xl font-bold text-green-600 flex items-center">
                              <DollarSign className="w-5 h-5" />
                              {selectedPlan.price}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        {loadingBenefits ? (
                          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                            <p className="text-gray-500">Loading benefits...</p>
                          </div>
                        ) : membershipBenefits?.length > 0 ? (
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <h5 className="font-bold text-gray-700 mb-3 flex items-center">
                              <Star className="w-4 h-4 mr-1 text-yellow-500" />
                              Benefits Included:
                            </h5>
                            <div className="space-y-2">
                              {membershipBenefits.map((benefit) => (
                                <div
                                  key={benefit.id}
                                  className="flex items-start"
                                >
                                  <Check className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                                  <div>
                                    <span className="font-semibold text-gray-800">
                                      {benefit.benefitName}:
                                    </span>
                                    <span className="text-gray-600 ml-1">
                                      {benefit.benefitDescription}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                            <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">
                              No benefits configured for this plan
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Membership Details */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100">
                  <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Membership Details
                  </h4>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className={`w-full border-2 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md ${
                            errors.startDate
                              ? "border-red-500"
                              : "border-gray-200"
                          }`}
                        />
                      </div>
                      {errors.startDate && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <X className="w-4 h-4 mr-1" />
                          {errors.startDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Payment Method
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                          className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm hover:shadow-md appearance-none"
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                          <option value="cash">
                            {getPaymentIcon("cash")} Cash
                          </option>
                          <option value="credit_card">
                            {getPaymentIcon("credit_card")} Credit Card
                          </option>
                          <option value="bank_transfer">
                            {getPaymentIcon("bank_transfer")} Bank Transfer
                          </option>
                          <option value="other">
                            {getPaymentIcon("other")} Other
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="flex items-center p-4 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-all duration-200">
                      <input
                        id="contractSigned"
                        type="checkbox"
                        checked={contractSigned}
                        onChange={(e) => setContractSigned(e.target.checked)}
                        className="h-5 w-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
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
              </>
            )}
          </form>
        </div>

        {/* Footer */}
        {memberships.length > 0 && (
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
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Assigning...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Assign Membership
                  </div>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignMembershipModal;
