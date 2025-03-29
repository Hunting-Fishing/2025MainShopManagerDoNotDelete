
import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { NotificationsProvider } from '@/context/notifications';
import { Outlet } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/context/ThemeContext';

interface LayoutProps {
  children?: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const isMobile = useIsMobile();
  const { resolvedTheme } = useTheme();
  
  const isDark = resolvedTheme === 'dark';

  return (
    <NotificationsProvider>
      <SidebarProvider>
        <div className={`min-h-screen flex w-full flex-col md:flex-row ${isDark ? 'dark' : ''}`}>
          <AppSidebar />
          <div className="flex flex-col flex-1">
            <Header />
            <main className="flex-1 p-4 md:p-6 bg-slate-50 dark:bg-slate-900 overflow-auto">
              {children || <Outlet />}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </NotificationsProvider>
  );
}

// Add default export to fix the import error
export default Layout;
