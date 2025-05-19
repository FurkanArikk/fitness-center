import React, { useState, useEffect } from 'react';
import { X, Phone, Mail, MapPin, Calendar, Clock, Shield, Award, Activity, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { memberService } from '@/api';
import StatusBadge from '../common/StatusBadge';
import DeleteMemberMembershipConfirm from './DeleteMemberMembershipConfirm';

const MemberDetailsModal = ({ member, onClose }) => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [membershipDetails, setMembershipDetails] = useState({});
  const [deleteMembershipConfirm, setDeleteMembershipConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchMemberMemberships = async () => {
    if (member?.id) {
      setLoading(true);
      try {
        const membershipList = await memberService.getMemberMemberships(member.id);
        console.log('[MemberDetails] Member memberships:', membershipList);
        
        if (Array.isArray(membershipList) && membershipList.length > 0) {
          setMemberships(membershipList);
          
          const membershipDetailsMap = {};
          for (const membership of membershipList) {
            try {
              const details = await memberService.getMembership(membership.membershipId);
              if (details) {
                membershipDetailsMap[membership.membershipId] = details;
              }
            } catch (err) {
              console.error(`Failed to fetch details for membership ${membership.membershipId}:`, err);
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
      const success = await memberService.deleteMemberMembership(memberMembershipId);
      if (success) {
        console.log(`[MemberDetails] Member membership deleted: ${memberMembershipId}`);
        await fetchMemberMemberships();
        setDeleteMembershipConfirm(null);
      } else {
        setError("Failed to delete membership");
      }
    } catch (err) {
      console.error('Error deleting member membership:', err);
      setError('An error occurred while deleting the membership');
    } finally {
      setActionLoading(false);
    }
  };

  if (!member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
          <h3 className="text-xl font-semibold">Member Details</h3>
          <button 
            className="p-1 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}
          
          <div className="mb-6">
            <h4 className="text-lg font-medium border-b pb-2 mb-3">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{member.firstName} {member.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member ID</p>
                <p className="font-medium">#{member.id}</p>
              </div>
              <div className="flex items-start gap-2">
                <Mail size={16} className="text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{member.email || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone size={16} className="text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{member.phone || 'Not provided'}</p>
                </div>
              </div>
              {member.address && (
                <div className="flex items-start gap-2 col-span-2">
                  <MapPin size={16} className="text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{member.address}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2">
                <Calendar size={16} className="text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">{member.dateOfBirth ? formatDate(member.dateOfBirth) : 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock size={16} className="text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Join Date</p>
                  <p className="font-medium">{formatDate(member.joinDate)}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="text-lg font-medium border-b pb-2 mb-3">Status & Emergency Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Shield size={16} className="text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Member Status</p>
                  <div className="mt-1">
                    <StatusBadge status={member.status} />
                  </div>
                </div>
              </div>
              
              {(member.emergencyContactName || member.emergencyContactPhone) && (
                <div className="flex items-start gap-2">
                  <Phone size={16} className="text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Emergency Contact</p>
                    <p className="font-medium">
                      {member.emergencyContactName || 'Not provided'} 
                      {member.emergencyContactPhone && ` - ${member.emergencyContactPhone}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="text-lg font-medium border-b pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-gray-700" />
                <span>Membership Information</span>
              </div>
            </h4>
            
            {loading ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Loading membership details...</p>
              </div>
            ) : memberships.length > 0 ? (
              <div className="space-y-4">
                {memberships.map(membership => {
                  const membershipDetail = membershipDetails[membership.membershipId];
                  const isActive = new Date(membership.endDate) >= new Date();
                  
                  return (
                    <div 
                      key={membership.id} 
                      className={`p-4 rounded-md ${isActive ? 'bg-blue-50' : 'bg-gray-50'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium flex items-center">
                            {membershipDetail?.membershipName || `Membership #${membership.membershipId}`}
                          </h5>
                          <p className="text-sm text-gray-600">
                            ID: {membership.id}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {isActive ? 'Active' : 'Expired'}
                          </span>
                          <button 
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            onClick={() => setDeleteMembershipConfirm(membership)}
                            title="Delete Membership"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div>
                          <p className="text-sm text-gray-500">Start Date</p>
                          <p className="font-medium">{formatDate(membership.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">End Date</p>
                          <p className="font-medium">{formatDate(membership.endDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Payment Status</p>
                          <p className={`font-medium ${
                            membership.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'
                          }`}>
                            {membership.paymentStatus.charAt(0).toUpperCase() + membership.paymentStatus.slice(1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Contract</p>
                          <p className="font-medium">
                            {membership.contractSigned ? 'Signed' : 'Not Signed'}
                          </p>
                        </div>
                      </div>
                      
                      {membershipDetail && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          {membershipDetail.description && (
                            <div className="mb-2">
                              <p className="text-sm text-gray-500">Description</p>
                              <p className="text-sm">{membershipDetail.description}</p>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <div>
                              <p className="text-sm text-gray-500">Duration</p>
                              <p className="font-medium">{membershipDetail.duration} month{membershipDetail.duration !== 1 ? 's' : ''}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Price</p>
                              <p className="font-medium">${membershipDetail.price}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No memberships found for this member.</p>
              </div>
            )}
          </div>
          
          {member.notes && (
            <div className="mb-6">
              <h4 className="text-lg font-medium border-b pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-gray-700" />
                  <span>Notes & Health Information</span>
                </div>
              </h4>
              <div className="bg-gray-50 p-4 rounded-md">
                <p>{member.notes}</p>
              </div>
            </div>
          )}
          
          <div className="flex justify-end mt-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
      
      {deleteMembershipConfirm && (
        <DeleteMemberMembershipConfirm
          memberMembership={deleteMembershipConfirm}
          membershipDetails={membershipDetails[deleteMembershipConfirm.membershipId]}
          onClose={() => setDeleteMembershipConfirm(null)}
          onConfirm={() => handleDeleteMembership(deleteMembershipConfirm.id)}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default MemberDetailsModal;
