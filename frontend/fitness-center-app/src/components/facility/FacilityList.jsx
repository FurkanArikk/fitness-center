import React, { useState, useMemo } from "react";
import {
  Search,
  Edit,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  Calendar,
  MapPin,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Phone,
  Users,
  Building2,
  Sparkles,
  Eye,
} from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import Button from "../common/Button";
import { formatDate } from "../../utils/formatters";

const FacilityList = ({
  facilities = [],
  onEdit,
  onDelete,
  onRefresh,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageSize = 10,
  loading = false,
  totalCount = 0,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "success";
      case "inactive":
        return "warning";
      case "maintenance":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusDisplayName = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "Active";
      case "inactive":
        return "Inactive";
      case "maintenance":
        return "Maintenance";
      default:
        return status || "Active";
    }
  };

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

  const filteredAndSortedFacilities = useMemo(() => {
    let filtered = facilities.filter((facility) => {
      const matchesSearch =
        !searchTerm ||
        facility.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || facility.status === statusFilter;
      const matchesType =
        typeFilter === "all" || facility.facility_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [
    facilities,
    searchTerm,
    statusFilter,
    typeFilter,
    sortField,
    sortDirection,
  ]);

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/10 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl overflow-hidden">
      {/* Modern Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-600 via-slate-700 to-gray-800 p-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-32 translate-x-32"></div>

        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  Facilities
                  <Sparkles className="w-5 h-5 text-white/80" />
                </h3>
                <p className="text-white/80 font-medium">
                  {totalCount} total facilities • Page {currentPage} of{" "}
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
                  placeholder="Search facilities..."
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
                  <option value="inactive" className="text-gray-900">
                    Inactive
                  </option>
                  <option value="maintenance" className="text-gray-900">
                    Maintenance
                  </option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-4 focus:ring-white/20 focus:border-white/50 text-white"
                >
                  <option value="all" className="text-gray-900">
                    All Types
                  </option>
                  <option value="gym" className="text-gray-900">
                    Gym
                  </option>
                  <option value="pool" className="text-gray-900">
                    Pool
                  </option>
                  <option value="studio" className="text-gray-900">
                    Studio
                  </option>
                  <option value="court" className="text-gray-900">
                    Court
                  </option>
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
          <thead className="bg-gradient-to-r from-gray-50 to-blue-50/30">
            <tr>
              <th
                className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-blue-50/50 transition-colors duration-200"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  Facility Name
                  {getSortIcon("name")}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-purple-500" />
                  Type
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-blue-50/50 transition-colors duration-200"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-green-500" />
                  Status
                  {getSortIcon("status")}
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-blue-50/50 transition-colors duration-200"
                onClick={() => handleSort("capacity")}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-500" />
                  Capacity
                  {getSortIcon("capacity")}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-pink-500" />
                  Contact
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-blue-50/50 transition-colors duration-200"
                onClick={() => handleSort("created_at")}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  Created
                  {getSortIcon("created_at")}
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/70 backdrop-blur-sm divide-y divide-gray-200/50">
            {loading && facilities.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600 text-lg font-medium">
                      Loading facilities...
                    </p>
                    <p className="text-gray-500 text-sm">
                      Please wait while we fetch the data
                    </p>
                  </div>
                </td>
              </tr>
            ) : filteredAndSortedFacilities.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl mb-4">
                      <MapPin size={48} className="text-blue-500" />
                    </div>
                    <p className="text-gray-600 text-xl font-bold mb-2">
                      No facilities found
                    </p>
                    <p className="text-gray-500">
                      Try adjusting your search or filters
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedFacilities.map((facility, index) => (
                <tr
                  key={facility.facility_id}
                  className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/30 transition-all duration-200 group"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl group-hover:scale-110 transition-transform duration-200">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {facility.name}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center mt-1">
                          <MapPin size={12} className="mr-1 text-gray-400" />
                          {facility.address || "No address"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center px-3 py-1 rounded-2xl text-xs font-bold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 capitalize border border-purple-200">
                      {facility.facility_type || "General"}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <StatusBadge
                      status={getStatusDisplayName(facility.status)}
                      variant={getStatusBadgeColor(facility.status)}
                    />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-orange-100 rounded-lg">
                        <Users size={14} className="text-orange-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {facility.capacity || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm text-gray-900">
                      {facility.phone_number ? (
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-green-100 rounded-lg">
                            <Phone size={12} className="text-green-600" />
                          </div>
                          <span className="font-medium">
                            {facility.phone_number}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No phone</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-600 font-medium">
                    {facility.created_at
                      ? formatDate(facility.created_at)
                      : "N/A"}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(facility)}
                        className="group flex items-center gap-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-xl transition-all duration-200 hover:scale-105"
                      >
                        <Edit
                          size={14}
                          className="group-hover:rotate-12 transition-transform duration-200"
                        />
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(facility)}
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
        <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-200/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 font-medium">
              Showing{" "}
              <span className="font-bold text-blue-600">
                {Math.min((currentPage - 1) * pageSize + 1, totalCount)}
              </span>{" "}
              to{" "}
              <span className="font-bold text-blue-600">
                {Math.min(currentPage * pageSize, totalCount)}
              </span>{" "}
              of <span className="font-bold text-blue-600">{totalCount}</span>{" "}
              results
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-blue-50 text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
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
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                          : "bg-white hover:bg-blue-50 text-gray-700 border border-gray-200 hover:border-blue-300"
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
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-blue-50 text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
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

export default FacilityList;
