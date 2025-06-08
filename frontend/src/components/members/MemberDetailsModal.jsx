import React, { useState, useEffect } from "react";
import {
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Shield,
  Award,
  Activity,
  Trash2,
  User,
  CreditCard,
  Check,
  AlertCircle,
  Users,
} from "lucide-react";
import { formatDate } from "../../utils/formatters";
import { memberService } from "@/api";
import StatusBadge from "../common/StatusBadge";
import DeleteMemberMembershipConfirm from "./DeleteMemberMembershipConfirm";

const MemberDetailsModal = ({ member, onClose }) => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [membershipDetails, setMembershipDetails] = useState({});
  const [deleteMembershipConfirm, setDeleteMembershipConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generate avatar for member
  const getAvatarData = () => {
    const firstName = member?.firstName || "";
    const lastName = member?.lastName || "";
    const initials = `${firstName.charAt(0)}${lastName.charAt(
      0
    )}`.toUpperCase();
    const colors = [
      "bg-gradient-to-br from-blue-400 to-blue-600",
      "bg-gradient-to-br from-green-400 to-green-600",
      "bg-gradient-to-br from-purple-400 to-purple-600",
      "bg-gradient-to-br from-pink-400 to-pink-600",
    ];
    const colorIndex =
      (firstName.charCodeAt(0) + lastName.charCodeAt(0)) % colors.length;
    return { initials, color: colors[colorIndex] };
  };

  const avatarData = getAvatarData();

  const fetchMemberMemberships = async () => {
    if (member?.id) {
      setLoading(true);
      try {
        const membershipList = await memberService.getMemberMemberships(
          member.id
        );
        console.log("[MemberDetails] Member memberships:", membershipList);

        if (Array.isArray(membershipList) && membershipList.length > 0) {
          setMemberships(membershipList);

          const membershipDetailsMap = {};
          for (const membership of membershipList) {
            try {
              const details = await memberService.getMembership(
                membership.membershipId
              );
              if (details) {
                membershipDetailsMap[membership.membershipId] = details;
              }
            } catch (err) {
              console.error(
                `Failed to fetch details for membership ${membership.membershipId}:`,
                err
              );
            }
          }
          setMembershipDetails(membershipDetailsMap);
        } else {
          setMemberships([]);
          setMembershipDetails({});
        }
      } catch (error) {
        console.error("Error fetching member's memberships:", error);
        setError("Failed to load membership information");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchMemberMemberships();
  }, [member]);

  const handleDeleteMembership = async (memberMembershipId) => {
    setActionLoading(true);
    try {
      const success = await memberService.deleteMemberMembership(
        memberMembershipId
      );
      if (success) {
        console.log(
          `[MemberDetails] Member membership deleted: ${memberMembershipId}`
        );
        await fetchMemberMemberships();
        setDeleteMembershipConfirm(null);
      } else {
        setError("Failed to delete membership");
      }
    } catch (err) {
      console.error("Error deleting member membership:", err);
      setError("An error occurred while deleting the membership");
    } finally {
      setActionLoading(false);
    }
  };

  // Get membership badge styling
  const getMembershipBadgeClass = (membershipName) => {
    const name = membershipName?.toLowerCase() || "";
    if (name.includes("basic"))
      return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200";
    if (name.includes("premium"))
      return "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-200";
    if (name.includes("gold"))
      return "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border border-amber-200";
    if (name.includes("platinum"))
      return "bg-gradient-to-r from-gray-700 to-gray-800 text-gray-100 border border-gray-600";
    return "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-200";
  };

  if (!member) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`w-16 h-16 rounded-full ${avatarData.color} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
              >
                {avatarData.initials}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <User className="w-6 h-6 mr-2 text-blue-600" />
                  Member Profile
                </h3>
                <p className="text-gray-600 font-medium">
                  {member.firstName} {member.lastName} - ID #{member.id}
                </p>
              </div>
            </div>
            <button
              className="group p-3 hover:bg-white hover:shadow-md rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200"
              onClick={onClose}
            >
              <X
                size={24}
                className="text-gray-500 group-hover:text-gray-700 group-hover:scale-110 transition-all duration-200"
              />
            </button>
          </div>
        </div>

        <div className="p-8 max-h-[75vh] overflow-y-auto space-y-8">
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 p-4 rounded-2xl">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <div>
                  <p className="font-bold text-red-800">Error</p>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Personal Information */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100">
            <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Personal Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center mb-2">
                  <User className="w-4 h-4 text-gray-500 mr-2" />
                  <p className="text-sm font-bold text-gray-600">Full Name</p>
                </div>
                <p className="font-bold text-gray-800 text-lg">
                  {member.firstName} {member.lastName}
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center mb-2">
                  <Shield className="w-4 h-4 text-gray-500 mr-2" />
                  <p className="text-sm font-bold text-gray-600">
                    Member Status
                  </p>
                </div>
                <StatusBadge status={member.status} />
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center mb-2">
                  <Mail className="w-4 h-4 text-gray-500 mr-2" />
                  <p className="text-sm font-bold text-gray-600">
                    Email Address
                  </p>
                </div>
                <p className="font-medium text-gray-800">
                  {member.email || "Not provided"}
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center mb-2">
                  <Phone className="w-4 h-4 text-gray-500 mr-2" />
                  <p className="text-sm font-bold text-gray-600">
                    Phone Number
                  </p>
                </div>
                <p className="font-medium text-gray-800">
                  {member.phone || "Not provided"}
                </p>
              </div>

              {member.address && (
                <div className="bg-white rounded-xl p-4 shadow-sm md:col-span-2">
                  <div className="flex items-center mb-2">
                    <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                    <p className="text-sm font-bold text-gray-600">Address</p>
                  </div>
                  <p className="font-medium text-gray-800">{member.address}</p>
                </div>
              )}

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center mb-2">
                  <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                  <p className="text-sm font-bold text-gray-600">
                    Date of Birth
                  </p>
                </div>
                <p className="font-medium text-gray-800">
                  {member.dateOfBirth
                    ? formatDate(member.dateOfBirth)
                    : "Not provided"}
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center mb-2">
                  <Clock className="w-4 h-4 text-gray-500 mr-2" />
                  <p className="text-sm font-bold text-gray-600">Join Date</p>
                </div>
                <p className="font-medium text-gray-800">
                  {formatDate(member.joinDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          {(member.emergencyContactName || member.emergencyContactPhone) && (
            <div className="bg-gradient-to-r from-gray-50 to-red-50 rounded-2xl p-6 border border-gray-100">
              <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Users className="w-5 h-5 mr-2 text-red-600" />
                Emergency Contact
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {member.emergencyContactName && (
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center mb-2">
                      <User className="w-4 h-4 text-gray-500 mr-2" />
                      <p className="text-sm font-bold text-gray-600">
                        Contact Name
                      </p>
                    </div>
                    <p className="font-medium text-gray-800">
                      {member.emergencyContactName}
                    </p>
                  </div>
                )}
                {member.emergencyContactPhone && (
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center mb-2">
                      <Phone className="w-4 h-4 text-gray-500 mr-2" />
                      <p className="text-sm font-bold text-gray-600">
                        Contact Phone
                      </p>
                    </div>
                    <p className="font-medium text-gray-800">
                      {member.emergencyContactPhone}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Membership Information */}
          <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl p-6 border border-gray-100">
            <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Award className="w-5 h-5 mr-2 text-green-600" />
              Membership Information
            </h4>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">
                  Loading membership details...
                </p>
              </div>
            ) : memberships.length > 0 ? (
              <div className="space-y-6">
                {memberships.map((membership) => {
                  const membershipDetail =
                    membershipDetails[membership.membershipId];
                  const isActive = new Date(membership.endDate) >= new Date();

                  return (
                    <div
                      key={membership.id}
                      className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-200 ${
                        isActive
                          ? "border-green-200 shadow-green-100"
                          : "border-gray-200 shadow-gray-100"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              isActive ? "bg-green-100" : "bg-gray-100"
                            }`}
                          >
                            <CreditCard
                              className={`w-6 h-6 ${
                                isActive ? "text-green-600" : "text-gray-500"
                              }`}
                            />
                          </div>
                          <div>
                            <h5 className="font-bold text-lg text-gray-800 flex items-center">
                              {membershipDetail?.membershipName && (
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold mr-3 ${getMembershipBadgeClass(
                                    membershipDetail.membershipName
                                  )}`}
                                >
                                  ⭐ {membershipDetail.membershipName}
                                </span>
                              )}
                            </h5>
                            <p className="text-sm text-gray-500">
                              Membership ID: {membership.id}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span
                            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                              isActive
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-gray-100 text-gray-800 border border-gray-200"
                            }`}
                          >
                            {isActive ? (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <Clock className="w-4 h-4 mr-1" />
                                Expired
                              </>
                            )}
                          </span>
                          <button
                            className="group p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all duration-200 border border-transparent hover:border-red-200"
                            onClick={() =>
                              setDeleteMembershipConfirm(membership)
                            }
                            title="Delete Membership"
                          >
                            <Trash2 className="w-5 h-5 group-hover:scale-110 transition-all duration-200" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-blue-50 rounded-xl p-3">
                          <div className="flex items-center mb-1">
                            <Calendar className="w-4 h-4 text-blue-600 mr-1" />
                            <p className="text-xs font-bold text-blue-700">
                              Start Date
                            </p>
                          </div>
                          <p className="font-bold text-blue-800">
                            {formatDate(membership.startDate)}
                          </p>
                        </div>
                        <div className="bg-orange-50 rounded-xl p-3">
                          <div className="flex items-center mb-1">
                            <Calendar className="w-4 h-4 text-orange-600 mr-1" />
                            <p className="text-xs font-bold text-orange-700">
                              End Date
                            </p>
                          </div>
                          <p className="font-bold text-orange-800">
                            {formatDate(membership.endDate)}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3">
                          <div className="flex items-center mb-1">
                            <CreditCard className="w-4 h-4 text-green-600 mr-1" />
                            <p className="text-xs font-bold text-green-700">
                              Payment
                            </p>
                          </div>
                          <p
                            className={`font-bold ${
                              membership.paymentStatus === "paid"
                                ? "text-green-800"
                                : "text-amber-800"
                            }`}
                          >
                            {membership.paymentStatus === "paid"
                              ? "✅ Paid"
                              : "⏳ Pending"}
                          </p>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-3">
                          <div className="flex items-center mb-1">
                            <Shield className="w-4 h-4 text-purple-600 mr-1" />
                            <p className="text-xs font-bold text-purple-700">
                              Contract
                            </p>
                          </div>
                          <p className="font-bold text-purple-800">
                            {membership.contractSigned
                              ? "✅ Signed"
                              : "❌ Not Signed"}
                          </p>
                        </div>
                      </div>

                      {membershipDetail && (
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                          {membershipDetail.description && (
                            <div className="mb-3">
                              <p className="text-sm font-bold text-gray-600 mb-1">
                                Description
                              </p>
                              <p className="text-sm text-gray-700">
                                {membershipDetail.description}
                              </p>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-bold text-gray-600">
                                Duration
                              </p>
                              <p className="font-bold text-gray-800 flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {membershipDetail.duration} month
                                {membershipDetail.duration !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-600">
                                Price
                              </p>
                              <p className="font-bold text-green-600 text-lg flex items-center">
                                💰 ${membershipDetail.price}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium text-lg">
                  No Active Memberships
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  This member doesn't have any memberships assigned yet.
                </p>
              </div>
            )}
          </div>

          {/* Notes & Health Information */}
          {member.notes && (
            <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl p-6 border border-gray-100">
              <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-purple-600" />
                Notes & Health Information
              </h4>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <p className="text-gray-700 leading-relaxed">{member.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={onClose}
            >
              Close Profile
            </button>
          </div>
        </div>
      </div>

      {deleteMembershipConfirm && (
        <DeleteMemberMembershipConfirm
          memberMembership={deleteMembershipConfirm}
          membershipDetails={
            membershipDetails[deleteMembershipConfirm.membershipId]
          }
          onClose={() => setDeleteMembershipConfirm(null)}
          onConfirm={() => handleDeleteMembership(deleteMembershipConfirm.id)}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default MemberDetailsModal;
