import React from "react";
import {
  Edit,
  Eye,
  Download,
  Upload,
  BarChart2,
  Users,
  Plus,
} from "lucide-react";
import Card from "../common/Card";

const ClassManagement = ({
  onAddNewClass,
  onEditClasses,
  onExportClassList,
  onImportClasses,
  onGoToAnalytics,
  onToggleInactiveClasses,
  onViewAllTrainers,
  analyticsBtnRef,
  classVisibilityBtnRef,
  onClassVisibilityClick,
}) => {
  const buttonBase =
    "flex items-center gap-2 font-medium py-2.5 px-5 rounded-2xl shadow-lg bg-white border border-gray-200 transition-all duration-150 hover:shadow-2xl hover:-translate-y-0.5 hover:bg-gradient-to-br from-gray-50 to-white focus:outline-none focus:ring-2 focus:ring-blue-200 active:shadow-md text-base";

  return (
    <Card title="Class Management">
      <div className="space-y-4">
        <p className="text-gray-700 text-sm mb-2">
          Use the buttons below for quick actions related to class management.
        </p>
        {/* Quick Actions Panel */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl text-lg shadow-lg transition-all duration-150 hover:shadow-2xl hover:-translate-y-0.5"
            onClick={onAddNewClass}
          >
            <span className="flex items-center gap-2">
              <Plus size={20} /> Add New Class
            </span>
          </button>
          <div className="flex flex-wrap gap-3 md:gap-4">
            <button
              className={buttonBase + " text-blue-700"}
              onClick={onEditClasses}
            >
              <Edit size={18} /> Edit Classes
            </button>
            <button
              className={buttonBase + " text-green-700"}
              onClick={onExportClassList}
            >
              <Download size={18} /> Export Class List
            </button>
            <button
              className={buttonBase + " text-purple-700"}
              onClick={onImportClasses}
            >
              <Upload size={18} /> Import Classes
            </button>
            <button
              className={buttonBase + " text-pink-700"}
              onClick={onGoToAnalytics}
              ref={analyticsBtnRef}
            >
              <BarChart2 size={18} /> Go to Analytics
            </button>
            <button
              className={buttonBase + " text-blue-700"}
              onClick={onClassVisibilityClick}
              ref={classVisibilityBtnRef}
            >
              <Eye size={18} /> Class Visibility
            </button>
            <button
              className={buttonBase + " text-indigo-700"}
              onClick={onViewAllTrainers}
            >
              <Users size={18} /> View All Trainers
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ClassManagement;
