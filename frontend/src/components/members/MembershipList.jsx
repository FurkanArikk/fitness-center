import React from 'react';
import { Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const MembershipList = ({ memberships = [], onEdit, onDelete }) => {
  if (!memberships.length) {
    return (
      <div className="py-4 text-center text-gray-500">
        No membership plans found
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
            <th className="py-2 px-4 text-left">Duration</th>
            <th className="py-2 px-4 text-left">Price</th>
            <th className="py-2 px-4 text-left">Status</th>
            <th className="py-2 px-4 text-left">Created At</th>
            <th className="py-2 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {memberships.map((membership) => (
            <tr key={membership.id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-4">{membership.id}</td>
              <td className="py-2 px-4 font-medium">{membership.membershipName}</td>
              <td className="py-2 px-4">{membership.duration} month{membership.duration !== 1 ? 's' : ''}</td>
              <td className="py-2 px-4">${membership.price}</td>
              <td className="py-2 px-4">
                {membership.isActive ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle size={14} className="mr-1" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    <XCircle size={14} className="mr-1" /> Inactive
                  </span>
                )}
              </td>
              <td className="py-2 px-4">{formatDate(membership.createdAt)}</td>
              <td className="py-2 px-4">
                <div className="flex space-x-2">
                  <button 
                    className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                    onClick={() => onEdit && onEdit(membership)}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                    onClick={() => onDelete && onDelete(membership.id)}
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

export default MembershipList;
