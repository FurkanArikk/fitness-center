import React from "react";
import {
  Dumbbell,
  Users,
  Clock,
  Star,
  Zap,
  Activity,
  Heart,
  Target,
} from "lucide-react";

// Enhanced color palette with more vibrant backgrounds and coordinated accents
const colorVariants = [
  {
    bg: "bg-gradient-to-br from-blue-100 to-blue-200",
    border: "border-blue-300",
    accent: "text-blue-700",
    shadow: "hover:shadow-blue-300/50",
    icon: "text-blue-600",
    badge: "bg-blue-200 text-blue-800",
  },
  {
    bg: "bg-gradient-to-br from-emerald-100 to-emerald-200",
    border: "border-emerald-300",
    accent: "text-emerald-700",
    shadow: "hover:shadow-emerald-300/50",
    icon: "text-emerald-600",
    badge: "bg-emerald-200 text-emerald-800",
  },
  {
    bg: "bg-gradient-to-br from-amber-100 to-amber-200",
    border: "border-amber-300",
    accent: "text-amber-700",
    shadow: "hover:shadow-amber-300/50",
    icon: "text-amber-600",
    badge: "bg-amber-200 text-amber-800",
  },
  {
    bg: "bg-gradient-to-br from-pink-100 to-pink-200",
    border: "border-pink-300",
    accent: "text-pink-700",
    shadow: "hover:shadow-pink-300/50",
    icon: "text-pink-600",
    badge: "bg-pink-200 text-pink-800",
  },
  {
    bg: "bg-gradient-to-br from-purple-100 to-purple-200",
    border: "border-purple-300",
    accent: "text-purple-700",
    shadow: "hover:shadow-purple-300/50",
    icon: "text-purple-600",
    badge: "bg-purple-200 text-purple-800",
  },
  {
    bg: "bg-gradient-to-br from-orange-100 to-orange-200",
    border: "border-orange-300",
    accent: "text-orange-700",
    shadow: "hover:shadow-orange-300/50",
    icon: "text-orange-600",
    badge: "bg-orange-200 text-orange-800",
  },
  {
    bg: "bg-gradient-to-br from-teal-100 to-teal-200",
    border: "border-teal-300",
    accent: "text-teal-700",
    shadow: "hover:shadow-teal-300/50",
    icon: "text-teal-600",
    badge: "bg-teal-200 text-teal-800",
  },
  {
    bg: "bg-gradient-to-br from-indigo-100 to-indigo-200",
    border: "border-indigo-300",
    accent: "text-indigo-700",
    shadow: "hover:shadow-indigo-300/50",
    icon: "text-indigo-600",
    badge: "bg-indigo-200 text-indigo-800",
  },
  {
    bg: "bg-gradient-to-br from-rose-100 to-rose-200",
    border: "border-rose-300",
    accent: "text-rose-700",
    shadow: "hover:shadow-rose-300/50",
    icon: "text-rose-600",
    badge: "bg-rose-200 text-rose-800",
  },
  {
    bg: "bg-gradient-to-br from-cyan-100 to-cyan-200",
    border: "border-cyan-300",
    accent: "text-cyan-700",
    shadow: "hover:shadow-cyan-300/50",
    icon: "text-cyan-600",
    badge: "bg-cyan-200 text-cyan-800",
  },
  {
    bg: "bg-gradient-to-br from-lime-100 to-lime-200",
    border: "border-lime-300",
    accent: "text-lime-700",
    shadow: "hover:shadow-lime-300/50",
    icon: "text-lime-600",
    badge: "bg-lime-200 text-lime-800",
  },
  {
    bg: "bg-gradient-to-br from-violet-100 to-violet-200",
    border: "border-violet-300",
    accent: "text-violet-700",
    shadow: "hover:shadow-violet-300/50",
    icon: "text-violet-600",
    badge: "bg-violet-200 text-violet-800",
  },
];

// Modern, diverse icon mapping for different class types
const iconMap = {
  yoga: Activity,
  "yoga flow": Activity,
  pilates: Target,
  spinning: Zap,
  "spin class": Zap,
  hiit: Zap,
  zumba: Heart,
  crossfit: Dumbbell,
  "body pump": Dumbbell,
  boxing: Target,
  meditation: Heart,
  "seniors fitness": Users,
  // Default fallback
  default: Dumbbell,
};

// Get appropriate icon for class name
const getClassIcon = (className) => {
  const key = className?.toLowerCase() || "";
  const IconComponent = iconMap[key] || iconMap.default;
  return IconComponent;
};

// Get difficulty level styling
const getDifficultyStyle = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case "beginner":
      return "bg-green-100 text-green-700 border border-green-200";
    case "intermediate":
      return "bg-yellow-100 text-yellow-700 border border-yellow-200";
    case "advanced":
      return "bg-red-100 text-red-700 border border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border border-gray-200";
  }
};

const ClassCard = ({ classItem, onClick, index }) => {
  const colorScheme = colorVariants[index % colorVariants.length];
  const IconComponent = getClassIcon(classItem.class_name);

  return (
    <div
      className={`
        cursor-pointer 
        ${colorScheme.bg} 
        ${colorScheme.border} 
        border-2 
        rounded-2xl 
        p-6 
        shadow-lg 
        hover:shadow-xl 
        ${colorScheme.shadow}
        transition-all 
        duration-300 
        ease-out
        hover:-translate-y-1 
        hover:scale-[1.02]
        group
        backdrop-blur-sm
        relative
        overflow-hidden
      `}
      onClick={() => onClick(classItem)}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-white to-transparent"></div>

      {/* Header with icon and title */}
      <div className="relative flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div
            className={`
            ${colorScheme.icon} 
            p-2 
            rounded-xl 
            bg-white/60 
            backdrop-blur-sm 
            border 
            ${colorScheme.border}
            group-hover:scale-110 
            transition-transform 
            duration-300
            shadow-sm
          `}
          >
            <IconComponent size={24} />
          </div>
          <h3
            className={`
            font-bold 
            text-lg 
            ${colorScheme.accent} 
            group-hover:scale-105 
            transition-transform 
            duration-200
            leading-tight
          `}
          >
            {classItem.class_name}
          </h3>
        </div>

        {/* Optional rating/popularity indicator */}
        {classItem.rating && (
          <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-lg px-2 py-1 border border-white/30">
            <Star size={14} className="text-yellow-500 fill-current" />
            <span className="text-sm font-medium text-gray-700">
              {classItem.rating}
            </span>
          </div>
        )}
      </div>

      {/* Class details */}
      <div className="relative space-y-3">
        {/* Duration and Capacity */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/30">
            <Clock size={16} className={colorScheme.icon} />
            <span className="font-medium text-gray-700">
              {classItem.duration} min
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/30">
            <Users size={16} className={colorScheme.icon} />
            <span className="font-medium text-gray-700">
              {classItem.capacity} people
            </span>
          </div>
        </div>

        {/* Difficulty Level */}
        {classItem.difficulty && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600">Level:</span>
            <span
              className={`
              text-xs 
              font-semibold 
              px-3 
              py-1 
              rounded-full 
              ${getDifficultyStyle(classItem.difficulty)}
              shadow-sm
            `}
            >
              {classItem.difficulty}
            </span>
          </div>
        )}

        {/* Description (if available) */}
        {classItem.description && (
          <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 bg-white/40 backdrop-blur-sm rounded-lg p-2 border border-white/30">
            {classItem.description}
          </p>
        )}

        {/* Additional info badges */}
        <div className="flex flex-wrap gap-2 pt-2">
          {classItem.trainer_name && (
            <span className="text-xs bg-white/60 backdrop-blur-sm text-gray-600 px-2 py-1 rounded-full border border-white/30">
              👨‍🏫 {classItem.trainer_name}
            </span>
          )}
          {classItem.room && (
            <span className="text-xs bg-white/60 backdrop-blur-sm text-gray-600 px-2 py-1 rounded-full border border-white/30">
              📍 {classItem.room}
            </span>
          )}
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
    </div>
  );
};

export default ClassCard;
