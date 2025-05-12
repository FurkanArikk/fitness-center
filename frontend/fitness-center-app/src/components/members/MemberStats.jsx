import React from 'react';
import Card from '../common/Card';

const MemberStats = ({ stats }) => {
  const defaultStats = {
    totalMembers: 0,
    activeMembers: 0,
    newMembersThisMonth: 0,
    averageAttendance: 0
  };
  
  const { totalMembers, activeMembers, newMembersThisMonth, averageAttendance } = { ...defaultStats, ...stats };
  
  return (
    <Card title="Member Statistics">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-500 text-sm">Active Members</p>
          <p className="text-xl font-bold">{activeMembers}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-500 text-sm">Expired Memberships</p>
          <p className="text-xl font-bold">{totalMembers - activeMembers}</p>
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
    </Card>
  );
};

export default MemberStats;