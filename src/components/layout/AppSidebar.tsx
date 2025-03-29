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
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface SidebarItemProps {
  icon: React.ElementType;
  href: string;
  text: string;
}

function SidebarItem({ icon: Icon, href, text }: SidebarItemProps) {
  return (
    <Link
      to={href}
      className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
    >
      <Icon className="h-4 w-4" />
      {text}
    </Link>
  );
}

export function AppSidebar() {
  const { t } = useTranslation();

  return (
    <div className="sidebar bg-white/40 dark:bg-background border-r border-slate-200 dark:border-slate-800">
      <div className="flex flex-col justify-between h-full">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4 py-3">
            <Link to="/" className="font-bold">
              ESM Tool
            </Link>
            <BadgeCheck className="h-5 w-5 text-green-500" />
          </div>

          <div className="space-y-1 py-2">
            <h4 className="text-xs font-semibold text-muted-foreground pl-4 mb-1">
              {t('navigation.general', 'General')}
            </h4>
            <SidebarItem
              icon={LayoutDashboard}
              href="/"
              text={t('navigation.dashboard', 'Dashboard')}
            />
            <SidebarItem
              icon={ShoppingBag}
              href="/work-orders"
              text={t('navigation.workOrders', 'Work Orders')}
            />
            <SidebarItem
              icon={Users}
              href="/customers"
              text={t('navigation.customers', 'Customers')}
            />
            <SidebarItem
              icon={Boxes}
              href="/inventory"
              text={t('navigation.inventory', 'Inventory')}
            />
          </div>

          <div className="space-y-1 py-2">
            <h4 className="text-xs font-semibold text-muted-foreground pl-4 mb-1">
              {t('navigation.operations', 'Operations')}
            </h4>
            <SidebarItem
              icon={Truck}
              href="/equipment"
              text={t('navigation.equipment', 'Equipment')}
            />
            <SidebarItem
              icon={Coins}
              href="/invoices"
              text={t('navigation.invoices', 'Invoices')}
            />
            <SidebarItem
              icon={Users}
              href="/team"
              text={t('navigation.team', 'Team')}
            />
          </div>
        </div>
        
        <div className="space-y-1 py-2">
          <h4 className="text-xs font-semibold text-muted-foreground pl-4 mb-1">
            MANAGEMENT
          </h4>
          <SidebarItem
            icon={Calendar}
            href="/calendar"
            text="Calendar"
          />
          <SidebarItem
            icon={BarChart}
            href="/analytics"
            text="Analytics"
          />
          <SidebarItem
            icon={LineChart}
            href="/reports"
            text="Reports"
          />
        </div>

        <div className="space-y-1 py-2">
          <h4 className="text-xs font-semibold text-muted-foreground pl-4 mb-1">
            {t('navigation.settings', 'Settings')}
          </h4>
          <SidebarItem
            icon={Settings}
            href="/settings"
            text={t('navigation.settings', 'Settings')}
          />
        </div>
      </div>
    </div>
  );
}
