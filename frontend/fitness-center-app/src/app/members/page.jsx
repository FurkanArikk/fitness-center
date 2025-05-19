"use client";

import React, { useState, useEffect, useId } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import MemberList from '@/components/members/MemberList';
import MemberStats from '@/components/members/MemberStats';
import EditMemberModal from '@/components/members/EditMemberModal';
import DeleteMemberConfirm from '@/components/members/DeleteMemberConfirm';
import AddMemberModal from '@/components/members/AddMemberModal';
import { memberService } from '@/api';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const searchInputId = useId();
  
  // States for member operations
  const [editMember, setEditMember] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Added state variable for statistics
  const [memberStats, setMemberStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    holdMembers: 0,
    newMembersThisMonth: 0,
    averageAttendance: 0
  });

  // Function to update statistics
  const fetchAndUpdateStats = async () => {
    try {
      console.log('[Members Page] Fetching all members for statistics');
      const data = await memberService.getAllMembers();
      
      if (data) {
        const membersArray = Array.isArray(data) ? data : (data.members && Array.isArray(data.members) ? data.members : []);
        const totalCount = Array.isArray(data) ? data.length : (data.totalCount || membersArray.length);
        
        // Calculate counts based on member status
        const activeCount = membersArray.filter(member => member.status === 'active').length;
        const inactiveCount = membersArray.filter(member => member.status === 'de_active').length;
        const holdCount = membersArray.filter(member => member.status === 'hold_on').length;
        
        // Calculate new members this month
        const currentDate = new Date();
        const newMembersCount = membersArray.filter(m => {
          const joinDate = new Date(m.joinDate);
          return joinDate.getMonth() === currentDate.getMonth() && 
                 joinDate.getFullYear() === currentDate.getFullYear();
        }).length;
        
        // Update statistics
        setMemberStats({
          totalMembers: totalCount,
          activeMembers: activeCount,
          inactiveMembers: inactiveCount,
          holdMembers: holdCount,
          newMembersThisMonth: newMembersCount,
          averageAttendance: Math.round(activeCount * 0.7) // Example calculation for average attendance
        });
        
        console.log('[Members Page] Statistics updated:', totalCount, 'members');
      }
    } catch (err) {
      console.error("[Members Page] Error fetching statistics data:", err);
    }
  };

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`[Members Page] Fetching members, page: ${currentPage}`);
        const data = await memberService.getMembers(currentPage, 2);
        
        console.log('[Members Page] API Response:', data);
        
        if (data) {
          // Handle the specific API response format with members array
          if (data.members && Array.isArray(data.members)) {
            // Use members array from the response
            setMembers(data.members);
            
            // Use pagination data from the response
            setTotalPages(data.totalPages || 1);
            
            // Update statistics data with status breakdown
            const membersArray = data.members;
            const activeCount = membersArray.filter(member => member.status === 'active').length;
            const inactiveCount = membersArray.filter(member => member.status === 'de_active').length;
            const holdCount = membersArray.filter(member => member.status === 'hold_on').length;
            
            setMemberStats({
              totalMembers: data.totalCount || membersArray.length,
              activeMembers: activeCount,
              inactiveMembers: inactiveCount,
              holdMembers: holdCount,
              newMembersThisMonth: membersArray.filter(m => {
                const joinDate = new Date(m.joinDate);
                const now = new Date();
                return joinDate.getMonth() === now.getMonth() && 
                       joinDate.getFullYear() === now.getFullYear();
              }).length,
              averageAttendance: Math.round(activeCount * 0.7) // Example calculation for average attendance
            });
          } else if (Array.isArray(data)) {
            setMembers(data);
            setTotalPages(Math.max(1, Math.ceil(data.length / 10)));
            
            // Update statistics data with status breakdown
            const activeCount = data.filter(member => member.status === 'active').length;
            const inactiveCount = data.filter(member => member.status === 'de_active').length;
            const holdCount = data.filter(member => member.status === 'hold_on').length;
            
            setMemberStats({
              totalMembers: data.length,
              activeMembers: activeCount,
              inactiveMembers: inactiveCount,
              holdMembers: holdCount,
              newMembersThisMonth: data.filter(m => {
                const joinDate = new Date(m.joinDate);
                const now = new Date();
                return joinDate.getMonth() === now.getMonth() && 
                       joinDate.getFullYear() === now.getFullYear();
              }).length,
              averageAttendance: Math.round(activeCount * 0.7) // Example calculation for average attendance
            });
          } else {
            console.warn('[Members Page] Unknown API response format:', data);
            setMembers([]);
            setTotalPages(1);
          }
        } else {
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
    
    // Update statistics when the application starts
    fetchAndUpdateStats();
  }, [currentPage]);

  // Member add function
  const handleAddMember = async (formData) => {
    setActionLoading(true);
    try {
      const newMember = await memberService.createMember(formData);
      console.log('[Members] Member added:', newMember);
      
      // Update state - add the new member to the list
      setMembers([newMember, ...members]);
      
      // Update statistics after adding a member
      fetchAndUpdateStats();
      
      // Close modal
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding member:', err);
      setError('An error occurred while adding the member');
    } finally {
      setActionLoading(false);
    }
  };

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
      
      // Update statistics after editing a member
      fetchAndUpdateStats();
      
      // Close modal
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
        
        // Update statistics after deleting a member
        fetchAndUpdateStats();
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
          onClick={() => setShowAddModal(true)}
        >
          Add New Member
        </Button>
      </div>
      
      {/* Added statistics cards */}
      <MemberStats stats={memberStats} />
      
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
              {/* Using the MemberList component */}
              <MemberList 
                members={members} 
                onEdit={(member) => setEditMember(member)}
                onDelete={(id) => {
                  const member = members.find(m => m.id === id);
                  setDeleteConfirm(member);
                }}
              />
              
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

      {/* Using EditMemberModal component */}
      {editMember && (
        <EditMemberModal
          member={editMember}
          onClose={() => setEditMember(null)}
          onSave={handleEditMember}
          isLoading={actionLoading}
        />
      )}
      
      {/* Using DeleteMemberConfirm component */}
      {deleteConfirm && (
        <DeleteMemberConfirm
          member={deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDeleteMember}
          isLoading={actionLoading}
        />
      )}
      
      {/* Using AddMemberModal component */}
      {showAddModal && (
        <AddMemberModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddMember}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default Members;