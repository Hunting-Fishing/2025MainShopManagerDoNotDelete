
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
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Work Orders", href: "/work-orders", icon: Wrench },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Equipment", href: "/equipment", icon: Cog },
  { name: "Reminders", href: "/reminders", icon: Clock },
  { name: "Maintenance", href: "/maintenance", icon: UserCheck },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "Team", href: "/team", icon: UserCheck },
  { name: "Feedback", href: "/feedback", icon: MessageSquare },
  { name: "Forms", href: "/forms", icon: FileCheck },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Shopping", href: "/shopping", icon: ShoppingCart },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Developer", href: "/developer", icon: Code },
  { name: "Settings", href: "/settings", icon: Settings },
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
