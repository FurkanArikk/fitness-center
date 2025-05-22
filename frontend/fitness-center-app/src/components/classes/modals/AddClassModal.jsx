import React, { useState } from "react";
// If you have a Modal component, import it here. Otherwise, this is a minimal modal implementation.
// import Modal from "@/components/common/Modal";

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative animate-fade-in">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={onCancel}
          aria-label="Close"
          disabled={loading}
        >
          ×
        </button>
        <h3 className="text-xl font-bold mb-4">Add New Class</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Class Name *
            </label>
            <input
              type="text"
              name="class_name"
              className="w-full border rounded-lg px-3 py-2"
              value={form.class_name}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
            />
            {touched.class_name && errors.class_name && (
              <div className="text-red-500 text-xs mt-1">
                {errors.class_name}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              className="w-full border rounded-lg px-3 py-2"
              value={form.description}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
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
                value={form.duration}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
                min={1}
              />
              {touched.duration && errors.duration && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.duration}
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Capacity *
              </label>
              <input
                type="number"
                name="capacity"
                className="w-full border rounded-lg px-3 py-2"
                value={form.capacity}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
                min={1}
              />
              {touched.capacity && errors.capacity && (
                <div className="text-red-500 text-xs mt-1">
                  {errors.capacity}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Difficulty *
            </label>
            <select
              name="difficulty"
              className="w-full border rounded-lg px-3 py-2"
              value={form.difficulty}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
            >
              {difficulties.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {touched.difficulty && errors.difficulty && (
              <div className="text-red-500 text-xs mt-1">
                {errors.difficulty}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              disabled={loading}
              id="is_active"
            />
            <label htmlFor="is_active" className="text-sm">
              Active
            </label>
          </div>
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60"
              disabled={loading || !isValid}
            >
              {loading ? (
                <span className="animate-spin mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
              ) : null}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClassModal;
