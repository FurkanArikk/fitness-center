import React from "react";
import {
  MapPin,
  Users,
  Activity,
  Wrench,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Zap,
  Heart,
} from "lucide-react";

const FacilityAnalytics = ({ facilities = [], equipment = [] }) => {
  // Debug: Log the equipment data to see the actual statuses
  console.log("🔍 Equipment data for analytics:", equipment);
  console.log(
    "🔍 Equipment statuses:",
    equipment.map((e) => ({
      id: e.equipment_id || e.id,
      name: e.name,
      status: e.status,
      next_maintenance: e.next_maintenance_date,
    }))
  );

  // Calculate facility stats
  const totalFacilities = facilities.length;
  const activeFacilities = facilities.filter(
    (f) => f.status === "active"
  ).length;
  const inactiveFacilities = facilities.filter(
    (f) => f.status === "inactive"
  ).length;
  const maintenanceFacilities = facilities.filter(
    (f) => f.status === "maintenance"
  ).length;

  // Calculate equipment stats with correct status handling based on API data
  const totalEquipment = equipment.length;

  // API'den gelen actual status values: "active", "maintenance", "out-of-order"
  const workingEquipment = equipment.filter((e) => {
    const status = e.status?.toLowerCase();
    return (
      status === "active" ||
      status === "working" ||
      status === "operational" ||
      status === "available"
    );
  }).length;

  // Maintenance equipment - should be exactly 2
  const maintenanceEquipment = equipment.filter((e) => {
    const status = e.status?.toLowerCase();
    return (
      status === "maintenance" ||
      status === "under_maintenance" ||
      status === "repairing"
    );
  }).length;

  // Broken/Out-of-order equipment - should be exactly 1
  const brokenEquipment = equipment.filter((e) => {
    const status = e.status?.toLowerCase();
    return (
      status === "broken" ||
      status === "out-of-order" ||
      status === "damaged" ||
      status === "faulty" ||
      status === "out_of_order"
    );
  }).length;

  // Calculate total capacity
  const totalCapacity = facilities.reduce((sum, facility) => {
    return sum + (parseInt(facility.capacity) || 0);
  }, 0);

  // Calculate equipment due for maintenance (only count maintenance status items, not all)
  const equipmentDueForMaintenance = maintenanceEquipment; // Use actual maintenance count, not date-based

  // Debug: Log the calculated stats
  console.log("📊 Analytics calculations:", {
    totalEquipment,
    workingEquipment,
    maintenanceEquipment,
    brokenEquipment,
    equipmentDueForMaintenance,
    sum: workingEquipment + maintenanceEquipment + brokenEquipment,
  });

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    gradient,
    trend,
    sparkle = false,
  }) => (
    <div
      className={`group relative overflow-hidden bg-gradient-to-br ${gradient} p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-white/20`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-white/90 font-semibold text-sm uppercase tracking-wider mb-2">
            {title}
          </p>
          <div className="flex items-baseline gap-2 mb-1">
            <p className="text-4xl font-bold text-white">
              {value.toLocaleString()}
            </p>
            {sparkle && <Sparkles className="w-5 h-5 text-white/80" />}
          </div>
          {subtitle && (
            <p className="text-white/80 text-sm font-medium">{subtitle}</p>
          )}
        </div>
        <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:bg-white/30 transition-all duration-300">
          <Icon
            size={28}
            className="text-white group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      </div>

      {trend !== undefined && (
        <div className="relative mt-6 pt-4 border-t border-white/20">
          <div className="flex items-center gap-2">
            {trend > 0 ? (
              <TrendingUp size={16} className="text-emerald-200" />
            ) : trend < 0 ? (
              <TrendingDown size={16} className="text-red-200" />
            ) : (
              <Minus size={16} className="text-white/60" />
            )}
            <span
              className={`text-sm font-medium ${
                trend > 0
                  ? "text-emerald-200"
                  : trend < 0
                  ? "text-red-200"
                  : "text-white/60"
              }`}
            >
              {trend === 0
                ? "No change"
                : `${Math.abs(trend)}% ${trend > 0 ? "increase" : "decrease"}`}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const StatusCard = ({ title, items, icon: Icon, gradient }) => (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${gradient} p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
      <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full"></div>
      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full"></div>

      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 ${item.color} rounded-full shadow-lg group-hover:scale-110 transition-transform duration-200`}
                ></div>
                <span className="text-white/90 font-medium text-sm">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white font-bold text-lg">
                  {item.count}
                </span>
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-xl">
                  <span className="text-white/90 text-xs font-semibold">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const facilityStatusItems = [
    {
      label: "Active",
      count: activeFacilities,
      percentage:
        totalFacilities > 0
          ? Math.round((activeFacilities / totalFacilities) * 100)
          : 0,
      color: "bg-emerald-400 shadow-emerald-400/50",
    },
    {
      label: "Inactive",
      count: inactiveFacilities,
      percentage:
        totalFacilities > 0
          ? Math.round((inactiveFacilities / totalFacilities) * 100)
          : 0,
      color: "bg-amber-400 shadow-amber-400/50",
    },
    {
      label: "Maintenance",
      count: maintenanceFacilities,
      percentage:
        totalFacilities > 0
          ? Math.round((maintenanceFacilities / totalFacilities) * 100)
          : 0,
      color: "bg-red-400 shadow-red-400/50",
    },
  ];

  const equipmentStatusItems = [
    {
      label: "Working",
      count: workingEquipment,
      percentage:
        totalEquipment > 0
          ? Math.round((workingEquipment / totalEquipment) * 100)
          : 0,
      color: "bg-emerald-400 shadow-emerald-400/50",
    },
    {
      label: "Maintenance",
      count: maintenanceEquipment,
      percentage:
        totalEquipment > 0
          ? Math.round((maintenanceEquipment / totalEquipment) * 100)
          : 0,
      color: "bg-amber-400 shadow-amber-400/50",
    },
    {
      label: "Broken",
      count: brokenEquipment,
      percentage:
        totalEquipment > 0
          ? Math.round((brokenEquipment / totalEquipment) * 100)
          : 0,
      color: "bg-red-400 shadow-red-400/50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Facilities"
          value={totalFacilities}
          subtitle={`${activeFacilities} active`}
          icon={MapPin}
          gradient="from-blue-500 via-blue-600 to-indigo-600"
          sparkle
        />

        <StatCard
          title="Total Equipment"
          value={totalEquipment}
          subtitle={`${workingEquipment} working`}
          icon={Activity}
          gradient="from-emerald-500 via-green-600 to-teal-600"
        />

        <StatCard
          title="Total Capacity"
          value={totalCapacity}
          subtitle="people"
          icon={Users}
          gradient="from-purple-500 via-violet-600 to-purple-700"
          sparkle
        />

        <StatCard
          title="Maintenance Due"
          value={equipmentDueForMaintenance}
          subtitle="equipment items"
          icon={Wrench}
          gradient="from-orange-500 via-red-500 to-pink-600"
        />
      </div>

      {/* Status Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StatusCard
          title="Facility Status"
          items={facilityStatusItems}
          icon={Heart}
          gradient="from-slate-600 via-slate-700 to-slate-800"
        />

        <StatusCard
          title="Equipment Status"
          items={equipmentStatusItems}
          icon={Zap}
          gradient="from-gray-600 via-gray-700 to-gray-800"
        />
      </div>
    </div>
  );
};

export default FacilityAnalytics;
