"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Loader from '@/components/common/Loader';
import EquipmentCard from '@/components/equipment/EquipmentCard';
import EquipmentList from '@/components/equipment/EquipmentList';
import apiService from '@/api/apiService';

const Equipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const fetchEquipment = async () => {
      setLoading(true);
      try {
        const response = await apiService.getEquipment(1, 50);
        setEquipment(response.data || []);
      } catch (err) {
        setError("Failed to load equipment data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  if (loading && equipment.length === 0) {
    return <Loader message="Loading equipment data..." />;
  }

  const filteredEquipment = equipment
    .filter(item => 
      (category === 'all' || item.category === category) &&
      (searchTerm === '' || 
       item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Equipment Management</h2>
        <Button 
          variant="primary" 
          icon={<Plus size={18} />}
          onClick={() => console.log('Add new equipment')}
        >
          Add New Equipment
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEquipment.map((item, index) => (
          <EquipmentCard key={item.equipment_id || index} equipment={item} />
        ))}
      </div>
      
      <Card title="Equipment Inventory">
        <div className="flex justify-between mb-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search equipment..." 
              className="border rounded-md py-2 px-4 pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <select 
            className="border rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="cardio">Cardio</option>
            <option value="strength">Strength</option>
            <option value="functional">Functional</option>
          </select>
        </div>
        <EquipmentList equipment={equipment} />
      </Card>
    </div>
  );
};

export default Equipment;