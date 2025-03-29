
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Receipt,
  CalendarDays,
  Package2,
  Settings,
  Wrench,
  BarChart3,
  Layers3,
  UserCircle,
  ShieldCheck,
} from "lucide-react";

const AppSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    return currentPath === path || (path !== "/" && currentPath.startsWith(path));
  };

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Work Orders", href: "/work-orders", icon: ClipboardList },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Invoices", href: "/invoices", icon: Receipt },
    { name: "Inventory", href: "/inventory", icon: Package2 },
    { name: "Equipment", href: "/equipment", icon: Layers3 },
    { name: "Maintenance", href: "/maintenance", icon: Wrench },
    { name: "Calendar", href: "/calendar", icon: CalendarDays },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Team", href: "/team", icon: UserCircle },
  ];

  const secondaryNavigation = [
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="hidden border-r bg-slate-50/40 lg:block dark:bg-slate-950/50">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold"
          >
            <ShieldCheck className="h-6 w-6 text-esm-blue-600" />
            <span>ESM Manager</span>
          </Link>
        </div>
        <ScrollArea className="flex-1 overflow-auto">
          <div className="flex flex-col gap-2 p-2">
            {navigation.map((item) => (
              <Button
                key={item.name}
                asChild
                variant="ghost"
                className={cn(
                  "justify-start",
                  isActive(item.href) && "bg-muted text-foreground font-medium hover:bg-muted"
                )}
              >
                <Link to={item.href} className="flex items-center">
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            ))}
          </div>
          <div className="mt-4 p-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Management
            </h2>
            <div className="flex flex-col gap-2">
              {secondaryNavigation.map((item) => (
                <Button
                  key={item.name}
                  asChild
                  variant="ghost"
                  className={cn(
                    "justify-start",
                    isActive(item.href) && "bg-muted text-foreground font-medium hover:bg-muted"
                  )}
                >
                  <Link to={item.href} className="flex items-center">
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AppSidebar;
