"use client";

import React, { useState, useEffect } from 'react';
import { Award } from 'lucide-react';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import Card from '@/components/common/Card';
import TrainerCard from '@/components/trainers/TrainerCard';
import TrainerSchedule from '@/components/trainers/TrainerSchedule';
import { staffService } from '@/api';

const Trainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrainers = async () => {
      setLoading(true);
      try {
        const data = await staffService.getTrainers();
        setTrainers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to load trainers");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  if (loading && trainers.length === 0) {
    return <Loader message="Loading trainers..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Trainer Management</h2>
        <Button 
          variant="primary" 
          icon={<Award size={18} />}
          onClick={() => console.log('Add new trainer')}
        >
          Add New Trainer
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trainers.map(trainer => (
          <TrainerCard key={trainer.id} trainer={trainer} />
        ))}
      </div>
      
      <Card title="Trainer Schedule">
        <TrainerSchedule trainers={trainers.slice(0, 3)} />
      </Card>
    </div>
  );
};

export default Trainers;