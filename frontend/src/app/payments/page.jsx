"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Settings,
  CreditCard,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Loader from "@/components/common/Loader";
import PaymentList from "@/components/payments/PaymentList";
import TransactionList from "@/components/payments/TransactionList";
import PaymentCharts from "@/components/payments/PaymentCharts";
import PaymentAnalytics from "@/components/payments/PaymentAnalytics";
import PaymentModal from "@/components/payments/PaymentModal";
import DeletePaymentConfirm from "@/components/payments/DeletePaymentConfirm";
import TransactionModal from "@/components/payments/TransactionModal";
import DeleteTransactionConfirm from "@/components/payments/DeleteTransactionConfirm";
import PaymentTypeModal from "@/components/payments/PaymentTypeModal";
import PaymentTypeList from "@/components/payments/PaymentTypeList";
import DeletePaymentTypeConfirm from "@/components/payments/DeletePaymentTypeConfirm";
import { paymentService, memberService } from "@/api";
import { formatCurrency } from "@/utils/formatters";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [paymentStats, setPaymentStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [paymentTypesLoading, setPaymentTypesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("payments"); // 'payments', 'transactions', or 'types'
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Payment Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'

  // Transaction Modal states
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showDeleteTransactionConfirm, setShowDeleteTransactionConfirm] =
    useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionModalMode, setTransactionModalMode] = useState("add"); // 'add' or 'edit'

  // Payment Type Modal states
  const [showPaymentTypeModal, setShowPaymentTypeModal] = useState(false);
  const [showDeletePaymentTypeConfirm, setShowDeletePaymentTypeConfirm] =
    useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);
  const [paymentTypeModalMode, setPaymentTypeModalMode] = useState("add"); // 'add' or 'edit'

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionPage, setTransactionPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [transactionTotalPages, setTransactionTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [transactionTotalCount, setTransactionTotalCount] = useState(0);
  const pageSize = 10;

  // Memoized fetch functions for performance
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await paymentService.getPayments({
        page: currentPage,
        pageSize,
      });
      console.log("Payments API Response:", response);
      setPayments(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalItems || 0);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Failed to load payment data");
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  const fetchPaymentStats = useCallback(async () => {
    try {
      const statsData = await paymentService.getStatistics();
      setPaymentStats(statsData);
    } catch (err) {
      console.error("Error fetching payment stats:", err);
    }
  }, []);

  const fetchMembers = useCallback(async () => {
    try {
      const response = await memberService.getAllMembers();

      let membersList = [];
      if (response && Array.isArray(response.data)) {
        membersList = response.data;
      } else if (response && Array.isArray(response)) {
        membersList = response;
      }

      setMembers(membersList);
    } catch (err) {
      console.error("Error fetching members:", err);
    }
  }, []);

  const fetchPaymentTypes = useCallback(async () => {
    setPaymentTypesLoading(true);
    try {
      const response = await paymentService.getAllPaymentTypes();

      let typesList = [];
      if (response && Array.isArray(response.data)) {
        typesList = response.data;
      } else if (response && Array.isArray(response)) {
        typesList = response;
      }

      setPaymentTypes(typesList);
    } catch (err) {
      console.error("Error fetching payment types:", err);
    } finally {
      setPaymentTypesLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setTransactionsLoading(true);
    try {
      const response = await paymentService.getTransactions({
        page: transactionPage,
        pageSize,
      });

      setTransactions(response.data || []);
      setTransactionTotalPages(response.totalPages || 1);
      setTransactionTotalCount(response.totalItems || 0);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Failed to load transaction data");
      console.error("Error fetching transactions:", err);
    } finally {
      setTransactionsLoading(false);
    }
  }, [transactionPage, pageSize]);

  // Auto-refresh functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoRefresh) {
        if (activeTab === "payments") {
          fetchPayments();
          fetchPaymentStats();
        } else if (activeTab === "transactions") {
          fetchTransactions();
        } else if (activeTab === "types") {
          fetchPaymentTypes();
        }
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [
    autoRefresh,
    activeTab,
    fetchPayments,
    fetchPaymentStats,
    fetchTransactions,
    fetchPaymentTypes,
  ]);

  useEffect(() => {
    fetchPayments();
    fetchPaymentStats();
    fetchMembers();
    if (activeTab === "types") {
      fetchPaymentTypes();
    } else if (activeTab === "transactions") {
      fetchTransactions();
    }
  }, [
    currentPage,
    transactionPage,
    activeTab,
    fetchPayments,
    fetchPaymentStats,
    fetchMembers,
    fetchPaymentTypes,
    fetchTransactions,
  ]);

  const handleAddPayment = () => {
    console.log("Add New Payment button clicked!");
    setSelectedPayment(null);
    setModalMode("add");
    if (paymentTypes.length === 0) {
      fetchPaymentTypes();
    }
    setShowPaymentModal(true);
  };

  const handleEditPayment = (payment) => {
    setSelectedPayment(payment);
    setModalMode("edit");
    if (paymentTypes.length === 0) {
      fetchPaymentTypes();
    }
    setShowPaymentModal(true);
  };

  const handleDeletePayment = (payment) => {
    setSelectedPayment(payment);
    setShowDeleteConfirm(true);
  };

  const handlePaymentSaved = async (paymentData) => {
    try {
      console.log("Payment data received in page:", paymentData);
      console.log("Modal mode:", modalMode);
      console.log("Selected payment:", selectedPayment);

      if (modalMode === "add") {
        await paymentService.createPayment(paymentData);
      } else {
        await paymentService.updatePayment(
          selectedPayment.payment_id,
          paymentData
        );
      }
      setShowPaymentModal(false);
      await fetchPayments();
      await fetchPaymentStats();
    } catch (err) {
      console.error("Error saving payment:", err);
      throw err;
    }
  };

  const handlePaymentDeleted = async () => {
    try {
      await paymentService.deletePayment(selectedPayment.payment_id);
      setShowDeleteConfirm(false);
      await fetchPayments();
      await fetchPaymentStats();
    } catch (err) {
      console.error("Error deleting payment:", err);
      throw err;
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    if (activeTab === "payments") {
      fetchPayments();
      fetchPaymentStats();
    } else if (activeTab === "transactions") {
      fetchTransactions();
    } else if (activeTab === "types") {
      fetchPaymentTypes();
    }
  };

  // Transaction handlers
  const handleAddTransaction = () => {
    setSelectedTransaction(null);
    setTransactionModalMode("add");
    if (payments.length === 0) {
      fetchPayments();
    }
    setShowTransactionModal(true);
  };

  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setTransactionModalMode("edit");
    if (payments.length === 0) {
      fetchPayments();
    }
    setShowTransactionModal(true);
  };

  const handleDeleteTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDeleteTransactionConfirm(true);
  };

  const handleTransactionSaved = async (transactionData) => {
    try {
      console.log("Transaction data received in page:", transactionData);
      console.log("Transaction modal mode:", transactionModalMode);
      console.log("Selected transaction:", selectedTransaction);

      if (transactionModalMode === "add") {
        await paymentService.createTransaction(transactionData);
      } else {
        await paymentService.updateTransaction(
          selectedTransaction.transaction_id,
          transactionData
        );
      }
      setShowTransactionModal(false);
      await fetchTransactions();
    } catch (err) {
      console.error("Error saving transaction:", err);
      throw err;
    }
  };

  const handleTransactionDeleted = async () => {
    try {
      await paymentService.deleteTransaction(
        selectedTransaction.transaction_id
      );
      setShowDeleteTransactionConfirm(false);
      await fetchTransactions();
    } catch (err) {
      console.error("Error deleting transaction:", err);
      throw err;
    }
  };

  const handleTransactionPageChange = (page) => {
    setTransactionPage(page);
  };

  // Payment Type handlers
  const handleAddPaymentType = () => {
    setSelectedPaymentType(null);
    setPaymentTypeModalMode("add");
    setShowPaymentTypeModal(true);
  };

  const handleEditPaymentType = (paymentType) => {
    setSelectedPaymentType(paymentType);
    setPaymentTypeModalMode("edit");
    setShowPaymentTypeModal(true);
  };

  const handleDeletePaymentType = (paymentType) => {
    setSelectedPaymentType(paymentType);
    setShowDeletePaymentTypeConfirm(true);
  };

  const handlePaymentTypeSaved = async (paymentTypeData) => {
    try {
      console.log("Payment type data received:", paymentTypeData);
      console.log("Payment type modal mode:", paymentTypeModalMode);
      console.log("Selected payment type:", selectedPaymentType);

      if (paymentTypeModalMode === "add") {
        await paymentService.createPaymentType(paymentTypeData);
      } else {
        await paymentService.updatePaymentType(
          selectedPaymentType.payment_type_id,
          paymentTypeData
        );
      }
      setShowPaymentTypeModal(false);
      await fetchPaymentTypes();
    } catch (err) {
      console.error("Error saving payment type:", err);
      throw err;
    }
  };

  const handlePaymentTypeDeleted = async () => {
    try {
      await paymentService.deletePaymentType(
        selectedPaymentType.payment_type_id
      );
      setShowDeletePaymentTypeConfirm(false);
      await fetchPaymentTypes();
    } catch (err) {
      console.error("Error deleting payment type:", err);
      throw err;
    }
  };

  if (loading && payments.length === 0 && !paymentStats) {
    return <Loader message="Loading payment data..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-200 shadow-lg">
              <CreditCard size={32} className="text-blue-700" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Payment Management
              </h1>
              <p className="text-gray-600 mt-2 font-medium">
                Manage payments, transactions and payment types
              </p>
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                </div>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                    autoRefresh
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-gray-100 text-gray-700 border border-gray-200"
                  }`}
                >
                  <RefreshCw
                    size={12}
                    className={autoRefresh ? "animate-spin" : ""}
                  />
                  <span>Auto-refresh {autoRefresh ? "ON" : "OFF"}</span>
                </button>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {activeTab === "payments" ? (
              <Button
                variant="primary"
                icon={<Plus size={20} />}
                onClick={handleAddPayment}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Add New Payment
              </Button>
            ) : activeTab === "transactions" ? (
              <Button
                variant="primary"
                icon={<Plus size={20} />}
                onClick={handleAddTransaction}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Add New Transaction
              </Button>
            ) : (
              <Button
                variant="primary"
                icon={<Plus size={20} />}
                onClick={handleAddPaymentType}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Add Payment Type
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("payments")}
              className={`group py-4 px-6 border-b-3 font-bold text-sm transition-all duration-300 flex items-center space-x-2 ${
                activeTab === "payments"
                  ? "border-blue-500 text-blue-600 bg-blue-50 rounded-t-xl"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-t-xl"
              }`}
            >
              <TrendingUp size={18} />
              <span>Payments</span>
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`group py-4 px-6 border-b-3 font-bold text-sm transition-all duration-300 flex items-center space-x-2 ${
                activeTab === "transactions"
                  ? "border-purple-500 text-purple-600 bg-purple-50 rounded-t-xl"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-t-xl"
              }`}
            >
              <CreditCard size={18} />
              <span>Transactions</span>
            </button>
            <button
              onClick={() => setActiveTab("types")}
              className={`group py-4 px-6 border-b-3 font-bold text-sm transition-all duration-300 flex items-center space-x-2 ${
                activeTab === "types"
                  ? "border-green-500 text-green-600 bg-green-50 rounded-t-xl"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-t-xl"
              }`}
            >
              <Settings size={18} />
              <span>Payment Types</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Content Area - Conditional rendering based on active tab */}
      {activeTab === "payments" ? (
        <>
          {/* Error Message */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-rose-100 border-2 border-red-200 text-red-800 p-6 rounded-2xl shadow-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold">Error</h3>
                  <p className="text-sm mt-1 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Dashboard */}
          <PaymentAnalytics stats={paymentStats} />

          {/* Payment List */}
          <PaymentList
            payments={payments}
            onEdit={handleEditPayment}
            onDelete={handleDeletePayment}
            onRefresh={handleRefresh}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            loading={loading}
            totalCount={totalCount}
          />

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PaymentCharts stats={paymentStats} />
          </div>
        </>
      ) : activeTab === "transactions" ? (
        <>
          {/* Error Message */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-rose-100 border-2 border-red-200 text-red-800 p-6 rounded-2xl shadow-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold">Error</h3>
                  <p className="text-sm mt-1 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Transaction List */}
          <TransactionList
            transactions={transactions}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
            onRefresh={handleRefresh}
            currentPage={transactionPage}
            totalPages={transactionTotalPages}
            onPageChange={handleTransactionPageChange}
            pageSize={pageSize}
            loading={transactionsLoading}
            totalCount={transactionTotalCount}
          />
        </>
      ) : (
        <>
          {/* Payment Types Management */}
          <div className="bg-gradient-to-br from-white via-green-50 to-emerald-50 rounded-2xl shadow-xl border border-gray-200 p-8">
            <PaymentTypeList
              paymentTypes={paymentTypes}
              onEdit={handleEditPaymentType}
              onDelete={handleDeletePaymentType}
              onRefresh={fetchPaymentTypes}
              isLoading={paymentTypesLoading}
            />
          </div>
        </>
      )}

      {/* Modals */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSave={handlePaymentSaved}
          payment={selectedPayment}
          mode={modalMode}
          members={members}
          paymentTypes={paymentTypes}
          isLoading={loading}
        />
      )}

      {showDeleteConfirm && selectedPayment && (
        <DeletePaymentConfirm
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handlePaymentDeleted}
          payment={selectedPayment}
        />
      )}

      {showTransactionModal && (
        <TransactionModal
          isOpen={showTransactionModal}
          onClose={() => setShowTransactionModal(false)}
          onSave={handleTransactionSaved}
          transaction={selectedTransaction}
          payments={payments}
          isLoading={transactionsLoading}
        />
      )}

      {showDeleteTransactionConfirm && selectedTransaction && (
        <DeleteTransactionConfirm
          isOpen={showDeleteTransactionConfirm}
          onClose={() => setShowDeleteTransactionConfirm(false)}
          onConfirm={handleTransactionDeleted}
          transaction={selectedTransaction}
          loading={transactionsLoading}
        />
      )}

      {showPaymentTypeModal && (
        <PaymentTypeModal
          isOpen={showPaymentTypeModal}
          onClose={() => setShowPaymentTypeModal(false)}
          onSave={handlePaymentTypeSaved}
          paymentType={selectedPaymentType}
          isLoading={paymentTypesLoading}
        />
      )}

      {showDeletePaymentTypeConfirm && selectedPaymentType && (
        <DeletePaymentTypeConfirm
          isOpen={showDeletePaymentTypeConfirm}
          onClose={() => setShowDeletePaymentTypeConfirm(false)}
          onConfirm={handlePaymentTypeDeleted}
          paymentType={selectedPaymentType}
          isLoading={paymentTypesLoading}
        />
      )}
    </div>
  );
};

export default Payments;
