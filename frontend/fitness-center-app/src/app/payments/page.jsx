"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Settings, CreditCard } from 'lucide-react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Loader from '@/components/common/Loader';
import PaymentList from '@/components/payments/PaymentList';
import TransactionList from '@/components/payments/TransactionList';
import PaymentCharts from '@/components/payments/PaymentCharts';
import PaymentAnalytics from '@/components/payments/PaymentAnalytics';
import PaymentModal from '@/components/payments/PaymentModal';
import DeletePaymentConfirm from '@/components/payments/DeletePaymentConfirm';
import TransactionModal from '@/components/payments/TransactionModal';
import DeleteTransactionConfirm from '@/components/payments/DeleteTransactionConfirm';
import PaymentTypeModal from '@/components/payments/PaymentTypeModal';
import PaymentTypeList from '@/components/payments/PaymentTypeList';
import DeletePaymentTypeConfirm from '@/components/payments/DeletePaymentTypeConfirm';
import { paymentService, memberService } from '@/api';
import { formatCurrency } from '@/utils/formatters';

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
  const [activeTab, setActiveTab] = useState('payments'); // 'payments', 'transactions', or 'types'
  
  // Payment Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  
  // Transaction Modal states
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showDeleteTransactionConfirm, setShowDeleteTransactionConfirm] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionModalMode, setTransactionModalMode] = useState('add'); // 'add' or 'edit'
  
  // Payment Type Modal states
  const [showPaymentTypeModal, setShowPaymentTypeModal] = useState(false);
  const [showDeletePaymentTypeConfirm, setShowDeletePaymentTypeConfirm] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);
  const [paymentTypeModalMode, setPaymentTypeModalMode] = useState('add'); // 'add' or 'edit'
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionPage, setTransactionPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [transactionTotalPages, setTransactionTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [transactionTotalCount, setTransactionTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchPayments();
    fetchPaymentStats();
    fetchMembers();
    if (activeTab === 'types') {
      fetchPaymentTypes();
    } else if (activeTab === 'transactions') {
      fetchTransactions();
    }
  }, [currentPage, transactionPage, activeTab]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await paymentService.getPayments({ page: currentPage, pageSize });
      console.log('Payments API Response:', response); // Debug log
      setPayments(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalItems || 0);
      setError(null);
    } catch (err) {
      setError("Failed to load payment data");
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      const statsData = await paymentService.getPaymentStatistics();
      setPaymentStats(statsData);
    } catch (err) {
      console.error('Error fetching payment stats:', err);
    }
  };

  const fetchMembers = async () => {
    try {
      console.log('[Payments] Fetching members for payment modal...');
      const response = await memberService.getAllMembers();
      console.log('[Payments] Members response:', response);
      
      // Backend response structure'ı kontrol edelim
      let membersList = [];
      if (response && Array.isArray(response.data)) {
        membersList = response.data;
      } else if (response && Array.isArray(response)) {
        membersList = response;
      }
      
      console.log('[Payments] Members list:', membersList);
      setMembers(membersList);
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  };

  const fetchPaymentTypes = async () => {
    setPaymentTypesLoading(true);
    try {
      console.log('[Payments] Fetching payment types...');
      const response = await paymentService.getAllPaymentTypes();
      console.log('[Payments] Payment types response:', response);
      
      let typesList = [];
      if (response && Array.isArray(response.data)) {
        typesList = response.data;
      } else if (response && Array.isArray(response)) {
        typesList = response;
      }
      
      console.log('[Payments] Payment types list:', typesList);
      setPaymentTypes(typesList);
    } catch (err) {
      console.error('Error fetching payment types:', err);
    } finally {
      setPaymentTypesLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setTransactionsLoading(true);
    try {
      console.log('[Payments] Fetching transactions...');
      const response = await paymentService.getTransactions({ page: transactionPage, pageSize });
      console.log('[Payments] Transactions response:', response);
      
      setTransactions(response.data || []);
      setTransactionTotalPages(response.totalPages || 1);
      setTransactionTotalCount(response.totalItems || 0);
      setError(null);
    } catch (err) {
      setError("Failed to load transaction data");
      console.error('Error fetching transactions:', err);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleAddPayment = () => {
    console.log('Add New Payment button clicked!'); // Debug log
    setSelectedPayment(null);
    setModalMode('add');
    // Ensure payment types are loaded when opening payment modal
    if (paymentTypes.length === 0) {
      fetchPaymentTypes();
    }
    setShowPaymentModal(true);
  };

  const handleEditPayment = (payment) => {
    setSelectedPayment(payment);
    setModalMode('edit');
    // Ensure payment types are loaded when opening payment modal
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
      console.log('Payment data received in page:', paymentData); // Debug log
      console.log('Modal mode:', modalMode); // Debug log
      console.log('Selected payment:', selectedPayment); // Debug log
      
      if (modalMode === 'add') {
        await paymentService.createPayment(paymentData);
      } else {
        await paymentService.updatePayment(selectedPayment.payment_id, paymentData);
      }
      setShowPaymentModal(false);
      await fetchPayments();
      await fetchPaymentStats();
    } catch (err) {
      console.error('Error saving payment:', err);
      throw err; // Show error in modal
    }
  };

  const handlePaymentDeleted = async () => {
    try {
      await paymentService.deletePayment(selectedPayment.payment_id);
      setShowDeleteConfirm(false);
      await fetchPayments();
      await fetchPaymentStats();
    } catch (err) {
      console.error('Error deleting payment:', err);
      throw err; // Show error in modal
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    if (activeTab === 'payments') {
      fetchPayments();
      fetchPaymentStats();
    } else if (activeTab === 'transactions') {
      fetchTransactions();
    } else if (activeTab === 'types') {
      fetchPaymentTypes();
    }
  };

  // Transaction handlers
  const handleAddTransaction = () => {
    setSelectedTransaction(null);
    setTransactionModalMode('add');
    // Ensure payments are loaded when opening transaction modal
    if (payments.length === 0) {
      fetchPayments();
    }
    setShowTransactionModal(true);
  };

  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setTransactionModalMode('edit');
    // Ensure payments are loaded when opening transaction modal
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
      console.log('Transaction data received in page:', transactionData);
      console.log('Transaction modal mode:', transactionModalMode);
      console.log('Selected transaction:', selectedTransaction);
      
      if (transactionModalMode === 'add') {
        await paymentService.createTransaction(transactionData);
      } else {
        await paymentService.updateTransaction(selectedTransaction.transaction_id, transactionData);
      }
      setShowTransactionModal(false);
      await fetchTransactions();
    } catch (err) {
      console.error('Error saving transaction:', err);
      throw err; // Show error in modal
    }
  };

  const handleTransactionDeleted = async () => {
    try {
      await paymentService.deleteTransaction(selectedTransaction.transaction_id);
      setShowDeleteTransactionConfirm(false);
      await fetchTransactions();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      throw err; // Show error in modal
    }
  };

  const handleTransactionPageChange = (page) => {
    setTransactionPage(page);
  };

  // Payment Type handlers
  const handleAddPaymentType = () => {
    setSelectedPaymentType(null);
    setPaymentTypeModalMode('add');
    setShowPaymentTypeModal(true);
  };

  const handleEditPaymentType = (paymentType) => {
    setSelectedPaymentType(paymentType);
    setPaymentTypeModalMode('edit');
    setShowPaymentTypeModal(true);
  };

  const handleDeletePaymentType = (paymentType) => {
    setSelectedPaymentType(paymentType);
    setShowDeletePaymentTypeConfirm(true);
  };

  const handlePaymentTypeSaved = async (paymentTypeData) => {
    try {
      console.log('Payment type data received:', paymentTypeData);
      console.log('Payment type modal mode:', paymentTypeModalMode);
      console.log('Selected payment type:', selectedPaymentType);
      
      if (paymentTypeModalMode === 'add') {
        await paymentService.createPaymentType(paymentTypeData);
      } else {
        await paymentService.updatePaymentType(selectedPaymentType.payment_type_id, paymentTypeData);
      }
      setShowPaymentTypeModal(false);
      await fetchPaymentTypes();
    } catch (err) {
      console.error('Error saving payment type:', err);
      throw err; // Show error in modal
    }
  };

  const handlePaymentTypeDeleted = async () => {
    try {
      await paymentService.deletePaymentType(selectedPaymentType.payment_type_id);
      setShowDeletePaymentTypeConfirm(false);
      await fetchPaymentTypes();
    } catch (err) {
      console.error('Error deleting payment type:', err);
      throw err; // Show error in modal
    }
  };

  if (loading && payments.length === 0 && !paymentStats) {
    return <Loader message="Loading payment data..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
            <p className="text-gray-600 mt-1">Manage payments, transactions and payment types</p>
          </div>
          <div className="flex gap-2">
            {activeTab === 'payments' ? (
              <Button 
                variant="primary" 
                icon={<Plus size={18} />}
                onClick={handleAddPayment}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg shadow-sm"
              >
                Add New Payment
              </Button>
            ) : activeTab === 'transactions' ? (
              <Button 
                variant="primary" 
                icon={<Plus size={18} />}
                onClick={handleAddTransaction}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2 rounded-lg shadow-sm"
              >
                Add New Transaction
              </Button>
            ) : (
              <Button 
                variant="primary" 
                icon={<Plus size={18} />}
                onClick={handleAddPaymentType}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg shadow-sm"
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
              onClick={() => setActiveTab('payments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'payments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CreditCard size={16} className="inline mr-1" />
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('types')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'types'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings size={16} className="inline mr-1" />
              Payment Types
            </button>
          </nav>
        </div>
      </div>
      
      {/* Content Area - Conditional rendering based on active tab */}
      {activeTab === 'payments' ? (
        <>
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">Error</h3>
                  <p className="text-sm mt-1">{error}</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PaymentCharts stats={paymentStats} />
          </div>
        </>
      ) : activeTab === 'transactions' ? (
        <>
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">Error</h3>
                  <p className="text-sm mt-1">{error}</p>
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
          <Card>
            <PaymentTypeList
              paymentTypes={paymentTypes}
              onEdit={handleEditPaymentType}
              onDelete={handleDeletePaymentType}
              onRefresh={fetchPaymentTypes}
              isLoading={paymentTypesLoading}
            />
          </Card>
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