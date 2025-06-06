import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Edit, 
  Trash2, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  CreditCard, 
  RefreshCw,
  Calendar,
  DollarSign,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import { formatDate, formatCurrency } from '../../utils/formatters';

const TransactionList = ({ 
  transactions = [], 
  onEdit, 
  onDelete, 
  onRefresh,
  currentPage = 1, 
  totalPages = 1, 
  onPageChange, 
  pageSize = 10,
  loading = false,
  totalCount = 0 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('transaction_date');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp size={14} className="text-blue-500" />
      : <ArrowDown size={14} className="text-blue-500" />;
  };

  const getStatusDisplayName = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'Success';
      case 'failed':
        return 'Failed';
      case 'pending':
        return 'Pending';
      default:
        return status || 'Unknown';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const sortedAndFilteredTransactions = useMemo(() => {
    let filtered = transactions.filter(transaction => {
      const matchesSearch = searchTerm === '' || 
        transaction.transaction_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.transaction_id?.toString().includes(searchTerm) ||
        transaction.payment_id?.toString().includes(searchTerm);
        
      const matchesStatus = statusFilter === 'all' || 
        transaction.transaction_status?.toLowerCase() === statusFilter.toLowerCase();
        
      return matchesSearch && matchesStatus;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'transaction_date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase() || '';
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [transactions, searchTerm, statusFilter, sortField, sortDirection]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  const activeFiltersCount = 
    (searchTerm ? 1 : 0) + 
    (statusFilter !== 'all' ? 1 : 0);
  
  if (loading) {
    return (
      <div className="space-y-4">
        {/* Loading skeleton */}
        <div className="animate-pulse">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="h-10 bg-gray-200 rounded-lg flex-1"></div>
            <div className="flex gap-2">
              <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
              <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4">
              <div className="grid grid-cols-7 gap-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 border-b border-gray-200">
                <div className="grid grid-cols-7 gap-4">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (!transactions.length && !loading) {
    return (
      <div className="py-16 text-center bg-white rounded-lg border border-gray-200">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
          <CreditCard size={32} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">No transactions found</h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          There are no transactions in the system yet. Transactions are automatically created after payment processing.
        </p>
      </div>
    );
  }

  const renderPaginationButton = (page, isCurrent = false) => (
    <button
      key={page}
      onClick={() => onPageChange(page)}
      disabled={loading}
      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 ${
        isCurrent
          ? 'z-10 bg-blue-600 border-blue-600 text-white focus:z-20 focus:outline-offset-0'
          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-400 focus:z-20 focus:outline-offset-0'
      } border first:rounded-l-md last:rounded-r-md disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {page}
    </button>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // İlk sayfa
    if (startPage > 1) {
      pages.push(renderPaginationButton(1, false));
      if (startPage > 2) {
        pages.push(<span key="start-ellipsis" className="px-2 py-2 text-gray-500">...</span>);
      }
    }

    // Görünür sayfalar
    for (let i = startPage; i <= endPage; i++) {
      pages.push(renderPaginationButton(i, i === currentPage));
    }

    // Son sayfa
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="end-ellipsis" className="px-2 py-2 text-gray-500">...</span>);
      }
      pages.push(renderPaginationButton(totalPages, false));
    }

    return (
      <div className="bg-white border-t border-gray-200">
        {/* Mobile pagination */}
        <div className="flex justify-between items-center px-4 py-3 sm:hidden">
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            size="sm"
            className="flex items-center gap-1"
          >
            <ChevronLeft size={14} />
            Previous
          </Button>
          <span className="text-sm text-gray-700">
            Page {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            size="sm"
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight size={14} />
          </Button>
        </div>

        {/* Desktop pagination */}
        <div className="hidden sm:flex items-center justify-between px-6 py-4">
          <div className="text-sm text-gray-700">
            <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>
            {' '}-{' '}
            <span className="font-medium">
              {Math.min(currentPage * pageSize, totalCount)}
            </span>
            {' '}of{' '}
            <span className="font-medium">{totalCount}</span>
            {' '}transactions shown
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              size="sm"
              className="flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              Previous
            </Button>
            
            <div className="flex space-x-1">
              {pages}
            </div>
            
            <Button
              variant="outline"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              size="sm"
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search transactions (ID, reference number, payment ID...)" 
              className="w-full border border-gray-300 rounded-lg py-2.5 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <select 
              className="border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[140px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            {/* Clear button */}
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                size="sm"
                className="flex items-center gap-1"
              >
                <Filter size={14} />
                Clear ({activeFiltersCount})
              </Button>
            )}

            {/* Refresh button */}
            {onRefresh && (
              <Button
                variant="outline"
                onClick={onRefresh}
                size="sm"
                disabled={loading}
                className="flex items-center gap-1"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Refresh
              </Button>
            )}
          </div>
        </div>

        {/* Result count */}
        {sortedAndFilteredTransactions.length !== transactions.length && (
          <div className="text-sm text-gray-600 mb-4">
            Showing {sortedAndFilteredTransactions.length} of {transactions.length} transactions
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('transaction_id')}
                >
                  <div className="flex items-center gap-1">
                    Transaction ID
                    {getSortIcon('transaction_id')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('payment_id')}
                >
                  <div className="flex items-center gap-1">
                    Payment ID
                    {getSortIcon('payment_id')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('transaction_date')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    {getSortIcon('transaction_date')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('transaction_status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    {getSortIcon('transaction_status')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gateway Response
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAndFilteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Search size={24} className="text-gray-300 mb-2" />
                      No transactions found matching your search criteria.
                    </div>
                  </td>
                </tr>
              ) : (
                sortedAndFilteredTransactions.map((transaction, index) => (
                  <tr key={transaction.transaction_id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{transaction.transaction_id || `TXN-${1000 + index}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <ExternalLink size={14} className="text-gray-400 mr-2" />
                        <span className="font-medium">#{transaction.payment_id || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar size={14} className="text-gray-400 mr-1" />
                        {formatDate(transaction.transaction_date) || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {transaction.transaction_reference || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge 
                        status={getStatusDisplayName(transaction.transaction_status)} 
                        variant={getStatusBadgeColor(transaction.transaction_status)}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="truncate">
                        {transaction.gateway_response ? (
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                            {JSON.parse(transaction.gateway_response).processor || 'N/A'}
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {onEdit && (
                          <button 
                            onClick={() => onEdit(transaction)}
                            className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-1 rounded transition-colors"
                            title="Düzenle"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        {onDelete && (
                          <button 
                            onClick={() => onDelete(transaction)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors"
                            title="Sil"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {renderPagination()}
      </div>
    </div>
  );
};

export default TransactionList;
