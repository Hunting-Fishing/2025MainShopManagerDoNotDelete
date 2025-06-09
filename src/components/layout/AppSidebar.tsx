
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { useSidebar } from '@/hooks/use-sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarContent } from './sidebar/SidebarContent';

export function AppSidebar() {
  const { isOpen, onOpen, onClose } = useSidebar();
  const isMobile = useIsMobile();
  const location = useLocation();
  
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
        <div className="h-screen fixed left-0 top-0 z-30 flex w-[280px] flex-col border-r bg-gradient-to-b from-indigo-700 to-purple-800 text-white">
          <SidebarContent />
        </div>
      )}
    </>
  );
}
