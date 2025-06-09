import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Calendar,
  Clock,
  Dumbbell,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Plus,
} from "lucide-react";
import { staffService, classService } from "@/api";

const AssignClassModal = ({ isOpen, onClose, onClassAssigned }) => {
  const [trainers, setTrainers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [selectedTrainer, setSelectedTrainer] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Search and filter states
  const [trainerSearch, setTrainerSearch] = useState("");
  const [classSearch, setClassSearch] = useState("");

  const daysOfWeek = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchData();
      resetForm();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [trainersData, classesData] = await Promise.all([
        staffService.getTrainers(),
        classService.getClasses(true, 1, 50), // Get active classes
      ]);

      setTrainers(Array.isArray(trainersData) ? trainersData : []);
      setClasses(Array.isArray(classesData) ? classesData : []);
    } catch (err) {
      setError("Failed to load trainers and classes data");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedTrainer("");
    setSelectedClass("");
    setSelectedDay("");
    setStartTime("");
    setEndTime("");
    setTrainerSearch("");
    setClassSearch("");
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !selectedTrainer ||
      !selectedClass ||
      !selectedDay ||
      !startTime ||
      !endTime
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate time
    if (startTime >= endTime) {
      setError("End time must be after start time");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const scheduleData = {
        trainer_id: parseInt(selectedTrainer),
        class_id: parseInt(selectedClass),
        day_of_week: selectedDay,
        start_time: startTime,
        end_time: endTime,
        status: "active",
      };

      await staffService.createSchedule(scheduleData);

      setSuccess(true);

      // Call callback to refresh schedules in parent component
      if (onClassAssigned) {
        onClassAssigned();
      }

      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to assign class to trainer"
      );
      console.error("Error assigning class:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter trainers based on search
  const filteredTrainers = trainers.filter((trainer) => {
    if (!trainerSearch.trim()) return true;

    const searchTerm = trainerSearch.toLowerCase().trim();
    const firstName = (trainer.staff?.first_name || "").toLowerCase();
    const lastName = (trainer.staff?.last_name || "").toLowerCase();
    const fullName = `${firstName} ${lastName}`.trim();
    const specialization = (trainer.specialization || "").toLowerCase();
    const trainerId = String(
      trainer.trainer_id || trainer.id || ""
    ).toLowerCase();

    return (
      fullName.includes(searchTerm) ||
      firstName.includes(searchTerm) ||
      lastName.includes(searchTerm) ||
      specialization.includes(searchTerm) ||
      trainerId.includes(searchTerm)
    );
  });

  // Filter classes based on search
  const filteredClasses = classes.filter((cls) => {
    if (!classSearch.trim()) return true;

    const searchTerm = classSearch.toLowerCase().trim();
    const className = (cls.name || "").toLowerCase();
    const description = (cls.description || "").toLowerCase();
    const duration = String(cls.duration || "").toLowerCase();
    const classId = String(cls.class_id || cls.id || "").toLowerCase();

    return (
      className.includes(searchTerm) ||
      description.includes(searchTerm) ||
      duration.includes(searchTerm) ||
      classId.includes(searchTerm)
    );
  });

  const getTrainerName = (trainer) => {
    if (trainer.staff?.first_name && trainer.staff?.last_name) {
      return `${trainer.staff.first_name} ${trainer.staff.last_name}`;
    }
    return `Trainer #${trainer.trainer_id || trainer.id}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <Plus size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    Assign Class to Trainer
                  </h2>
                  <p className="text-green-100 mt-1">
                    Create a new class schedule
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                <span className="ml-2 text-gray-600">Loading data...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Success Message */}
                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-center gap-2"
                    >
                      <CheckCircle size={20} className="text-green-600" />
                      <span className="font-medium">
                        Class successfully assigned to trainer!
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-center gap-2"
                    >
                      <AlertCircle size={20} className="text-red-600" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Trainer Selection */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <User size={16} />
                    Select Trainer
                  </label>
                  <div className="space-y-3">
                    {/* Trainer Search */}
                    <div className="relative">
                      <Search
                        size={18}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Search trainers by name or specialization..."
                        value={trainerSearch}
                        onChange={(e) => setTrainerSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    {/* Trainer Selection */}
                    <select
                      value={selectedTrainer}
                      onChange={(e) => setSelectedTrainer(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Choose a trainer...</option>
                      {filteredTrainers.map((trainer) => (
                        <option
                          key={trainer.trainer_id || trainer.id}
                          value={trainer.trainer_id || trainer.id}
                        >
                          {getTrainerName(trainer)} -{" "}
                          {trainer.specialization || "General"}
                        </option>
                      ))}
                    </select>
                    {filteredTrainers.length === 0 && trainerSearch && (
                      <p className="text-sm text-gray-500">
                        No trainers match your search
                      </p>
                    )}
                  </div>
                </div>

                {/* Class Selection */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Dumbbell size={16} />
                    Select Class
                  </label>
                  <div className="space-y-3">
                    {/* Class Search */}
                    <div className="relative">
                      <Search
                        size={18}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Search classes by name or description..."
                        value={classSearch}
                        onChange={(e) => setClassSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    {/* Class Selection */}
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Choose a class...</option>
                      {filteredClasses.map((cls) => (
                        <option
                          key={cls.class_id || cls.id}
                          value={cls.class_id || cls.id}
                        >
                          {cls.name} ({cls.duration} min) -{" "}
                          {cls.description || "No description"}
                        </option>
                      ))}
                    </select>
                    {filteredClasses.length === 0 && classSearch && (
                      <p className="text-sm text-gray-500">
                        No classes match your search
                      </p>
                    )}
                  </div>
                </div>

                {/* Day Selection */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Calendar size={16} />
                    Day of Week
                  </label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose a day...</option>
                    {daysOfWeek.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Time Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Clock size={16} />
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Clock size={16} />
                      End Time
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || success}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Assigning...
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle size={18} />
                        Assigned!
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        Assign Class
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AssignClassModal;
