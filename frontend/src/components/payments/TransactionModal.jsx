import React, { useState, useEffect } from "react";
import {
  X,
  AlertCircle,
  Save,
  Loader,
  CheckCircle,
  CreditCard,
  Calendar,
  Hash,
  Shield,
  Zap,
  DollarSign,
} from "lucide-react";
import Button from "../common/Button";

const TransactionModal = ({
  isOpen,
  onClose,
  onSave,
  transaction = null,
  payments = [],
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    payment_id: "",
    transaction_date: "",
    transaction_status: "pending",
    transaction_reference: "",
    processor_type: "stripe",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processSuccess, setProcessSuccess] = useState(false);

  useEffect(() => {
    if (transaction) {
      // Edit mode
      setFormData({
        payment_id: transaction.payment_id || "",
        transaction_date: transaction.transaction_date
          ? new Date(transaction.transaction_date).toISOString().slice(0, 16)
          : "",
        transaction_status: transaction.transaction_status || "pending",
        transaction_reference: transaction.transaction_reference || "",
        processor_type: transaction.processor_type || "stripe",
      });
    } else {
      // Add mode
      setFormData({
        payment_id: "",
        transaction_date: new Date().toISOString().slice(0, 16),
        transaction_status: "pending",
        transaction_reference: "",
        processor_type: "stripe",
      });
    }
    setErrors({});
    setProcessing(false);
    setProcessSuccess(false);
  }, [transaction, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.payment_id) {
      newErrors.payment_id = "Payment selection is required";
    }

    if (!formData.transaction_date) {
      newErrors.transaction_date = "Transaction date is required";
    }

    if (!formData.transaction_status) {
      newErrors.transaction_status = "Transaction status is required";
    }

    if (!formData.transaction_reference.trim()) {
      newErrors.transaction_reference = "Reference number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateGatewayResponse = (processorType, status = "succeeded") => {
    const authCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const transactionId = Math.random().toString(36).substring(2, 15);

    const responses = {
      stripe: {
        processor: "Stripe",
        status: status,
        transaction_id: `pi_${transactionId}`,
        auth_code: authCode,
        amount_captured: formData.payment_id ? "auto" : 0,
        currency: "usd",
        created: Math.floor(Date.now() / 1000),
        description: `Payment for transaction ${formData.transaction_reference}`,
        metadata: {
          integration_check: "accept_a_payment",
        },
      },
      paypal: {
        processor: "PayPal",
        status: status,
        transaction_id: `PAY-${transactionId.toUpperCase()}`,
        auth_code: authCode,
        payer_id: `PAYER${Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase()}`,
        payment_method: "paypal",
        currency_code: "USD",
        create_time: new Date().toISOString(),
        intent: "sale",
      },
      visa: {
        processor: "Visa",
        status: status,
        transaction_id: `VSA${transactionId.toUpperCase()}`,
        auth_code: authCode,
        card_type: "credit",
        last_four: Math.floor(1000 + Math.random() * 9000).toString(),
        exp_month: Math.floor(1 + Math.random() * 12),
        exp_year: new Date().getFullYear() + Math.floor(1 + Math.random() * 5),
        avs_result: "Y",
        cvv_result: "M",
      },
      mastercard: {
        processor: "Mastercard",
        status: status,
        transaction_id: `MC${transactionId.toUpperCase()}`,
        auth_code: authCode,
        card_type: "credit",
        last_four: Math.floor(1000 + Math.random() * 9000).toString(),
        exp_month: Math.floor(1 + Math.random() * 12),
        exp_year: new Date().getFullYear() + Math.floor(1 + Math.random() * 5),
        network_response_code: "00",
        processor_response_code: "A",
      },
      amex: {
        processor: "American Express",
        status: status,
        transaction_id: `AMEX${transactionId.toUpperCase()}`,
        auth_code: authCode,
        card_type: "credit",
        last_four: Math.floor(1000 + Math.random() * 9000).toString(),
        exp_month: Math.floor(1 + Math.random() * 12),
        exp_year: new Date().getFullYear() + Math.floor(1 + Math.random() * 5),
        service_code: "101",
        approval_code: authCode,
      },
      bank_transfer: {
        processor: "Bank Transfer",
        status: status,
        transaction_id: `BT${transactionId.toUpperCase()}`,
        auth_code: authCode,
        transfer_type: "ach",
        routing_number: "021000021",
        account_type: "checking",
        settlement_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      },
      cash: {
        processor: "Cash",
        status: status,
        transaction_id: `CASH${transactionId.toUpperCase()}`,
        auth_code: authCode,
        payment_method: "cash",
        received_by: "Front Desk",
        receipt_number: `RC${Math.random()
          .toString(36)
          .substring(2, 10)
          .toUpperCase()}`,
        timestamp: new Date().toISOString(),
      },
      other: {
        processor: "Other",
        status: status,
        transaction_id: `OTH${transactionId.toUpperCase()}`,
        auth_code: authCode,
        payment_method: "manual",
        processed_by: "Administrator",
        notes: "Manual payment processing",
      },
    };

    return JSON.stringify(responses[processorType] || responses.other);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setProcessing(true);
    setProcessSuccess(false);

    try {
      // Payment processing animasyonu - 2 saniye bekle
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Gateway response oluştur
      const gatewayResponse = generateGatewayResponse(
        formData.processor_type,
        "succeeded"
      );

      const submitData = {
        ...formData,
        transaction_date: new Date(formData.transaction_date).toISOString(),
        payment_id: parseInt(formData.payment_id),
        gateway_response: gatewayResponse,
      };

      setProcessing(false);
      setProcessSuccess(true);

      // Success animasyonu göster
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error("Error saving transaction:", error);
      setProcessing(false);
      setProcessSuccess(false);
      setErrors({
        submit:
          "An error occurred while saving the transaction. Please try again.",
      });
    } finally {
      setSaving(false);
    }
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

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto border border-gray-200 transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8 border-b border-gray-200 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-200 rounded-2xl shadow-lg">
              <Zap className="h-8 w-8 text-purple-700" />
            </div>
            <div>
              <h3 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {transaction ? "Edit Transaction" : "Create New Transaction"}
              </h3>
              <p className="text-sm text-gray-600 font-medium mt-1">
                {transaction
                  ? "Update transaction information below"
                  : "Process a new payment transaction"}
              </p>
            </div>
          </div>
          <button
            className="p-3 hover:bg-white hover:bg-opacity-70 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-105"
            onClick={onClose}
            disabled={saving || processing}
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Error message */}
          {errors.submit && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-800">
                    Transaction Error
                  </h3>
                  <p className="text-sm text-red-700 mt-1">{errors.submit}</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Selection */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
              <DollarSign size={16} className="text-green-600" />
              <span>Payment {!transaction && "*"}</span>
            </label>
            {transaction ? (
              <div className="w-full border-2 border-gray-200 rounded-xl px-6 py-4 bg-gradient-to-r from-gray-50 to-green-50 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                    <DollarSign size={20} className="text-green-600" />
                  </div>
                  <span className="text-gray-800 font-bold text-lg">
                    {(() => {
                      const selectedPayment = payments.find(
                        (p) => p.payment_id === parseInt(formData.payment_id)
                      );
                      return selectedPayment
                        ? `#${selectedPayment.payment_id} - ${
                            selectedPayment.member_name ||
                            `Member #${selectedPayment.member_id}`
                          } - $${selectedPayment.amount}`
                        : `Payment #${formData.payment_id}`;
                    })()}
                  </span>
                </div>
              </div>
            ) : (
              <>
                <select
                  name="payment_id"
                  value={formData.payment_id}
                  onChange={handleChange}
                  className={`w-full border-2 rounded-xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md font-medium ${
                    errors.payment_id
                      ? "border-red-500 focus:ring-red-100 focus:border-red-500"
                      : "border-gray-200"
                  }`}
                  required
                >
                  <option value="">Select a payment...</option>
                  {payments.map((payment) => (
                    <option key={payment.payment_id} value={payment.payment_id}>
                      #{payment.payment_id} -{" "}
                      {payment.member_name || `Member #${payment.member_id}`} -
                      ${payment.amount}
                    </option>
                  ))}
                </select>
                {errors.payment_id && (
                  <p className="mt-2 text-sm text-red-600 font-semibold flex items-center space-x-1">
                    <span>⚠</span>
                    <span>{errors.payment_id}</span>
                  </p>
                )}
              </>
            )}
          </div>

          {/* Transaction Date */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
              <Calendar size={16} className="text-blue-600" />
              <span>Transaction Date *</span>
            </label>
            <input
              type="datetime-local"
              name="transaction_date"
              value={formData.transaction_date}
              onChange={handleChange}
              className={`w-full border-2 rounded-xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md font-medium ${
                errors.transaction_date
                  ? "border-red-500 focus:ring-red-100 focus:border-red-500"
                  : "border-gray-200"
              }`}
              required
            />
            {errors.transaction_date && (
              <p className="mt-2 text-sm text-red-600 font-semibold flex items-center space-x-1">
                <span>⚠</span>
                <span>{errors.transaction_date}</span>
              </p>
            )}
          </div>

          {/* Transaction Status */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
              <Shield size={16} className="text-purple-600" />
              <span>Transaction Status *</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  value: "pending",
                  label: "Pending",
                  emoji: "⏳",
                  gradient: "from-amber-500 to-orange-600",
                  bg: "from-amber-50 to-orange-100",
                },
                {
                  value: "success",
                  label: "Success",
                  emoji: "✅",
                  gradient: "from-green-500 to-emerald-600",
                  bg: "from-green-50 to-emerald-100",
                },
                {
                  value: "failed",
                  label: "Failed",
                  emoji: "❌",
                  gradient: "from-red-500 to-pink-600",
                  bg: "from-red-50 to-pink-100",
                },
              ].map((status) => (
                <label
                  key={status.value}
                  className={`relative cursor-pointer p-6 border-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                    formData.transaction_status === status.value
                      ? `bg-gradient-to-br ${status.bg} border-purple-500 shadow-md`
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="transaction_status"
                    value={status.value}
                    checked={formData.transaction_status === status.value}
                    onChange={handleChange}
                    className="absolute opacity-0"
                  />
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div
                      className={`text-3xl ${
                        formData.transaction_status === status.value
                          ? "transform scale-110"
                          : ""
                      } transition-transform duration-300`}
                    >
                      {status.emoji}
                    </div>
                    <span
                      className={`font-bold ${
                        formData.transaction_status === status.value
                          ? "text-purple-700"
                          : "text-gray-700"
                      }`}
                    >
                      {status.label}
                    </span>
                  </div>
                  {formData.transaction_status === status.value && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                </label>
              ))}
            </div>
            {errors.transaction_status && (
              <p className="mt-2 text-sm text-red-600 font-semibold flex items-center space-x-1">
                <span>⚠</span>
                <span>{errors.transaction_status}</span>
              </p>
            )}
          </div>

          {/* Transaction Reference */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
              <Hash size={16} className="text-indigo-600" />
              <span>Reference Number *</span>
            </label>
            <input
              type="text"
              name="transaction_reference"
              value={formData.transaction_reference}
              onChange={handleChange}
              placeholder="e.g. TXN123456789"
              className={`w-full border-2 rounded-xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md font-medium ${
                errors.transaction_reference
                  ? "border-red-500 focus:ring-red-100 focus:border-red-500"
                  : "border-gray-200"
              }`}
              required
            />
            {errors.transaction_reference && (
              <p className="mt-2 text-sm text-red-600 font-semibold flex items-center space-x-1">
                <span>⚠</span>
                <span>{errors.transaction_reference}</span>
              </p>
            )}
          </div>

          {/* Processor Type */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
              <CreditCard size={16} className="text-pink-600" />
              <span>Payment Processor *</span>
            </label>
            <select
              name="processor_type"
              value={formData.processor_type}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 rounded-xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md font-medium"
              required
            >
              <option value="stripe">💳 Stripe</option>
              <option value="paypal">🅿️ PayPal</option>
              <option value="visa">💳 Visa</option>
              <option value="mastercard">💳 Mastercard</option>
              <option value="amex">💳 American Express</option>
              <option value="bank_transfer">🏦 Bank Transfer</option>
              <option value="cash">💵 Cash</option>
              <option value="other">🔧 Other</option>
            </select>
            <p className="text-xs text-gray-500 font-medium">
              Gateway response will be generated automatically upon processing
            </p>
          </div>

          {/* Processing Animation */}
          {(processing || processSuccess) && (
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200 rounded-2xl p-8 shadow-xl">
              <div className="flex flex-col items-center justify-center space-y-6">
                {processing && (
                  <>
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
                    </div>
                    <div className="text-center">
                      <h4 className="text-xl font-black text-blue-700 mb-2">
                        Processing Payment...
                      </h4>
                      <p className="text-sm text-blue-600 font-medium">
                        Please wait while we process your transaction
                      </p>
                    </div>
                    <div className="w-full max-w-xs">
                      <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full animate-pulse transition-all duration-1000"
                          style={{ width: "70%" }}
                        ></div>
                      </div>
                    </div>
                  </>
                )}
                {processSuccess && !processing && (
                  <>
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center animate-bounce">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <h4 className="text-xl font-black text-green-700 mb-2">
                        Payment Processed Successfully! 🎉
                      </h4>
                      <p className="text-sm text-green-600 font-medium">
                        Transaction has been completed and recorded
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={saving || processing}
              className="px-8 py-3 font-bold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving || processing}
              className="px-8 py-3 font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Processing...</span>
                </>
              ) : processSuccess ? (
                <>
                  <CheckCircle size={20} />
                  <span>Success!</span>
                </>
              ) : saving ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Zap size={20} />
                  <span>
                    {transaction
                      ? "💾 Update Transaction"
                      : "⚡ Process Payment"}
                  </span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
