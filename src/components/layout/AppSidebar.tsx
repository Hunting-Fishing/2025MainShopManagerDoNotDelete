import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { useSidebar } from '@/hooks/use-sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarContent } from './sidebar/SidebarContent';
import { Link } from 'react-router-dom';
import { useShop } from '@/context/ShopContext';
import { Logo } from './Logo';
import { cn } from '@/lib/utils';
import { ShoppingActiveBadge } from './ShoppingActiveBadge';
import { SidebarFooter } from './SidebarFooter';
import DeveloperIcon from '@/components/icons/DeveloperIcon';

const navItems = [
  { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboardIcon },
  { path: '/customers', name: 'Customers', icon: UsersIcon },
  { path: '/work-orders', name: 'Work Orders', icon: WrenchIcon },
  { path: '/inventory', name: 'Inventory', icon: PackageIcon },
  { path: '/calendar', name: 'Calendar', icon: CalendarIcon },
  { path: '/reports', name: 'Reports', icon: BarChartIcon },
  { path: '/team', name: 'Team', icon: Users2Icon },
  { path: '/forms', name: 'Forms', icon: ClipboardPenLineIcon },
  { path: '/settings', name: 'Settings', icon: Settings2Icon },
  { path: '/shopping', name: 'Shopping', icon: ShoppingCartIcon },
];

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
        <div 
          className="h-screen fixed left-0 top-0 z-30 flex w-[280px] flex-col border-r bg-gradient-to-b from-indigo-700 to-purple-800 text-white transition-all"
        >
          <SidebarContent />
        </div>
      )}
    </>
  );
}
