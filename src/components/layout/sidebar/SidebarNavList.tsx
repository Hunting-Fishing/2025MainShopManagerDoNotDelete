
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Wrench,
  Package,
  FileText,
  BarChart3,
  Settings,
  Calendar,
  Cog,
  Bell,
  Clock,
  UserCheck,
  MessageSquare,
  ShoppingCart,
  Code,
  FileCheck,
  TrendingUp
} from "lucide-react";
import { SidebarNavItem } from "./SidebarNavItem";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, title: "Dashboard" },
  { name: "Customers", href: "/customers", icon: Users, title: "Customers" },
  { name: "Work Orders", href: "/work-orders", icon: Wrench, title: "Work Orders" },
  { name: "Inventory", href: "/inventory", icon: Package, title: "Inventory" },
  { name: "Invoices", href: "/invoices", icon: FileText, title: "Invoices" },
  { name: "Calendar", href: "/calendar", icon: Calendar, title: "Calendar" },
  { name: "Equipment", href: "/equipment", icon: Cog, title: "Equipment" },
  { name: "Maintenance", href: "/maintenance", icon: UserCheck, title: "Maintenance" },
  { name: "Reports", href: "/reports", icon: BarChart3, title: "Reports" },
  { name: "Analytics", href: "/analytics", icon: TrendingUp, title: "Analytics" },
  { name: "Feedback", href: "/feedback", icon: MessageSquare, title: "Feedback" },
  { name: "Forms", href: "/forms", icon: FileCheck, title: "Forms" },
  { name: "Chat", href: "/chat", icon: MessageSquare, title: "Chat" },
  { name: "Notifications", href: "/notifications", icon: Bell, title: "Notifications" },
  { name: "Settings", href: "/settings", icon: Settings, title: "Settings" },
];

export function SidebarNavList() {
  return (
    <nav className="flex-1 space-y-1 px-2 py-4">
      {navigation.map((item) => (
        <SidebarNavItem key={item.name} item={item} />
      ))}
    </nav>
  );
}
