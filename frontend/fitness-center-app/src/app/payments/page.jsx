"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Settings } from 'lucide-react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Loader from '@/components/common/Loader';
import TransactionList from '@/components/payments/TransactionList';
import PaymentCharts from '@/components/payments/PaymentCharts';
import PaymentAnalytics from '@/components/payments/PaymentAnalytics';
import PaymentModal from '@/components/payments/PaymentModal';
import DeletePaymentConfirm from '@/components/payments/DeletePaymentConfirm';
import PaymentMethodsModal from '@/components/payments/PaymentMethodsModal';
import { paymentService } from '@/api';
import { formatCurrency } from '@/utils/formatters';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [paymentStats, setPaymentStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPaymentMethodsModal, setShowPaymentMethodsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchPayments();
    fetchPaymentStats();
  }, [currentPage]);

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

  const handleAddPayment = () => {
    setSelectedPayment(null);
    setModalMode('add');
    setShowPaymentModal(true);
  };

  const handleEditPayment = (payment) => {
    setSelectedPayment(payment);
    setModalMode('edit');
    setShowPaymentModal(true);
  };

  const handleDeletePayment = (payment) => {
    setSelectedPayment(payment);
    setShowDeleteConfirm(true);
  };

  const handleViewPayment = (payment) => {
    // Detail view functionality - can be implemented in the future
    console.log('Viewing payment:', payment);
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
    fetchPayments();
    fetchPaymentStats();
  };

  if (loading && payments.length === 0 && !paymentStats) {
    return <Loader message="Loading payment data..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600 mt-1">Manage and track member payments</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            icon={<Settings size={18} />}
            onClick={() => setShowPaymentMethodsModal(true)}
          >
            Payment Methods
          </Button>
          <Button 
            variant="primary" 
            icon={<Plus size={18} />}
            onClick={handleAddPayment}
          >
            Add New Payment
          </Button>
        </div>
      </div>
      
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
      
      {/* Transaction List */}
      <TransactionList 
        payments={payments}
        onEdit={handleEditPayment}
        onDelete={handleDeletePayment}
        onView={handleViewPayment}
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

      {/* Modals */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSave={handlePaymentSaved}
          payment={selectedPayment}
          mode={modalMode}
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

      {showPaymentMethodsModal && (
        <PaymentMethodsModal
          isOpen={showPaymentMethodsModal}
          onClose={() => setShowPaymentMethodsModal(false)}
        />
      )}
    </div>
  );
};

export default Payments;