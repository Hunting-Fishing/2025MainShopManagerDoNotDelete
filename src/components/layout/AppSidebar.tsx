
import React from 'react';
import { useSidebar } from '@/hooks/use-sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { SidebarContent } from './sidebar/SidebarContent';

export function AppSidebar() {
  const { isOpen, toggle } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50" 
          onClick={toggle}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          'fixed top-0 left-0 z-30 h-full w-[280px] bg-indigo-700 transition-transform duration-300 shadow-lg print:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </div>
    </>
  );
}
