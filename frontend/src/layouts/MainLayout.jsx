"use client";

import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";
import ProtectedRoute from "../components/common/ProtectedRoute";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { loading } = useAuth();

  const isPublicPage = useMemo(() => {
    const publicPaths = ["/welcome", "/login"];
    return publicPaths.includes(pathname);
  }, [pathname]);

  // Show loading spinner during auth check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      {!isPublicPage && (
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      )}

      {/* Overlay when sidebar is open on mobile */}
      {!isPublicPage && sidebarOpen && (
        <div
          className="fixed inset-0 z-10 lg:hidden"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)'
          }}
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <main className={`overflow-y-auto transition-all duration-300 ${!isPublicPage ? 'lg:ml-96' : ''}`}>
        {/* Top navigation */}
        {!isPublicPage && (
          <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        )}

        {/* Page content */}
        <div className={isPublicPage ? "" : "p-6"}>
          {isPublicPage ? (
            children
          ) : (
            <ProtectedRoute>
              {children}
            </ProtectedRoute>
          )}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;