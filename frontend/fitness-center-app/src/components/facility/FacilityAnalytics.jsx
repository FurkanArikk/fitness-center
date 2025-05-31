import React from 'react';
import { 
  MapPin,
  Users,
  Activity,
  Wrench,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

const FacilityAnalytics = ({ facilities = [], equipment = [] }) => {
  // Calculate facility stats
  const totalFacilities = facilities.length;
  const activeFacilities = facilities.filter(f => f.status === 'active').length;
  const inactiveFacilities = facilities.filter(f => f.status === 'inactive').length;
  const maintenanceFacilities = facilities.filter(f => f.status === 'maintenance').length;
  
  // Calculate equipment stats
  const totalEquipment = equipment.length;
  const workingEquipment = equipment.filter(e => e.status === 'working').length;
  const maintenanceEquipment = equipment.filter(e => e.status === 'maintenance').length;
  const brokenEquipment = equipment.filter(e => e.status === 'broken' || e.status === 'out_of_order').length;
  
  // Calculate total capacity
  const totalCapacity = facilities.reduce((sum, facility) => {
    return sum + (parseInt(facility.capacity) || 0);
  }, 0);

  // Calculate equipment due for maintenance
  const equipmentDueForMaintenance = equipment.filter(e => 
    e.next_maintenance_date && new Date(e.next_maintenance_date) <= new Date()
  ).length;

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-4 flex items-center">
          {trend > 0 ? (
            <TrendingUp size={16} className="text-green-500 mr-1" />
          ) : trend < 0 ? (
            <TrendingDown size={16} className="text-red-500 mr-1" />
          ) : (
            <Minus size={16} className="text-gray-500 mr-1" />
          )}
          <span className={`text-sm ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {trend === 0 ? 'No change' : `${Math.abs(trend)}% ${trend > 0 ? 'increase' : 'decrease'}`}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Facilities"
          value={totalFacilities}
          subtitle={`${activeFacilities} active`}
          icon={MapPin}
          color="bg-blue-500"
        />
        
        <StatCard
          title="Total Equipment"
          value={totalEquipment}
          subtitle={`${workingEquipment} working`}
          icon={Activity}
          color="bg-green-500"
        />
        
        <StatCard
          title="Total Capacity"
          value={totalCapacity.toLocaleString()}
          subtitle="people"
          icon={Users}
          color="bg-purple-500"
        />
        
        <StatCard
          title="Maintenance Due"
          value={equipmentDueForMaintenance}
          subtitle="equipment items"
          icon={Wrench}
          color="bg-orange-500"
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Facility Status Breakdown */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Facility Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Active</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">{activeFacilities}</span>
                <span className="text-xs text-gray-500">
                  ({totalFacilities > 0 ? Math.round((activeFacilities / totalFacilities) * 100) : 0}%)
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Inactive</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">{inactiveFacilities}</span>
                <span className="text-xs text-gray-500">
                  ({totalFacilities > 0 ? Math.round((inactiveFacilities / totalFacilities) * 100) : 0}%)
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Maintenance</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">{maintenanceFacilities}</span>
                <span className="text-xs text-gray-500">
                  ({totalFacilities > 0 ? Math.round((maintenanceFacilities / totalFacilities) * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Equipment Status Breakdown */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Working</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">{workingEquipment}</span>
                <span className="text-xs text-gray-500">
                  ({totalEquipment > 0 ? Math.round((workingEquipment / totalEquipment) * 100) : 0}%)
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Maintenance</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">{maintenanceEquipment}</span>
                <span className="text-xs text-gray-500">
                  ({totalEquipment > 0 ? Math.round((maintenanceEquipment / totalEquipment) * 100) : 0}%)
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Broken</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">{brokenEquipment}</span>
                <span className="text-xs text-gray-500">
                  ({totalEquipment > 0 ? Math.round((brokenEquipment / totalEquipment) * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityAnalytics;
