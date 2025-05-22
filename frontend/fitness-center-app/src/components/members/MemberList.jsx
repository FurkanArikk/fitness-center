import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/formatters';

const MemberList = ({ members = [], onEdit, onDelete }) => {
  if (!members.length) {
    return (
      <div className="py-4 text-center text-gray-500">
        No members found
      </div>
    );
  }

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
              <td className="py-2 px-4">{formatDate(member.joinDate)}</td>
              <td className="py-2 px-4">
                <div className="flex space-x-2">
                  <button 
                    className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                    onClick={() => onEdit && onEdit(member)}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                    onClick={() => onDelete && onDelete(member.id)}
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