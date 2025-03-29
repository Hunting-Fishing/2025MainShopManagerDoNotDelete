
import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import { Header } from './Header';
import { NotificationsProvider } from '@/context/notifications';
import { Outlet } from 'react-router-dom';

interface LayoutProps {
  children?: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <NotificationsProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex flex-col flex-1">
            <Header />
            <main className="flex-1 p-6 bg-slate-50 overflow-auto">
              {children || <Outlet />}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </NotificationsProvider>
  );
}
