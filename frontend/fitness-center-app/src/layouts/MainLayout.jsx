"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const MainLayout = ({ children }) => {
  // All hooks MUST be called at the top level, before any early returns
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const pathname = usePathname();
  const { loading } = useAuth();

  useEffect(() => {
    if (pathname) {
      setCurrentPath(pathname);
    }
  }, [pathname]);

  // Calculate these values after all hooks are called
  const isWelcomePage = currentPath === "/welcome";
  const isLoginPage = currentPath === "/login";
  const isPublicPage = isWelcomePage || isLoginPage;

  // Now we can do conditional rendering after all hooks are called
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Sidebar */}
      {!isPublicPage && (
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      )}

      {/* Overlay when sidebar is open on mobile */}
      {!isPublicPage && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.15)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content - adjusted for floating sidebar */}
      <main
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          !isPublicPage ? "lg:ml-80 pb-20 sm:pb-0" : ""
        }`}
      >
        {/* Top navigation */}
        {!isPublicPage && (
          <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        )}

        {/* Page content with proper spacing for floating sidebar */}
        <div className={isPublicPage ? "" : "p-6 lg:pr-10"}>{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;
