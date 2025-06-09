"use client";

import React, { useState, useEffect, useId } from "react";
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  UserPlus,
  Sparkles,
} from "lucide-react";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Loader from "@/components/common/Loader";
import MemberList from "@/components/members/MemberList";
import MemberStats from "@/components/members/MemberStats";
import EditMemberModal from "@/components/members/EditMemberModal";
import DeleteMemberConfirm from "@/components/members/DeleteMemberConfirm";
import AddMemberModal from "@/components/members/AddMemberModal";
import AssignMembershipModal from "@/components/members/AssignMembershipModal";
import MemberDetailsModal from "@/components/members/MemberDetailsModal";
import EditMembershipModal from "@/components/members/EditMembershipModal";
import DeleteMembershipConfirm from "@/components/members/DeleteMembershipConfirm";
import EditBenefitModal from "@/components/members/EditBenefitModal";
import DeleteBenefitConfirm from "@/components/members/DeleteBenefitConfirm";
import BenefitTypesList from "@/components/members/BenefitTypesList";
import MemberAssessmentsModal from "@/components/members/MemberAssessmentsModal";
import AddAssessmentModal from "@/components/members/AddAssessmentModal";
import EditAssessmentModal from "@/components/members/EditAssessmentModal";
import DeleteAssessmentConfirm from "@/components/members/DeleteAssessmentConfirm";
import { memberService } from "@/api";

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const searchInputId = useId();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

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
    averageAttendance: 0,
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
      console.log("[Members Page] Fetching all members for statistics");
      const data = await memberService.getAllMembers();

      if (data) {
        const membersArray = Array.isArray(data)
          ? data
          : data.members && Array.isArray(data.members)
          ? data.members
          : [];
        const totalCount = Array.isArray(data)
          ? data.length
          : data.totalCount || membersArray.length;

        // Calculate counts based on member status
        const activeCount = membersArray.filter(
          (member) => member.status === "active"
        ).length;
        const inactiveCount = membersArray.filter(
          (member) => member.status === "de_active"
        ).length;
        const holdCount = membersArray.filter(
          (member) => member.status === "hold_on"
        ).length;

        // Calculate new members this month
        const currentDate = new Date();
        const newMembersCount = membersArray.filter((m) => {
          const joinDate = new Date(m.joinDate);
          return (
            joinDate.getMonth() === currentDate.getMonth() &&
            joinDate.getFullYear() === currentDate.getFullYear()
          );
        }).length;

        // Update statistics
        setMemberStats({
          totalMembers: totalCount,
          activeMembers: activeCount,
          inactiveMembers: inactiveCount,
          holdMembers: holdCount,
          newMembersThisMonth: newMembersCount,
          averageAttendance: Math.round(activeCount * 0.7), // Example calculation for average attendance
        });

        console.log(
          "[Members Page] Statistics updated:",
          totalCount,
          "members"
        );
      }
    } catch (err) {
      console.error("[Members Page] Error fetching statistics data:", err);
    }
  };

  // Function to fetch membership types
  const fetchMemberships = async () => {
    setLoadingMemberships(true);
    setError(null); // Clear previous errors
    try {
      console.log("[Members Page] Fetching memberships...");
      const data = await memberService.getMemberships();
      console.log("[Members Page] Memberships fetched:", data?.length || 0);

      // Fetch benefits for all memberships
      if (Array.isArray(data) && data.length > 0) {
        const membershipsWithBenefits = await Promise.all(
          data.map(async (membership) => {
            try {
              const benefits = await memberService.getMembershipBenefits(
                membership.id
              );
              return { ...membership, benefits: benefits || [] };
            } catch (err) {
              console.error(
                `Error fetching benefits for membership ${membership.id}:`,
                err
              );
              return { ...membership, benefits: [] };
            }
          })
        );
        setMembershipsData(membershipsWithBenefits);
        console.log(
          "[Members Page] Memberships with benefits loaded:",
          membershipsWithBenefits.length
        );
      } else {
        setMembershipsData(data || []);
      }
    } catch (err) {
      console.error("Error fetching memberships:", err);
      setError(`Failed to load memberships: ${err.message || "Unknown error"}`);
      setMembershipsData([]); // Set empty array on error
    } finally {
      setLoadingMemberships(false);
    }
  };

  // Function to fetch benefit types
  const fetchBenefits = async () => {
    setLoadingBenefits(true);
    setError(null); // Clear previous errors
    try {
      console.log("[Members Page] Fetching benefits...");
      const data = await memberService.getBenefits();
      console.log("[Members Page] Benefits fetched:", data?.length || 0);
      setBenefitsData(data || []);
    } catch (err) {
      console.error("Error fetching benefits:", err);
      setError(`Failed to load benefits: ${err.message || "Unknown error"}`);
      setBenefitsData([]); // Set empty array on error
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
      console.log(
        "[Members] Assessment created for member:",
        formData.memberId
      );

      // Reload assessments
      await fetchMemberAssessments(formData.memberId);

      // Close modal
      setAddAssessmentMember(null);
    } catch (err) {
      console.error("Error creating assessment:", err);
      setError("An error occurred while creating the assessment");
    } finally {
      setActionLoading(false);
    }
  };

  // Assessment edit function
  const handleEditAssessment = async (formData) => {
    if (!formData || !formData.id) return;

    setActionLoading(true);
    try {
      await memberService.updateAssessment(formData.id, formData);
      console.log("[Members] Assessment updated:", formData.id);

      // Reload assessments to reflect changes
      await fetchMemberAssessments(formData.memberId);

      // Close modal
      setEditAssessment(null);
    } catch (err) {
      console.error("Error updating assessment:", err);
      setError("An error occurred while updating the assessment");
    } finally {
      setActionLoading(false);
    }
  };

  // Assessment delete function
  const handleDeleteAssessment = async (id) => {
    if (!id || !viewAssessmentsMember) return;

    setActionLoading(true);
    try {
      const success = await memberService.deleteAssessment(id);

      if (success) {
        console.log("[Members] Assessment deleted:", id);

        // Reload assessments to reflect changes
        await fetchMemberAssessments(viewAssessmentsMember.id);
      } else {
        setError("Failed to delete assessment");
      }

      // Close delete confirmation modal
      setDeleteAssessmentConfirm(null);
    } catch (err) {
      console.error("Error deleting assessment:", err);
      setError("An error occurred while deleting the assessment");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log(
          `[Members Page] Fetching members, page: ${currentPage}, size: ${pageSize}`
        );
        const data = await memberService.getMembers(currentPage, pageSize);

        console.log("[Members Page] API Response:", data);

        if (data) {
          let membersData = [];

          // Handle the specific API response format
          if (data.data && Array.isArray(data.data)) {
            // Pagination response format: { data: [...], page: 1, pageSize: 10, totalPages: X, totalItems: Y }
            membersData = data.data;
            setTotalPages(data.totalPages || data.total_pages || 1);
          } else if (data.members && Array.isArray(data.members)) {
            // Old format
            membersData = data.members;
            setTotalPages(data.totalPages || 1);
          } else if (Array.isArray(data)) {
            // Direct array response
            membersData = data;
            setTotalPages(Math.max(1, Math.ceil(data.length / 10)));
          } else {
            console.warn("[Members Page] Unknown API response format:", data);
            setMembers([]);
            setTotalPages(1);
            return;
          }

          // Fetch active memberships for members
          const membersWithMemberships = await Promise.all(
            membersData.map(async (member) => {
              try {
                // First, get all memberships of the member
                let memberMemberships = [];

                try {
                  memberMemberships = await memberService.getMemberMemberships(
                    member.id
                  );
                  if (!Array.isArray(memberMemberships)) {
                    console.warn(
                      `Unexpected response format for member ${member.id} memberships:`,
                      memberMemberships
                    );
                    memberMemberships = [];
                  }
                } catch (err) {
                  console.error(
                    `Error fetching memberships for member ${member.id}:`,
                    err
                  );
                  memberMemberships = [];
                }

                if (memberMemberships.length > 0) {
                  // Sort by ID (highest ID first)
                  const sortedMemberships = [...memberMemberships].sort(
                    (a, b) => b.id - a.id
                  );

                  // Get the membership with the highest ID
                  const latestMembership = sortedMemberships[0];

                  if (latestMembership) {
                    // Get details of the membership type
                    try {
                      const membershipDetails =
                        await memberService.getMembership(
                          latestMembership.membershipId
                        );
                      if (membershipDetails) {
                        member.activeMembership = {
                          ...latestMembership,
                          membershipName:
                            membershipDetails?.membershipName || "Unknown",
                          description: membershipDetails?.description || "",
                          price: membershipDetails?.price || 0,
                        };
                      }
                    } catch (err) {
                      console.error(
                        `Error fetching membership details for member ${member.id}:`,
                        err
                      );
                    }
                  }
                }

                return member;
              } catch (err) {
                console.error(`Error processing member ${member.id}:`, err);
                return member;
              }
            })
          );

          setMembers(membersWithMemberships);

          // Calculate membership distribution statistics
          const membershipColors = {
            basic: "#3B82F6", // Blue
            premium: "#8B5CF6", // Purple
            gold: "#F59E0B", // Amber
            platinum: "#6B7280", // Gray
          };

          // Count by membership type
          const membershipCounts = {};

          membersWithMemberships.forEach((member) => {
            if (member.activeMembership?.membershipName) {
              const membershipName = member.activeMembership.membershipName;

              if (!membershipCounts[membershipName]) {
                membershipCounts[membershipName] = 1;
              } else {
                membershipCounts[membershipName]++;
              }
            }
          });

          // Create membership statistics
          const membershipStatsData = Object.keys(membershipCounts).map(
            (name) => ({
              name,
              value: membershipCounts[name],
              color: membershipColors[name.toLowerCase()] || "#60A5FA",
            })
          );

          setMembershipStats(membershipStatsData);

          // Update statistics
          const activeCount = membersWithMemberships.filter(
            (member) => member.status === "active"
          ).length;
          const inactiveCount = membersWithMemberships.filter(
            (member) => member.status === "de_active"
          ).length;
          const holdCount = membersWithMemberships.filter(
            (member) => member.status === "hold_on"
          ).length;

          setMemberStats({
            totalMembers: data.totalCount || membersWithMemberships.length,
            activeMembers: activeCount,
            inactiveMembers: inactiveCount,
            holdMembers: holdCount,
            newMembersThisMonth: membersWithMemberships.filter((m) => {
              const joinDate = new Date(m.joinDate);
              const now = new Date();
              return (
                joinDate.getMonth() === now.getMonth() &&
                joinDate.getFullYear() === now.getFullYear()
              );
            }).length,
            averageAttendance: Math.round(activeCount * 0.7), // Example calculation for average attendance
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
      // Extract membership data from formData
      const { membership, ...memberData } = formData;
      
      // Create the member first
      const newMember = await memberService.createMember(memberData);
      console.log("[Members] Member added:", newMember);

      // If membership assignment is requested, assign it
      if (membership && membership.membershipId) {
        try {
          // Get membership details to calculate end date
          const membershipDetails = await memberService.getMembership(membership.membershipId);
          
          // Calculate end date based on membership duration
          const startDate = new Date(membership.startDate);
          const durationInDays = membershipDetails.duration * 30; // Assuming duration is in months
          const endDate = new Date(startDate.getTime() + (durationInDays * 24 * 60 * 60 * 1000));
          
          const membershipData = {
            memberId: newMember.id,
            membershipId: membership.membershipId,
            startDate: membership.startDate,
            endDate: endDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
            paymentStatus: membership.paymentStatus,
            contractSigned: membership.contractSigned,
          };

          console.log("[Members] Assigning membership:", membershipData);
          await memberService.assignMembershipToMember(membershipData);

          // Fetch updated member details with membership
          const updatedMemberDetails = await memberService.getMember(newMember.id);
          const membershipDetailsForDisplay = await memberService.getMembership(membership.membershipId);

          if (updatedMemberDetails && membershipDetailsForDisplay) {
            const activeMembership = {
              membershipId: membership.membershipId,
              startDate: membership.startDate,
              endDate: new Date(new Date(membership.startDate).getTime() + (membershipDetailsForDisplay.duration * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
              membershipName: membershipDetailsForDisplay.membershipName || "Unknown",
              description: membershipDetailsForDisplay.description || "",
              price: membershipDetailsForDisplay.price || 0,
            };

            newMember.activeMembership = activeMembership;
          }

          console.log("[Members] Membership assigned successfully");
        } catch (membershipErr) {
          console.error("Error assigning membership:", membershipErr);
          // Continue anyway - member was created successfully
        }
      }

      // Update state - add the new member to the list
      setMembers([newMember, ...members]);

      // Update statistics after adding a member
      fetchAndUpdateStats();

      // Close modal
      setShowAddModal(false);
    } catch (err) {
      console.error("Error adding member:", err);
      
      // Check if it's an email already exists error
      if (err.message && err.message.includes("email already exists")) {
        setError("A member with this email address already exists. Please use a different email address.");
      } else if (err.response && err.response.data && err.response.data.error === "email already exists") {
        setError("A member with this email address already exists. Please use a different email address.");
      } else {
        setError("An error occurred while adding the member");
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Member edit function
  const handleEditMember = async (formData) => {
    if (!editMember) return;

    setActionLoading(true);
    try {
      const updatedMember = await memberService.updateMember(
        editMember.id,
        formData
      );
      console.log("[Members] Member updated:", updatedMember);

      // Update state
      setMembers(
        members.map((member) =>
          member.id === updatedMember.id ? updatedMember : member
        )
      );

      // Update statistics after editing a member
      fetchAndUpdateStats();

      // Close modal
      setEditMember(null);
    } catch (err) {
      console.error("Error updating member:", err);
      setError("An error occurred while updating the member");
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
        console.log("[Members] Member deleted:", id);

        // Remove deleted member from the list
        setMembers(members.filter((member) => member.id !== id));

        // Update statistics after deleting a member
        fetchAndUpdateStats();
      } else {
        setError("Failed to delete member");
      }
    } catch (err) {
      console.error("Error deleting member:", err);
      setError("An error occurred while deleting the member");
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
      const result = await memberService.assignMembershipToMember(
        membershipData
      );
      console.log("[Members] Membership assigned:", result);

      // Fetch updated member details
      try {
        const updatedMemberDetails = await memberService.getMember(
          membershipData.memberId
        );
        const membershipDetails = await memberService.getMembership(
          membershipData.membershipId
        );

        if (updatedMemberDetails && membershipDetails) {
          const activeMembership = {
            membershipId: membershipData.membershipId,
            startDate: membershipData.startDate,
            endDate: membershipData.endDate,
            membershipName: membershipDetails.membershipName || "Unknown",
            description: membershipDetails.description || "",
            price: membershipDetails.price || 0,
          };

          setMembers((currentMembers) =>
            currentMembers.map((member) => {
              if (member.id === membershipData.memberId) {
                return { ...member, activeMembership };
              }
              return member;
            })
          );

          console.log(
            "[Members] Member list updated with new membership information"
          );
        }
      } catch (updateErr) {
        console.error(
          "Error updating member details after assignment:",
          updateErr
        );
      }

      setAssignMembershipMember(null); // Close modal
    } catch (err) {
      console.error("Error assigning membership:", err);
      setError("An error occurred while assigning membership");
    } finally {
      setActionLoading(false);
    }
  };

  // Membership delete function
  const handleDeleteMembership = async (id) => {
    setActionLoading(true);
    try {
      const result = await memberService.deleteMembershipWithBenefits(id);

      if (result.success) {
        console.log("[Members] Membership deleted:", id);

        // Update both membership types and benefit types
        await fetchMemberships();
        await fetchBenefits();

        setDeleteMembershipConfirm(null);
      } else {
        setError(result.error || "Failed to delete membership");

        if (result.error && result.error.includes("in use by members")) {
          setError(
            "This membership type is currently in use by active members and cannot be deleted. Please transfer all members to another membership type first."
          );
        }
      }
    } catch (err) {
      console.error("Error deleting membership:", err);
      setError(
        "An error occurred while deleting the membership: " + err.message
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Membership update function
  const handleUpdateMembership = async (id, data) => {
    setActionLoading(true);
    try {
      if (id) {
        await memberService.updateMembership(id, data);
        console.log("[Members] Membership updated:", id);
      } else {
        const newMembership = await memberService.createMembership(data);
        console.log("[Members] New membership created:", newMembership);
      }

      await fetchMemberships();

      setEditMembership(null);
    } catch (err) {
      console.error("Error updating/creating membership:", err);
      setError("An error occurred while updating/creating the membership");
    } finally {
      setActionLoading(false);
    }
  };

  // Update membership status function
  const handleUpdateMembershipStatus = async (id, isActive) => {
    setActionLoading(true);
    try {
      const result = await memberService.updateMembershipStatus(id, {
        isActive: !isActive,
      });

      if (result.success) {
        await fetchMemberships();
      } else {
        setError(result.error || "Failed to update membership status");
      }
    } catch (err) {
      console.error("Error updating membership status:", err);
      setError("An error occurred while updating membership status");
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
        console.log("[Members] Benefit deleted:", id);

        await fetchBenefits();
      } else {
        setError("Failed to delete benefit");
      }
    } catch (err) {
      console.error("Error deleting benefit:", err);
      setError("An error occurred while deleting the benefit");
    } finally {
      setActionLoading(false);
      setDeleteBenefitConfirm(null);
    }
  };

  // Benefit update function
  const handleUpdateBenefit = async (id, data) => {
    setActionLoading(true);
    try {
      if (id) {
        await memberService.updateBenefit(id, data);
        console.log("[Members] Benefit updated:", id);
      } else {
        const newBenefit = await memberService.createBenefit(data);
        console.log("[Members] New benefit created:", newBenefit);
      }

      // Fetch updated benefits
      await fetchBenefits();

      // Also fetch memberships to update the membership cards with latest benefit info
      await fetchMemberships();

      setEditBenefit(null);
    } catch (err) {
      console.error("Error updating/creating benefit:", err);
      setError("An error occurred while updating/creating the benefit");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && members.length === 0) {
    return <Loader message="Loading members..." />;
  }

  // Only filter by status and search term
  const filteredMembers = members.filter((member) => {
    // Debug: Log member structure
    console.log("[Members Page] Filtering member:", member);

    const firstName = member.firstName || member.first_name || "";
    const lastName = member.lastName || member.last_name || "";
    const email = member.email || "";

    const fullName = `${firstName} ${lastName}, ${email}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || member.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Modern Header Section */}
      <div className="bg-gradient-to-br from-white via-emerald-50 to-teal-50 rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-200 shadow-lg">
              <UserPlus size={32} className="text-emerald-700" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Member Management
              </h1>
              <p className="text-gray-600 mt-2 font-medium">
                Manage your fitness center members and memberships
              </p>
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                  <span>Live Updates</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {/* Enhanced Add New Member Button */}
            <button
              onClick={() => {
                setShowAddModal(true);
                setError(null); // Clear any previous errors when opening modal
              }}
              className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3"
            >
              {/* Background Animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Sparkle Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute top-2 left-3 w-1 h-1 bg-white rounded-full animate-ping"></div>
                <div
                  className="absolute top-4 right-6 w-1 h-1 bg-white rounded-full animate-ping"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="absolute bottom-3 left-6 w-1 h-1 bg-white rounded-full animate-ping"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>

              {/* Icon with Animation */}
              <div className="relative bg-white/20 rounded-full p-2 group-hover:bg-white/30 transition-all duration-300 group-hover:rotate-180">
                <UserPlus className="w-5 h-5" />
              </div>

              {/* Text */}
              <span className="relative text-lg">Add New Member</span>

              {/* Arrow Icon */}
              <div className="relative transform group-hover:translate-x-1 transition-transform duration-300">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search
                  size={18}
                  className="absolute left-3 top-2.5 text-gray-400"
                />
              </div>
              <div className="relative">
                <button
                  className="border border-gray-300 hover:bg-gray-50 p-2 rounded-md"
                  onClick={() => setFilterOpen((prev) => !prev)}
                  type="button"
                  aria-label="Filter by status"
                >
                  <Filter size={18} />
                </button>
                {filterOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-20 p-4">
                    <div className="mb-3">
                      <label className="block text-xs font-semibold mb-1">
                        Status
                      </label>
                      <select
                        className="w-full border rounded px-2 py-1 text-sm"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="">All</option>
                        <option value="active">Active</option>
                        <option value="de_active">Inactive</option>
                        <option value="hold_on">On Hold</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                        onClick={() => {
                          setFilterStatus("");
                          setFilterOpen(false);
                        }}
                        type="button"
                      >
                        Clear
                      </button>
                      <button
                        className="text-xs px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                        onClick={() => setFilterOpen(false)}
                        type="button"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
                members={filteredMembers}
                onEdit={(member) => setEditMember(member)}
                onDelete={(id) => {
                  const member = members.find((m) => m.id === id);
                  setDeleteConfirm(member);
                }}
                onAssignMembership={(member) =>
                  setAssignMembershipMember(member)
                }
                onViewDetails={(member) => setDetailsMember(member)}
                onViewAssessments={handleViewAssessments} // New assessment button click handler
              />

              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  Showing page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    className="px-3 py-1 border rounded hover:bg-gray-50"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                  >
                    Previous
                  </button>

                  {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => (
                    <button
                      key={i}
                      className={`px-3 py-1 border rounded ${
                        currentPage === i + 1
                          ? "bg-blue-50 text-blue-600"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    className="px-3 py-1 border rounded hover:bg-gray-50"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Membership Types Cards - Redesigned */}
      <Card>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Membership Types
              </h3>
              <p className="text-gray-500 mt-1">
                Manage your fitness center membership plans
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Sparkles className="w-4 h-4" />
                <span>{membershipsData.length} Plans Available</span>
              </div>

              {/* Compact Add New Membership Type Button */}
              <button
                onClick={() => setEditMembership({})}
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                {/* Background Animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Sparkle Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-1 left-2 w-1 h-1 bg-white rounded-full animate-ping"></div>
                  <div
                    className="absolute top-2 right-3 w-1 h-1 bg-white rounded-full animate-ping"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="absolute bottom-1 left-4 w-1 h-1 bg-white rounded-full animate-ping"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>

                {/* Icon with Animation */}
                <div className="relative bg-white/20 rounded-lg p-1.5 group-hover:bg-white/30 transition-all duration-300 group-hover:rotate-12">
                  <Plus className="w-4 h-4" />
                </div>

                {/* Text */}
                <span className="relative font-medium">
                  Add New Membership Type
                </span>

                {/* Arrow Icon */}
                <div className="relative transform group-hover:translate-x-0.5 transition-transform duration-300">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>

        {loadingMemberships ? (
          <div className="p-8">
            <Loader size="small" message="Loading membership types..." />
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {membershipsData.length > 0 ? (
                membershipsData.map((membership) => {
                  // Define theme colors based on membership type
                  const getThemeColors = (name) => {
                    const lowerName = name?.toLowerCase() || "";

                    // Primary tier colors
                    if (lowerName.includes("basic")) {
                      return {
                        gradient: "from-blue-500 to-blue-600",
                        bg: "bg-gradient-to-br from-blue-50 to-blue-100/50",
                        border: "border-blue-200",
                        text: "text-blue-600",
                        badge: "bg-blue-100 text-blue-700",
                        accent: "bg-blue-500",
                      };
                    } else if (lowerName.includes("premium")) {
                      return {
                        gradient: "from-purple-500 to-purple-600",
                        bg: "bg-gradient-to-br from-purple-50 to-purple-100/50",
                        border: "border-purple-200",
                        text: "text-purple-600",
                        badge: "bg-purple-100 text-purple-700",
                        accent: "bg-purple-500",
                      };
                    } else if (lowerName.includes("gold")) {
                      return {
                        gradient: "from-amber-500 to-yellow-500",
                        bg: "bg-gradient-to-br from-amber-50 to-yellow-100/50",
                        border: "border-amber-200",
                        text: "text-amber-600",
                        badge: "bg-amber-100 text-amber-700",
                        accent: "bg-amber-500",
                      };
                    } else if (lowerName.includes("platinum")) {
                      return {
                        gradient: "from-slate-600 to-slate-700",
                        bg: "bg-gradient-to-br from-slate-50 to-slate-100/50",
                        border: "border-slate-200",
                        text: "text-slate-600",
                        badge: "bg-slate-100 text-slate-700",
                        accent: "bg-slate-600",
                      };
                    }

                    // Extended color palette for new membership types
                    else if (
                      lowerName.includes("emerald") ||
                      lowerName.includes("elite") ||
                      lowerName.includes("pro")
                    ) {
                      return {
                        gradient: "from-emerald-500 to-emerald-600",
                        bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50",
                        border: "border-emerald-200",
                        text: "text-emerald-600",
                        badge: "bg-emerald-100 text-emerald-700",
                        accent: "bg-emerald-500",
                      };
                    } else if (
                      lowerName.includes("ruby") ||
                      lowerName.includes("vip") ||
                      lowerName.includes("executive")
                    ) {
                      return {
                        gradient: "from-rose-500 to-pink-500",
                        bg: "bg-gradient-to-br from-rose-50 to-pink-100/50",
                        border: "border-rose-200",
                        text: "text-rose-600",
                        badge: "bg-rose-100 text-rose-700",
                        accent: "bg-rose-500",
                      };
                    } else if (
                      lowerName.includes("sapphire") ||
                      lowerName.includes("royal") ||
                      lowerName.includes("diamond")
                    ) {
                      return {
                        gradient: "from-indigo-500 to-blue-600",
                        bg: "bg-gradient-to-br from-indigo-50 to-blue-100/50",
                        border: "border-indigo-200",
                        text: "text-indigo-600",
                        badge: "bg-indigo-100 text-indigo-700",
                        accent: "bg-indigo-500",
                      };
                    } else if (
                      lowerName.includes("teal") ||
                      lowerName.includes("aqua") ||
                      lowerName.includes("wellness")
                    ) {
                      return {
                        gradient: "from-teal-500 to-cyan-500",
                        bg: "bg-gradient-to-br from-teal-50 to-cyan-100/50",
                        border: "border-teal-200",
                        text: "text-teal-600",
                        badge: "bg-teal-100 text-teal-700",
                        accent: "bg-teal-500",
                      };
                    } else if (
                      lowerName.includes("orange") ||
                      lowerName.includes("energy") ||
                      lowerName.includes("boost")
                    ) {
                      return {
                        gradient: "from-orange-500 to-red-500",
                        bg: "bg-gradient-to-br from-orange-50 to-red-100/50",
                        border: "border-orange-200",
                        text: "text-orange-600",
                        badge: "bg-orange-100 text-orange-700",
                        accent: "bg-orange-500",
                      };
                    } else if (
                      lowerName.includes("lime") ||
                      lowerName.includes("fresh") ||
                      lowerName.includes("nature")
                    ) {
                      return {
                        gradient: "from-lime-500 to-green-500",
                        bg: "bg-gradient-to-br from-lime-50 to-green-100/50",
                        border: "border-lime-200",
                        text: "text-lime-600",
                        badge: "bg-lime-100 text-lime-700",
                        accent: "bg-lime-500",
                      };
                    } else if (
                      lowerName.includes("violet") ||
                      lowerName.includes("cosmic") ||
                      lowerName.includes("mystic")
                    ) {
                      return {
                        gradient: "from-violet-500 to-purple-600",
                        bg: "bg-gradient-to-br from-violet-50 to-purple-100/50",
                        border: "border-violet-200",
                        text: "text-violet-600",
                        badge: "bg-violet-100 text-violet-700",
                        accent: "bg-violet-500",
                      };
                    } else if (
                      lowerName.includes("fuchsia") ||
                      lowerName.includes("luxury") ||
                      lowerName.includes("exclusive")
                    ) {
                      return {
                        gradient: "from-fuchsia-500 to-pink-600",
                        bg: "bg-gradient-to-br from-fuchsia-50 to-pink-100/50",
                        border: "border-fuchsia-200",
                        text: "text-fuchsia-600",
                        badge: "bg-fuchsia-100 text-fuchsia-700",
                        accent: "bg-fuchsia-500",
                      };
                    } else if (
                      lowerName.includes("sky") ||
                      lowerName.includes("cloud") ||
                      lowerName.includes("horizon")
                    ) {
                      return {
                        gradient: "from-sky-500 to-blue-500",
                        bg: "bg-gradient-to-br from-sky-50 to-blue-100/50",
                        border: "border-sky-200",
                        text: "text-sky-600",
                        badge: "bg-sky-100 text-sky-700",
                        accent: "bg-sky-500",
                      };
                    } else if (
                      lowerName.includes("bronze") ||
                      lowerName.includes("copper") ||
                      lowerName.includes("starter")
                    ) {
                      return {
                        gradient: "from-amber-600 to-orange-600",
                        bg: "bg-gradient-to-br from-amber-50 to-orange-100/50",
                        border: "border-amber-300",
                        text: "text-amber-700",
                        badge: "bg-amber-100 text-amber-800",
                        accent: "bg-amber-600",
                      };
                    } else if (
                      lowerName.includes("silver") ||
                      lowerName.includes("steel") ||
                      lowerName.includes("standard")
                    ) {
                      return {
                        gradient: "from-gray-400 to-slate-500",
                        bg: "bg-gradient-to-br from-gray-50 to-slate-100/50",
                        border: "border-gray-300",
                        text: "text-gray-600",
                        badge: "bg-gray-100 text-gray-700",
                        accent: "bg-gray-400",
                      };
                    } else if (
                      lowerName.includes("rainbow") ||
                      lowerName.includes("ultimate") ||
                      lowerName.includes("supreme")
                    ) {
                      return {
                        gradient: "from-pink-500 via-purple-500 to-indigo-500",
                        bg: "bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100/50",
                        border: "border-pink-200",
                        text: "text-purple-600",
                        badge:
                          "bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700",
                        accent: "bg-gradient-to-r from-pink-500 to-purple-500",
                      };
                    }

                    // Dynamic color assignment based on name hash for truly unique colors
                    else {
                      const colorPalettes = [
                        {
                          gradient: "from-green-500 to-emerald-600",
                          bg: "bg-gradient-to-br from-green-50 to-emerald-100/50",
                          border: "border-green-200",
                          text: "text-green-600",
                          badge: "bg-green-100 text-green-700",
                          accent: "bg-green-500",
                        },
                        {
                          gradient: "from-red-500 to-rose-600",
                          bg: "bg-gradient-to-br from-red-50 to-rose-100/50",
                          border: "border-red-200",
                          text: "text-red-600",
                          badge: "bg-red-100 text-red-700",
                          accent: "bg-red-500",
                        },
                        {
                          gradient: "from-yellow-500 to-amber-600",
                          bg: "bg-gradient-to-br from-yellow-50 to-amber-100/50",
                          border: "border-yellow-200",
                          text: "text-yellow-600",
                          badge: "bg-yellow-100 text-yellow-700",
                          accent: "bg-yellow-500",
                        },
                        {
                          gradient: "from-pink-500 to-rose-600",
                          bg: "bg-gradient-to-br from-pink-50 to-rose-100/50",
                          border: "border-pink-200",
                          text: "text-pink-600",
                          badge: "bg-pink-100 text-pink-700",
                          accent: "bg-pink-500",
                        },
                        {
                          gradient: "from-cyan-500 to-blue-600",
                          bg: "bg-gradient-to-br from-cyan-50 to-blue-100/50",
                          border: "border-cyan-200",
                          text: "text-cyan-600",
                          badge: "bg-cyan-100 text-cyan-700",
                          accent: "bg-cyan-500",
                        },
                        {
                          gradient: "from-stone-500 to-neutral-600",
                          bg: "bg-gradient-to-br from-stone-50 to-neutral-100/50",
                          border: "border-stone-200",
                          text: "text-stone-600",
                          badge: "bg-stone-100 text-stone-700",
                          accent: "bg-stone-500",
                        },
                        {
                          gradient: "from-zinc-500 to-gray-600",
                          bg: "bg-gradient-to-br from-zinc-50 to-gray-100/50",
                          border: "border-zinc-200",
                          text: "text-zinc-600",
                          badge: "bg-zinc-100 text-zinc-700",
                          accent: "bg-zinc-500",
                        },
                      ];

                      // Create a simple hash from the membership name
                      let hash = 0;
                      for (let i = 0; i < lowerName.length; i++) {
                        const char = lowerName.charCodeAt(i);
                        hash = (hash << 5) - hash + char;
                        hash = hash & hash; // Convert to 32-bit integer
                      }

                      // Use hash to select a color palette
                      const paletteIndex =
                        Math.abs(hash) % colorPalettes.length;
                      return colorPalettes[paletteIndex];
                    }
                  };

                  const theme = getThemeColors(membership.membershipName);

                  return (
                    <div
                      key={membership.id}
                      className={`group relative overflow-hidden rounded-2xl ${theme.bg} ${theme.border} border-2 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-out`}
                    >
                      {/* Accent Border */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.gradient}`}
                      ></div>

                      {/* Content */}
                      <div className="p-6 relative">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-xl font-bold text-gray-900 mb-1">
                              {membership.membershipName}
                            </h4>
                            <div className="flex items-center space-x-2">
                              {membership.isActive ? (
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${theme.badge} ring-1 ring-inset ring-current/20`}
                                >
                                  <div
                                    className={`w-1.5 h-1.5 ${theme.accent} rounded-full mr-1.5`}
                                  ></div>
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200">
                                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5"></div>
                                  Inactive
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Premium Badge for higher tier plans */}
                          {(membership.membershipName
                            ?.toLowerCase()
                            .includes("premium") ||
                            membership.membershipName
                              ?.toLowerCase()
                              .includes("gold") ||
                            membership.membershipName
                              ?.toLowerCase()
                              .includes("platinum")) && (
                            <div
                              className={`relative ${theme.accent} rounded-full p-2 opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
                            >
                              <Sparkles className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                          {membership.description ||
                            "Premium fitness membership with exclusive benefits"}
                        </p>

                        {/* Duration and Price */}
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/20">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Duration
                              </span>
                              <p className="text-lg font-bold text-gray-900">
                                {membership.duration} month
                                {membership.duration !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Price
                              </span>
                              <p className={`text-2xl font-bold ${theme.text}`}>
                                ${membership.price}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Benefits */}
                        {membership.benefits &&
                          membership.benefits.length > 0 && (
                            <div className="mb-6">
                              <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                <div
                                  className={`w-3 h-3 ${theme.accent} rounded-full mr-2`}
                                ></div>
                                Benefits
                              </h5>
                              <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                                {membership.benefits.map((benefit, index) => (
                                  <div
                                    key={
                                      benefit.id || benefit.benefit_id || index
                                    }
                                    className="flex items-center space-x-2 text-sm"
                                  >
                                    <div
                                      className={`w-1.5 h-1.5 ${theme.accent} rounded-full flex-shrink-0`}
                                    ></div>
                                    <span className="text-gray-700 font-medium">
                                      {benefit.benefitName ||
                                        benefit.benefit_name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          <button
                            className={`flex-1 min-w-[80px] px-3 py-2 text-sm font-medium rounded-lg border-2 ${theme.border} ${theme.text} hover:bg-white/80 hover:shadow-md transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-1`}
                            onClick={() => setEditMembership(membership)}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            <span>Edit</span>
                          </button>

                          <button
                            className="flex-1 min-w-[80px] px-3 py-2 text-sm font-medium rounded-lg border-2 border-red-200 text-red-600 hover:bg-red-50 hover:shadow-md transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-1"
                            onClick={() =>
                              setDeleteMembershipConfirm(membership)
                            }
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            <span>Delete</span>
                          </button>

                          <button
                            className={`flex-1 min-w-[100px] px-3 py-2 text-sm font-medium rounded-lg border-2 ${
                              membership.isActive
                                ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                                : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                            } hover:shadow-md transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-1`}
                            onClick={() =>
                              handleUpdateMembershipStatus(
                                membership.id,
                                membership.isActive
                              )
                            }
                          >
                            {membership.isActive ? (
                              <>
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span>Deactivate</span>
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-10h10a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z"
                                  />
                                </svg>
                                <span>Activate</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Hover Glow Effect */}
                      <div
                        className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${theme.gradient} transition-opacity duration-300 pointer-events-none`}
                      ></div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full">
                  <div className="text-center py-12 px-6 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                      <Plus className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No membership types found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Create your first membership plan to get started
                    </p>
                    <button
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 space-x-2"
                      onClick={() => setEditMembership({})}
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add New Membership Type</span>
                    </button>
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
          onClose={() => {
            setShowAddModal(false);
            setError(null); // Clear error when modal closes
          }}
          onSave={handleAddMember}
          isLoading={actionLoading}
          error={error}
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
              handleUpdateMembership(null, data);
            } else {
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
              handleUpdateBenefit(null, data);
            } else {
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
          onConfirm={() =>
            handleDeleteBenefit(
              deleteBenefitConfirm.id || deleteBenefitConfirm.benefit_id
            )
          }
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

      {/* Edit Assessment Modal */}
      {editAssessment && (
        <EditAssessmentModal
          assessment={editAssessment}
          onClose={() => setEditAssessment(null)}
          onSave={handleEditAssessment}
          isLoading={actionLoading}
        />
      )}

      {/* Delete Assessment Confirmation Modal */}
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
