import React from 'react';
import { Search, Bell, Settings, User } from 'lucide-react';
import { useAuth } from '../context/AuthProvider'; // Assuming you still need user data

const NavbarDashboard = () => {
  const { user } = useAuth(); // Get user data if needed for display

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white border-b shadow-sm h-14 flex items-center justify-between px-4 transition-all duration-300 ease-in-out">
      {/* Profile/User Info on the Left (next to the sidebar area) */}
      <div className="flex items-center" style={{ marginLeft: '80px' }}> {/* Offset by collapsed sidebar width */}
        <button className="flex items-center p-2 rounded-lg hover:bg-gray-100 text-gray-700">
          <User size={20} className="mr-2" />
          <span className="font-medium">{user?.name || 'Guest'}</span>
        </button>
      </div>

      {/* Center - Search Bar (Optional) */}
      <div className="flex-1 max-w-md mx-auto relative hidden md:block"> {/* Hide on small screens */}
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 bg-gray-50 text-gray-700"
        />
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      {/* Right-aligned Icons */}
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-700">
          <Bell size={20} />
        </button>
        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-700">
          <Settings size={20} />
        </button>
      </div>
    </nav>
  );
};

export default NavbarDashboard;