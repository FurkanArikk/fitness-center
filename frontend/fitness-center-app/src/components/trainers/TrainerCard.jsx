import React, { useMemo } from "react";
import { Award, User, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import Button from "../common/Button";
import { formatFullName } from "../../utils/formatters";

// Array of visually pleasing background colors for the cards
const cardColors = [
  "bg-blue-50",
  "bg-green-50",
  "bg-yellow-50",
  "bg-purple-50",
  "bg-pink-50",
  "bg-indigo-50",
  "bg-teal-50",
  "bg-orange-50",
  "bg-cyan-50",
  "bg-rose-50",
];

const TrainerCard = ({
  trainer,
  index = 0,
  expanded,
  setExpanded,
  trainerClasses = [],
}) => {
  if (!trainer) return null;

  // Select a background color based on the trainer's index
  const bgColor = useMemo(() => {
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
    ];
    const fields = [];

    for (const [key, value] of Object.entries(trainer)) {
      if (
        !excludeFields.includes(key) &&
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        // Format the key from camelCase to Title Case
        const formattedKey = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());

        fields.push({ key: formattedKey, value });
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
      className={`rounded-lg shadow overflow-hidden ${bgColor} border border-gray-200 transition-all hover:shadow-md`}
    >
      {/* Card Header - Always visible */}
      <div className="p-4">
        <div className="flex items-center gap-4">
          {trainer.profileImage ? (
            <img
              src={trainer.profileImage}
              alt={trainerName}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <User size={32} className="text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-bold text-lg">{trainerName}</h3>
            {trainer.specialization && (
              <p className="text-sm text-gray-600">{trainer.specialization}</p>
            )}
            {trainer.rating && (
              <div className="flex items-center mt-1 text-yellow-500">
                <span className="mr-1">{trainer.rating}</span>
                <Award size={16} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer - Always visible */}
      <div className="px-4 pb-4">
        <div className="flex gap-2">
          <Button
            variant={isProfileExpanded ? "secondary" : "primary"}
            size="sm"
            className="flex-1 flex items-center justify-center gap-1"
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
            className="flex-1 flex items-center justify-center gap-1"
            onClick={toggleClasses}
          >
            Classes
            <Calendar size={16} />
            {trainerClasses.length > 0 && (
              <span className="ml-1 bg-white bg-opacity-30 rounded-full px-1 text-xs">
                {trainerClasses.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Expandable Profile Details Section */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out bg-white bg-opacity-70 px-4
          ${
            isProfileExpanded
              ? "max-h-[500px] py-4 border-t border-gray-200"
              : "max-h-0 py-0"
          }`}
      >
        {/* Only render content when expanded for better performance */}
        {isProfileExpanded && (
          <div className="text-sm space-y-2">
            <h4 className="font-medium text-gray-900">Trainer Details</h4>

            {/* Standard fields if available */}
            {trainer.certification && (
              <p className="text-sm flex">
                <strong className="min-w-[120px] mr-2">Certification:</strong>
                <span>{trainer.certification}</span>
              </p>
            )}

            {trainer.experience && (
              <p className="text-sm flex">
                <strong className="min-w-[120px] mr-2">Experience:</strong>
                <span>{trainer.experience} years</span>
              </p>
            )}

            {/* Display all other valid trainer fields dynamically */}
            {trainerFields.map(({ key, value }) => (
              <p key={key} className="text-sm flex flex-wrap">
                <strong className="min-w-[120px] mr-2">{key}:</strong>
                <span>
                  {typeof value === "object" ? JSON.stringify(value) : value}
                </span>
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Expandable Classes Section */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out bg-white bg-opacity-70 px-4
          ${
            isClassesExpanded
              ? "max-h-[600px] py-4 border-t border-gray-200"
              : "max-h-0 py-0"
          }`}
      >
        {/* Only render content when expanded for better performance */}
        {isClassesExpanded && (
          <div className="text-sm space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Calendar size={16} />
              Classes Schedule
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {trainerClasses.length}{" "}
                {trainerClasses.length === 1 ? "class" : "classes"}
              </span>
            </h4>

            {trainerClasses.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No classes assigned to this trainer
              </p>
            ) : (
              <div className="space-y-3">
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
                    <div key={day} className="border-l-2 border-blue-200 pl-3">
                      <h5 className="font-medium text-gray-800 mb-2">{day}</h5>
                      <div className="space-y-2">
                        {classes.map((classSchedule) => (
                          <div
                            key={classSchedule.schedule_id}
                            className="bg-gray-50 rounded p-2 text-xs"
                          >
                            <div className="font-medium text-gray-900">
                              {classSchedule.class_name ||
                                `Class #${classSchedule.class_id}`}
                            </div>
                            <div className="text-gray-600 mt-1">
                              🕐 {formatTime(classSchedule.start_time)} -{" "}
                              {formatTime(classSchedule.end_time)}
                            </div>
                            {classSchedule.status && (
                              <div
                                className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${
                                  classSchedule.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {classSchedule.status}
                              </div>
                            )}
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
