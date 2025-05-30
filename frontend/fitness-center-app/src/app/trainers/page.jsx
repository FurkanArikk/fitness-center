"use client";

import React, { useState, useEffect } from "react";
import { Award, Calendar } from "lucide-react";
import Button from "@/components/common/Button";
import Loader from "@/components/common/Loader";
import Card from "@/components/common/Card";
import Modal from "@/components/common/Modal";
import Pagination from "@/components/common/Pagination";
import TrainerCard from "@/components/trainers/TrainerCard";
import TrainerSchedule from "@/components/trainers/TrainerSchedule";
import AddTrainerModal from "@/components/trainers/AddTrainerModal";
import TrainerSearchBar from "@/components/trainers/TrainerSearchBar";
import { staffService, classService } from "@/api";

const Trainers = () => {
  const [allTrainers, setAllTrainers] = useState([]); // Original list from API
  const [trainers, setTrainers] = useState([]); // Filtered/searched list
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [hasActiveSearch, setHasActiveSearch] = useState(false);

  // Single state to track expanded section per trainer: { trainerId: 'profile' | 'classes' | null }
  const [expandedSections, setExpandedSections] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    fetchTrainersData();
  }, []);

  // Real-time filtering when search term or filter changes
  useEffect(() => {
    filterTrainersRealTime();
  }, [searchTerm, selectedFilter, allTrainers]);

  const fetchTrainersData = async () => {
    setLoading(true);
    try {
      // Fetch trainers and schedules data
      const [trainersData, schedulesData] = await Promise.all([
        staffService.getTrainers(),
        classService.getSchedules("active"),
      ]);

      const trainersArray = Array.isArray(trainersData) ? trainersData : [];
      setAllTrainers(trainersArray);
      setTrainers(trainersArray); // Initially show all trainers
      setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
    } catch (err) {
      setError("Failed to load trainers and class data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique values from trainers for filter options
  const getUniqueValues = (field) => {
    const values = allTrainers
      .map((trainer) => trainer[field])
      .filter((value) => value && value.trim() !== "")
      .filter((value, index, self) => self.indexOf(value) === index);
    return values;
  };

  const specializations = getUniqueValues("specialization");

  // Filter options for the search bar dropdown
  const filterOptions = [
    "All",
    "Active",
    "Inactive",
    ...specializations.slice(0, 5), // Limit to top 5 specializations
  ];

  // Real-time filtering function
  const filterTrainersRealTime = () => {
    let filtered = [...allTrainers];

    // Name filter (searches in both first_name and last_name from staff)
    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter((trainer) => {
        const fullName = `${trainer.staff?.first_name || ""} ${
          trainer.staff?.last_name || ""
        }`.toLowerCase();
        const specialization = (trainer.specialization || "").toLowerCase();
        const certification = (trainer.certification || "").toLowerCase();

        return (
          fullName.includes(searchTermLower) ||
          specialization.includes(searchTermLower) ||
          certification.includes(searchTermLower)
        );
      });
    }

    // Filter dropdown selection
    if (selectedFilter === "Active") {
      filtered = filtered.filter((trainer) => trainer.is_active === true);
    } else if (selectedFilter === "Inactive") {
      filtered = filtered.filter((trainer) => trainer.is_active === false);
    } else if (
      selectedFilter !== "All" &&
      specializations.includes(selectedFilter)
    ) {
      filtered = filtered.filter(
        (trainer) => trainer.specialization === selectedFilter
      );
    }

    setTrainers(filtered);
    setCurrentPage(1); // Reset to first page when filtering

    // Check if any filters are active
    const hasFilters = searchTerm.trim() !== "" || selectedFilter !== "All";
    setHasActiveSearch(hasFilters);
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSelectedFilter("All");
    setCurrentPage(1);
  };

  const handleTrainerCreated = (newTrainer) => {
    // Add new trainer to both lists
    setAllTrainers((prev) => [...prev, newTrainer]);
    // The useEffect will automatically re-filter when allTrainers changes
  };

  // Calculate pagination values
  const totalTrainers = trainers.length;
  const totalPages = Math.ceil(totalTrainers / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentTrainers = trainers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Reset expanded trainer when changing pages
    setExpandedSections({});
  };

  // Filter classes for a specific trainer
  const getTrainerClasses = (trainerId) => {
    return schedules.filter(
      (schedule) =>
        schedule.trainer_id === trainerId ||
        schedule.trainer_id === parseInt(trainerId)
    );
  };

  if (loading && allTrainers.length === 0) {
    return <Loader message="Loading trainers..." />;
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Trainer Management</h2>
          {hasActiveSearch && (
            <div className="flex items-center mt-2 text-sm text-gray-600">
              <span>Showing {totalTrainers} filtered results</span>
              <button
                onClick={clearSearch}
                className="ml-2 text-blue-600 hover:text-blue-800 underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <Button
            variant="primary"
            icon={<Award size={18} />}
            onClick={() => setShowAddModal(true)}
          >
            Add New Trainer
          </Button>
          <Button
            variant="secondary"
            icon={<Calendar size={18} />}
            onClick={() => setShowScheduleModal(true)}
          >
            Weekly Schedule
          </Button>
        </div>
      </div>

      {/* Integrated Search Bar */}
      <div className="w-full max-w-2xl">
        <TrainerSearchBar
          onSearch={handleSearchChange}
          placeholder="Search trainer..."
          filterOptions={filterOptions}
          selectedFilter={selectedFilter}
          onFilterChange={handleFilterChange}
          className="w-full"
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {trainers.length === 0 && !loading && !error ? (
        <div className="text-center py-10">
          {hasActiveSearch ? (
            <>
              <p className="text-gray-500 mb-4">
                No trainers match your search criteria
              </p>
              <div className="space-x-2">
                <Button variant="secondary" onClick={clearSearch}>
                  Clear Search
                </Button>
                <Button
                  variant="primary"
                  icon={<Award size={18} />}
                  onClick={() => setShowAddModal(true)}
                >
                  Add New Trainer
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-500 mb-4">No trainers found</p>
              <Button
                variant="primary"
                icon={<Award size={18} />}
                onClick={() => setShowAddModal(true)}
              >
                Add Your First Trainer
              </Button>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentTrainers.map((trainer, index) => {
              // Get consistent trainer ID
              const trainerId = trainer.trainer_id || trainer.id;

              return (
                <TrainerCard
                  key={
                    trainer.id
                      ? `trainer-${trainer.id}`
                      : `trainer-index-${startIndex + index}`
                  }
                  trainer={trainer}
                  index={startIndex + index}
                  expanded={expandedSections[trainerId]}
                  setExpanded={(section) =>
                    setExpandedSections({
                      ...expandedSections,
                      [trainerId]: section,
                    })
                  }
                  trainerClasses={getTrainerClasses(trainerId)}
                />
              );
            })}
          </div>

          {/* Pagination Component - only show if more than 6 trainers */}
          {totalTrainers > pageSize && (
            <div className="flex justify-center mt-8">
              <Pagination
                current={currentPage}
                total={totalTrainers}
                pageSize={pageSize}
                onChange={handlePageChange}
                className="mt-4"
              />
            </div>
          )}
        </>
      )}

      {/* Add New Trainer Modal */}
      <AddTrainerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onTrainerCreated={handleTrainerCreated}
      />

      {/* Weekly Schedule Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Weekly Trainer Schedule"
        size="xl"
      >
        <div className="p-4">
          {trainers.length > 0 ? (
            <TrainerSchedule trainers={trainers} />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>No trainers available to display schedule</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Trainers;
