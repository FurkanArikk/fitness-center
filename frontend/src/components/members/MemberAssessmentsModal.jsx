import React, { useState } from "react";
import {
  X,
  Plus,
  Calendar,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  Activity,
  BarChart3,
  User,
  Scale,
  Heart,
  Target,
} from "lucide-react";
import { formatDate } from "../../utils/formatters";
import Loader from "../common/Loader";
import Button from "../common/Button";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

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
  onDeleteAssessment,
}) => {
  const [activeTab, setActiveTab] = useState("history");

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

  // Sort assessments by date (newest to oldest)
  const sortedAssessments = [...assessments].sort((a, b) => {
    return (
      new Date(b.assessmentDate || b.assessment_date) -
      new Date(a.assessmentDate || a.assessment_date)
    );
  });

  // Calculate changes compared to previous assessment
  const getChange = (currentValue, previousValue) => {
    if (!previousValue) return null;

    const change = currentValue - previousValue;
    const percentage = ((change / previousValue) * 100).toFixed(1);

    return {
      value: change.toFixed(1),
      percentage,
      isPositive: change > 0,
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
      return (
        new Date(a.assessmentDate || a.assessment_date) -
        new Date(b.assessmentDate || b.assessment_date)
      );
    });

    chronologicalAssessments.forEach((assessment) => {
      const date = formatDate(
        assessment.assessmentDate || assessment.assessment_date
      );
      dateLabels.push(date);
      weightData.push(assessment.weight);
      bmiData.push(assessment.bmi);
      bodyFatData.push(assessment.bodyFatPercentage || null);
    });

    return {
      labels: dateLabels,
      weightData,
      bmiData,
      bodyFatData,
    };
  };

  const chartData = prepareChartData();

  // Create Chart.js data configuration with modern styling
  const chartConfig = {
    labels: chartData.labels || [],
    datasets: [
      {
        label: "Weight (kg)",
        data: chartData.weightData || [],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 3,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        yAxisID: "weightAxis",
        tension: 0.4,
      },
      {
        label: "BMI",
        data: chartData.bmiData || [],
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderWidth: 3,
        pointBackgroundColor: "rgb(239, 68, 68)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        yAxisID: "bmiAxis",
        tension: 0.4,
      },
      {
        label: "Body Fat %",
        data: chartData.bodyFatData || [],
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        borderWidth: 3,
        pointBackgroundColor: "rgb(16, 185, 129)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        yAxisID: "bmiAxis",
        tension: 0.4,
      },
    ],
  };

  // Chart options with modern styling
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: "600",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12,
      },
    },
    scales: {
      weightAxis: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Weight (kg)",
          font: {
            size: 12,
            weight: "600",
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      bmiAxis: {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "BMI / Body Fat %",
          font: {
            size: 12,
            weight: "600",
          },
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 px-8 py-6 border-b border-gray-200 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`w-16 h-16 rounded-full ${avatarData.color} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
              >
                {avatarData.initials}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Activity className="w-6 h-6 mr-2 text-blue-600" />
                  Fitness Assessments
                </h3>
                <p className="text-gray-600 font-medium">
                  {member.firstName} {member.lastName} - Progress Tracking
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

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex px-8">
            <button
              className={`px-6 py-4 font-bold text-sm border-b-3 transition-all duration-200 flex items-center space-x-2 ${
                activeTab === "history"
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("history")}
            >
              <Calendar className="w-4 h-4" />
              <span>Assessment History</span>
            </button>
            <button
              className={`px-6 py-4 font-bold text-sm border-b-3 transition-all duration-200 flex items-center space-x-2 ${
                activeTab === "chart"
                  ? "border-green-500 text-green-600 bg-green-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("chart")}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Progress Chart</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">
                  Loading assessments...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* History Tab */}
              {activeTab === "history" && (
                <div className="space-y-6">
                  {/* Add Assessment Button */}
                  <div className="flex justify-end mb-6">
                    <button
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl hover:from-blue-600 hover:to-green-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                      onClick={() => onAddAssessment(member)}
                    >
                      <Plus className="w-5 h-5" />
                      <span>New Assessment</span>
                    </button>
                  </div>

                  {sortedAssessments.length > 0 ? (
                    <div className="space-y-6">
                      {sortedAssessments.map((assessment, index) => {
                        const prevAssessment =
                          index < sortedAssessments.length - 1
                            ? sortedAssessments[index + 1]
                            : null;
                        const weightChange = getChange(
                          assessment.weight,
                          prevAssessment?.weight
                        );
                        const bmiChange = getChange(
                          assessment.bmi,
                          prevAssessment?.bmi
                        );
                        const bodyFatChange = getChange(
                          assessment.bodyFatPercentage,
                          prevAssessment?.bodyFatPercentage
                        );

                        return (
                          <div
                            key={assessment.id || index}
                            className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 shadow-lg border border-gray-100"
                          >
                            <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Calendar className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-lg text-gray-800">
                                    {formatDate(
                                      assessment.assessmentDate ||
                                        assessment.assessment_date
                                    )}
                                  </h4>
                                  {assessment.trainer && (
                                    <p className="text-sm text-gray-600 flex items-center">
                                      <User className="w-4 h-4 mr-1" />
                                      Trainer: {assessment.trainer}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                {/* Edit and Delete buttons */}
                                <button
                                  className="group p-2 text-blue-500 hover:bg-blue-100 hover:text-blue-700 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200"
                                  onClick={() =>
                                    onEditAssessment &&
                                    onEditAssessment(assessment)
                                  }
                                  title="Edit Assessment"
                                >
                                  <Edit className="w-5 h-5 group-hover:scale-110 transition-all duration-200" />
                                </button>
                                <button
                                  className="group p-2 text-red-500 hover:bg-red-100 hover:text-red-700 rounded-xl transition-all duration-200 border border-transparent hover:border-red-200"
                                  onClick={() =>
                                    onDeleteAssessment &&
                                    onDeleteAssessment(assessment)
                                  }
                                  title="Delete Assessment"
                                >
                                  <Trash2 className="w-5 h-5 group-hover:scale-110 transition-all duration-200" />
                                </button>
                              </div>
                            </div>

                            {/* Measurements Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                              {/* Weight */}
                              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-2">
                                    <Scale className="w-5 h-5 text-blue-600" />
                                    <span className="text-sm font-bold text-gray-600">
                                      Weight
                                    </span>
                                  </div>
                                  {weightChange && (
                                    <div
                                      className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold ${
                                        weightChange.isPositive
                                          ? "bg-red-100 text-red-700"
                                          : "bg-green-100 text-green-700"
                                      }`}
                                    >
                                      {weightChange.isPositive ? (
                                        <TrendingUp className="w-3 h-3" />
                                      ) : (
                                        <TrendingDown className="w-3 h-3" />
                                      )}
                                      <span>
                                        {weightChange.isPositive ? "+" : ""}
                                        {weightChange.value} kg
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="text-2xl font-bold text-gray-800">
                                  {assessment.weight} kg
                                </div>
                              </div>

                              {/* BMI */}
                              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-2">
                                    <Heart className="w-5 h-5 text-red-600" />
                                    <span className="text-sm font-bold text-gray-600">
                                      BMI
                                    </span>
                                  </div>
                                  {bmiChange && (
                                    <div
                                      className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold ${
                                        bmiChange.isPositive
                                          ? "bg-red-100 text-red-700"
                                          : "bg-green-100 text-green-700"
                                      }`}
                                    >
                                      {bmiChange.isPositive ? (
                                        <TrendingUp className="w-3 h-3" />
                                      ) : (
                                        <TrendingDown className="w-3 h-3" />
                                      )}
                                      <span>
                                        {bmiChange.isPositive ? "+" : ""}
                                        {bmiChange.value}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="text-2xl font-bold text-gray-800">
                                  {assessment.bmi}
                                </div>
                              </div>

                              {/* Body Fat % */}
                              {assessment.bodyFatPercentage && (
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                      <Activity className="w-5 h-5 text-green-600" />
                                      <span className="text-sm font-bold text-gray-600">
                                        Body Fat %
                                      </span>
                                    </div>
                                    {bodyFatChange && (
                                      <div
                                        className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold ${
                                          bodyFatChange.isPositive
                                            ? "bg-red-100 text-red-700"
                                            : "bg-green-100 text-green-700"
                                        }`}
                                      >
                                        {bodyFatChange.isPositive ? (
                                          <TrendingUp className="w-3 h-3" />
                                        ) : (
                                          <TrendingDown className="w-3 h-3" />
                                        )}
                                        <span>
                                          {bodyFatChange.isPositive ? "+" : ""}
                                          {bodyFatChange.value}%
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-2xl font-bold text-gray-800">
                                    {assessment.bodyFatPercentage}%
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Notes */}
                            {assessment.notes && (
                              <div className="mb-6">
                                <div className="flex items-center mb-3">
                                  <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                                  <span className="text-sm font-bold text-gray-600">
                                    Notes
                                  </span>
                                </div>
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                                  <p className="text-gray-700 leading-relaxed">
                                    {assessment.notes}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Goals */}
                            {(assessment.goalsSet || assessment.goals_set) && (
                              <div>
                                <div className="flex items-center mb-3">
                                  <Target className="w-4 h-4 text-green-500 mr-2" />
                                  <span className="text-sm font-bold text-gray-600">
                                    Goals
                                  </span>
                                </div>
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                                  <p className="text-gray-700 leading-relaxed">
                                    {assessment.goalsSet ||
                                      assessment.goals_set}
                                  </p>
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
                        <Activity className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium text-lg">
                        No Assessments Found
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        This member doesn't have any assessments yet.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Chart Tab */}
              {activeTab === "chart" && (
                <div className="space-y-6">
                  {sortedAssessments.length > 1 ? (
                    <>
                      {/* Chart Section */}
                      <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl p-6 border border-gray-100">
                        <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                          <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                          Progress Overview
                        </h4>
                        <div
                          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                          style={{ height: "400px" }}
                        >
                          <Line data={chartConfig} options={chartOptions} />
                        </div>
                      </div>

                      {/* Summary Table */}
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100">
                        <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                          Assessment Summary
                        </h4>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                    Date
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                    Weight (kg)
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                    BMI
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                    Body Fat %
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {sortedAssessments.map((assessment, index) => (
                                  <tr
                                    key={index}
                                    className="hover:bg-gray-50 transition-colors duration-200"
                                  >
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">
                                      {formatDate(
                                        assessment.assessmentDate ||
                                          assessment.assessment_date
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-600">
                                      {assessment.weight}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-red-600">
                                      {assessment.bmi}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">
                                      {assessment.bodyFatPercentage || "-"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium text-lg">
                        Insufficient Data for Chart
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        At least 2 assessments are needed to display a progress
                        chart.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-t border-gray-200 rounded-b-2xl">
          <div className="flex justify-end">
            <button
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl hover:from-blue-600 hover:to-green-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={onClose}
            >
              Close Assessments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberAssessmentsModal;
