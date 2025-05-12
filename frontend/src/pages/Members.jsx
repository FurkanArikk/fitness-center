import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import StatusBadge from '../components/common/StatusBadge';
import apiService from '../api/apiService';
import { formatDate } from '../utils/formatters';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const data = await apiService.getMembers(currentPage, 10);
        setMembers(data.data || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        setError("Failed to load members");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [currentPage]);

  if (loading && members.length === 0) {
    return <Loader message="Loading members..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Member Management</h2>
        <Button 
          variant="primary" 
          icon={<Plus size={18} />}
          onClick={() => console.log('Add new member')}
        >
          Add New Member
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      <Card>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Member List</h3>
            <div className="flex gap-2">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search members..." 
                  className="border rounded-md py-2 px-4 pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
              <button className="border border-gray-300 hover:bg-gray-50 p-2 rounded-md">
                <Filter size={18} />
              </button>
            </div>
          </div>
        </div>
        <div className="p-4">
          {loading ? (
            <Loader size="small" message="Refreshing data..." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-4 text-left">ID</th>
                      <th className="py-2 px-4 text-left">Name</th>
                      <th className="py-2 px-4 text-left">Email</th>
                      <th className="py-2 px-4 text-left">Phone</th>
                      <th className="py-2 px-4 text-left">Status</th>
                      <th className="py-2 px-4 text-left">Join Date</th>
                      <th className="py-2 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-4 text-center text-gray-500">No members found</td>
                      </tr>
                    ) : (
                      members.map((member) => (
                        <tr key={member.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4">{member.id}</td>
                          <td className="py-2 px-4">{`${member.firstName} ${member.lastName}`}</td>
                          <td className="py-2 px-4">{member.email}</td>
                          <td className="py-2 px-4">{member.phone}</td>
                          <td className="py-2 px-4">
                            <StatusBadge status={member.status} />
                          </td>
                          <td className="py-2 px-4">{formatDate(member.joinDate)}</td>
                          <td className="py-2 px-4">
                            <div className="flex space-x-2">
                              <button className="p-1 text-blue-500 hover:bg-blue-50 rounded">
                                Edit
                              </button>
                              <button className="p-1 text-red-500 hover:bg-red-50 rounded">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Showing page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button 
                    className="px-3 py-1 border rounded hover:bg-gray-50"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => (
                    <button 
                      key={i}
                      className={`px-3 py-1 border rounded ${
                        currentPage === i + 1 ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button 
                    className="px-3 py-1 border rounded hover:bg-gray-50"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Members;