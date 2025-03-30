
import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { SidebarNavItem } from "@/components/layout/sidebar/SidebarNavItem"
import { SidebarNavList } from "@/components/layout/sidebar/SidebarNavList"
import { SidebarContent, SidebarHeader } from "@/components/layout/sidebar/SidebarContent"
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
import { useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

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
            <SidebarContent>
              <SidebarHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>
                  Navigate your dashboard
                </SheetDescription>
              </SidebarHeader>
              <SidebarNavList>
                <SidebarNavItem to="/dashboard" icon={<HomeIcon />}>Dashboard</SidebarNavItem>
                <SidebarNavItem to="/work-orders" icon={<ClipboardList />}>Work Orders</SidebarNavItem>
                <SidebarNavItem to="/customers" icon={<Users />}>Customers</SidebarNavItem>
                <SidebarNavItem to="/invoices" icon={<Receipt />}>Invoices</SidebarNavItem>
                <SidebarNavItem to="/calendar" icon={<Calendar />}>Calendar</SidebarNavItem>
                <SidebarNavItem to="/inventory" icon={<Package />}>Inventory</SidebarNavItem>
                <SidebarNavItem to="/equipment" icon={<HardDrive />}>Equipment</SidebarNavItem>
                <SidebarNavItem to="/maintenance" icon={<Wrench />}>Maintenance</SidebarNavItem>
                <SidebarNavItem to="/repair-plans" icon={<Clipboard />}>Repair Plans</SidebarNavItem>
                <SidebarNavItem to="/reminders" icon={<Bell />}>Reminders</SidebarNavItem>
                <SidebarNavItem to="/team" icon={<Users2 />}>Team</SidebarNavItem>
                <SidebarNavItem to="/reports" icon={<BarChart />}>Reports</SidebarNavItem>
                
                {/* Marketing Section */}
                <div className="pt-4">
                  <div className="mb-2 px-3">
                    <div className="text-xs font-semibold text-muted-foreground tracking-wider">
                      MARKETING
                    </div>
                  </div>
                  <SidebarNavItem to="/email-templates" icon={<FileText />}>Email Templates</SidebarNavItem>
                  <SidebarNavItem to="/email-campaigns" icon={<Mail />}>Email Campaigns</SidebarNavItem>
                  <SidebarNavItem to="/email-sequences" icon={<ArrowRight />}>Email Sequences</SidebarNavItem>
                  <SidebarNavItem to="/sms-templates" icon={<MessageSquare />}>SMS Management</SidebarNavItem>
                </div>
                
                <SidebarNavItem to="/settings" icon={<Settings />}>Settings</SidebarNavItem>
              </SidebarNavList>
            </SidebarContent>
          </SheetContent>
        </Sheet>
      ) : (
        <aside className="hidden md:flex md:w-64 flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <SidebarContent>
            <SidebarHeader>
              {/* You can add a logo or branding here */}
              <Button variant="link" className="text-2xl font-bold p-0" onClick={() => navigate('/dashboard')}>
                Your Company
              </Button>
            </SidebarHeader>
            <SidebarNavList>
              <SidebarNavItem to="/dashboard" icon={<HomeIcon />}>Dashboard</SidebarNavItem>
              <SidebarNavItem to="/work-orders" icon={<ClipboardList />}>Work Orders</SidebarNavItem>
              <SidebarNavItem to="/customers" icon={<Users />}>Customers</SidebarNavItem>
              <SidebarNavItem to="/invoices" icon={<Receipt />}>Invoices</SidebarNavItem>
              <SidebarNavItem to="/calendar" icon={<Calendar />}>Calendar</SidebarNavItem>
              <SidebarNavItem to="/inventory" icon={<Package />}>Inventory</SidebarNavItem>
              <SidebarNavItem to="/equipment" icon={<HardDrive />}>Equipment</SidebarNavItem>
              <SidebarNavItem to="/maintenance" icon={<Wrench />}>Maintenance</SidebarNavItem>
              <SidebarNavItem to="/repair-plans" icon={<Clipboard />}>Repair Plans</SidebarNavItem>
              <SidebarNavItem to="/reminders" icon={<Bell />}>Reminders</SidebarNavItem>
              <SidebarNavItem to="/team" icon={<Users2 />}>Team</SidebarNavItem>
              <SidebarNavItem to="/reports" icon={<BarChart />}>Reports</SidebarNavItem>
              
              {/* Marketing Section */}
              <div className="pt-4">
                <div className="mb-2 px-3">
                  <div className="text-xs font-semibold text-muted-foreground tracking-wider">
                    MARKETING
                  </div>
                </div>
                <SidebarNavItem to="/email-templates" icon={<FileText />}>Email Templates</SidebarNavItem>
                <SidebarNavItem to="/email-campaigns" icon={<Mail />}>Email Campaigns</SidebarNavItem>
                <SidebarNavItem to="/email-sequences" icon={<ArrowRight />}>Email Sequences</SidebarNavItem>
                <SidebarNavItem to="/sms-templates" icon={<MessageSquare />}>SMS Management</SidebarNavItem>
              </div>
              
              <SidebarNavItem to="/settings" icon={<Settings />}>Settings</SidebarNavItem>
            </SidebarNavList>
          </SidebarContent>
        </aside>
      )}
    </>
  );
}
