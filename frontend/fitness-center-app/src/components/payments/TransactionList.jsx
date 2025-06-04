import React, { useState, useMemo } from "react";
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
  ExternalLink,
  Receipt,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import Button from "../common/Button";
import { formatDate, formatCurrency } from "../../utils/formatters";

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
  totalCount = 0,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("transaction_date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [copiedRef, setCopiedRef] = useState("");

  // Copy reference to clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedRef(text);
      setTimeout(() => setCopiedRef(""), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Parse gateway response to get processor name
  const getGatewayProcessor = (gatewayResponse) => {
    try {
      if (!gatewayResponse) return "Unknown";
      const parsed = JSON.parse(gatewayResponse);
      return parsed.processor || "Unknown";
    } catch (error) {
      return "Unknown";
    }
  };

  // Get gateway badge style
  const getGatewayBadgeStyle = (processor) => {
    switch (processor?.toLowerCase()) {
      case "stripe":
        return "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-200";
      case "paypal":
        return "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200";
      case "cash":
        return "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200";
      case "bank_transfer":
        return "bg-gradient-to-r from-gray-600 to-slate-700 text-white shadow-lg shadow-gray-200";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-200";
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
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

  const getStatusDisplayName = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
        return "Success";
      case "failed":
        return "Failed";
      case "pending":
        return "Pending";
      default:
        return status || "Unknown";
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-200";
      case "failed":
        return "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-200";
      case "pending":
        return "bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-200";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
        return <CheckCircle size={14} className="text-white" />;
      case "failed":
        return <XCircle size={14} className="text-white" />;
      case "pending":
        return <Clock size={14} className="text-white" />;
      default:
        return <Clock size={14} className="text-white" />;
    }
  };

  const sortedAndFilteredTransactions = useMemo(() => {
    let filtered = transactions.filter((transaction) => {
      const matchesSearch =
        searchTerm === "" ||
        transaction.transaction_reference
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.transaction_id?.toString().includes(searchTerm) ||
        transaction.payment_id?.toString().includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" ||
        transaction.transaction_status?.toLowerCase() ===
          statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "transaction_date") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
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
  }, [transactions, searchTerm, statusFilter, sortField, sortDirection]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const activeFiltersCount =
    (searchTerm ? 1 : 0) + (statusFilter !== "all" ? 1 : 0);

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
                <div className="h-12 w-28 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
              </div>
            </div>

            {/* Table skeleton */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-purple-50 p-4">
                <div className="grid grid-cols-7 gap-4">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-4 bg-gradient-to-r from-gray-300 to-gray-400 rounded"
                    ></div>
                  ))}
                </div>
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 border-b border-gray-100">
                  <div className="grid grid-cols-7 gap-4">
                    {Array.from({ length: 7 }).map((_, j) => (
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

  if (!transactions.length && !loading) {
    return (
      <div className="bg-gradient-to-br from-white via-gray-50 to-purple-50 rounded-2xl shadow-xl border border-gray-200 p-16 text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-indigo-200 flex items-center justify-center shadow-lg">
          <Receipt size={32} className="text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          No transactions found
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
          There are no transactions in the system yet. Transactions are
          automatically created after payment processing.
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
    );
  }

  const renderPaginationButton = (page, isCurrent = false) => (
    <button
      key={page}
      onClick={() => onPageChange(page)}
      disabled={loading}
      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold transition-all duration-300 ${
        isCurrent
          ? "z-10 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg transform scale-105"
          : "bg-white border border-gray-300 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:border-purple-300 hover:text-purple-700 hover:shadow-md"
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
      <div className="bg-gradient-to-r from-gray-50 via-purple-50 to-indigo-50 border-t border-gray-200">
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
              <span className="text-purple-600">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              -{" "}
              <span className="text-purple-600">
                {Math.min(currentPage * pageSize, totalCount)}
              </span>{" "}
              of <span className="text-indigo-600 font-bold">{totalCount}</span>{" "}
              transactions
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
      <div className="bg-gradient-to-br from-white via-gray-50 to-purple-50 rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search transactions (ID, reference number, payment ID...)"
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
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
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
        {sortedAndFilteredTransactions.length !== transactions.length && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
            <div className="text-sm font-semibold text-purple-800">
              Showing {sortedAndFilteredTransactions.length} of{" "}
              {transactions.length} transactions
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
            <thead className="bg-gradient-to-r from-slate-50 via-purple-50 to-indigo-50 border-b border-gray-200">
              <tr>
                <th
                  className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-purple-100/50 transition-all duration-300 rounded-tl-3xl"
                  onClick={() => handleSort("transaction_id")}
                >
                  <div className="flex items-center gap-2">
                    Transaction ID
                    {getSortIcon("transaction_id")}
                  </div>
                </th>
                <th
                  className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-purple-100/50 transition-all duration-300"
                  onClick={() => handleSort("payment_id")}
                >
                  <div className="flex items-center gap-2">
                    Payment ID
                    {getSortIcon("payment_id")}
                  </div>
                </th>
                <th
                  className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-purple-100/50 transition-all duration-300"
                  onClick={() => handleSort("transaction_date")}
                >
                  <div className="flex items-center gap-2">
                    Date
                    {getSortIcon("transaction_date")}
                  </div>
                </th>
                <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Reference
                </th>
                <th
                  className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-purple-100/50 transition-all duration-300"
                  onClick={() => handleSort("transaction_status")}
                >
                  <div className="flex items-center gap-2">
                    Status
                    {getSortIcon("transaction_status")}
                  </div>
                </th>
                <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Gateway Response
                </th>
                <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider rounded-tr-3xl">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {sortedAndFilteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-purple-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
                        <Search size={28} className="text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        No transactions found
                      </h3>
                      <p className="text-gray-500 text-lg">
                        No transactions match your search criteria.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedAndFilteredTransactions.map((transaction, index) => (
                  <tr
                    key={transaction.transaction_id || index}
                    className="border-b border-gray-50 hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-indigo-50/30 transition-all duration-300 group hover:shadow-md hover:scale-[1.01] hover:rounded-xl"
                  >
                    {/* Transaction ID - Modern rounded square with receipt icon */}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200 group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                            <Receipt
                              size={18}
                              className="text-white font-bold"
                            />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-lg font-bold text-gray-900">
                            #
                            {transaction.transaction_id ||
                              `TXN-${1000 + index}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Payment ID - Modern badge with external link icon */}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                            <ExternalLink
                              size={18}
                              className="text-white font-bold"
                            />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-lg font-bold text-gray-900">
                            #{transaction.payment_id || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Date - Calendar icon with soft badge */}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="inline-flex items-center px-3 py-2 rounded-full bg-gray-100 text-gray-700 font-medium shadow-sm group-hover:shadow-md transition-all duration-300">
                        <Calendar size={14} className="text-gray-500 mr-2" />
                        <span className="text-sm">
                          {formatDate(transaction.transaction_date) || "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Reference - Bold text with copy button */}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-gray-900 font-mono bg-gray-50 px-3 py-1 rounded-lg border">
                          {transaction.transaction_reference || "N/A"}
                        </span>
                        {transaction.transaction_reference && (
                          <button
                            onClick={() =>
                              copyToClipboard(transaction.transaction_reference)
                            }
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 hover:scale-110"
                            title="Copy reference"
                          >
                            {copiedRef === transaction.transaction_reference ? (
                              <CheckCircle
                                size={14}
                                className="text-green-600"
                              />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Status - Modern badge with icon */}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div
                        className={`inline-flex items-center px-4 py-2 rounded-xl font-bold text-sm ${getStatusBadgeStyle(
                          transaction.transaction_status
                        )} group-hover:scale-105 transition-all duration-300`}
                      >
                        <span className="mr-2">
                          {getStatusIcon(transaction.transaction_status)}
                        </span>
                        {getStatusDisplayName(transaction.transaction_status)}
                      </div>
                    </td>

                    {/* Gateway Response - Colored badge */}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div
                        className={`inline-flex items-center px-4 py-2 rounded-xl font-bold text-sm ${getGatewayBadgeStyle(
                          getGatewayProcessor(transaction.gateway_response)
                        )} group-hover:scale-105 transition-all duration-300`}
                      >
                        {getGatewayProcessor(transaction.gateway_response)}
                      </div>
                    </td>

                    {/* Actions - Modern flat icons */}
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(transaction)}
                            className="p-3 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-300 hover:shadow-lg group-hover:scale-110 hover:rotate-12"
                            title="Edit Transaction"
                          >
                            <Edit size={18} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(transaction)}
                            className="p-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-300 hover:shadow-lg group-hover:scale-110 hover:rotate-12"
                            title="Delete Transaction"
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

export default TransactionList;
