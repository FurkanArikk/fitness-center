import React, { useEffect, useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  TrendingUp,
  Users,
  Zap,
  Star,
  Clock,
  Calendar,
} from "lucide-react";

// Updated color palette to exactly match TrainersList colors
const TRAINER_COLOR_THEMES = [
  {
    main: "#3B82F6", // Blue
    gradient: "linear-gradient(135deg, #3B82F6 0%, #4F46E5 50%, #7C3AED 100%)",
    shadow: "rgba(59, 130, 246, 0.4)",
    glow: "0 0 20px rgba(59, 130, 246, 0.6)",
    accent: "blue",
    bgPattern: "from-blue-50 via-indigo-50 to-purple-50",
    code: "T7",
    id: "T07",
  },
  {
    main: "#F97316", // Orange
    gradient: "linear-gradient(135deg, #F97316 0%, #EF4444 50%, #EC4899 100%)",
    shadow: "rgba(249, 115, 22, 0.4)",
    glow: "0 0 20px rgba(249, 115, 22, 0.6)",
    accent: "orange",
    bgPattern: "from-orange-50 via-red-50 to-pink-50",
    code: "T4",
    id: "T04",
  },
  {
    main: "#A855F7", // Purple
    gradient: "linear-gradient(135deg, #A855F7 0%, #8B5CF6 50%, #D946EF 100%)",
    shadow: "rgba(168, 85, 247, 0.4)",
    glow: "0 0 20px rgba(168, 85, 247, 0.6)",
    accent: "purple",
    bgPattern: "from-purple-50 via-violet-50 to-fuchsia-50",
    code: "T2",
    id: "T02",
  },
  {
    main: "#10B981", // Emerald
    gradient: "linear-gradient(135deg, #10B981 0%, #22C55E 50%, #0D9488 100%)",
    shadow: "rgba(16, 185, 129, 0.4)",
    glow: "0 0 20px rgba(16, 185, 129, 0.6)",
    accent: "emerald",
    bgPattern: "from-emerald-50 via-green-50 to-teal-50",
    code: "T1",
    id: "T01",
  },
  {
    main: "#06B6D4", // Cyan
    gradient: "linear-gradient(135deg, #06B6D4 0%, #3B82F6 50%, #4F46E5 100%)",
    shadow: "rgba(6, 182, 212, 0.4)",
    glow: "0 0 20px rgba(6, 182, 212, 0.6)",
    accent: "cyan",
    bgPattern: "from-cyan-50 via-blue-50 to-indigo-50",
    code: "T5",
    id: "T05",
  },
  {
    main: "#EC4899", // Pink
    gradient: "linear-gradient(135deg, #EC4899 0%, #F43F5E 50%, #EF4444 100%)",
    shadow: "rgba(236, 72, 153, 0.4)",
    glow: "0 0 20px rgba(236, 72, 153, 0.6)",
    accent: "pink",
    bgPattern: "from-pink-50 via-rose-50 to-red-50",
    code: "T0",
    id: "T10",
  },
];

const TopTrainersChart = ({ trainers = [], schedules = [] }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [animationKey, setAnimationKey] = useState(0);

  // Animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Trigger re-animation when data changes
  useEffect(() => {
    setAnimationKey((prev) => prev + 1);
  }, [trainers, schedules]);

  // Helper function to get trainer name safely
  const getTrainerName = (trainer) => {
    if (!trainer) return "Unknown Trainer";

    if (trainer.staff && trainer.staff.first_name && trainer.staff.last_name) {
      return `${trainer.staff.first_name} ${trainer.staff.last_name}`;
    }
    if (trainer.name) {
      return trainer.name;
    }
    const trainerId = trainer.trainer_id || trainer.id;
    return `Trainer #${trainerId}`;
  };

  // Calculate weekly classes for each trainer with enhanced matching
  const trainerClassData = useMemo(() => {
    if (
      !trainers ||
      !Array.isArray(trainers) ||
      !schedules ||
      !Array.isArray(schedules)
    ) {
      return [];
    }

    const trainerClassCount = {};

    // Initialize all trainers with 0 classes
    trainers.forEach((trainer) => {
      const trainerId = trainer.trainer_id || trainer.id;
      if (trainerId) {
        trainerClassCount[trainerId] = {
          trainer,
          trainerId,
          name: getTrainerName(trainer),
          weeklyClasses: 0,
          specialization: trainer.specialization || "General Training",
          isActive: trainer.is_active !== false,
          rating: trainer.rating || 4.5,
          experience: trainer.experience || 3,
          certification: trainer.certification || "Certified Trainer",
        };
      }
    });

    // Count active schedules for each trainer
    schedules.forEach((schedule) => {
      if (schedule && schedule.trainer_id && schedule.status === "active") {
        const trainerId = schedule.trainer_id;
        if (trainerClassCount[trainerId]) {
          trainerClassCount[trainerId].weeklyClasses += 1;
        }
      }
    });

    // Convert to array and filter out trainers with 0 classes
    const result = Object.values(trainerClassCount)
      .filter((item) => item.weeklyClasses > 0)
      .sort((a, b) => b.weeklyClasses - a.weeklyClasses)
      .slice(0, 5) // Top 5 trainers
      .map((item, index) => {
        const colorTheme =
          TRAINER_COLOR_THEMES[index % TRAINER_COLOR_THEMES.length];

        // Generate trainer initials for display
        const getTrainerInitials = () => {
          if (
            item.trainer.staff &&
            item.trainer.staff.first_name &&
            item.trainer.staff.last_name
          ) {
            return `${item.trainer.staff.first_name.charAt(
              0
            )}${item.trainer.staff.last_name.charAt(0)}`.toUpperCase();
          }
          return colorTheme.code;
        };

        return {
          ...item,
          color: colorTheme,
          fill: colorTheme.main,
          value: item.weeklyClasses,
          rank: index + 1,
          initials: getTrainerInitials(),
          displayId: colorTheme.id,
          sessionsCount: Math.floor(Math.random() * 100) + 50, // Mock session count to match TrainersList
        };
      });

    return result;
  }, [trainers, schedules]);

  // Enhanced custom tooltip component with matching design
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative overflow-hidden bg-white/95 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/40"
          style={{
            boxShadow: `0 20px 25px -5px ${data.color.shadow}, 0 10px 10px -5px rgba(0, 0, 0, 0.04)`,
          }}
        >
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-white/30 backdrop-blur-xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              {/* Trainer Avatar */}
              <div className="relative">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl"
                  style={{ background: data.color.gradient }}
                >
                  <div className="text-center">
                    <div className="text-xs font-bold opacity-80">
                      {data.displayId}
                    </div>
                    <div className="text-sm font-black">{data.initials}</div>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"></div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-4 h-4 rounded-full shadow-lg"
                    style={{ background: data.color.gradient }}
                  />
                  <p className="font-black text-gray-900 text-lg">
                    #{data.rank} {data.name}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  {data.specialization}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={12}
                        className={`${
                          star <= Math.floor(data.rating)
                            ? "text-amber-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-amber-600 font-bold">
                    {data.rating}/5.0
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-2xl border border-blue-100">
                <div className="text-xl font-black text-blue-600">
                  {data.weeklyClasses}
                </div>
                <div className="text-xs text-gray-600 font-semibold">
                  Weekly Classes
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-3 rounded-2xl border border-orange-100">
                <div className="text-xl font-black text-orange-600">
                  {data.sessionsCount}
                </div>
                <div className="text-xs text-gray-600 font-semibold">
                  Total Sessions
                </div>
              </div>
            </div>

            {/* Additional info */}
            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar size={10} />
                <span>{data.experience}y experience</span>
              </div>
              <div className="flex items-center gap-1">
                <Award size={10} />
                <span>{data.certification}</span>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  // Enhanced compact legend component matching TrainersList style
  const CompactTopPerformers = () => {
    const [legendHoveredIndex, setLegendHoveredIndex] = useState(null);

    return (
      <div className="flex-1 pl-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl blur-lg opacity-60 animate-pulse"></div>
            <div className="relative p-3 bg-gradient-to-br from-orange-100 to-red-200 rounded-2xl shadow-xl">
              <Zap size={20} className="text-orange-700" />
            </div>
          </div>
          <div>
            <h4 className="text-lg font-black text-gray-800">Top Performers</h4>
            <p className="text-sm text-gray-600 font-medium">Weekly leaders</p>
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {trainerClassData.map((entry, index) => (
              <motion.div
                key={`${entry.trainerId}-${animationKey}`}
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.9 }}
                transition={{
                  delay: 0.8 + index * 0.1,
                  duration: 0.4,
                  type: "spring",
                  stiffness: 120,
                }}
                className={`relative overflow-hidden p-4 rounded-2xl transition-all duration-300 cursor-pointer border border-white/40 ${
                  legendHoveredIndex === index
                    ? "bg-white/90 backdrop-blur-xl scale-105 shadow-2xl"
                    : "bg-white/60 backdrop-blur-sm hover:bg-white/80"
                }`}
                style={{
                  boxShadow:
                    legendHoveredIndex === index
                      ? `0 8px 25px -3px ${entry.color.shadow}`
                      : "0 2px 10px rgba(0,0,0,0.1)",
                  borderLeft:
                    legendHoveredIndex === index
                      ? `4px solid ${entry.color.main}`
                      : "4px solid transparent",
                }}
                onMouseEnter={() => setLegendHoveredIndex(index)}
                onMouseLeave={() => setLegendHoveredIndex(null)}
              >
                {/* Background effect */}
                {legendHoveredIndex === index && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent backdrop-blur-sm"></div>
                )}

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Trainer Avatar */}
                    <div className="relative">
                      <motion.div
                        className="w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center text-white"
                        style={{ background: entry.color.gradient }}
                        animate={{
                          scale: legendHoveredIndex === index ? 1.15 : 1,
                          rotate: legendHoveredIndex === index ? 5 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="text-center">
                          <div className="text-xs font-bold opacity-80">
                            {entry.displayId}
                          </div>
                          <div className="text-sm font-black">
                            {entry.initials}
                          </div>
                        </div>
                      </motion.div>

                      {/* Rank badge */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-gray-100">
                        <span className="text-xs font-black text-gray-700">
                          #{entry.rank}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div
                        className={`font-black transition-all duration-300 truncate ${
                          legendHoveredIndex === index
                            ? "text-gray-900 text-base"
                            : "text-gray-800 text-sm"
                        }`}
                      >
                        {entry.name}
                      </div>
                      <div className="text-xs text-gray-600 truncate font-semibold">
                        {entry.specialization}
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={10}
                              className={`${
                                star <= Math.floor(entry.rating)
                                  ? "text-amber-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 font-semibold">
                          {entry.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Performance indicator */}
                  <div className="text-center">
                    <motion.div
                      className={`text-2xl font-black transition-all duration-300 ${
                        legendHoveredIndex === index
                          ? "text-gray-900 scale-110"
                          : "text-gray-700"
                      }`}
                      animate={{
                        scale: legendHoveredIndex === index ? 1.15 : 1,
                      }}
                    >
                      {entry.weeklyClasses}
                    </motion.div>
                    <div className="text-xs text-gray-500 font-semibold">
                      classes
                    </div>

                    {/* Trending indicator for top 3 */}
                    {index < 3 && (
                      <div className="flex items-center justify-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold mt-2">
                        <TrendingUp size={10} />
                        <span>Hot</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  // Calculate enhanced stats
  const totalClasses = trainerClassData.reduce(
    (sum, trainer) => sum + trainer.weeklyClasses,
    0
  );
  const avgClasses =
    trainerClassData.length > 0 ? totalClasses / trainerClassData.length : 0;
  const avgRating =
    trainerClassData.length > 0
      ? trainerClassData.reduce((sum, trainer) => sum + trainer.rating, 0) /
        trainerClassData.length
      : 0;

  if (!trainerClassData || trainerClassData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8"
      >
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-white/30 backdrop-blur-xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl blur-lg opacity-75 animate-pulse"></div>
              <div className="p-4 bg-gradient-to-br from-orange-100 to-red-200 rounded-3xl shadow-xl">
                <Award className="text-orange-700" size={24} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                Top Weekly Trainers
              </h3>
              <p className="text-sm text-gray-600 font-medium">
                Performance leaders
              </p>
            </div>
          </div>

          <div className="text-center py-12">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl"
            >
              <TrendingUp size={40} className="text-gray-500" />
            </motion.div>
            <p className="text-xl font-bold text-gray-800 mb-2">
              No active trainers with scheduled classes
            </p>
            <p className="text-sm text-gray-600">
              Schedule classes for trainers to see performance data
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={animationKey}
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8"
    >
      {/* Modern Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-orange-400/20 to-red-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-white/30 backdrop-blur-xl"></div>

      <div className="relative z-10">
        {/* Enhanced Header with Stats */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition-all duration-300 animate-pulse"></div>
              <div className="relative p-4 bg-gradient-to-br from-orange-100 to-red-200 rounded-3xl shadow-xl group-hover:scale-110 transition-all duration-300">
                <Award className="text-orange-700" size={24} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-1">
                Top Weekly Trainers
              </h3>
              <p className="text-sm text-gray-600 font-medium">
                ✨ Performance leaders
              </p>
            </div>
          </div>

          {/* Enhanced Stats Badges */}
          <div className="flex items-center gap-4">
            <motion.div
              className="text-center px-6 py-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-100 shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-xl font-black text-orange-600">
                {totalClasses}
              </div>
              <div className="text-xs text-gray-600 font-semibold leading-none">
                Total
              </div>
            </motion.div>
            <motion.div
              className="text-center px-6 py-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100 shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-xl font-black text-blue-600">
                {avgClasses.toFixed(1)}
              </div>
              <div className="text-xs text-gray-600 font-semibold leading-none">
                Avg
              </div>
            </motion.div>
            <motion.div
              className="text-center px-6 py-3 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-100 shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-xl font-black text-amber-600">
                {avgRating.toFixed(1)}
              </div>
              <div className="text-xs text-gray-600 font-semibold leading-none">
                Rating
              </div>
            </motion.div>
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <Users size={14} />
              <span className="font-semibold">
                {trainerClassData.length} of {trainers.length}
              </span>
            </div>
          </div>
        </div>

        {/* Horizontal Layout: Chart + Top Performers */}
        <div className="flex items-center gap-8">
          {/* Enhanced Chart Section */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotateY: -20 }}
            animate={{
              scale: isVisible ? 1 : 0.8,
              opacity: isVisible ? 1 : 0,
              rotateY: isVisible ? 0 : -20,
            }}
            transition={{
              delay: 0.3,
              duration: 1,
              ease: "easeOut",
              type: "spring",
              stiffness: 120,
            }}
            className="relative flex-shrink-0"
            style={{ perspective: "1000px" }}
          >
            <div className="relative w-80 h-60">
              {/* Enhanced background glow effect */}
              <div
                className="absolute inset-0 rounded-full opacity-20 blur-2xl"
                style={{
                  background: `conic-gradient(${trainerClassData
                    .map(
                      (entry, index) =>
                        `${entry.color.main} ${
                          index * (180 / trainerClassData.length)
                        }deg ${
                          (index + 1) * (180 / trainerClassData.length)
                        }deg`
                    )
                    .join(", ")})`,
                }}
              />

              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trainerClassData}
                    cx="50%"
                    cy="92%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="weeklyClasses"
                    isAnimationActive={true}
                    animationBegin={500}
                    animationDuration={1200}
                    animationEasing="ease-out"
                    onMouseEnter={(data, index) => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {trainerClassData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}-${animationKey}`}
                        fill={entry.color.main}
                        style={{
                          filter:
                            hoveredIndex === index
                              ? `drop-shadow(0 10px 20px ${entry.color.shadow}) brightness(1.15)`
                              : `drop-shadow(0 6px 12px ${entry.color.shadow})`,
                          transform:
                            hoveredIndex === index ? "scale(1.08)" : "scale(1)",
                          transformOrigin: "center",
                          transition: "all 0.3s ease",
                        }}
                        className="cursor-pointer"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Enhanced Center display */}
              <motion.div
                className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/40">
                  <div className="text-3xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {totalClasses}
                  </div>
                  <div className="text-xs text-gray-600 font-semibold leading-none">
                    Weekly Classes
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Enhanced Top Performers List */}
          <CompactTopPerformers />
        </div>

        {/* Enhanced Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.4 }}
          className="mt-8 pt-6 border-t border-gray-200/50"
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
                <span>Live data</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <Award size={14} className="text-amber-500" />
              <span className="font-semibold">
                Top {trainerClassData.length} performers shown
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TopTrainersChart;
