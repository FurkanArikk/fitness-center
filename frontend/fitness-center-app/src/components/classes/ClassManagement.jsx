import React from "react";
import { Edit, Eye, BarChart2, Users, Plus } from "lucide-react";
import Card from "../common/Card";

const ClassManagement = ({
  onAddNewClass,
  onEditClasses,
  onGoToAnalytics,
  onToggleInactiveClasses,
  onViewAllTrainers,
  analyticsBtnRef,
  classVisibilityBtnRef,
  onClassVisibilityClick,
}) => {
  const buttonBase =
    "flex items-center gap-2 justify-center w-full font-medium py-3 px-5 rounded-2xl shadow-lg bg-white border border-gray-200 transition-all duration-150 hover:shadow-2xl hover:-translate-y-0.5 hover:bg-gradient-to-br from-gray-50 to-white focus:outline-none focus:ring-2 focus:ring-blue-200 active:shadow-md text-base";

  return (
    <Card title="Quick Actions">
      <div className="pt-4 space-y-4">
        {/* Quick Actions Panel - Vertical Layout */}
        <div className="flex flex-col gap-3">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl text-lg shadow-lg transition-all duration-150 hover:shadow-2xl hover:-translate-y-0.5 w-full flex items-center justify-center gap-2"
            onClick={onAddNewClass}
          >
            <Plus size={20} /> Add New Class
          </button>

          <button
            className={buttonBase + " text-blue-700"}
            onClick={onEditClasses}
          >
            <Edit size={18} /> Edit Classes
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
    </Card>
  );
};

export default ClassManagement;
