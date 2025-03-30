
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  disabled?: boolean;
  submenu?: NavItem[];
}

interface SidebarNavItemProps {
  item: NavItem;
}

// Additional interface for direct prop passing
interface DirectNavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
  submenu?: NavItem[];
}

// Component accepts either item object or direct props
export function SidebarNavItem({ item, to, icon, label, disabled, submenu }: SidebarNavItemProps | DirectNavItemProps) {
  const location = useLocation();
  
  // Handle both formats (backward compatibility)
  const navItem: NavItem = item || {
    title: label || "",
    href: to || "",
    icon: icon,
    disabled: disabled,
    submenu: submenu
  };
  
  const isActive = location.pathname === navItem.href;
  const hasActiveSubmenu = navItem.submenu && navItem.submenu.some(subItem => location.pathname === subItem.href);
  const showSubmenu = navItem.submenu && (location.pathname.startsWith(navItem.href) || hasActiveSubmenu);

  return (
    <div key={navItem.title}>
      <Button
        asChild
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 rounded-md px-2.5 py-2 font-medium transition-all hover:bg-secondary/50",
          isActive
            ? "bg-secondary/50 font-semibold"
            : "font-medium"
        )}
        disabled={navItem.disabled}
      >
        <Link to={navItem.href}>
          {navItem.icon}
          <span>{navItem.title}</span>
        </Link>
      </Button>
      {navItem.submenu && showSubmenu && (
        <div className="ml-4 mt-1 flex flex-col space-y-1">
          {navItem.submenu.map((subItem) => (
            <Button
              key={subItem.title}
              asChild
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 rounded-md px-2.5 py-2 text-sm transition-all hover:bg-secondary/50",
                location.pathname === subItem.href
                  ? "bg-secondary/50 font-semibold"
                  : "font-medium"
              )}
              disabled={subItem.disabled}
            >
              <Link to={subItem.href}>{subItem.title}</Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
