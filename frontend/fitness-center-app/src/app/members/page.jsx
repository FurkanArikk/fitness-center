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
import MemberDetailsModal from '@/components/members/MemberDetailsModal';
import EditMembershipModal from '@/components/members/EditMembershipModal';
import DeleteMembershipConfirm from '@/components/members/DeleteMembershipConfirm';
import EditBenefitModal from '@/components/members/EditBenefitModal';
import DeleteBenefitConfirm from '@/components/members/DeleteBenefitConfirm';
import BenefitTypesList from '@/components/members/BenefitTypesList'; 
import MemberAssessmentsModal from '@/components/members/MemberAssessmentsModal';
import AddAssessmentModal from '@/components/members/AddAssessmentModal';
import EditAssessmentModal from '@/components/members/EditAssessmentModal';
import DeleteAssessmentConfirm from '@/components/members/DeleteAssessmentConfirm';
import { memberService } from '@/api';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
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

  // States for membership types
  const [membershipsData, setMembershipsData] = useState([]);
  const [loadingMemberships, setLoadingMemberships] = useState(false);
  const [editMembership, setEditMembership] = useState(null);
  const [deleteMembershipConfirm, setDeleteMembershipConfirm] = useState(null);

  // States for benefit types
  const [benefitsData, setBenefitsData] = useState([]);
  const [loadingBenefits, setLoadingBenefits] = useState(false);
  const [editBenefit, setEditBenefit] = useState(null);
  const [deleteBenefitConfirm, setDeleteBenefitConfirm] = useState(null);

  // Assessment modals for state
  const [viewAssessmentsMember, setViewAssessmentsMember] = useState(null);
  const [addAssessmentMember, setAddAssessmentMember] = useState(null);
  const [memberAssessments, setMemberAssessments] = useState([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [editAssessment, setEditAssessment] = useState(null);
  const [deleteAssessmentConfirm, setDeleteAssessmentConfirm] = useState(null);

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

  // Function to fetch membership types
  const fetchMemberships = async () => {
    setLoadingMemberships(true);
    try {
      const data = await memberService.getMemberships();
      
      // Tüm membership'ler için benefit'leri çekelim
      if (Array.isArray(data) && data.length > 0) {
        const membershipsWithBenefits = await Promise.all(data.map(async (membership) => {
          try {
            const benefits = await memberService.getMembershipBenefits(membership.id);
            return { ...membership, benefits: benefits || [] };
          } catch (err) {
            console.error(`Error fetching benefits for membership ${membership.id}:`, err);
            return { ...membership, benefits: [] };
          }
        }));
        setMembershipsData(membershipsWithBenefits);
      } else {
        setMembershipsData(data || []);
      }
    } catch (err) {
      console.error('Error fetching memberships:', err);
    } finally {
      setLoadingMemberships(false);
    }
  };

  // Function to fetch benefit types
  const fetchBenefits = async () => {
    setLoadingBenefits(true);
    try {
      const data = await memberService.getBenefits();
      setBenefitsData(data || []);
    } catch (err) {
      console.error('Error fetching benefits:', err);
    } finally {
      setLoadingBenefits(false);
    }
  };

  // Function to fetch member assessments
  const fetchMemberAssessments = async (memberId) => {
    if (!memberId) return;
    
    setLoadingAssessments(true);
    try {
      const assessments = await memberService.getMemberAssessments(memberId);
      setMemberAssessments(assessments || []);
    } catch (err) {
      console.error(`Error fetching assessments for member ${memberId}:`, err);
      setMemberAssessments([]);
    } finally {
      setLoadingAssessments(false);
    }
  };

  // Function to view assessments
  const handleViewAssessments = (member) => {
    setViewAssessmentsMember(member);
    fetchMemberAssessments(member.id);
  };

  // Function to add assessment
  const handleAddAssessment = async (formData) => {
    setActionLoading(true);
    try {
      await memberService.createAssessment(formData);
      console.log('[Members] Assessment created for member:', formData.memberId);
      
      // Reload assessments
      await fetchMemberAssessments(formData.memberId);
      
      // Close modal
      setAddAssessmentMember(null);
    } catch (err) {
      console.error('Error creating assessment:', err);
      setError('An error occurred while creating the assessment');
    } finally {
      setActionLoading(false);
    }
  };

  // Değerlendirme düzenleme fonksiyonu
  const handleEditAssessment = async (formData) => {
    if (!formData || !formData.id) return;
    
    setActionLoading(true);
    try {
      await memberService.updateAssessment(formData.id, formData);
      console.log('[Members] Assessment updated:', formData.id);
      
      // Reload assessments to reflect changes
      await fetchMemberAssessments(formData.memberId);
      
      // Close modal
      setEditAssessment(null);
    } catch (err) {
      console.error('Error updating assessment:', err);
      setError('An error occurred while updating the assessment');
    } finally {
      setActionLoading(false);
    }
  };

  // Değerlendirme silme fonksiyonu
  const handleDeleteAssessment = async (id) => {
    if (!id || !viewAssessmentsMember) return;
    
    setActionLoading(true);
    try {
      const success = await memberService.deleteAssessment(id);
      
      if (success) {
        console.log('[Members] Assessment deleted:', id);
        
        // Reload assessments to reflect changes
        await fetchMemberAssessments(viewAssessmentsMember.id);
      } else {
        setError('Failed to delete assessment');
      }
      
      // Close delete confirmation modal
      setDeleteAssessmentConfirm(null);
    } catch (err) {
      console.error('Error deleting assessment:', err);
      setError('An error occurred while deleting the assessment');
    } finally {
      setActionLoading(false);
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

    // Fetch membership types
    fetchMemberships();

    // Fetch benefit types
    fetchBenefits();
  }, [currentPage, pageSize]); // Add pageSize to dependencies to refetch data when it changes

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
      
      // Üyelerin güncel bilgilerini almak için çağrı yap
      try {
        // Üye ID'sini kullanarak üyenin güncel detaylarını getir
        const updatedMemberDetails = await memberService.getMember(membershipData.memberId);
        
        // Atanan üyelik tipinin detaylarını çek
        const membershipDetails = await memberService.getMembership(membershipData.membershipId);
        
        if (updatedMemberDetails && membershipDetails) {
          // Aktif üyeliği oluştur
          const activeMembership = {
            membershipId: membershipData.membershipId,
            startDate: membershipData.startDate,
            endDate: membershipData.endDate,
            membershipName: membershipDetails.membershipName || 'Unknown',
            description: membershipDetails.description || '',
            price: membershipDetails.price || 0
          };
          
          // Üye listesini güncelle
          setMembers(currentMembers => currentMembers.map(member => {
            if (member.id === membershipData.memberId) {
              return { ...member, activeMembership };
            }
            return member;
          }));
          
          console.log('[Members] Member list updated with new membership information');
        }
      } catch (updateErr) {
        console.error('Error updating member details after assignment:', updateErr);
        // Hatayı göster ama işlemi iptal etme
      }
      
      // Successful operation
      setAssignMembershipMember(null); // Close modal
    } catch (err) {
      console.error('Error assigning membership:', err);
      setError('An error occurred while assigning membership');
    } finally {
      setActionLoading(false);
    }
  };

  // Membership delete function
  const handleDeleteMembership = async (id) => {
    setActionLoading(true);
    try {
      const result = await memberService.deleteMembership(id);
      if (result.success) {
        console.log('[Members] Membership deleted:', id);
        
        // Refresh memberships
        await fetchMemberships();
        
        // Başarılı işlem sonrası modalı kapat
        setDeleteMembershipConfirm(null);
      } else {
        // API'den gelen hata mesajını göster
        setError(result.error || 'Failed to delete membership');
        
        // Eğer üyelik kullanımdaysa, kullanıcıya özel mesaj göster
        if (result.error && result.error.includes("in use by members")) {
          setError("Bu üyelik tipi aktif üyeler tarafından kullanılıyor ve silinemiyor. Önce tüm üyeleri başka bir üyelik tipine transfer etmeniz gerekiyor.");
        }
      }
    } catch (err) {
      console.error('Error deleting membership:', err);
      setError('An error occurred while deleting the membership');
    } finally {
      setActionLoading(false);
    }
  };

  // Membership update function
  const handleUpdateMembership = async (id, data) => {
    setActionLoading(true);
    try {
      // Eğer id varsa güncelleme, yoksa yeni oluşturma
      if (id) {
        await memberService.updateMembership(id, data);
        console.log('[Members] Membership updated:', id);
      } else {
        // Yeni üyelik oluştur
        const newMembership = await memberService.createMembership(data);
        console.log('[Members] New membership created:', newMembership);
      }
      
      // Refresh memberships
      await fetchMemberships();
      
      // Close modal
      setEditMembership(null);
    } catch (err) {
      console.error('Error updating/creating membership:', err);
      setError('An error occurred while updating/creating the membership');
    } finally {
      setActionLoading(false);
    }
  };

  // Üyelik durumunu güncelleme fonksiyonu
  const handleUpdateMembershipStatus = async (id, isActive) => {
    setActionLoading(true);
    try {
      const result = await memberService.updateMembershipStatus(id, { isActive: !isActive });
      
      if (result.success) {
        // Başarılı işlemden sonra üyelik listesini yenile
        await fetchMemberships();
      } else {
        // API'den gelen hata mesajını göster
        setError(result.error || 'Failed to update membership status');
      }
    } catch (err) {
      console.error('Error updating membership status:', err);
      setError('An error occurred while updating membership status');
    } finally {
      setActionLoading(false);
    }
  };

  // Benefit delete function
  const handleDeleteBenefit = async (id) => {
    setActionLoading(true);
    try {
      const success = await memberService.deleteBenefit(id);
      if (success) {
        console.log('[Members] Benefit deleted:', id);
        
        // Benefit listesini yenile
        await fetchBenefits();
      } else {
        setError('Failed to delete benefit');
      }
    } catch (err) {
      console.error('Error deleting benefit:', err);
      setError('An error occurred while deleting the benefit');
    } finally {
      setActionLoading(false);
      setDeleteBenefitConfirm(null);
    }
  };

  // Benefit update function
  const handleUpdateBenefit = async (id, data) => {
    setActionLoading(true);
    try {
      // id varsa güncelleme, yoksa yeni oluşturma
      if (id) {
        await memberService.updateBenefit(id, data);
        console.log('[Members] Benefit updated:', id);
      } else {
        // Yeni benefit oluştur
        const newBenefit = await memberService.createBenefit(data);
        console.log('[Members] New benefit created:', newBenefit);
      }
      
      // Benefit listesini yenile
      await fetchBenefits();
      
      // Modal'ı kapat
      setEditBenefit(null);
    } catch (err) {
      console.error('Error updating/creating benefit:', err);
      setError('An error occurred while updating/creating the benefit');
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
              {/* Using the MemberList component with new onViewAssessments prop */}
              <MemberList 
                members={members} 
                onEdit={(member) => setEditMember(member)}
                onDelete={(id) => {
                  const member = members.find(m => m.id === id);
                  setDeleteConfirm(member);
                }}
                onAssignMembership={(member) => setAssignMembershipMember(member)}
                onViewDetails={(member) => setDetailsMember(member)}
                onViewAssessments={handleViewAssessments} // Yeni assessment butonunun click handler'ı
              />
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500 flex items-center gap-2">
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

      {/* Membership Types Cards */}
      <Card title="Membership Types">
        {loadingMemberships ? (
          <div className="p-4">
            <Loader size="small" message="Loading membership types..." />
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {membershipsData.length > 0 ? (
                membershipsData.map(membership => (
                  <div 
                    key={membership.id} 
                    className={`border rounded-lg shadow p-4 ${membership.isActive ? 'border-green-200' : 'border-gray-200'}`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-lg font-medium">{membership.membershipName}</h4>
                      <div>
                        {membership.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      <p className="text-gray-600 text-sm">{membership.description || 'No description'}</p>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-gray-500 text-xs">Duration</span>
                          <p className="font-medium">{membership.duration} month{membership.duration !== 1 ? 's' : ''}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Price</span>
                          <p className="font-medium text-right">${membership.price}</p>
                        </div>
                      </div>

                      {/* Membership Benefits - mavi arka plan kaldırıldı */}
                      {membership.benefits && membership.benefits.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Benefits:</h5>
                          <ul className="space-y-1">
                            {membership.benefits.map((benefit, index) => (
                              <li 
                                key={benefit.id || benefit.benefit_id || index} 
                                className="text-sm text-gray-800 px-2 py-1 rounded border border-gray-200 flex items-center justify-between"
                              >
                                <span>{benefit.benefitName || benefit.benefit_name}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 flex justify-end space-x-2">
                      <button
                        className="px-3 py-1 text-sm border rounded text-blue-500 hover:bg-blue-50"
                        onClick={() => setEditMembership(membership)}
                      >
                        Edit
                      </button>
                      
                      <button
                        className="px-3 py-1 text-sm border rounded text-red-500 hover:bg-red-50"
                        onClick={() => setDeleteMembershipConfirm(membership)}
                      >
                        Delete
                      </button>
                      
                      <button
                        className={`px-3 py-1 text-sm border rounded ${membership.isActive ? 'text-amber-500 hover:bg-amber-50' : 'text-green-500 hover:bg-green-50'}`}
                        onClick={() => handleUpdateMembershipStatus(membership.id, membership.isActive)}
                      >
                        {membership.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-4 text-center text-gray-500 border rounded-lg border-dashed">
                  <p>No membership types found.</p>
                  <button
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    onClick={() => setEditMembership({})} // Boş bir nesne ile düzenleyici modalını aç
                  >
                    Add New Membership Type
                  </button>
                </div>
              )}
              
              {/* Yeni Üyelik Tipi Ekleme Kartı */}
              {membershipsData.length > 0 && (
                <div className="border border-dashed rounded-lg p-4 flex items-center justify-center hover:bg-gray-50 cursor-pointer"
                  onClick={() => setEditMembership({})} // Boş bir nesne ile düzenleyici modalını aç
                >
                  <div className="text-center">
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
                      <Plus size={24} className="text-blue-500" />
                    </div>
                    <h4 className="mt-2 font-medium text-blue-500">Add New Membership Type</h4>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Benefit Types Cards */}
      <BenefitTypesList
        benefits={benefitsData}
        memberships={membershipsData}
        loading={loadingBenefits}
        onEdit={setEditBenefit}
        onDelete={setDeleteBenefitConfirm}
      />

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

      {/* Membership edit modal */}
      {editMembership && (
        <EditMembershipModal
          membership={editMembership}
          onClose={() => setEditMembership(null)}
          onSave={(data) => {
            if (Object.keys(editMembership).length === 0) {
              // Yeni ekleme
              handleUpdateMembership(null, data);
            } else {
              // Güncelleme
              handleUpdateMembership(editMembership.id, data);
            }
          }}
          isLoading={actionLoading}
        />
      )}

      {/* Membership delete confirmation modal */}
      {deleteMembershipConfirm && (
        <DeleteMembershipConfirm
          membership={deleteMembershipConfirm}
          onClose={() => setDeleteMembershipConfirm(null)}
          onConfirm={() => handleDeleteMembership(deleteMembershipConfirm.id)}
          isLoading={actionLoading}
        />
      )}

      {/* Benefit edit modal */}
      {editBenefit && (
        <EditBenefitModal
          benefit={editBenefit}
          onClose={() => setEditBenefit(null)}
          onSave={(data) => {
            const benefitId = editBenefit.id || editBenefit.benefit_id;
            if (!benefitId || Object.keys(editBenefit).length === 0) {
              // Yeni ekleme
              handleUpdateBenefit(null, data);
            } else {
              // Güncelleme
              handleUpdateBenefit(benefitId, data);
            }
          }}
          memberships={membershipsData}
          isLoading={actionLoading}
        />
      )}

      {/* Benefit delete confirmation modal */}
      {deleteBenefitConfirm && (
        <DeleteBenefitConfirm
          benefit={deleteBenefitConfirm}
          onClose={() => setDeleteBenefitConfirm(null)}
          onConfirm={() => handleDeleteBenefit(deleteBenefitConfirm.id || deleteBenefitConfirm.benefit_id)}
          isLoading={actionLoading}
        />
      )}

      {/* Assessment modals */}
      {viewAssessmentsMember && (
        <MemberAssessmentsModal
          member={viewAssessmentsMember}
          assessments={memberAssessments}
          isLoading={loadingAssessments}
          onClose={() => setViewAssessmentsMember(null)}
          onAddAssessment={setAddAssessmentMember}
          onEditAssessment={setEditAssessment}
          onDeleteAssessment={setDeleteAssessmentConfirm}
        />
      )}

      {addAssessmentMember && (
        <AddAssessmentModal
          member={addAssessmentMember}
          onClose={() => setAddAssessmentMember(null)}
          onSave={handleAddAssessment}
          isLoading={actionLoading}
        />
      )}

      {/* Yeni eklenen Değerlendirme düzenleme modalı */}
      {editAssessment && (
        <EditAssessmentModal
          assessment={editAssessment}
          onClose={() => setEditAssessment(null)}
          onSave={handleEditAssessment}
          isLoading={actionLoading}
        />
      )}

      {/* Yeni eklenen Değerlendirme silme onayı modalı */}
      {deleteAssessmentConfirm && (
        <DeleteAssessmentConfirm
          assessment={deleteAssessmentConfirm}
          onClose={() => setDeleteAssessmentConfirm(null)}
          onConfirm={handleDeleteAssessment}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default Members;