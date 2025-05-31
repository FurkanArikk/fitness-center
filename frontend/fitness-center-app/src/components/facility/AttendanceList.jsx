import React, { useState, useMemo } from 'react';
import { Clock, User, MapPin, Calendar, Search, Filter, RotateCcw, ArrowUpDown, ArrowUp, ArrowDown, LogIn, LogOut, Edit2, Trash2 } from 'lucide-react';
import Button from '../common/Button';
import Pagination from '../common/Pagination';
import { formatDateTime } from '../../utils/formatters';

const AttendanceList = ({ 
  attendance = [], 
  onRefresh, 
  currentPage, 
  totalPages, 
  onPageChange, 
  pageSize, 
  loading = false,
  totalCount = 0,
  onEdit,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [facilityFilter, setFacilityFilter] = useState('all');
  const [sortField, setSortField] = useState('check_in_time');
  const [sortDirection, setSortDirection] = useState('desc');

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

  const getStatusBadge = (record) => {
    if (record.check_out_time) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <LogOut size={12} className="mr-1" />
          Checked Out
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <LogIn size={12} className="mr-1" />
          Checked In
        </span>
      );
    }
  };

  const getDurationString = (checkIn, checkOut) => {
    if (!checkOut) return 'Active';
    
    const checkInTime = new Date(checkIn);
    const checkOutTime = new Date(checkOut);
    const duration = checkOutTime - checkInTime;
    
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const filteredAndSortedAttendance = useMemo(() => {
    let filtered = attendance.filter(record => {
      const matchesSearch = !searchTerm || 
        record.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.facility_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && !record.check_out_time) ||
        (statusFilter === 'completed' && record.check_out_time);

      const matchesFacility = facilityFilter === 'all' || 
        record.facility_id?.toString() === facilityFilter;

      return matchesSearch && matchesStatus && matchesFacility;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'check_in_time' || sortField === 'check_out_time') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [attendance, searchTerm, statusFilter, facilityFilter, sortField, sortDirection]);

  // Get unique facilities for filter
  const facilities = useMemo(() => {
    const uniqueFacilities = [];
    const facilityIds = new Set();
    
    attendance.forEach(record => {
      if (record.facility_id && !facilityIds.has(record.facility_id)) {
        facilityIds.add(record.facility_id);
        uniqueFacilities.push({
          id: record.facility_id,
          name: record.facility_name || `Facility ${record.facility_id}`
        });
      }
    });
    
    return uniqueFacilities;
  }, [attendance]);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Facility Attendance</h3>
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredAndSortedAttendance.length} of {totalCount} attendance records
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by member or facility..."
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
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>

                <select
                  value={facilityFilter}
                  onChange={(e) => setFacilityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Facilities</option>
                  {facilities.map(facility => (
                    <option key={facility.id} value={facility.id}>
                      {facility.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              variant="outline"
              icon={<RotateCcw size={18} />}
              onClick={onRefresh}
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
                onClick={() => handleSort('member_name')}
              >
                <div className="flex items-center space-x-1">
                  <User size={14} />
                  <span>Member</span>
                  {getSortIcon('member_name')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('facility_name')}
              >
                <div className="flex items-center space-x-1">
                  <MapPin size={14} />
                  <span>Facility</span>
                  {getSortIcon('facility_name')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('check_in_time')}
              >
                <div className="flex items-center space-x-1">
                  <LogIn size={14} />
                  <span>Check In</span>
                  {getSortIcon('check_in_time')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('check_out_time')}
              >
                <div className="flex items-center space-x-1">
                  <LogOut size={14} />
                  <span>Check Out</span>
                  {getSortIcon('check_out_time')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <Clock size={14} />
                  <span>Duration</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-500">Loading attendance records...</span>
                  </div>
                </td>
              </tr>
            ) : filteredAndSortedAttendance.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No attendance records found</h3>
                    <p className="text-sm text-gray-500">
                      {attendance.length === 0 
                        ? "No attendance records available." 
                        : "Try adjusting your search or filter criteria."
                      }
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedAttendance.map((record, index) => (
                <tr key={record.attendance_id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <User size={16} className="text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {record.member_name || 'Unknown Member'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {record.member_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin size={16} className="text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {record.facility_name || 'Unknown Facility'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {record.facility_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {record.check_in_time ? formatDateTime(record.check_in_time) : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {record.check_out_time ? formatDateTime(record.check_out_time) : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getDurationString(record.check_in_time, record.check_out_time)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(record)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEdit && onEdit(record)}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                        title="Edit attendance record"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete && onDelete(record)}
                        className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                        title="Delete attendance record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalCount > pageSize && (
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            current={currentPage}
            total={totalCount}
            pageSize={pageSize}
            onChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default AttendanceList;