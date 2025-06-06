import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import { paymentService, memberService } from "../../api";

const AddPaymentModal = ({
  isOpen,
  onClose,
  onPaymentCreated,
  selectedMemberId = null,
}) => {
  const [formData, setFormData] = useState({
    memberId: selectedMemberId || "",
    amount: "",
    paymentDate: new Date().toISOString().slice(0, 16),
    paymentMethod: "",
    paymentStatus: "pending",
    description: "",
    paymentTypeId: "",
  });

  const [members, setMembers] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memberLoading, setMemberLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [memberError, setMemberError] = useState("");

  // Load payment types and members when modal opens
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  // Set selected member if provided
  useEffect(() => {
    if (selectedMemberId) {
      setFormData((prev) => ({
        ...prev,
        memberId: selectedMemberId,
      }));
    }
  }, [selectedMemberId]);

  const loadInitialData = async () => {
    setLoading(true);
    setMemberLoading(true);
    setError("");
    setMemberError("");

    try {
      // Load payment types and members concurrently
      const [paymentTypesResult, membersResult] = await Promise.allSettled([
        loadPaymentTypes(),
        loadMembers(),
      ]);

      // Handle payment types result
      if (paymentTypesResult.status === "rejected") {
        console.error(
          "Failed to load payment types:",
          paymentTypesResult.reason
        );
        setError("Failed to load payment types. Please try again.");
      }

      // Handle members result
      if (membersResult.status === "rejected") {
        console.error("Failed to load members:", membersResult.reason);
        setMemberError("Failed to load member information. Please try again.");
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      setError("Failed to load required data. Please try again.");
    } finally {
      setLoading(false);
      setMemberLoading(false);
    }
  };

  const loadPaymentTypes = async () => {
    try {
      const response = await paymentService.getAllPaymentTypes();
      const types = response.data || response || [];
      setPaymentTypes(types);
      console.log("Payment types loaded:", types.length);
    } catch (error) {
      console.error("Error loading payment types:", error);
      throw error;
    }
  };

  const loadMembers = async () => {
    try {
      // Try multiple approaches to load members
      let members = [];

      // First try to get all members
      try {
        const response = await memberService.getAllMembers();
        members = response.data || response || [];
        console.log("All members loaded:", members.length);
      } catch (error) {
        console.warn("getAllMembers failed, trying paginated approach:", error);

        // Fallback to paginated members
        const response = await memberService.getMembers(1, 100);
        members = response.data || response.members || [];
        console.log("Paginated members loaded:", members.length);
      }

      // Ensure we have valid member data
      if (!Array.isArray(members)) {
        throw new Error("Invalid member data format received");
      }

      setMembers(members);

      if (members.length === 0) {
        setMemberError("No members found in the system.");
      }
    } catch (error) {
      console.error("Error loading members:", error);
      setMemberError(`Failed to load members: ${error.message}`);
      throw error;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // Validate required fields
      if (!formData.memberId || !formData.amount || !formData.paymentDate) {
        throw new Error("Please fill in all required fields");
      }

      // Prepare data for API (convert to snake_case format expected by backend)
      const paymentData = {
        member_id: parseInt(formData.memberId),
        amount: parseFloat(formData.amount),
        payment_date: new Date(formData.paymentDate).toISOString(),
        payment_method: formData.paymentMethod,
        payment_status: formData.paymentStatus,
        description: formData.description,
        payment_type_id: formData.paymentTypeId
          ? parseInt(formData.paymentTypeId)
          : null,
      };

      console.log("Creating payment with data:", paymentData);

      const newPayment = await paymentService.createPayment(paymentData);

      console.log("Payment created successfully:", newPayment);

      if (onPaymentCreated) {
        onPaymentCreated(newPayment);
      }

      // Reset form
      setFormData({
        memberId: selectedMemberId || "",
        amount: "",
        paymentDate: new Date().toISOString().slice(0, 16),
        paymentMethod: "",
        paymentStatus: "pending",
        description: "",
        paymentTypeId: "",
      });

      onClose();
    } catch (error) {
      console.error("Error creating payment:", error);
      setError(error.message || "Failed to create payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetryMembers = () => {
    setMemberError("");
    setMemberLoading(true);
    loadMembers().finally(() => setMemberLoading(false));
  };

  if (!isOpen) return null;

  const paymentMethods = [
    "cash",
    "credit_card",
    "debit_card",
    "bank_transfer",
    "check",
  ];

  const paymentStatuses = [
    "pending",
    "completed",
    "failed",
    "cancelled",
    "refunded",
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Payment">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Member Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Member *
          </label>
          {memberLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-500">Loading members...</span>
            </div>
          ) : memberError ? (
            <div className="space-y-2">
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{memberError}</p>
                <button
                  type="button"
                  onClick={handleRetryMembers}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Try Again
                </button>
              </div>
              <select
                name="memberId"
                value={formData.memberId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled
              >
                <option value="">Unable to load members</option>
              </select>
            </div>
          ) : (
            <select
              name="memberId"
              value={formData.memberId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a member</option>
              {members.map((member) => {
                const memberId =
                  member.memberId || member.member_id || member.id;
                const firstName = member.firstName || member.first_name || "";
                const lastName = member.lastName || member.last_name || "";
                const email = member.email || "";

                return (
                  <option key={memberId} value={memberId}>
                    {firstName} {lastName} {email && `(${email})`}
                  </option>
                );
              })}
            </select>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount *
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
            required
          />
        </div>

        {/* Payment Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Date *
          </label>
          <input
            type="datetime-local"
            name="paymentDate"
            value={formData.paymentDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method
          </label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select payment method</option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method.replace("_", " ").toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Status
          </label>
          <select
            name="paymentStatus"
            value={formData.paymentStatus}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>
                {status.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Type
          </label>
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-500">
                Loading payment types...
              </span>
            </div>
          ) : (
            <select
              name="paymentTypeId"
              value={formData.paymentTypeId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select payment type</option>
              {paymentTypes.map((type) => {
                const typeId =
                  type.paymentTypeId || type.payment_type_id || type.id;
                const typeName =
                  type.typeName || type.type_name || type.name || "Unknown";

                return (
                  <option key={typeId} value={typeId}>
                    {typeName}
                  </option>
                );
              })}
            </select>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter payment description"
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting || memberError}
          >
            {submitting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating...</span>
              </div>
            ) : (
              "Create Payment"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddPaymentModal;
