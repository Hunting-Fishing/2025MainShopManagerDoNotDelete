
import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider } from '@/hooks/use-sidebar';

interface LayoutProps {
  children?: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { resolvedTheme } = useTheme();
  const isMobile = useIsMobile();
  
  const isDark = resolvedTheme === 'dark';

  return (
    <SidebarProvider>
      <div className={`min-h-screen flex w-full flex-col ${isDark ? 'dark' : ''}`}>
        <div className="flex flex-1 flex-col md:flex-row">
          <AppSidebar />
          <div className={`flex flex-col flex-1 ${!isMobile ? "md:ml-[280px]" : ""}`}>
            <Header />
            <main className="flex-1 p-4 md:p-6 bg-slate-50 dark:bg-slate-900 overflow-auto">
              {children || <Outlet />}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default Layout;
