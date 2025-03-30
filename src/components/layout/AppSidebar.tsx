
import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  HomeIcon,
  ClipboardList,
  Users,
  Receipt,
  Calendar,
  Package,
  HardDrive,
  Wrench,
  Users2,
  BarChart,
  Settings,
  FileText,
  Mail,
  MessageSquare,
  Bell,
  Clipboard,
  ArrowRight
} from "lucide-react"

// Create a simple navigation item component
const NavItem = ({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) => {
  const navigate = useNavigate();
  return (
    <Button 
      variant="ghost" 
      className="w-full justify-start" 
      onClick={() => navigate(to)}
    >
      <span className="mr-2">{icon}</span>
      <span>{children}</span>
    </Button>
  );
};

export function AppSidebar() {
  const { collapsed, toggleCollapsed } = useSidebar();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  return (
    <>
      {isMobile ? (
        <Sheet open={collapsed} onOpenChange={toggleCollapsed}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="md:hidden">
              Open Menu
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-3/4 sm:w-2/3 md:w-1/2">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Navigate your dashboard
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-1">
                <NavItem to="/dashboard" icon={<HomeIcon size={18} />}>Dashboard</NavItem>
                <NavItem to="/work-orders" icon={<ClipboardList size={18} />}>Work Orders</NavItem>
                <NavItem to="/customers" icon={<Users size={18} />}>Customers</NavItem>
                <NavItem to="/invoices" icon={<Receipt size={18} />}>Invoices</NavItem>
                <NavItem to="/calendar" icon={<Calendar size={18} />}>Calendar</NavItem>
                <NavItem to="/inventory" icon={<Package size={18} />}>Inventory</NavItem>
                <NavItem to="/equipment" icon={<HardDrive size={18} />}>Equipment</NavItem>
                <NavItem to="/maintenance" icon={<Wrench size={18} />}>Maintenance</NavItem>
                <NavItem to="/repair-plans" icon={<Clipboard size={18} />}>Repair Plans</NavItem>
                <NavItem to="/reminders" icon={<Bell size={18} />}>Reminders</NavItem>
                <NavItem to="/team" icon={<Users2 size={18} />}>Team</NavItem>
                <NavItem to="/reports" icon={<BarChart size={18} />}>Reports</NavItem>
              </div>
              
              {/* Marketing Section */}
              <div className="pt-2">
                <div className="mb-2 px-2">
                  <div className="text-xs font-semibold text-muted-foreground tracking-wider">
                    MARKETING
                  </div>
                </div>
                <div className="space-y-1">
                  <NavItem to="/email-templates" icon={<FileText size={18} />}>Email Templates</NavItem>
                  <NavItem to="/email-campaigns" icon={<Mail size={18} />}>Email Campaigns</NavItem>
                  <NavItem to="/email-sequences" icon={<ArrowRight size={18} />}>Email Sequences</NavItem>
                  <NavItem to="/sms-templates" icon={<MessageSquare size={18} />}>SMS Management</NavItem>
                </div>
              </div>
              
              <NavItem to="/settings" icon={<Settings size={18} />}>Settings</NavItem>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <aside className="hidden md:flex md:w-64 flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <Button variant="link" className="text-2xl font-bold p-0" onClick={() => navigate('/dashboard')}>
              Your Company
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-3">
            <div className="space-y-1">
              <NavItem to="/dashboard" icon={<HomeIcon size={18} />}>Dashboard</NavItem>
              <NavItem to="/work-orders" icon={<ClipboardList size={18} />}>Work Orders</NavItem>
              <NavItem to="/customers" icon={<Users size={18} />}>Customers</NavItem>
              <NavItem to="/invoices" icon={<Receipt size={18} />}>Invoices</NavItem>
              <NavItem to="/calendar" icon={<Calendar size={18} />}>Calendar</NavItem>
              <NavItem to="/inventory" icon={<Package size={18} />}>Inventory</NavItem>
              <NavItem to="/equipment" icon={<HardDrive size={18} />}>Equipment</NavItem>
              <NavItem to="/maintenance" icon={<Wrench size={18} />}>Maintenance</NavItem>
              <NavItem to="/repair-plans" icon={<Clipboard size={18} />}>Repair Plans</NavItem>
              <NavItem to="/reminders" icon={<Bell size={18} />}>Reminders</NavItem>
              <NavItem to="/team" icon={<Users2 size={18} />}>Team</NavItem>
              <NavItem to="/reports" icon={<BarChart size={18} />}>Reports</NavItem>
            </div>
            
            {/* Marketing Section */}
            <div className="pt-4">
              <div className="mb-2 px-1">
                <div className="text-xs font-semibold text-muted-foreground tracking-wider">
                  MARKETING
                </div>
              </div>
              <div className="space-y-1">
                <NavItem to="/email-templates" icon={<FileText size={18} />}>Email Templates</NavItem>
                <NavItem to="/email-campaigns" icon={<Mail size={18} />}>Email Campaigns</NavItem>
                <NavItem to="/email-sequences" icon={<ArrowRight size={18} />}>Email Sequences</NavItem>
                <NavItem to="/sms-templates" icon={<MessageSquare size={18} />}>SMS Management</NavItem>
              </div>
            </div>
            
            <div className="pt-4">
              <NavItem to="/settings" icon={<Settings size={18} />}>Settings</NavItem>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
