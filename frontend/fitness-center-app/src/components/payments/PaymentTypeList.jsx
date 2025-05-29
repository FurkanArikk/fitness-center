import React, { useState, useMemo } from 'react';
import { 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Tag,
  Calendar
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';

const PaymentTypeList = ({ paymentTypes = [], onEdit, onDelete, isLoading, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('type_name');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
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

  // Filter and sort payment types
  const filteredAndSortedTypes = useMemo(() => {
    let filtered = paymentTypes.filter(type => {
      const matchesSearch = !searchTerm || 
        type.type_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && type.is_active) ||
        (statusFilter === 'inactive' && !type.is_active);

      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'created_at' || sortField === 'updated_at') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase() || '';
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [paymentTypes, searchTerm, statusFilter, sortField, sortDirection]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-center items-center py-16">
          <div className="flex items-center space-x-3 text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="text-sm font-medium">Loading payment types...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header with search and filters */}
      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Tag className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Payment Types</h3>
              <p className="text-sm text-gray-500">
                Manage payment types and their details
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              icon={<RefreshCw size={16} />}
              onClick={onRefresh}
              className="px-4 py-2 text-sm font-medium border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative min-w-0 flex-shrink-0">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm font-medium transition-colors"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Total: <span className="font-medium text-gray-900">{paymentTypes.length}</span></span>
            </span>
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Showing: <span className="font-medium text-gray-900">{filteredAndSortedTypes.length}</span></span>
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      {!paymentTypes || paymentTypes.length === 0 ? (
        <div className="text-center py-16">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <Tag className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <div className="text-lg font-medium text-gray-900 mb-1">No payment types found</div>
              <div className="text-sm text-gray-500">Get started by creating your first payment type</div>
            </div>
          </div>
        </div>
      ) : filteredAndSortedTypes.length === 0 ? (
        <div className="text-center py-16">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-gray-100 rounded-full">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <div className="text-lg font-medium text-gray-900 mb-1">No results found</div>
              <div className="text-sm text-gray-500">Try adjusting your search or filter criteria</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-4 font-semibold text-gray-700 text-sm">
                  <button
                    onClick={() => handleSort('payment_type_id')}
                    className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
                  >
                    <span>ID</span>
                    {getSortIcon('payment_type_id')}
                  </button>
                </th>
                <th className="text-left px-6 py-4 font-semibold text-gray-700 text-sm">
                  <button
                    onClick={() => handleSort('type_name')}
                    className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
                  >
                    <span>Name</span>
                    {getSortIcon('type_name')}
                  </button>
                </th>
                <th className="text-left px-6 py-4 font-semibold text-gray-700 text-sm">Description</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-700 text-sm">
                  <button
                    onClick={() => handleSort('created_at')}
                    className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
                  >
                    <span>Created At</span>
                    {getSortIcon('created_at')}
                  </button>
                </th>
                <th className="text-left px-6 py-4 font-semibold text-gray-700 text-sm">
                  <button
                    onClick={() => handleSort('updated_at')}
                    className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
                  >
                    <span>Updated At</span>
                    {getSortIcon('updated_at')}
                  </button>
                </th>
                <th className="text-left px-6 py-4 font-semibold text-gray-700 text-sm">Status</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-700 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedTypes.map((paymentType, index) => (
                <tr 
                  key={`payment-type-${paymentType.payment_type_id || index}`} 
                  className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      #{paymentType.payment_type_id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Tag className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {paymentType.type_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-xs">
                      {paymentType.description ? (
                        <span className="line-clamp-2">{paymentType.description}</span>
                      ) : (
                        <span className="text-gray-400 italic">No description</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {paymentType.created_at ? formatDate(paymentType.created_at) : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {paymentType.updated_at ? formatDate(paymentType.updated_at) : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge 
                      status={paymentType.is_active ? 'active' : 'inactive'} 
                      type="status"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onEdit(paymentType)}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors group"
                        title="Edit Payment Type"
                      >
                        <Edit2 size={16} className="group-hover:scale-110 transition-transform" />
                      </button>
                      <button
                        onClick={() => onDelete(paymentType)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                        title="Delete Payment Type"
                      >
                        <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentTypeList;
