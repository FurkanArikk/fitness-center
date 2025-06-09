import React, { useState, useEffect } from "react";
import { Clock, User, Users, Eye, MapPin } from "lucide-react";
import { formatTime } from "../../utils/formatters";

const ClassSchedule = ({ classes }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getCapacityData = (classItem) => {
    // In a real app, this would come from bookings data
    const currentBookings = Math.floor(Math.random() * 15) + 1;
    const maxCapacity = 15;
    const percentage = (currentBookings / maxCapacity) * 100;

    return { currentBookings, maxCapacity, percentage };
  };

  const getStatusColor = (startTime) => {
    const now = new Date();
    const classTime = new Date();
    const [hours, minutes] = startTime.split(":");
    classTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const timeDiff = classTime.getTime() - now.getTime();
    const hoursUntil = timeDiff / (1000 * 60 * 60);

    if (hoursUntil < 1) return "from-red-500 to-red-600";
    if (hoursUntil < 2) return "from-amber-500 to-amber-600";
    return "from-emerald-500 to-emerald-600";
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Today's Classes
          </h2>
          <p className="text-gray-600">Live schedule updates</p>
        </div>
        <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 rounded-xl">
          <Clock size={16} className="text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            {currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No Classes Today
          </h3>
          <p className="text-gray-500">
            Check back tomorrow for upcoming classes.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {classes.map((cls, index) => {
            const { currentBookings, maxCapacity, percentage } =
              getCapacityData(cls);
            const statusGradient = getStatusColor(cls.start_time);

            return (
              <div
                key={cls.schedule_id}
                className="group bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Class Info */}
                  <div className="lg:col-span-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 bg-gradient-to-r ${statusGradient} rounded-full shadow-lg`}
                      ></div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">
                          {cls.class_name}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                          <MapPin size={14} />
                          <span>Room {cls.room_id}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trainer */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <User size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          Trainer #{cls.trainer_id}
                        </p>
                        <p className="text-xs text-gray-500">Certified</p>
                      </div>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="lg:col-span-2">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3">
                      <div className="flex items-center space-x-1 text-blue-700">
                        <Clock size={14} />
                        <span className="font-semibold text-sm">
                          {formatTime(cls.start_time)} -{" "}
                          {formatTime(cls.end_time)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className="lg:col-span-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Users size={14} />
                          <span>Capacity</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">
                          {currentBookings}/{maxCapacity}
                        </span>
                      </div>

                      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${
                            percentage > 80
                              ? "from-red-400 to-red-500"
                              : percentage > 60
                              ? "from-amber-400 to-amber-500"
                              : "from-emerald-400 to-emerald-500"
                          } transition-all duration-1000 ease-out shadow-sm`}
                          style={{
                            width: `${percentage}%`,
                            animation: "fillProgress 1.5s ease-out",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        @keyframes fillProgress {
          from {
            width: 0%;
          }
          to {
            width: var(--final-width);
          }
        }
      `}</style>
    </div>
  );
};

export default ClassSchedule;
