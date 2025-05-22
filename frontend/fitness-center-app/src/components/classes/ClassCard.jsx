import React from "react";
import { Dumbbell, Users, Clock } from "lucide-react";

const colorMap = [
  "bg-blue-100 border-blue-300",
  "bg-green-100 border-green-300",
  "bg-yellow-100 border-yellow-300",
  "bg-pink-100 border-pink-300",
  "bg-purple-100 border-purple-300",
  "bg-orange-100 border-orange-300",
  "bg-teal-100 border-teal-300",
];

const iconMap = {
  yoga: <Dumbbell className="text-blue-500" size={28} />,
  pilates: <Dumbbell className="text-green-500" size={28} />,
  spinning: <Dumbbell className="text-purple-500" size={28} />,
  hiit: <Dumbbell className="text-yellow-500" size={28} />,
  zumba: <Dumbbell className="text-pink-500" size={28} />,
  crossfit: <Dumbbell className="text-red-500" size={28} />,
};

const ClassCard = ({ classItem, onClick, index }) => {
  const color = colorMap[index % colorMap.length];
  const icon = iconMap[classItem.class_name?.toLowerCase()] || (
    <Dumbbell className="text-gray-400" size={28} />
  );

  return (
    <div
      className={`cursor-pointer border rounded-xl p-4 shadow-sm transition hover:shadow-lg ${color}`}
      onClick={() => onClick(classItem)}
    >
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <h3 className="font-bold text-lg flex-1">{classItem.class_name}</h3>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
        <Clock size={16} /> {classItem.duration} min
        <Users size={16} className="ml-3" /> {classItem.capacity} people
      </div>
      {classItem.difficulty && (
        <div className="text-xs text-gray-500">
          Level: {classItem.difficulty}
        </div>
      )}
    </div>
  );
};

export default ClassCard;
