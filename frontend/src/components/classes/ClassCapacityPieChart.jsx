import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
} from "recharts";

// Helper to generate distinct colors
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

function getPercentage(value, total) {
  return ((value / total) * 100).toFixed(1);
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value, percent } = payload[0];
    return (
      <div
        style={{ background: "white", border: "1px solid #ccc", padding: 8 }}
      >
        <strong>{name}</strong>
        <div>Capacity: {value}</div>
        <div>Share: {(percent * 100).toFixed(1)}%</div>
      </div>
    );
  }
  return null;
};

const renderLabel = (entry) =>
  `${entry.name}: ${getPercentage(entry.value, entry.total)}%`;

export default function ClassCapacityPieChart({ classes }) {
  if (!classes || classes.length === 0) return <div>No class data.</div>;
  const totalCapacity = classes.reduce((sum, c) => sum + (c.capacity || 0), 0);
  const data = classes.map((c) => ({
    name: c.class_name,
    value: c.capacity || 0,
    total: totalCapacity,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={renderLabel}
          isAnimationActive={false}
        >
          {data.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
