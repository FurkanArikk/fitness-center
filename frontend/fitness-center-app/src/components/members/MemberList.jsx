import React from 'react';
import { Edit, Trash2, CreditCard, Info, ActivitySquare } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/formatters';

const MemberList = ({ members = [], onEdit, onDelete, onAssignMembership, onViewDetails, onViewAssessments }) => {
  console.log('[MemberList] Received members:', members);
  console.log('[MemberList] Members length:', members.length);
  
  if (!members.length) {
    return (
      <div className="py-4 text-center text-gray-500">
        No members found
      </div>
    );
  }

  // Üyelik tipine göre renk sınıfını belirle
  const getMembershipBadgeClass = (type) => {
    const predefinedColors = {
      'basic': 'bg-blue-100 text-blue-800',
      'premium': 'bg-purple-100 text-purple-800',
      'gold': 'bg-amber-100 text-amber-800',
      'platinum': 'bg-gray-800 text-gray-100',
    };
    
    // Eğer tanımlanmış bir renk varsa onu kullan
    if (type && predefinedColors[type.toLowerCase()]) {
      return predefinedColors[type.toLowerCase()];
    }
    
    // Tanımlanmış renk yoksa, üyelik tipinin adına göre bir renk seç
    if (type) {
      // Üyelik adının ilk harflerine göre bir renk belirle
      const firstChar = type.charAt(0).toLowerCase();
      
      // Define different colors based on letter ranges
      if ('abcd'.includes(firstChar)) {
        return 'bg-pink-100 text-pink-800';  // A-D range pink
      } else if ('efgh'.includes(firstChar)) {
        return 'bg-green-100 text-green-800'; // E-H range green
      } else if ('ijkl'.includes(firstChar)) {
        return 'bg-red-100 text-red-800';    // I-L range red
      } else if ('mnop'.includes(firstChar)) {
        return 'bg-indigo-100 text-indigo-800'; // M-P range indigo
      } else if ('qrst'.includes(firstChar)) {
        return 'bg-yellow-100 text-yellow-800'; // Q-T range yellow
      } else {
        return 'bg-teal-100 text-teal-800';    // U-Z range teal
      }
    }
    
    // Default gray color if no type
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b">
            <th className="py-2 px-4 text-left">ID</th>
            <th className="py-2 px-4 text-left">Name</th>
            <th className="py-2 px-4 text-left">Email</th>
            <th className="py-2 px-4 text-left">Phone</th>
            <th className="py-2 px-4 text-left">Status</th>
            <th className="py-2 px-4 text-left">Membership</th>
            <th className="py-2 px-4 text-left">Join Date</th>
            <th className="py-2 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-4">{member.id}</td>
              <td className="py-2 px-4">
                {`${member.firstName || member.first_name || ''} ${member.lastName || member.last_name || ''}`.trim()}
              </td>
              <td className="py-2 px-4">{member.email}</td>
              <td className="py-2 px-4">{member.phone}</td>
              <td className="py-2 px-4">
                <StatusBadge status={member.status} />
              </td>
              <td className="py-2 px-4">
                {member.activeMembership ? (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMembershipBadgeClass(member.activeMembership.membershipName)}`}>
                    {member.activeMembership.membershipName || 'Unknown'}
                  </span>
                ) : (
                  <span className="text-gray-400 text-sm">None</span>
                )}
              </td>
              <td className="py-2 px-4">{formatDate(member.joinDate || member.join_date)}</td>
              <td className="py-2 px-4">
                <div className="flex space-x-2">
                  <button 
                    className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                    onClick={() => onEdit && onEdit(member)}
                    title="Edit Member"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="p-1 text-green-500 hover:bg-green-50 rounded"
                    onClick={() => onAssignMembership && onAssignMembership(member)}
                    title="Assign Membership"
                  >
                    <CreditCard size={16} />
                  </button>
                  <button 
                    className="p-1 text-purple-500 hover:bg-purple-50 rounded"
                    onClick={() => onViewDetails && onViewDetails(member)}
                    title="Member Details"
                  >
                    <Info size={16} />
                  </button>
                  {/* Assessment Button */}
                  <button 
                    className="p-1 text-amber-500 hover:bg-amber-50 rounded"
                    onClick={() => onViewAssessments && onViewAssessments(member)}
                    title="View Assessments"
                  >
                    <ActivitySquare size={16} />
                  </button>
                  <button 
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                    onClick={() => onDelete && onDelete(member.id)}
                    title="Delete Member"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MemberList;