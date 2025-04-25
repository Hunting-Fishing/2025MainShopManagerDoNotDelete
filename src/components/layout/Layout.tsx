
import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { Navbar } from './Navbar';
import { Outlet } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/context/ThemeContext';
import { HeaderSidebarToggle } from './HeaderSidebarToggle';

interface LayoutProps {
  children?: ReactNode;
  className?: string; // Added className prop
}

export function Layout({ children, className }: LayoutProps) {
  const isMobile = useIsMobile();
  const { resolvedTheme } = useTheme();
  
  const isDark = resolvedTheme === 'dark';

  return (
    <SidebarProvider>
      <div className={`min-h-screen flex w-full flex-col bg-space ${isDark ? 'dark' : ''} ${className || ''}`}>
        <Navbar className="glassmorphism border-b border-imperial-600/30" />
        <div className="flex flex-1 flex-col md:flex-row">
          <AppSidebar />
          <div className="flex flex-col flex-1">
            <Header />
            <main className="flex-1 p-4 md:p-6 bg-space-gradient overflow-auto">
              {children || <Outlet />}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default Layout;
