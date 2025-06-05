import React from "react";
import {
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Zap,
} from "lucide-react";
import Card from "../common/Card";

const PaymentCharts = ({ stats }) => {
  // Humanize payment method names
  const humanizePaymentMethod = (method) => {
    const methodMap = {
      credit_card: "Credit Card",
      bank_transfer: "Bank Transfer",
      cash: "Cash",
      debit_card: "Debit Card",
      paypal: "PayPal",
      apple_pay: "Apple Pay",
      google_pay: "Google Pay",
      cryptocurrency: "Cryptocurrency",
      check: "Check",
      wire_transfer: "Wire Transfer",
    };

    return (
      methodMap[method.toLowerCase()] ||
      method.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  };

  // Get payment method distribution from API data
  const getPaymentMethods = () => {
    if (
      !stats ||
      !stats.payment_method_statistics ||
      stats.payment_method_statistics.length === 0
    ) {
      // Fallback data if no API data is available
      return [
        {
          name: "Credit Card",
          value: 68,
          count: 68,
          icon: CreditCard,
          gradient: "from-blue-500 to-indigo-600",
          bgGradient: "from-blue-50 to-indigo-100",
        },
        {
          name: "Bank Transfer",
          value: 22,
          count: 22,
          icon: Smartphone,
          gradient: "from-emerald-500 to-green-600",
          bgGradient: "from-emerald-50 to-green-100",
        },
        {
          name: "Cash",
          value: 10,
          count: 10,
          icon: Banknote,
          gradient: "from-amber-500 to-yellow-600",
          bgGradient: "from-amber-50 to-yellow-100",
        },
      ];
    }

    // Map API data to component format
    return stats.payment_method_statistics.map((method) => {
      let icon = CreditCard;
      let gradient = "from-gray-500 to-gray-600";
      let bgGradient = "from-gray-50 to-gray-100";
      const methodName = method.payment_method.toLowerCase();

      // Map payment methods to appropriate icons and colors
      switch (methodName) {
        case "credit_card":
        case "credit card":
        case "card":
          icon = CreditCard;
          gradient = "from-blue-500 to-indigo-600";
          bgGradient = "from-blue-50 to-indigo-100";
          break;
        case "bank_transfer":
        case "bank transfer":
        case "transfer":
          icon = Smartphone;
          gradient = "from-emerald-500 to-green-600";
          bgGradient = "from-emerald-50 to-green-100";
          break;
        case "cash":
          icon = Banknote;
          gradient = "from-amber-500 to-yellow-600";
          bgGradient = "from-amber-50 to-yellow-100";
          break;
        default:
          icon = CreditCard;
          gradient = "from-gray-500 to-gray-600";
          bgGradient = "from-gray-50 to-gray-100";
      }

      return {
        name: humanizePaymentMethod(method.payment_method),
        value: method.percentage,
        count: method.count,
        icon,
        gradient,
        bgGradient,
      };
    });
  };

  const paymentMethods = getPaymentMethods();

  // Calculate status distribution
  const getStatusDistribution = () => {
    if (!stats) {
      return [
        {
          name: "Completed",
          value: 85,
          count: 85,
          icon: CheckCircle,
          gradient: "from-emerald-500 to-green-600",
          bgGradient: "from-emerald-50 to-green-100",
        },
        {
          name: "Pending",
          value: 10,
          count: 10,
          icon: Clock,
          gradient: "from-amber-500 to-orange-600",
          bgGradient: "from-amber-50 to-orange-100",
        },
        {
          name: "Failed",
          value: 5,
          count: 5,
          icon: XCircle,
          gradient: "from-red-500 to-rose-600",
          bgGradient: "from-red-50 to-rose-100",
        },
      ];
    }

    const total = stats.total_payments || 0;
    const completed = stats.completed_payments || 0;
    const pending = stats.pending_payments || 0;
    const failed = stats.failed_payments || 0;

    return [
      {
        name: "Completed",
        value: total ? Math.round((completed / total) * 100) : 0,
        count: completed,
        icon: CheckCircle,
        gradient: "from-emerald-500 to-green-600",
        bgGradient: "from-emerald-50 to-green-100",
      },
      {
        name: "Pending",
        value: total ? Math.round((pending / total) * 100) : 0,
        count: pending,
        icon: Clock,
        gradient: "from-amber-500 to-orange-600",
        bgGradient: "from-amber-50 to-orange-100",
      },
      {
        name: "Failed",
        value: total ? Math.round((failed / total) * 100) : 0,
        count: failed,
        icon: XCircle,
        gradient: "from-red-500 to-rose-600",
        bgGradient: "from-red-50 to-rose-100",
      },
    ];
  };

  const statusDistribution = getStatusDistribution();

  const ProgressBar = ({ item, index }) => (
    <div className="space-y-4 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-xl bg-gradient-to-br ${item.bgGradient} shadow-sm group-hover:shadow-md transition-all duration-300`}
          >
            <item.icon
              size={18}
              className={`bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}
            />
          </div>
          <span className="text-sm font-bold text-gray-800">{item.name}</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
            {item.count || item.value}
          </span>
          <span
            className={`text-lg font-black bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}
          >
            {item.value}%
          </span>
        </div>
      </div>

      <div className="relative">
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-3 bg-gradient-to-r ${item.gradient} rounded-full transition-all duration-1000 ease-out shadow-sm relative overflow-hidden`}
            style={{
              width: `${item.value}%`,
              animationDelay: `${index * 200}ms`,
            }}
          >
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Payment Status Distribution */}
      <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-2xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-all duration-500 group">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-purple-200 shadow-lg">
              <PieChart size={24} className="text-blue-700" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 mb-1">
                Payment Status Distribution
              </h3>
              <p className="text-sm text-gray-600 font-medium">
                Real-time payment tracking
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 font-medium">
              Total Payments
            </div>
            <div className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {stats?.total_payments || 100}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {statusDistribution.map((item, index) => (
            <ProgressBar key={index} item={item} index={index} />
          ))}
        </div>

        {/* Success rate indicator */}
        <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity size={16} className="text-green-600" />
              <span className="text-sm font-bold text-green-800">
                Success Rate
              </span>
            </div>
            <span className="text-lg font-black text-green-700">
              {statusDistribution.length > 0 ? statusDistribution[0].value : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-all duration-500 group">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-pink-200 shadow-lg">
              <BarChart3 size={24} className="text-purple-700" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 mb-1">
                Payment Methods
              </h3>
              <p className="text-sm text-gray-600 font-medium">
                Method usage breakdown
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
            <Zap size={16} className="text-orange-500" />
            <span className="text-sm font-bold text-gray-700">This month</span>
          </div>
        </div>

        <div className="space-y-6">
          {paymentMethods.map((item, index) => (
            <ProgressBar key={index} item={item} index={index} />
          ))}
        </div>

        {/* Most popular method highlight */}
        {paymentMethods.length > 0 && (
          <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-100 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp size={16} className="text-purple-600" />
                <span className="text-sm font-bold text-purple-800">
                  Most Popular
                </span>
              </div>
              <span className="text-sm font-bold text-purple-700">
                {paymentMethods[0].name} ({paymentMethods[0].value}%)
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PaymentCharts;
