"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";
import { usePathname } from "next/navigation";

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      setCurrentPath(pathname);
    }
  }, [pathname]);

  const isWelcomePage = currentPath === "/welcome";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      {!isWelcomePage && (
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      )}

      {/* Overlay when sidebar is open on mobile */}
      {!isWelcomePage && sidebarOpen && (
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
      <main className="flex-1 overflow-y-auto">
        {/* Top navigation */}
        {!isWelcomePage && (
          <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        )}

        {/* Page content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;
