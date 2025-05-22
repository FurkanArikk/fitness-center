import React from 'react';
import Card from '../common/Card';
import { formatCurrency } from '../../utils/formatters';

const PaymentStats = ({ stats }) => {
  if (!stats) return null;
  
  return (
    <Card title="Payment Statistics">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-500 text-sm">Total Amount</p>
          <p className="text-2xl font-bold">{formatCurrency(stats.total_amount)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-500 text-sm">Avg. Transaction</p>
          <p className="text-2xl font-bold">{formatCurrency(stats.average_amount)}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-500 text-sm">Total Transactions</p>
          <p className="text-2xl font-bold">{stats.total_payments}</p>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="border border-green-200 bg-green-50 p-3 rounded-lg">
          <p className="text-green-600 text-sm">Completed</p>
          <p className="text-xl font-bold text-green-700">{stats.completed_payments}</p>
        </div>
        <div className="border border-yellow-200 bg-yellow-50 p-3 rounded-lg">
          <p className="text-yellow-600 text-sm">Pending</p>
          <p className="text-xl font-bold text-yellow-700">{stats.pending_payments}</p>
        </div>
        <div className="border border-red-200 bg-red-50 p-3 rounded-lg">
          <p className="text-red-600 text-sm">Failed</p>
          <p className="text-xl font-bold text-red-700">{stats.failed_payments}</p>
        </div>
      </div>
    </Card>
  );
};

export default PaymentStats;