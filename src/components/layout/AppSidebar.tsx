
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
  Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

const AppSidebar = () => {
  const { collapsed } = useSidebar();

  return (
    <div 
      className={`h-screen border-r bg-white transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex h-16 items-center justify-center border-b px-4">
        {collapsed ? (
          <span className="text-xl font-bold">FM</span>
        ) : (
          <span className="text-xl font-bold">Field Management</span>
        )}
      </div>
      <div className="flex flex-col gap-1 p-2">
        <NavItem to="/" icon={<Home />} label="Dashboard" collapsed={collapsed} />
        <NavItem to="/work-orders" icon={<Clipboard />} label="Work Orders" collapsed={collapsed} />
        <NavItem to="/customers" icon={<Users />} label="Customers" collapsed={collapsed} />
        <NavItem to="/invoices" icon={<FileText />} label="Invoices" collapsed={collapsed} />
        <NavItem to="/calendar" icon={<Calendar />} label="Calendar" collapsed={collapsed} />
        <NavItem to="/inventory" icon={<Package />} label="Inventory" collapsed={collapsed} />
        <NavItem to="/equipment" icon={<Wrench />} label="Equipment" collapsed={collapsed} />
        <NavItem to="/maintenance" icon={<Settings2 />} label="Maintenance" collapsed={collapsed} />
        <NavItem to="/team" icon={<Users2 />} label="Team" collapsed={collapsed} />
        <NavItem to="/reports" icon={<BarChart3 />} label="Reports" collapsed={collapsed} />
        <NavItem to="/settings" icon={<Settings />} label="Settings" collapsed={collapsed} />
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
