import React from 'react';
import Card from '../common/Card';

const PaymentCharts = ({ stats }) => {
  // If no stats, show placeholder charts
  if (!stats) {
    return (
      <>
        <Card title="Payment Methods">
          <div className="space-y-1 mb-3">
            <div className="flex justify-between">
              <span>Credit Card</span>
              <span>68%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-blue-500 rounded-full" style={{ width: '68%' }}></div>
            </div>
          </div>
          <div className="space-y-1 mb-3">
            <div className="flex justify-between">
              <span>Bank Transfer</span>
              <span>22%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-green-500 rounded-full" style={{ width: '22%' }}></div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Cash</span>
              <span>10%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-yellow-500 rounded-full" style={{ width: '10%' }}></div>
            </div>
          </div>
        </Card>
        
        <Card title="Payment Categories">
          <div className="space-y-1 mb-3">
            <div className="flex justify-between">
              <span>Membership Fees</span>
              <span>75%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-purple-500 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
          <div className="space-y-1 mb-3">
            <div className="flex justify-between">
              <span>Personal Training</span>
              <span>15%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-pink-500 rounded-full" style={{ width: '15%' }}></div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Other Services</span>
              <span>10%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-indigo-500 rounded-full" style={{ width: '10%' }}></div>
            </div>
          </div>
        </Card>
      </>
    );
  }

  // Calculate percentages based on actual stats
  const total = stats.total_payments || 0;
  const completed = stats.completed_payments || 0;
  const pending = stats.pending_payments || 0;
  const failed = stats.failed_payments || 0;
  
  const completedPercentage = total ? Math.round((completed / total) * 100) : 0;
  const pendingPercentage = total ? Math.round((pending / total) * 100) : 0;
  const failedPercentage = total ? Math.round((failed / total) * 100) : 0;

  return (
    <>
      <Card title="Payment Status Distribution">
        <div className="space-y-1 mb-3">
          <div className="flex justify-between">
            <span>Completed</span>
            <span>{completedPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div className="h-2 bg-green-500 rounded-full" style={{ width: `${completedPercentage}%` }}></div>
          </div>
        </div>
        <div className="space-y-1 mb-3">
          <div className="flex justify-between">
            <span>Pending</span>
            <span>{pendingPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div className="h-2 bg-yellow-500 rounded-full" style={{ width: `${pendingPercentage}%` }}></div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Failed</span>
            <span>{failedPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div className="h-2 bg-red-500 rounded-full" style={{ width: `${failedPercentage}%` }}></div>
          </div>
        </div>
      </Card>
      
      <Card title="Payment Methods">
        <div className="space-y-1 mb-3">
          <div className="flex justify-between">
            <span>Credit Card</span>
            <span>68%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div className="h-2 bg-blue-500 rounded-full" style={{ width: '68%' }}></div>
          </div>
        </div>
        <div className="space-y-1 mb-3">
          <div className="flex justify-between">
            <span>Bank Transfer</span>
            <span>22%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div className="h-2 bg-green-500 rounded-full" style={{ width: '22%' }}></div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Cash</span>
            <span>10%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div className="h-2 bg-yellow-500 rounded-full" style={{ width: '10%' }}></div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default PaymentCharts;