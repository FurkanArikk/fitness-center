import React, { useMemo } from "react";
import { Award, ChevronDown, ChevronUp, Calendar, Star } from "lucide-react";
import Button from "../common/Button";
import { formatFullName } from "../../utils/formatters";
import { TrainerAvatar } from "../../utils/avatarGenerator";

// Enhanced array of softer, more subtle card colors with gradients
const cardColors = [
  "from-blue-50 to-blue-100 border-blue-100",
  "from-emerald-50 to-emerald-100 border-emerald-100",
  "from-amber-50 to-amber-100 border-amber-100",
  "from-purple-50 to-purple-100 border-purple-100",
  "from-pink-50 to-pink-100 border-pink-100",
  "from-indigo-50 to-indigo-100 border-indigo-100",
  "from-teal-50 to-teal-100 border-teal-100",
  "from-orange-50 to-orange-100 border-orange-100",
  "from-cyan-50 to-cyan-100 border-cyan-100",
  "from-rose-50 to-rose-100 border-rose-100",
  "from-lime-50 to-lime-100 border-lime-100",
  "from-violet-50 to-violet-100 border-violet-100",
];

const TrainerCard = ({
  trainer,
  index = 0,
  expanded,
  setExpanded,
  trainerClasses = [],
}) => {
  if (!trainer) return null;

  // Select enhanced colors based on the trainer's index
  const cardColorScheme = useMemo(() => {
    return cardColors[index % cardColors.length];
  }, [index]);

  // Get consistent trainer ID for both profile and classes
  const trainerId = trainer.trainer_id || trainer.id;

  // Check if this card's profile is currently expanded
  const isProfileExpanded = expanded === "profile";

  // Check if this card's classes are currently expanded
  const isClassesExpanded = expanded === "classes";

  // Toggle expansion state for profile
  const toggleProfile = () => {
    if (isProfileExpanded) {
      setExpanded(null); // Close if already open
    } else {
      setExpanded("profile"); // Open profile, close classes
    }
  };

  // Toggle expansion state for classes
  const toggleClasses = () => {
    if (isClassesExpanded) {
      setExpanded(null); // Close if already open
    } else {
      setExpanded("classes"); // Open classes, close profile
    }
  };

  // Dynamically get all valid trainer fields (non-empty/non-undefined)
  const getTrainerFields = () => {
    const excludeFields = [
      "id",
      "trainer_id",
      "staff",
      "rating",
      "specialization",
      "profileImage",
      "created_at", // Database timestamp - exclude
      "updated_at", // Database timestamp - exclude
    ];
    const fields = [];

    for (const [key, value] of Object.entries(trainer)) {
      if (
        !excludeFields.includes(key) &&
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value !== 0 // Also exclude zero values for cleaner display
      ) {
        // Format the key from camelCase to readable format
        let formattedKey = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());

        // Custom formatting for specific fields
        if (key === "is_active") {
          formattedKey = "Status";
        } else if (key === "experience") {
          formattedKey = "Experience";
        } else if (key === "certification") {
          formattedKey = "Certification";
        } else if (key === "hourly_rate") {
          formattedKey = "Hourly Rate";
        } else if (key === "phone_number") {
          formattedKey = "Phone";
        } else if (key === "email") {
          formattedKey = "Email";
        }

        // Format the value for better display
        let formattedValue = value;
        if (key === "is_active") {
          formattedValue = value ? "Active" : "Inactive";
        } else if (key === "experience") {
          formattedValue = `${value} years`;
        } else if (key === "hourly_rate") {
          formattedValue = `$${value}/hour`;
        } else if (typeof value === "boolean") {
          formattedValue = value ? "Yes" : "No";
        }

        fields.push({ key: formattedKey, value: formattedValue });
      }
    }

    return fields;
  };

  // Format time from HH:MM:SS to HH:MM
  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };

  // Group classes by day of week
  const groupClassesByDay = () => {
    const grouped = {};
    trainerClasses.forEach((schedule) => {
      const day = schedule.day_of_week;
      if (!grouped[day]) {
        grouped[day] = [];
      }
      grouped[day].push(schedule);
    });
    return grouped;
  };

  const trainerName = trainer.staff
    ? formatFullName(trainer.staff.first_name, trainer.staff.last_name)
    : `Trainer #${trainer.trainer_id || trainer.id}`;

  const trainerFields = getTrainerFields();
  const groupedClasses = groupClassesByDay();

  return (
    <div
      className={`bg-gradient-to-br ${cardColorScheme} rounded-2xl shadow-lg hover:shadow-xl border-2 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden backdrop-blur-sm`}
    >
      {/* Card Header - Always visible with enhanced styling */}
      <div className="p-6 relative">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-white/10 rounded-t-2xl"></div>

        <div className="relative flex items-center gap-5">
          <div className="relative">
            <TrainerAvatar
              trainer={trainer}
              size="w-20 h-20"
              className="flex-shrink-0 border-4 border-white shadow-xl ring-4 ring-white/30 rounded-2xl backdrop-blur-sm"
              showIcon={true}
            />
            {/* Status indicator */}
            {trainer.is_active !== undefined && (
              <div
                className={`absolute -top-1 -right-1 w-6 h-6 rounded-full border-3 border-white shadow-md ${
                  trainer.is_active ? "bg-emerald-400" : "bg-gray-400"
                }`}
              ></div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl text-gray-800 mb-1 truncate">
              {trainerName}
            </h3>
            {trainer.specialization && (
              <p className="text-sm text-gray-700 font-semibold capitalize mb-2 bg-white/50 rounded-full px-3 py-1 inline-block">
                {trainer.specialization} Specialist
              </p>
            )}
            {trainer.rating && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-full px-3 py-1.5 shadow-md">
                <Star size={16} fill="currentColor" />
                <span className="font-bold text-sm">{trainer.rating}</span>
                <span className="text-xs opacity-90">fitness rating</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer - Enhanced button styling */}
      <div className="px-6 pb-6">
        <div className="flex gap-3">
          <Button
            variant={isProfileExpanded ? "secondary" : "primary"}
            size="sm"
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:shadow-xl ${
              isProfileExpanded
                ? "bg-white/80 text-gray-700 border-2 border-gray-200 hover:bg-white"
                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
            }`}
            onClick={toggleProfile}
          >
            Profile
            {isProfileExpanded ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </Button>
          <Button
            variant={isClassesExpanded ? "secondary" : "primary"}
            size="sm"
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:shadow-xl ${
              isClassesExpanded
                ? "bg-white/80 text-gray-700 border-2 border-gray-200 hover:bg-white"
                : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0"
            }`}
            onClick={toggleClasses}
          >
            <Calendar size={16} />
            Classes
            {trainerClasses.length > 0 && (
              <span className="bg-white/30 rounded-full px-2 py-0.5 text-xs font-bold">
                {trainerClasses.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Expandable Profile Details Section - Enhanced styling with scrolling */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-out bg-white/90 backdrop-blur-md border-t-2 border-white/50
          ${
            isProfileExpanded ? "max-h-[400px] py-6 px-6" : "max-h-0 py-0 px-6"
          }`}
      >
        {/* Only render content when expanded for better performance */}
        {isProfileExpanded && (
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="space-y-4 pr-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <Award size={16} className="text-white" />
                </div>
                <h4 className="font-bold text-lg text-gray-900">
                  Trainer Details
                </h4>
              </div>

              <div className="grid gap-3">
                {/* Standard fields if available */}
                {trainer.certification && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-150">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-400 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Award size={12} className="text-white" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700 block">
                          Certification
                        </span>
                        <span className="text-gray-600">
                          {trainer.certification}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {trainer.experience && (
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-150">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-emerald-400 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Star size={12} className="text-white" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700 block">
                          Experience
                        </span>
                        <span className="text-gray-600">
                          {trainer.experience} years
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Display all other valid trainer fields dynamically */}
                {trainerFields.map(({ key, value }) => (
                  <div
                    key={key}
                    className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-150"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gray-400 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-gray-700 block">
                          {key}
                        </span>
                        <span className="text-gray-600 break-words">
                          {typeof value === "object"
                            ? JSON.stringify(value)
                            : value}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expandable Classes Section - Enhanced styling */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-out bg-white/90 backdrop-blur-md border-t-2 border-white/50
          ${
            isClassesExpanded ? "max-h-[600px] py-6 px-6" : "max-h-0 py-0 px-6"
          }`}
      >
        {/* Only render content when expanded for better performance */}
        {isClassesExpanded && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Calendar size={16} className="text-white" />
              </div>
              <h4 className="font-bold text-lg text-gray-900">
                Classes Schedule
              </h4>
              <span className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold">
                {trainerClasses.length}{" "}
                {trainerClasses.length === 1 ? "class" : "classes"}
              </span>
            </div>

            {trainerClasses.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">
                  No classes assigned to this trainer
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedClasses)
                  .sort(([a], [b]) => {
                    const days = [
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ];
                    return days.indexOf(a) - days.indexOf(b);
                  })
                  .map(([day, classes]) => (
                    <div
                      key={day}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-l-4 border-blue-500"
                    >
                      <h5 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        {day}
                      </h5>
                      <div className="space-y-2">
                        {classes.map((classSchedule) => (
                          <div
                            key={classSchedule.schedule_id}
                            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/50 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-semibold text-gray-900">
                                {classSchedule.class_name ||
                                  `Class #${classSchedule.class_id}`}
                              </div>
                              {classSchedule.status && (
                                <div
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    classSchedule.status === "active"
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                      : "bg-red-100 text-red-800 border border-red-200"
                                  }`}
                                >
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                      classSchedule.status === "active"
                                        ? "bg-emerald-500"
                                        : "bg-red-500"
                                    }`}
                                  ></div>
                                  {classSchedule.status}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              </div>
                              <span className="text-sm">
                                {formatTime(classSchedule.start_time)} -{" "}
                                {formatTime(classSchedule.end_time)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerCard;
