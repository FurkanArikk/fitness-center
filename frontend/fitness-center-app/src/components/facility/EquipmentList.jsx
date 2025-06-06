import React, { useState, useMemo } from "react";
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
  CheckCircle,
  Settings,
  Calendar,
  DollarSign,
  Sparkles,
  Filter,
  Package,
} from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import Button from "../common/Button";
import { formatDate } from "../../utils/formatters";

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
  totalCount = 0,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "working":
        return "success";
      case "maintenance":
        return "warning";
      case "broken":
      case "out_of_order":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusDisplayName = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "working":
        return "Working";
      case "maintenance":
        return "Maintenance";
      case "broken":
        return "Broken";
      case "out_of_order":
        return "Out of Order";
      default:
        return status || "Working";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "working":
        return <CheckCircle size={14} className="text-green-500" />;
      case "maintenance":
        return <Wrench size={14} className="text-yellow-500" />;
      case "broken":
      case "out_of_order":
        return <AlertTriangle size={14} className="text-red-500" />;
      default:
        return <CheckCircle size={14} className="text-gray-500" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case "cardio":
        return "🏃";
      case "strength":
        return "💪";
      case "functional":
        return "🤸";
      case "free_weights":
        return "🏋️";
      default:
        return "⚙️";
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

  const filteredAndSortedEquipment = useMemo(() => {
    let filtered = equipment.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.model_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
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
    equipment,
    searchTerm,
    statusFilter,
    categoryFilter,
    sortField,
    sortDirection,
  ]);

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/10 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl overflow-hidden">
      {/* Modern Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-800 p-8">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-32 translate-x-32"></div>

        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  Equipment
                  <Sparkles className="w-5 h-5 text-white/80" />
                </h3>
                <p className="text-white/80 font-medium">
                  {totalCount} total equipment • Page {currentPage} of{" "}
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
                  placeholder="Search equipment..."
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
                  <option value="working" className="text-gray-900">
                    Working
                  </option>
                  <option value="maintenance" className="text-gray-900">
                    Maintenance
                  </option>
                  <option value="broken" className="text-gray-900">
                    Broken
                  </option>
                  <option value="out_of_order" className="text-gray-900">
                    Out of Order
                  </option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-4 focus:ring-white/20 focus:border-white/50 text-white"
                >
                  <option value="all" className="text-gray-900">
                    All Categories
                  </option>
                  <option value="cardio" className="text-gray-900">
                    Cardio
                  </option>
                  <option value="strength" className="text-gray-900">
                    Strength
                  </option>
                  <option value="functional" className="text-gray-900">
                    Functional
                  </option>
                  <option value="free_weights" className="text-gray-900">
                    Free Weights
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
          <thead className="bg-gradient-to-r from-gray-50 to-emerald-50/30">
            <tr>
              <th
                className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-emerald-50/50 transition-colors duration-200"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-500" />
                  Equipment Name
                  {getSortIcon("name")}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-purple-500" />
                  Category
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-emerald-50/50 transition-colors duration-200"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-green-500" />
                  Status
                  {getSortIcon("status")}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-500" />
                  Brand/Model
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-orange-500" />
                  Maintenance
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-emerald-50/50 transition-colors duration-200"
                onClick={() => handleSort("purchase_date")}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  Purchase Date
                  {getSortIcon("purchase_date")}
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/70 backdrop-blur-sm divide-y divide-gray-200/50">
            {loading && equipment.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600 text-lg font-medium">
                      Loading equipment...
                    </p>
                    <p className="text-gray-500 text-sm">
                      Please wait while we fetch the data
                    </p>
                  </div>
                </td>
              </tr>
            ) : filteredAndSortedEquipment.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="p-6 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl mb-4">
                      <Wrench size={48} className="text-emerald-500" />
                    </div>
                    <p className="text-gray-600 text-xl font-bold mb-2">
                      No equipment found
                    </p>
                    <p className="text-gray-500">
                      Try adjusting your search or filters
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedEquipment.map((item) => (
                <tr
                  key={item.equipment_id}
                  className="hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/30 transition-all duration-200 group"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-200 rounded-xl group-hover:scale-110 transition-transform duration-200">
                        <Settings className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {item.name}
                        </div>
                        {item.description && (
                          <div className="text-sm text-gray-600 mt-1">
                            {item.description.length > 50
                              ? `${item.description.substring(0, 50)}...`
                              : item.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl text-xs font-bold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 capitalize border border-purple-200">
                      <span className="text-base">
                        {getCategoryIcon(item.category)}
                      </span>
                      {item.category || "General"}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-white rounded-lg shadow-sm">
                        {getStatusIcon(item.status)}
                      </div>
                      <StatusBadge
                        status={getStatusDisplayName(item.status)}
                        variant={getStatusBadgeColor(item.status)}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm text-gray-900">
                      {item.manufacturer && (
                        <div className="flex items-center gap-2 mb-1">
                          <div className="p-1 bg-blue-100 rounded-lg">
                            <Settings size={12} className="text-blue-600" />
                          </div>
                          <span className="font-bold">{item.manufacturer}</span>
                        </div>
                      )}
                      {item.model_number && (
                        <div className="text-gray-600 ml-6 text-xs">
                          Model: {item.model_number}
                        </div>
                      )}
                      {!item.manufacturer && !item.model_number && (
                        <span className="text-gray-400 italic">N/A</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm">
                      {item.last_maintenance_date ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-green-100 rounded-lg">
                              <Calendar size={10} className="text-green-600" />
                            </div>
                            <span className="text-xs text-gray-600 font-medium">
                              Last: {formatDate(item.last_maintenance_date)}
                            </span>
                          </div>
                          {item.next_maintenance_date && (
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-orange-100 rounded-lg">
                                <Calendar
                                  size={10}
                                  className="text-orange-600"
                                />
                              </div>
                              <span className="text-xs text-gray-600 font-medium">
                                Next: {formatDate(item.next_maintenance_date)}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">
                          No maintenance
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-indigo-100 rounded-lg">
                        <Calendar size={12} className="text-indigo-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {item.purchase_date
                          ? formatDate(item.purchase_date)
                          : "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="group flex items-center gap-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-xl transition-all duration-200 hover:scale-105"
                      >
                        <Edit
                          size={14}
                          className="group-hover:rotate-12 transition-transform duration-200"
                        />
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(item)}
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
        <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-emerald-50/30 border-t border-gray-200/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 font-medium">
              Showing{" "}
              <span className="font-bold text-emerald-600">
                {Math.min((currentPage - 1) * pageSize + 1, totalCount)}
              </span>{" "}
              to{" "}
              <span className="font-bold text-emerald-600">
                {Math.min(currentPage * pageSize, totalCount)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-emerald-600">{totalCount}</span>{" "}
              results
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-emerald-50 text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-emerald-300 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
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
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                          : "bg-white hover:bg-emerald-50 text-gray-700 border border-gray-200 hover:border-emerald-300"
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
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-emerald-50 text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-emerald-300 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
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

export default EquipmentList;
