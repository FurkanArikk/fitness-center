"use client";

import React from 'react';
import { TrendingUp, DollarSign, Users, Calendar, CreditCard } from 'lucide-react';
import Card from '@/components/common/Card';
import { formatCurrency } from '@/utils/formatters';

const PaymentAnalytics = ({ stats }) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const analytics = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.total_amount || 0),
      icon: DollarSign,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      subtitle: 'This month'
    },
    {
      title: 'Total Payments',
      value: stats.total_payments || 0,
      icon: CreditCard,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      subtitle: `${stats.pending_payments || 0} pending`
    },
    {
      title: 'Average Payment',
      value: formatCurrency(stats.average_amount || 0),
      icon: TrendingUp,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      subtitle: 'Per transaction'
    },
    {
      title: 'Active Members',
      value: stats.active_members || 0,
      icon: Users,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      subtitle: 'Paying members'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {analytics.map((item, index) => {
        const Icon = item.icon;
        
        return (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">{item.title}</p>
                <p className="text-2xl font-bold text-gray-900 mb-2">{item.value}</p>
                
                <p className="text-xs text-gray-500">{item.subtitle}</p>
              </div>
              
              <div className={`p-3 rounded-full ${item.iconBg} ml-4`}>
                <Icon className={`w-6 h-6 ${item.iconColor}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default PaymentAnalytics;
