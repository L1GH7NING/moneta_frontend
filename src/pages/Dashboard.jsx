import React, { useState } from "react";
import Sidebar from "../components/utils/Sidebar.jsx";
import { useAuth } from "../context/AuthProvider.jsx";
import api from '../api/axios.js';
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../components/utils/ConfirmationModal.jsx";
import RecentExpensesWidget from "../components/dashboard/RecentExpensesWidget.jsx";
import TopCategoriesWidget from "../components/dashboard/TopCategoriesWidget.jsx";

const Dashboard = () => {
  const { user, setUser } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

  const username = user ? user.name : "Guest";

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "";
    const nameParts = name.split(" ").filter(Boolean);
    if (nameParts.length > 1) {
      return nameParts[0][0] + nameParts[nameParts.length - 1][0];
    }
    return nameParts.length === 1 && nameParts[0].length > 1
      ? nameParts[0].substring(0, 2)
      : "U";
  };

  const handleLogout = async () => {
    await api.post('/auth/logout');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="bg-gray-50 px-24 py-4 min-h-screen w-screen flex font-alan">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 pb-16">
        {/* Top Header with greeting and profile */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Hello, {user ? user.name.split(" ")[0] : "there"}
            </h1>
            <p className="text-gray-600 mt-1">Welcome back to your dashboard</p>
          </div>

          {/* User Profile Button */}
          <div className="relative">
            <button
              onClick={handleProfileClick}
              className="w-12 h-12 bg-gradient-to-tr from-orange-400 to-orange-300 rounded-full flex items-center justify-center text-white font-semibold text-lg hover:from-orange-500 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 shadow-md"
            >
              {getInitials(username)}
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <a
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                >
                  My Profile
                </a>
                <a
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                >
                  Settings
                </a>
                <hr className="my-2 border-gray-200" />
                <p
                  className="block px-4 py-2 text-sm text-red-600 hover:bg-orange-50 transition-colors "
                  onClick={() => setIsLogoutModalOpen(true)}
                >
                  Logout
                </p>
              </div>
            )}
          </div>
        </header>

        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Widget 1 - Top categories */}
          <TopCategoriesWidget />

          {/* Widget 2 - Recent Expenses */}
          <RecentExpensesWidget />

          {/* Widget 3 (for demonstration) */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Full-Width Widget
            </h2>
            <p className="text-lg text-gray-600">
              This widget spans both columns.
            </p>
          </div>

        </div>
      </main>
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)} // Function to close the modal
        onConfirm={handleLogout} // The function that performs the logout action
        title="Confirm Logout"
        message="Are you sure you want to log out of Moneta? You will need to log back in to access your data."
        confirmButtonText="Log Out"
        confirmButtonColor="bg-red-600 hover:bg-red-700" // Red for destructive/important action
      />
    </div>
  );
};

export default Dashboard;