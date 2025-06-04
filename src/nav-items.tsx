
import { HomeIcon, Users, Calendar as CalendarIcon, FileText, Settings as SettingsIcon, Wrench, Package, DollarSign, BarChart3, MessageSquare, Bell, Car, ClipboardList, FileCheck, UserCheck, HeadphonesIcon, Gift, Truck, Building2, ShoppingCart } from "lucide-react";

// Import page components
import Dashboard from "./pages/Dashboard";
import CustomersPage from "./pages/CustomersPage";
import WorkOrders from "./pages/WorkOrders";
import Calendar from "./pages/Calendar";
import Inventory from "./pages/Inventory";
import Invoices from "./pages/Invoices";
import Analytics from "./pages/Analytics";
import Team from "./pages/Team";
import Settings from "./pages/Settings";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";
import Equipment from "./pages/Equipment";
import Reminders from "./pages/Reminders";
import Forms from "./pages/Forms";
import Feedback from "./pages/Feedback";
import SmsTemplates from "./pages/SmsTemplates";
import Payments from "./pages/Payments";
import MaintenanceDashboard from "./pages/MaintenanceDashboard";
import Reports from "./pages/Reports";
import ShoppingPortal from "./pages/ShoppingPortal";

export const navItems = [
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Dashboard />,
  },
  {
    title: "Customers",
    to: "/customers",
    icon: <Users className="h-4 w-4" />,
    page: <CustomersPage />,
  },
  {
    title: "Work Orders",
    to: "/work-orders",
    icon: <ClipboardList className="h-4 w-4" />,
    page: <WorkOrders />,
  },
  {
    title: "Calendar",
    to: "/calendar",
    icon: <CalendarIcon className="h-4 w-4" />,
    page: <Calendar />,
  },
  {
    title: "Inventory",
    to: "/inventory",
    icon: <Package className="h-4 w-4" />,
    page: <Inventory />,
  },
  {
    title: "Invoices",
    to: "/invoices",
    icon: <DollarSign className="h-4 w-4" />,
    page: <Invoices />,
  },
  {
    title: "Analytics",
    to: "/analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <Analytics />,
  },
  {
    title: "Team",
    to: "/team",
    icon: <UserCheck className="h-4 w-4" />,
    page: <Team />,
  },
  {
    title: "Equipment",
    to: "/equipment",
    icon: <Wrench className="h-4 w-4" />,
    page: <Equipment />,
  },
  {
    title: "Maintenance",
    to: "/maintenance",
    icon: <Truck className="h-4 w-4" />,
    page: <MaintenanceDashboard />,
  },
  {
    title: "Reminders",
    to: "/reminders",
    icon: <Bell className="h-4 w-4" />,
    page: <Reminders />,
  },
  {
    title: "Forms",
    to: "/forms",
    icon: <FileText className="h-4 w-4" />,
    page: <Forms />,
  },
  {
    title: "Feedback",
    to: "/feedback",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <Feedback />,
  },
  {
    title: "SMS Templates",
    to: "/sms-templates",
    icon: <HeadphonesIcon className="h-4 w-4" />,
    page: <SmsTemplates />,
  },
  {
    title: "Payments",
    to: "/payments",
    icon: <Gift className="h-4 w-4" />,
    page: <Payments />,
  },
  {
    title: "Reports",
    to: "/reports",
    icon: <FileCheck className="h-4 w-4" />,
    page: <Reports />,
  },
  {
    title: "Shopping",
    to: "/shopping",
    icon: <ShoppingCart className="h-4 w-4" />,
    page: <ShoppingPortal />,
  },
  {
    title: "Chat",
    to: "/chat",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <Chat />,
  },
  {
    title: "Notifications",
    to: "/notifications",
    icon: <Bell className="h-4 w-4" />,
    page: <Notifications />,
  },
  {
    title: "Settings",
    to: "/settings",
    icon: <SettingsIcon className="h-4 w-4" />,
    page: <Settings />,
  },
];
