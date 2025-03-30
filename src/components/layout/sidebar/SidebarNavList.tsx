
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarNavItem, NavItem } from "./SidebarNavItem";
import { 
  Home, 
  Users, 
  Calendar, 
  ShoppingCart, 
  Truck, 
  Settings, 
  FileText,
  BarChart3,
  Mail,
  MailPlus
} from "lucide-react";

export function getNavItems(): NavItem[] {
  return [
    {
      title: "Dashboard",
      href: "/",
      icon: <Home className="mr-2 h-4 w-4" />,
    },
    {
      title: "Customers",
      href: "/customers",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      title: "Work Orders",
      href: "/work-orders",
      icon: <FileText className="mr-2 h-4 w-4" />,
    },
    {
      title: "Calendar",
      href: "/calendar",
      icon: <Calendar className="mr-2 h-4 w-4" />,
    },
    {
      title: "Inventory",
      href: "/inventory",
      icon: <ShoppingCart className="mr-2 h-4 w-4" />,
    },
    {
      title: "Vehicles",
      href: "/vehicles",
      icon: <Truck className="mr-2 h-4 w-4" />,
    },
    {
      title: "Marketing",
      href: "/email-templates",
      icon: <Mail className="mr-2 h-4 w-4" />,
      submenu: [
        {
          title: "Email Templates",
          href: "/email-templates",
          icon: <FileText className="mr-2 h-4 w-4" />,
        },
        {
          title: "Email Campaigns",
          href: "/email-campaigns",
          icon: <MailPlus className="mr-2 h-4 w-4" />,
        },
      ],
    },
    {
      title: "Analytics",
      href: "/customer-analytics",
      icon: <BarChart3 className="mr-2 h-4 w-4" />,
      submenu: [
        {
          title: "Customer Analytics",
          href: "/customer-analytics",
          icon: <BarChart3 className="mr-2 h-4 w-4" />,
        },
      ],
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
      disabled: true,
    },
  ];
}

export function SidebarNavList() {
  const navItems = getNavItems();
  
  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div className="flex flex-col space-y-2 px-7">
        {navItems.map((item) => (
          <SidebarNavItem key={item.title} item={item} />
        ))}
      </div>
    </ScrollArea>
  );
}
