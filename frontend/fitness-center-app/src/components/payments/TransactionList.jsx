import React, { useState } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/formatters';

const TransactionList = ({ payments = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  if (!payments.length) {
    return (
      <div className="py-4 text-center text-gray-500">
        No transactions found
      </div>
    );
  }
  
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = searchTerm === '' || 
      payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.member_id?.toString().includes(searchTerm);
      
    const matchesStatus = statusFilter === 'all' || 
      payment.payment_status?.toLowerCase() === statusFilter.toLowerCase();
      
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="flex justify-between mb-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="border rounded-md py-2 px-4 pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
        <select 
          className="border rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>
    
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4 text-left">ID</th>
              <th className="py-2 px-4 text-left">Member</th>
              <th className="py-2 px-4 text-left">Date</th>
              <th className="py-2 px-4 text-left">Amount</th>
              <th className="py-2 px-4 text-left">Method</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Description</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment, index) => (
              <tr key={payment.payment_id || index} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{payment.payment_id || `PAY-${1000 + index}`}</td>
                <td className="py-2 px-4">Member #{payment.member_id || 'N/A'}</td>
                <td className="py-2 px-4">{formatDate(payment.payment_date) || 'N/A'}</td>
                <td className="py-2 px-4">{formatCurrency(payment.amount) || 'N/A'}</td>
                <td className="py-2 px-4">{payment.payment_method || 'Credit Card'}</td>
                <td className="py-2 px-4">
                  <StatusBadge 
                    status={payment.payment_status || (index === 1 ? 'Pending' : index === 3 ? 'Failed' : 'Completed')} 
                    type="payment" 
                  />
                </td>
                <td className="py-2 px-4">{payment.description || 'Monthly Membership'}</td>
                <td className="py-2 px-4">
                  <div className="flex space-x-2">
                    <button className="p-1 text-blue-500 hover:bg-blue-50 rounded">
                      <Edit size={16} />
                    </button>
                    <button className="p-1 text-red-500 hover:bg-red-50 rounded">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing {filteredPayments.length} of {payments.length} transactions
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border rounded hover:bg-gray-50">Previous</button>
          <button className="px-3 py-1 border rounded bg-blue-50 text-blue-600">1</button>
          <button className="px-3 py-1 border rounded hover:bg-gray-50">2</button>
          <button className="px-3 py-1 border rounded hover:bg-gray-50">3</button>
          <button className="px-3 py-1 border rounded hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>
  );
};

export default TransactionList;