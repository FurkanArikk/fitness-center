import React, { useMemo } from "react";
import {
  Award,
  ChevronDown,
  ChevronUp,
  Calendar,
  Star,
  User,
} from "lucide-react";
import Button from "../common/Button";
import { formatFullName } from "../../utils/formatters";

// Modern vibrant color schemes inspired by the class cards
const colorThemes = [
  {
    // Blue theme (Body Pump style)
    card: "from-blue-100 via-blue-200 to-blue-300",
    border: "border-blue-300",
    avatar: "from-blue-500 to-blue-700",
    primaryButton: "from-blue-600 to-blue-800",
    secondaryButton: "from-blue-500 to-blue-700",
    accent: "blue",
    shadow: "shadow-blue-200/50",
  },
  {
    // Green theme (Boxing style)
    card: "from-emerald-100 via-emerald-200 to-emerald-300",
    border: "border-emerald-300",
    avatar: "from-emerald-500 to-emerald-700",
    primaryButton: "from-emerald-600 to-emerald-800",
    secondaryButton: "from-emerald-500 to-emerald-700",
    accent: "emerald",
    shadow: "shadow-emerald-200/50",
  },
  {
    // Yellow theme (CrossFit style)
    card: "from-amber-100 via-amber-200 to-amber-300",
    border: "border-amber-300",
    avatar: "from-amber-500 to-amber-700",
    primaryButton: "from-amber-600 to-amber-800",
    secondaryButton: "from-amber-500 to-amber-700",
    accent: "amber",
    shadow: "shadow-amber-200/50",
  },
  {
    // Pink theme (HIIT style)
    card: "from-pink-100 via-pink-200 to-pink-300",
    border: "border-pink-300",
    avatar: "from-pink-500 to-pink-700",
    primaryButton: "from-pink-600 to-pink-800",
    secondaryButton: "from-pink-500 to-pink-700",
    accent: "pink",
    shadow: "shadow-pink-200/50",
  },
  {
    // Purple theme (Meditation style)
    card: "from-purple-100 via-purple-200 to-purple-300",
    border: "border-purple-300",
    avatar: "from-purple-500 to-purple-700",
    primaryButton: "from-purple-600 to-purple-800",
    secondaryButton: "from-purple-500 to-purple-700",
    accent: "purple",
    shadow: "shadow-purple-200/50",
  },
  {
    // Orange theme (Pilates style)
    card: "from-orange-100 via-orange-200 to-orange-300",
    border: "border-orange-300",
    avatar: "from-orange-500 to-orange-700",
    primaryButton: "from-orange-600 to-orange-800",
    secondaryButton: "from-orange-500 to-orange-700",
    accent: "orange",
    shadow: "shadow-orange-200/50",
  },
  {
    // Teal theme (Seniors Fitness style)
    card: "from-teal-100 via-teal-200 to-teal-300",
    border: "border-teal-300",
    avatar: "from-teal-500 to-teal-700",
    primaryButton: "from-teal-600 to-teal-800",
    secondaryButton: "from-teal-500 to-teal-700",
    accent: "teal",
    shadow: "shadow-teal-200/50",
  },
  {
    // Indigo theme (Spin Class style)
    card: "from-indigo-100 via-indigo-200 to-indigo-300",
    border: "border-indigo-300",
    avatar: "from-indigo-500 to-indigo-700",
    primaryButton: "from-indigo-600 to-indigo-800",
    secondaryButton: "from-indigo-500 to-indigo-700",
    accent: "indigo",
    shadow: "shadow-indigo-200/50",
  },
  {
    // Rose theme
    card: "from-rose-100 via-rose-200 to-rose-300",
    border: "border-rose-300",
    avatar: "from-rose-500 to-rose-700",
    primaryButton: "from-rose-600 to-rose-800",
    secondaryButton: "from-rose-500 to-rose-700",
    accent: "rose",
    shadow: "shadow-rose-200/50",
  },
  {
    // Cyan theme
    card: "from-cyan-100 via-cyan-200 to-cyan-300",
    border: "border-cyan-300",
    avatar: "from-cyan-500 to-cyan-700",
    primaryButton: "from-cyan-600 to-cyan-800",
    secondaryButton: "from-cyan-500 to-cyan-700",
    accent: "cyan",
    shadow: "shadow-cyan-200/50",
  },
  {
    // Lime theme
    card: "from-lime-100 via-lime-200 to-lime-300",
    border: "border-lime-300",
    avatar: "from-lime-500 to-lime-700",
    primaryButton: "from-lime-600 to-lime-800",
    secondaryButton: "from-lime-500 to-lime-700",
    accent: "lime",
    shadow: "shadow-lime-200/50",
  },
  {
    // Violet theme
    card: "from-violet-100 via-violet-200 to-violet-300",
    border: "border-violet-300",
    avatar: "from-violet-500 to-violet-700",
    primaryButton: "from-violet-600 to-violet-800",
    secondaryButton: "from-violet-500 to-violet-700",
    accent: "violet",
    shadow: "shadow-violet-200/50",
  },
];

const TrainerCard = ({
  trainer,
  index = 0,
  expanded,
  setExpanded,
  trainerClasses = [],
}) => {
  if (!trainer) return null;

  // Dynamic color theme selection based on trainer ID for consistency
  const colorTheme = useMemo(() => {
    const trainerId = trainer.trainer_id || trainer.id || 0;
    const themeIndex = (parseInt(trainerId) + index) % colorThemes.length;
    return colorThemes[themeIndex];
  }, [trainer.trainer_id, trainer.id, index]);

  // Get consistent trainer ID for both profile and classes
  const trainerId = trainer.trainer_id || trainer.id;

  // Generate trainer initials and display ID
  const getTrainerInitials = () => {
    if (trainer.staff && trainer.staff.first_name && trainer.staff.last_name) {
      const firstName = trainer.staff.first_name.trim();
      const lastName = trainer.staff.last_name.trim();
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return `T${trainerId.toString().slice(-1)}`;
  };

  const getTrainerDisplayId = () => {
    return `T${trainerId.toString().padStart(2, "0")}`;
  };

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
      className={`group bg-gradient-to-br ${colorTheme.card} ${colorTheme.border} border-2 rounded-3xl ${colorTheme.shadow} shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-3 overflow-hidden backdrop-blur-sm relative`}
      style={{
        boxShadow: `
          0 25px 50px -12px rgba(0, 0, 0, 0.15),
          0 0 0 1px rgba(255, 255, 255, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.3)
        `,
      }}
    >
      {/* Decorative gradient orbs */}
      <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-white/30 to-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
      <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-tr from-white/20 to-white/5 rounded-full blur-xl"></div>

      {/* Card Header */}
      <div className="relative p-8">
        <div className="flex items-center gap-6">
          {/* Modern Avatar with Dynamic Gradient Background */}
          <div className="relative">
            <div
              className={`w-28 h-28 bg-gradient-to-br ${colorTheme.avatar} rounded-3xl flex flex-col items-center justify-center text-white font-black shadow-2xl ring-4 ring-white/40 backdrop-blur-sm group-hover:scale-110 transition-all duration-300 group-hover:rotate-2`}
              style={{
                boxShadow: `
                  0 20px 25px -5px rgba(0, 0, 0, 0.2),
                  0 10px 10px -5px rgba(0, 0, 0, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2)
                `,
              }}
            >
              <div className="text-xl leading-none font-black">
                {getTrainerInitials()}
              </div>
              <div className="text-sm font-bold opacity-90 mt-1">
                {getTrainerDisplayId()}
              </div>
            </div>

            {/* Active/Online Status Badge */}
            {trainer.is_active !== undefined && (
              <div
                className={`absolute -top-2 -right-2 w-8 h-8 rounded-full border-4 border-white shadow-xl transition-all duration-300 ${
                  trainer.is_active
                    ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
                    : "bg-gradient-to-br from-gray-400 to-gray-600"
                }`}
                style={{
                  boxShadow: trainer.is_active
                    ? "0 0 20px rgba(16, 185, 129, 0.5), 0 0 40px rgba(16, 185, 129, 0.2)"
                    : "0 4px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                {trainer.is_active && (
                  <div className="w-full h-full rounded-full bg-emerald-400/30 animate-ping"></div>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-black text-2xl text-gray-800 mb-3 truncate group-hover:text-gray-900 transition-colors">
              {trainerName}
            </h3>

            {trainer.specialization && (
              <div className="mb-4">
                <span className="inline-flex items-center px-4 py-2 text-sm font-bold text-gray-700 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 hover:bg-white transition-all duration-300">
                  <Award
                    size={16}
                    className={`mr-2 text-${colorTheme.accent}-600`}
                  />
                  {trainer.specialization} Specialist
                </span>
              </div>
            )}

            {trainer.rating && (
              <div
                className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-white rounded-2xl px-5 py-3 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                style={{
                  boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.4)",
                }}
              >
                <Star
                  size={20}
                  fill="currentColor"
                  className="drop-shadow-lg"
                />
                <span className="font-black text-lg">{trainer.rating}</span>
                <span className="text-sm font-semibold opacity-95">
                  fitness rating
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Action Buttons */}
      <div className="relative px-8 pb-8">
        <div className="flex gap-5">
          <button
            onClick={toggleProfile}
            className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] ${
              isProfileExpanded
                ? "bg-white/95 text-gray-700 border-2 border-white/80 shadow-inner"
                : `bg-gradient-to-r ${colorTheme.primaryButton} text-white border-0`
            }`}
            style={{
              boxShadow: isProfileExpanded
                ? "inset 0 2px 4px rgba(0, 0, 0, 0.1)"
                : "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
            }}
          >
            <User size={18} className="drop-shadow-lg" />
            <span className="font-black">Profile</span>
            <div
              className={`transition-transform duration-300 ${
                isProfileExpanded ? "rotate-180" : ""
              }`}
            >
              <ChevronDown size={18} />
            </div>
          </button>

          <button
            onClick={toggleClasses}
            className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] ${
              isClassesExpanded
                ? "bg-white/95 text-gray-700 border-2 border-white/80 shadow-inner"
                : `bg-gradient-to-r ${colorTheme.secondaryButton} text-white border-0`
            }`}
            style={{
              boxShadow: isClassesExpanded
                ? "inset 0 2px 4px rgba(0, 0, 0, 0.1)"
                : "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Calendar size={18} className="drop-shadow-lg" />
            <span className="font-black">Classes</span>
            {trainerClasses.length > 0 && (
              <div className="bg-white/40 backdrop-blur-sm rounded-xl px-3 py-1 text-sm font-black shadow-lg border border-white/30">
                {trainerClasses.length}
              </div>
            )}
            <div
              className={`transition-transform duration-300 ${
                isClassesExpanded ? "rotate-180" : ""
              }`}
            >
              <ChevronDown size={18} />
            </div>
          </button>
        </div>
      </div>

      {/* Expandable Profile Details Section */}
      <div
        className={`overflow-hidden transition-all duration-700 ease-out bg-white/95 backdrop-blur-xl border-t-2 border-white/80 shadow-inner
          ${
            isProfileExpanded ? "max-h-[500px] py-6 px-8" : "max-h-0 py-0 px-8"
          }`}
      >
        {isProfileExpanded && (
          <div className="h-full max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-500 pr-2">
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${colorTheme.avatar} rounded-2xl flex items-center justify-center shadow-lg`}
                >
                  <Award size={24} className="text-white drop-shadow-lg" />
                </div>
                <h4 className="font-black text-2xl text-gray-900">
                  Trainer Details
                </h4>
              </div>

              <div className="grid gap-5">
                {trainer.certification && (
                  <div
                    className={`bg-gradient-to-r from-${colorTheme.accent}-50 via-${colorTheme.accent}-100 to-${colorTheme.accent}-50 rounded-2xl p-6 border border-${colorTheme.accent}-200 shadow-lg hover:shadow-xl transition-all duration-300`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 bg-gradient-to-br ${colorTheme.avatar} rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg`}
                      >
                        <Award size={18} className="text-white" />
                      </div>
                      <div>
                        <span className="font-black text-gray-800 block text-lg">
                          Certification
                        </span>
                        <span className="text-gray-700 font-semibold">
                          {trainer.certification}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {trainer.experience && (
                  <div
                    className={`bg-gradient-to-r from-${colorTheme.accent}-50 via-${colorTheme.accent}-100 to-${colorTheme.accent}-50 rounded-2xl p-6 border border-${colorTheme.accent}-200 shadow-lg hover:shadow-xl transition-all duration-300`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 bg-gradient-to-br ${colorTheme.avatar} rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg`}
                      >
                        <Star size={18} className="text-white" />
                      </div>
                      <div>
                        <span className="font-black text-gray-800 block text-lg">
                          Experience
                        </span>
                        <span className="text-gray-700 font-semibold">
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
                    className="bg-gradient-to-r from-gray-50 via-slate-50 to-gray-100 rounded-2xl p-5 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-black text-gray-800 block text-lg">
                          {key}
                        </span>
                        <span className="text-gray-600 font-medium break-words">
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

      {/* Expandable Classes Section */}
      <div
        className={`overflow-hidden transition-all duration-700 ease-out bg-white/95 backdrop-blur-xl border-t-2 border-white/80 shadow-inner
          ${
            isClassesExpanded ? "max-h-[700px] py-8 px-8" : "max-h-0 py-0 px-8"
          }`}
      >
        {isClassesExpanded && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`w-12 h-12 bg-gradient-to-br ${colorTheme.avatar} rounded-2xl flex items-center justify-center shadow-lg`}
              >
                <Calendar size={24} className="text-white drop-shadow-lg" />
              </div>
              <h4 className="font-black text-2xl text-gray-900">
                Classes Schedule
              </h4>
              <div
                className={`bg-gradient-to-r from-${colorTheme.accent}-100 via-${colorTheme.accent}-200 to-${colorTheme.accent}-100 text-${colorTheme.accent}-800 px-5 py-2 rounded-2xl text-sm font-black shadow-lg border border-${colorTheme.accent}-300`}
              >
                {trainerClasses.length}{" "}
                {trainerClasses.length === 1 ? "class" : "classes"}
              </div>
            </div>

            {trainerClasses.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Calendar size={36} className="text-gray-400" />
                </div>
                <p className="text-gray-500 font-semibold text-xl">
                  No classes assigned to this trainer
                </p>
              </div>
            ) : (
              <div className="space-y-6">
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
                      className={`bg-gradient-to-r from-${colorTheme.accent}-50 via-${colorTheme.accent}-100 to-${colorTheme.accent}-50 rounded-2xl p-6 border-l-4 border-${colorTheme.accent}-500 shadow-lg hover:shadow-xl transition-all duration-300`}
                    >
                      <h5 className="font-black text-gray-800 mb-4 flex items-center gap-3 text-xl">
                        <div
                          className={`w-5 h-5 bg-gradient-to-br ${colorTheme.avatar} rounded-full shadow-lg`}
                        ></div>
                        {day}
                      </h5>
                      <div className="space-y-4">
                        {classes.map((classSchedule) => (
                          <div
                            key={classSchedule.schedule_id}
                            className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/80 hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="font-black text-gray-900 text-lg">
                                {classSchedule.class_name ||
                                  `Class #${classSchedule.class_id}`}
                              </div>
                              {classSchedule.status && (
                                <div
                                  className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-black shadow-lg ${
                                    classSchedule.status === "active"
                                      ? "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300"
                                      : "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300"
                                  }`}
                                >
                                  <div
                                    className={`w-2.5 h-2.5 rounded-full mr-2 shadow-sm ${
                                      classSchedule.status === "active"
                                        ? "bg-emerald-500"
                                        : "bg-red-500"
                                    }`}
                                  ></div>
                                  {classSchedule.status}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                              <div
                                className={`w-6 h-6 bg-gradient-to-br from-${colorTheme.accent}-100 to-${colorTheme.accent}-200 rounded-lg flex items-center justify-center shadow-sm`}
                              >
                                <div
                                  className={`w-3 h-3 bg-${colorTheme.accent}-500 rounded-full`}
                                ></div>
                              </div>
                              <span className="font-bold text-lg">
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
