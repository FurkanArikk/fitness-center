import React, { useState, useEffect } from 'react';
import { Users, CreditCard, Activity, Dumbbell } from 'lucide-react';
import Loader from '../components/common/Loader';
import ServiceStatus from '../components/dashboard/ServiceStatus';
import StatsCard from '../components/dashboard/StatsCard';
import ClassSchedule from '../components/dashboard/ClassSchedule';
import PopularClasses from '../components/dashboard/PopularClasses';
import TrainersList from '../components/dashboard/TrainersList';
import PaymentStats from '../components/dashboard/PaymentStats';
import apiService from '../api/apiService';
import { SERVICE_PORTS } from '../api/endpoints';

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Dashboard data states
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [paymentStats, setPaymentStats] = useState(null);
  
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
      const healthPromises = Object.keys(SERVICE_PORTS).map(async (service) => {
        const isHealthy = await apiService.checkServiceHealth(service);
        return { service, isHealthy };
      });
      
      const results = await Promise.all(healthPromises);
      const healthStatus = results.reduce((acc, { service, isHealthy }) => {
        acc[service] = isHealthy;
        return acc;
      }, {});
      
      setServicesHealth(healthStatus);
    };
    
    checkHealth();
  }, []);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch data for dashboard
        const schedules = await apiService.getSchedules();
        setUpcomingClasses(Array.isArray(schedules) ? schedules.slice(0, 5) : []);
        
        const trainersData = await apiService.getTrainers();
        setTrainers(Array.isArray(trainersData) ? trainersData.slice(0, 4) : []);
        
        const paymentStatsData = await apiService.getPaymentStatistics();
        setPaymentStats(paymentStatsData);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader message="Loading dashboard data..." />
      </div>
    );
  }

  const membershipStats = [
    { title: 'Total Members', value: 358, change: '+12%', color: 'bg-blue-500', icon: <Users size={20} /> },
    { title: 'Active Members', value: 287, change: '+5%', color: 'bg-green-500', icon: <Users size={20} /> },
    { title: 'New Members (This Month)', value: 24, change: '+18%', color: 'bg-purple-500', icon: <Users size={20} /> },
    { title: 'Today\'s Visits', value: 78, change: '-3%', color: 'bg-yellow-500', icon: <Activity size={20} /> },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      <ServiceStatus servicesHealth={servicesHealth} />
      
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {membershipStats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            color={stat.color}
            icon={stat.icon}
          />
        ))}
      </div>
      
      {/* Today's Classes */}
      <ClassSchedule classes={upcomingClasses} />
      
      {/* Popular classes and trainers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PopularClasses />
        <TrainersList trainers={trainers} />
      </div>
      
      {/* Payment statistics */}
      <PaymentStats stats={paymentStats} />
    </div>
  );
};

export default Dashboard;