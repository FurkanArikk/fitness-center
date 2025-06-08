import React, { useMemo, useState, useEffect } from "react";
import { Activity, Users, Calendar } from "lucide-react";
import { classService } from "@/api";

const TrainerActivityHeatmap = ({ trainers = [], schedules = [] }) => {
  // State for filter mode and classes data
  const [filterMode, setFilterMode] = useState("trainers"); // "trainers", "active", "classes"
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Days of the week in order
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Fetch classes data when switching to classes view
  useEffect(() => {
    if (filterMode === "classes") {
      fetchClassesData();
    }
  }, [filterMode]);

  const fetchClassesData = async () => {
    setLoadingClasses(true);
    try {
      const classesData = await classService.getClasses(true); // Get active classes
      setClasses(Array.isArray(classesData) ? classesData : []);
    } catch (error) {
      console.error("Failed to fetch classes data:", error);
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  // Helper function to get trainer name safely
  const getTrainerName = (trainer) => {
    if (!trainer) return "Unknown Trainer";

    if (trainer.staff && trainer.staff.first_name && trainer.staff.last_name) {
      return `${trainer.staff.first_name} ${trainer.staff.last_name}`;
    }
    if (trainer.name) {
      return trainer.name;
    }
    const trainerId = trainer.trainer_id || trainer.id;
    return `Trainer #${trainerId}`;
  };

  // Enhanced color schemes - different for trainers vs classes
  const getActivityColor = (isActive, mode = filterMode) => {
    if (mode === "classes") {
      // Classes use a blue-purple gradient scheme
      if (isActive === 1) {
        return "bg-gradient-to-br from-purple-600 to-blue-700 shadow-lg"; // Active classes - purple-blue gradient
      }
      return "bg-gradient-to-br from-purple-100 to-blue-100 border border-purple-200"; // Inactive classes - light purple-blue
    } else {
      // Trainers use an orange-red gradient scheme
      if (isActive === 1) {
        return "bg-gradient-to-br from-orange-500 to-red-600 shadow-lg"; // Active trainers - orange-red gradient
      }
      return "bg-gradient-to-br from-orange-100 to-red-100 border border-orange-200"; // Inactive trainers - light orange-red
    }
  };

  // Get hover colors for better interactivity
  const getHoverColor = (isActive, mode = filterMode) => {
    if (mode === "classes") {
      if (isActive === 1) {
        return "hover:from-purple-700 hover:to-blue-800 hover:scale-110"; // Enhanced hover for active classes
      }
      return "hover:from-purple-200 hover:to-blue-200 hover:scale-105"; // Subtle hover for inactive classes
    } else {
      if (isActive === 1) {
        return "hover:from-orange-600 hover:to-red-700 hover:scale-110"; // Enhanced hover for active trainers
      }
      return "hover:from-orange-200 hover:to-red-200 hover:scale-105"; // Subtle hover for inactive trainers
    }
  };

  // Filter trainers based on current mode
  const filteredTrainers = useMemo(() => {
    if (filterMode === "active") {
      return trainers.filter((trainer) => trainer.is_active === true);
    }
    return trainers; // For "trainers" mode, show all
  }, [trainers, filterMode]);

  // Transform and validate data for the custom heatmap based on current filter mode
  const heatmapData = useMemo(() => {
    if (filterMode === "classes") {
      // Classes view - show class activity by day
      if (!classes || !Array.isArray(classes) || classes.length === 0) {
        return [];
      }

      try {
        const processedData = [];

        classes.forEach((classItem, index) => {
          if (!classItem || (!classItem.class_id && !classItem.id)) {
            return;
          }

          const classId = classItem.class_id || classItem.id;
          const className =
            classItem.name || classItem.class_name || `Class #${classId}`;

          const classData = {
            id: classId,
            name: className,
            activities: [],
          };

          // Process each day for this class
          daysOfWeek.forEach((day) => {
            let isActive = 0;

            try {
              // Check if class has schedules on this day
              if (
                schedules &&
                Array.isArray(schedules) &&
                schedules.length > 0
              ) {
                const hasScheduleOnDay = schedules.some((schedule) => {
                  if (!schedule || !schedule.day_of_week) return false;
                  const scheduleClassId = schedule.class_id;
                  return (
                    (scheduleClassId === classId ||
                      scheduleClassId === parseInt(classId)) &&
                    schedule.day_of_week === day &&
                    schedule.status === "active"
                  );
                });
                isActive = hasScheduleOnDay ? 1 : 0;
              }
            } catch (dayError) {
              console.warn(
                `Error processing day ${day} for class ${classId}:`,
                dayError
              );
              isActive = 0;
            }

            classData.activities.push({
              day,
              isActive,
              color: getActivityColor(isActive, "classes"),
              hoverColor: getHoverColor(isActive, "classes"),
            });
          });

          processedData.push(classData);
        });

        return processedData;
      } catch (error) {
        console.error("Error processing class data for heatmap:", error);
        return [];
      }
    } else {
      // Trainers view (both "trainers" and "active" modes)
      if (
        !filteredTrainers ||
        !Array.isArray(filteredTrainers) ||
        filteredTrainers.length === 0
      ) {
        return [];
      }

      try {
        const processedData = [];

        filteredTrainers.forEach((trainer, index) => {
          if (!trainer || (!trainer.trainer_id && !trainer.id)) {
            return;
          }

          const trainerId = trainer.trainer_id || trainer.id;
          const trainerName = getTrainerName(trainer);

          const trainerData = {
            id: trainerId,
            name: trainerName,
            activities: [],
          };

          // Process each day
          daysOfWeek.forEach((day) => {
            let isActive = 0;

            try {
              // Check if trainer has active_days field (placeholder)
              if (trainer.active_days && Array.isArray(trainer.active_days)) {
                isActive = trainer.active_days.includes(day) ? 1 : 0;
              } else if (
                schedules &&
                Array.isArray(schedules) &&
                schedules.length > 0
              ) {
                // Fallback to schedule data
                const hasClassOnDay = schedules.some((schedule) => {
                  if (!schedule || !schedule.day_of_week) return false;
                  const scheduleTrainerId = schedule.trainer_id;
                  return (
                    (scheduleTrainerId === trainerId ||
                      scheduleTrainerId === parseInt(trainerId)) &&
                    schedule.day_of_week === day &&
                    schedule.status === "active"
                  );
                });
                isActive = hasClassOnDay ? 1 : 0;
              }
            } catch (dayError) {
              console.warn(
                `Error processing day ${day} for trainer ${trainerId}:`,
                dayError
              );
              isActive = 0;
            }

            trainerData.activities.push({
              day,
              isActive,
              color: getActivityColor(isActive, filterMode),
              hoverColor: getHoverColor(isActive, filterMode),
            });
          });

          processedData.push(trainerData);
        });

        return processedData;
      } catch (error) {
        console.error("Error processing trainer data for heatmap:", error);
        return [];
      }
    }
  }, [filteredTrainers, classes, schedules, filterMode]);

  // Calculate statistics safely based on current filter mode
  const stats = useMemo(() => {
    try {
      if (filterMode === "classes") {
        const totalClasses = Array.isArray(classes) ? classes.length : 0;
        const activeClasses =
          Array.isArray(classes) && Array.isArray(schedules)
            ? classes.filter((classItem) => {
                const classId = classItem.class_id || classItem.id;
                return schedules.some(
                  (schedule) =>
                    schedule &&
                    (schedule.class_id === classId ||
                      schedule.class_id === parseInt(classId)) &&
                    schedule.status === "active"
                );
              }).length
            : 0;

        const totalSessions = Array.isArray(schedules)
          ? schedules.filter(
              (schedule) => schedule && schedule.status === "active"
            ).length
          : 0;

        return {
          totalClasses,
          activeClasses,
          totalSessions,
          totalTrainers: Array.isArray(trainers) ? trainers.length : 0,
        };
      } else {
        const totalTrainers = Array.isArray(trainers) ? trainers.length : 0;
        const activeTrainers = Array.isArray(trainers)
          ? trainers.filter((trainer) => {
              if (!trainer) return false;
              const trainerId = trainer.trainer_id || trainer.id;

              // Check active_days first
              if (
                trainer.active_days &&
                Array.isArray(trainer.active_days) &&
                trainer.active_days.length > 0
              ) {
                return true;
              }

              // Fallback to schedules
              if (schedules && Array.isArray(schedules)) {
                return schedules.some(
                  (schedule) =>
                    schedule &&
                    (schedule.trainer_id === trainerId ||
                      schedule.trainer_id === parseInt(trainerId))
                );
              }

              return false;
            }).length
          : 0;

        const totalClasses = Array.isArray(schedules) ? schedules.length : 0;

        return { totalTrainers, activeTrainers, totalClasses };
      }
    } catch (error) {
      console.error("Error calculating stats:", error);
      return { totalTrainers: 0, activeTrainers: 0, totalClasses: 0 };
    }
  }, [trainers, schedules, classes, filterMode]);

  // Get view title and description based on filter mode
  const getViewInfo = () => {
    switch (filterMode) {
      case "active":
        return {
          title: "Active Trainers Weekly Activity",
          description: "Activity heatmap showing only active trainers",
        };
      case "classes":
        return {
          title: "Classes Weekly Schedule",
          description:
            "Schedule heatmap showing class activities across the week",
        };
      default:
        return {
          title: "Weekly Activity Heatmap",
          description:
            "Each cell shows trainer activity for that day (darker = active, lighter = inactive)",
        };
    }
  };

  // Get enhanced legend colors based on current mode
  const getLegendColors = () => {
    if (filterMode === "classes") {
      return {
        inactive:
          "bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200",
        active: "bg-gradient-to-r from-purple-600 to-blue-700",
      };
    } else {
      return {
        inactive:
          "bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200",
        active: "bg-gradient-to-r from-orange-500 to-red-600",
      };
    }
  };

  const viewInfo = getViewInfo();

  // Don't render if no valid data
  const hasValidData = () => {
    if (filterMode === "classes") {
      return (
        classes &&
        Array.isArray(classes) &&
        classes.length > 0 &&
        Array.isArray(heatmapData) &&
        heatmapData.length > 0
      );
    }
    return (
      trainers &&
      Array.isArray(trainers) &&
      trainers.length > 0 &&
      Array.isArray(heatmapData) &&
      heatmapData.length > 0
    );
  };

  if (!hasValidData()) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="text-blue-600" size={24} />
          <h3 className="text-xl font-bold text-gray-900">{viewInfo.title}</h3>
        </div>
        <div className="text-center py-12 text-gray-500">
          <Activity size={48} className="mx-auto mb-4 opacity-50" />
          <p>
            No {filterMode === "classes" ? "class" : "trainer"} data available
            for activity heatmap
          </p>
          <p className="text-xs mt-2">
            {filterMode === "classes"
              ? "Add classes and schedule them to see activity data"
              : "Add trainers and schedule classes to see activity data"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="text-blue-600" size={24} />
          <h3 className="text-xl font-bold text-gray-900">{viewInfo.title}</h3>
        </div>

        {/* Interactive Filter Badges */}
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setFilterMode("trainers")}
            className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors duration-200 ${
              filterMode === "trainers"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-blue-50 text-blue-900 hover:bg-blue-100"
            }`}
          >
            <Users size={16} />
            <span className="font-medium">{stats.totalTrainers} Trainers</span>
          </button>
          <button
            onClick={() => setFilterMode("active")}
            className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors duration-200 ${
              filterMode === "active"
                ? "bg-green-600 text-white shadow-md"
                : "bg-green-50 text-green-900 hover:bg-green-100"
            }`}
          >
            <Activity size={16} />
            <span className="font-medium">{stats.activeTrainers} Active</span>
          </button>
          <button
            onClick={() => setFilterMode("classes")}
            className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors duration-200 ${
              filterMode === "classes"
                ? "bg-orange-600 text-white shadow-md"
                : "bg-orange-50 text-orange-900 hover:bg-orange-100"
            }`}
          >
            <Calendar size={16} />
            <span className="font-medium">
              {filterMode === "classes"
                ? stats.totalClasses
                : stats.totalClasses}{" "}
              Classes
            </span>
          </button>
        </div>
      </div>

      {/* Dynamic description based on view */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">{viewInfo.description}</p>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded shadow-sm ${
                getLegendColors().inactive
              }`}
            ></div>
            <span className="font-medium text-gray-700">Inactive</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded shadow-sm ${
                getLegendColors().active
              }`}
            ></div>
            <span className="font-medium text-gray-700">Active</span>
          </div>
        </div>
      </div>

      {/* Loading state for classes */}
      {filterMode === "classes" && loadingClasses ? (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <Activity
              size={48}
              className="mx-auto mb-4 opacity-50 animate-pulse"
            />
            <p>Loading class data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Custom Heatmap Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Header Row with Days */}
              <div className="flex items-center border-b border-gray-200 pb-2 mb-2">
                <div className="w-32 flex-shrink-0 text-sm font-semibold text-gray-700 pr-4">
                  {filterMode === "classes" ? "Class" : "Trainer"}
                </div>
                {daysOfWeek.map((day) => (
                  <div key={day} className="flex-1 min-w-16 text-center">
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      {day.substring(0, 3)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Data Rows */}
              <div className="space-y-2">
                {heatmapData.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex items-center hover:bg-gray-50 rounded p-2 transition-colors duration-200"
                  >
                    {/* Name */}
                    <div className="w-32 flex-shrink-0 pr-4">
                      <div
                        className="text-sm font-medium text-gray-900 truncate"
                        title={item.name}
                      >
                        {item.name}
                      </div>
                    </div>

                    {/* Activity Cells */}
                    {item.activities.map((activity, dayIndex) => (
                      <div
                        key={`${item.id}-${activity.day}`}
                        className="flex-1 min-w-16 px-1"
                      >
                        <div
                          className={`w-full h-8 rounded-lg ${activity.color} ${activity.hoverColor} cursor-pointer transition-all duration-300 transform`}
                          title={`${item.name} - ${activity.day}: ${
                            activity.isActive ? "Active" : "Inactive"
                          }`}
                        >
                          <div className="w-full h-full flex items-center justify-center">
                            {activity.isActive ? (
                              <div className="w-2.5 h-2.5 bg-white rounded-full opacity-90 shadow-sm animate-pulse"></div>
                            ) : (
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full opacity-60"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Footer Info */}
      <div className="mt-6 text-xs text-gray-500 text-center">
        Last updated: {new Date().toLocaleDateString()} •
        {filterMode === "classes"
          ? " Real-time data from class schedules"
          : " Real-time data from trainer schedules"}
      </div>
    </div>
  );
};

export default TrainerActivityHeatmap;
