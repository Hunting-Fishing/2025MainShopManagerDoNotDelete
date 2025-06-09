
import React from 'react';
import { SidebarProvider } from '@/hooks/use-sidebar';
import { AppSidebar } from './AppSidebar';
import { HeaderSidebarToggle } from './HeaderSidebarToggle';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className={`flex-1 flex flex-col ${!isMobile ? 'ml-[280px]' : ''}`}>
          <header className="bg-white shadow-sm border-b px-4 py-3 flex items-center">
            <HeaderSidebarToggle />
            <h1 className="text-xl font-semibold ml-4 md:ml-0">AutoShop Pro</h1>
          </header>
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
