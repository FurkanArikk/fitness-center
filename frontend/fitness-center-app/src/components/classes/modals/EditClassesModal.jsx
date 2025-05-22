import React, { useState, useMemo } from "react";
// import Modal from "@/components/common/Modal";
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 relative animate-fade-in">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={onCancel}
          aria-label="Close"
          disabled={editLoading || deleteLoading}
        >
          ×
        </button>
        <h3 className="text-xl font-bold mb-4">Edit Classes</h3>
        <input
          type="text"
          className="w-full border rounded-lg px-3 py-2 mb-4"
          placeholder="Search classes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={editLoading || deleteLoading}
        />
        <div className="overflow-y-auto max-h-72 mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Duration</th>
                <th className="p-2 text-left">Capacity</th>
                <th className="p-2 text-left">Difficulty</th>
                <th className="p-2 text-left">Active</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map((c) => (
                <tr key={c.class_id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{c.class_name}</td>
                  <td className="p-2">{c.duration}</td>
                  <td className="p-2">{c.capacity}</td>
                  <td className="p-2">{c.difficulty}</td>
                  <td className="p-2">{c.is_active ? "Yes" : "No"}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => handleEditClick(c)}
                      disabled={editLoading || deleteLoading}
                    >
                      Edit
                    </button>
                    <button
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={() => handleDeleteClick(c.class_id)}
                      disabled={editLoading || deleteLoading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredClasses.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-400 py-4">
                    No classes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {error && (
          <div className="text-red-600 text-sm text-center mb-2">{error}</div>
        )}
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
            onClick={onCancel}
            disabled={editLoading || deleteLoading}
          >
            Close
          </button>
        </div>
        {/* Edit Form Modal */}
        {editClass && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative animate-fade-in">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                onClick={() => setEditClass(null)}
                aria-label="Close"
                disabled={editLoading}
              >
                ×
              </button>
              <h4 className="text-lg font-bold mb-4">Edit Class</h4>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Class Name *
                  </label>
                  <input
                    type="text"
                    name="class_name"
                    className="w-full border rounded-lg px-3 py-2"
                    value={editForm.class_name}
                    onChange={handleEditChange}
                    disabled={editLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    className="w-full border rounded-lg px-3 py-2"
                    value={editForm.description}
                    onChange={handleEditChange}
                    disabled={editLoading}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      Duration (min) *
                    </label>
                    <input
                      type="number"
                      name="duration"
                      className="w-full border rounded-lg px-3 py-2"
                      value={editForm.duration}
                      onChange={handleEditChange}
                      disabled={editLoading}
                      min={1}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      Capacity *
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      className="w-full border rounded-lg px-3 py-2"
                      value={editForm.capacity}
                      onChange={handleEditChange}
                      disabled={editLoading}
                      min={1}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Difficulty *
                  </label>
                  <select
                    name="difficulty"
                    className="w-full border rounded-lg px-3 py-2"
                    value={editForm.difficulty}
                    onChange={handleEditChange}
                    disabled={editLoading}
                  >
                    {difficulties.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={editForm.is_active}
                    onChange={handleEditChange}
                    disabled={editLoading}
                    id="is_active_edit"
                  />
                  <label htmlFor="is_active_edit" className="text-sm">
                    Active
                  </label>
                </div>
                {editError && (
                  <div className="text-red-600 text-sm text-center">
                    {editError}
                  </div>
                )}
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                    onClick={() => setEditClass(null)}
                    disabled={editLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60"
                    disabled={editLoading}
                  >
                    {editLoading ? (
                      <span className="animate-spin mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    ) : null}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Delete Confirmation Dialog */}
        {deleteId && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 relative animate-fade-in">
              <h4 className="text-lg font-bold mb-4">Delete Class</h4>
              <p className="mb-4">
                Are you sure you want to delete this class?
              </p>
              {deleteError && (
                <div className="text-red-600 text-sm text-center mb-2">
                  {deleteError}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                  onClick={() => setDeleteId(null)}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-60"
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <span className="animate-spin mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                  ) : null}
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditClassesModal;
