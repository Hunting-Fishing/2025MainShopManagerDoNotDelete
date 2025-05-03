
import React, { useEffect } from 'react';
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { useSidebar } from '@/hooks/use-sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sidebar } from "@/components/ui/sidebar";
import { SidebarContent } from './sidebar/SidebarContent';

export function AppSidebar() {
  const { isOpen, onOpen, onClose } = useSidebar();
  const isMobile = useIsMobile();
  
  // Close sidebar on route change for mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      onClose();
    }
  }, [location.pathname, isMobile, isOpen, onClose]);

  return (
    <>
      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={onClose}>
          <SheetContent side="left" className="w-[280px] p-0 bg-gradient-to-b from-indigo-700 to-purple-800 border-r-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      ) : (
        <Sidebar>
          <SidebarContent />
        </Sidebar>
      )}
    </>
  );
}
