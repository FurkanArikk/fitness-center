import React, { useState, useEffect } from "react";
import {
  Star,
  Award,
  Clock,
  TrendingUp,
  User,
  Zap,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TrainersList = ({ trainers = [] }) => {
  const [popularTrainers, setPopularTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Color palette matching the class cards - vibrant and distinct
  const trainerColorThemes = [
    {
      gradient: "from-blue-500 via-blue-600 to-indigo-600",
      bgPattern: "from-blue-50 via-indigo-50 to-purple-50",
      accent: "blue",
      avatarBg: "from-blue-600 to-indigo-700",
      buttonGradient: "from-indigo-500 to-purple-600",
      code: "T7",
      id: "T07",
    },
    {
      gradient: "from-orange-500 via-red-500 to-pink-600",
      bgPattern: "from-orange-50 via-red-50 to-pink-50",
      accent: "orange",
      avatarBg: "from-orange-600 to-red-700",
      buttonGradient: "from-red-500 to-pink-600",
      code: "T4",
      id: "T04",
    },
    {
      gradient: "from-purple-500 via-violet-500 to-fuchsia-600",
      bgPattern: "from-purple-50 via-violet-50 to-fuchsia-50",
      accent: "purple",
      avatarBg: "from-purple-600 to-fuchsia-700",
      buttonGradient: "from-violet-500 to-purple-600",
      code: "T2",
      id: "T02",
    },
    {
      gradient: "from-emerald-500 via-green-500 to-teal-600",
      bgPattern: "from-emerald-50 via-green-50 to-teal-50",
      accent: "emerald",
      avatarBg: "from-emerald-600 to-teal-700",
      buttonGradient: "from-green-500 to-teal-600",
      code: "T1",
      id: "T01",
    },
    {
      gradient: "from-cyan-500 via-blue-500 to-indigo-600",
      bgPattern: "from-cyan-50 via-blue-50 to-indigo-50",
      accent: "cyan",
      avatarBg: "from-cyan-600 to-blue-700",
      buttonGradient: "from-blue-500 to-indigo-600",
      code: "T5",
      id: "T05",
    },
    {
      gradient: "from-pink-500 via-rose-500 to-red-600",
      bgPattern: "from-pink-50 via-rose-50 to-red-50",
      accent: "pink",
      avatarBg: "from-pink-600 to-red-700",
      buttonGradient: "from-rose-500 to-pink-600",
      code: "T0",
      id: "T10",
    },
  ];

  useEffect(() => {
    const processTrainers = () => {
      if (!trainers || trainers.length === 0) {
        setPopularTrainers([]);
        setLoading(false);
        return;
      }

      // Process real trainer data from API
      const processedTrainers = trainers
        .filter((trainer) => trainer && trainer.is_active !== false) // Only active trainers
        .sort((a, b) => (b.rating || 0) - (a.rating || 0)) // Sort by rating
        .slice(0, 6) // Top 6 trainers
        .map((trainer, index) => {
          const trainerId = trainer.trainer_id || trainer.id;
          const colorTheme =
            trainerColorThemes[index % trainerColorThemes.length];

          // Get trainer name from staff details or fallback
          const getTrainerName = () => {
            if (
              trainer.staff &&
              trainer.staff.first_name &&
              trainer.staff.last_name
            ) {
              return `${trainer.staff.first_name} ${trainer.staff.last_name}`;
            }
            if (trainer.name) return trainer.name;
            return `Trainer #${trainerId}`;
          };

          // Generate trainer initials
          const getTrainerInitials = () => {
            if (
              trainer.staff &&
              trainer.staff.first_name &&
              trainer.staff.last_name
            ) {
              return `${trainer.staff.first_name.charAt(
                0
              )}${trainer.staff.last_name.charAt(0)}`.toUpperCase();
            }
            return colorTheme.code;
          };

          return {
            ...trainer,
            trainer_id: trainerId,
            name: getTrainerName(),
            initials: getTrainerInitials(),
            displayId: colorTheme.id,
            specialization: trainer.specialization || "General Training",
            rating: trainer.rating || 4.5,
            experience: trainer.experience || 3,
            certification: trainer.certification || "Certified Trainer",
            sessionsCount: Math.floor(Math.random() * 100) + 50, // Mock session count
            colorTheme,
            rank: index + 1,
          };
        });

      setTimeout(() => {
        setPopularTrainers(processedTrainers);
        setLoading(false);
      }, 300);
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8"
      >
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-white/30 backdrop-blur-xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl blur-lg opacity-75 animate-pulse"></div>
              <div className="relative p-5 rounded-3xl bg-gradient-to-br from-orange-100 to-red-200 shadow-xl">
                <Award size={32} className="text-orange-700" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                Top Weekly Trainers
              </h2>
              <p className="text-gray-600 font-medium text-lg">
                Performance leaders
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="animate-pulse flex items-center space-x-6 p-6 rounded-2xl bg-gradient-to-r from-gray-50 to-white border border-gray-100"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-20 h-20 bg-gray-200 rounded-3xl"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-gray-200 rounded-full w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded-full w-1/2"></div>
                  <div className="h-3 bg-gray-100 rounded-full w-2/3"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-8 w-16 bg-gray-200 rounded-full"></div>
                  <div className="h-6 w-20 bg-gray-100 rounded-full"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (popularTrainers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-white/30 backdrop-blur-xl"></div>

        <div className="relative z-10 text-center py-12">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl"
          >
            <User size={40} className="text-gray-500" />
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            No Active Trainers
          </h3>
          <p className="text-gray-600">Add trainers to see performance data</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8"
    >
      {/* Modern Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-400/20 to-red-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-white/30 backdrop-blur-xl"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition-all duration-300 animate-pulse"></div>
              <div className="relative p-4 rounded-3xl bg-gradient-to-br from-orange-100 to-red-200 shadow-xl group-hover:scale-110 transition-all duration-300">
                <Award size={28} className="text-orange-700" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-1">
                Top Trainers
              </h2>
              <p className="text-gray-700 font-medium text-base">
                ⚡ Performance leaders
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-center px-5 py-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-100 shadow-lg"
            >
              <div className="text-xl font-black text-orange-600">
                {(
                  popularTrainers.reduce((sum, t) => sum + (t.rating || 0), 0) /
                  popularTrainers.length
                ).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600 font-semibold">
                Avg Rating
              </div>
            </motion.div>
          </div>
        </div>

        {/* Trainer Cards */}
        <div className="space-y-5">
          <AnimatePresence>
            {popularTrainers.slice(0, 4).map((trainer, index) => {
              const experienceLevel = getExperienceLevel(trainer.experience);
              const theme = trainer.colorTheme;

              return (
                <motion.div
                  key={trainer.trainer_id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.6,
                    type: "spring",
                    stiffness: 100,
                  }}
                  className={`group relative overflow-hidden bg-gradient-to-r ${theme.bgPattern} rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-white/40 backdrop-blur-sm`}
                  style={{
                    background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 50%, rgba(241,245,249,0.9) 100%)`,
                  }}
                >
                  {/* Background elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-all duration-700"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/20 to-transparent rounded-full blur-xl group-hover:scale-125 transition-all duration-500"></div>

                  {/* Rank Badge */}
                  <div className="absolute top-4 right-4">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      className={`w-10 h-10 bg-gradient-to-br ${theme.gradient} rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-xl`}
                    >
                      #{trainer.rank}
                    </motion.div>
                  </div>

                  <div className="relative z-10 flex items-center gap-6">
                    {/* Trainer Avatar */}
                    <div className="relative">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} rounded-3xl blur-lg opacity-50 group-hover:opacity-70 transition-all duration-300 animate-pulse`}
                      ></div>
                      <div
                        className={`relative w-20 h-20 bg-gradient-to-br ${theme.avatarBg} rounded-3xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                      >
                        <div className="text-center">
                          <div className="text-sm font-bold opacity-80">
                            {trainer.displayId}
                          </div>
                          <div className="text-base font-black">
                            {trainer.initials}
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-white/20 rounded-3xl group-hover:bg-white/30 transition-all duration-300"></div>
                      </div>

                      {/* Status indicator */}
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full animate-pulse"></div>
                      </div>
                    </div>

                    {/* Trainer Info */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-3">
                        <h3 className="text-xl font-black text-gray-900 mb-1 group-hover:scale-105 transition-all duration-300 truncate">
                          {trainer.name}
                        </h3>
                        <p className="text-base font-semibold text-gray-700 mb-3 truncate">
                          {trainer.specialization}
                        </p>

                        {/* Rating Stars */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={16}
                                className={`${
                                  star <= Math.floor(trainer.rating)
                                    ? "text-amber-400 fill-current"
                                    : star <= trainer.rating
                                    ? "text-amber-400 fill-current opacity-50"
                                    : "text-gray-300"
                                } transition-all duration-300`}
                              />
                            ))}
                          </div>
                          <span className="text-base font-bold text-gray-800">
                            ({trainer.rating}/5.0)
                          </span>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-full">
                            <Clock size={14} />
                            <span className="font-semibold">
                              {trainer.sessionsCount}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-full">
                            <Calendar size={14} />
                            <span className="font-semibold">
                              {trainer.experience}y
                            </span>
                          </div>
                          <div
                            className={`px-3 py-2 bg-gradient-to-r ${experienceLevel.color} text-white text-sm font-bold rounded-full shadow-lg`}
                          >
                            {experienceLevel.label}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Indicator */}
                    <div className="text-center">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="relative"
                      >
                        <div
                          className={`w-18 h-18 bg-gradient-to-br ${theme.gradient} rounded-full flex items-center justify-center text-white shadow-xl`}
                        >
                          <div className="text-center">
                            <div className="text-xl font-black">
                              {trainer.sessionsCount}
                            </div>
                            <div className="text-sm font-semibold opacity-80">
                              Week
                            </div>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-full"></div>
                      </motion.div>

                      {/* Trending indicator */}
                      {index < 2 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="flex items-center justify-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold mt-3 shadow-lg"
                        >
                          <TrendingUp size={12} />
                          <span>Top</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.4 }}
          className="mt-6 pt-4 border-t border-gray-200/50"
        >
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-gray-500">
              <span className="font-semibold">
                Updated: {new Date().toLocaleDateString()}
              </span>
              <div className="flex items-center gap-1">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <TrendingUp size={12} />
                </motion.div>
                <span>Live</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <Award size={14} className="text-amber-500" />
              <span className="font-semibold">
                Top {Math.min(4, popularTrainers.length)} shown
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TrainersList;
