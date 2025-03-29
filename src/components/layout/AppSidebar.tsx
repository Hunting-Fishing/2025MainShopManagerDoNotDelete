
import {
  BarChart,
  Calendar,
  LineChart,
  Settings,
  ShoppingBag,
  Users,
  LayoutDashboard,
  FileText,
  Boxes,
  Truck,
  Coins,
  BadgeCheck,
  MessageSquare
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/ThemeContext";
import { useSidebar } from "@/components/ui/sidebar";

interface SidebarItemProps {
  icon: React.ElementType;
  href: string;
  text: string;
}

function SidebarItem({ icon: Icon, href, text }: SidebarItemProps) {
  const location = useLocation();
  const isActive = location.pathname === href || location.pathname.startsWith(`${href}/`);
  
  return (
    <Link
      to={href}
      className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium 
        ${isActive 
          ? 'bg-primary/10 text-primary' 
          : 'hover:bg-accent hover:text-accent-foreground'
        }`}
    >
      <Icon className="h-4 w-4" />
      {text}
    </Link>
  );
}

export function AppSidebar() {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const { collapsed } = useSidebar();

  return (
    <div className={`sidebar bg-white/40 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 
      ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 overflow-y-auto`}>
      <div className="flex flex-col justify-between h-full">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-4 py-3">
            <Link to="/" className={`font-bold dark:text-white ${collapsed ? 'hidden' : 'block'}`}>
              ESM Tool
            </Link>
            <BadgeCheck className="h-5 w-5 text-green-500" />
          </div>

          <div className="space-y-1 px-3 py-2">
            <h4 className={`text-xs font-semibold text-muted-foreground pl-1 mb-1 ${collapsed ? 'sr-only' : ''}`}>
              {t('navigation.general', 'General')}
            </h4>
            <SidebarItem
              icon={LayoutDashboard}
              href="/"
              text={collapsed ? '' : t('navigation.dashboard', 'Dashboard')}
            />
            <SidebarItem
              icon={ShoppingBag}
              href="/work-orders"
              text={collapsed ? '' : t('navigation.workOrders', 'Work Orders')}
            />
            <SidebarItem
              icon={Users}
              href="/customers"
              text={collapsed ? '' : t('navigation.customers', 'Customers')}
            />
            <SidebarItem
              icon={Boxes}
              href="/inventory"
              text={collapsed ? '' : t('navigation.inventory', 'Inventory')}
            />
          </div>

          <div className="space-y-1 px-3 py-2">
            <h4 className={`text-xs font-semibold text-muted-foreground pl-1 mb-1 ${collapsed ? 'sr-only' : ''}`}>
              {t('navigation.operations', 'Operations')}
            </h4>
            <SidebarItem
              icon={Truck}
              href="/equipment"
              text={collapsed ? '' : t('navigation.equipment', 'Equipment')}
            />
            <SidebarItem
              icon={Coins}
              href="/invoices"
              text={collapsed ? '' : t('navigation.invoices', 'Invoices')}
            />
            <SidebarItem
              icon={Users}
              href="/team"
              text={collapsed ? '' : t('navigation.team', 'Team')}
            />
          </div>
        
          <div className="space-y-1 px-3 py-2">
            <h4 className={`text-xs font-semibold text-muted-foreground pl-1 mb-1 ${collapsed ? 'sr-only' : ''}`}>
              {t('navigation.tools', 'Tools')}
            </h4>
            <SidebarItem
              icon={Calendar}
              href="/calendar"
              text={collapsed ? '' : t('navigation.calendar', 'Calendar')}
            />
            <SidebarItem
              icon={MessageSquare}
              href="/chat"
              text={collapsed ? '' : t('navigation.chat', 'Chat')}
            />
            <SidebarItem
              icon={BarChart}
              href="/analytics"
              text={collapsed ? '' : t('navigation.analytics', 'Analytics')}
            />
            <SidebarItem
              icon={LineChart}
              href="/reports"
              text={collapsed ? '' : t('navigation.reports', 'Reports')}
            />
          </div>
        </div>
        
        <div className="mt-auto pt-2 pb-4 px-3">
          <SidebarItem
            icon={Settings}
            href="/settings"
            text={collapsed ? '' : t('navigation.settings', 'Settings')}
          />
        </div>
      </div>
    </div>
  );
}

// Add default export to fix the import error
export default AppSidebar;
