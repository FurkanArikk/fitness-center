import React from 'react';
import Card from '../common/Card';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';

const MemberStats = ({ stats, membershipStats = [] }) => {
  const defaultStats = {
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    holdMembers: 0,
    newMembersThisMonth: 0,
    averageAttendance: 0
  };
  
  const { 
    totalMembers, 
    activeMembers, 
    inactiveMembers, 
    holdMembers,
    newMembersThisMonth, 
    averageAttendance 
  } = { ...defaultStats, ...stats };
  
  // Data for status pie chart
  const statusData = [
    { name: 'Active', value: activeMembers, color: '#4CAF50' },
    { name: 'Inactive', value: inactiveMembers, color: '#F44336' },
    { name: 'On Hold', value: holdMembers, color: '#FF9800' }
  ];
  
  // Filter out zero values to avoid empty segments in the chart
  const filteredStatusData = statusData.filter(item => item.value > 0);
  
  // Etiketleri dilim rengine göre değişen renkte gösteren özel render fonksiyonu
  const renderCustomLabel = () => {
    // Etiket gösterme - boş döndür
    return null;
  };

  return (
    <Card title="Member Statistics">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* İstatistik grafikleri */}
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Member Status Distribution Chart */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Member Status Distribution</h4>
              <div className="h-64">
                {totalMembers > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={filteredStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        labelLine={false}
                        label={renderCustomLabel}
                      >
                        {filteredStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value} members (${((value / totalMembers) * 100).toFixed(1)}%)`, name]}
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '4px', padding: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                      />
                      <Legend 
                        formatter={(value, entry) => {
                          const { payload } = entry;
                          return `${value}: ${payload.value} members`;
                        }}
                        verticalAlign="bottom"
                        height={36}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-400">No member data available</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Membership Distribution Chart - Ana sayfadan veri alır */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Membership Distribution</h4>
              <div className="h-64">
                {membershipStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={membershipStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        labelLine={false}
                        label={renderCustomLabel}
                      >
                        {membershipStats.map((entry, index) => (
                          <Cell key={`membership-cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => {
                          const total = membershipStats.reduce((sum, item) => sum + item.value, 0);
                          return [`${value} members (${((value / total) * 100).toFixed(1)}%)`, name];
                        }}
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '4px', padding: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                      />
                      <Legend 
                        formatter={(value, entry) => {
                          const { payload } = entry;
                          return `${value}: ${payload.value} members`;
                        }}
                        verticalAlign="bottom"
                        height={36}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-400">No membership data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="flex flex-col space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-sm">Total Members</p>
            <p className="text-xl font-bold">{totalMembers}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-sm">New This Month</p>
            <p className="text-xl font-bold">{newMembersThisMonth}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-sm">Avg. Attendance</p>
            <p className="text-xl font-bold">{averageAttendance}/week</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MemberStats;