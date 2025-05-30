import React, { useState } from 'react';
import { X, Plus, Calendar, TrendingUp, TrendingDown, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import Loader from '../common/Loader';
import Button from '../common/Button';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MemberAssessmentsModal = ({ 
  member, 
  onClose, 
  isLoading, 
  assessments = [], 
  onAddAssessment,
  onEditAssessment,
  onDeleteAssessment 
}) => {
  const [activeTab, setActiveTab] = useState('history');

  // Sort assessments by date (newest to oldest)
  const sortedAssessments = [...assessments].sort((a, b) => {
    return new Date(b.assessmentDate || b.assessment_date) - new Date(a.assessmentDate || a.assessment_date);
  });

  // Calculate changes compared to previous assessment
  const getChange = (currentValue, previousValue) => {
    if (!previousValue) return null;
    
    const change = currentValue - previousValue;
    const percentage = ((change / previousValue) * 100).toFixed(1);
    
    return {
      value: change.toFixed(1),
      percentage,
      isPositive: change > 0
    };
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (assessments.length === 0) return {};
    
    // Group weight and BMI values by date
    const weightData = [];
    const bmiData = [];
    const bodyFatData = [];
    const dateLabels = [];
    
    // Sort chronologically (oldest to newest) for chart display
    const chronologicalAssessments = [...assessments].sort((a, b) => {
      return new Date(a.assessmentDate || a.assessment_date) - new Date(b.assessmentDate || b.assessment_date);
    });
    
    chronologicalAssessments.forEach(assessment => {
      const date = formatDate(assessment.assessmentDate || assessment.assessment_date);
      dateLabels.push(date);
      weightData.push(assessment.weight);
      bmiData.push(assessment.bmi);
      bodyFatData.push(assessment.bodyFatPercentage || null);
    });
    
    return {
      labels: dateLabels,
      weightData,
      bmiData,
      bodyFatData
    };
  };

  const chartData = prepareChartData();
  
  // Create Chart.js data configuration
  const chartConfig = {
    labels: chartData.labels || [],
    datasets: [
      {
        label: 'Weight (kg)',
        data: chartData.weightData || [],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'weightAxis',
        tension: 0.3
      },
      {
        label: 'BMI',
        data: chartData.bmiData || [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'bmiAxis',
        tension: 0.3
      },
      {
        label: 'Body Fat %',
        data: chartData.bodyFatData || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        yAxisID: 'bmiAxis',
        tension: 0.3
      }
    ]
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    scales: {
      weightAxis: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Weight (kg)'
        }
      },
      bmiAxis: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'BMI / Body Fat %'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      backgroundColor: 'rgba(0, 0, 0, 0.1)'
    }}>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">
            {member.firstName} {member.lastName} - Assessments
          </h3>
          <button 
            className="p-1 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            <button 
              className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'history' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('history')}
            >
              Assessment History
            </button>
            <button 
              className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'chart' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('chart')}
            >
              Progress Chart
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <Loader size="small" message="Loading assessments..." />
          ) : (
            <>
              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  {/* Add Assessment Button */}
                  <div className="flex justify-end mb-4">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      icon={<Plus size={16} />}
                      onClick={() => onAddAssessment(member)}
                    >
                      New Assessment
                    </Button>
                  </div>

                  {sortedAssessments.length > 0 ? (
                    <div className="space-y-4">
                      {sortedAssessments.map((assessment, index) => {
                        const prevAssessment = index < sortedAssessments.length - 1 ? sortedAssessments[index+1] : null;
                        const weightChange = getChange(assessment.weight, prevAssessment?.weight);
                        const bmiChange = getChange(assessment.bmi, prevAssessment?.bmi);
                        const bodyFatChange = getChange(assessment.bodyFatPercentage, prevAssessment?.bodyFatPercentage);

                        return (
                          <div key={assessment.id || index} className="border rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-medium flex items-center gap-1">
                                <Calendar size={16} className="text-gray-500" />
                                <span>
                                  {formatDate(assessment.assessmentDate || assessment.assessment_date)}
                                </span>
                              </h4>
                              <div className="flex items-center space-x-2">
                                {assessment.trainer && (
                                  <span className="text-xs text-gray-500">
                                    Trainer: {assessment.trainer}
                                  </span>
                                )}
                                {/* Edit and Delete buttons */}
                                <button
                                  className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                                  onClick={() => onEditAssessment && onEditAssessment(assessment)}
                                  title="Edit Assessment"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                                  onClick={() => onDeleteAssessment && onDeleteAssessment(assessment)}
                                  title="Delete Assessment"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>

                            {/* Measurements Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {/* Weight */}
                              <div className="bg-gray-50 p-2 rounded">
                                <div className="text-xs text-gray-500 mb-1">Weight</div>
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold">{assessment.weight} kg</span>
                                  {weightChange && (
                                    <div className={`text-xs flex items-center ${weightChange.isPositive ? 'text-red-500' : 'text-green-500'}`}>
                                      {weightChange.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                      <span>{weightChange.isPositive ? '+' : ''}{weightChange.value} kg</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* BMI */}
                              <div className="bg-gray-50 p-2 rounded">
                                <div className="text-xs text-gray-500 mb-1">BMI</div>
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold">{assessment.bmi}</span>
                                  {bmiChange && (
                                    <div className={`text-xs flex items-center ${bmiChange.isPositive ? 'text-red-500' : 'text-green-500'}`}>
                                      {bmiChange.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                      <span>{bmiChange.isPositive ? '+' : ''}{bmiChange.value}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Body Fat % */}
                              {assessment.bodyFatPercentage && (
                                <div className="bg-gray-50 p-2 rounded">
                                  <div className="text-xs text-gray-500 mb-1">Body Fat %</div>
                                  <div className="flex justify-between items-center">
                                    <span className="font-semibold">{assessment.bodyFatPercentage}%</span>
                                    {bodyFatChange && (
                                      <div className={`text-xs flex items-center ${bodyFatChange.isPositive ? 'text-red-500' : 'text-green-500'}`}>
                                        {bodyFatChange.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                        <span>{bodyFatChange.isPositive ? '+' : ''}{bodyFatChange.value}%</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Notes */}
                            {assessment.notes && (
                              <div className="mt-3 text-sm">
                                <div className="text-xs text-gray-500 mb-1">Notes:</div>
                                <p className="p-2 bg-gray-50 rounded">{assessment.notes}</p>
                              </div>
                            )}
                            
                            {/* Goals */}
                            {(assessment.goalsSet || assessment.goals_set) && (
                              <div className="mt-3 text-sm">
                                <div className="text-xs text-gray-500 mb-1">Goals:</div>
                                <p className="p-2 bg-gray-50 rounded">
                                  {assessment.goalsSet || assessment.goals_set}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No assessments found for this member.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Chart Tab */}
              {activeTab === 'chart' && (
                <div>
                  {sortedAssessments.length > 1 ? (
                    <div className="space-y-4">
                      <div className="h-64 border rounded-lg p-4">
                        <Line data={chartConfig} options={chartOptions} />
                      </div>
                      
                      {/* Summary Table */}
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (kg)</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BMI</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Body Fat %</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {sortedAssessments.map((assessment, index) => (
                              <tr key={index}>
                                <td className="px-3 py-2 whitespace-nowrap">{formatDate(assessment.assessmentDate || assessment.assessment_date)}</td>
                                <td className="px-3 py-2 whitespace-nowrap">{assessment.weight}</td>
                                <td className="px-3 py-2 whitespace-nowrap">{assessment.bmi}</td>
                                <td className="px-3 py-2 whitespace-nowrap">{assessment.bodyFatPercentage || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>At least 2 assessments are needed to display a chart.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="border-t p-4 flex justify-end">
          <button
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded font-medium"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberAssessmentsModal;
