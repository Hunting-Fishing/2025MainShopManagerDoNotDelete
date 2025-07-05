
import React from 'react';
import { SidebarProvider, useSidebar } from '@/hooks/use-sidebar';
import { AppSidebar } from './AppSidebar';
import { HeaderSidebarToggle } from './HeaderSidebarToggle';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
};

const LayoutContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOpen } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        !isMobile && isOpen ? 'ml-[280px]' : ''
      }`}>
        <header className="bg-white shadow-sm border-b px-4 py-3 flex items-center">
          <HeaderSidebarToggle />
          <h1 className="text-xl font-semibold ml-4 md:ml-0">AutoShop Pro</h1>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
