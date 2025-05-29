import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EditBenefitModal = ({ benefit, onClose, onSave, memberships = [], isLoading }) => {
  const [formData, setFormData] = useState({
    benefit_name: '',
    benefit_description: '',
    membership_id: '',
  });
  
  useEffect(() => {
    // If benefit object exists (update case)
    if (benefit && Object.keys(benefit).length > 0) {
      setFormData({
        benefit_name: benefit.benefitName || benefit.benefit_name || '',
        benefit_description: benefit.benefitDescription || benefit.benefit_description || '',
        membership_id: benefit.membershipId || benefit.membership_id || '',
      });
    } else {
      // Default values for new creation
      // If there's a membership_id in benefit object (from filter), use it, 
      // or if memberships array is not empty, use the first membership
      setFormData({
        benefit_name: '',
        benefit_description: '',
        membership_id: 
          (benefit && benefit.membership_id) ? 
          benefit.membership_id : 
          (memberships.length > 0 ? memberships[0].id : '')
      });
    }
  }, [benefit, memberships]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'number' ? Number(value) : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  // Determine title text
  const isNewBenefit = !benefit || Object.keys(benefit).length === 0;
  const modalTitle = isNewBenefit ? 'Add Benefit Type' : 'Edit Benefit Type';

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      backgroundColor: 'rgba(0, 0, 0, 0.1)'
    }}>
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">{modalTitle}</h3>
          <button 
            className="p-1 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Benefit Name *
            </label>
            <input
              type="text"
              name="benefit_name"
              value={formData.benefit_name}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="benefit_description"
              value={formData.benefit_description}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Associated Membership *
            </label>
            <select
              name="membership_id"
              value={formData.membership_id}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select a membership</option>
              {memberships.map(membership => (
                <option key={membership.id} value={membership.id}>
                  {membership.membershipName} (${membership.price})
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
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
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : isNewBenefit ? 'Create' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBenefitModal;
