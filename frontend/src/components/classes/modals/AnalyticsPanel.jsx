import React, { useEffect, useState, useRef } from "react";
import { X, Download } from "lucide-react";
import { classService, staffService } from "@/api";
// If you have a chart library, import it here. Otherwise, use placeholders or minimal charts.
// import { Pie, Bar, Line } from 'react-chartjs-2';

const defaultRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
};

const AnalyticsPanel = ({ anchorRef, open, onClose }) => {
  const [range, setRange] = useState(defaultRange());
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const panelRef = useRef(null);

  // Position panel near anchor
  useEffect(() => {
    if (open && anchorRef?.current && panelRef.current) {
      const btnRect = anchorRef.current.getBoundingClientRect();
      const panel = panelRef.current;
      panel.style.top = `${btnRect.bottom + 8}px`;
      panel.style.left = `${btnRect.left}px`;
    }
  }, [open, anchorRef]);

  // Fetch analytics data
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError("");
    (async () => {
      try {
        // Fetch all classes (active & inactive)
        const allClasses = await classService.getClasses(false);
        const activeClasses = allClasses.filter((c) => c.is_active);
        // Fetch schedules for date range
        const schedules = await classService.getSchedules();
        // Fetch trainers
        const trainers = await staffService.getTrainers();
        // Compute stats
        const totalClasses = allClasses.length;
        const totalActive = activeClasses.length;
        // Participants per class (simulate if not available)
        const participantCounts = allClasses.map((c) => ({
          class_name: c.class_name,
          count: c.participant_count || 0,
          type: c.difficulty || "N/A",
        }));
        // Most popular trainers (simulate if not available)
        const trainerCounts = trainers.map((t) => ({
          name: t.name || t.full_name || t.username || "Trainer",
          count: t.participant_count || 0,
        }));
        // Classes held in last week/month
        const now = new Date(range.end);
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        const monthAgo = new Date(now);
        monthAgo.setDate(now.getDate() - 30);
        const heldLastWeek = schedules.filter((s) => {
          const d = new Date(s.date || s.start_time);
          return d >= weekAgo && d <= now;
        }).length;
        const heldLastMonth = schedules.filter((s) => {
          const d = new Date(s.date || s.start_time);
          return d >= monthAgo && d <= now;
        }).length;
        // Category analysis (simulate by difficulty)
        const categories = {};
        allClasses.forEach((c) => {
          const cat = c.category || c.difficulty || "Other";
          categories[cat] = (categories[cat] || 0) + (c.participant_count || 0);
        });
        setStats({
          totalClasses,
          totalActive,
          participantCounts,
          heldLastWeek,
          heldLastMonth,
          trainerCounts,
          categories,
        });
      } catch (e) {
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, range]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="fixed z-50 bg-white rounded-xl shadow-2xl border w-[420px] max-w-full p-6 animate-fade-in"
      style={{ minHeight: 320 }}
    >
      <button
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
        onClick={onClose}
        aria-label="Close"
      >
        <X size={22} />
      </button>
      <h3 className="text-lg font-bold mb-2">Class Analytics</h3>
      <div className="flex items-center gap-2 mb-4">
        <label className="text-xs font-medium">Date Range:</label>
        <input
          type="date"
          value={range.start}
          onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))}
          className="border rounded px-2 py-1 text-xs"
        />
        <span className="mx-1">-</span>
        <input
          type="date"
          value={range.end}
          onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))}
          className="border rounded px-2 py-1 text-xs"
        />
        <button
          className="ml-auto px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-1 text-xs"
          onClick={() => {
            /* TODO: Export as PDF/Excel */
          }}
        >
          <Download size={14} /> Export
        </button>
      </div>
      {loading ? (
        <div className="text-center py-8 text-gray-400">
          Loading analytics...
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : stats ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded p-3 text-center">
              <div className="text-xs text-gray-500">Total Classes</div>
              <div className="text-xl font-bold">
                {stats.totalClasses ?? "N/A"}
              </div>
            </div>
            <div className="bg-green-50 rounded p-3 text-center">
              <div className="text-xs text-gray-500">Active Classes</div>
              <div className="text-xl font-bold">
                {stats.totalActive ?? "N/A"}
              </div>
            </div>
            <div className="bg-purple-50 rounded p-3 text-center col-span-2">
              <div className="text-xs text-gray-500">
                Classes Held (Last Week)
              </div>
              <div className="text-lg font-semibold">
                {stats.heldLastWeek ?? "N/A"}
              </div>
            </div>
            <div className="bg-yellow-50 rounded p-3 text-center col-span-2">
              <div className="text-xs text-gray-500">
                Classes Held (Last Month)
              </div>
              <div className="text-lg font-semibold">
                {stats.heldLastMonth ?? "N/A"}
              </div>
            </div>
          </div>
          {/* Participation & Peak Analysis */}
          <div>
            <div className="font-semibold mb-1">
              Top Classes by Participation
            </div>
            <ul className="text-xs space-y-1">
              {stats.participantCounts?.length ? (
                stats.participantCounts
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 3)
                  .map((c, i) => (
                    <li key={i}>
                      <span className="font-medium">{c.class_name}</span>:{" "}
                      {c.count} participants
                    </li>
                  ))
              ) : (
                <li>N/A</li>
              )}
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-1">Most Popular Trainers</div>
            <ul className="text-xs space-y-1">
              {stats.trainerCounts?.length ? (
                stats.trainerCounts
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 3)
                  .map((t, i) => (
                    <li key={i}>
                      <span className="font-medium">{t.name}</span>: {t.count}{" "}
                      participants
                    </li>
                  ))
              ) : (
                <li>N/A</li>
              )}
            </ul>
          </div>
          {/* Category Pie Chart (placeholder) */}
          <div>
            <div className="font-semibold mb-1">Popular Categories</div>
            <div className="flex items-center gap-2">
              {/* Pie chart placeholder */}
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                Pie Chart
              </div>
              <ul className="text-xs">
                {Object.keys(stats.categories || {}).length ? (
                  Object.entries(stats.categories)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([cat, count], i) => (
                      <li key={i}>
                        <span className="font-medium">{cat}</span>: {count}
                      </li>
                    ))
                ) : (
                  <li>N/A</li>
                )}
              </ul>
            </div>
          </div>
          {/* Trend Chart (placeholder) */}
          <div>
            <div className="font-semibold mb-1">Classes Held Over Time</div>
            <div className="w-full h-20 bg-gray-100 rounded flex items-center justify-center text-gray-400">
              Trend Chart
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AnalyticsPanel;
