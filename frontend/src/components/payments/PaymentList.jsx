import React, { useState, useMemo } from "react";
import {
  Search,
  Edit,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Banknote,
  Smartphone,
  RefreshCw,
  Download,
  Calendar,
  User,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  MoreVertical,
  DollarSign,
} from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import Button from "../common/Button";
import { formatDate, formatCurrency } from "../../utils/formatters";

const PaymentList = ({
  payments = [],
  onEdit,
  onDelete,
  onRefresh,
  onExport,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  pageSize = 10,
  loading = false,
  totalCount = 0,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [sortField, setSortField] = useState("payment_date");
  const [sortDirection, setSortDirection] = useState("desc");

  // Generate member initials from name or ID
  const getMemberInitials = (memberName, memberId) => {
    if (memberName && typeof memberName === "string") {
      const names = memberName.trim().split(" ");
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      } else if (names.length === 1) {
        return names[0].substring(0, 2).toUpperCase();
      }
    }
    // Fallback to member ID
    return `M${memberId || "?"}`;
  };

  // Generate consistent avatar colors based on member ID
  const getAvatarColors = (memberId) => {
    const colors = [
      "from-blue-400 to-blue-600",
      "from-green-400 to-green-600",
      "from-purple-400 to-purple-600",
      "from-pink-400 to-pink-600",
      "from-indigo-400 to-indigo-600",
      "from-yellow-400 to-yellow-600",
      "from-red-400 to-red-600",
      "from-teal-400 to-teal-600",
    ];
    const index = (memberId || 1) % colors.length;
    return colors[index];
  };

  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case "credit_card":
        return <CreditCard size={14} className="text-white" />;
      case "debit_card":
        return <CreditCard size={14} className="text-white" />;
      case "cash":
        return <Banknote size={14} className="text-white" />;
      case "bank_transfer":
        return <Smartphone size={14} className="text-white" />;
      default:
        return <CreditCard size={14} className="text-white" />;
    }
  };

  const getMethodBadgeStyle = (method) => {
    switch (method?.toLowerCase()) {
      case "credit_card":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200";
      case "debit_card":
        return "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-200";
      case "cash":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-200";
      case "bank_transfer":
        return "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-200";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-200";
    }
  };

  const getMethodDisplayName = (method) => {
    switch (method?.toLowerCase()) {
      case "credit_card":
        return "Credit Card";
      case "debit_card":
        return "Debit Card";
      case "cash":
        return "Cash";
      case "bank_transfer":
        return "Bank Transfer";
      default:
        return method || "Credit Card";
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-200";
      case "pending":
        return "bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-200";
      case "failed":
        return "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-200";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-200";
    }
  };

  const getTypeBadgeStyle = (typeName) => {
    const typeColors = {
      "Membership Fee":
        "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200",
      "Personal Training":
        "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-200",
      Merchandise:
        "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-200",
      "Class Registration":
        "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200",
      "Event Fee":
        "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg shadow-pink-200",
    };
    return (
      typeColors[typeName] ||
      "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-200"
    );
  };

  const getStatusDisplayName = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "Completed";
      case "pending":
        return "Pending";
      case "failed":
        return "Failed";
      default:
        return status || "Pending";
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

  const sortedAndFilteredPayments = useMemo(() => {
    let filtered = payments.filter((payment) => {
      const matchesSearch =
        searchTerm === "" ||
        payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.member_id?.toString().includes(searchTerm) ||
        payment.payment_id?.toString().includes(searchTerm) ||
        payment.member_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        payment.payment_status?.toLowerCase() === statusFilter.toLowerCase();

      const matchesMethod =
        methodFilter === "all" ||
        payment.payment_method?.toLowerCase() === methodFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesMethod;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "payment_date") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortField === "amount") {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase() || "";
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [
    payments,
    searchTerm,
    statusFilter,
    methodFilter,
    sortField,
    sortDirection,
  ]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setMethodFilter("all");
  };

  const activeFiltersCount =
    (searchTerm ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (methodFilter !== "all" ? 1 : 0);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8">
          <div className="animate-pulse space-y-6">
            {/* Header skeleton */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl flex-1"></div>
              <div className="flex gap-3">
                <div className="h-12 w-36 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
                <div className="h-12 w-36 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
                <div className="h-12 w-28 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
              </div>
            </div>

            {/* Table skeleton */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4">
                <div className="grid grid-cols-8 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded"
                    ></div>
                  ))}
                </div>
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 border-b border-gray-100">
                  <div className="grid grid-cols-8 gap-4">
                    {Array.from({ length: 8 }).map((_, j) => (
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

  if (!payments.length && !loading) {
    return (
      <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-2xl shadow-xl border border-gray-200 p-16 text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shadow-lg">
          <CreditCard size={32} className="text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          No payments found
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
          No payments are registered in the system yet. Start by adding your
          first payment to track financial transactions.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    );
  }

  const renderPaginationButton = (page, isCurrent = false) => (
    <button
      key={page}
      onClick={() => onPageChange(page)}
      disabled={loading}
      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold transition-all duration-300 ${
        isCurrent
          ? "z-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105"
          : "bg-white border border-gray-300 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 hover:text-blue-700 hover:shadow-md"
      } border first:rounded-l-xl last:rounded-r-xl disabled:opacity-50 disabled:cursor-not-allowed hover:z-10`}
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

    // First page
    if (startPage > 1) {
      pages.push(renderPaginationButton(1, false));
      if (startPage > 2) {
        pages.push(
          <span
            key="start-ellipsis"
            className="px-3 py-2 text-gray-500 font-medium"
          >
            ...
          </span>
        );
      }
    }

    // Visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(renderPaginationButton(i, i === currentPage));
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span
            key="end-ellipsis"
            className="px-3 py-2 text-gray-500 font-medium"
          >
            ...
          </span>
        );
      }
      pages.push(renderPaginationButton(totalPages, false));
    }

    return (
      <div className="bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50 border-t border-gray-200">
        {/* Mobile pagination */}
        <div className="flex justify-between items-center px-6 py-4 sm:hidden">
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            size="sm"
            className="flex items-center gap-2 bg-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            <ChevronLeft size={14} />
            Previous
          </Button>
          <span className="text-sm font-semibold text-gray-700 bg-white px-4 py-2 rounded-lg shadow-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            size="sm"
            className="flex items-center gap-2 bg-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            Next
            <ChevronRight size={14} />
          </Button>
        </div>

        {/* Desktop pagination */}
        <div className="hidden sm:flex items-center justify-between px-8 py-6">
          <div className="flex items-center space-x-2">
            <div className="text-sm font-semibold text-gray-700 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <span className="text-blue-600">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              -{" "}
              <span className="text-blue-600">
                {Math.min(currentPage * pageSize, totalCount)}
              </span>{" "}
              of <span className="text-purple-600 font-bold">{totalCount}</span>{" "}
              payments
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              size="sm"
              className="flex items-center gap-2 bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <ChevronLeft size={14} />
              Previous
            </Button>

            <div className="flex space-x-1">{pages}</div>

            <Button
              variant="outline"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              size="sm"
              className="flex items-center gap-2 bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
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
    <div className="space-y-8">
      {/* Header and Filters */}
      <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search payments (ID, description, member ID or name...)"
              className="w-full border-2 border-gray-200 rounded-xl py-3 px-4 pl-12 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md font-medium placeholder-gray-400"
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
              className="border-2 border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 min-w-[160px] bg-white shadow-sm hover:shadow-md transition-all duration-300 font-medium"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            <select
              className="border-2 border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 min-w-[160px] bg-white shadow-sm hover:shadow-md transition-all duration-300 font-medium"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
            >
              <option value="all">All Methods</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
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
            {onRefresh && (
              <Button
                variant="outline"
                onClick={onRefresh}
                size="md"
                disabled={loading}
                className="flex items-center gap-2 bg-white shadow-md hover:shadow-lg transition-all duration-300 border-2 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </Button>
            )}
          </div>
        </div>

        {/* Result count */}
        {sortedAndFilteredPayments.length !== payments.length && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <div className="text-sm font-semibold text-blue-800">
              Showing {sortedAndFilteredPayments.length} of {payments.length}{" "}
              payments
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
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 border-b border-gray-200">
              <tr>
                <th
                  className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100/50 transition-all duration-300 rounded-tl-3xl"
                  onClick={() => handleSort("payment_id")}
                >
                  <div className="flex items-center gap-2">
                    Payment ID
                    {getSortIcon("payment_id")}
                  </div>
                </th>
                <th
                  className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100/50 transition-all duration-300"
                  onClick={() => handleSort("member_id")}
                >
                  <div className="flex items-center gap-2">
                    Member
                    {getSortIcon("member_id")}
                  </div>
                </th>
                <th
                  className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100/50 transition-all duration-300"
                  onClick={() => handleSort("payment_date")}
                >
                  <div className="flex items-center gap-2">
                    Date
                    {getSortIcon("payment_date")}
                  </div>
                </th>
                <th
                  className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100/50 transition-all duration-300"
                  onClick={() => handleSort("amount")}
                >
                  <div className="flex items-center gap-2">
                    Amount
                    {getSortIcon("amount")}
                  </div>
                </th>
                <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th
                  className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100/50 transition-all duration-300"
                  onClick={() => handleSort("payment_status")}
                >
                  <div className="flex items-center gap-2">
                    Status
                    {getSortIcon("payment_status")}
                  </div>
                </th>
                <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider rounded-tr-3xl">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {sortedAndFilteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-blue-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
                        <Search size={28} className="text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        No payments found
                      </h3>
                      <p className="text-gray-500 text-lg">
                        No payments match your search criteria.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedAndFilteredPayments.map((payment, index) => (
                  <tr
                    key={payment.payment_id || index}
                    className="border-b border-gray-50 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30 transition-all duration-300 group hover:shadow-md hover:scale-[1.01] hover:rounded-xl"
                  >
                    {/* Payment ID - Modern rounded square with dollar icon */}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                            <DollarSign
                              size={18}
                              className="text-white font-bold"
                            />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-lg font-bold text-gray-900">
                            #{payment.payment_id || `${1000 + index}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Member - Modern avatar with initials and online dot */}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="relative">
                          <div
                            className={`w-12 h-12 bg-gradient-to-br ${getAvatarColors(
                              payment.member_id
                            )} rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}
                          >
                            <span className="text-white font-bold text-sm">
                              {getMemberInitials(
                                payment.member_name,
                                payment.member_id
                              )}
                            </span>
                          </div>
                          {/* Online indicator dot */}
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg"></div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">
                            Member #{payment.member_id || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500 font-medium">
                            ID: #{payment.member_id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Date - Calendar icon with soft badge */}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="inline-flex items-center px-3 py-2 rounded-full bg-gray-100 text-gray-700 font-medium shadow-sm group-hover:shadow-md transition-all duration-300">
                        <Calendar size={14} className="text-gray-500 mr-2" />
                        <span className="text-sm">
                          {formatDate(payment.payment_date) || "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Amount - Bold, large, green */}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-2xl font-black text-green-600 group-hover:text-green-700 transition-colors duration-300">
                        {formatCurrency(payment.amount) || "$0.00"}
                      </div>
                    </td>

                    {/* Method - Colored badge with icon */}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div
                        className={`inline-flex items-center px-4 py-2 rounded-xl font-bold text-sm ${getMethodBadgeStyle(
                          payment.payment_method
                        )} group-hover:scale-105 transition-all duration-300`}
                      >
                        <span className="mr-2">
                          {getPaymentMethodIcon(payment.payment_method)}
                        </span>
                        {getMethodDisplayName(payment.payment_method)}
                      </div>
                    </td>

                    {/* Type - Colored pill badge */}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div
                        className={`inline-flex items-center px-4 py-2 rounded-full font-bold text-sm ${getTypeBadgeStyle(
                          payment.payment_type_name
                        )} group-hover:scale-105 transition-all duration-300`}
                      >
                        {payment.payment_type_name || "Other"}
                      </div>
                    </td>

                    {/* Status - Modern badge */}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div
                        className={`inline-flex items-center px-4 py-2 rounded-xl font-bold text-sm ${getStatusBadgeStyle(
                          payment.payment_status
                        )} group-hover:scale-105 transition-all duration-300`}
                      >
                        {getStatusDisplayName(payment.payment_status)}
                      </div>
                    </td>

                    {/* Actions - Modern flat icons */}
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(payment)}
                            className="p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-300 hover:shadow-lg group-hover:scale-110 hover:rotate-12"
                            title="Edit Payment"
                          >
                            <Edit size={18} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(payment)}
                            className="p-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-300 hover:shadow-lg group-hover:scale-110 hover:rotate-12"
                            title="Delete Payment"
                          >
                            <Trash2 size={18} />
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

export default PaymentList;
