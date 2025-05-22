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

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28CFF",
  "#FF6699",
  "#FF4444",
  "#00B8D9",
  "#36B37E",
  "#FFAB00",
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

  // Modern filter panel styles
  const toggleClass = (active) =>
    `px-4 py-2 rounded-full font-semibold transition text-sm focus:outline-none ${
      active
        ? "bg-blue-600 text-white shadow"
        : "bg-gray-100 text-gray-700 hover:bg-blue-50"
    }`;
  const dayBtnClass = (active) =>
    `px-3 py-1 rounded-full border font-medium text-xs transition ${
      active
        ? "bg-blue-600 text-white border-blue-600 shadow"
        : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
    }`;

  // Gradient and shadow defs for each area
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
            stopOpacity={0.7}
          />
          <stop
            offset="60%"
            stopColor={COLORS[idx % COLORS.length]}
            stopOpacity={0.35}
          />
          <stop
            offset="100%"
            stopColor={COLORS[idx % COLORS.length]}
            stopOpacity={0.15}
          />
        </linearGradient>
      ))}
      {/* Soft shadow filter */}
      <filter id="areaShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow
          dx="0"
          dy="8"
          stdDeviation="8"
          floodColor="#000"
          floodOpacity="0.10"
        />
      </filter>
    </defs>
  );

  // Custom tooltip with soft highlight
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="rounded-xl shadow-lg bg-white/90 px-4 py-2 border border-blue-100">
        <div className="font-semibold text-blue-700 mb-1">{label}</div>
        {payload.map((entry, idx) => (
          <div key={entry.name} className="flex items-center gap-2 text-sm">
            <span
              style={{
                display: "inline-block",
                width: 12,
                height: 12,
                borderRadius: 6,
                background: COLORS[idx % COLORS.length],
                opacity: 0.7,
              }}
            />
            <span className="font-medium">{entry.name}:</span>
            <span className="ml-1">{Math.round(entry.value)} min</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center mb-2">
          Class Activity by Day & Duration
        </h2>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex bg-gray-100 rounded-full p-1 shadow-inner">
            <button
              className={toggleClass(view === "weekly")}
              onClick={() => setView("weekly")}
            >
              Weekly
            </button>
            <button
              className={toggleClass(view === "daily")}
              onClick={() => setView("daily")}
            >
              Daily
            </button>
          </div>
          {view === "daily" && (
            <div className="flex gap-2 flex-wrap mt-2 md:mt-0 items-center">
              <input
                type="date"
                className="px-3 py-1 rounded border text-xs focus:ring focus:border-blue-400"
                value={selectedDate}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  className={dayBtnClass(selectedDay === day)}
                  onClick={() => handleDayClick(day)}
                >
                  {day}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {view === "daily" && (
        <div className="text-center text-sm text-gray-600 mb-2">
          Selected: {selectedDate.split("-").reverse().join(".")} –{" "}
          {selectedDay}
        </div>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={chartData}
          margin={{ top: 16, right: 24, left: 0, bottom: 24 }}
        >
          {renderGradients()}
          <XAxis dataKey="class_name" tick={{ fontSize: 13 }} />
          <YAxis
            tick={{ fontSize: 13 }}
            label={{
              value: "Duration (min)",
              angle: -90,
              position: "insideLeft",
            }}
            allowDecimals={false}
          />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
          />
          <Legend />
          {(view === "weekly" ? daysOfWeek : [selectedDay]).map((day, idx) => (
            <Area
              key={day}
              type="monotone"
              dataKey={day}
              stackId="a"
              stroke={COLORS[idx % COLORS.length]}
              fill={`url(#colorArea${idx})`}
              name={day}
              fillOpacity={1}
              filter="url(#areaShadow)"
              isAnimationActive={false}
              activeDot={{
                r: 6,
                style: { filter: "drop-shadow(0 0 8px #60a5fa88)" },
              }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
