import React from 'react';
import { Bell, Menu } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  return (
    <header className="bg-white shadow-sm px-6 py-3 flex justify-between items-center">
      <button 
        onClick={toggleSidebar} 
        className="lg:hidden text-gray-500 focus:outline-none"
      >
        <Menu size={24} />
      </button>
      
      <div className="flex items-center space-x-4">
        <button className="relative text-gray-500 hover:text-gray-700">
          <Bell size={20} />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        
        <div className="flex items-center space-x-2">
          <img src="/api/placeholder/32/32" alt="User Avatar" className="w-8 h-8 rounded-full" />
          <span className="font-medium">Admin User</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;