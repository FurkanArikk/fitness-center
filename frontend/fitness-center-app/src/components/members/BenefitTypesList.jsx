import React, { useState } from 'react';
import { Plus, Filter, ChevronDown } from 'lucide-react';
import Card from '../common/Card';
import Loader from '../common/Loader';

const BenefitTypesList = ({ 
  benefits = [], 
  memberships = [], 
  loading, 
  onEdit, 
  onDelete 
}) => {
  // Filtreleme için state
  const [selectedMembershipId, setSelectedMembershipId] = useState('all');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  // Filtrelenmiş benefit'leri hesaplama
  const filteredBenefits = selectedMembershipId === 'all' 
    ? benefits 
    : benefits.filter(benefit => {
        const benefitMembershipId = benefit.membershipId || benefit.membership_id;
        return benefitMembershipId === parseInt(selectedMembershipId);
      });
  
  // Filtre menü butonunu render etme
  const renderFilterButton = () => {
    // Seçilen membership'in adını bulma
    const selectedMembership = memberships.find(m => m.id === parseInt(selectedMembershipId));
    const buttonLabel = selectedMembershipId === 'all' 
      ? "All" 
      : selectedMembership?.membershipName || "Selected Membership";

    return (
      <div className="relative">
        <button
          className="flex items-center space-x-1 px-3 py-2 border rounded-md hover:bg-gray-50"
          onClick={() => setFilterMenuOpen(!filterMenuOpen)}
        >
          <Filter size={16} />
          <span>{buttonLabel}</span>
          <ChevronDown size={14} />
        </button>
        
        {filterMenuOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white shadow-lg border rounded-md z-20 min-w-[200px]">
            <button
              className={`block w-full text-left px-4 py-2 hover:bg-gray-50 
                ${selectedMembershipId === 'all' ? 'bg-blue-50 text-blue-600' : ''}`}
              onClick={() => {
                setSelectedMembershipId('all');
                setFilterMenuOpen(false);
              }}
            >
              All
            </button>
            
            {memberships.map(membership => (
              <button
                key={membership.id}
                className={`block w-full text-left px-4 py-2 hover:bg-gray-50 
                  ${selectedMembershipId === membership.id ? 'bg-blue-50 text-blue-600' : ''}`}
                onClick={() => {
                  setSelectedMembershipId(membership.id);
                  setFilterMenuOpen(false);
                }}
              >
                {membership.membershipName}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card 
      title="Benefit Types"
      headerContent={renderFilterButton()}
    >
      {loading ? (
        <div className="p-4">
          <Loader size="small" message="Loading benefit types..." />
        </div>
      ) : (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBenefits.length > 0 ? (
              filteredBenefits.map(benefit => {
                // İlgili membership'i bulalım
                const benefitMembershipId = benefit.membershipId || benefit.membership_id;
                const relatedMembership = memberships.find(m => m.id === benefitMembershipId);
                const membershipName = relatedMembership ? relatedMembership.membershipName : `Membership #${benefitMembershipId}`;
                
                return (
                  <div 
                    key={benefit.id || benefit.benefit_id} 
                    className="border rounded-lg shadow p-4 border-indigo-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-medium">{benefit.benefitName || benefit.benefit_name}</h4>
                      {benefitMembershipId && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {membershipName}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      <p className="text-gray-600 text-sm">
                        {benefit.benefitDescription || benefit.benefit_description || 'No description'}
                      </p>
                    </div>
                    
                    <div className="mt-4 flex justify-end space-x-2">
                      <button
                        className="px-3 py-1 text-sm border rounded text-blue-500 hover:bg-blue-50"
                        onClick={() => onEdit(benefit)}
                      >
                        Edit
                      </button>
                      
                      <button
                        className="px-3 py-1 text-sm border rounded text-red-500 hover:bg-red-50"
                        onClick={() => onDelete(benefit)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full p-4 text-center text-gray-500 border rounded-lg border-dashed">
                <p>
                  {selectedMembershipId === 'all' 
                    ? "No benefit types found." 
                    : `No benefit types found for this membership.`}
                </p>
                <button
                  className="mt-2 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                  onClick={() => onEdit({ 
                    // Eğer bir membership filtresi uygulanmışsa, o membership ID'sini default olarak ayarla
                    ...(selectedMembershipId !== 'all' && { membership_id: selectedMembershipId }) 
                  })}
                >
                  Add New Benefit Type
                </button>
              </div>
            )}
            
            {/* Yeni Benefit Tipi Ekleme Kartı */}
            {filteredBenefits.length > 0 && (
              <div className="border border-dashed rounded-lg p-4 flex items-center justify-center hover:bg-gray-50 cursor-pointer"
                onClick={() => onEdit({ 
                  // Eğer bir membership filtresi uygulanmışsa, o membership ID'sini default olarak ayarla
                  ...(selectedMembershipId !== 'all' && { membership_id: selectedMembershipId }) 
                })}
              >
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100">
                    <Plus size={24} className="text-indigo-500" />
                  </div>
                  <h4 className="mt-2 font-medium text-indigo-500">Add New Benefit Type</h4>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default BenefitTypesList;
