'use client';

import { useAuth } from '@/context/AuthContext';
import Sidebar, { SidebarProvider } from './Sidebar';
import Header from './Header';
import Spinner from '@/components/ui/Spinner';

export default function DashboardLayout({ children, title }) {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        {/* Main content area - full width on mobile, offset on desktop */}
        <div className="lg:ml-64 min-h-screen flex flex-col">
          <Header title={title} />
          <main className="flex-1 p-3 sm:p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
