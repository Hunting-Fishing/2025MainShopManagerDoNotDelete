
import React from "react";
import { Link } from "react-router-dom";
import { 
  Home, 
  Clipboard, 
  Users, 
  FileText, 
  Calendar, 
  Package, 
  Settings,
  Users2,
  BarChart3,
  Wrench,
  Settings2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const AppSidebar = () => {
  const { collapsed, toggleCollapsed } = useSidebar();
  const isMobile = useIsMobile();
  
  // On mobile, sidebar is either fully shown or fully hidden
  const sidebarVisible = isMobile ? !collapsed : true;
  const sidebarClasses = isMobile 
    ? `fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out ${collapsed ? '-translate-x-full' : 'translate-x-0'}`
    : `relative transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`;

  if (!sidebarVisible && isMobile) {
    return null;
  }

  return (
    <div 
      className={`h-screen border-r bg-white ${sidebarClasses}`}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2 md:hidden" 
            onClick={toggleCollapsed}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
        
        {collapsed && !isMobile ? (
          <span className="text-xl font-bold mx-auto">FM</span>
        ) : (
          <span className="text-xl font-bold">Field Management</span>
        )}
      </div>
      <div className="flex flex-col gap-1 p-2 overflow-y-auto h-[calc(100vh-4rem)]">
        <NavItem to="/" icon={<Home />} label="Dashboard" collapsed={collapsed && !isMobile} />
        <NavItem to="/work-orders" icon={<Clipboard />} label="Work Orders" collapsed={collapsed && !isMobile} />
        <NavItem to="/customers" icon={<Users />} label="Customers" collapsed={collapsed && !isMobile} />
        <NavItem to="/invoices" icon={<FileText />} label="Invoices" collapsed={collapsed && !isMobile} />
        <NavItem to="/calendar" icon={<Calendar />} label="Calendar" collapsed={collapsed && !isMobile} />
        <NavItem to="/inventory" icon={<Package />} label="Inventory" collapsed={collapsed && !isMobile} />
        <NavItem to="/equipment" icon={<Wrench />} label="Equipment" collapsed={collapsed && !isMobile} />
        <NavItem to="/maintenance" icon={<Settings2 />} label="Maintenance" collapsed={collapsed && !isMobile} />
        <NavItem to="/team" icon={<Users2 />} label="Team" collapsed={collapsed && !isMobile} />
        <NavItem to="/reports" icon={<BarChart3 />} label="Reports" collapsed={collapsed && !isMobile} />
        <NavItem to="/settings" icon={<Settings />} label="Settings" collapsed={collapsed && !isMobile} />
      </div>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}

const NavItem = ({ to, icon, label, collapsed }: NavItemProps) => {
  return (
    <Button 
      variant="ghost" 
      className="w-full justify-start" 
      asChild
    >
      <Link to={to} className="flex items-center gap-3 px-3 py-2">
        {icon}
        {!collapsed && <span>{label}</span>}
      </Link>
    </Button>
  );
};

export default AppSidebar;
