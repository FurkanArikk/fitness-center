"use client";

import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Wrench, Users } from 'lucide-react';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import FacilityList from '@/components/facility/FacilityList';
import EquipmentList from '@/components/facility/EquipmentList';
import AttendanceList from '@/components/facility/AttendanceList';
import FacilityAnalytics from '@/components/facility/FacilityAnalytics';
import FacilityModal from '@/components/facility/FacilityModal';
import EquipmentModal from '@/components/facility/EquipmentModal';
import CheckInModal from '@/components/facility/CheckInModal';
import AttendanceModal from '@/components/facility/AttendanceModal';
import DeleteFacilityConfirm from '@/components/facility/DeleteFacilityConfirm';
import DeleteEquipmentConfirm from '@/components/facility/DeleteEquipmentConfirm';
import DeleteAttendanceConfirm from '@/components/facility/DeleteAttendanceConfirm';
import { facilityService, memberService } from '@/api';

const Facility = () => {
  const [facilities, setFacilities] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('facilities'); // 'facilities', 'equipment', or 'attendance'

  // Facility Modal states
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [showDeleteFacilityConfirm, setShowDeleteFacilityConfirm] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [facilityModalMode, setFacilityModalMode] = useState('add');

  // Equipment Modal states
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showDeleteEquipmentConfirm, setShowDeleteEquipmentConfirm] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [equipmentModalMode, setEquipmentModalMode] = useState('add');

  // Attendance Modal states
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showDeleteAttendanceConfirm, setShowDeleteAttendanceConfirm] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [attendanceModalMode, setAttendanceModalMode] = useState('add');

  // Pagination states
  const [facilityPage, setFacilityPage] = useState(1);
  const [equipmentPage, setEquipmentPage] = useState(1);
  const [attendancePage, setAttendancePage] = useState(1);
  const [facilityTotalPages, setFacilityTotalPages] = useState(1);
  const [equipmentTotalPages, setEquipmentTotalPages] = useState(1);
  const [attendanceTotalPages, setAttendanceTotalPages] = useState(1);
  const [facilityTotalCount, setFacilityTotalCount] = useState(0);
  const [equipmentTotalCount, setEquipmentTotalCount] = useState(0);
  const [attendanceTotalCount, setAttendanceTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    if (activeTab === 'facilities') {
      fetchFacilities();
    } else if (activeTab === 'equipment') {
      fetchEquipment();
    } else if (activeTab === 'attendance') {
      // Ensure both facilities and members are loaded for attendance tab
      if (facilities.length === 0) {
        fetchFacilities();
      }
      if (members.length === 0) {
        fetchMembers();
      }
      fetchAttendance();
    }
  }, [facilityPage, equipmentPage, attendancePage, activeTab]);

  // Fetch members for attendance modal
  const fetchMembers = async () => {
    setMembersLoading(true);
    try {
      const response = await memberService.getAllMembers();
      console.log('Members API Response:', response);
      // Handle both array response and object with members array
      const membersData = Array.isArray(response) ? response : (response.members || []);
      setMembers(membersData);
      setError(null);
    } catch (err) {
      setError("Failed to load members data");
      console.error('Error fetching members:', err);
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const response = await facilityService.getFacilities(facilityPage, pageSize);
      console.log('Facilities API Response:', response);
      setFacilities(response.data || []);
      setFacilityTotalPages(response.totalPages || 1);
      setFacilityTotalCount(response.totalItems || 0);
      setError(null);
    } catch (err) {
      setError("Failed to load facility data");
      console.error('Error fetching facilities:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipment = async () => {
    setEquipmentLoading(true);
    try {
      const response = await facilityService.getEquipment(equipmentPage, pageSize);
      console.log('Equipment API Response:', response);
      setEquipment(response.data || []);
      setEquipmentTotalPages(response.totalPages || 1);
      setEquipmentTotalCount(response.totalItems || 0);
      setError(null);
    } catch (err) {
      setError("Failed to load equipment data");
      console.error('Error fetching equipment:', err);
    } finally {
      setEquipmentLoading(false);
    }
  };

  const fetchAttendance = async () => {
    setAttendanceLoading(true);
    try {
      const response = await facilityService.getAllAttendance(attendancePage, pageSize);
      console.log('Attendance API Response:', response);
      
      // Enrich attendance data with member and facility names
      const enrichedAttendance = (response.data || []).map(record => {
        const member = members.find(m => (m.member_id || m.id) === record.member_id);
        const facility = facilities.find(f => (f.facility_id || f.id) === record.facility_id);
        
        return {
          ...record,
          member_name: member ? `${member.first_name} ${member.last_name}` : `Member ${record.member_id}`,
          facility_name: facility ? facility.name : `Facility ${record.facility_id}`
        };
      });
      
      setAttendance(enrichedAttendance);
      setAttendanceTotalPages(response.totalPages || 1);
      setAttendanceTotalCount(response.totalItems || 0);
      setError(null);
    } catch (err) {
      setError("Failed to load attendance data");
      console.error('Error fetching attendance:', err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Facility handlers
  const handleAddFacility = () => {
    setSelectedFacility(null);
    setFacilityModalMode('add');
    setShowFacilityModal(true);
  };

  const handleEditFacility = (facility) => {
    setSelectedFacility(facility);
    setFacilityModalMode('edit');
    setShowFacilityModal(true);
  };

  const handleDeleteFacility = (facility) => {
    setSelectedFacility(facility);
    setShowDeleteFacilityConfirm(true);
  };

  const handleFacilitySaved = async (facilityData) => {
    try {
      console.log('Facility data received:', facilityData);
      console.log('Facility modal mode:', facilityModalMode);
      
      if (facilityModalMode === 'add') {
        await facilityService.createFacility(facilityData);
      } else {
        await facilityService.updateFacility(selectedFacility.facility_id, facilityData);
      }
      setShowFacilityModal(false);
      await fetchFacilities();
    } catch (err) {
      console.error('Error saving facility:', err);
      throw err;
    }
  };

  const handleFacilityDeleted = async () => {
    try {
      await facilityService.deleteFacility(selectedFacility.facility_id);
      setShowDeleteFacilityConfirm(false);
      await fetchFacilities();
    } catch (err) {
      console.error('Error deleting facility:', err);
      throw err;
    }
  };

  // Equipment handlers
  const handleAddEquipment = () => {
    setSelectedEquipment(null);
    setEquipmentModalMode('add');
    // Ensure facilities are loaded for the equipment modal
    if (facilities.length === 0) {
      fetchFacilities();
    }
    setShowEquipmentModal(true);
  };

  const handleEditEquipment = (equipment) => {
    setSelectedEquipment(equipment);
    setEquipmentModalMode('edit');
    // Ensure facilities are loaded for the equipment modal
    if (facilities.length === 0) {
      fetchFacilities();
    }
    setShowEquipmentModal(true);
  };

  const handleDeleteEquipment = (equipment) => {
    setSelectedEquipment(equipment);
    setShowDeleteEquipmentConfirm(true);
  };

  const handleEquipmentSaved = async (equipmentData) => {
    try {
      console.log('Equipment data received:', equipmentData);
      console.log('Equipment modal mode:', equipmentModalMode);
      
      if (equipmentModalMode === 'add') {
        await facilityService.createEquipment(equipmentData);
      } else {
        await facilityService.updateEquipment(selectedEquipment.equipment_id, equipmentData);
      }
      setShowEquipmentModal(false);
      await fetchEquipment();
    } catch (err) {
      console.error('Error saving equipment:', err);
      throw err;
    }
  };

  const handleEquipmentDeleted = async () => {
    try {
      await facilityService.deleteEquipment(selectedEquipment.equipment_id);
      setShowDeleteEquipmentConfirm(false);
      await fetchEquipment();
    } catch (err) {
      console.error('Error deleting equipment:', err);
      throw err;
    }
  };

  const handleFacilityPageChange = (page) => {
    setFacilityPage(page);
  };

  const handleEquipmentPageChange = (page) => {
    setEquipmentPage(page);
  };

  // Attendance handlers
  const handleAddAttendance = () => {
    setSelectedAttendance(null);
    setAttendanceModalMode('add');
    // Ensure both facilities and members are loaded for the attendance modal
    if (facilities.length === 0) {
      fetchFacilities();
    }
    if (members.length === 0) {
      fetchMembers();
    }
    setShowAttendanceModal(true);
  };

  const handleEditAttendance = (attendance) => {
    setSelectedAttendance(attendance);
    setAttendanceModalMode('edit');
    // Ensure both facilities and members are loaded for the attendance modal
    if (facilities.length === 0) {
      fetchFacilities();
    }
    if (members.length === 0) {
      fetchMembers();
    }
    setShowAttendanceModal(true);
  };

  const handleDeleteAttendance = (attendance) => {
    setSelectedAttendance(attendance);
    setShowDeleteAttendanceConfirm(true);
  };

  const handleCheckOut = async (attendanceId) => {
    try {
      await facilityService.checkOut(attendanceId);
      await fetchAttendance();
    } catch (err) {
      console.error('Error checking out:', err);
      throw err;
    }
  };

  const handleAttendanceSaved = async (attendanceData) => {
    try {
      console.log('Attendance data received:', attendanceData);
      console.log('Attendance modal mode:', attendanceModalMode);
      
      if (attendanceModalMode === 'add') {
        await facilityService.createAttendance(attendanceData);
      } else {
        await facilityService.updateAttendance(selectedAttendance.attendance_id, attendanceData);
      }
      setShowAttendanceModal(false);
      await fetchAttendance();
    } catch (err) {
      console.error('Error saving attendance:', err);
      throw err;
    }
  };

  const handleAttendanceDeleted = async () => {
    try {
      await facilityService.deleteAttendance(selectedAttendance.attendance_id);
      setShowDeleteAttendanceConfirm(false);
      await fetchAttendance();
    } catch (err) {
      console.error('Error deleting attendance:', err);
      throw err;
    }
  };

  const handleAttendancePageChange = (page) => {
    setAttendancePage(page);
  };

  const handleRefresh = () => {
    if (activeTab === 'facilities') {
      fetchFacilities();
    } else if (activeTab === 'equipment') {
      fetchEquipment();
    } else if (activeTab === 'attendance') {
      fetchAttendance();
    }
  };

  if (loading && facilities.length === 0 && equipment.length === 0) {
    return <Loader message="Loading facility data..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Facility Management</h1>
            <p className="text-gray-600 mt-1">Manage facilities and equipment</p>
          </div>
          <div className="flex gap-2">
            {activeTab === 'facilities' ? (
              <Button 
                variant="primary" 
                icon={<Plus size={18} />}
                onClick={handleAddFacility}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg shadow-sm"
              >
                Add New Facility
              </Button>
            ) : activeTab === 'equipment' ? (
              <Button 
                variant="primary" 
                icon={<Plus size={18} />}
                onClick={handleAddEquipment}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg shadow-sm"
              >
                Add New Equipment
              </Button>
            ) : (
              <Button 
                variant="primary" 
                icon={<Plus size={18} />}
                onClick={handleAddAttendance}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2 rounded-lg shadow-sm"
              >
                Add Check-in
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('facilities')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'facilities'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MapPin size={16} className="inline mr-1" />
              Facilities
            </button>
            <button
              onClick={() => setActiveTab('equipment')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'equipment'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Wrench size={16} className="inline mr-1" />
              Equipment
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'attendance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users size={16} className="inline mr-1" />
              Attendance
            </button>
          </nav>
        </div>
      </div>

      {/* Content Area - Conditional rendering based on active tab */}
      {activeTab === 'facilities' ? (
        <>
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">Error</h3>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Dashboard */}
          <FacilityAnalytics facilities={facilities} equipment={equipment} />

          {/* Facility List */}
          <FacilityList 
            facilities={facilities}
            onEdit={handleEditFacility}
            onDelete={handleDeleteFacility}
            onRefresh={handleRefresh}
            currentPage={facilityPage}
            totalPages={facilityTotalPages}
            onPageChange={handleFacilityPageChange}
            pageSize={pageSize}
            loading={loading}
            totalCount={facilityTotalCount}
          />
        </>
      ) : activeTab === 'equipment' ? (
        <>
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">Error</h3>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Equipment List */}
          <EquipmentList 
            equipment={equipment}
            onEdit={handleEditEquipment}
            onDelete={handleDeleteEquipment}
            onRefresh={handleRefresh}
            currentPage={equipmentPage}
            totalPages={equipmentTotalPages}
            onPageChange={handleEquipmentPageChange}
            pageSize={pageSize}
            loading={equipmentLoading}
            totalCount={equipmentTotalCount}
          />
        </>
      ) : (
        <>
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">Error</h3>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Attendance List */}
          <AttendanceList 
            attendance={attendance}
            onEdit={handleEditAttendance}
            onDelete={handleDeleteAttendance}
            onCheckOut={handleCheckOut}
            onRefresh={handleRefresh}
            currentPage={attendancePage}
            totalPages={attendanceTotalPages}
            onPageChange={handleAttendancePageChange}
            pageSize={pageSize}
            loading={attendanceLoading}
            totalCount={attendanceTotalCount}
          />
        </>
      )}

      {/* Modals */}
      {showFacilityModal && (
        <FacilityModal
          isOpen={showFacilityModal}
          onClose={() => setShowFacilityModal(false)}
          onSave={handleFacilitySaved}
          facility={selectedFacility}
          mode={facilityModalMode}
          isLoading={loading}
        />
      )}

      {showDeleteFacilityConfirm && selectedFacility && (
        <DeleteFacilityConfirm
          isOpen={showDeleteFacilityConfirm}
          onClose={() => setShowDeleteFacilityConfirm(false)}
          onConfirm={handleFacilityDeleted}
          facility={selectedFacility}
          isLoading={loading}
        />
      )}

      {showEquipmentModal && (
        <EquipmentModal
          isOpen={showEquipmentModal}
          onClose={() => setShowEquipmentModal(false)}
          onSave={handleEquipmentSaved}
          equipment={selectedEquipment}
          mode={equipmentModalMode}
          facilities={facilities}
          isLoading={equipmentLoading}
        />
      )}

      {showDeleteEquipmentConfirm && selectedEquipment && (
        <DeleteEquipmentConfirm
          isOpen={showDeleteEquipmentConfirm}
          onClose={() => setShowDeleteEquipmentConfirm(false)}
          onConfirm={handleEquipmentDeleted}
          equipment={selectedEquipment}
          isLoading={equipmentLoading}
        />
      )}

      {showAttendanceModal && (
        <AttendanceModal
          isOpen={showAttendanceModal}
          onClose={() => setShowAttendanceModal(false)}
          onSave={handleAttendanceSaved}
          attendance={selectedAttendance}
          mode={attendanceModalMode}
          facilities={facilities}
          members={members}
          isLoading={attendanceLoading}
        />
      )}

      {showDeleteAttendanceConfirm && selectedAttendance && (
        <DeleteAttendanceConfirm
          isOpen={showDeleteAttendanceConfirm}
          onClose={() => setShowDeleteAttendanceConfirm(false)}
          onConfirm={handleAttendanceDeleted}
          attendance={selectedAttendance}
          isLoading={attendanceLoading}
        />
      )}
    </div>
  );
};

export default Facility;