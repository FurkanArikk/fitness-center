import React from 'react';
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  BarChart3 
} from 'lucide-react';
import Card from '../common/Card';

const PaymentCharts = ({ stats }) => {
  // Payment method distribution (sample data - will come from real API)
  const paymentMethods = [
    { name: 'Credit Card', value: 68, icon: CreditCard, color: 'bg-blue-500' },
    { name: 'Bank Transfer', value: 22, icon: Smartphone, color: 'bg-green-500' },
    { name: 'Cash', value: 10, icon: Banknote, color: 'bg-yellow-500' }
  ];

  // Calculate status distribution
  const getStatusDistribution = () => {
    if (!stats) {
      return [
        { name: 'Completed', value: 85, count: 85, icon: CheckCircle, color: 'bg-green-500' },
        { name: 'Pending', value: 10, count: 10, icon: Clock, color: 'bg-yellow-500' },
        { name: 'Failed', value: 5, count: 5, icon: XCircle, color: 'bg-red-500' }
      ];
    }

    const total = stats.total_payments || 0;
    const completed = stats.completed_payments || 0;
    const pending = stats.pending_payments || 0;
    const failed = stats.failed_payments || 0;
    
    return [
      { 
        name: 'Completed', 
        value: total ? Math.round((completed / total) * 100) : 0,
        count: completed,
        icon: CheckCircle, 
        color: 'bg-green-500' 
      },
      { 
        name: 'Pending', 
        value: total ? Math.round((pending / total) * 100) : 0,
        count: pending,
        icon: Clock, 
        color: 'bg-yellow-500' 
      },
      { 
        name: 'Failed', 
        value: total ? Math.round((failed / total) * 100) : 0,
        count: failed,
        icon: XCircle, 
        color: 'bg-red-500' 
      }
    ];
  };

  const statusDistribution = getStatusDistribution();

  const ProgressBar = ({ item }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <item.icon size={16} className={`text-gray-600`} />
          <span className="text-sm font-medium text-gray-700">{item.name}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">{item.count || item.value}</span>
          <span className="text-sm font-semibold text-gray-900">{item.value}%</span>
        </div>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-2 ${item.color} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${item.value}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <>
      {/* Payment Status Distribution */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 size={20} className="mr-2 text-blue-600" />
            Payment Status Distribution
          </h3>
          <div className="text-sm text-gray-500">
            Total: {stats?.total_payments || 100}
          </div>
        </div>
        <div className="space-y-4">
          {statusDistribution.map((item, index) => (
            <ProgressBar key={index} item={item} />
          ))}
        </div>
      </Card>
      
      {/* Payment Methods */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <TrendingUp size={20} className="mr-2 text-green-600" />
            Payment Methods
          </h3>
          <div className="text-sm text-gray-500">
            This month
          </div>
        </div>
        <div className="space-y-4">
          {paymentMethods.map((item, index) => (
            <ProgressBar key={index} item={item} />
          ))}
        </div>
        
        {/* Additional info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Most popular method:</span>
            <span className="font-semibold text-gray-900">Credit Card (68%)</span>
          </div>
        </div>
      </Card>
    </>
  );
};

export default PaymentCharts;