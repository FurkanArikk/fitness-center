import React, { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  Banknote,
  Smartphone,
  DollarSign,
  User,
  Calendar,
  FileText,
  Shield,
} from "lucide-react";
import Button from "../common/Button";
import { formatCurrency } from "../../utils/formatters";
import { memberService } from "../../api";

const PaymentModal = ({
  isOpen,
  onClose,
  onSave,
  payment = null,
  members = [],
  paymentTypes = [],
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    member_id: "",
    amount: "",
    payment_method: "credit_card",
    payment_status: "completed",
    description: "",
    payment_date: new Date().toISOString().split("T")[0],
    payment_type_id:
      paymentTypes.length > 0
        ? paymentTypes[0].payment_type_id || paymentTypes[0].id || 1
        : 1, // Default to first payment type or 1
  });

  const [errors, setErrors] = useState({});
  const [currentMember, setCurrentMember] = useState(null);
  const [loadingMember, setLoadingMember] = useState(false);

  useEffect(() => {
    if (payment) {
      setFormData({
        member_id: payment.member_id || "",
        amount: payment.amount || "",
        payment_method: payment.payment_method || "credit_card",
        payment_status: payment.payment_status || "completed",
        description: payment.description || "",
        payment_date: payment.payment_date
          ? payment.payment_date.split("T")[0]
          : new Date().toISOString().split("T")[0],
        payment_type_id: payment.payment_type_id || 1,
      });

      // Edit modunda spesifik member bilgisini çek
      if (payment.member_id) {
        fetchCurrentMember(payment.member_id);
      }
    } else {
      setFormData({
        member_id: "",
        amount: "",
        payment_method: "credit_card",
        payment_status: "completed",
        description: "",
        payment_date: new Date().toISOString().split("T")[0],
        payment_type_id:
          paymentTypes.length > 0
            ? paymentTypes[0].payment_type_id || paymentTypes[0].id || 1
            : 1,
      });
      setCurrentMember(null);
    }
    setErrors({});
  }, [payment, isOpen]);

  // Spesifik member bilgisini getiren fonksiyon
  const fetchCurrentMember = async (memberId) => {
    setLoadingMember(true);
    try {
      console.log("[PaymentModal] Fetching member details for ID:", memberId);
      const memberData = await memberService.getMember(memberId);
      console.log("[PaymentModal] Member data received:", memberData);
      setCurrentMember(memberData);
    } catch (error) {
      console.error("[PaymentModal] Error fetching member:", error);
      setCurrentMember(null);
    } finally {
      setLoadingMember(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Only validate member_id for new payments
    if (!payment && !formData.member_id) {
      newErrors.member_id = "Member selection is required";
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Format the data according to backend expectations
    const paymentData = {
      member_id: parseInt(formData.member_id),
      amount: parseFloat(formData.amount),
      payment_method: formData.payment_method,
      payment_status: formData.payment_status,
      description: formData.description.trim(),
      payment_date: new Date(
        formData.payment_date + "T00:00:00.000Z"
      ).toISOString(),
      payment_type_id: parseInt(formData.payment_type_id),
    };

    console.log("Sending payment data:", paymentData); // Debug log

    onSave(paymentData);
  };

  const handleChange = (e) => {
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

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "credit_card":
        return <CreditCard size={16} className="text-blue-500" />;
      case "cash":
        return <Banknote size={16} className="text-green-500" />;
      case "bank_transfer":
        return <Smartphone size={16} className="text-purple-500" />;
      default:
        return <CreditCard size={16} className="text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto border border-gray-200 transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex justify-between items-center p-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-200 rounded-2xl shadow-lg">
              <CreditCard className="h-8 w-8 text-blue-700" />
            </div>
            <div>
              <h3 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {payment ? "Edit Payment" : "Add New Payment"}
              </h3>
              <p className="text-sm text-gray-600 font-medium mt-1">
                {payment
                  ? "Update payment information below"
                  : "Create a new payment record for the member"}
              </p>
            </div>
          </div>
          <button
            className="p-3 hover:bg-white hover:bg-opacity-70 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-105"
            onClick={onClose}
            disabled={isLoading}
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Member Selection / Display */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
              <User size={16} className="text-blue-600" />
              <span>Member {!payment && "*"}</span>
            </label>
            {payment ? (
              <div className="w-full border-2 border-gray-200 rounded-xl px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 shadow-sm">
                {loadingMember ? (
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-gray-500 font-medium">
                      Loading member info...
                    </span>
                  </div>
                ) : currentMember ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                      <User size={20} className="text-purple-600" />
                    </div>
                    <span className="text-gray-800 font-bold text-lg">
                      {(() => {
                        const id = currentMember.id || currentMember.memberId;
                        const firstName =
                          currentMember.firstName ||
                          currentMember.first_name ||
                          "";
                        const lastName =
                          currentMember.lastName ||
                          currentMember.last_name ||
                          "";
                        return `#${id} - ${firstName} ${lastName}`;
                      })()}
                    </span>
                  </div>
                ) : (
                  <span className="text-red-600 font-semibold">
                    ⚠ Member information could not be loaded
                  </span>
                )}
              </div>
            ) : (
              <>
                <select
                  name="member_id"
                  value={formData.member_id}
                  onChange={handleChange}
                  className={`w-full border-2 rounded-xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md font-medium ${
                    errors.member_id
                      ? "border-red-500 focus:ring-red-100 focus:border-red-500"
                      : "border-gray-200"
                  }`}
                  required
                >
                  <option value="">Select a member...</option>
                  {members.map((member) => {
                    const id = member.id || member.memberId;
                    const firstName =
                      member.firstName || member.first_name || "";
                    const lastName = member.lastName || member.last_name || "";
                    return (
                      <option key={id} value={id}>
                        #{id} - {firstName} {lastName}
                      </option>
                    );
                  })}
                </select>
                {errors.member_id && (
                  <p className="mt-2 text-sm text-red-600 font-semibold flex items-center space-x-1">
                    <span>⚠</span>
                    <span>{errors.member_id}</span>
                  </p>
                )}
              </>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
              <DollarSign size={16} className="text-green-600" />
              <span>Amount *</span>
            </label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 transform -translate-y-1/2 text-green-600 font-bold text-lg">
                ₺
              </span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full border-2 rounded-xl pl-12 pr-6 py-4 focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md font-bold text-lg ${
                  errors.amount
                    ? "border-red-500 focus:ring-red-100 focus:border-red-500"
                    : "border-gray-200"
                }`}
                placeholder="0.00"
                required
              />
            </div>
            {errors.amount && (
              <p className="mt-2 text-sm text-red-600 font-semibold flex items-center space-x-1">
                <span>⚠</span>
                <span>{errors.amount}</span>
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-4">
            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
              <CreditCard size={16} className="text-purple-600" />
              <span>Payment Method</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  value: "credit_card",
                  label: "Credit Card",
                  icon: CreditCard,
                  gradient: "from-blue-500 to-indigo-600",
                  bg: "from-blue-50 to-indigo-100",
                },
                {
                  value: "cash",
                  label: "Cash",
                  icon: Banknote,
                  gradient: "from-green-500 to-emerald-600",
                  bg: "from-green-50 to-emerald-100",
                },
                {
                  value: "bank_transfer",
                  label: "Bank Transfer",
                  icon: Smartphone,
                  gradient: "from-purple-500 to-violet-600",
                  bg: "from-purple-50 to-violet-100",
                },
              ].map((method) => (
                <label
                  key={method.value}
                  className={`relative cursor-pointer p-6 border-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                    formData.payment_method === method.value
                      ? `bg-gradient-to-br ${method.bg} border-blue-500 shadow-md`
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={method.value}
                    checked={formData.payment_method === method.value}
                    onChange={handleChange}
                    className="absolute opacity-0"
                  />
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div
                      className={`p-3 rounded-xl ${
                        formData.payment_method === method.value
                          ? `bg-gradient-to-br ${method.bg}`
                          : "bg-gray-100"
                      } shadow-sm`}
                    >
                      <method.icon
                        size={24}
                        className={`${
                          formData.payment_method === method.value
                            ? `bg-gradient-to-r ${method.gradient} bg-clip-text text-transparent`
                            : "text-gray-600"
                        }`}
                      />
                    </div>
                    <span
                      className={`font-bold ${
                        formData.payment_method === method.value
                          ? "text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      {method.label}
                    </span>
                  </div>
                  {formData.payment_method === method.value && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Payment Status */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
              <Shield size={16} className="text-amber-600" />
              <span>Payment Status</span>
            </label>
            <select
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 rounded-xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md font-medium"
            >
              <option value="completed">✅ Completed</option>
              <option value="pending">⏳ Pending</option>
              <option value="failed">❌ Failed</option>
            </select>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
              <FileText size={16} className="text-gray-600" />
              <span>Description *</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full border-2 rounded-xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md font-medium resize-none ${
                errors.description
                  ? "border-red-500 focus:ring-red-100 focus:border-red-500"
                  : "border-gray-200"
              }`}
              placeholder="Enter payment description or notes..."
              required
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-600 font-semibold flex items-center space-x-1">
                <span>⚠</span>
                <span>{errors.description}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
                <Calendar size={16} className="text-blue-600" />
                <span>Payment Date</span>
              </label>
              <input
                type="date"
                name="payment_date"
                value={formData.payment_date}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 rounded-xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md font-medium"
                required
              />
            </div>

            {/* Payment Type */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
                <CreditCard size={16} className="text-purple-600" />
                <span>Payment Type</span>
              </label>
              <select
                name="payment_type_id"
                value={formData.payment_type_id}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 rounded-xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md font-medium"
                required
              >
                {paymentTypes.length > 0 ? (
                  paymentTypes.map((type) => {
                    const typeId = type.payment_type_id || type.id;
                    const typeName =
                      type.type_name || type.name || `Payment Type ${typeId}`;
                    return (
                      <option key={typeId} value={typeId}>
                        {typeName}
                      </option>
                    );
                  })
                ) : (
                  <>
                    <option value={1}>💰 Membership Fee</option>
                    <option value={2}>🏋️ Personal Training</option>
                    <option value={3}>🏃 Equipment Rental</option>
                    <option value={4}>🎯 Class Fee</option>
                    <option value={5}>📋 Other</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Summary */}
          {formData.amount && (
            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6 rounded-2xl border-2 border-green-200 shadow-lg">
              <h4 className="text-lg font-black text-green-800 mb-4 flex items-center space-x-2">
                <DollarSign size={20} className="text-green-600" />
                <span>Payment Summary</span>
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm">
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Total Amount:
                  </span>
                  <span className="font-black text-2xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {formatCurrency(formData.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm">
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Method:
                  </span>
                  <div className="flex items-center space-x-3">
                    {getPaymentMethodIcon(formData.payment_method)}
                    <span className="text-sm font-bold text-gray-800">
                      {formData.payment_method === "credit_card" &&
                        "Credit Card"}
                      {formData.payment_method === "cash" && "Cash"}
                      {formData.payment_method === "bank_transfer" &&
                        "Bank Transfer"}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm">
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Status:
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold ${
                      formData.payment_status === "completed"
                        ? "bg-green-100 text-green-800"
                        : formData.payment_status === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {formData.payment_status === "completed" && "✅ Completed"}
                    {formData.payment_status === "pending" && "⏳ Pending"}
                    {formData.payment_status === "failed" && "❌ Failed"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
              className="px-8 py-3 font-bold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={isLoading}
              className="px-8 py-3 font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              {payment ? "💾 Update Payment" : "✨ Save Payment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
