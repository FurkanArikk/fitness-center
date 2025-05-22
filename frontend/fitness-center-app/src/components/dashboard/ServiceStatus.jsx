import React from 'react';
import Card from '../common/Card';

const ServiceStatus = ({ servicesHealth }) => {
  return (
    <Card title="Service Status" className="mb-6">
      <div className="grid grid-cols-5 gap-2">
        {Object.entries(servicesHealth).map(([service, status]) => (
          <div key={service} className="text-center">
            <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${status ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs capitalize">{service}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ServiceStatus;