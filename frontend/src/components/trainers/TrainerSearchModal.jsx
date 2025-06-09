import React, { useState, useEffect } from "react";
import { X, Search, Filter } from "lucide-react";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import TrainerSearchBar from "./TrainerSearchBar";

const TrainerSearchModal = ({ isOpen, onClose, onSearch, trainers = [] }) => {
  const [filters, setFilters] = useState({
    name: "",
    specialization: "",
    certification: "",
    experience: "",
    rating: "",
    status: "all",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Extract unique values from trainers for filter options
  const getUniqueValues = (field) => {
    const values = trainers
      .map((trainer) => trainer[field])
      .filter((value) => value && value.trim() !== "")
      .filter((value, index, self) => self.indexOf(value) === index);
    return values;
  };

  const specializations = getUniqueValues("specialization");
  const certifications = getUniqueValues("certification");

  // Filter options for the search bar dropdown
  const filterOptions = [
    "All",
    "Active",
    "Inactive",
    ...specializations.slice(0, 5), // Limit to top 5 specializations
  ];

  const handleSearchBarSearch = (term) => {
    setSearchTerm(term);
    setFilters((prev) => ({ ...prev, name: term }));
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);

    // Reset filters
    const newFilters = {
      name: searchTerm,
      specialization: "",
      certification: "",
      experience: "",
      rating: "",
      status: "all",
    };

    // Apply selected filter
    if (filter === "Active") {
      newFilters.status = "active";
    } else if (filter === "Inactive") {
      newFilters.status = "inactive";
    } else if (filter !== "All" && specializations.includes(filter)) {
      newFilters.specialization = filter;
    }

    setFilters(newFilters);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters = {
      name: "",
      specialization: "",
      certification: "",
      experience: "",
      rating: "",
      status: "all",
    };
    setFilters(clearedFilters);
    setSearchTerm("");
    setSelectedFilter("All");
    onSearch(clearedFilters);
  };

  // Update filters when searchTerm or selectedFilter changes
  useEffect(() => {
    const newFilters = { ...filters, name: searchTerm };
    setFilters(newFilters);
  }, [searchTerm]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Search & Filter Trainers"
      size="lg"
    >
      <div className="p-6 space-y-6">
        {/* Modern Search Bar */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Quick Search</h3>
          <TrainerSearchBar
            onSearch={handleSearchBarSearch}
            placeholder="Search trainer..."
            filterOptions={filterOptions}
            selectedFilter={selectedFilter}
            onFilterChange={handleFilterChange}
            className="w-full"
          />
        </div>

        {/* Advanced Filters */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Advanced Filters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Specialization */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <select
                  value={filters.specialization}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      specialization: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Specializations</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              {/* Certification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certification
                </label>
                <select
                  value={filters.certification}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      certification: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Certifications</option>
                  {certifications.map((cert) => (
                    <option key={cert} value={cert}>
                      {cert}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Experience (years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={filters.experience}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      experience: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      rating: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                  <option value="3.0">3.0+ Stars</option>
                </select>
              </div>

              {/* Status */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex space-x-4">
                  {[
                    { value: "all", label: "All Trainers" },
                    { value: "active", label: "Active Only" },
                    { value: "inactive", label: "Inactive Only" },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value={option.value}
                        checked={filters.status === option.value}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button type="button" variant="secondary" onClick={handleClear}>
              Clear All
            </Button>
            <div className="flex space-x-3">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={<Search size={18} />}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default TrainerSearchModal;
