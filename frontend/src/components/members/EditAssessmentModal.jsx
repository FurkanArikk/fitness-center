import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../common/Button';

const EditAssessmentModal = ({ assessment, onSave, onClose, isLoading }) => {
  // Get default next assessment date (1 month from now)
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const defaultNextDate = nextMonth.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    memberId: '',
    trainerId: 1,
    weight: '',
    height: '',
    bmi: '',
    bodyFatPercentage: '',
    notes: '',
    goalsSet: '',
    assessmentDate: new Date().toISOString().split('T')[0],
    nextAssessmentDate: defaultNextDate
  });

  // Load assessment data into the form
  useEffect(() => {
    if (assessment) {
      const assessmentDate = assessment.assessmentDate || assessment.assessment_date;
      // Convert date format to "YYYY-MM-DD"
      const formattedDate = assessmentDate ? 
        (assessmentDate.includes('T') ? assessmentDate.split('T')[0] : assessmentDate) : 
        new Date().toISOString().split('T')[0];
      
      const nextAssessmentDate = assessment.nextAssessmentDate || assessment.next_assessment_date;
      const formattedNextDate = nextAssessmentDate ? 
        (nextAssessmentDate.includes('T') ? nextAssessmentDate.split('T')[0] : nextAssessmentDate) : 
        defaultNextDate;

      setFormData({
        id: assessment.id,
        memberId: assessment.memberId || assessment.member_id || '',
        trainerId: assessment.trainerId || assessment.trainer_id || 1,
        weight: assessment.weight || '',
        height: assessment.height || '',
        bmi: assessment.bmi || '',
        bodyFatPercentage: assessment.bodyFatPercentage || assessment.body_fat_percentage || '',
        notes: assessment.notes || '',
        goalsSet: assessment.goalsSet || assessment.goals_set || '',
        assessmentDate: formattedDate,
        nextAssessmentDate: formattedNextDate
      });
    }
  }, [assessment, defaultNextDate]);

  // Recalculate when form data changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Auto-calculate BMI when weight or height changes
      if ((name === 'weight' || name === 'height') && newData.weight && newData.height) {
        const heightInMeters = newData.height / 100; // cm to meters
        const bmi = (newData.weight / (heightInMeters * heightInMeters)).toFixed(1);
        newData.bmi = bmi;
      }
      
      return newData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create a copy of the form data before sending to API
    const submitData = { ...formData };
    
    // Convert string values to appropriate numeric types
    submitData.weight = parseFloat(submitData.weight);
    submitData.height = parseFloat(submitData.height);
    submitData.bmi = parseFloat(submitData.bmi);
    submitData.trainerId = parseInt(submitData.trainerId);
    
    // Convert bodyFatPercentage only if it exists
    if (submitData.bodyFatPercentage) {
      submitData.bodyFatPercentage = parseFloat(submitData.bodyFatPercentage);
    }
    
    // Fix date format for API: "2025-05-19" => "2025-05-19T00:00:00Z"
    if (submitData.assessmentDate) {
      submitData.assessmentDate = submitData.assessmentDate + "T00:00:00Z";
    }
    
    // Fix next assessment date format
    if (submitData.nextAssessmentDate) {
      submitData.nextAssessmentDate = submitData.nextAssessmentDate + "T00:00:00Z";
    }
    
    console.log('Sending updated assessment with formatted data:', submitData);
    onSave(submitData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      backgroundColor: 'rgba(0, 0, 0, 0.1)'
    }}>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">
            Edit Assessment
          </h3>
          <button 
            className="p-1 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assessment Date *
              </label>
              <input
                type="date"
                name="assessmentDate"
                value={formData.assessmentDate}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next Assessment Date *
              </label>
              <input
                type="date"
                name="nextAssessmentDate"
                value={formData.nextAssessmentDate}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg) *
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (cm) *
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                min="0"
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                BMI *
              </label>
              <input
                type="number"
                name="bmi"
                value={formData.bmi}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">Auto-calculated from weight and height</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body Fat %
              </label>
              <input
                type="number"
                name="bodyFatPercentage"
                value={formData.bodyFatPercentage}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.1"
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Goals Set *
            </label>
            <input
              type="text"
              name="goalsSet"
              value={formData.goalsSet}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Weight loss, muscle gain, improve endurance"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAssessmentModal;
