import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dumbbell, Activity, Users, Calendar, Award, CreditCard, X } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const pathname = usePathname();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <Activity size={20} /> },
    { path: '/members', label: 'Members', icon: <Users size={20} /> },
    { path: '/classes', label: 'Classes', icon: <Calendar size={20} /> },
    { path: '/trainers', label: 'Trainers', icon: <Award size={20} /> },
    { path: '/facility', label: 'Facility', icon: <Dumbbell size={20} /> },
    { path: '/payments', label: 'Payments', icon: <CreditCard size={20} /> },
  ];

  return (
    <aside 
      className={`fixed lg:static inset-y-0 left-0 z-20 w-64 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-300 ease-in-out bg-white border-r border-gray-200 shadow-sm h-full`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <Dumbbell size={24} className="text-blue-600" />
          <h1 className="ml-2 text-xl font-bold">FitManager</h1>
        </div>
        <button 
          onClick={() => setIsOpen(false)} 
          className="lg:hidden text-gray-500"
        >
          <X size={24} />
        </button>
      </div>
      
      <div className="p-4 pb-6">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md ${
                pathname === item.path ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;