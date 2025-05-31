import React, { useEffect, useState, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Award, TrendingUp, Users, Zap } from "lucide-react";

// Hot-to-cold color palette with gradients
const COLOR_PALETTE = [
  {
    main: "#FF4444", // Hot red for highest
    gradient: "linear-gradient(135deg, #FF6B6B 0%, #FF4444 50%, #E53E3E 100%)",
    shadow: "rgba(255, 68, 68, 0.4)",
    glow: "0 0 20px rgba(255, 68, 68, 0.6)",
  },
  {
    main: "#FF8800", // Orange for second highest
    gradient: "linear-gradient(135deg, #FFA726 0%, #FF8800 50%, #F57C00 100%)",
    shadow: "rgba(255, 136, 0, 0.4)",
    glow: "0 0 20px rgba(255, 136, 0, 0.6)",
  },
  {
    main: "#FFD700", // Gold for middle
    gradient: "linear-gradient(135deg, #FFE082 0%, #FFD700 50%, #FFC107 100%)",
    shadow: "rgba(255, 215, 0, 0.4)",
    glow: "0 0 20px rgba(255, 215, 0, 0.6)",
  },
  {
    main: "#44CC44", // Green for fourth
    gradient: "linear-gradient(135deg, #66BB6A 0%, #44CC44 50%, #388E3C 100%)",
    shadow: "rgba(68, 204, 68, 0.4)",
    glow: "0 0 20px rgba(68, 204, 68, 0.6)",
  },
  {
    main: "#4488FF", // Cool blue for lowest
    gradient: "linear-gradient(135deg, #64B5F6 0%, #4488FF 50%, #1976D2 100%)",
    shadow: "rgba(68, 136, 255, 0.4)",
    glow: "0 0 20px rgba(68, 136, 255, 0.6)",
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

  // Calculate weekly classes for each trainer
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
          specialization: trainer.specialization || "General",
          isActive: trainer.is_active !== false,
          rating: trainer.rating || 0,
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
      .map((item, index) => ({
        ...item,
        color: COLOR_PALETTE[index],
        fill: COLOR_PALETTE[index].main,
        value: item.weeklyClasses,
        rank: index + 1,
      }));

    return result;
  }, [trainers, schedules]);

  // Enhanced custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white p-3 rounded-xl shadow-2xl border border-gray-100"
          style={{
            boxShadow: `0 20px 25px -5px ${data.color.shadow}, 0 10px 10px -5px rgba(0, 0, 0, 0.04)`,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background: data.color.gradient,
                boxShadow: data.color.glow,
              }}
            />
            <p className="font-bold text-gray-800">
              #{data.rank} {data.name}
            </p>
          </div>
          <p className="text-xs text-gray-600 mb-1">{data.specialization}</p>
          <p className="text-sm font-semibold text-blue-600">
            {data.weeklyClasses} classes per week
          </p>
          {data.rating > 0 && (
            <p className="text-xs text-amber-600 mt-1">
              ⭐ {data.rating.toFixed(1)} rating
            </p>
          )}
        </motion.div>
      );
    }
    return null;
  };

  // Compact legend component for horizontal layout
  const CompactTopPerformers = () => {
    const [legendHoveredIndex, setLegendHoveredIndex] = useState(null);

    return (
      <div className="flex-1 pl-8">
        <div className="flex items-center gap-2 mb-6">
          <Zap size={18} className="text-orange-500" />
          <h4 className="text-base font-semibold text-gray-700">
            Top Performers
          </h4>
        </div>

        <div className="space-y-3">
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
                className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 cursor-pointer ${
                  legendHoveredIndex === index
                    ? "bg-gray-50 scale-105 shadow-lg"
                    : "hover:bg-gray-25"
                }`}
                style={{
                  boxShadow:
                    legendHoveredIndex === index
                      ? `0 6px 20px -3px ${entry.color.shadow}`
                      : "none",
                  borderLeft:
                    legendHoveredIndex === index
                      ? `4px solid ${entry.color.main}`
                      : "4px solid transparent",
                }}
                onMouseEnter={() => setLegendHoveredIndex(index)}
                onMouseLeave={() => setLegendHoveredIndex(null)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <motion.div
                      className="w-7 h-7 rounded-full shadow-md"
                      style={{
                        background: entry.color.gradient,
                        boxShadow:
                          legendHoveredIndex === index
                            ? entry.color.glow
                            : `0 3px 6px ${entry.color.shadow}`,
                      }}
                      animate={{
                        scale: legendHoveredIndex === index ? 1.2 : 1,
                        rotate: legendHoveredIndex === index ? 180 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {entry.rank}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`font-semibold transition-all duration-300 truncate ${
                        legendHoveredIndex === index
                          ? "text-gray-900 text-base"
                          : "text-gray-700 text-sm"
                      }`}
                    >
                      {entry.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {entry.specialization}
                    </div>
                  </div>
                </div>
                <motion.div
                  className={`font-bold transition-all duration-300 ${
                    legendHoveredIndex === index
                      ? "text-xl text-gray-900"
                      : "text-base text-gray-600"
                  }`}
                  animate={{
                    scale: legendHoveredIndex === index ? 1.2 : 1,
                  }}
                >
                  {entry.weeklyClasses}
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  // Calculate total classes across all top trainers
  const totalClasses = trainerClassData.reduce(
    (sum, trainer) => sum + trainer.weeklyClasses,
    0
  );
  const avgClasses =
    trainerClassData.length > 0 ? totalClasses / trainerClassData.length : 0;

  if (!trainerClassData || trainerClassData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-lg p-6 w-full"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl">
            <Award className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              Top Weekly Trainers
            </h3>
            <p className="text-xs text-gray-500">Performance leaders</p>
          </div>
        </div>
        <div className="text-center py-8 text-gray-500">
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
          >
            <TrendingUp size={48} className="mx-auto mb-4 opacity-30" />
          </motion.div>
          <p className="font-medium">
            No active trainers with scheduled classes
          </p>
          <p className="text-sm mt-1">
            Schedule classes for trainers to see performance data
          </p>
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
      className="bg-white rounded-2xl shadow-lg p-6 w-full"
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Compact Header with Stats */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            className="p-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl"
            animate={{
              boxShadow: [
                "0 2px 10px rgba(255, 136, 0, 0.3)",
                "0 4px 15px rgba(255, 136, 0, 0.4)",
                "0 2px 10px rgba(255, 136, 0, 0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Award className="text-white" size={20} />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              Top Weekly Trainers
            </h3>
            <p className="text-xs text-gray-500">Performance leaders</p>
          </div>
        </div>

        {/* Compact Stats Badges */}
        <div className="flex items-center gap-3">
          <motion.div
            className="text-center px-3 py-1 bg-gradient-to-br from-orange-50 to-red-50 rounded-full"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-lg font-bold text-orange-600">
              {totalClasses}
            </div>
            <div className="text-xs text-gray-600 leading-none">Total</div>
          </motion.div>
          <motion.div
            className="text-center px-3 py-1 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-lg font-bold text-blue-600">
              {avgClasses.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600 leading-none">Avg</div>
          </motion.div>
          <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
            <Users size={12} />
            <span>
              {trainerClassData.length} of {trainers.length}
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal Layout: Chart + Top Performers */}
      <div className="flex items-center gap-8">
        {/* Chart Section - Made Larger */}
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
            {/* Background glow effect */}
            <div
              className="absolute inset-0 rounded-full opacity-15 blur-xl"
              style={{
                background: `conic-gradient(${trainerClassData
                  .map(
                    (entry, index) =>
                      `${entry.color.main} ${
                        index * (180 / trainerClassData.length)
                      }deg ${(index + 1) * (180 / trainerClassData.length)}deg`
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
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={2}
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
                            ? `drop-shadow(0 8px 16px ${entry.color.shadow}) brightness(1.1)`
                            : `drop-shadow(0 4px 8px ${entry.color.shadow})`,
                        transform:
                          hoveredIndex === index ? "scale(1.05)" : "scale(1)",
                        transformOrigin: "center",
                        transition: "all 0.3s ease",
                      }}
                      className="cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center display */}
            <motion.div
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-100">
                <div className="text-2xl font-bold text-gray-800">
                  {totalClasses}
                </div>
                <div className="text-xs text-gray-500 leading-none">
                  Weekly Classes
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Top Performers List - Reduced Space */}
        <CompactTopPerformers />
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.4 }}
        className="mt-4 pt-3 border-t border-gray-100"
      >
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Updated: {new Date().toLocaleDateString()}</span>
          <div className="flex items-center gap-1">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <TrendingUp size={10} />
            </motion.div>
            <span>Live data</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TopTrainersChart;
