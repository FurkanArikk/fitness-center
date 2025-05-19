import React, { useState, useEffect } from 'react';
import { Calendar, Info } from 'lucide-react';
import { memberService } from '@/api';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

const AssignMembershipModal = ({ member, onClose, onSave, isLoading }) => {
  const [memberships, setMemberships] = useState([]);
  const [loadingMemberships, setLoadingMemberships] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [membershipBenefits, setMembershipBenefits] = useState([]);
  const [loadingBenefits, setLoadingBenefits] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [contractSigned, setContractSigned] = useState(true);
  const [errors, setErrors] = useState({});
  
  // Üyelikleri yükle
  useEffect(() => {
    const fetchMemberships = async () => {
      setLoadingMemberships(true);
      try {
        // Sadece aktif üyelikleri yükle
        const data = await memberService.getMemberships(true);
        if (Array.isArray(data)) {
          setMemberships(data);
          // Varsayılan olarak ilk üyeliği seç
          if (data.length > 0) {
            setSelectedMembership(data[0].id);
            fetchMembershipBenefits(data[0].id);
          }
        }
      } catch (error) {
        console.error("Error loading memberships:", error);
      } finally {
        setLoadingMemberships(false);
      }
    };
    
    fetchMemberships();
  }, []);
  
  // Seçilen üyeliğin faydalarını yükle
  const fetchMembershipBenefits = async (membershipId) => {
    if (!membershipId) return;
    
    setLoadingBenefits(true);
    try {
      const benefits = await memberService.getMembershipBenefits(membershipId);
      setMembershipBenefits(benefits);
    } catch (error) {
      console.error(`Error loading benefits for membership ${membershipId}:`, error);
    } finally {
      setLoadingBenefits(false);
    }
  };
  
  // Üyelik seçildiğinde faydaları yükle
  const handleMembershipChange = (id) => {
    setSelectedMembership(id);
    fetchMembershipBenefits(id);
    
    if (errors.membership) {
      setErrors({...errors, membership: ''});
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedMembership) newErrors.membership = 'Please select a membership plan';
    if (!startDate) newErrors.startDate = 'Start date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const selectedPlan = memberships.find(m => m.id === selectedMembership);
      
      // Başlangıç tarihine ve süreye göre bitiş tarihini hesapla
      const start = new Date(startDate);
      const end = new Date(start);
      end.setMonth(end.getMonth() + (selectedPlan?.duration || 1));
      
      const membershipData = {
        memberId: member.id,
        membershipId: selectedMembership,
        startDate,
        endDate: end.toISOString().split('T')[0],
        paymentMethod,
        paymentStatus: paymentMethod === 'cash' ? 'paid' : 'pending',
        contractSigned: true
      };
      
      console.log('Sending membership data:', membershipData);
      onSave(membershipData);
    }
  };
  
  // Seçilen üyelik planını bul
  const getSelectedMembershipDetails = () => {
    return memberships.find(m => m.id === selectedMembership);
  };
  
  const selectedPlan = getSelectedMembershipDetails();
  
  return (
    <Modal
      title={`Assign Membership to ${member ? `${member.firstName} ${member.lastName}` : 'Member'}`}
      onClose={onClose}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {loadingMemberships ? (
          <div className="text-center py-4">
            <p>Loading membership plans...</p>
          </div>
        ) : memberships.length === 0 ? (
          <div className="bg-amber-50 p-4 rounded-md text-amber-700">
            <div className="flex items-start">
              <Info size={20} className="mr-2 mt-0.5" />
              <div>
                <p className="font-medium">No active membership plans available</p>
                <p className="text-sm mt-1">Please create a membership plan before assigning to members.</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Membership Plan *
              </label>
              <select
                className={`w-full p-2 border rounded-md ${
                  errors.membership ? 'border-red-500' : 'border-gray-300'
                }`}
                value={selectedMembership || ''}
                onChange={(e) => handleMembershipChange(parseInt(e.target.value))}
              >
                {memberships.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.membershipName} - ${plan.price} / {plan.duration} month{plan.duration !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>
              {errors.membership && (
                <p className="mt-1 text-sm text-red-600">{errors.membership}</p>
              )}
            </div>
            
            {selectedPlan && (
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="font-medium text-gray-700">Selected Plan Details</h4>
                <div className="mt-2 text-sm">
                  <p><span className="font-medium">Name:</span> {selectedPlan.membershipName}</p>
                  <p><span className="font-medium">Duration:</span> {selectedPlan.duration} month{selectedPlan.duration !== 1 ? 's' : ''}</p>
                  <p><span className="font-medium">Price:</span> ${selectedPlan.price}</p>
                  {selectedPlan.description && (
                    <p><span className="font-medium">Description:</span> {selectedPlan.description}</p>
                  )}
                  
                  {/* Membership benefits */}
                  {loadingBenefits ? (
                    <p className="mt-2 text-gray-500">Loading benefits...</p>
                  ) : membershipBenefits?.length > 0 ? (
                    <div className="mt-3">
                      <h5 className="font-medium text-gray-700">Benefits:</h5>
                      <ul className="list-disc pl-5 mt-1">
                        {membershipBenefits.map((benefit) => (
                          <li key={benefit.id}>
                            <span className="font-medium">{benefit.benefitName}:</span> {benefit.benefitDescription}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full p-2 pl-9 border rounded-md ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <Calendar size={18} className="absolute left-3 top-3 text-gray-400" />
              </div>
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                id="contractSigned"
                type="checkbox"
                checked={contractSigned}
                onChange={(e) => setContractSigned(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="contractSigned" className="ml-2 block text-sm text-gray-700">
                Contract signed
              </label>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Assign Membership'}
              </button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
};

export default AssignMembershipModal;
