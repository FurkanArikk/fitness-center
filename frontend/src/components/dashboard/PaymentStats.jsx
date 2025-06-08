import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Calendar,
  PieChart,
  BarChart3,
  CheckCircle,
  Clock,
  XCircle,
  Zap,
  Target,
} from "lucide-react";

const PaymentStats = ({ stats }) => {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Process payment statistics or use mock data
    const processPaymentStats = () => {
      const mockStats = stats || {
        total_payments: 156,
        total_amount: 12456.78,
        average_amount: 79.85,
        pending_payments: 8,
        completed_payments: 142,
        failed_payments: 6,
        monthly_growth: 15.6,
        payment_methods: {
          credit_card: 67,
          cash: 23,
          bank_transfer: 10,
        },
      };

      const enrichedStats = {
        ...mockStats,
        monthly_revenue: mockStats.total_amount,
        success_rate: (
          (mockStats.completed_payments / mockStats.total_payments) *
          100
        ).toFixed(1),
        pending_rate: (
          (mockStats.pending_payments / mockStats.total_payments) *
          100
        ).toFixed(1),
        failed_rate: (
          (mockStats.failed_payments / mockStats.total_payments) *
          100
        ).toFixed(1),
        // Additional insights
        monthly_processed: mockStats.total_payments,
        last_failed_amount: 45.99,
        last_failed_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        success_trend: 2.1, // positive trend
        processing_trend: 8.5, // positive trend in processing volume
      };

      setTimeout(() => {
        setPaymentData(enrichedStats);
        setLoading(false);
      }, 500);
    };

    processPaymentStats();
  }, [stats]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Payment Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded-2xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
        <div className="text-center py-8">
          <DollarSign size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No Payment Data
          </h3>
          <p className="text-gray-500">
            Payment statistics will appear here when available.
          </p>
        </div>
      </div>
    );
  }

  const paymentMethodColors = {
    credit_card: {
      gradient: "from-blue-500 to-blue-600",
      bg: "from-blue-50 to-blue-100",
    },
    cash: {
      gradient: "from-emerald-500 to-emerald-600",
      bg: "from-emerald-50 to-emerald-100",
    },
    bank_transfer: {
      gradient: "from-purple-500 to-purple-600",
      bg: "from-purple-50 to-purple-100",
    },
  };

  const mainStats = [
    {
      title: "Total Revenue",
      value: `$${paymentData.monthly_revenue.toLocaleString()}`,
      change: `+${paymentData.monthly_growth}%`,
      icon: <DollarSign size={24} />,
      gradient: "from-emerald-500 to-emerald-600",
      trend: "up",
    },
    {
      title: "Average Payment",
      value: `$${paymentData.average_amount.toFixed(2)}`,
      change: "+5.2%",
      icon: <BarChart3 size={24} />,
      gradient: "from-blue-500 to-blue-600",
      trend: "up",
    },
    {
      title: "Success Rate",
      value: `${paymentData.success_rate}%`,
      change: "+2.1%",
      icon: <TrendingUp size={24} />,
      gradient: "from-purple-500 to-purple-600",
      trend: "up",
    },
  ];

  // Helper function to render payment methods section
  const renderPaymentMethods = () => {
    if (
      !paymentData.payment_methods ||
      Object.keys(paymentData.payment_methods).length === 0
    ) {
      return null;
    }

    return (
      <div className="space-y-3">
        {Object.entries(paymentData.payment_methods).map(
          ([method, percentage]) => {
            const methodConfig =
              paymentMethodColors[method] || paymentMethodColors.credit_card;
            const methodName = method
              .replace("_", " ")
              .replace(/\b\w/g, (l) => l.toUpperCase());

            return (
              <div
                key={method}
                className={`bg-gradient-to-r ${methodConfig.bg} rounded-xl p-4`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <CreditCard size={16} className="text-gray-600" />
                    <span className="text-sm font-medium text-gray-800">
                      {methodName}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-800">
                    {percentage}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${methodConfig.gradient} transition-all duration-1000 ease-out`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          }
        )}
      </div>
    );
  };

  // Helper function to render payment insights (fallback when no payment methods)
  const renderPaymentInsights = () => {
    return (
      <div className="space-y-4">
        {/* Success Rate Trend */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <Target size={20} className="text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-800">
                  Success Rate Trend
                </h4>
                <p className="text-xs text-emerald-600">Last 30 days</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-emerald-800">
                {paymentData.success_rate}%
              </div>
              <div className="flex items-center text-xs text-emerald-600">
                <TrendingUp size={12} className="mr-1" />+
                {paymentData.success_trend}%
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Processing Volume */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Zap size={20} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-blue-800">
                  Processed This Month
                </h4>
                <p className="text-xs text-blue-600">Total transactions</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-blue-800">
                {paymentData.monthly_processed}
              </div>
              <div className="flex items-center text-xs text-blue-600">
                <TrendingUp size={12} className="mr-1" />+
                {paymentData.processing_trend}%
              </div>
            </div>
          </div>
        </div>

        {/* Last Failed Payment */}
        {paymentData.failed_payments > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-6 border border-red-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-xl">
                  <XCircle size={20} className="text-red-600" />
                </div>
                <div>
                  <h4 className="font-bold text-red-800">
                    Last Failed Payment
                  </h4>
                  <p className="text-xs text-red-600">
                    {paymentData.last_failed_date.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-red-800">
                  ${paymentData.last_failed_amount}
                </div>
                <div className="text-xs text-red-600">
                  {paymentData.failed_payments} total failed
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Status Summary */}
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100">
          <h4 className="font-bold text-gray-800 mb-4">
            Quick Status Overview
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-full mx-auto mb-2">
                <CheckCircle size={16} className="text-emerald-600" />
              </div>
              <div className="text-lg font-bold text-gray-800">
                {paymentData.completed_payments}
              </div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-amber-100 rounded-full mx-auto mb-2">
                <Clock size={16} className="text-amber-600" />
              </div>
              <div className="text-lg font-bold text-gray-800">
                {paymentData.pending_payments}
              </div>
              <div className="text-xs text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full mx-auto mb-2">
                <XCircle size={16} className="text-red-600" />
              </div>
              <div className="text-lg font-bold text-gray-800">
                {paymentData.failed_payments}
              </div>
              <div className="text-xs text-gray-600">Failed</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const hasPaymentMethods =
    paymentData.payment_methods &&
    Object.keys(paymentData.payment_methods).length > 0;

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Payment Statistics
          </h2>
          <p className="text-gray-600">Financial overview and trends</p>
        </div>
        <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-emerald-100 px-3 py-2 rounded-xl">
          <PieChart size={16} className="text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700">
            Analytics
          </span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {mainStats.map((stat, index) => (
          <div
            key={stat.title}
            className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Background gradient overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-2xl`}
            ></div>

            <div className="relative z-10">
              {/* Icon */}
              <div
                className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
              >
                {stat.icon}
              </div>

              {/* Stats */}
              <div className="space-y-2">
                <p className="text-gray-600 text-sm font-medium">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>

                {/* Trend */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    <TrendingUp size={12} className="mr-1" />
                    {stat.change}
                  </div>
                  <span className="text-xs text-gray-500">vs. last month</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Status */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 text-lg mb-4">
            Payment Status
          </h3>

          <div className="space-y-3">
            {/* Completed */}
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-emerald-800">
                  Completed
                </span>
                <span className="text-sm font-bold text-emerald-800">
                  {paymentData.completed_payments}
                </span>
              </div>
              <div className="h-2 bg-emerald-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000 ease-out"
                  style={{ width: `${paymentData.success_rate}%` }}
                ></div>
              </div>
            </div>

            {/* Pending */}
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-amber-800">
                  Pending
                </span>
                <span className="text-sm font-bold text-amber-800">
                  {paymentData.pending_payments}
                </span>
              </div>
              <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-1000 ease-out"
                  style={{ width: `${paymentData.pending_rate}%` }}
                ></div>
              </div>
            </div>

            {/* Failed */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-800">Failed</span>
                <span className="text-sm font-bold text-red-800">
                  {paymentData.failed_payments}
                </span>
              </div>
              <div className="h-2 bg-red-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-400 to-red-600 transition-all duration-1000 ease-out"
                  style={{
                    width: `${paymentData.failed_rate}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Right Section: Payment Methods or Payment Insights */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 text-lg mb-4">
            {hasPaymentMethods ? "Payment Methods" : "Payment Insights"}
          </h3>

          {hasPaymentMethods ? renderPaymentMethods() : renderPaymentInsights()}
        </div>
      </div>
    </div>
  );
};

export default PaymentStats;
