import React, { useState, useEffect } from "react";
import { formatFullName } from "../../utils/formatters";
import { staffService, classService } from "../../api";
import Loader from "../common/Loader";

const TrainerSchedule = () => {
  const [trainers, setTrainers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Days of the week to display
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all trainers and schedules from the API
        const [trainersData, schedulesData] = await Promise.all([
          staffService.getTrainers(),
          classService.getSchedules("active"),
        ]);

        setTrainers(Array.isArray(trainersData) ? trainersData : []);
        setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
      } catch (err) {
        setError("Failed to load trainer schedule data");
        console.error("Error fetching trainer schedule data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format time from HH:MM:SS to HH:MM
  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };

  // Get classes for a specific trainer on a specific day
  const getTrainerClassesForDay = (trainerId, dayOfWeek) => {
    return schedules.filter(
      (schedule) =>
        (schedule.trainer_id === trainerId ||
          schedule.trainer_id === parseInt(trainerId)) &&
        schedule.day_of_week === dayOfWeek &&
        schedule.status === "active"
    );
  };

  // Get class color based on class name
  const getClassColor = (className) => {
    const colors = {
      yoga: "bg-blue-100 text-blue-800",
      pilates: "bg-green-100 text-green-800",
      spinning: "bg-purple-100 text-purple-800",
      hiit: "bg-yellow-100 text-yellow-800",
      zumba: "bg-pink-100 text-pink-800",
      crossfit: "bg-red-100 text-red-800",
      cardio: "bg-orange-100 text-orange-800",
      strength: "bg-indigo-100 text-indigo-800",
      flexibility: "bg-teal-100 text-teal-800",
    };

    const lowerClassName = className.toLowerCase();
    for (const [key, color] of Object.entries(colors)) {
      if (lowerClassName.includes(key)) {
        return color;
      }
    }
    return "bg-gray-100 text-gray-800"; // Default color
  };

  if (loading) {
    return <Loader message="Loading trainer schedules..." />;
  }

  if (error) {
    return (
      <div className="py-4 text-center text-red-500">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!trainers.length) {
    return (
      <div className="py-4 text-center text-gray-500">
        No trainers available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b">
            <th className="py-2 px-4 text-left font-semibold">Trainer</th>
            {daysOfWeek.map((day) => (
              <th key={day} className="py-2 px-4 text-left font-semibold">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trainers.map((trainer) => {
            // Get consistent trainer ID
            const trainerId = trainer.trainer_id || trainer.id;
            const trainerName = trainer.staff
              ? formatFullName(
                  trainer.staff.first_name,
                  trainer.staff.last_name
                )
              : `Trainer #${trainerId}`;

            return (
              <tr key={trainerId} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {trainerName}
                    </div>
                    {trainer.specialization && (
                      <div className="text-xs text-gray-500">
                        {trainer.specialization}
                      </div>
                    )}
                  </div>
                </td>
                {daysOfWeek.map((day) => {
                  const dayClasses = getTrainerClassesForDay(trainerId, day);

                  return (
                    <td key={day} className="py-3 px-4 text-sm">
                      <div className="space-y-1">
                        {dayClasses.length === 0 ? (
                          <div className="text-gray-400 text-xs">
                            No classes
                          </div>
                        ) : (
                          dayClasses.map((classSchedule) => (
                            <div
                              key={classSchedule.schedule_id}
                              className={`p-2 rounded text-xs ${getClassColor(
                                classSchedule.class_name || ""
                              )}`}
                            >
                              <div className="font-medium">
                                {classSchedule.class_name ||
                                  `Class #${classSchedule.class_id}`}
                              </div>
                              <div className="text-xs opacity-75">
                                {formatTime(classSchedule.start_time)} -{" "}
                                {formatTime(classSchedule.end_time)}
                              </div>
                              {classSchedule.class_duration && (
                                <div className="text-xs opacity-75">
                                  {classSchedule.class_duration} min
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary footer */}
      <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">
        <div className="flex justify-between items-center">
          <span>
            Showing schedules for <strong>{trainers.length}</strong> trainer
            {trainers.length !== 1 ? "s" : ""}
          </span>
          <span>
            Total active classes: <strong>{schedules.length}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrainerSchedule;
