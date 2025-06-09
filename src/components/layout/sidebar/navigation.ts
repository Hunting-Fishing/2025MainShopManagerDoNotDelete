import { NavItem } from "./SidebarNavItem";

import {
  Home,
  Users,
  Wrench,
  Calendar,
  FileText,
  Package,
  TrendingUp,
  Settings,
  MessageSquare,
  Phone,
  ShoppingCart,
  Bell,
  UserPlus,
  Search,
  BarChart3,
  Shield,
  DollarSign,
  Building,
  Truck,
  ClipboardCheck,
  Cog,
  PlusCircle,
  BookOpen,
  MapPin,
  HeartHandshake,
  Package2,
  Activity
} from "lucide-react";

export const mainNavigationItems: NavItem[] = [
  {
    name: "New Customer",
    href: "/customers/create",
    icon: UserPlus,
    title: "Create a new customer profile"
  },
  {
    name: "New Work Order",
    href: "/work-orders/create",
    icon: PlusCircle,
    title: "Create a new work order"
  },
  {
    name: "Search",
    href: "/search",
    icon: Search,
    title: "Search"
  },
  {
    name: "Notifications",
    href: "/notifications",
    icon: Bell,
    title: "Notifications"
  }
];

export const secondaryNavigationItems: NavItem[] = [
  {
    name: "Knowledge Base",
    href: "/knowledge-base",
    icon: BookOpen,
    title: "Knowledge Base"
  },
  {
    name: "Community",
    href: "/community",
    icon: HeartHandshake,
    title: "Community"
  },
  {
    name: "Map",
    href: "/map",
    icon: MapPin,
    title: "Map"
  }
];

export const navigationItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
    title: "Main Dashboard"
  },
  {
    name: "Work Orders",
    href: "/work-orders",
    icon: Wrench,
    title: "Work Order Management"
  },
  {
    name: "Customers",
    href: "/customers",
    icon: Users,
    title: "Customer Management"
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: Calendar,
    title: "Schedule & Calendar"
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: Package,
    title: "Inventory Management"
  },
  {
    name: "Parts Tracking",
    href: "/parts-tracking",
    icon: Package2,
    title: "Comprehensive Parts Tracking & Analytics"
  },
  {
    name: "Invoices",
    href: "/invoices",
    icon: FileText,
    title: "Invoice Management"
  },
  {
    name: "Reports",
    href: "/reports",
    icon: TrendingUp,
    title: "Business Reports"
  },
  {
    name: "Team Chat",
    href: "/chat",
    icon: MessageSquare,
    title: "Team Communication"
  },
  {
    name: "Calls",
    href: "/calls",
    icon: Phone,
    title: "Call Management"
  },
  {
    name: "Shopping",
    href: "/shopping",
    icon: ShoppingCart,
    title: "Tool Shopping"
  },
  {
    name: "DIY Bay",
    href: "/diy-bay",
    icon: Building,
    title: "DIY Bay Management"
  },
  {
    name: "Equipment",
    href: "/equipment",
    icon: Cog,
    title: "Equipment Management"
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    title: "Application Settings"
  }
];
