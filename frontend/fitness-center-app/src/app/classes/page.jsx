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

const ClassVisibilityPanel = ({ anchorRef, open, onClose, classService }) => {
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

  // Popper-style positioning and arrow
  const [panelStyle, setPanelStyle] = useState({});
  const [arrowStyle, setArrowStyle] = useState({});
  useEffect(() => {
    if (open && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPanelStyle({
        position: "absolute",
        top: rect.bottom + window.scrollY + 12,
        left: rect.left + window.scrollX,
        minWidth: rect.width,
        zIndex: 1000,
        transition: "opacity 0.2s cubic-bezier(.4,0,.2,1)",
        // Remove any marginTop, paddingTop, or height that could cause a bar
      });
      setArrowStyle({
        position: "absolute",
        top: -8, // Only enough for the arrow SVG
        left: 32,
        zIndex: 1001,
        width: 24,
        height: 12,
        pointerEvents: "none", // Arrow should not block clicks
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
        !document.getElementById("class-visibility-panel")?.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, anchorRef, onClose]);

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
      id="class-visibility-panel"
      style={panelStyle}
      className="bg-white rounded-xl shadow-2xl border p-4 max-w-md w-[350px] animate-fade-in relative transition-all duration-200"
    >
      {/* Only render the small arrow, no extra bar */}
      <div style={arrowStyle}>
        <svg width="24" height="12" viewBox="0 0 24 12">
          <polygon
            points="12,0 24,12 0,12"
            fill="#fff"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        </svg>
      </div>
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-lg">Class Visibility</span>
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
        <Loader size="small" message="Loading classes..." />
      ) : error ? (
        <div className="text-red-500 text-sm mb-2">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center text-gray-500 py-8">
          <XCircle size={36} className="mb-2" />
          <span>No classes found</span>
        </div>
      ) : (
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {filtered.map((cls) => (
            <div
              key={cls.class_id}
              className={`border rounded-lg p-3 flex items-center justify-between bg-gray-50 shadow-sm transition-all duration-200 ${
                toggling[cls.class_id] ? "opacity-60" : ""
              }`}
            >
              <div>
                <div className="font-medium text-sm">{cls.class_name}</div>
                <div className="text-xs text-gray-600">
                  Duration: {cls.duration} min
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    cls.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {cls.is_active ? "Active" : "Inactive"}
                </span>
                <Switch
                  checked={!!cls.is_active}
                  onChange={() => handleToggle(cls)}
                  className={`$${
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const classesData = await classService.getClasses();
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

  const filteredClasses = classes.filter((c) => {
    const matchesSearch = c.class_name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesDifficulty = difficulty
      ? c.difficulty?.toLowerCase() === difficulty
      : true;
    return matchesSearch && matchesDifficulty;
  });

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
      const classesData = await classService.getClasses();
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

  // Analytics fetch logic
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      // Use already-fetched classes and schedules if possible
      const allClasses = await classService.getClasses(false); // all
      const activeClasses = await classService.getClasses(true); // only active
      const bookings = await classService.getBookings();
      const schedules = await classService.getSchedules();
      // Participants: count unique member IDs in bookings
      const participantIds = new Set(bookings.map((b) => b.member_id));
      // Classes held last week/month: count schedules in date range
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      const lastWeek = schedules.filter((s) => {
        const d = new Date(s.created_at || s.start_time);
        return d >= weekAgo && d <= now;
      }).length;
      const lastMonth = schedules.filter((s) => {
        const d = new Date(s.created_at || s.start_time);
        return d >= monthAgo && d <= now;
      }).length;
      // Trend: classes held per week for last 6 weeks
      const trendData = [];
      for (let i = 5; i >= 0; i--) {
        const start = new Date(now);
        start.setDate(now.getDate() - i * 7);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        const count = schedules.filter((s) => {
          const d = new Date(s.created_at || s.start_time);
          return d >= start && d <= end;
        }).length;
        trendData.push(count);
      }
      setAnalyticsStats({
        totalClasses: allClasses.length,
        activeClasses: activeClasses.length,
        totalParticipants: participantIds.size,
        lastWeek,
        lastMonth,
        trendData,
      });
    } catch (e) {
      setAnalyticsStats({
        totalClasses: 0,
        activeClasses: 0,
        totalParticipants: 0,
        lastWeek: 0,
        lastMonth: 0,
        trendData: [],
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  if (loading && classes.length === 0) {
    return <Loader message="Loading class data..." />;
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold">Class Schedule</h2>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="secondary"
            onClick={() => console.log("Toggle view")}
          >
            Weekly View
          </Button>
          <Button
            variant="primary"
            icon={<Calendar size={18} />}
            onClick={() => console.log("Add new class")}
          >
            Add New Class
          </Button>
        </div>
      </div>
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-center mb-2">
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring"
            placeholder="Search classes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={18} className="text-gray-400" />
          <select
            className="border rounded-lg py-2 px-3 focus:outline-none"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            {difficultyOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredClasses.map((classItem, idx) => (
          <ClassCard
            key={classItem.class_id}
            classItem={classItem}
            index={idx}
            onClick={handleCardClick}
          />
        ))}
        {filteredClasses.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-8">
            No classes found.
          </div>
        )}
      </div>
      {/* Class Details Modal */}
      {showModal && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(0, 0, 0, 0.1)'
        }}>
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
        {/* Class Management with Quick Actions Panel (large area) */}
        <Card title="Class Management">
          <ClassManagement
            onAddNewClass={() => setAddModalOpen(true)}
            onEditClasses={() => setEditModalOpen(true)}
            onExportClassList={() => {
              /* TODO: Export as PDF/Excel */
            }}
            onImportClasses={() => {
              /* TODO: Import from CSV */
            }}
            onGoToAnalytics={() => {
              setAnalyticsOpen(true);
              fetchAnalytics();
            }}
            onToggleInactiveClasses={() => setShowInactivePanel((v) => !v)}
            onClassVisibilityClick={() => setShowClassVisibility((v) => !v)}
            onViewAllTrainers={() => {
              /* TODO: Go to trainers list */
            }}
            onFilterActiveClasses={() => {
              /* TODO: Filter active classes */
            }}
            onFilterUpcomingClasses={() => {
              /* TODO: Filter upcoming classes */
            }}
            analyticsBtnRef={analyticsBtnRef}
            inactiveBtnRef={inactiveBtnRef}
            classVisibilityBtnRef={classVisibilityBtnRef}
          />
          {/* Placeholder for sortable/searchable table with CRUD actions */}
          <div className="text-gray-500 text-center py-8">
            Sortable/searchable table with CRUD actions coming soon.
          </div>
          {/* Inactive Classes Floating Panel */}
          <InactiveClassesPanel
            anchorRef={inactiveBtnRef}
            open={showInactivePanel}
            onClose={() => setShowInactivePanel(false)}
            onActivate={fetchData}
            classService={classService}
          />
          {/* Class Visibility Floating Panel */}
          <ClassVisibilityPanel
            anchorRef={classVisibilityBtnRef}
            open={showClassVisibility}
            onClose={() => setShowClassVisibility(false)}
            classService={classService}
          />
        </Card>
        {/* Enhanced Analytics Section */}
        <Card title="Class Analytics">
          <div className="space-y-4">
            {/* Pie Chart for Capacity Distribution by Class */}
            <div>
              <p className="text-sm font-medium mb-2">
                Class Capacity Distribution
              </p>
              <ClassCapacityPieChart classes={classes} />
            </div>
            {/* Attendance Rate Chart Placeholder */}
            <div>
              <p className="text-sm font-medium mb-1">Attendance Rate</p>
              <div className="w-full h-4 bg-gray-200 rounded-full">
                <div
                  className="h-4 bg-green-500 rounded-full"
                  style={{ width: "78%" }}
                ></div>
              </div>
              <p className="text-right text-sm mt-1">78%</p>
            </div>
            {/* Most Popular Times Chart Placeholder */}
            <div>
              <p className="text-sm font-medium mb-1">
                Most Popular Time Slots
              </p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="p-2 bg-blue-50 rounded text-center">
                  <p className="font-medium">Morning</p>
                  <p className="text-blue-700">32%</p>
                </div>
                <div className="p-2 bg-yellow-50 rounded text-center">
                  <p className="font-medium">Afternoon</p>
                  <p className="text-yellow-700">21%</p>
                </div>
                <div className="p-2 bg-purple-50 rounded text-center">
                  <p className="font-medium">Evening</p>
                  <p className="text-purple-700">47%</p>
                </div>
              </div>
            </div>
            {/* Top Trainers Placeholder */}
            <div>
              <p className="text-sm font-medium mb-1">Top Trainers</p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                  Alex Kim
                </span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  Jamie Lee
                </span>
                <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs">
                  Morgan Smith
                </span>
              </div>
            </div>
            {/* Member Feedback Placeholder */}
            <div>
              <p className="text-sm font-medium mb-1">Member Feedback</p>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-yellow-400">
                    ★
                  </span>
                ))}
                <span className="ml-2">4.7/5</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                "Great variety of classes and amazing trainers!"
              </div>
            </div>
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
      <ConnectedPanel
        anchorRef={classVisibilityBtnRef}
        open={showClassVisibility}
        onClose={() => setShowClassVisibility(false)}
        width={700}
      >
        {/* Class list with status switches here */}
      </ConnectedPanel>
      <ConnectedPanel
        anchorRef={analyticsBtnRef}
        open={analyticsOpen}
        onClose={() => setAnalyticsOpen(false)}
        width={700}
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold">Class Analytics</h2>
          </div>
          {analyticsLoading ? (
            <Loader size="medium" message="Loading analytics..." />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg shadow">
                  <div className="text-xs text-gray-500">Total Classes</div>
                  <div className="font-bold text-2xl">
                    {analyticsStats.totalClasses}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg shadow">
                  <div className="text-xs text-gray-500">Active Classes</div>
                  <div className="font-bold text-2xl">
                    {analyticsStats.activeClasses}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg shadow">
                  <div className="text-xs text-gray-500">
                    Total Participants
                  </div>
                  <div className="font-bold text-2xl">
                    {analyticsStats.totalParticipants}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg shadow">
                  <div className="text-xs text-gray-500">Classes Last Week</div>
                  <div className="font-bold text-2xl">
                    {analyticsStats.lastWeek}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg shadow">
                  <div className="text-xs text-gray-500">
                    Classes Last Month
                  </div>
                  <div className="font-bold text-2xl">
                    {analyticsStats.lastMonth}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Weekly Trend</div>
                <MiniTrendLine data={analyticsStats.trendData} />
              </div>
            </>
          )}
        </div>
      </ConnectedPanel>
    </div>
  );
};

export default Classes;
