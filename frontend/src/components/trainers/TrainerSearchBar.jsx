import React, { useState, useRef, useEffect } from "react";
import { Search, Filter, ChevronDown } from "lucide-react";

const TrainerSearchBar = ({
  onSearch,
  placeholder = "Search trainer...",
  filterOptions = ["All", "Active", "Inactive", "Yoga", "Pilates", "CrossFit"],
  selectedFilter = "All",
  onFilterChange,
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleFilterSelect = (filter) => {
    if (onFilterChange) {
      onFilterChange(filter);
    }
    setIsDropdownOpen(false);
  };

  return (
    <div
      className={`flex items-center bg-white border-2 border-gray-200 hover:border-blue-300 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
    >
      {/* Search Input with Magnifying Glass */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <div className="p-1.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
            <Search className="h-4 w-4 text-blue-600" />
          </div>
        </div>
        <input
          type="text"
          className="w-full pl-16 pr-4 py-4 bg-transparent border-none outline-none focus:ring-0 text-gray-900 placeholder-gray-500 text-sm font-medium"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Filter Button */}
      <div className="flex items-center px-2">
        <button
          type="button"
          className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 rounded-xl transition-all duration-200 hover:shadow-md"
          aria-label="Filter options"
        >
          <Filter className="h-5 w-5" />
        </button>
      </div>

      {/* Dropdown Menu */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`flex items-center space-x-2 px-5 py-4 text-sm font-semibold rounded-r-2xl transition-all duration-200 border-l-2 border-gray-200 ${
            isDropdownOpen
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
              : "text-gray-700 hover:text-blue-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100"
          }`}
        >
          <span>{selectedFilter}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isDropdownOpen ? "transform rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Panel */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border-2 border-gray-100 rounded-2xl shadow-xl z-50 py-2 backdrop-blur-md">
            <div className="px-3 py-2 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Filter Options
              </span>
            </div>
            {filterOptions.map((option, index) => (
              <button
                key={option}
                onClick={() => handleFilterSelect(option)}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 mx-2 my-1 rounded-xl ${
                  selectedFilter === option
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transform scale-[0.98]"
                    : "text-gray-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-2">
                  {selectedFilter === option && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                  {option}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerSearchBar;
