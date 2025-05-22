import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

// Helper to generate distinct colors for trainers
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

// data: array of { class_name, trainer1: capacity, trainer2: capacity, ... }
// trainers: array of trainer names
export default function ClassStackedAreaChart({ data = [], trainers = [] }) {
  if (!data.length || !trainers.length)
    return (
      <div className="text-gray-400 text-center py-8">No data to display.</div>
    );

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data}
        margin={{ top: 16, right: 24, left: 0, bottom: 24 }}
      >
        <XAxis dataKey="class_name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value, name, props) => [value, name]}
          labelFormatter={(label) => `Class: ${label}`}
        />
        <Legend />
        {trainers.map((trainer, idx) => (
          <Bar
            key={trainer}
            dataKey={trainer}
            stackId="a"
            fill={COLORS[idx % COLORS.length]}
            name={trainer}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
