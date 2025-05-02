
import React from "react";
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
  BellRing,
  HardDrive,
  UserCog,
  FilePen,
  Hammer,
  Save,
  Link,
  Store,
  Cog,
  ShoppingCart
} from "lucide-react";
import { SidebarNavItem, NavItem } from "./SidebarNavItem";

// Define all navigation items here
const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />
  },
  {
    title: "Work Orders",
    href: "/work-orders",
    icon: <ClipboardList className="h-5 w-5" />
  },
  {
    title: "Invoices",
    href: "/invoices",
    icon: <FileText className="h-5 w-5" />
  },
  {
    title: "Customers",
    href: "/customers",
    icon: <Users className="h-5 w-5" />
  },
  {
    title: "Equipment",
    href: "/equipment",
    icon: <HardDrive className="h-5 w-5" />
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: <Package className="h-5 w-5" />
  },
  {
    title: "Tools Shop",
    href: "/tools",
    icon: <Hammer className="h-5 w-5" />
  },
  {
    title: "Forms",
    href: "/forms",
    icon: <FilePen className="h-5 w-5" />
  },
  {
    title: "Shopping",
    href: "/shopping",
    icon: <ShoppingCart className="h-5 w-5" />
  },
  {
    title: "Maintenance",
    href: "/maintenance",
    icon: <Wrench className="h-5 w-5" />
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: <CalendarDays className="h-5 w-5" />
  },
  {
    title: "Reminders",
    href: "/reminders",
    icon: <BellRing className="h-5 w-5" />
  },
  {
    title: "Chat",
    href: "/chat",
    icon: <MessageCircle className="h-5 w-5" />
  },
  {
    title: "Reports",
    href: "/reports",
    icon: <BarChart2 className="h-5 w-5" />
  },
  {
    title: "Team",
    href: "/team",
    icon: <UserCog className="h-5 w-5" />
  },
  {
    title: "Marketing",
    href: "/marketing",
    icon: <Megaphone className="h-5 w-5" />,
    submenu: [
      {
        title: "Email Templates",
        href: "/email-templates",
        icon: <MailOpen className="h-4 w-4" />
      },
      {
        title: "Email Campaigns",
        href: "/email-campaigns",
        icon: <Megaphone className="h-4 w-4" />
      },
      {
        title: "Email Sequences",
        href: "/email-sequences",
        icon: <MailOpen className="h-4 w-4" />
      },
      {
        title: "SMS Templates",
        href: "/sms-templates",
        icon: <MessageCircle className="h-4 w-4" />
      }
    ]
  },
  {
    title: "Developer Portal",
    href: "/developer",
    icon: <Cog className="h-5 w-5" />
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="h-5 w-5" />
  }
];

export function SidebarNavList() {
  return (
    <div className="grid grid-flow-row auto-rows-max text-sm gap-0.5 group-[[data-collapsed=true]]:justify-center overflow-auto max-h-[calc(100vh-var(--header-height)-theme(spacing.6))]">
      {navigationItems.map((item) => (
        <SidebarNavItem key={item.title} item={item} />
      ))}
    </div>
  );
}
