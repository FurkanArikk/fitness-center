import React, { useState, useMemo, useEffect } from "react";
import {
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Tag,
  Calendar,
  Plus,
  CheckCircle,
  XCircle,
  Hash,
  FileText,
  Clock,
  Zap,
} from "lucide-react";
import { formatDate } from "../../utils/formatters";
import Button from "../common/Button";
import paymentService from "../../api/paymentService";

const PaymentTypeList = ({ onEdit, onDelete, onRefresh }) => {
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("type_name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [error, setError] = useState(null);

  // Fetch payment types from API
  const fetchPaymentTypes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await paymentService.getAllPaymentTypes();
      setPaymentTypes(response.data || []);
    } catch (error) {
      console.error("Failed to fetch payment types:", error);
      setError("Failed to load payment types");
      setPaymentTypes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPaymentTypes();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchPaymentTypes, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchPaymentTypes();
    if (onRefresh) onRefresh();
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

  const getStatusIcon = (isActive) => {
    return isActive ? (
      <CheckCircle size={14} className="text-white" />
    ) : (
      <XCircle size={14} className="text-white" />
    );
  };

  const getStatusBadgeStyle = (isActive) => {
    return isActive
      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-200"
      : "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-200";
  };

  const getStatusText = (isActive) => {
    return isActive ? "Active" : "Inactive";
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const activeFiltersCount =
    (searchTerm ? 1 : 0) + (statusFilter !== "all" ? 1 : 0);

  // Filter and sort payment types
  const filteredAndSortedTypes = useMemo(() => {
    let filtered = paymentTypes.filter((type) => {
      const matchesSearch =
        !searchTerm ||
        type.type_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && type.is_active) ||
        (statusFilter === "inactive" && !type.is_active);

      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "created_at" || sortField === "updated_at") {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase() || "";
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [paymentTypes, searchTerm, statusFilter, sortField, sortDirection]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8">
          <div className="animate-pulse space-y-6">
            {/* Header skeleton */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl flex-1"></div>
              <div className="flex gap-3">
                <div className="h-12 w-36 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
                <div className="h-12 w-28 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
              </div>
            </div>

            {/* Table skeleton */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-purple-50 p-4">
                <div className="grid grid-cols-6 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded"
                    ></div>
                  ))}
                </div>
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 border-b border-gray-100">
                  <div className="grid grid-cols-6 gap-4">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <div
                        key={j}
                        className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded"
                      ></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 via-white to-red-50 rounded-2xl shadow-xl border border-red-200 p-16 text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-lg">
          <XCircle size={32} className="text-red-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Error Loading Payment Types
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
          {error}
        </p>
        <Button
          onClick={handleRefresh}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <RefreshCw size={18} className="mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header and Filters */}
      <div className="bg-gradient-to-br from-white via-gray-50 to-purple-50 rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search payment types (name, description...)"
              className="w-full border-2 border-gray-200 rounded-xl py-3 px-4 pl-12 focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md font-medium placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              size={20}
              className="absolute left-4 top-3.5 text-gray-400"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <select
              className="border-2 border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 min-w-[160px] bg-white shadow-sm hover:shadow-md transition-all duration-300 font-medium"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Clear button */}
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                size="md"
                className="flex items-center gap-2 bg-white shadow-md hover:shadow-lg transition-all duration-300 border-2 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
              >
                <Filter size={16} />
                Clear ({activeFiltersCount})
              </Button>
            )}

            {/* Refresh button */}
            <Button
              variant="outline"
              onClick={handleRefresh}
              size="md"
              disabled={isLoading}
              className="flex items-center gap-2 bg-white shadow-md hover:shadow-lg transition-all duration-300 border-2 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
            >
              <RefreshCw
                size={16}
                className={isLoading ? "animate-spin" : ""}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Result count */}
        {filteredAndSortedTypes.length !== paymentTypes.length && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
            <div className="text-sm font-semibold text-purple-800">
              Showing {filteredAndSortedTypes.length} of {paymentTypes.length}{" "}
              payment types
              {activeFiltersCount > 0 &&
                ` (${activeFiltersCount} filter${
                  activeFiltersCount > 1 ? "s" : ""
                } applied)`}
            </div>
          </div>
        )}
      </div>

      {/* Modern Table */}
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {!paymentTypes || paymentTypes.length === 0 ? (
          <div className="bg-gradient-to-br from-white via-gray-50 to-purple-50 rounded-2xl shadow-xl border border-gray-200 p-16 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center shadow-lg">
              <Tag size={32} className="text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No payment types found
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              Get started by creating your first payment type to manage
              different categories of payments.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        ) : filteredAndSortedTypes.length === 0 ? (
          <div className="p-16 text-center">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-purple-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Search size={28} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                No payment types found
              </h3>
              <p className="text-gray-500 text-lg">
                No payment types match your search criteria.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-slate-50 via-purple-50 to-indigo-50 border-b border-gray-200">
                <tr>
                  <th
                    className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-purple-100/50 transition-all duration-300 rounded-tl-3xl"
                    onClick={() => handleSort("payment_type_id")}
                  >
                    <div className="flex items-center gap-2">
                      ID
                      {getSortIcon("payment_type_id")}
                    </div>
                  </th>
                  <th
                    className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-purple-100/50 transition-all duration-300"
                    onClick={() => handleSort("type_name")}
                  >
                    <div className="flex items-center gap-2">
                      Name
                      {getSortIcon("type_name")}
                    </div>
                  </th>
                  <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Description
                  </th>
                  <th
                    className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-purple-100/50 transition-all duration-300"
                    onClick={() => handleSort("created_at")}
                  >
                    <div className="flex items-center gap-2">
                      Created At
                      {getSortIcon("created_at")}
                    </div>
                  </th>
                  <th
                    className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-purple-100/50 transition-all duration-300"
                    onClick={() => handleSort("updated_at")}
                  >
                    <div className="flex items-center gap-2">
                      Updated At
                      {getSortIcon("updated_at")}
                    </div>
                  </th>
                  <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider rounded-tr-3xl">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredAndSortedTypes.map((paymentType, index) => (
                  <tr
                    key={`payment-type-${paymentType.payment_type_id || index}`}
                    className="border-b border-gray-50 hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-indigo-50/30 transition-all duration-300 group hover:shadow-md hover:scale-[1.01] hover:rounded-xl"
                  >
                    {/* ID - Modern rounded badge with tag icon */}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                            <Hash size={18} className="text-white font-bold" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-lg font-bold text-gray-900">
                            #
                            {paymentType.payment_type_id ||
                              `PT-${1000 + index}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Name - Bold font with tag icon */}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200 group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                            <Tag size={18} className="text-white font-bold" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-lg font-bold text-gray-900">
                            {paymentType.type_name || "Unnamed Type"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Description - Concise, light gray text */}
                    <td className="px-8 py-6">
                      <div className="max-w-xs">
                        {paymentType.description ? (
                          <div className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                            {paymentType.description}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400 italic">
                            No description provided
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Created At - Calendar icon with pill badge */}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="inline-flex items-center px-3 py-2 rounded-full bg-gray-100 text-gray-700 font-medium shadow-sm group-hover:shadow-md transition-all duration-300">
                        <Calendar size={14} className="text-gray-500 mr-2" />
                        <span className="text-sm">
                          {paymentType.created_at
                            ? formatDate(paymentType.created_at)
                            : "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Updated At - Calendar icon with pill badge */}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="inline-flex items-center px-3 py-2 rounded-full bg-gray-100 text-gray-700 font-medium shadow-sm group-hover:shadow-md transition-all duration-300">
                        <Clock size={14} className="text-gray-500 mr-2" />
                        <span className="text-sm">
                          {paymentType.updated_at
                            ? formatDate(paymentType.updated_at)
                            : "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Status - Colored badge with icon */}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div
                        className={`inline-flex items-center px-4 py-2 rounded-xl font-bold text-sm ${getStatusBadgeStyle(
                          paymentType.is_active
                        )} group-hover:scale-105 transition-all duration-300`}
                      >
                        <span className="mr-2">
                          {getStatusIcon(paymentType.is_active)}
                        </span>
                        {getStatusText(paymentType.is_active)}
                      </div>
                    </td>

                    {/* Actions - Modern flat icons */}
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(paymentType)}
                            className="p-3 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-xl transition-all duration-300 hover:shadow-lg group-hover:scale-110 hover:rotate-12"
                            title="Edit Payment Type"
                          >
                            <Edit size={18} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(paymentType)}
                            className="p-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-300 hover:shadow-lg group-hover:scale-110 hover:rotate-12"
                            title="Delete Payment Type"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentTypeList;
