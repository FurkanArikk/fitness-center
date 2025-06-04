import React, { useState, useEffect } from "react";
import { TrendingUp, Users, Star, Calendar } from "lucide-react";

const PopularClasses = () => {
  const [popularClasses, setPopularClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call - in real app, this would fetch from class service
    const mockData = [
      {
        name: "Yoga",
        popularity: 85,
        attendees: 127,
        rating: 4.9,
        sessions: 12,
        gradient: "from-emerald-400 to-emerald-600",
        bgGradient: "from-emerald-50 to-emerald-100",
      },
      {
        name: "CrossFit",
        popularity: 78,
        attendees: 98,
        rating: 4.7,
        sessions: 8,
        gradient: "from-red-400 to-red-600",
        bgGradient: "from-red-50 to-red-100",
      },
      {
        name: "Spinning",
        popularity: 72,
        attendees: 89,
        rating: 4.6,
        sessions: 10,
        gradient: "from-amber-400 to-amber-600",
        bgGradient: "from-amber-50 to-amber-100",
      },
      {
        name: "Pilates",
        popularity: 68,
        attendees: 76,
        rating: 4.8,
        sessions: 6,
        gradient: "from-purple-400 to-purple-600",
        bgGradient: "from-purple-50 to-purple-100",
      },
      {
        name: "HIIT",
        popularity: 65,
        attendees: 71,
        rating: 4.5,
        sessions: 9,
        gradient: "from-blue-400 to-blue-600",
        bgGradient: "from-blue-50 to-blue-100",
      },
    ];

    setTimeout(() => {
      setPopularClasses(mockData);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Popular Classes
        </h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-2 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Popular Classes
          </h2>
          <p className="text-gray-600">Most attended this month</p>
        </div>
        <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-emerald-100 px-3 py-2 rounded-xl">
          <TrendingUp size={16} className="text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700">Live</span>
        </div>
      </div>

      <div className="space-y-6">
        {popularClasses.map((classItem, index) => (
          <div
            key={classItem.name}
            className="group relative bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            {/* Background accent */}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${classItem.bgGradient} opacity-30 rounded-2xl`}
            ></div>

            <div className="relative z-10">
              {/* Header with rank and name */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-10 h-10 bg-gradient-to-br ${classItem.gradient} rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      {classItem.name}
                    </h3>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Users size={14} />
                        <span>{classItem.attendees} attendees</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{classItem.sessions} sessions</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-1 bg-white rounded-full px-3 py-1 shadow-sm">
                  <Star size={14} className="text-amber-400 fill-current" />
                  <span className="font-semibold text-gray-800">
                    {classItem.rating}
                  </span>
                </div>
              </div>

              {/* Progress bar with percentage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Popularity
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    {classItem.popularity}%
                  </span>
                </div>

                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${classItem.gradient} transition-all duration-1000 ease-out shadow-sm`}
                    style={{
                      width: `${classItem.popularity}%`,
                      animation: `fillProgress 1.5s ease-out ${
                        index * 200
                      }ms both`,
                    }}
                  ></div>

                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes fillProgress {
          from {
            width: 0%;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default PopularClasses;
