import React, { useState, useEffect } from "react";
import { Star, Award, Clock, TrendingUp, User } from "lucide-react";

const TrainersList = ({ trainers = [] }) => {
  const [popularTrainers, setPopularTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate processing trainer data with ratings and experience
    const processTrainers = () => {
      const mockTrainers =
        trainers.length > 0
          ? trainers
          : [
              {
                trainer_id: 1,
                name: "Sarah Johnson",
                specialization: "Yoga & Pilates",
                rating: 4.9,
                experience: 8,
                sessions: 156,
                certification: "RYT-500",
                avatar: "SJ",
              },
              {
                trainer_id: 2,
                name: "Mike Chen",
                specialization: "CrossFit & HIIT",
                rating: 4.7,
                experience: 6,
                sessions: 142,
                certification: "Level 2 CrossFit",
                avatar: "MC",
              },
              {
                trainer_id: 3,
                name: "Emma Davis",
                specialization: "Spinning & Cardio",
                rating: 4.8,
                experience: 5,
                sessions: 98,
                certification: "ICG Certified",
                avatar: "ED",
              },
              {
                trainer_id: 4,
                name: "Alex Rodriguez",
                specialization: "Personal Training",
                rating: 4.6,
                experience: 10,
                sessions: 203,
                certification: "NASM-CPT",
                avatar: "AR",
              },
            ];

      const enrichedTrainers = mockTrainers.map((trainer, index) => ({
        ...trainer,
        gradient: [
          "from-blue-500 to-blue-600",
          "from-emerald-500 to-emerald-600",
          "from-purple-500 to-purple-600",
          "from-amber-500 to-amber-600",
        ][index % 4],
        bgGradient: [
          "from-blue-50 to-blue-100",
          "from-emerald-50 to-emerald-100",
          "from-purple-50 to-purple-100",
          "from-amber-50 to-amber-100",
        ][index % 4],
      }));

      setTimeout(() => {
        setPopularTrainers(enrichedTrainers);
        setLoading(false);
      }, 600);
    };

    processTrainers();
  }, [trainers]);

  const getExperienceLevel = (years) => {
    if (years >= 8)
      return { label: "Expert", color: "from-emerald-500 to-emerald-600" };
    if (years >= 5)
      return { label: "Advanced", color: "from-blue-500 to-blue-600" };
    if (years >= 3)
      return { label: "Intermediate", color: "from-amber-500 to-amber-600" };
    return { label: "Beginner", color: "from-gray-500 to-gray-600" };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Popular Trainers
        </h2>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
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
            Popular Trainers
          </h2>
          <p className="text-gray-600">Top rated this month</p>
        </div>
        <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-50 to-amber-100 px-3 py-2 rounded-xl">
          <Award size={16} className="text-amber-600" />
          <span className="text-sm font-medium text-amber-700">Featured</span>
        </div>
      </div>

      <div className="space-y-6">
        {popularTrainers.map((trainer, index) => {
          const experienceLevel = getExperienceLevel(trainer.experience);

          return (
            <div
              key={trainer.trainer_id}
              className="group relative bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background accent */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${trainer.bgGradient} opacity-20 rounded-2xl`}
              ></div>

              <div className="relative z-10 flex items-center space-x-4">
                {/* Avatar */}
                <div className="relative">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${trainer.gradient} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    {trainer.avatar || <User size={24} />}
                  </div>

                  {/* Rating badge */}
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-lg">
                    <div className="flex items-center space-x-1 bg-amber-100 rounded-full px-2 py-1">
                      <Star size={10} className="text-amber-500 fill-current" />
                      <span className="text-xs font-bold text-amber-700">
                        {trainer.rating}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trainer Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-bold text-gray-800 text-lg">
                        {trainer.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {trainer.specialization}
                      </p>

                      {/* Stats row */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock size={12} />
                          <span>{trainer.sessions} sessions</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Award size={12} />
                          <span>{trainer.certification}</span>
                        </div>
                      </div>
                    </div>

                    {/* Experience badge */}
                    <div
                      className={`px-3 py-1 bg-gradient-to-r ${experienceLevel.color} text-white text-xs font-semibold rounded-full shadow-sm`}
                    >
                      {trainer.experience}y {experienceLevel.label}
                    </div>
                  </div>

                  {/* Rating stars */}
                  <div className="flex items-center space-x-1 mt-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={`${
                          star <= Math.floor(trainer.rating)
                            ? "text-amber-400 fill-current"
                            : star <= trainer.rating
                            ? "text-amber-400 fill-current opacity-50"
                            : "text-gray-300"
                        } transition-colors duration-300`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">
                      ({trainer.rating}/5.0)
                    </span>
                  </div>
                </div>

                {/* Trending indicator */}
                {index < 2 && (
                  <div className="flex items-center space-x-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-semibold">
                    <TrendingUp size={12} />
                    <span>Hot</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrainersList;
