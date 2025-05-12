import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import TransactionList from '../components/payments/TransactionList';
import PaymentCharts from '../components/payments/PaymentCharts';
import apiService from '../api/apiService';
import { formatCurrency } from '../utils/formatters';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [paymentStats, setPaymentStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const paymentsData = await apiService.getPayments(1, 10);
        setPayments(paymentsData.data || []);
        
        const statsData = await apiService.getPaymentStatistics();
        setPaymentStats(statsData);
      } catch (err) {
        setError("Failed to load payment data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading && payments.length === 0 && !paymentStats) {
    return <Loader message="Loading payment data..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payment Management</h2>
        <Button 
          variant="primary" 
          icon={<Plus size={18} />}
          onClick={() => console.log('Record new payment')}
        >
          Record New Payment
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Total Revenue (Month)</p>
          <p className="text-2xl font-bold">{formatCurrency(paymentStats?.total_amount || 0)}</p>
          <p className="text-xs text-green-500 mt-2">+8.5% vs. previous month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Payments Processed</p>
          <p className="text-2xl font-bold">{paymentStats?.total_payments || 0}</p>
          <p className="text-xs text-green-500 mt-2">+12% vs. previous month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Average Payment</p>
          <p className="text-2xl font-bold">{formatCurrency(paymentStats?.average_amount || 0)}</p>
          <p className="text-xs text-red-500 mt-2">-2.1% vs. previous month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Pending Payments</p>
          <p className="text-2xl font-bold">{paymentStats?.pending_payments || 0}</p>
          <p className="text-xs text-yellow-500 mt-2">Action required</p>
        </div>
      </div>
      
      <Card title="Recent Transactions">
        <TransactionList payments={payments} />
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentCharts stats={paymentStats} />
      </div>
    </div>
  );
};

export default Payments;