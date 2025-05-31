import React, { useState, useMemo } from "react";
import {
  Edit,
  Trash2,
  Search,
  X,
  Clock,
  Users,
  Target,
  FileText,
  CheckCircle,
  Eye,
  Save,
} from "lucide-react";
import { toast } from "react-hot-toast";

const difficulties = ["Beginner", "Intermediate", "Advanced"];

const EditClassesModal = ({
  open,
  classes,
  onCancel,
  onUpdateClass,
  onDeleteClass,
  loading,
  error,
}) => {
  const [search, setSearch] = useState("");
  const [editClass, setEditClass] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const filteredClasses = useMemo(
    () =>
      classes.filter((c) =>
        c.class_name.toLowerCase().includes(search.toLowerCase())
      ),
    [classes, search]
  );

  const handleEditClick = (classItem) => {
    setEditClass(classItem);
    setEditForm({ ...classItem });
    setEditError("");
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    try {
      await onUpdateClass(editClass.class_id, {
        ...editForm,
        duration: Number(editForm.duration),
        capacity: Number(editForm.capacity),
      });
      setEditClass(null);
      toast.success("Class updated successfully!");
    } catch (err) {
      setEditError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update class."
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteError("");
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await onDeleteClass(deleteId);
      setDeleteId(null);
      toast.success("Class deleted successfully!");
    } catch (err) {
      setDeleteError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete class."
      );
    } finally {
      setDeleteLoading(false);
    }
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

  const getStatusColor = (isActive) => {
    return isActive
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-gray-100 text-gray-700 border-gray-200";
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
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full relative overflow-hidden animate-fade-in transform transition-all duration-300 hover:shadow-3xl max-h-[85vh] overflow-y-auto">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 px-8 py-6 relative sticky top-0 z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20"></div>
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200 hover:scale-110"
            onClick={onCancel}
            aria-label="Close"
            disabled={editLoading || deleteLoading}
          >
            <X size={20} />
          </button>
          <div className="relative flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
              <Edit className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Edit Classes</h3>
              <p className="text-white/80 text-sm">
                Manage and modify your existing fitness classes
              </p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm
                       text-gray-900 placeholder-gray-500 font-medium
                       transition-all duration-200 focus:outline-none focus:ring-4 focus:border-blue-500 focus:ring-blue-200
                       hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Search classes by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={editLoading || deleteLoading}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Classes Grid */}
        <div className="px-8 py-6">
          {filteredClasses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <div className="bg-gray-100 rounded-full p-4 mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold mb-2">No classes found</h4>
              <p className="text-sm text-center">
                {search
                  ? "Try adjusting your search terms"
                  : "No classes available to edit"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((classItem) => (
                <div
                  key={classItem.class_id}
                  className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200 group"
                >
                  {/* Class Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {classItem.class_name}
                      </h4>
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          classItem.is_active
                        )}`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mr-1 ${
                            classItem.is_active ? "bg-green-500" : "bg-gray-400"
                          }`}
                        ></div>
                        {classItem.is_active ? "Active" : "Inactive"}
                      </div>
                    </div>
                  </div>

                  {/* Class Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={16} className="text-green-500" />
                      <span>{classItem.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users size={16} className="text-orange-500" />
                      <span>{classItem.capacity} capacity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target size={16} className="text-indigo-500" />
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(
                          classItem.difficulty
                        )}`}
                      >
                        {classItem.difficulty}
                      </div>
                    </div>
                    {classItem.description && (
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {classItem.description}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      className="flex items-center justify-center gap-2 flex-1 px-4 py-2 rounded-xl 
                               bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium border-2 border-blue-200 hover:border-blue-300
                               transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleEditClick(classItem)}
                      disabled={editLoading || deleteLoading}
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      className="flex items-center justify-center gap-2 flex-1 px-4 py-2 rounded-xl 
                               bg-red-50 hover:bg-red-100 text-red-600 font-medium border-2 border-red-200 hover:border-red-300
                               transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleDeleteClick(classItem.class_id)}
                      disabled={editLoading || deleteLoading}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <X size={16} className="text-red-500" />
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-200 sticky bottom-0">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredClasses.length} of {classes.length} classes
            </p>
            <button
              className="px-6 py-2 rounded-xl border-2 border-gray-200 text-gray-700 font-medium bg-white hover:bg-gray-50 hover:border-gray-300
                       transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onCancel}
              disabled={editLoading || deleteLoading}
            >
              Close
            </button>
          </div>
        </div>

        {/* Edit Form Modal */}
        {editClass && editForm && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4"
            style={{
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
            }}
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full relative overflow-hidden animate-fade-in">
              {/* Edit Header */}
              <div className="bg-gradient-to-r from-green-600 via-blue-600 to-teal-600 px-8 py-6 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-teal-500/20"></div>
                <button
                  className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200 hover:scale-110"
                  onClick={() => setEditClass(null)}
                  aria-label="Close"
                  disabled={editLoading}
                >
                  <X size={20} />
                </button>
                <div className="relative flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                    <Edit className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white">
                      Edit Class
                    </h4>
                    <p className="text-white/80 text-sm">
                      Modify "{editClass.class_name}" details
                    </p>
                  </div>
                </div>
              </div>

              {/* Edit Form Content */}
              <div className="px-8 py-6">
                <form onSubmit={handleEditSubmit} className="space-y-6">
                  {/* Class Name */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <FileText size={16} className="text-blue-500" />
                      Class Name *
                    </label>
                    <input
                      type="text"
                      name="class_name"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50/50 backdrop-blur-sm
                               text-gray-900 placeholder-gray-500 font-medium
                               transition-all duration-200 focus:outline-none focus:ring-4 focus:border-blue-500 focus:ring-blue-200
                               hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      value={editForm.class_name}
                      onChange={handleEditChange}
                      disabled={editLoading}
                    />
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
                      value={editForm.description || ""}
                      onChange={handleEditChange}
                      disabled={editLoading}
                    />
                  </div>

                  {/* Duration and Capacity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Clock size={16} className="text-green-500" />
                        Duration (minutes) *
                      </label>
                      <input
                        type="number"
                        name="duration"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50/50 backdrop-blur-sm
                                 text-gray-900 placeholder-gray-500 font-medium
                                 transition-all duration-200 focus:outline-none focus:ring-4 focus:border-blue-500 focus:ring-blue-200
                                 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        value={editForm.duration}
                        onChange={handleEditChange}
                        disabled={editLoading}
                        min={1}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Users size={16} className="text-orange-500" />
                        Capacity *
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50/50 backdrop-blur-sm
                                 text-gray-900 placeholder-gray-500 font-medium
                                 transition-all duration-200 focus:outline-none focus:ring-4 focus:border-blue-500 focus:ring-blue-200
                                 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        value={editForm.capacity}
                        onChange={handleEditChange}
                        disabled={editLoading}
                        min={1}
                      />
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
                      value={editForm.difficulty}
                      onChange={handleEditChange}
                      disabled={editLoading}
                    >
                      {difficulties.map((d) => (
                        <option key={d} value={d} className="font-medium">
                          {d}
                        </option>
                      ))}
                    </select>
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(
                        editForm.difficulty
                      )}`}
                    >
                      <Target size={12} className="mr-1" />
                      {editForm.difficulty} Level
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            editForm.is_active ? "bg-green-100" : "bg-gray-200"
                          }`}
                        >
                          <CheckCircle
                            size={20}
                            className={
                              editForm.is_active
                                ? "text-green-600"
                                : "text-gray-400"
                            }
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="is_active_edit"
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
                          checked={editForm.is_active}
                          onChange={handleEditChange}
                          disabled={editLoading}
                          id="is_active_edit"
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

                  {/* Edit Error Display */}
                  {editError && (
                    <div className="bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <X size={16} className="text-red-500" />
                        <span className="text-red-700 font-medium">
                          {editError}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Edit Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 
                               text-gray-700 font-semibold bg-white hover:bg-gray-50 hover:border-gray-300
                               transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setEditClass(null)}
                      disabled={editLoading}
                    >
                      <X size={18} />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl 
                               bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700
                               text-white font-semibold shadow-lg hover:shadow-xl
                               transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      disabled={editLoading}
                    >
                      {editLoading ? (
                        <>
                          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteId && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4"
            style={{
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
            }}
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden animate-fade-in">
              {/* Delete Header */}
              <div className="bg-gradient-to-r from-red-600 to-pink-600 px-8 py-6 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20"></div>
                <div className="relative flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                    <Trash2 className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white">
                      Delete Class
                    </h4>
                    <p className="text-white/80 text-sm">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
              </div>

              {/* Delete Content */}
              <div className="px-8 py-6">
                <div className="mb-6">
                  <p className="text-gray-700 text-lg font-medium mb-2">
                    Are you sure you want to delete this class?
                  </p>
                  <p className="text-gray-500 text-sm">
                    This will permanently remove the class and all associated
                    data. This action cannot be reversed.
                  </p>
                </div>

                {deleteError && (
                  <div className="mb-6 bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <X size={16} className="text-red-500" />
                      <span className="text-red-700 font-medium">
                        {deleteError}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 
                             text-gray-700 font-semibold bg-white hover:bg-gray-50 hover:border-gray-300
                             transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setDeleteId(null)}
                    disabled={deleteLoading}
                  >
                    <X size={18} />
                    Cancel
                  </button>
                  <button
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl 
                             bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700
                             text-white font-semibold shadow-lg hover:shadow-xl
                             transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    onClick={handleDeleteConfirm}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={18} />
                        Delete Class
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditClassesModal;
