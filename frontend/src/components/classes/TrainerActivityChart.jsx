import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

// Modern vibrant pastel color palette matching dashboard design
const COLORS = [
  "#60A5FA", // Soft blue
  "#34D399", // Soft green
  "#FBBF24", // Soft yellow
  "#F472B6", // Soft pink
  "#A78BFA", // Soft purple
  "#FB7185", // Soft rose
  "#38BDF8", // Sky blue
  "#4ADE80", // Emerald green
  "#FACC15", // Amber
  "#C084FC", // Violet
];

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function ClassActivityAreaChart({ schedules = [] }) {
  const [view, setView] = useState("weekly");
  const [selectedDay, setSelectedDay] = useState(() => {
    const d = new Date();
    return daysOfWeek[d.getDay() === 0 ? 6 : d.getDay() - 1];
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });

  // Get all class names dynamically
  const allClassNames = Array.from(
    new Set(schedules.map((s) => s.class_name))
  ).filter(Boolean);

  // Helper: get day name from date string (YYYY-MM-DD)
  function getDayName(dateStr) {
    const d = new Date(dateStr);
    return daysOfWeek[d.getDay() === 0 ? 6 : d.getDay() - 1];
  }
  // Helper: get next date in current week for a given day name
  function getDateForDay(targetDay, baseDateStr) {
    const base = new Date(baseDateStr);
    const baseDay = base.getDay() === 0 ? 6 : base.getDay() - 1;
    const targetIdx = daysOfWeek.indexOf(targetDay);
    const diff = targetIdx - baseDay;
    const newDate = new Date(base);
    newDate.setDate(base.getDate() + diff);
    return newDate.toISOString().slice(0, 10);
  }

  // Sync selectedDay <-> selectedDate
  useEffect(() => {
    setSelectedDay(getDayName(selectedDate));
  }, [selectedDate, schedules]);

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setSelectedDate(getDateForDay(day, selectedDate));
  };

  // Data transformation
  let chartData = [];
  function getDuration(s) {
    return s.duration || s.class_duration || s.duration_minutes || 0;
  }

  if (view === "weekly") {
    chartData = allClassNames.map((className) => {
      const entry = { class_name: className };
      daysOfWeek.forEach((day, idx) => {
        entry[day] = schedules
          .filter((s) => s.class_name === className && s.day_of_week === day)
          .reduce((sum, s) => sum + getDuration(s), 0);
      });
      return entry;
    });
  } else {
    chartData = allClassNames.map((className) => {
      const entry = { class_name: className };
      entry[selectedDay] = schedules
        .filter((s) => {
          const matchDay =
            s.class_name === className && s.day_of_week === selectedDay;
          if (s.date) {
            return matchDay && s.date.slice(0, 10) === selectedDate;
          }
          return matchDay;
        })
        .reduce((sum, s) => sum + getDuration(s), 0);
      return entry;
    });
  }

  // Modern toggle and button styles
  const toggleClass = (active) =>
    `px-4 py-2 rounded-xl font-semibold transition-all duration-200 text-sm focus:outline-none focus:ring-4 focus:ring-blue-200/50 ${
      active
        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md transform scale-105"
        : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 shadow-sm"
    }`;

  const dayBtnClass = (active) =>
    `px-3 py-2 rounded-lg border font-medium text-xs transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
      active
        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-md transform scale-105"
        : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 shadow-sm"
    }`;

  // Enhanced gradients and shadows for area chart
  const renderGradients = () => (
    <defs>
      {(view === "weekly" ? daysOfWeek : [selectedDay]).map((day, idx) => (
        <linearGradient
          key={day}
          id={`colorArea${idx}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="5%"
            stopColor={COLORS[idx % COLORS.length]}
            stopOpacity={0.8}
          />
          <stop
            offset="50%"
            stopColor={COLORS[idx % COLORS.length]}
            stopOpacity={0.4}
          />
          <stop
            offset="95%"
            stopColor={COLORS[idx % COLORS.length]}
            stopOpacity={0.1}
          />
        </linearGradient>
      ))}
      {/* Enhanced shadow filter */}
      <filter id="areaShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow
          dx="0"
          dy="6"
          stdDeviation="6"
          floodColor="#000"
          floodOpacity="0.12"
        />
      </filter>
    </defs>
  );

  // Enhanced custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="rounded-xl shadow-xl bg-white/95 backdrop-blur-sm px-4 py-3 border-2 border-gray-200 animate-fade-in">
        <div className="font-semibold text-gray-900 mb-2 text-center">
          {label}
        </div>
        <div className="space-y-2">
          {payload.map((entry, idx) => (
            <div key={entry.name} className="flex items-center gap-3 text-sm">
              <div
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="font-medium text-gray-700 min-w-[60px]">
                {entry.name}:
              </span>
              <span className="ml-auto font-semibold text-blue-600">
                {Math.round(entry.value)} min
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500 text-center">
          Total:{" "}
          {payload.reduce((sum, entry) => sum + entry.value, 0).toFixed(0)}{" "}
          minutes
        </div>
      </div>
    );
  };

  // Enhanced legend component
  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap gap-2 justify-center mt-4 px-4">
        {payload.map((entry, index) => (
          <div
            key={`legend-${index}`}
            className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-white rounded-full px-3 py-2 border border-gray-200 hover:shadow-md transition-all duration-200 hover:scale-105"
          >
            <div
              className="w-3 h-3 rounded-full shadow-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs font-medium text-gray-700">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Empty state component
  if (!schedules || schedules.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white via-gray-50/30 to-white backdrop-blur-sm rounded-2xl border-2 border-gray-200/60 p-8 shadow-lg">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="currentColor"
              className="text-gray-400"
            >
              <path d="M4 8h24v2H4zM4 14h24v2H4zM4 20h24v2H4z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Activity Data
          </h3>
          <p className="text-gray-500 text-center text-sm">
            Class activity data will appear here when schedules are available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white via-gray-50/30 to-white backdrop-blur-sm rounded-2xl border-2 border-gray-200/60 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Enhanced Header */}
      <div className="mb-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Class Activity by Day & Duration
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Track class duration patterns across different time periods
          </p>
        </div>

        {/* Enhanced Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 shadow-inner border border-gray-200">
            <button
              className={toggleClass(view === "weekly")}
              onClick={() => setView("weekly")}
            >
              📊 Weekly View
            </button>
            <button
              className={toggleClass(view === "daily")}
              onClick={() => setView("daily")}
            >
              📅 Daily View
            </button>
          </div>

          {/* Daily Controls */}
          {view === "daily" && (
            <div className="flex gap-3 flex-wrap items-center">
              <input
                type="date"
                className="px-3 py-2 rounded-lg border-2 border-gray-200 text-sm focus:ring-4 focus:ring-blue-200/50 focus:border-blue-400 transition-all duration-200 bg-white shadow-sm"
                value={selectedDate}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <div className="flex gap-2 flex-wrap">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    className={dayBtnClass(selectedDay === day)}
                    onClick={() => handleDayClick(day)}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Date Display for Daily View */}
      {view === "daily" && (
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-200">
            <span>📅</span>
            <span>
              {selectedDate.split("-").reverse().join(".")} – {selectedDay}
            </span>
          </div>
        </div>
      )}

      {/* Enhanced Chart */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          >
            {renderGradients()}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
              opacity={0.6}
            />
            <XAxis
              dataKey="class_name"
              tick={{ fontSize: 12, fill: "#6B7280" }}
              tickLine={{ stroke: "#D1D5DB" }}
              axisLine={{ stroke: "#D1D5DB" }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#6B7280" }}
              tickLine={{ stroke: "#D1D5DB" }}
              axisLine={{ stroke: "#D1D5DB" }}
              label={{
                value: "Duration (minutes)",
                angle: -90,
                position: "insideLeft",
                style: {
                  textAnchor: "middle",
                  fill: "#6B7280",
                  fontSize: "12px",
                },
              }}
              allowDecimals={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                fill: "rgba(59, 130, 246, 0.05)",
                stroke: "rgba(59, 130, 246, 0.2)",
                strokeWidth: 2,
              }}
            />
            <Legend content={<CustomLegend />} />
            {(view === "weekly" ? daysOfWeek : [selectedDay]).map(
              (day, idx) => (
                <Area
                  key={day}
                  type="monotone"
                  dataKey={day}
                  stackId="a"
                  stroke={COLORS[idx % COLORS.length]}
                  strokeWidth={2}
                  fill={`url(#colorArea${idx})`}
                  name={day}
                  fillOpacity={1}
                  filter="url(#areaShadow)"
                  animationBegin={idx * 100}
                  animationDuration={1000}
                  animationEasing="ease-out"
                  activeDot={{
                    r: 6,
                    stroke: COLORS[idx % COLORS.length],
                    strokeWidth: 3,
                    fill: "white",
                    style: {
                      filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))",
                      transform: "scale(1.2)",
                    },
                  }}
                />
              )
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="text-lg font-bold text-blue-700">
              {allClassNames.length}
            </div>
            <div className="text-xs text-blue-600 uppercase tracking-wide">
              Active Classes
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <div className="text-lg font-bold text-green-700">
              {view === "weekly" ? 7 : 1}
            </div>
            <div className="text-xs text-green-600 uppercase tracking-wide">
              {view === "weekly" ? "Days Shown" : "Day Focus"}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
            <div className="text-lg font-bold text-purple-700">
              {chartData.reduce((total, item) => {
                const values = Object.values(item).filter(
                  (v) => typeof v === "number"
                );
                return total + values.reduce((sum, v) => sum + v, 0);
              }, 0)}
            </div>
            <div className="text-xs text-purple-600 uppercase tracking-wide">
              Total Minutes
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
            <div className="text-lg font-bold text-orange-700">
              {schedules.length}
            </div>
            <div className="text-xs text-orange-600 uppercase tracking-wide">
              Schedule Items
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
