import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Edit, 
  Trash2, 
  RefreshCw,
  ChevronLeft, 
  ChevronRight,
  Wrench,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatters';

const EquipmentList = ({ 
  equipment = [], 
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
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'working':
        return 'success';
      case 'maintenance':
        return 'warning';
      case 'broken':
        return 'error';
      case 'out_of_order':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusDisplayName = (status) => {
    switch (status?.toLowerCase()) {
      case 'working':
        return 'Working';
      case 'maintenance':
        return 'Maintenance';
      case 'broken':
        return 'Broken';
      case 'out_of_order':
        return 'Out of Order';
      default:
        return status || 'Working';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'working':
        return <CheckCircle size={14} className="text-green-500" />;
      case 'maintenance':
        return <Wrench size={14} className="text-yellow-500" />;
      case 'broken':
      case 'out_of_order':
        return <AlertTriangle size={14} className="text-red-500" />;
      default:
        return <CheckCircle size={14} className="text-gray-500" />;
    }
  };

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

  const filteredAndSortedEquipment = useMemo(() => {
    let filtered = equipment.filter(item => {
      const matchesSearch = !searchTerm || 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [equipment, searchTerm, statusFilter, categoryFilter, sortField, sortDirection]);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Equipment</h3>
            <p className="text-sm text-gray-600 mt-1">
              {totalCount} total equipment • Page {currentPage} of {totalPages}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                spellCheck={false}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="working">Working</option>
                <option value="maintenance">Maintenance</option>
                <option value="broken">Broken</option>
                <option value="out_of_order">Out of Order</option>
              </select>
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="cardio">Cardio</option>
                <option value="strength">Strength</option>
                <option value="functional">Functional</option>
                <option value="free_weights">Free Weights</option>
              </select>
            </div>
            
            {/* Refresh Button */}
            <Button
              variant="outline"
              onClick={onRefresh}
              icon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Equipment Name
                  {getSortIcon('name')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  Status
                  {getSortIcon('status')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Brand/Model
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Maintenance
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('purchase_date')}
              >
                <div className="flex items-center gap-1">
                  Purchase Date
                  {getSortIcon('purchase_date')}
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && equipment.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                    <p className="text-gray-500">Loading equipment...</p>
                  </div>
                </td>
              </tr>
            ) : filteredAndSortedEquipment.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <Wrench size={48} className="text-gray-300 mb-2" />
                    <p className="text-gray-500 text-lg font-medium">No equipment found</p>
                    <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedEquipment.map((item) => (
                <tr key={item.equipment_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.name}
                      </div>
                      {item.description && (
                        <div className="text-sm text-gray-500 mt-1">
                          {item.description.length > 50 
                            ? `${item.description.substring(0, 50)}...` 
                            : item.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                      {item.category || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <StatusBadge 
                        status={getStatusDisplayName(item.status)}
                        variant={getStatusBadgeColor(item.status)}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.brand && (
                        <div className="font-medium">{item.brand}</div>
                      )}
                      {item.model && (
                        <div className="text-gray-500">{item.model}</div>
                      )}
                      {!item.brand && !item.model && (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.last_maintenance_date ? (
                        <div>
                          <div className="text-gray-500">Last: {formatDate(item.last_maintenance_date)}</div>
                          {item.next_maintenance_date && (
                            <div className="text-gray-500">Next: {formatDate(item.next_maintenance_date)}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">No maintenance</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.purchase_date ? formatDate(item.purchase_date) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(item)}
                        icon={<Edit size={14} />}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(item)}
                        icon={<Trash2 size={14} />}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)} to{' '}
              {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                icon={<ChevronLeft size={16} />}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => onPageChange(page)}
                      className={currentPage === page ? "bg-blue-600 text-white" : ""}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                icon={<ChevronRight size={16} />}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentList;
