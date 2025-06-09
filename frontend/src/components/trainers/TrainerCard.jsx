import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  Award,
  ChevronDown,
  ChevronUp,
  Calendar,
  Star,
  User,
  Info,
  Clock,
  Phone,
  Mail,
  Shield,
  Eye,
  X,
} from "lucide-react";
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
  trainerClasses = [],
}) => {
  const [showProfilePopover, setShowProfilePopover] = useState(false);
  const [showClassesPopover, setShowClassesPopover] = useState(false);
  const profileButtonRef = useRef(null);
  const classesButtonRef = useRef(null);
  const profilePopoverRef = useRef(null);
  const classesPopoverRef = useRef(null);

  if (!trainer) return null;

  // Click outside handler to close popovers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profilePopoverRef.current &&
        !profilePopoverRef.current.contains(event.target) &&
        !profileButtonRef.current?.contains(event.target)
      ) {
        setShowProfilePopover(false);
      }
      if (
        classesPopoverRef.current &&
        !classesPopoverRef.current.contains(event.target) &&
        !classesButtonRef.current?.contains(event.target)
      ) {
        setShowClassesPopover(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close other popover when opening one
  const toggleProfilePopover = () => {
    console.log("Profile button clicked, current state:", showProfilePopover);
    setShowClassesPopover(false);
    setShowProfilePopover(!showProfilePopover);
  };

  const toggleClassesPopover = () => {
    console.log("Classes button clicked, current state:", showClassesPopover);
    setShowProfilePopover(false);
    setShowClassesPopover(!showClassesPopover);
  };

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

  // Dynamically get all valid trainer fields (non-empty/non-undefined)
  const getTrainerFields = () => {
    const excludeFields = [
      "id",
      "trainer_id",
      "staff",
      "rating",
      "specialization",
      "certification", // Already displayed in highlighted section
      "experience", // Already displayed in highlighted section
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

  // Debug: Log states
  console.log(`Trainer ${trainerName} - Profile: ${showProfilePopover}, Classes: ${showClassesPopover}`);

  return (
    <div
      className={`group bg-gradient-to-br ${colorTheme.card} ${colorTheme.border} border-2 rounded-3xl ${colorTheme.shadow} shadow-2xl hover:shadow-3xl transition-all duration-300 ease-out backdrop-blur-sm relative ${
        showProfilePopover || showClassesPopover ? '' : 'hover:scale-[1.02] hover:-translate-y-3'
      }`}
      style={{
        boxShadow: `
          0 25px 50px -12px rgba(0, 0, 0, 0.15),
          0 0 0 1px rgba(255, 255, 255, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.3)
        `,
        // Ensure popover visibility
        zIndex: showProfilePopover || showClassesPopover ? 1000 : 'auto',
        transform: showProfilePopover || showClassesPopover ? 'none' : undefined,
      }}
    >
      {/* Decorative gradient orbs */}
      <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-white/30 to-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
      <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-tr from-white/20 to-white/5 rounded-full blur-xl"></div>

      {/* Card Header */}
      <div className="relative p-8 overflow-visible">
        <div className="flex items-center gap-6">
          {/* Modern Avatar with Dynamic Gradient Background */}
          <div className="relative">
            <div
              className={`w-28 h-28 bg-gradient-to-br ${colorTheme.avatar} rounded-3xl flex flex-col items-center justify-center text-white font-black shadow-2xl ring-4 ring-white/40 backdrop-blur-sm transition-all duration-200 ease-out ${
                showProfilePopover || showClassesPopover ? '' : 'group-hover:scale-110 group-hover:rotate-2'
              }`}
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

      {/* Compact Action Buttons */}
      <div className="relative px-8 pb-8 overflow-visible">
        <div className="flex gap-4">
          <button
            ref={profileButtonRef}
            onClick={toggleProfilePopover}
            className={`flex-1 flex items-center justify-center gap-3 py-3 px-5 rounded-xl font-bold shadow-lg transition-all duration-200 ease-out hover:shadow-xl active:scale-[0.98] ${
              showProfilePopover
                ? 'bg-white text-gray-700 border-2 border-gray-300'
                : `bg-gradient-to-r ${colorTheme.primaryButton} text-white border-0 hover:scale-[1.02]`
            }`}
            style={{
              boxShadow: showProfilePopover 
                ? "inset 0 2px 4px rgba(0, 0, 0, 0.1)" 
                : "0 8px 20px -5px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Eye size={16} className="drop-shadow-lg" />
            <span className="font-bold text-sm">View Profile</span>
            <ChevronDown 
              size={14} 
              className={`transition-transform duration-200 ease-out ${
                showProfilePopover ? 'rotate-180' : ''
              }`} 
            />
          </button>

          <button
            ref={classesButtonRef}
            onClick={toggleClassesPopover}
            className={`flex-1 flex items-center justify-center gap-3 py-3 px-5 rounded-xl font-bold shadow-lg transition-all duration-200 ease-out hover:shadow-xl active:scale-[0.98] ${
              showClassesPopover
                ? 'bg-white text-gray-700 border-2 border-gray-300'
                : `bg-gradient-to-r ${colorTheme.secondaryButton} text-white border-0 hover:scale-[1.02]`
            }`}
            style={{
              boxShadow: showClassesPopover 
                ? "inset 0 2px 4px rgba(0, 0, 0, 0.1)" 
                : "0 8px 20px -5px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Calendar size={16} className="drop-shadow-lg" />
            <span className="font-bold text-sm">
              Classes {trainerClasses.length > 0 && `(${trainerClasses.length})`}
            </span>
            <ChevronDown 
              size={14} 
              className={`transition-transform duration-200 ease-out ${
                showClassesPopover ? 'rotate-180' : ''
              }`} 
            />
          </button>
        </div>

        {/* Profile Popover */}
        {showProfilePopover && (
          <div
            ref={profilePopoverRef}
            className="absolute top-full left-8 right-8 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
            style={{
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)",
              zIndex: 9999,
              position: 'absolute',
            }}
          >
            {console.log("Profile popover is rendering")}
            <div className="p-6">
              {/* Trainer Header in Popover */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${colorTheme.avatar} rounded-xl flex flex-col items-center justify-center text-white font-black shadow-lg`}
                >
                  <div className="text-sm leading-none font-black">
                    {getTrainerInitials()}
                  </div>
                  <div className="text-xs font-bold opacity-90 mt-1">
                    {getTrainerDisplayId()}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-black text-lg text-gray-800 mb-1">
                    {trainerName}
                  </h3>
                  {trainer.specialization && (
                    <div className="mb-2">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-bold text-gray-700 bg-gray-100 rounded-lg">
                        <Award size={10} className={`mr-1 text-${colorTheme.accent}-600`} />
                        {trainer.specialization}
                      </span>
                    </div>
                  )}
                  {trainer.is_active !== undefined && (
                    <div className="flex items-center gap-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          trainer.is_active
                            ? "bg-emerald-500"
                            : "bg-gray-400"
                        }`}
                      />
                      <span className="text-xs font-semibold text-gray-600">
                        {trainer.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Rating */}
                {trainer.rating && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <Star size={14} className="text-white" fill="currentColor" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600">Rating</p>
                        <p className="text-lg font-black text-amber-600">{trainer.rating}/5</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Experience */}
                {trainer.experience && (
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-3 border border-blue-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                        <Clock size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600">Experience</p>
                        <p className="text-sm font-bold text-blue-600">{trainer.experience}y</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Certification */}
              {trainer.certification && (
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-3 border border-emerald-100 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                      <Shield size={14} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-600">Certification</p>
                      <p className="text-sm font-bold text-emerald-600">{trainer.certification}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              {(trainer.staff?.email || trainer.staff?.phone) && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                    <Info size={12} />
                    Contact
                  </h4>
                  <div className="space-y-2">
                    {trainer.staff?.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="text-blue-600" />
                        <span className="text-xs text-gray-700 truncate">{trainer.staff.email}</span>
                      </div>
                    )}
                    {trainer.staff?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-green-600" />
                        <span className="text-xs text-gray-700">{trainer.staff.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Classes Popover */}
        {showClassesPopover && (
          <div
            ref={classesPopoverRef}
            className="absolute top-full left-8 right-8 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
            style={{
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)",
              zIndex: 9999,
              position: 'absolute',
            }}
          >
            {console.log("Classes popover is rendering")}
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${colorTheme.avatar} rounded-xl flex items-center justify-center shadow-lg`}
                >
                  <Calendar size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-gray-800">Classes</h3>
                  <p className="text-xs text-gray-600 font-semibold">
                    {trainerClasses.length} {trainerClasses.length === 1 ? "class" : "classes"} assigned
                  </p>
                </div>
              </div>

              {trainerClasses.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Calendar size={24} className="text-gray-400" />
                  </div>
                  <p className="text-sm font-bold text-gray-500 mb-1">No Classes</p>
                  <p className="text-xs text-gray-400">No classes assigned yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(groupClassesByDay()).map(([day, classes]) => (
                    <div key={day} className="bg-gray-50 rounded-xl p-3">
                      <h4 className="text-sm font-black text-gray-800 mb-2 flex items-center gap-2">
                        <div className={`w-2 h-2 bg-gradient-to-r ${colorTheme.primaryButton} rounded-full`}></div>
                        {day}
                      </h4>
                      <div className="space-y-2">
                        {classes.map((schedule, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100"
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 bg-gradient-to-br ${colorTheme.secondaryButton} rounded-md flex items-center justify-center`}>
                                <Clock size={10} className="text-white" />
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-gray-800">
                                  {schedule.class_name || schedule.class?.name || "Class"}
                                </h5>
                                <p className="text-xs text-gray-600">
                                  {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                </p>
                              </div>
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-md font-bold ${
                              schedule.status === "active" 
                                ? "bg-green-100 text-green-700" 
                                : "bg-gray-100 text-gray-600"
                            }`}>
                              {schedule.status || "active"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default TrainerCard;
