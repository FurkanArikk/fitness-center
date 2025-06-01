import React, { useState, useRef, useEffect } from 'react';
import { Menu, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ChangePasswordModal from '@/components/auth/ChangePasswordModal';

const Navbar = ({ toggleSidebar }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const dropdownRef = useRef(null);
  const { username, logout } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChangePassword = () => {
    setShowDropdown(false);
    setShowPasswordModal(true);
  };

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
  };

  return (
    <>
      <header className="bg-white shadow-sm px-6 py-3 flex justify-between items-center">
        <button 
          onClick={toggleSidebar} 
          className="lg:hidden text-gray-500 focus:outline-none"
        >
          <Menu size={24} />
        </button>
        
        {/* Admin Dropdown - Moved to the right */}
        <div className="flex items-center ml-auto">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 border border-transparent hover:border-gray-200"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
                <User size={18} className="text-white" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-semibold text-sm">{username || 'Admin'}</div>
                <div className="text-xs text-gray-500">Administrator</div>
              </div>
              <ChevronDown size={16} className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="py-2">
                  <button
                    onClick={handleChangePassword}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 flex items-center space-x-3 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors duration-150">
                      <Settings size={16} className="text-gray-600 group-hover:text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">Change Password</div>
                      <div className="text-xs text-gray-500">Update your password</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors duration-150 flex items-center space-x-3 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-red-100 flex items-center justify-center transition-colors duration-150">
                      <LogOut size={16} className="text-gray-600 group-hover:text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium">Sign Out</div>
                      <div className="text-xs text-gray-500">Sign out of your account</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </>
  );
};

export default Navbar;