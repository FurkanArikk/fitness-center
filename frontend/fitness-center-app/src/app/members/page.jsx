"use client";

import React, { useState, useEffect, useId } from 'react';
import { Plus, Search, Filter, Edit, Trash, X } from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import StatusBadge from '@/components/common/StatusBadge';
import { memberService } from '@/api';
import { formatDate } from '@/utils/formatters';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const searchInputId = useId(); // Create a unique ID
  
  // States for edit and delete operations
  const [editMember, setEditMember] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Member edit function
  const handleEditMember = async (formData) => {
    if (!editMember) return;

    setActionLoading(true);
    try {
      const updatedMember = await memberService.updateMember(editMember.id, formData);
      console.log('[Members] Member updated:', updatedMember);
      
      // Update state
      setMembers(members.map(member => 
        member.id === updatedMember.id ? updatedMember : member
      ));
      
      // Close modal
      setShowEditModal(false);
      setEditMember(null);
    } catch (err) {
      console.error('Error updating member:', err);
      setError('An error occurred while updating the member');
    } finally {
      setActionLoading(false);
    }
  };

  // Member delete function
  const handleDeleteMember = async (id) => {
    setActionLoading(true);
    try {
      const success = await memberService.deleteMember(id);
      if (success) {
        console.log('[Members] Member deleted:', id);
        
        // Remove deleted member from the list
        setMembers(members.filter(member => member.id !== id));
      } else {
        setError('Failed to delete member');
      }
    } catch (err) {
      console.error('Error deleting member:', err);
      setError('An error occurred while deleting the member');
    } finally {
      setActionLoading(false);
      setDeleteConfirm(null);
    }
  };

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      setError(null); // Reset error state on new request
      
      try {
        // Make API request and get response
        console.log(`[Members Page] Fetching members, page: ${currentPage}`);
        const data = await memberService.getMembers(currentPage, 10);
        
        // Log API response to console
        console.log('[Members Page] API Response:', data);
        
        // API yanıt formatına göre veriyi işliyoruz (hem dizi hem de obje formatını destekler)
        if (data) {
          if (Array.isArray(data)) {
            // Direct array format response
            setMembers(data);
            // Simple default value for pagination
            setTotalPages(Math.max(1, Math.ceil(data.length / 10)));
          } else if (data.items || data.data) {
            // { items: [] } or { data: [] } format response
            const items = data.items || data.data || [];
            setMembers(items);
            
            // Pagination info from API response
            const total = data.totalPages || 
                         (data.total ? Math.ceil(data.total / 10) : 1);
            setTotalPages(total);
          } else {
            // Unknown response format
            console.warn('[Members Page] Unknown API response format:', data);
            setMembers([]);
            setTotalPages(1);
          }
        } else {
          // No response or empty
          setMembers([]);
          setTotalPages(1);
        }
      } catch (err) {
        setError(`Error loading members: ${err.message}`);
        console.error("[Members Page] API Error:", err);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [currentPage]);

  if (loading && members.length === 0) {
    return <Loader message="Loading members..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Member Management</h2>
        <Button 
          variant="primary" 
          icon={<Plus size={18} />}
          onClick={() => console.log('Add new member')}
        >
          Add New Member
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      <Card>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Member List</h3>
            <div className="flex gap-2">
              <div className="relative">
                <input 
                  id={searchInputId}
                  type="text" 
                  placeholder="Search members..." 
                  className="border rounded-md py-2 px-4 pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  suppressHydrationWarning
                />
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
              <button className="border border-gray-300 hover:bg-gray-50 p-2 rounded-md">
                <Filter size={18} />
              </button>
            </div>
          </div>
        </div>
        <div className="p-4">
          {loading ? (
            <Loader size="small" message="Refreshing data..." />
          ) : (
            <>
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
                    {members.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-4 text-center text-gray-500">No members found</td>
                      </tr>
                    ) : (
                      members.map((member) => (
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
                                className="p-1 text-blue-500 hover:bg-blue-50 rounded flex items-center"
                                onClick={() => {
                                  setEditMember(member);
                                  setShowEditModal(true);
                                }}
                              >
                                <Edit size={16} className="mr-1" />
                                Edit
                              </button>
                              <button 
                                className="p-1 text-red-500 hover:bg-red-50 rounded flex items-center"
                                onClick={() => setDeleteConfirm(member)}
                              >
                                <Trash size={16} className="mr-1" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Showing page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button 
                    className="px-3 py-1 border rounded hover:bg-gray-50"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => (
                    <button 
                      key={i}
                      className={`px-3 py-1 border rounded ${
                        currentPage === i + 1 ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button 
                    className="px-3 py-1 border rounded hover:bg-gray-50"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Edit Modal */}
      {showEditModal && editMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Edit Member</h3>
              <button 
                className="p-1 hover:bg-gray-100 rounded-full"
                onClick={() => setShowEditModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = {
                firstName: e.target.firstName.value,
                lastName: e.target.lastName.value,
                email: e.target.email.value,
                phone: e.target.phone.value,
                address: e.target.address.value,
                dateOfBirth: e.target.dateOfBirth.value,
                emergencyContactName: e.target.emergencyContactName.value,
                emergencyContactPhone: e.target.emergencyContactPhone.value,
                status: e.target.status.value
              };
              handleEditMember(formData);
            }}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    defaultValue={editMember.firstName}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    defaultValue={editMember.lastName}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editMember.email}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editMember.phone}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <textarea
                    name="address"
                    defaultValue={editMember.address}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    defaultValue={editMember.dateOfBirth ? editMember.dateOfBirth.split('T')[0] : ''}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={editMember.status}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    name="emergencyContactName"
                    defaultValue={editMember.emergencyContactName}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Emergency Phone</label>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    defaultValue={editMember.emergencyContactPhone}
                    className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  onClick={() => setShowEditModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Delete Member</h3>
            <p className="mb-6">
              Are you sure you want to delete <span className="font-medium">{deleteConfirm.firstName} {deleteConfirm.lastName}</span>?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
                onClick={() => setDeleteConfirm(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                onClick={() => handleDeleteMember(deleteConfirm.id)}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;