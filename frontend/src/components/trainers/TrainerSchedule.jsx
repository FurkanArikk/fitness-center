import React, { useState, useEffect } from "react";
import { formatFullName } from "../../utils/formatters";
import { TrainerAvatar } from "../../utils/avatarGenerator";
import { staffService } from "../../api";
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
      setError(null);
      try {
        // Fetch all trainers first
        const trainersData = await staffService.getTrainers();
        console.log("Fetched trainers:", trainersData);

        // Ensure trainersData is an array
        const trainersArray = Array.isArray(trainersData) ? trainersData : [];
        setTrainers(trainersArray);

        // Fetch all schedules using the new method
        const schedulesData = await staffService.getAllSchedules();
        console.log("Fetched schedules:", schedulesData);

        // Ensure schedulesData is an array
        const schedulesArray = Array.isArray(schedulesData)
          ? schedulesData
          : [];

        // Filter only active schedules
        const activeSchedules = schedulesArray.filter(
          (schedule) => schedule.status === "active"
        );

        setSchedules(activeSchedules);
      } catch (err) {
        console.error("Error fetching trainer schedule data:", err);
        setError("Failed to load trainer schedule data. Please try again.");
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
    if (!schedules || !Array.isArray(schedules)) return [];

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
    if (!className) return "bg-gray-100 text-gray-800";

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
      <div className="py-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-red-600 mb-4">
            <svg
              className="h-8 w-8 mx-auto mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!trainers || trainers.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-gray-500 mb-4">
            <svg
              className="h-8 w-8 mx-auto mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="font-medium">No trainers available</p>
            <p className="text-sm">
              Check back later or contact an administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="py-3 px-4 text-left font-semibold text-gray-900">
                Trainer
              </th>
              {daysOfWeek.map((day) => (
                <th
                  key={day}
                  className="py-3 px-4 text-left font-semibold text-gray-900"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
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
                <tr
                  key={trainerId}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <TrainerAvatar
                        trainer={trainer}
                        size="w-12 h-12"
                        className="flex-shrink-0 ring-2 ring-white shadow-md"
                        showIcon={true}
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {trainerName}
                        </div>
                        {trainer.specialization && (
                          <div className="text-sm text-gray-500 font-medium capitalize">
                            {trainer.specialization} Training
                          </div>
                        )}
                        {trainer.experience_years && (
                          <div className="text-xs text-gray-400">
                            {trainer.experience_years} years experience
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  {daysOfWeek.map((day) => {
                    const dayClasses = getTrainerClassesForDay(trainerId, day);

                    return (
                      <td key={day} className="py-4 px-4 text-sm">
                        <div className="space-y-2">
                          {dayClasses.length === 0 ? (
                            <div className="text-gray-400 text-xs italic">
                              No classes
                            </div>
                          ) : (
                            dayClasses.map((classSchedule) => (
                              <div
                                key={classSchedule.schedule_id}
                                className={`p-2 rounded-md text-xs shadow-sm ${getClassColor(
                                  classSchedule.class_name || ""
                                )}`}
                              >
                                <div className="font-medium">
                                  {classSchedule.class_name ||
                                    `Class #${classSchedule.class_id}`}
                                </div>
                                <div className="text-xs opacity-75 mt-1">
                                  {formatTime(classSchedule.start_time)} -{" "}
                                  {formatTime(classSchedule.end_time)}
                                </div>
                                {classSchedule.class_duration && (
                                  <div className="text-xs opacity-75">
                                    {classSchedule.class_duration} min
                                  </div>
                                )}
                                {classSchedule.room_id && (
                                  <div className="text-xs opacity-75">
                                    Room {classSchedule.room_id}
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
      </div>

      {/* Summary footer */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
          <div className="text-sm text-gray-600">
            Showing schedules for{" "}
            <span className="font-semibold text-gray-900">
              {trainers.length}
            </span>{" "}
            trainer
            {trainers.length !== 1 ? "s" : ""}
          </div>
          <div className="text-sm text-gray-600">
            Total active classes:{" "}
            <span className="font-semibold text-gray-900">
              {schedules.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerSchedule;
