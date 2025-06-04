"use client";

import React, { useState, useEffect } from "react";
import { Award, Calendar, Edit, Link } from "lucide-react";
import Button from "@/components/common/Button";
import Loader from "@/components/common/Loader";
import Card from "@/components/common/Card";
import Modal from "@/components/common/Modal";
import Pagination from "@/components/common/Pagination";
import TrainerCard from "@/components/trainers/TrainerCard";
import TrainerSchedule from "@/components/trainers/TrainerSchedule";
import AddTrainerModal from "@/components/trainers/AddTrainerModal";
import EditTrainersModal from "@/components/trainers/EditTrainersModal";
import AssignClassModal from "@/components/trainers/AssignClassModal";
import TrainerSearchBar from "@/components/trainers/TrainerSearchBar";
import TrainerActivityHeatmap from "@/components/trainers/TrainerActivityHeatmap";
import TopTrainersChart from "@/components/trainers/TopTrainersChart";
import { staffService, classService } from "@/api";

const Trainers = () => {
  const [allTrainers, setAllTrainers] = useState([]); // Original list from API
  const [trainers, setTrainers] = useState([]); // Filtered/searched list
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

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

    // Name filter (searches in both first_name and last_name from staff, trainer ID, and trainer number)
    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter((trainer) => {
        const fullName = `${trainer.staff?.first_name || ""} ${
          trainer.staff?.last_name || ""
        }`.toLowerCase();
        const specialization = (trainer.specialization || "").toLowerCase();
        const certification = (trainer.certification || "").toLowerCase();
        const trainerId = String(
          trainer.trainer_id || trainer.id || ""
        ).toLowerCase();
        const trainerNumber = String(trainer.trainer_id || trainer.id || "");

        return (
          fullName.includes(searchTermLower) ||
          specialization.includes(searchTermLower) ||
          certification.includes(searchTermLower) ||
          trainerId.includes(searchTermLower) ||
          trainerNumber.includes(searchTerm.trim()) || // Exact number match for better ID search
          `trainer #${trainerNumber}`.toLowerCase().includes(searchTermLower) ||
          `trainer${trainerNumber}`.toLowerCase().includes(searchTermLower)
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

  const handleClassAssigned = async () => {
    // Refresh schedules data after class assignment
    try {
      const schedulesData = await classService.getSchedules("active");
      setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
    } catch (err) {
      console.error("Failed to refresh schedules:", err);
    }
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
      {/* Modern Header Section */}
      <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-200 shadow-lg">
              <Award size={32} className="text-blue-700" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Trainer Management
              </h1>
              <p className="text-gray-600 mt-2 font-medium">
                Manage trainers and their schedules efficiently
              </p>
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                  <span>Live Updates</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="group flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5"
            >
              <div className="p-1 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                <Award size={16} />
              </div>
              Add New Trainer
            </button>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="group flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5"
            >
              <div className="p-1 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                <Calendar size={16} />
              </div>
              Weekly Schedule
            </button>
          </div>
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

          {/* Two-column layout: Quick Actions and Top Trainers Chart */}
          <div className="grid grid-cols-12 gap-6 mt-8">
            {/* Left column - Quick Actions */}
            <div className="col-span-4">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 h-96">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-1 bg-purple-100 rounded-lg">
                    <div className="w-4 h-4 bg-purple-600 rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs">⚡</span>
                    </div>
                  </div>
                  <h4 className="text-base font-semibold text-gray-700">
                    Quick Actions
                  </h4>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-col gap-4 mb-4">
                  {/* Edit Trainers Button */}
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 w-full hover:scale-[1.02] hover:-translate-y-0.5"
                  >
                    <Edit className="w-5 h-5 text-white" />
                    <span className="font-medium text-base">Edit Trainers</span>
                  </button>

                  {/* Assign Class Button */}
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 w-full hover:scale-[1.02] hover:-translate-y-0.5"
                  >
                    <Link className="w-5 h-5 text-white" />
                    <span className="font-medium text-base">Assign Class</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Weekly Goal Widget - Now rectangular and larger */}
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-100 shadow-sm h-40">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <svg
                          className="w-5 h-5 text-orange-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">
                          Weekly Goal
                        </h4>
                        <p className="text-sm text-gray-600">
                          classes this week
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-orange-600">
                        8
                      </span>
                      <span className="text-lg text-gray-500">/15</span>
                      <div className="text-sm text-gray-500">53% Complete</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full shadow-sm transition-all duration-1000 ease-out"
                        style={{ width: "53%" }}
                      />
                    </div>
                  </div>

                  {/* Progress Segments */}
                  <div className="flex justify-between gap-1">
                    {Array.from({ length: 15 }, (_, index) => (
                      <div
                        key={index}
                        className={`flex-1 h-2 rounded-sm transition-all duration-200 ${
                          index < 8
                            ? "bg-gradient-to-br from-orange-400 to-yellow-500 shadow-sm"
                            : "bg-gray-200"
                        }`}
                        style={{
                          animationDelay: `${index * 50}ms`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Bottom stats */}
                  <div className="flex justify-between text-sm text-gray-500 mt-3">
                    <span>7 remaining</span>
                    <span>Target: May 31</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - Top Trainers Chart takes less space */}
            <div className="col-span-8">
              <TopTrainersChart trainers={allTrainers} schedules={schedules} />
            </div>
          </div>

          {/* Weekly Activity Heatmap - positioned below the two-column section */}
          <div className="mt-8">
            <TrainerActivityHeatmap
              trainers={allTrainers}
              schedules={schedules}
            />
          </div>
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

      {/* Edit Trainers Modal - New modal for editing trainer details */}
      <EditTrainersModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        // Additional props for editing can be added here
      />

      {/* Assign Class Modal - Integrated with the Assign Class button */}
      <AssignClassModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onClassAssigned={handleClassAssigned}
      />
    </div>
  );
};

export default Trainers;
