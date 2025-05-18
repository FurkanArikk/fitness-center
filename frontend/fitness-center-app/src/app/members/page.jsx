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

  // Member add function
  const handleAddMember = async (formData) => {
    setActionLoading(true);
    try {
      const newMember = await memberService.createMember(formData);
      console.log('[Members] Member added:', newMember);
      
      // Update state - add the new member to the list
      setMembers([newMember, ...members]);
      
      // Update statistics based on status
      setMemberStats(prev => {
        // Destruct current values with default 0
        const { activeMembers = 0, inactiveMembers = 0, holdMembers = 0 } = prev;
        
        // Determine which count to increment based on status
        const updatedStats = {
          ...prev,
          totalMembers: prev.totalMembers + 1,
          newMembersThisMonth: prev.newMembersThisMonth + 1
        };
        
        // Update the specific status count
        if (formData.status === 'active') {
          updatedStats.activeMembers = activeMembers + 1;
        } else if (formData.status === 'de_active') {
          updatedStats.inactiveMembers = inactiveMembers + 1;
        } else if (formData.status === 'hold_on') {
          updatedStats.holdMembers = holdMembers + 1;
        }
        
        return updatedStats;
      });
      
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
      
      // Status değişimi olduğunda istatistikleri güncelle
      if (editMember.status !== formData.status) {
        setMemberStats(prev => {
          // Destruct current values with default 0
          const { activeMembers = 0, inactiveMembers = 0, holdMembers = 0 } = prev;
          
          const updatedStats = { ...prev };
          
          // Decrease count for old status
          if (editMember.status === 'active') {
            updatedStats.activeMembers = Math.max(0, activeMembers - 1);
          } else if (editMember.status === 'de_active') {
            updatedStats.inactiveMembers = Math.max(0, inactiveMembers - 1);
          } else if (editMember.status === 'hold_on') {
            updatedStats.holdMembers = Math.max(0, holdMembers - 1);
          }
          
          // Increase count for new status
          if (formData.status === 'active') {
            updatedStats.activeMembers = activeMembers + 1;
          } else if (formData.status === 'de_active') {
            updatedStats.inactiveMembers = inactiveMembers + 1;
          } else if (formData.status === 'hold_on') {
            updatedStats.holdMembers = holdMembers + 1;
          }
          
          return updatedStats;
        });
      }
      
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
        
        // Find the member before removing from list
        const deletedMember = members.find(m => m.id === id);
        
        // Remove deleted member from the list
        setMembers(members.filter(member => member.id !== id));
        
        // Update statistics based on deleted member's status
        if (deletedMember) {
          setMemberStats(prev => {
            // Destruct current values with default 0
            const { totalMembers = 0, activeMembers = 0, inactiveMembers = 0, holdMembers = 0 } = prev;
            
            const updatedStats = {
              ...prev,
              totalMembers: Math.max(0, totalMembers - 1)
            };
            
            // Decrease appropriate status count
            if (deletedMember.status === 'active') {
              updatedStats.activeMembers = Math.max(0, activeMembers - 1);
            } else if (deletedMember.status === 'de_active') {
              updatedStats.inactiveMembers = Math.max(0, inactiveMembers - 1);
            } else if (deletedMember.status === 'hold_on') {
              updatedStats.holdMembers = Math.max(0, holdMembers - 1);
            }
            
            // If it was a member added this month, decrease that count too
            const joinDate = new Date(deletedMember.joinDate);
            const now = new Date();
            if (joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear()) {
              updatedStats.newMembersThisMonth = Math.max(0, prev.newMembersThisMonth - 1);
            }
            
            return updatedStats;
          });
        }
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
      setError(null);
      
      try {
        console.log(`[Members Page] Fetching members, page: ${currentPage}`);
        const data = await memberService.getMembers(currentPage, 10);
        
        console.log('[Members Page] API Response:', data);
        
        if (data) {
          if (Array.isArray(data)) {
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
          } else if (data.items || data.data) {
            const items = data.items || data.data || [];
            setMembers(items);
            
            const total = data.totalPages || 
                         (data.total ? Math.ceil(data.total / 10) : 1);
            setTotalPages(total);
            
            // Update statistics data with status breakdown
            const activeCount = items.filter(member => member.status === 'active').length;
            const inactiveCount = items.filter(member => member.status === 'de_active').length;
            const holdCount = items.filter(member => member.status === 'hold_on').length;
            
            setMemberStats({
              totalMembers: items.length,
              activeMembers: activeCount,
              inactiveMembers: inactiveCount,
              holdMembers: holdCount,
              newMembersThisMonth: items.filter(m => {
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