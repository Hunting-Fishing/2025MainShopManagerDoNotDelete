
import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  FileText,
  Wrench,
  Package,
  BarChart2,
  CalendarDays,
  Settings,
  MessageCircle,
  Megaphone,
  MailOpen,
} from "lucide-react";
import { SidebarNavItem } from "./SidebarNavItem";

export function SidebarNavList() {
  return (
    <div className="grid grid-flow-row auto-rows-max text-sm gap-0.5 group-[[data-collapsed=true]]:justify-center overflow-auto max-h-[calc(100vh-var(--header-height)-theme(spacing.6))]">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `group flex w-full items-center py-2 px-7 gap-3 text-sm hover:text-foreground text-muted-foreground transition-colors ${
            isActive ? "bg-accent text-foreground" : ""
          }`
        }
      >
        <LayoutDashboard className="h-5 w-5" />
        <span>Dashboard</span>
      </NavLink>
      <SidebarNavItem 
        to="/work-orders" 
        icon={<ClipboardList className="h-5 w-5" />} 
        label="Work Orders" 
      />
      <SidebarNavItem 
        to="/invoices" 
        icon={<FileText className="h-5 w-5" />} 
        label="Invoices" 
      />
      <SidebarNavItem 
        to="/customers" 
        icon={<Users className="h-5 w-5" />} 
        label="Customers" 
      />
      <SidebarNavItem 
        to="/equipment" 
        icon={<Wrench className="h-5 w-5" />} 
        label="Equipment" 
      />
      <SidebarNavItem 
        to="/inventory" 
        icon={<Package className="h-5 w-5" />} 
        label="Inventory" 
      />
      <SidebarNavItem 
        to="/calendar" 
        icon={<CalendarDays className="h-5 w-5" />} 
        label="Calendar" 
      />
      <SidebarNavItem 
        to="/reports" 
        icon={<BarChart2 className="h-5 w-5" />} 
        label="Reports" 
      />
      <SidebarNavItem 
        to="/sms" 
        icon={<MessageCircle className="h-5 w-5" />} 
        label="SMS" 
      />
      <SidebarNavItem 
        to="/email-templates" 
        icon={<MailOpen className="h-5 w-5" />} 
        label="Email Templates" 
      />
      <SidebarNavItem 
        to="/email-campaigns" 
        icon={<Megaphone className="h-5 w-5" />} 
        label="Email Campaigns" 
      />
      <SidebarNavItem 
        to="/settings" 
        icon={<Settings className="h-5 w-5" />} 
        label="Settings" 
      />
    </div>
  );
}
