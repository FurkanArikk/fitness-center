import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const AddMembershipModal = ({ onClose, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    durationMonths: 1,
    benefits: [],
    active: true
  });

  const [errors, setErrors] = useState({});
  const [newBenefit, setNewBenefit] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Hata mesajını temizle
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    // Sayı olarak çevirebiliyorsak değeri değiştir
    if (value === '' || !isNaN(Number(value))) {
      setFormData({
        ...formData,
        [name]: value
      });
      
      // Hata mesajını temizle
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: ''
        });
      }
    }
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData({
        ...formData,
        benefits: [...formData.benefits, newBenefit.trim()]
      });
      setNewBenefit('');
    }
  };

  const removeBenefit = (index) => {
    const updatedBenefits = [...formData.benefits];
    updatedBenefits.splice(index, 1);
    setFormData({
      ...formData,
      benefits: updatedBenefits
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (formData.durationMonths <= 0) newErrors.durationMonths = 'Duration must be greater than 0';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Fiyatı sayıya çevir
      const processedData = {
        ...formData,
        price: parseFloat(formData.price),
        durationMonths: parseInt(formData.durationMonths)
      };
      
      onSave(processedData);
    }
  };

  return (
    <Modal
      title="Add New Membership Plan"
      onClose={onClose}
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows="3"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₺) *
            </label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleNumberChange}
              className={`w-full p-2 border rounded-md ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (Months) *
            </label>
            <input
              type="number"
              name="durationMonths"
              value={formData.durationMonths}
              onChange={handleNumberChange}
              min="1"
              className={`w-full p-2 border rounded-md ${
                errors.durationMonths ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.durationMonths && (
              <p className="mt-1 text-sm text-red-600">{errors.durationMonths}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Benefits
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newBenefit}
              onChange={(e) => setNewBenefit(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md"
              placeholder="Enter benefit"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={addBenefit}
            >
              Add
            </Button>
          </div>
          <div className="mt-2">
            {formData.benefits.length > 0 ? (
              <ul className="bg-gray-50 rounded-md p-2">
                {formData.benefits.map((benefit, index) => (
                  <li key={index} className="flex justify-between items-center py-1">
                    <span>{benefit}</span>
                    <button
                      type="button"
                      onClick={() => removeBenefit(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No benefits added yet</p>
            )}
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="active"
            name="active"
            checked={formData.active}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
            Active Membership Plan
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            Save Membership
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddMembershipModal;
