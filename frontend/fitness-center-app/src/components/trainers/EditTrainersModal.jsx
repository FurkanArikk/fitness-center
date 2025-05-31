import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit,
  Save,
  X,
  User,
  Award,
  Calendar,
  Star,
  CheckCircle,
  AlertCircle,
  Users,
  Activity,
  Mail,
  Phone,
  MapPin,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { staffService } from "@/api";

const EditTrainersModal = ({ isOpen, onClose, onTrainersUpdated }) => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [formData, setFormData] = useState({});

  // Fetch trainers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchTrainers();
    }
  }, [isOpen]);

  const fetchTrainers = async () => {
    setLoading(true);
    setError("");
    try {
      const trainersData = await staffService.getTrainers();
      const trainersArray = Array.isArray(trainersData) ? trainersData : [];
      setTrainers(trainersArray);
    } catch (err) {
      console.error("Failed to fetch trainers:", err);
      setError("Failed to load trainers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTrainer = (trainer) => {
    setEditingTrainer(trainer);
    setFormData({
      specialization: trainer.specialization || "",
      certification: trainer.certification || "",
      experience: trainer.experience || 0,
      rating: trainer.rating || 0,
      is_active: trainer.is_active !== false,
      // Staff information (if available)
      first_name: trainer.staff?.first_name || "",
      last_name: trainer.staff?.last_name || "",
      email: trainer.staff?.email || "",
      phone: trainer.staff?.phone || "",
      position: trainer.staff?.position || "",
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveTrainer = async () => {
    if (!editingTrainer) return;

    setSaving(true);
    setError("");

    try {
      // Prepare trainer data
      const trainerData = {
        specialization: formData.specialization,
        certification: formData.certification,
        experience: parseInt(formData.experience) || 0,
        rating: parseFloat(formData.rating) || 0,
        is_active: formData.is_active,
      };

      // Update trainer using the staff service
      const trainerId = editingTrainer.trainer_id || editingTrainer.id;
      await staffService.updateTrainer?.(trainerId, trainerData);

      // Update local state
      setTrainers((prev) =>
        prev.map((trainer) =>
          (trainer.trainer_id || trainer.id) === trainerId
            ? { ...trainer, ...trainerData }
            : trainer
        )
      );

      setSuccess("Trainer updated successfully!");
      setEditingTrainer(null);

      // Call callback to update parent component
      if (onTrainersUpdated) {
        onTrainersUpdated();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to update trainer:", err);
      setError("Failed to update trainer. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setEditingTrainer(null);
      setFormData({});
      setError("");
      setSuccess("");
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !saving) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.15)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl"
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow:
              "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg"
              >
                <Edit className="text-white" size={24} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Edit Trainers
                </h2>
                <p className="text-sm text-gray-600">
                  Manage trainer information and status
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              disabled={saving}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
            >
              <X size={24} className="text-gray-500" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
            {/* Success Message */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center"
                >
                  <CheckCircle size={20} className="mr-3 flex-shrink-0" />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center"
              >
                <AlertCircle size={20} className="mr-3 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
                />
                <span className="ml-3 text-gray-600">Loading trainers...</span>
              </div>
            ) : trainers.length === 0 ? (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No trainers found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {trainers.map((trainer, index) => {
                  const trainerId = trainer.trainer_id || trainer.id;
                  const isEditing =
                    editingTrainer &&
                    (editingTrainer.trainer_id || editingTrainer.id) ===
                      trainerId;

                  return (
                    <motion.div
                      key={trainerId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200/70 rounded-2xl overflow-hidden"
                      style={{
                        background: "rgba(255, 255, 255, 0.8)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                      }}
                    >
                      {/* Trainer Header */}
                      <div className="p-5 bg-gradient-to-r from-gray-50/80 to-white/80">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                              <User className="text-white" size={20} />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">
                                {trainer.staff?.first_name &&
                                trainer.staff?.last_name
                                  ? `${trainer.staff.first_name} ${trainer.staff.last_name}`
                                  : `Trainer #${trainerId}`}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Award size={14} />
                                  {trainer.specialization || "General"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star size={14} />
                                  {trainer.rating || 0}/5
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  {trainer.experience || 0} years
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {/* Active Status Toggle */}
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                const newStatus = !trainer.is_active;
                                // Update immediately for better UX
                                setTrainers((prev) =>
                                  prev.map((t) =>
                                    (t.trainer_id || t.id) === trainerId
                                      ? { ...t, is_active: newStatus }
                                      : t
                                  )
                                );
                                // TODO: Call API to update status
                              }}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                                trainer.is_active
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                              }`}
                            >
                              {trainer.is_active ? (
                                <ToggleRight
                                  size={16}
                                  className="text-green-600"
                                />
                              ) : (
                                <ToggleLeft
                                  size={16}
                                  className="text-gray-400"
                                />
                              )}
                              {trainer.is_active ? "Active" : "Inactive"}
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEditTrainer(trainer)}
                              disabled={saving}
                              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                              <Edit size={16} />
                              Edit
                            </motion.button>
                          </div>
                        </div>
                      </div>

                      {/* Edit Form */}
                      <AnimatePresence>
                        {isEditing && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-gray-200/50"
                          >
                            <div className="p-6 space-y-6">
                              {/* Personal Information */}
                              <div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                  <User size={18} />
                                  Personal Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      First Name
                                    </label>
                                    <input
                                      type="text"
                                      value={formData.first_name}
                                      onChange={(e) =>
                                        handleInputChange(
                                          "first_name",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="Enter first name"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Last Name
                                    </label>
                                    <input
                                      type="text"
                                      value={formData.last_name}
                                      onChange={(e) =>
                                        handleInputChange(
                                          "last_name",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="Enter last name"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Email
                                    </label>
                                    <input
                                      type="email"
                                      value={formData.email}
                                      onChange={(e) =>
                                        handleInputChange(
                                          "email",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="Enter email"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Phone
                                    </label>
                                    <input
                                      type="tel"
                                      value={formData.phone}
                                      onChange={(e) =>
                                        handleInputChange(
                                          "phone",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="Enter phone number"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Professional Information */}
                              <div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                  <Award size={18} />
                                  Professional Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Specialization
                                    </label>
                                    <select
                                      value={formData.specialization}
                                      onChange={(e) =>
                                        handleInputChange(
                                          "specialization",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                      <option value="">
                                        Select specialization
                                      </option>
                                      <option value="Weight Loss">
                                        Weight Loss
                                      </option>
                                      <option value="Strength Training">
                                        Strength Training
                                      </option>
                                      <option value="Cardio Fitness">
                                        Cardio Fitness
                                      </option>
                                      <option value="Yoga and Flexibility">
                                        Yoga and Flexibility
                                      </option>
                                      <option value="Sports Training">
                                        Sports Training
                                      </option>
                                      <option value="Senior Fitness">
                                        Senior Fitness
                                      </option>
                                      <option value="Rehabilitation">
                                        Rehabilitation
                                      </option>
                                      <option value="Nutrition Coaching">
                                        Nutrition Coaching
                                      </option>
                                      <option value="CrossFit">CrossFit</option>
                                      <option value="Pilates">Pilates</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Certification
                                    </label>
                                    <select
                                      value={formData.certification}
                                      onChange={(e) =>
                                        handleInputChange(
                                          "certification",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                      <option value="">
                                        Select certification
                                      </option>
                                      <option value="NASM Certified Personal Trainer">
                                        NASM Certified Personal Trainer
                                      </option>
                                      <option value="ACE Personal Trainer">
                                        ACE Personal Trainer
                                      </option>
                                      <option value="ACSM Certified Personal Trainer">
                                        ACSM Certified Personal Trainer
                                      </option>
                                      <option value="NSCA Certified Strength and Conditioning Specialist">
                                        NSCA CSCS
                                      </option>
                                      <option value="ISSA Certified Personal Trainer">
                                        ISSA Certified Personal Trainer
                                      </option>
                                      <option value="Registered Yoga Teacher (RYT)">
                                        Registered Yoga Teacher (RYT)
                                      </option>
                                      <option value="CrossFit Level 1 Trainer">
                                        CrossFit Level 1 Trainer
                                      </option>
                                      <option value="Pilates Instructor Certification">
                                        Pilates Instructor Certification
                                      </option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Experience (years)
                                    </label>
                                    <input
                                      type="number"
                                      min="0"
                                      max="50"
                                      value={formData.experience}
                                      onChange={(e) =>
                                        handleInputChange(
                                          "experience",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="Years of experience"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Rating (1-5)
                                    </label>
                                    <input
                                      type="number"
                                      min="1"
                                      max="5"
                                      step="0.1"
                                      value={formData.rating}
                                      onChange={(e) =>
                                        handleInputChange(
                                          "rating",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="Rating"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Status */}
                              <div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                  <Activity size={18} />
                                  Status
                                </h4>
                                <label className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "is_active",
                                        e.target.checked
                                      )
                                    }
                                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">
                                    Active (trainer can receive assignments)
                                  </span>
                                </label>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200/50">
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setEditingTrainer(null)}
                                  disabled={saving}
                                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                  Cancel
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={handleSaveTrainer}
                                  disabled={saving}
                                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                  {saving ? (
                                    <>
                                      <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{
                                          duration: 1,
                                          repeat: Infinity,
                                          ease: "linear",
                                        }}
                                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                      />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Save size={16} />
                                      Save Changes
                                    </>
                                  )}
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditTrainersModal;
