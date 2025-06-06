import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatters';

const DeleteAssessmentConfirm = ({ assessment, onClose, onConfirm, isLoading }) => {
  if (!assessment) return null;

  const handleConfirm = () => {
    onConfirm(assessment.id);
  };

  // Format assessment date
  const assessmentDate = assessment.assessmentDate || assessment.assessment_date;
  const formattedDate = formatDate(assessmentDate);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      backgroundColor: 'rgba(0, 0, 0, 0.1)'
    }}>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-red-600 flex items-center">
            <AlertTriangle size={18} className="mr-2" />
            Delete Assessment
          </h3>
          <button 
            className="p-1 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p>
            Are you sure you want to delete the assessment from <strong>{formattedDate}</strong>?
          </p>
          
          <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3 text-sm text-yellow-800">
            <p className="font-medium">Warning:</p>
            <p>This action cannot be undone and will delete all assessment data.</p>
          </div>

          <div className="bg-gray-50 rounded-md p-3">
            <p className="text-sm font-medium mb-2">Assessment Details:</p>
            <ul className="text-sm space-y-1">
              <li><strong>Date:</strong> {formattedDate}</li>
              <li><strong>Weight:</strong> {assessment.weight} kg</li>
              <li><strong>BMI:</strong> {assessment.bmi}</li>
              {assessment.bodyFatPercentage && 
                <li><strong>Body Fat %:</strong> {assessment.bodyFatPercentage}%</li>
              }
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 p-4 flex justify-end space-x-3 rounded-b-lg">
          <button 
            className="px-4 py-2 border rounded-md hover:bg-gray-100"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <Button 
            variant="danger"
            onClick={handleConfirm}
            isLoading={isLoading}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAssessmentConfirm;
