"use client";

import React, { useState, useEffect, useId } from 'react';
import { Plus, Search, Filter, ChevronDown } from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import MemberList from '@/components/members/MemberList';
import MemberStats from '@/components/members/MemberStats';
import EditMemberModal from '@/components/members/EditMemberModal';
import DeleteMemberConfirm from '@/components/members/DeleteMemberConfirm';
import AddMemberModal from '@/components/members/AddMemberModal';
import AssignMembershipModal from '@/components/members/AssignMembershipModal';
import MemberDetailsModal from '@/components/members/MemberDetailsModal'; // Yeni eklendi
import { memberService } from '@/api';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);
  const searchInputId = useId();
  
  // States for member operations
  const [editMember, setEditMember] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // State for membership assignment
  const [assignMembershipMember, setAssignMembershipMember] = useState(null);
  
  // Added state variable for statistics
  const [memberStats, setMemberStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    holdMembers: 0,
    newMembersThisMonth: 0,
    averageAttendance: 0
  });

  // State for member details modal
  const [detailsMember, setDetailsMember] = useState(null);

  // State for membership statistics
  const [membershipStats, setMembershipStats] = useState([]);

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
        console.log(`[Members Page] Fetching members, page: ${currentPage}, size: ${pageSize}`);
        const data = await memberService.getMembers(currentPage, pageSize);
        
        console.log('[Members Page] API Response:', data);
        
        if (data) {
          let membersData = [];
          
          // Handle the specific API response format with members array
          if (data.members && Array.isArray(data.members)) {
            membersData = data.members;
            setTotalPages(data.totalPages || 1);
          } else if (Array.isArray(data)) {
            membersData = data;
            setTotalPages(Math.max(1, Math.ceil(data.length / 10)));
          } else {
            console.warn('[Members Page] Unknown API response format:', data);
            setMembers([]);
            setTotalPages(1);
            return;
          }
          
          // Üyelerin aktif üyeliklerini çek
          const membersWithMemberships = await Promise.all(membersData.map(async (member) => {
            try {
              // İlk olarak üyenin tüm üyeliklerini al
              let memberMemberships = [];
              
              try {
                memberMemberships = await memberService.getMemberMemberships(member.id);
                if (!Array.isArray(memberMemberships)) {
                  console.warn(`Unexpected response format for member ${member.id} memberships:`, memberMemberships);
                  memberMemberships = [];
                }
              } catch (err) {
                console.error(`Error fetching memberships for member ${member.id}:`, err);
                memberMemberships = [];
              }
              
              if (memberMemberships.length > 0) {
                // ID'ye göre sıralama yap (en büyük ID'li üyelik en önce)
                const sortedMemberships = [...memberMemberships].sort((a, b) => 
                  b.id - a.id
                );
                
                // ID'si en büyük olan üyeliği al
                const latestMembership = sortedMemberships[0];
                
                if (latestMembership) {
                  // Üyelik tipine ait detayları al
                  try {
                    const membershipDetails = await memberService.getMembership(latestMembership.membershipId);
                    if (membershipDetails) {
                      member.activeMembership = {
                        ...latestMembership,
                        membershipName: membershipDetails?.membershipName || 'Unknown',
                        description: membershipDetails?.description || '',
                        price: membershipDetails?.price || 0
                      };
                    }
                  } catch (err) {
                    console.error(`Error fetching membership details for member ${member.id}:`, err);
                  }
                }
              }
              
              return member;
            } catch (err) {
              console.error(`Error processing member ${member.id}:`, err);
              return member;
            }
          }));
          
          setMembers(membersWithMemberships);
          
          // Üyelik dağılımı istatistiklerini hesapla
          const membershipColors = {
            'basic': '#3B82F6',    // Mavi
            'premium': '#8B5CF6',  // Mor
            'gold': '#F59E0B',     // Amber
            'platinum': '#6B7280', // Gri
          };
          
          // Üyelik tipine göre sayım yap
          const membershipCounts = {};
          
          membersWithMemberships.forEach(member => {
            if (member.activeMembership?.membershipName) {
              const membershipName = member.activeMembership.membershipName;
              
              if (!membershipCounts[membershipName]) {
                membershipCounts[membershipName] = 1;
              } else {
                membershipCounts[membershipName]++;
              }
            }
          });
          
          // Üyelik istatistiklerini oluştur
          const membershipStatsData = Object.keys(membershipCounts).map(name => ({
            name,
            value: membershipCounts[name],
            color: membershipColors[name.toLowerCase()] || '#60A5FA'
          }));
          
          setMembershipStats(membershipStatsData);
          
          // İstatistikleri güncelle
          const activeCount = membersWithMemberships.filter(member => member.status === 'active').length;
          const inactiveCount = membersWithMemberships.filter(member => member.status === 'de_active').length;
          const holdCount = membersWithMemberships.filter(member => member.status === 'hold_on').length;
          
          setMemberStats({
            totalMembers: data.totalCount || membersWithMemberships.length,
            activeMembers: activeCount,
            inactiveMembers: inactiveCount,
            holdMembers: holdCount,
            newMembersThisMonth: membersWithMemberships.filter(m => {
              const joinDate = new Date(m.joinDate);
              const now = new Date();
              return joinDate.getMonth() === now.getMonth() && 
                     joinDate.getFullYear() === now.getFullYear();
            }).length,
            averageAttendance: Math.round(activeCount * 0.7) // Example calculation for average attendance
          });
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
  }, [currentPage, pageSize]); // Add pageSize to dependencies to refetch data when it changes

  // Function to change page size
  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when page size changes
    setPageSizeOpen(false); // Close dropdown
  };

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

  // Membership assignment
  const handleAssignMembership = async (membershipData) => {
    setActionLoading(true);
    try {
      // API call
      const result = await memberService.assignMembershipToMember(membershipData);
      console.log('[Members] Membership assigned:', result);
      
      // Successful operation
      setAssignMembershipMember(null); // Close modal
    } catch (err) {
      console.error('Error assigning membership:', err);
      setError('An error occurred while assigning membership');
    } finally {
      setActionLoading(false);
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
      <MemberStats stats={memberStats} membershipStats={membershipStats} />
      
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
              {/* Using the MemberList component with new onViewDetails prop */}
              <MemberList 
                members={members} 
                onEdit={(member) => setEditMember(member)}
                onDelete={(id) => {
                  const member = members.find(m => m.id === id);
                  setDeleteConfirm(member);
                }}
                onAssignMembership={(member) => setAssignMembershipMember(member)}
                onViewDetails={(member) => setDetailsMember(member)} // Yeni eklendi
              />
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  Showing page {currentPage} of {totalPages}
                  
                  {/* Page size dropdown */}
                  <div className="relative ml-4">
                    <button 
                      className="border rounded px-3 py-1 flex items-center gap-1 text-sm hover:bg-gray-50"
                      onClick={() => setPageSizeOpen(!pageSizeOpen)}
                    >
                      {pageSize} per page
                      <ChevronDown size={14} />
                    </button>
                    
                    {pageSizeOpen && (
                      <div className="absolute top-full left-0 mt-1 bg-white shadow-lg border rounded-md z-10">
                        {[10, 25, 50].map(size => (
                          <button
                            key={size}
                            className={`block w-full text-left px-4 py-2 hover:bg-gray-50 ${pageSize === size ? 'bg-blue-50 text-blue-600' : ''}`}
                            onClick={() => handlePageSizeChange(size)}
                          >
                            {size} per page
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
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
      
      {/* Membership assignment modal */}
      {assignMembershipMember && (
        <AssignMembershipModal
          member={assignMembershipMember}
          onClose={() => setAssignMembershipMember(null)}
          onSave={handleAssignMembership}
          isLoading={actionLoading}
        />
      )}

      {/* Member details modal */}
      {detailsMember && (
        <MemberDetailsModal
          member={detailsMember}
          onClose={() => setDetailsMember(null)}
        />
      )}
    </div>
  );
};

export default Members;