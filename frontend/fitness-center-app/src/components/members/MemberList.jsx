import React from 'react';
import { Edit, Trash2, CreditCard, Info } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/formatters';

const MemberList = ({ members = [], onEdit, onDelete, onAssignMembership, onViewDetails }) => {
  if (!members.length) {
    return (
      <div className="py-4 text-center text-gray-500">
        No members found
      </div>
    );
  }

  // Üyelik tipine göre renk sınıfını belirle
  const getMembershipBadgeClass = (type) => {
    switch(type?.toLowerCase()) {
      case 'basic':
        return 'bg-blue-100 text-blue-800';
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      case 'gold':
        return 'bg-amber-100 text-amber-800';
      case 'platinum':
        return 'bg-gray-800 text-gray-100';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
              <td className="py-2 px-4">{`${member.firstName} ${member.lastName}`}</td>
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
              <td className="py-2 px-4">{formatDate(member.joinDate)}</td>
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
                    title="View Details"
                  >
                    <Info size={16} />
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