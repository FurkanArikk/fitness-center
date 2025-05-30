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
      className={`flex items-center bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      {/* Search Input with Magnifying Glass */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="w-full pl-12 pr-4 py-3 bg-transparent border-none outline-none focus:ring-0 text-gray-900 placeholder-gray-500 text-sm"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Filter Button */}
      <div className="flex items-center px-3">
        <button
          type="button"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-150"
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
          className="flex items-center space-x-2 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-r-xl transition-colors duration-150 border-l border-gray-200"
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
          <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
            {filterOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleFilterSelect(option)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${
                  selectedFilter === option
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerSearchBar;
