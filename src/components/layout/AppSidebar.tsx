
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarContent } from './sidebar/SidebarContent';
import { MessageSquare } from 'lucide-react';

export function AppSidebar() {
  const { collapsed, toggleCollapsed } = useSidebar();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  return (
    <>
      {isMobile ? (
        <Sheet open={collapsed} onOpenChange={toggleCollapsed}>
          <SheetContent side="left" className="w-3/4 sm:w-2/3 md:w-1/2 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Navigate your dashboard
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <aside className="hidden md:flex md:w-64 flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-y-auto">
          <SidebarContent />
        </aside>
      )}
    </>
  );
}
