import React, { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Users, UserPlus, Activity, TrendingUp } from "lucide-react";

const MemberStats = ({ stats, membershipStats = [] }) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);

  const defaultStats = {
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    holdMembers: 0,
    newMembersThisMonth: 0,
    averageAttendance: 0,
  };

  const {
    totalMembers,
    activeMembers,
    inactiveMembers,
    holdMembers,
    newMembersThisMonth,
    averageAttendance,
  } = { ...defaultStats, ...stats };

  // Dynamic Member Status Data - Only include categories with values > 0
  const statusData = useMemo(() => {
    const statusMapping = [
      {
        name: "Active",
        value: activeMembers,
        color: "#FF6B9D", // Soft pink
        gradient: "linear-gradient(135deg, #FF6B9D 0%, #FF8E9B 100%)",
      },
      {
        name: "Passive",
        value: inactiveMembers,
        color: "#A8E6CF", // Fresh green
        gradient: "linear-gradient(135deg, #A8E6CF 0%, #88D4AB 100%)",
      },
      {
        name: "On Hold",
        value: holdMembers,
        color: "#FFB347", // Warm orange
        gradient: "linear-gradient(135deg, #FFB347 0%, #FF9F1C 100%)",
      },
    ];

    // Only return status categories that have values greater than 0
    return statusMapping.filter((status) => status.value > 0);
  }, [activeMembers, inactiveMembers, holdMembers]);

  // Dynamic Membership Distribution Data - Only include memberships with actual members
  const enhancedMembershipStats = useMemo(() => {
    if (!membershipStats || membershipStats.length === 0) {
      return [];
    }

    const vibrantColors = [
      "#7FB3D3", // Light blue
      "#C39BD3", // Light purple
      "#F8C471", // Light yellow/gold
      "#85C1E9", // Sky blue
      "#82E0AA", // Light green
      "#F1948A", // Light coral
    ];

    // Only include memberships that have members (value > 0)
    return membershipStats
      .filter((stat) => stat.value > 0)
      .map((stat, index) => ({
        ...stat,
        color: vibrantColors[index % vibrantColors.length] || stat.color,
        gradient: `linear-gradient(135deg, ${
          vibrantColors[index % vibrantColors.length]
        } 0%, ${vibrantColors[index % vibrantColors.length]}90 100%)`,
      }));
  }, [membershipStats]);

  // Custom tooltip for better styling
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const chartData = payload[0].payload.name
        ? statusData
        : enhancedMembershipStats;
      const total = chartData.reduce((sum, item) => sum + item.value, 0);
      const percentage =
        total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;

      return (
        <div className="bg-white/95 backdrop-blur-sm border-0 rounded-xl shadow-2xl p-4 transform transition-all duration-200">
          <p className="text-gray-800 font-semibold text-sm">
            {data.payload.name}
          </p>
          <p className="text-gray-600 text-sm">
            {data.value} members ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mb-8">
      {/* Modern gradient background container */}
      <div className="bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 rounded-3xl p-8 shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Member Statistics
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Member Status Chart - Dynamic Rendering */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                Member Status Distribution
              </h3>
              <div className="h-72">
                {statusData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="80%">
                      <PieChart>
                        <defs>
                          {statusData.map((entry, index) => (
                            <linearGradient
                              key={`gradient-${index}`}
                              id={`gradient-${index}`}
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="100%"
                            >
                              <stop
                                offset="0%"
                                stopColor={entry.color}
                                stopOpacity={1}
                              />
                              <stop
                                offset="100%"
                                stopColor={entry.color}
                                stopOpacity={0.7}
                              />
                            </linearGradient>
                          ))}
                        </defs>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                          onMouseEnter={(data, index) =>
                            setHoveredSegment(`status-${index}`)
                          }
                          onMouseLeave={() => setHoveredSegment(null)}
                        >
                          {statusData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`url(#gradient-${index})`}
                              stroke={entry.color}
                              strokeWidth={
                                hoveredSegment === `status-${index}` ? 3 : 1
                              }
                              style={{
                                filter:
                                  hoveredSegment === `status-${index}`
                                    ? "drop-shadow(0 8px 16px rgba(0,0,0,0.15))"
                                    : "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
                                transform:
                                  hoveredSegment === `status-${index}`
                                    ? "scale(1.05)"
                                    : "scale(1)",
                                transformOrigin: "center",
                                transition: "all 0.3s ease",
                              }}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Custom Legend */}
                    <div className="flex flex-wrap justify-center gap-4 mt-2">
                      {statusData.map((entry, index) => (
                        <div
                          key={`status-legend-${index}`}
                          className="flex items-center space-x-2"
                        >
                          <div
                            className="w-4 h-4 rounded-full shadow-md border-2 border-white"
                            style={{
                              backgroundColor: entry.color,
                              boxShadow: `0 2px 8px ${entry.color}50`,
                            }}
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {entry.name}: {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-400 font-medium">
                        No member data available
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Membership Distribution Chart - Dynamic Rendering */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                Membership Distribution
              </h3>
              <div className="h-72">
                {enhancedMembershipStats.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="80%">
                      <PieChart>
                        <defs>
                          {enhancedMembershipStats.map((entry, index) => (
                            <linearGradient
                              key={`membership-gradient-${index}`}
                              id={`membership-gradient-${index}`}
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="100%"
                            >
                              <stop
                                offset="0%"
                                stopColor={entry.color}
                                stopOpacity={1}
                              />
                              <stop
                                offset="100%"
                                stopColor={entry.color}
                                stopOpacity={0.7}
                              />
                            </linearGradient>
                          ))}
                        </defs>
                        <Pie
                          data={enhancedMembershipStats}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                          onMouseEnter={(data, index) =>
                            setHoveredSegment(`membership-${index}`)
                          }
                          onMouseLeave={() => setHoveredSegment(null)}
                        >
                          {enhancedMembershipStats.map((entry, index) => (
                            <Cell
                              key={`membership-cell-${index}`}
                              fill={`url(#membership-gradient-${index})`}
                              stroke={entry.color}
                              strokeWidth={
                                hoveredSegment === `membership-${index}` ? 3 : 1
                              }
                              style={{
                                filter:
                                  hoveredSegment === `membership-${index}`
                                    ? "drop-shadow(0 8px 16px rgba(0,0,0,0.15))"
                                    : "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
                                transform:
                                  hoveredSegment === `membership-${index}`
                                    ? "scale(1.05)"
                                    : "scale(1)",
                                transformOrigin: "center",
                                transition: "all 0.3s ease",
                              }}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Custom Legend */}
                    <div className="flex flex-wrap justify-center gap-4 mt-2">
                      {enhancedMembershipStats.map((entry, index) => (
                        <div
                          key={`membership-legend-${index}`}
                          className="flex items-center space-x-2"
                        >
                          <div
                            className="w-4 h-4 rounded-full shadow-md border-2 border-white"
                            style={{
                              backgroundColor: entry.color,
                              boxShadow: `0 2px 8px ${entry.color}50`,
                            }}
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {entry.name}: {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Activity className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-400 font-medium">
                        No membership data available
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Key Metrics Section */}
          <div className="flex flex-col space-y-6">
            {/* Total Members */}
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm font-medium">
                    Total Members
                  </p>
                  <p className="text-3xl font-bold">
                    {totalMembers.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <Users className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* New This Month */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    New This Month
                  </p>
                  <p className="text-3xl font-bold">
                    {newMembersThisMonth.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <UserPlus className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Average Attendance */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">
                    Avg. Attendance
                  </p>
                  <p className="text-3xl font-bold">{averageAttendance}/week</p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <TrendingUp className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Active vs Passive Ratio */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">
                    Active Ratio
                  </p>
                  <p className="text-3xl font-bold">
                    {totalMembers > 0
                      ? ((activeMembers / totalMembers) * 100).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <Activity className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberStats;
