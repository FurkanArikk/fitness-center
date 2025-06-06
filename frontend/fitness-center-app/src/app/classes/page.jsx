"use client";

import React, { useState, useEffect, useRef } from "react";
import { Calendar, Plus, Search, Filter, XCircle } from "lucide-react";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Loader from "@/components/common/Loader";
import ClassCalendar from "@/components/classes/ClassCalendar";
import ClassManagement from "@/components/classes/ClassManagement";
import ClassCard from "@/components/classes/ClassCard";
import ClassCapacityPieChart from "@/components/classes/ClassCapacityPieChart";
import ClassActivityAreaChart from "@/components/classes/TrainerActivityChart";
import { classService, staffService } from "@/api";
import AddClassModal from "@/components/classes/modals/AddClassModal";
import EditClassesModal from "@/components/classes/modals/EditClassesModal";
import { toast } from "react-hot-toast";
import { Switch } from "@headlessui/react";

const difficultyOptions = [
  { label: "All", value: "" },
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
];

// Inline mini trend line SVG
const MiniTrendLine = ({ data = [] }) => {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data
    .map(
      (v, i) =>
        `${(i / (data.length - 1)) * 100},${
          100 - ((v - min) / (max - min || 1)) * 100
        }`
    )
    .join(" ");
  return (
    <svg width="100" height="30" viewBox="0 0 100 100" className="mt-1">
      <polyline fill="none" stroke="#3b82f6" strokeWidth="4" points={points} />
    </svg>
  );
};

const AnalyticsPanel = React.forwardRef(
  ({ open, onClose, anchorRef, stats, loading }, ref) => {
    if (!open) return null;
    // Position panel below and right of anchor
    const [style, setStyle] = useState({});
    useEffect(() => {
      if (anchorRef?.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        setStyle({
          position: "fixed",
          top: rect.bottom + 8,
          left: rect.left,
          zIndex: 1000,
          minWidth: 320,
          maxWidth: 400,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          borderRadius: 12,
        });
      }
    }, [anchorRef, open]);
    return (
      <div
        ref={ref}
        style={style}
        className="bg-white border p-4 animate-fade-in"
      >
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold text-lg">Advanced Analytics</h4>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>
        {loading ? (
          <Loader size="small" message="Loading analytics..." />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-xs text-gray-500">Total Classes</div>
                <div className="font-bold text-lg">{stats.totalClasses}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Active Classes</div>
                <div className="font-bold text-lg">{stats.activeClasses}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Total Participants</div>
                <div className="font-bold text-lg">
                  {stats.totalParticipants}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Classes Last Week</div>
                <div className="font-bold text-lg">{stats.lastWeek}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Classes Last Month</div>
                <div className="font-bold text-lg">{stats.lastMonth}</div>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Weekly Trend</div>
              <MiniTrendLine data={stats.trendData} />
            </div>
          </>
        )}
      </div>
    );
  }
);

const InactiveClassesPanel = ({
  anchorRef,
  open,
  onClose,
  onActivate,
  classService,
}) => {
  const [inactiveClasses, setInactiveClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    classService
      .getClasses(false)
      .then((data) => {
        setInactiveClasses(Array.isArray(data) ? data : []);
      })
      .catch(() => setError("Failed to fetch inactive classes."))
      .finally(() => setLoading(false));
  }, [open, classService]);

  const handleActivate = async (classId) => {
    try {
      await classService.updateClass(classId, { is_active: true });
      setInactiveClasses((prev) => prev.filter((c) => c.class_id !== classId));
      if (typeof onActivate === "function") onActivate();
    } catch {
      setError("Failed to activate class.");
    }
  };

  // Filtered list
  const filtered = search
    ? inactiveClasses.filter((c) =>
        c.class_name.toLowerCase().includes(search.toLowerCase())
      )
    : inactiveClasses;

  // Positioning logic
  const [panelStyle, setPanelStyle] = useState({});
  useEffect(() => {
    if (open && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPanelStyle({
        position: "absolute",
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        minWidth: rect.width,
        zIndex: 1000,
      });
    }
  }, [open, anchorRef]);

  // Dismiss on outside click
  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (
        anchorRef?.current &&
        !anchorRef.current.contains(e.target) &&
        !document.getElementById("inactive-classes-panel")?.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, anchorRef, onClose]);

  if (!open) return null;
  return (
    <div
      id="inactive-classes-panel"
      style={panelStyle}
      className="bg-white rounded-xl shadow-2xl border p-4 max-w-md w-[350px] animate-fade-in"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-lg">Inactive Classes</span>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-gray-400 hover:text-gray-700"
        >
          <XCircle size={22} />
        </button>
      </div>
      <div className="mb-3 flex items-center gap-2">
        <Search size={18} className="text-gray-400" />
        <input
          className="border rounded px-2 py-1 w-full text-sm"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <Loader size="small" message="Loading inactive classes..." />
      ) : error ? (
        <div className="text-red-500 text-sm mb-2">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center text-gray-500 py-8">
          <XCircle size={36} className="mb-2" />
          <span>No inactive classes found</span>
        </div>
      ) : (
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {filtered.map((cls) => (
            <div
              key={cls.class_id}
              className="border rounded-lg p-3 flex flex-col gap-1 bg-gray-50 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{cls.class_name}</span>
                <button
                  className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                  onClick={() => handleActivate(cls.class_id)}
                >
                  Activate
                </button>
              </div>
              <div className="text-xs text-gray-600 flex flex-wrap gap-2">
                <span>Duration: {cls.duration} min</span>
                {cls.trainer_name && <span>Trainer: {cls.trainer_name}</span>}
                {cls.last_held_date && (
                  <span>
                    Last held:{" "}
                    {new Date(cls.last_held_date).toLocaleDateString()}
                  </span>
                )}
                {cls.deactivated_at && (
                  <span>
                    Deactivated:{" "}
                    {new Date(cls.deactivated_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ClassVisibilityPanel = ({ open, onClose, classService }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState({}); // { [class_id]: true/false }

  // Fetch all classes
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    classService
      .getClasses(false)
      .then((data) => setClasses(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to fetch classes."))
      .finally(() => setLoading(false));
  }, [open, classService]);

  // Filtered list
  const filtered = search
    ? classes.filter((c) =>
        c.class_name.toLowerCase().includes(search.toLowerCase())
      )
    : classes;

  // Toggle class active/inactive
  const handleToggle = async (cls) => {
    setToggling((prev) => ({ ...prev, [cls.class_id]: true }));
    try {
      await classService.updateClass(cls.class_id, {
        is_active: !cls.is_active,
      });
      // Refresh list
      const data = await classService.getClasses(false);
      setClasses(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to update class status.");
    } finally {
      setToggling((prev) => ({ ...prev, [cls.class_id]: false }));
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[75vh] overflow-y-auto relative animate-fade-in mx-4">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl z-10"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        {/* Modal Content */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Class Visibility
          </h2>

          {/* Search Bar */}
          <div className="mb-6 flex items-center gap-3">
            <Search size={18} className="text-gray-400" />
            <input
              className="border rounded-lg px-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader size="large" message="Loading classes..." />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center text-gray-500 py-12">
              <XCircle size={48} className="mb-4" />
              <span className="text-lg">No classes found</span>
            </div>
          ) : (
            /* Class List */
            <div className="space-y-4 max-h-[50vh] overflow-y-auto">
              {filtered.map((cls) => (
                <div
                  key={cls.class_id}
                  className={`border rounded-lg p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 shadow-sm transition-all duration-200 ${
                    toggling[cls.class_id] ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium text-lg text-gray-900">
                      {cls.class_name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Duration: {cls.duration} min
                      {cls.capacity && ` • Capacity: ${cls.capacity}`}
                      {cls.difficulty && ` • Level: ${cls.difficulty}`}
                    </div>
                    {cls.description && (
                      <div className="text-xs text-gray-500 mt-1">
                        {cls.description}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span
                      className={`text-sm px-3 py-1 rounded-full font-medium ${
                        cls.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {cls.is_active ? "Active" : "Inactive"}
                    </span>
                    <Switch
                      checked={!!cls.is_active}
                      onChange={() => handleToggle(cls)}
                      className={`${
                        cls.is_active ? "bg-green-500" : "bg-gray-300"
                      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200`}
                      disabled={!!toggling[cls.class_id]}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          cls.is_active ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </Switch>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {!loading && filtered.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600 text-center">
                Showing {filtered.length} of {classes.length} classes •{" "}
                {classes.filter((c) => c.is_active).length} active •{" "}
                {classes.filter((c) => !c.is_active).length} inactive
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ViewAllTrainersPanel = ({ open, onClose, staffService }) => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [specializationFilter, setSpecializationFilter] = useState("");

  // Helper function to get trainer name safely from API response
  const getTrainerName = (trainer) => {
    if (!trainer) return "Unknown Trainer";

    // Check for direct name field
    if (trainer.name) {
      return trainer.name;
    }

    // Check for first_name and last_name
    if (trainer.first_name && trainer.last_name) {
      return `${trainer.first_name} ${trainer.last_name}`;
    }

    // Check for staff object with first_name and last_name
    if (trainer.staff && trainer.staff.first_name && trainer.staff.last_name) {
      return `${trainer.staff.first_name} ${trainer.staff.last_name}`;
    }

    // Fallback to just first_name or last_name if available
    if (trainer.first_name) {
      return trainer.first_name;
    }

    if (trainer.last_name) {
      return trainer.last_name;
    }

    // Final fallback with ID
    const trainerId = trainer.trainer_id || trainer.staff_id || trainer.id;
    return `Trainer #${trainerId}`;
  };

  // Fetch all trainers
  useEffect(() => {
    if (!open) return;

    const fetchTrainers = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to get trainers first
        let trainerData = await staffService.getTrainers();

        // If no trainers or empty, try to get all staff and filter for trainers
        if (!trainerData || trainerData.length === 0) {
          const staffData = await staffService.getStaff();
          // Filter staff who are trainers (have trainer-related fields or position)
          trainerData = staffData.filter(
            (staff) =>
              staff.position?.toLowerCase().includes("trainer") ||
              staff.specialization ||
              staff.certification ||
              staff.rating
          );
        }

        setTrainers(Array.isArray(trainerData) ? trainerData : []);
      } catch (err) {
        console.error("Error fetching trainers:", err);
        setError("Failed to fetch trainers.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, [open, staffService]);

  // Get unique specializations for filter (handle multiple possible field names)
  const specializations = [
    ...new Set(
      trainers
        .map(
          (t) =>
            t.specialization ||
            t.specialty ||
            t.area_of_expertise ||
            (t.position?.toLowerCase().includes("trainer") ? t.position : null)
        )
        .filter(Boolean)
    ),
  ];

  // Enhanced filtering function
  const filtered = trainers.filter((trainer) => {
    const trainerName = getTrainerName(trainer);
    const email = trainer.email || trainer.staff?.email || "";
    const specialization =
      trainer.specialization ||
      trainer.specialty ||
      trainer.area_of_expertise ||
      "";
    const position = trainer.position || "";

    const matchesSearch = search
      ? trainerName.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase()) ||
        specialization.toLowerCase().includes(search.toLowerCase()) ||
        position.toLowerCase().includes(search.toLowerCase())
      : true;

    const matchesSpecialization = specializationFilter
      ? specialization.toLowerCase() === specializationFilter.toLowerCase() ||
        position.toLowerCase() === specializationFilter.toLowerCase()
      : true;

    return matchesSearch && matchesSpecialization;
  });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[75vh] overflow-y-auto relative animate-fade-in mx-4">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl z-10"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        {/* Modal Content */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            All Trainers
          </h2>

          {/* Search and Filter Bar */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-3 flex-1">
              <Search size={18} className="text-gray-400" />
              <input
                className="border rounded-lg px-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Search by name, email, or specialization..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {specializations.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-400" />
                <select
                  className="border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                >
                  <option value="">All Specializations</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader size="large" message="Loading trainers..." />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center text-gray-500 py-12">
              <XCircle size={48} className="mb-4" />
              <span className="text-lg">
                {trainers.length === 0
                  ? "No trainers found"
                  : "No trainers match your search"}
              </span>
              {trainers.length === 0 && (
                <p className="text-sm mt-2 text-center">
                  Add staff members with trainer positions or create trainer
                  profiles to see them here.
                </p>
              )}
            </div>
          ) : (
            /* Trainers Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto">
              {filtered.map((trainer) => {
                const trainerName = getTrainerName(trainer);
                const email =
                  trainer.email || trainer.staff?.email || "No email provided";
                const phone = trainer.phone || trainer.staff?.phone;
                const specialization =
                  trainer.specialization ||
                  trainer.specialty ||
                  trainer.area_of_expertise ||
                  trainer.position;
                const rating = trainer.rating || trainer.average_rating;
                const experience =
                  trainer.experience ||
                  trainer.experience_years ||
                  trainer.years_of_experience;
                const hourlyRate =
                  trainer.hourly_rate ||
                  trainer.rate_per_hour ||
                  trainer.salary;
                const isAvailable =
                  trainer.is_available !== false &&
                  trainer.status !== "Inactive";
                const bio = trainer.bio || trainer.description;
                const certifications =
                  trainer.certifications || trainer.certification
                    ? [trainer.certification]
                    : [];
                const trainerId =
                  trainer.trainer_id || trainer.staff_id || trainer.id;

                return (
                  <div
                    key={trainerId}
                    className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="font-medium text-lg text-gray-900 mb-1">
                          {trainerName}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          📧 {email}
                        </div>
                        {phone && (
                          <div className="text-sm text-gray-600 mb-2">
                            📞 {phone}
                          </div>
                        )}
                      </div>
                      {rating && rating > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="text-sm font-medium">
                            {Number(rating).toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {specialization && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {specialization}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                        {experience && (
                          <span className="bg-gray-200 px-2 py-1 rounded">
                            {experience} years exp.
                          </span>
                        )}
                        {hourlyRate && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                            ${Number(hourlyRate).toFixed(0)}/hr
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 rounded ${
                            isAvailable
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </div>

                      {bio && (
                        <div className="text-xs text-gray-500 mt-2 line-clamp-2">
                          {bio}
                        </div>
                      )}

                      {certifications && certifications.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-500 mb-1">
                            Certifications:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {certifications.slice(0, 3).map((cert, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded"
                              >
                                {cert}
                              </span>
                            ))}
                            {certifications.length > 3 && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                +{certifications.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Summary */}
          {!loading && filtered.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600 text-center">
                Showing {filtered.length} of {trainers.length} trainers
                {specializationFilter &&
                  ` • Filtered by: ${specializationFilter}`}
                {trainers.filter(
                  (t) => t.is_available !== false && t.status !== "Inactive"
                ).length > 0 && (
                  <>
                    {" "}
                    •{" "}
                    {
                      trainers.filter(
                        (t) =>
                          t.is_available !== false && t.status !== "Inactive"
                      ).length
                    }{" "}
                    available
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Panel wrapper for all primary actions
const ConnectedPanel = ({
  anchorRef,
  open,
  onClose,
  children,
  width = 700,
}) => {
  const [panelStyle, setPanelStyle] = useState({});
  const [arrowStyle, setArrowStyle] = useState({});
  const [arrowLeft, setArrowLeft] = useState(0);
  const panelRef = useRef();

  useEffect(() => {
    if (open && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      // Calculate left so panel is centered to button, but not off-screen
      let left = rect.left + rect.width / 2 - width / 2;
      left = Math.max(16, Math.min(left, window.innerWidth - width - 16));
      setPanelStyle({
        position: "fixed",
        top: rect.bottom + 14,
        left,
        width,
        maxWidth: "95vw",
        zIndex: 1000,
        borderRadius: 18,
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        background: "#fff",
        border: "1px solid #e5e7eb",
        transition:
          "opacity 0.25s cubic-bezier(.4,0,.2,1), transform 0.25s cubic-bezier(.4,0,.2,1)",
        animation: open
          ? "fadeInPanel .25s cubic-bezier(.4,0,.2,1)"
          : undefined,
        overflow: "hidden",
      });
      // Arrow should be centered to button
      setArrowLeft(rect.left + rect.width / 2 - left - 16);
    }
  }, [open, anchorRef, width]);

  // Dismiss on outside click
  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (
        anchorRef?.current &&
        !anchorRef.current.contains(e.target) &&
        !panelRef.current?.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, anchorRef, onClose]);

  if (!open) return null;
  return (
    <div
      style={panelStyle}
      ref={panelRef}
      className="connected-panel animate-fade-in"
    >
      {/* Arrow/caret visually connected to button */}
      <div
        style={{
          position: "absolute",
          top: -18,
          left: arrowLeft,
          zIndex: 1001,
        }}
      >
        <svg width="32" height="18" viewBox="0 0 32 18">
          <polygon
            points="16,0 32,18 0,18"
            fill="#fff"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        </svg>
      </div>
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl z-10"
      >
        ×
      </button>
      <div className="p-8">{children}</div>
    </div>
  );
};

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsStats, setAnalyticsStats] = useState({
    totalClasses: 0,
    activeClasses: 0,
    totalParticipants: 0,
    lastWeek: 0,
    lastMonth: 0,
    trendData: [],
  });
  const analyticsBtnRef = useRef();
  const inactiveBtnRef = useRef();
  const classVisibilityBtnRef = useRef();
  const [showInactivePanel, setShowInactivePanel] = useState(false);
  const [showClassVisibility, setShowClassVisibility] = useState(false);
  const [showAllTrainers, setShowAllTrainers] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClasses, setTotalClasses] = useState(0);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const classesData = await classService.getClasses(true); // Only active classes for main view
        setClasses(Array.isArray(classesData) ? classesData : []);
        const schedulesData = await classService.getSchedules();
        setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
        const trainersData = await staffService.getTrainers();
        setTrainers(Array.isArray(trainersData) ? trainersData : []);
      } catch (err) {
        setError("Failed to load class data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Update total classes count and calculate total pages
    setTotalClasses(classes.length);
    setTotalPages(Math.ceil(classes.length / ITEMS_PER_PAGE));
  }, [classes]);

  useEffect(() => {
    // Reset to first page when search or filter changes
    setCurrentPage(1);
  }, [search, difficulty]);

  // Calculate filtered classes
  const filteredClasses = classes.filter((c) => {
    const matchesSearch = c.class_name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesDifficulty = difficulty
      ? c.difficulty?.toLowerCase() === difficulty
      : true;
    return matchesSearch && matchesDifficulty;
  });

  // Calculate pagination values - using the totalPages from state
  const totalFilteredClasses = filteredClasses.length;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageClasses = filteredClasses.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handleCardClick = (classItem) => {
    setSelectedClass(classItem);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClass(null);
  };

  const handleAddNewClass = async (form) => {
    setAddLoading(true);
    setAddError("");
    try {
      await classService.createClass({
        ...form,
        duration: Number(form.duration),
        capacity: Number(form.capacity),
      });
      setAddModalOpen(false);
      await fetchData();
      if (typeof toast === "function")
        toast.success("Class created successfully!");
    } catch (err) {
      setAddError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create class."
      );
    } finally {
      setAddLoading(false);
    }
  };

  // Refetch classes, schedules, and trainers
  const fetchData = async () => {
    setLoading(true);
    try {
      const classesData = await classService.getClasses(true); // Only active classes for main view
      setClasses(Array.isArray(classesData) ? classesData : []);
      const schedulesData = await classService.getSchedules();
      setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
      const trainersData = await staffService.getTrainers();
      setTrainers(Array.isArray(trainersData) ? trainersData : []);
    } catch (err) {
      setError("Failed to load class data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Edit class API handler
  const handleUpdateClass = async (id, form) => {
    setEditLoading(true);
    setEditError("");
    try {
      await classService.updateClass(id, form);
      await fetchData();
    } catch (err) {
      setEditError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update class."
      );
      throw err;
    } finally {
      setEditLoading(false);
    }
  };

  // Delete class API handler
  const handleDeleteClass = async (id) => {
    setEditLoading(true);
    setEditError("");
    try {
      await classService.deleteClass(id);
      await fetchData();
    } catch (err) {
      setEditError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete class."
      );
      throw err;
    } finally {
      setEditLoading(false);
    }
  };

  // Analytics fetch logic - Enhanced with real API data
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      // Fetch all necessary data in parallel with error handling
      const [allClasses, activeClasses, allBookings, allSchedules] =
        await Promise.allSettled([
          classService.getClasses(false, 1, 1000), // Get all classes
          classService.getClasses(true, 1, 1000), // Get only active classes
          classService.getBookings(null, null, 1, 1000), // Get all bookings
          classService.getSchedules(undefined, 1, 1000), // Get all schedules without status filter
        ]);

      // Extract successful results or use empty arrays as fallback
      const allClassesData =
        allClasses.status === "fulfilled" ? allClasses.value : [];
      const activeClassesData =
        activeClasses.status === "fulfilled" ? activeClasses.value : [];
      const allBookingsData =
        allBookings.status === "fulfilled" ? allBookings.value : [];
      const allSchedulesData =
        allSchedules.status === "fulfilled" ? allSchedules.value : [];

      // Log any failed requests
      if (allClasses.status === "rejected")
        console.warn("Failed to fetch all classes:", allClasses.reason);
      if (activeClasses.status === "rejected")
        console.warn("Failed to fetch active classes:", activeClasses.reason);
      if (allBookings.status === "rejected")
        console.warn("Failed to fetch bookings:", allBookings.reason);
      if (allSchedules.status === "rejected")
        console.warn("Failed to fetch schedules:", allSchedules.reason);

      // Calculate unique participants from bookings
      const uniqueParticipants = new Set(
        allBookingsData
          .filter((booking) => booking.member_id)
          .map((booking) => booking.member_id)
      ).size;

      // Calculate time-based metrics
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Filter schedules for last week and month
      const schedulesLastWeek = allSchedulesData.filter((schedule) => {
        const scheduleDate = new Date(
          schedule.created_at || schedule.start_time
        );
        return scheduleDate >= oneWeekAgo && scheduleDate <= now;
      }).length;

      const schedulesLastMonth = allSchedulesData.filter((schedule) => {
        const scheduleDate = new Date(
          schedule.created_at || schedule.start_time
        );
        return scheduleDate >= oneMonthAgo && scheduleDate <= now;
      }).length;

      // Calculate 6-week trend data for heartbeat chart
      const trendData = [];
      for (let i = 5; i >= 0; i--) {
        const weekStart = new Date(
          now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000
        );
        const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);

        const weeklyCount = allSchedulesData.filter((schedule) => {
          const scheduleDate = new Date(
            schedule.created_at || schedule.start_time
          );
          return scheduleDate >= weekStart && scheduleDate < weekEnd;
        }).length;

        trendData.push(weeklyCount);
      }

      // Calculate additional metrics
      const totalBookings = allBookingsData.length;
      const attendedBookings = allBookingsData.filter(
        (booking) => booking.attendance_status === "attended"
      ).length;
      const attendanceRate =
        totalBookings > 0 ? (attendedBookings / totalBookings) * 100 : 0;

      // Calculate average class capacity utilization
      const classUtilization =
        activeClassesData.length > 0
          ? activeClassesData.reduce(
              (acc, cls) => acc + (cls.capacity || 0),
              0
            ) / activeClassesData.length
          : 0;

      setAnalyticsStats({
        totalClasses: allClassesData.length,
        activeClasses: activeClassesData.length,
        totalParticipants: uniqueParticipants,
        lastWeek: schedulesLastWeek,
        lastMonth: schedulesLastMonth,
        trendData,
        totalBookings,
        attendanceRate: Math.round(attendanceRate),
        averageCapacity: Math.round(classUtilization),
        inactiveClasses: allClassesData.length - activeClassesData.length,
      });
    } catch (error) {
      console.error("Failed to fetch analytics data:", error);
      // Set fallback data on error
      setAnalyticsStats({
        totalClasses: 0,
        activeClasses: 0,
        totalParticipants: 0,
        lastWeek: 0,
        lastMonth: 0,
        trendData: [0, 0, 0, 0, 0, 0],
        totalBookings: 0,
        attendanceRate: 0,
        averageCapacity: 0,
        inactiveClasses: 0,
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Helper function to determine KPI card colors based on values
  const getKPIColor = (value, type) => {
    // Define thresholds based on KPI type
    const thresholds = {
      total: { low: 5, medium: 15, high: 25 },
      active: { low: 3, medium: 10, high: 20 },
      participants: { low: 5, medium: 15, high: 30 },
      week: { low: 3, medium: 8, high: 15 },
      month: { low: 10, medium: 25, high: 40 },
    };

    const threshold = thresholds[type] || thresholds.total;

    if (value <= threshold.low) {
      return "bg-gradient-to-br from-blue-500 to-blue-600"; // Cool blue for low values
    } else if (value <= threshold.medium) {
      return "bg-gradient-to-br from-green-500 to-green-600"; // Green for medium values
    } else if (value <= threshold.high) {
      return "bg-gradient-to-br from-orange-500 to-orange-600"; // Warm orange for high values
    } else {
      return "bg-gradient-to-br from-red-500 to-red-600"; // Red for very high values
    }
  };

  // Animated Heartbeat Chart Component with dynamic data
  const HeartbeatChart = ({ trendData = [] }) => {
    // Generate heartbeat pattern based on real trend data
    const generateHeartbeatPoints = (data) => {
      if (!data.length) {
        // Fallback static pattern if no data
        return "0,30 20,30 25,10 30,50 35,30 40,30 60,30 65,15 70,45 75,30 80,30 100,30 105,20 110,40 115,30 120,30 140,30 145,12 150,48 155,30 160,30 180,30 185,18 190,42 195,30 200,30";
      }

      // Create dynamic heartbeat pattern based on trend data
      const points = [];
      const baseY = 30;
      const width = 200;
      const segmentWidth = width / data.length;

      data.forEach((value, index) => {
        const x = index * segmentWidth;
        const nextX = x + segmentWidth;

        // Normalize value to heartbeat intensity (higher values = bigger spikes)
        const intensity = Math.min(value * 2, 20); // Cap at 20px spike

        // Add baseline points
        points.push(`${x},${baseY}`);

        // Add heartbeat spike based on data value
        if (value > 0) {
          points.push(`${x + segmentWidth * 0.2},${baseY}`);
          points.push(`${x + segmentWidth * 0.3},${baseY - intensity}`);
          points.push(`${x + segmentWidth * 0.4},${baseY + intensity * 0.8}`);
          points.push(`${x + segmentWidth * 0.5},${baseY}`);
        }

        // Connect to next segment
        if (index < data.length - 1) {
          points.push(`${nextX},${baseY}`);
        }
      });

      return points.join(" ");
    };

    return (
      <svg
        width="200"
        height="60"
        viewBox="0 0 200 60"
        className="heartbeat-chart"
      >
        <defs>
          <linearGradient
            id="heartbeatGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#10B981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Dynamic heartbeat line based on trend data */}
        <polyline
          fill="none"
          stroke="url(#heartbeatGradient)"
          strokeWidth="2"
          points={generateHeartbeatPoints(trendData)}
          className="heartbeat-line"
        />

        {/* Baseline */}
        <line
          x1="0"
          y1="30"
          x2="200"
          y2="30"
          stroke="#E5E7EB"
          strokeWidth="1"
          opacity="0.3"
        />

        {/* Data points indicators */}
        {trendData.map((value, index) => {
          const x =
            (index * 200) / trendData.length + 200 / trendData.length / 2;
          return (
            <circle
              key={index}
              cx={x}
              cy="30"
              r="2"
              fill="#3B82F6"
              opacity="0.6"
              className="data-point"
            />
          );
        })}

        <style jsx>{`
          .heartbeat-line {
            stroke-dasharray: 400;
            stroke-dashoffset: 400;
            animation: heartbeat 4s ease-in-out infinite;
          }

          .data-point {
            animation: pulse 2s ease-in-out infinite;
          }

          @keyframes heartbeat {
            0% {
              stroke-dashoffset: 400;
            }
            100% {
              stroke-dashoffset: 0;
            }
          }

          @keyframes pulse {
            0%,
            100% {
              opacity: 0.6;
            }
            50% {
              opacity: 1;
              transform: scale(1.2);
            }
          }

          .heartbeat-chart {
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
          }
        `}</style>
      </svg>
    );
  };

  if (loading && classes.length === 0) {
    return <Loader message="Loading class data..." />;
  }

  return (
    <div className="space-y-8 relative">
      {/* Modern Header Section */}
      <div className="bg-gradient-to-br from-white via-rose-50 to-orange-50 rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-100 to-orange-200 shadow-lg">
              <Calendar size={32} className="text-rose-700" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
                Class Management
              </h1>
              <p className="text-gray-600 mt-2 font-medium">
                Manage all fitness classes with style
              </p>
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                  <span>Live Updates</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="primary"
              icon={<Plus size={20} />}
              onClick={() => setAddModalOpen(true)}
              className="bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Add New Class
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Class Cards Grid */}
      <div className="space-y-6">
        {/* Results Summary */}
        {filteredClasses.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-sm">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {Math.min(
                  (currentPage - 1) * ITEMS_PER_PAGE + 1,
                  filteredClasses.length
                )}
                -
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredClasses.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">
                {filteredClasses.length}
              </span>{" "}
              {filteredClasses.length === 1 ? "class" : "classes"}
              {(search || difficulty) && " matching your criteria"}
            </p>
            {classes.length !== filteredClasses.length && (
              <p className="text-xs text-gray-500">
                {classes.length - filteredClasses.length} classes hidden by
                filters
              </p>
            )}
          </div>
        )}

        {/* 4x2 Grid Layout (8 classes per page) */}
        {filteredClasses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentPageClasses.map((classItem, idx) => (
              <div
                key={classItem.class_id}
                className="transform transition-all duration-200 hover:scale-105"
              >
                <ClassCard
                  classItem={classItem}
                  index={(currentPage - 1) * ITEMS_PER_PAGE + idx}
                  onClick={handleCardClick}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="currentColor"
              >
                <path d="M32 8C18.7 8 8 18.7 8 32s10.7 24 24 24 24-10.7 24-24S45.3 8 32 8zm0 44c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20z" />
                <path d="M26 24h12v4H26zM26 32h12v4H26zM26 40h8v4h-8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No classes found
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              {search || difficulty
                ? "Try adjusting your search criteria or filters to find more classes."
                : "No classes are currently available. Please check back later or contact support."}
            </p>
            {(search || difficulty) && (
              <button
                onClick={() => {
                  setSearch("");
                  setDifficulty("");
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Modern Pagination Controls */}
        {Math.ceil(filteredClasses.length / ITEMS_PER_PAGE) > 1 && (
          <div className="flex justify-center items-center gap-2 py-6">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow-md"
                }
              `}
              disabled={currentPage === 1}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                />
              </svg>
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => {
                if (page === "...") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-3 py-2 text-gray-500 text-sm"
                    >
                      ...
                    </span>
                  );
                }

                const isCurrentPage = page === currentPage;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`
                      px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                      ${
                        isCurrentPage
                          ? "bg-blue-600 text-white shadow-md shadow-blue-200 transform scale-105"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm"
                      }
                    `}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(
                    prev + 1,
                    Math.ceil(filteredClasses.length / ITEMS_PER_PAGE)
                  )
                )
              }
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  currentPage ===
                  Math.ceil(filteredClasses.length / ITEMS_PER_PAGE)
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow-md"
                }
              `}
              disabled={
                currentPage ===
                Math.ceil(filteredClasses.length / ITEMS_PER_PAGE)
              }
            >
              Next
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Class Details Modal */}
      {showModal && selectedClass && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            backgroundColor: "rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative animate-fade-in">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={closeModal}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-2">
              {selectedClass.class_name}
            </h3>
            <div className="mb-2 text-gray-700">
              {selectedClass.description || "No description provided."}
            </div>
            <div className="flex gap-4 mb-2">
              <span className="text-sm bg-gray-100 rounded px-2 py-1">
                Duration: {selectedClass.duration} min
              </span>
              <span className="text-sm bg-gray-100 rounded px-2 py-1">
                Capacity: {selectedClass.capacity}
              </span>
            </div>
            {selectedClass.difficulty && (
              <div className="text-xs text-gray-500 mb-2">
                Level: {selectedClass.difficulty}
              </div>
            )}
            {/* Add more details as needed */}
          </div>
        </div>
      )}
      {/* Management Table & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions Panel */}
        <ClassManagement
          onAddNewClass={() => setAddModalOpen(true)}
          onEditClasses={() => setEditModalOpen(true)}
          onGoToAnalytics={() => {
            setAnalyticsOpen(true);
            fetchAnalytics();
          }}
          onToggleInactiveClasses={() => setShowInactivePanel((v) => !v)}
          onClassVisibilityClick={() => setShowClassVisibility((v) => !v)}
          onViewAllTrainers={() => setShowAllTrainers(true)}
          analyticsBtnRef={analyticsBtnRef}
          inactiveBtnRef={inactiveBtnRef}
          classVisibilityBtnRef={classVisibilityBtnRef}
        />
        {/* Inactive Classes Floating Panel */}
        <InactiveClassesPanel
          anchorRef={inactiveBtnRef}
          open={showInactivePanel}
          onClose={() => setShowInactivePanel(false)}
          onActivate={fetchData}
          classService={classService}
        />
        {/* Class Visibility Modal */}
        <ClassVisibilityPanel
          open={showClassVisibility}
          onClose={() => setShowClassVisibility(false)}
          classService={classService}
        />
        {/* View All Trainers Panel */}
        <ViewAllTrainersPanel
          open={showAllTrainers}
          onClose={() => setShowAllTrainers(false)}
          staffService={staffService}
        />
        {/* Enhanced Analytics Section */}
        <Card title="Class Analytics">
          <div className="flex flex-col items-center justify-center py-3">
            {/* Class Activity Chart */}
            <ClassCapacityPieChart classes={classes} />
          </div>
        </Card>
      </div>
      {/* Class Activity Section */}
      <Card title="Class Activity">
        <ClassActivityAreaChart schedules={schedules} />
      </Card>
      <ConnectedPanel
        anchorRef={addModalOpen}
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        width={700}
      >
        <AddClassModal
          open={addModalOpen}
          onCancel={() => {
            setAddModalOpen(false);
            setAddError("");
          }}
          onSubmit={handleAddNewClass}
          loading={addLoading}
          error={addError}
        />
      </ConnectedPanel>
      <ConnectedPanel
        anchorRef={editModalOpen}
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        width={700}
      >
        <EditClassesModal
          open={editModalOpen}
          classes={classes}
          onCancel={() => setEditModalOpen(false)}
          onUpdateClass={handleUpdateClass}
          onDeleteClass={handleDeleteClass}
          loading={editLoading}
          error={editError}
        />
      </ConnectedPanel>
      {/* Analytics Modal - Dynamic API data with screenshot layout */}
      {analyticsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[75vh] overflow-y-auto relative animate-fade-in mx-4">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl z-10"
              onClick={() => setAnalyticsOpen(false)}
              aria-label="Close"
            >
              ×
            </button>

            {/* Dashboard Content */}
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Class Analytics
              </h2>

              {analyticsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader size="large" message="Loading analytics data..." />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Panel - Top Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Total Classes */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                      <div className="text-white/90 text-sm font-medium mb-2 uppercase tracking-wide">
                        Total Classes
                      </div>
                      <div className="text-3xl font-bold">
                        {analyticsStats.totalClasses}
                      </div>
                    </div>

                    {/* Active Classes */}
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                      <div className="text-white/90 text-sm font-medium mb-2 uppercase tracking-wide">
                        Active Classes
                      </div>
                      <div className="text-3xl font-bold">
                        {analyticsStats.activeClasses}
                      </div>
                    </div>

                    {/* Total Participants */}
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                      <div className="text-white/90 text-sm font-medium mb-2 uppercase tracking-wide">
                        Total Participants
                      </div>
                      <div className="text-3xl font-bold">
                        {analyticsStats.totalParticipants}
                      </div>
                    </div>
                  </div>

                  {/* Panel - Recent Activity */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Recent Class Activity
                    </h3>
                    <div className="space-y-3">
                      {/* Activity Item - Example */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                          <span>New class created: Yoga for Beginners</span>
                        </div>
                        <span className="whitespace-nowrap">10 mins ago</span>
                      </div>

                      {/* Activity Item - Example */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                          <span>Class cancelled: Advanced Pilates</span>
                        </div>
                        <span className="whitespace-nowrap">1 hour ago</span>
                      </div>

                      {/* Add more activity items as needed */}
                    </div>
                  </div>

                  {/* Panel - Weekly Trend */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Weekly Class Trend
                    </h3>
                    <div className="flex items-center justify-center h-32">
                      <HeartbeatChart
                        trendData={
                          analyticsStats.trendData.length > 0
                            ? analyticsStats.trendData
                            : [0, 0, 0, 0, 0, 0]
                        }
                      />
                    </div>
                    <div className="text-center text-gray-500 text-sm mt-3">
                      6-week activity pattern • Higher spikes = More activity
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;
