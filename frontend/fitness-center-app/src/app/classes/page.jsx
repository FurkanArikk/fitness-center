"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Plus } from 'lucide-react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Loader from '@/components/common/Loader';
import ClassCalendar from '@/components/classes/ClassCalendar';
import ClassManagement from '@/components/classes/ClassManagement';
import { classService } from '@/api';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const classesData = await classService.getClasses();
        setClasses(Array.isArray(classesData) ? classesData : []);
        
        const schedulesData = await classService.getSchedules();
        setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
      } catch (err) {
        setError("Failed to load class data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading && classes.length === 0) {
    return <Loader message="Loading class data..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Class Schedule</h2>
        <div className="flex gap-2">
          <Button 
            variant="secondary"
            onClick={() => console.log('Toggle view')}
          >
            Weekly View
          </Button>
          <Button 
            variant="primary" 
            icon={<Calendar size={18} />}
            onClick={() => console.log('Add new class')}
          >
            Add New Class
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      <ClassCalendar schedules={schedules} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClassManagement classes={classes} />
        
        <Card title="Class Analytics">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Average Attendance Rate</p>
              <div className="w-full h-4 bg-gray-200 rounded-full">
                <div className="h-4 bg-green-500 rounded-full" style={{ width: '78%' }}></div>
              </div>
              <p className="text-right text-sm mt-1">78%</p>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-1">Most Popular Time Slots</p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="p-2 bg-blue-50 rounded text-center">
                  <p className="font-medium">Morning</p>
                  <p className="text-blue-700">32%</p>
                </div>
                <div className="p-2 bg-yellow-50 rounded text-center">
                  <p className="font-medium">Afternoon</p>
                  <p className="text-yellow-700">21%</p>
                </div>
                <div className="p-2 bg-purple-50 rounded text-center">
                  <p className="font-medium">Evening</p>
                  <p className="text-purple-700">47%</p>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-1">Member Satisfaction</p>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-yellow-400">★</span>
                ))}
                <span className="ml-2">4.7/5</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Classes;