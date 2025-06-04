"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  CreditCard,
  Activity,
  Dumbbell,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import Loader from "@/components/common/Loader";
import ServiceStatus from "@/components/dashboard/ServiceStatus";
import StatsCard from "@/components/dashboard/StatsCard";
import ClassSchedule from "@/components/dashboard/ClassSchedule";
import PopularClasses from "@/components/dashboard/PopularClasses";
import TrainersList from "@/components/dashboard/TrainersList";
import PaymentStats from "@/components/dashboard/PaymentStats";
import { SERVICE_PORTS } from "@/api/endpoints";
import {
  healthService,
  classService,
  staffService,
  paymentService,
  memberService,
} from "@/api";

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // Service health states
  const [servicesHealth, setServicesHealth] = useState(
    Object.keys(SERVICE_PORTS).reduce((acc, service) => {
      acc[service] = false;
      return acc;
    }, {})
  );

  // Check service health on load
  useEffect(() => {
    const checkHealth = async () => {
      try {
        // Temporarily use mock data to avoid CORS errors during development
        console.log("Using mock health data for development");
        const mockHealth = healthService.getMockHealthData();
        setServicesHealth(mockHealth);

        // Uncomment below when backend services are running and CORS is configured
        // const healthStatus = await healthService.checkAllServicesHealth();
        // setServicesHealth(healthStatus);
      } catch (error) {
        console.warn("Health check failed, using mock data:", error);
        const mockHealth = healthService.getMockHealthData();
        setServicesHealth(mockHealth);
      }
    };

    checkHealth();

    // Set up real-time health check polling with mock data
    const healthCheckInterval = setInterval(async () => {
      try {
        // Use mock data for now to prevent console errors
        const mockHealth = healthService.getMockHealthData();
        setServicesHealth(mockHealth);
      } catch (error) {
        console.warn("Periodic health check failed:", error);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(healthCheckInterval);
  }, []);

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
    const dataRefreshInterval = setInterval(loadDashboardData, 60000); // Refresh every minute
    return () => clearInterval(dataRefreshInterval);
  }, []);

  if (loading) {
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
      gradient: "from-blue-500 to-blue-600",
      icon: <Users size={24} />,
      trend: "up",
    },
    {
      title: "Active Members",
      value: memberStats.activeMembers,
      change: "+5%",
      gradient: "from-emerald-500 to-emerald-600",
      icon: <Activity size={24} />,
      trend: "up",
    },
    {
      title: "New Members (This Month)",
      value: memberStats.newMembers,
      change: "+18%",
      gradient: "from-purple-500 to-purple-600",
      icon: <Users size={24} />,
      trend: "up",
    },
    {
      title: "Today's Visits",
      value: memberStats.todayVisits,
      change: "-3%",
      gradient: "from-amber-500 to-amber-600",
      icon: <Dumbbell size={24} />,
      trend: "down",
    },
  ];

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 text-lg">
          Welcome back! Here's what's happening at your fitness center.
        </p>
      </div>

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 p-6 rounded-2xl mb-6 shadow-lg">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></div>
            <div>
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Service Status */}
      <ServiceStatus servicesHealth={servicesHealth} />

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {membershipStats.map((stat, index) => (
          <div
            key={index}
            className="group relative bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
          >
            {/* Background gradient overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-3xl`}
            ></div>

            <div className="relative z-10">
              {/* Icon with gradient background */}
              <div
                className={`w-16 h-16 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                {stat.icon}
              </div>

              {/* Stats */}
              <div className="space-y-2">
                <p className="text-gray-600 text-sm font-medium">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {stat.value.toLocaleString()}
                </p>

                {/* Trend indicator */}
                <div className="flex items-center space-x-2">
                  <div
                    className={`flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                      stat.trend === "up"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <TrendingUp size={14} className="mr-1" />
                    ) : (
                      <TrendingDown size={14} className="mr-1" />
                    )}
                    {stat.change}
                  </div>
                  <span className="text-xs text-gray-500">vs. last month</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Classes */}
      <ClassSchedule classes={upcomingClasses} />

      {/* Popular classes and trainers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PopularClasses />
        <TrainersList trainers={trainers} />
      </div>

      {/* Payment statistics */}
      <PaymentStats stats={paymentStats} />
    </div>
  );
};

export default Dashboard;
