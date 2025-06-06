"use client";

import React from "react";
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  CreditCard,
  ArrowUp,
  ArrowDown,
  Activity,
  Target,
} from "lucide-react";
import Card from "@/components/common/Card";

// Temporary formatCurrency function to resolve import issue
const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return "$0.00";
  return `$${parseFloat(amount).toFixed(2)}`;
};

const PaymentAnalytics = ({ stats }) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-2xl shadow-xl border border-gray-200 p-8 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-4 flex-1">
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-3/4"></div>
                <div className="h-10 bg-gradient-to-r from-gray-300 to-gray-400 rounded-xl w-full"></div>
                <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-1/2"></div>
              </div>
              <div className="h-16 w-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl ml-6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const analytics = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.total_amount || 0),
      icon: DollarSign,
      gradient: "from-emerald-500 to-green-600",
      bg: "from-emerald-50 to-green-100",
      iconBg: "bg-gradient-to-br from-emerald-100 to-green-200",
      iconColor: "text-emerald-700",
      subtitle: "This month",
      trend: "+12.5%",
      trendUp: true,
    },
    {
      title: "Total Payments",
      value: stats.total_payments || 0,
      icon: CreditCard,
      gradient: "from-blue-500 to-indigo-600",
      bg: "from-blue-50 to-indigo-100",
      iconBg: "bg-gradient-to-br from-blue-100 to-indigo-200",
      iconColor: "text-blue-700",
      subtitle: `${stats.pending_payments || 0} pending`,
      trend: "+8.2%",
      trendUp: true,
    },
    {
      title: "Average Payment",
      value: formatCurrency(stats.average_amount || 0),
      icon: TrendingUp,
      gradient: "from-amber-500 to-orange-600",
      bg: "from-amber-50 to-orange-100",
      iconBg: "bg-gradient-to-br from-amber-100 to-orange-200",
      iconColor: "text-amber-700",
      subtitle: "Per transaction",
      trend: "+5.7%",
      trendUp: true,
    },
    {
      title: "Active Members",
      value: stats.active_members || 0,
      icon: Users,
      gradient: "from-purple-500 to-violet-600",
      bg: "from-purple-50 to-violet-100",
      iconBg: "bg-gradient-to-br from-purple-100 to-violet-200",
      iconColor: "text-purple-700",
      subtitle: "Paying members",
      trend: "+3.1%",
      trendUp: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {analytics.map((item, index) => {
        const Icon = item.icon;

        return (
          <div
            key={index}
            className={`relative bg-gradient-to-br ${item.bg} rounded-2xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-all duration-500 hover:scale-105 group overflow-hidden`}
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl"></div>

            <div className="relative flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    {item.title}
                  </p>
                  {item.trend && (
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                        item.trendUp
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.trendUp ? (
                        <ArrowUp size={12} />
                      ) : (
                        <ArrowDown size={12} />
                      )}
                      {item.trend}
                    </div>
                  )}
                </div>

                <p
                  className={`text-3xl font-black mb-3 bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}
                >
                  {item.value}
                </p>

                <p className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                  <Activity size={14} className="text-gray-400" />
                  {item.subtitle}
                </p>
              </div>

              <div
                className={`p-4 rounded-2xl ${item.iconBg} ml-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon className={`w-8 h-8 ${item.iconColor}`} />
              </div>
            </div>

            {/* Animated progress bar at bottom */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${item.gradient} transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out`}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PaymentAnalytics;
