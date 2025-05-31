import React, { useState } from "react";
import {
  Plus,
  X,
  Clock,
  Users,
  Target,
  FileText,
  CheckCircle,
} from "lucide-react";

const difficulties = ["Beginner", "Intermediate", "Advanced"];

const AddClassModal = ({ open, onCancel, onSubmit, loading, error }) => {
  const [form, setForm] = useState({
    class_name: "",
    description: "",
    duration: "",
    capacity: "",
    difficulty: difficulties[0],
    is_active: true,
  });
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const validate = () => {
    const errors = {};
    if (!form.class_name.trim()) errors.class_name = "Class name is required.";
    if (!form.duration || isNaN(form.duration) || form.duration <= 0)
      errors.duration = "Duration must be a positive number.";
    if (!form.capacity || isNaN(form.capacity) || form.capacity <= 0)
      errors.capacity = "Capacity must be a positive number.";
    if (!form.difficulty) errors.difficulty = "Difficulty is required.";
    return errors;
  };

  const errors = validate();
  const isValid = Object.keys(errors).length === 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      class_name: true,
      duration: true,
      capacity: true,
      difficulty: true,
    });
    if (!isValid) return;
    onSubmit(form);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-700 border-green-200";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Advanced":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full relative overflow-hidden animate-fade-in transform transition-all duration-300 hover:shadow-3xl">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200 hover:scale-110"
            onClick={onCancel}
            aria-label="Close"
            disabled={loading}
          >
            <X size={20} />
          </button>
          <div className="relative flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
              <Plus className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Add New Class</h3>
              <p className="text-white/80 text-sm">
                Create a new fitness class for your members
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-8 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Class Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FileText size={16} className="text-blue-500" />
                Class Name *
              </label>
              <input
                type="text"
                name="class_name"
                className={`
                  w-full px-4 py-3 rounded-xl border-2 bg-gray-50/50 backdrop-blur-sm
                  text-gray-900 placeholder-gray-500 font-medium
                  transition-all duration-200 focus:outline-none focus:ring-4
                  ${
                    touched.class_name && errors.class_name
                      ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-200 hover:border-gray-300"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                placeholder="Enter class name (e.g., Morning Yoga)"
                value={form.class_name}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
              />
              {touched.class_name && errors.class_name && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                  <X size={14} />
                  {errors.class_name}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FileText size={16} className="text-purple-500" />
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50/50 backdrop-blur-sm
                         text-gray-900 placeholder-gray-500 font-medium resize-none
                         transition-all duration-200 focus:outline-none focus:ring-4 focus:border-blue-500 focus:ring-blue-200
                         hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Describe your class, its benefits, and what participants can expect..."
                value={form.description}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
              />
            </div>

            {/* Duration and Capacity Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Clock size={16} className="text-green-500" />
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  name="duration"
                  className={`
                    w-full px-4 py-3 rounded-xl border-2 bg-gray-50/50 backdrop-blur-sm
                    text-gray-900 placeholder-gray-500 font-medium
                    transition-all duration-200 focus:outline-none focus:ring-4
                    ${
                      touched.duration && errors.duration
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-200 hover:border-gray-300"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                  placeholder="60"
                  value={form.duration}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                  min={1}
                />
                {touched.duration && errors.duration && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                    <X size={14} />
                    {errors.duration}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Users size={16} className="text-orange-500" />
                  Capacity *
                </label>
                <input
                  type="number"
                  name="capacity"
                  className={`
                    w-full px-4 py-3 rounded-xl border-2 bg-gray-50/50 backdrop-blur-sm
                    text-gray-900 placeholder-gray-500 font-medium
                    transition-all duration-200 focus:outline-none focus:ring-4
                    ${
                      touched.capacity && errors.capacity
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-200 hover:border-gray-300"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                  placeholder="20"
                  value={form.capacity}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={loading}
                  min={1}
                />
                {touched.capacity && errors.capacity && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                    <X size={14} />
                    {errors.capacity}
                  </div>
                )}
              </div>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Target size={16} className="text-indigo-500" />
                Difficulty Level *
              </label>
              <select
                name="difficulty"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50/50 backdrop-blur-sm
                         text-gray-900 font-medium cursor-pointer
                         transition-all duration-200 focus:outline-none focus:ring-4 focus:border-blue-500 focus:ring-blue-200
                         hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                value={form.difficulty}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
              >
                {difficulties.map((d) => (
                  <option key={d} value={d} className="font-medium">
                    {d}
                  </option>
                ))}
              </select>
              {/* Difficulty Visual Indicator */}
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(
                  form.difficulty
                )}`}
              >
                <Target size={12} className="mr-1" />
                {form.difficulty} Level
              </div>
              {touched.difficulty && errors.difficulty && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                  <X size={14} />
                  {errors.difficulty}
                </div>
              )}
            </div>

            {/* Active Toggle */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      form.is_active ? "bg-green-100" : "bg-gray-200"
                    }`}
                  >
                    <CheckCircle
                      size={20}
                      className={
                        form.is_active ? "text-green-600" : "text-gray-400"
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="is_active"
                      className="text-sm font-semibold text-gray-700 cursor-pointer"
                    >
                      Active Class
                    </label>
                    <p className="text-xs text-gray-500">
                      Class will be visible to members for booking
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    disabled={loading}
                    id="is_active"
                    className="sr-only peer"
                  />
                  <div
                    className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer 
                               peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
                               after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                               peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-green-600 shadow-lg"
                  ></div>
                </label>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <X size={16} className="text-red-500" />
                  <span className="text-red-700 font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 
                         text-gray-700 font-semibold bg-white hover:bg-gray-50 hover:border-gray-300
                         transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onCancel}
                disabled={loading}
              >
                <X size={18} />
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl 
                         bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
                         text-white font-semibold shadow-lg hover:shadow-xl
                         transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={loading || !isValid}
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Create Class
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddClassModal;
