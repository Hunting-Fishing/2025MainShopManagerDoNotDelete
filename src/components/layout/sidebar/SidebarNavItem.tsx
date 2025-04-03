
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  disabled?: boolean;
  submenu?: NavItem[];
}

interface SidebarNavItemProps {
  item: NavItem;
  to?: never;
  icon?: never;
  label?: never;
  disabled?: never;
  submenu?: never;
}

// Additional interface for direct prop passing
interface DirectNavItemProps {
  item?: never;
  to: string;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
  submenu?: NavItem[];
}

// Component accepts either item object or direct props
export function SidebarNavItem(props: SidebarNavItemProps | DirectNavItemProps) {
  const location = useLocation();
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  
  // Handle both formats (backward compatibility)
  const navItem: NavItem = props.item || {
    title: props.label || "",
    href: props.to || "",
    icon: props.icon,
    disabled: props.disabled,
    submenu: props.submenu
  };
  
  const isActive = location.pathname === navItem.href || 
                  (navItem.href !== '/' && location.pathname.startsWith(navItem.href));
  
  const hasSubmenu = navItem.submenu && navItem.submenu.length > 0;
  const hasActiveSubmenu = hasSubmenu && navItem.submenu.some(subItem => 
    location.pathname === subItem.href || location.pathname.startsWith(subItem.href)
  );
  
  // Determine whether to show submenu - either explicitly opened OR if it contains the active page
  const showSubmenu = hasSubmenu && (isSubmenuOpen || hasActiveSubmenu);

  // Toggle submenu open/closed
  const toggleSubmenu = (e: React.MouseEvent) => {
    if (hasSubmenu) {
      e.preventDefault();
      setIsSubmenuOpen(!isSubmenuOpen);
    }
  };

  return (
    <div key={navItem.title}>
      <Button
        asChild={!hasSubmenu}
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 rounded-md px-2.5 py-2 font-medium transition-all hover:bg-secondary/50",
          (isActive || hasActiveSubmenu)
            ? "bg-secondary/50 font-semibold"
            : "font-medium"
        )}
        disabled={navItem.disabled}
        onClick={hasSubmenu ? toggleSubmenu : undefined}
      >
        {hasSubmenu ? (
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              {navItem.icon}
              <span>{navItem.title}</span>
            </div>
            {showSubmenu ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        ) : (
          <Link to={navItem.href}>
            {navItem.icon}
            <span>{navItem.title}</span>
          </Link>
        )}
      </Button>
      {hasSubmenu && showSubmenu && (
        <div className="ml-4 mt-1 flex flex-col space-y-1">
          {navItem.submenu.map((subItem) => (
            <Button
              key={subItem.title}
              asChild
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 rounded-md px-2.5 py-2 text-sm transition-all hover:bg-secondary/50",
                location.pathname === subItem.href || location.pathname.startsWith(subItem.href)
                  ? "bg-secondary/50 font-semibold"
                  : "font-medium"
              )}
              disabled={subItem.disabled}
            >
              <Link to={subItem.href}>
                {subItem.icon && (
                  <span className="mr-2">{subItem.icon}</span>
                )}
                {subItem.title}
              </Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
