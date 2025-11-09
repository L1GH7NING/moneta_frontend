// src/components/SidebarTest.jsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Repeat,
  Wallet,
  PieChart,
  Settings,
  // Removed unused icons like Menu, LogOut, ChevronsRight, but keeping LogOut for the button
  LogOut,
  ChevronsRight,
  Home,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthProvider";
import MonetaLogo from "../assets/MonetaCropped.png";
import ConfirmationModal from "./ConfirmationModal";

const commonIconProps = {
  size: 24,
  className: "flex-shrink-0",
};

const navLinks = [
  { icon: LayoutDashboard, text: "Dashboard", path: "/dashboard" },
  { icon: Repeat, text: "Expenses", path: "/expenses" },
  { icon: Wallet, text: "Budgets", path: "/budgets" },
  { icon: PieChart, text: "Reports", path: "/reports" },
  { icon: Settings, text: "Settings", path: "/settings" },
  { icon: Home, text: "Home", path: "/home" }
];

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef(null);
  const { setUser } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

  // Get the current path from the browser
  const currentPath = window.location.pathname;

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 800;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !isMobile &&
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen, isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleConfirmLogout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    navigate("/login");
  };

  const isLinkActive = (path) => {
    if (path === currentPath) {
      return true;
    }
    if (path.endsWith("/") && path.slice(0, -1) === currentPath) {
      return true;
    }
    if (currentPath.endsWith("/") && currentPath.slice(0, -1) === path) {
      return true;
    }

    if (path !== "/" && currentPath.startsWith(path + "/")) {
      return true;
    }

    return false;
  };

  return (
    <>
      {/* Overlay backdrop when sidebar is open on desktop */}
      {isSidebarOpen && !isMobile && <div className="fixed inset-0 z-40" />}

      <nav
        ref={sidebarRef}
        id="sidebar"
        className={`
          box-border h-screen py-4 shadow-lg z-50 transition-all duration-300 ease-in-out overflow-hidden
          bg-white
          fixed top-0 left-0
          flex flex-col
          
          ${
            isSidebarOpen && !isMobile
              ? "w-64 px-4 border-r border-gray-200"
              : "w-20 px-2"
          }
          ${
            isMobile
              ? "bottom-0 right-0 w-full h-16 border-r-0 border-t py-0"
              : ""
          }
        `}
      >
        <ul
          className={`list-none ${
            isMobile ? "grid grid-cols-5 justify-items-center h-full" : "flex-1"
          }`}
        >
          {!isMobile && (
            <li
              className={`flex items-center mb-6 h-[88px] border-b border-gray-200 transition-all duration-300 ${
                isSidebarOpen ? "justify-start px-2" : "justify-center"
              }`}
            >
              {isSidebarOpen ? (
                <div className="overflow-hidden transition-all duration-300 w-auto opacity-100">
                  <img
                    src={MonetaLogo}
                    alt="Moneta Logo"
                    className="h-12 w-auto"
                  />
                </div>
              ) : (
                <div
                  id="toggle-btn"
                  onClick={toggleSidebar}
                  className="p-2 rounded-md bg-transparent border-none text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <ChevronsRight size={24} />
                </div>
              )}
            </li>
          )}

          {navLinks.map((link) => {
            const isActive = isLinkActive(link.path); // <--- Uses the fixed function
            const LinkIcon = link.icon;

            const baseLinkClass = `
              flex items-center rounded-md transition-all duration-300 cursor-pointer
              ${
                isActive
                  ? "bg-gradient-to-tr from-orange-200 to-orange-100 text-orange-800"
                  : "text-gray-600 hover:bg-orange-50"
              }
              ${
                isMobile
                  ? "w-full h-full rounded-none justify-center flex-col gap-1 py-2"
                  : isSidebarOpen
                  ? "py-3 px-4 gap-4"
                  : "py-3 justify-center"
              }
            `;

            return (
              <li key={link.text} className={isMobile ? "" : "mb-2"}>
                <a href={link.path} className={baseLinkClass}>
                  <LinkIcon {...commonIconProps} />
                  <span
                    className={`font-medium transition-all duration-300 whitespace-nowrap ${
                      isMobile
                        ? "text-xs"
                        : isSidebarOpen
                        ? "opacity-100"
                        : "opacity-0 w-0 overflow-hidden"
                    }`}
                  >
                    {link.text}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>

        {/* Logout button at the bottom - only on desktop */}
        {!isMobile && (
          <div className="mt-auto border-t border-gray-200 pt-4">
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className={`
                w-full flex items-center rounded-md transition-all duration-300 cursor-pointer
                text-red-600 hover:bg-red-50
                ${isSidebarOpen ? "py-3 px-4 gap-4" : "py-3 justify-center"}
              `}
            >
              <LogOut {...commonIconProps} />
              <span
                className={`font-medium transition-all duration-300 whitespace-nowrap ${
                  isSidebarOpen
                    ? "opacity-100"
                    : "opacity-0 w-0 overflow-hidden"
                }`}
              >
                Logout
              </span>
            </button>
          </div>
        )}
      </nav>
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)} // Function to close the modal
        onConfirm={handleConfirmLogout} // The function that performs the logout action
        title="Confirm Logout"
        message="Are you sure you want to log out of Moneta? You will need to log back in to access your data."
        confirmButtonText="Log Out"
        confirmButtonColor="bg-red-600 hover:bg-red-700" // Red for destructive/important action
      />
    </>
  );
};

export default Sidebar;
