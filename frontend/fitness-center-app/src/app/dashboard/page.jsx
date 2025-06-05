"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  CreditCard,
  Activity,
  Dumbbell,
  TrendingUp,
  TrendingDown,
  BarChart3,
  RefreshCw,
  Sparkles,
  Zap,
  Edit3,
  UserPlus,
  Calendar,
  Settings,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Loader from "@/components/common/Loader";
import StatsCard from "@/components/dashboard/StatsCard";
import ClassSchedule from "@/components/dashboard/ClassSchedule";
import PopularClasses from "@/components/dashboard/PopularClasses";
import TrainersList from "@/components/dashboard/TrainersList";
import TopTrainersChart from "@/components/trainers/TopTrainersChart";
import PaymentStats from "@/components/dashboard/PaymentStats";
import {
  classService,
  staffService,
  paymentService,
  memberService,
} from "@/api";

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Dashboard data states
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [paymentStats, setPaymentStats] = useState(null);
  const [memberStats, setMemberStats] = useState({
    totalMembers: 358,
    activeMembers: 287,
    newMembers: 24,
    todayVisits: 78,
  });

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch data for dashboard
        const [schedulesData, trainersData, paymentStatsData] =
          await Promise.all([
            classService.getSchedules(),
            staffService.getTrainers(),
            paymentService.getPaymentStatistics(),
          ]);

        setUpcomingClasses(
          Array.isArray(schedulesData) ? schedulesData.slice(0, 5) : []
        );
        setTrainers(
          Array.isArray(trainersData) ? trainersData.slice(0, 4) : []
        );
        setPaymentStats(paymentStatsData);
        setLastUpdated(new Date());

        // In a real app, you'd fetch actual member statistics from the API
        // For now, we'll use the static data with some randomization for demo
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();

    // Set up real-time data refresh
    const dataRefreshInterval = setInterval(() => {
      if (autoRefresh) {
        loadDashboardData();
      }
    }, 60000); // Refresh every minute

    return () => clearInterval(dataRefreshInterval);
  }, [autoRefresh]);

  if (loading && upcomingClasses.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader message="Loading dashboard data..." />
      </div>
    );
  }

  const membershipStats = [
    {
      title: "Total Members",
      value: memberStats.totalMembers,
      change: "+12%",
      gradient: "from-blue-500 via-blue-600 to-indigo-600",
      icon: <Users size={24} />,
      trend: "up",
      bgPattern: "bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50",
      accentColor: "blue",
    },
    {
      title: "Active Members",
      value: memberStats.activeMembers,
      change: "+5%",
      gradient: "from-emerald-500 via-green-500 to-teal-600",
      icon: <Activity size={24} />,
      trend: "up",
      bgPattern: "bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50",
      accentColor: "emerald",
    },
    {
      title: "New Members",
      value: memberStats.newMembers,
      change: "+18%",
      gradient: "from-purple-500 via-violet-500 to-fuchsia-600",
      icon: <Sparkles size={24} />,
      trend: "up",
      bgPattern: "bg-gradient-to-r from-purple-50 via-violet-50 to-fuchsia-50",
      accentColor: "purple",
    },
    {
      title: "Today's Visits",
      value: memberStats.todayVisits,
      change: "-3%",
      gradient: "from-orange-500 via-amber-500 to-yellow-500",
      icon: <Zap size={24} />,
      trend: "down",
      bgPattern: "bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50",
      accentColor: "orange",
    },
  ];

  const handleRefresh = () => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [schedulesData, trainersData, paymentStatsData] =
          await Promise.all([
            classService.getSchedules(),
            staffService.getTrainers(),
            paymentService.getPaymentStatistics(),
          ]);

        setUpcomingClasses(
          Array.isArray(schedulesData) ? schedulesData.slice(0, 5) : []
        );
        setTrainers(
          Array.isArray(trainersData) ? trainersData.slice(0, 4) : []
        );
        setPaymentStats(paymentStatsData);
        setLastUpdated(new Date());
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
      {/* Modern Animated Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 space-y-8 p-6">
        {/* Ultra Modern Header */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-white/30 backdrop-blur-xl"></div>

          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-emerald-400/20 to-cyan-600/20 rounded-full blur-2xl animate-pulse delay-1000"></div>

          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center space-x-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition-all duration-300 animate-pulse"></div>
                <div className="relative p-5 rounded-3xl bg-gradient-to-br from-slate-100 to-blue-200 shadow-xl group-hover:scale-110 transition-all duration-300">
                  <BarChart3 size={36} className="text-slate-700" />
                </div>
              </div>
              <div>
                <h1 className="text-5xl font-black bg-gradient-to-r from-slate-800 via-blue-700 to-purple-800 bg-clip-text text-transparent mb-2">
                  Dashboard
                </h1>
                <p className="text-gray-700 text-lg font-medium mb-3">
                  ✨ Overview, key metrics and insights for your fitness center
                </p>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full animate-pulse shadow-lg"></div>
                    <span className="font-semibold">
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                  </div>
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`group flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 backdrop-blur-sm border ${
                      autoRefresh
                        ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200/50 hover:from-emerald-200 hover:to-green-200"
                        : "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200/50 hover:from-gray-200 hover:to-slate-200"
                    }`}
                  >
                    <RefreshCw
                      size={14}
                      className={`transition-all duration-300 ${
                        autoRefresh
                          ? "animate-spin text-emerald-600"
                          : "group-hover:rotate-180"
                      }`}
                    />
                    <span>Auto-refresh {autoRefresh ? "ON" : "OFF"}</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="group relative overflow-hidden bg-gradient-to-r from-slate-700 via-blue-700 to-purple-700 hover:from-slate-800 hover:via-blue-800 hover:to-purple-800 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-700"></div>
                <div className="relative flex items-center space-x-3">
                  <RefreshCw
                    size={20}
                    className={loading ? "animate-spin" : ""}
                  />
                  <span>Refresh Data</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="relative space-y-8">
          {error && (
            <div className="relative overflow-hidden bg-gradient-to-r from-red-500/10 via-rose-500/10 to-pink-500/10 backdrop-blur-xl border border-red-200/30 text-red-800 p-6 rounded-2xl shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-red-50/80 to-rose-50/80 backdrop-blur-sm"></div>
              <div className="relative flex items-center space-x-4">
                <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-rose-500 rounded-full animate-pulse shadow-lg"></div>
                <div>
                  <p className="font-bold text-lg">⚠️ Error</p>
                  <p className="font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Ultra Modern KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {membershipStats.map((stat, index) => (
              <div
                key={index}
                className={`group relative overflow-hidden ${stat.bgPattern} rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-white/40 backdrop-blur-sm`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: "fadeInUp 0.6s ease-out forwards",
                }}
              >
                {/* Animated background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-all duration-700"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/20 to-transparent rounded-full blur-xl group-hover:scale-125 transition-all duration-500"></div>

                <div className="relative z-10">
                  {/* Floating Icon */}
                  <div className="relative mb-6">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-all duration-300 animate-pulse`}
                    ></div>
                    <div
                      className={`relative w-20 h-20 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center text-white shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                    >
                      {stat.icon}
                      <div className="absolute inset-0 bg-white/20 rounded-2xl group-hover:bg-white/30 transition-all duration-300"></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-4">
                    <p className="text-gray-700 text-sm font-bold uppercase tracking-wider">
                      {stat.title}
                    </p>
                    <p className="text-4xl font-black text-gray-900 group-hover:scale-105 transition-all duration-300">
                      {stat.value.toLocaleString()}
                    </p>

                    {/* Modern Trend Indicator */}
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex items-center px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm border transition-all duration-300 ${
                          stat.trend === "up"
                            ? "bg-gradient-to-r from-emerald-100/80 to-green-100/80 text-emerald-800 border-emerald-200/50"
                            : "bg-gradient-to-r from-red-100/80 to-rose-100/80 text-red-800 border-red-200/50"
                        }`}
                      >
                        {stat.trend === "up" ? (
                          <TrendingUp size={16} className="mr-2" />
                        ) : (
                          <TrendingDown size={16} className="mr-2" />
                        )}
                        {stat.change}
                      </div>
                      <span className="text-xs text-gray-600 font-semibold bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full">
                        vs. last month
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Today's Classes */}
          <div className="transform transition-all duration-500 hover:scale-[1.01]">
            <ClassSchedule classes={upcomingClasses} />
          </div>

          {/* Popular classes and trainers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="transform transition-all duration-500 hover:scale-[1.01]">
              <PopularClasses />
            </div>
            <div className="transform transition-all duration-500 hover:scale-[1.01]">
              <TrainersList trainers={trainers} />
            </div>
          </div>

          {/* Payment statistics */}
          <div className="transform transition-all duration-500 hover:scale-[1.01]">
            <PaymentStats stats={paymentStats} />
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-white/30 backdrop-blur-xl"></div>

          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex-1">
              <h2 className="text-3xl font-black bg-gradient-to-r from-slate-800 via-blue-700 to-purple-800 bg-clip-text text-transparent mb-4">
                Quick Actions
              </h2>
              <p className="text-gray-700 text-sm font-medium mb-4">
                ⚡️ Perform common actions quickly and efficiently
              </p>
            </div>
            <div className="flex gap-4">
              <button className="flex-1 bg-gradient-to-r from-slate-700 via-blue-700 to-purple-700 hover:from-slate-800 hover:via-blue-800 hover:to-purple-800 text-white font-bold px-6 py-3 rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center space-x-2">
                <UserPlus size={20} />
                <span>Add Member</span>
              </button>
              <button className="flex-1 bg-gradient-to-r from-slate-700 via-blue-700 to-purple-700 hover:from-slate-800 hover:via-blue-800 hover:to-purple-800 text-white font-bold px-6 py-3 rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center space-x-2">
                <CreditCard size={20} />
                <span>Payments</span>
              </button>
            </div>
          </div>

          {/* Action cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-6 shadow-xl transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-white/10 rounded-3xl blur-xl"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-white/20 shadow-md">
                    <Calendar size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">
                      Schedule a Class
                    </p>
                    <p className="text-white/80 text-xs">
                      Plan and manage your classes
                    </p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-white/70" />
              </div>
            </div>
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl p-6 shadow-xl transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-white/10 rounded-3xl blur-xl"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-white/20 shadow-md">
                    <Settings size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">
                      System Settings
                    </p>
                    <p className="text-white/80 text-xs">
                      Configure your dashboard settings
                    </p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-white/70" />
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Dashboard;
