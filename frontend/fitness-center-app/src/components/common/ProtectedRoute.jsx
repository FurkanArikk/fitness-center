"use client";

import { useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = useMemo(() => {
    const publicPaths = ['/login', '/welcome'];
    return publicPaths.includes(pathname);
  }, [pathname]);

  useEffect(() => {
    if (!loading && !isAuthenticated && !isPublicPath) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, isPublicPath, router]);

  // Show loading while checking authentication
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

  // Don't render protected content if not authenticated
  if (!isAuthenticated && !isPublicPath) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
