import React, { useState, useMemo } from "react";
import {
  Clock,
  User,
  MapPin,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Users,
  Timer,
  CheckCircle,
  PlayCircle,
  Sparkles,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import Button from "../common/Button";
import { formatDateTime } from "../../utils/formatters";

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
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [facilityFilter, setFacilityFilter] = useState("all");
  const [sortField, setSortField] = useState("check_in_time");
  const [sortDirection, setSortDirection] = useState("desc");

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="text-gray-400" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp size={14} className="text-blue-500" />
    ) : (
      <ArrowDown size={14} className="text-blue-500" />
    );
  };

  const getStatusBadge = (record) => {
    if (record.check_out_time) {
      return (
        <StatusBadge
          status="Checked Out"
          variant="default"
          icon={<LogOut size={12} />}
        />
      );
    } else {
      return (
        <StatusBadge
          status="Checked In"
          variant="success"
          icon={<LogIn size={12} />}
        />
      );
    }
  };

  const getStatusIcon = (record) => {
    if (record.check_out_time) {
      return <CheckCircle size={14} className="text-gray-500" />;
    } else {
      return <PlayCircle size={14} className="text-green-500" />;
    }
  };

  const getDurationString = (checkIn, checkOut) => {
    if (!checkOut) return "Active";

    const checkInTime = new Date(checkIn);
    const checkOutTime = new Date(checkOut);
    const duration = checkOutTime - checkInTime;

    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const getDurationBadgeColor = (checkIn, checkOut) => {
    if (!checkOut)
      return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200";

    const duration = new Date(checkOut) - new Date(checkIn);
    const hours = duration / (1000 * 60 * 60);

    if (hours >= 3)
      return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200";
    if (hours >= 1.5)
      return "bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 border-orange-200";
    return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200";
  };

  const filteredAndSortedAttendance = useMemo(() => {
    let filtered = attendance.filter((record) => {
      const matchesSearch =
        !searchTerm ||
        record.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.facility_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !record.check_out_time) ||
        (statusFilter === "completed" && record.check_out_time);

      const matchesFacility =
        facilityFilter === "all" ||
        record.facility_id?.toString() === facilityFilter;

      return matchesSearch && matchesStatus && matchesFacility;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "check_in_time" || sortField === "check_out_time") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    attendance,
    searchTerm,
    statusFilter,
    facilityFilter,
    sortField,
    sortDirection,
  ]);

  // Get unique facilities for filter
  const facilities = useMemo(() => {
    const uniqueFacilities = [];
    const facilityIds = new Set();

    attendance.forEach((record) => {
      if (record.facility_id && !facilityIds.has(record.facility_id)) {
        facilityIds.add(record.facility_id);
        uniqueFacilities.push({
          id: record.facility_id,
          name: record.facility_name || `Facility ${record.facility_id}`,
        });
      }
    });

    return uniqueFacilities;
  }, [attendance]);

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/10 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl overflow-hidden">
      {/* Modern Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-700 to-indigo-800 p-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-32 translate-x-32"></div>

        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  Facility Attendance
                  <Sparkles className="w-5 h-5 text-white/80" />
                </h3>
                <p className="text-white/80 font-medium">
                  {totalCount} total records • Page {currentPage} of{" "}
                  {totalPages}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Modern Search */}
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60"
                />
                <input
                  type="text"
                  placeholder="Search by member or facility..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  spellCheck={false}
                  className="pl-12 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-4 focus:ring-white/20 focus:border-white/50 placeholder-white/60 text-white w-full sm:w-64 transition-all duration-200"
                />
              </div>

              {/* Modern Filters */}
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-4 focus:ring-white/20 focus:border-white/50 text-white"
                >
                  <option value="all" className="text-gray-900">
                    All Status
                  </option>
                  <option value="active" className="text-gray-900">
                    Active
                  </option>
                  <option value="completed" className="text-gray-900">
                    Completed
                  </option>
                </select>

                <select
                  value={facilityFilter}
                  onChange={(e) => setFacilityFilter(e.target.value)}
                  className="px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-4 focus:ring-white/20 focus:border-white/50 text-white"
                >
                  <option value="all" className="text-gray-900">
                    All Facilities
                  </option>
                  {facilities.map((facility) => (
                    <option
                      key={facility.id}
                      value={facility.id}
                      className="text-gray-900"
                    >
                      {facility.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Modern Refresh Button */}
              <button
                onClick={onRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/30 hover:border-white/50 transition-all duration-300 hover:scale-105 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-violet-50/30">
            <tr>
              <th
                className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-violet-50/50 transition-colors duration-200"
                onClick={() => handleSort("member_name")}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-violet-500" />
                  Member
                  {getSortIcon("member_name")}
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-violet-50/50 transition-colors duration-200"
                onClick={() => handleSort("facility_name")}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-500" />
                  Facility
                  {getSortIcon("facility_name")}
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-violet-50/50 transition-colors duration-200"
                onClick={() => handleSort("check_in_time")}
              >
                <div className="flex items-center gap-2">
                  <LogIn className="w-4 h-4 text-green-500" />
                  Check In
                  {getSortIcon("check_in_time")}
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-violet-50/50 transition-colors duration-200"
                onClick={() => handleSort("check_out_time")}
              >
                <div className="flex items-center gap-2">
                  <LogOut className="w-4 h-4 text-red-500" />
                  Check Out
                  {getSortIcon("check_out_time")}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-orange-500" />
                  Duration
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Status
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/70 backdrop-blur-sm divide-y divide-gray-200/50">
            {loading && attendance.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600 text-lg font-medium">
                      Loading attendance records...
                    </p>
                    <p className="text-gray-500 text-sm">
                      Please wait while we fetch the data
                    </p>
                  </div>
                </td>
              </tr>
            ) : filteredAndSortedAttendance.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="p-6 bg-gradient-to-br from-violet-100 to-purple-100 rounded-3xl mb-4">
                      <Activity size={48} className="text-violet-500" />
                    </div>
                    <p className="text-gray-600 text-xl font-bold mb-2">
                      No attendance records found
                    </p>
                    <p className="text-gray-500">
                      Try adjusting your search or filters
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedAttendance.map((record, index) => (
                <tr
                  key={record.attendance_id || index}
                  className="hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/30 transition-all duration-200 group"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-violet-100 to-purple-200 rounded-xl group-hover:scale-110 transition-transform duration-200">
                        <User className="w-5 h-5 text-violet-600" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {record.member_name || "Unknown Member"}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          ID: {record.member_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-200 rounded-xl">
                        <MapPin className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {record.facility_name || "Unknown Facility"}
                        </div>
                        <div className="text-sm text-gray-600">
                          ID: {record.facility_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-green-100 rounded-lg">
                        <Calendar size={12} className="text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {record.check_in_time
                          ? formatDateTime(record.check_in_time)
                          : "-"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      {record.check_out_time ? (
                        <>
                          <div className="p-1 bg-red-100 rounded-lg">
                            <Calendar size={12} className="text-red-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {formatDateTime(record.check_out_time)}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-400 italic">
                          Still active
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-2xl text-xs font-bold border ${getDurationBadgeColor(
                        record.check_in_time,
                        record.check_out_time
                      )}`}
                    >
                      <Timer size={12} />
                      {getDurationString(
                        record.check_in_time,
                        record.check_out_time
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-white rounded-lg shadow-sm">
                        {getStatusIcon(record)}
                      </div>
                      {getStatusBadge(record)}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit && onEdit(record)}
                        className="group flex items-center gap-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-xl transition-all duration-200 hover:scale-105"
                      >
                        <Edit
                          size={14}
                          className="group-hover:rotate-12 transition-transform duration-200"
                        />
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete && onDelete(record)}
                        className="group flex items-center gap-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-xl transition-all duration-200 hover:scale-105"
                      >
                        <Trash2
                          size={14}
                          className="group-hover:scale-110 transition-transform duration-200"
                        />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modern Pagination */}
      {totalPages > 1 && (
        <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-violet-50/30 border-t border-gray-200/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 font-medium">
              Showing{" "}
              <span className="font-bold text-violet-600">
                {Math.min((currentPage - 1) * pageSize + 1, totalCount)}
              </span>{" "}
              to{" "}
              <span className="font-bold text-violet-600">
                {Math.min(currentPage * pageSize, totalCount)}
              </span>{" "}
              of <span className="font-bold text-violet-600">{totalCount}</span>{" "}
              results
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-violet-50 text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-violet-300 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className={`px-4 py-2 font-bold rounded-xl transition-all duration-200 hover:scale-105 ${
                        currentPage === page
                          ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg"
                          : "bg-white hover:bg-violet-50 text-gray-700 border border-gray-200 hover:border-violet-300"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-violet-50 text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-violet-300 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceList;
