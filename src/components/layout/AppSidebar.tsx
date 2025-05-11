
import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ClipboardList,
  Settings, 
  ShoppingCart, 
  Code,
  FileText,
  Calendar,
  Bell,
  Tool,
  MessageSquare,
  BarChart,
  Wrench,
  Clipboard
} from "lucide-react";

export function AppSidebar() {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("");

  useEffect(() => {
    // Set the active item based on the current path
    const path = location.pathname.split("/")[1];
    setActiveItem(path || "dashboard");
  }, [location]);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/dashboard" },
    { id: "work-orders", label: "Work Orders", icon: <ClipboardList size={20} />, path: "/work-orders" },
    { id: "invoices", label: "Invoices", icon: <FileText size={20} />, path: "/invoices" },
    { id: "customers", label: "Customers", icon: <Users size={20} />, path: "/customers" },
    { id: "equipment", label: "Equipment", icon: <Tool size={20} />, path: "/equipment" },
    { id: "inventory", label: "Inventory", icon: <Package size={20} />, path: "/inventory" },
    { id: "team", label: "Team", icon: <Users size={20} />, path: "/team" },
    { id: "calendar", label: "Calendar", icon: <Calendar size={20} />, path: "/calendar" },
    { id: "chat", label: "Chat", icon: <MessageSquare size={20} />, path: "/chat" },
    { id: "shopping", label: "Shopping", icon: <ShoppingCart size={20} />, path: "/shopping" },
    { id: "reports", label: "Reports", icon: <BarChart size={20} />, path: "/reports" },
    { id: "reminders", label: "Reminders", icon: <Bell size={20} />, path: "/reminders" },
    { id: "forms", label: "Forms", icon: <Clipboard size={20} />, path: "/forms" },
    { id: "maintenance", label: "Maintenance", icon: <Wrench size={20} />, path: "/maintenance" },
    { id: "developer", label: "Developer", icon: <Code size={20} />, path: "/developer" },
    { id: "settings", label: "Settings", icon: <Settings size={20} />, path: "/settings" },
  ];

  return (
    <div className="fixed h-full w-[280px] bg-gradient-to-b from-indigo-700 to-purple-800 text-white p-4 z-10 overflow-auto hidden md:block">
      <div className="flex items-center justify-center mb-8 mt-2">
        <h1 className="text-2xl font-bold">Easy Shop Manager</h1>
      </div>
      
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                  activeItem === item.id
                    ? "bg-white/20 text-white font-medium"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default AppSidebar;
