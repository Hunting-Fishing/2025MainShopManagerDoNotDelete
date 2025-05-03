
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

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
  const { collapsed } = useSidebar();
  
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
  
  // Auto-open submenu when it contains the active page
  useEffect(() => {
    if (hasActiveSubmenu && !isSubmenuOpen) {
      setIsSubmenuOpen(true);
    }
  }, [location.pathname, hasActiveSubmenu]);
  
  // Determine whether to show submenu - either explicitly opened OR if it contains the active page
  const showSubmenu = hasSubmenu && !collapsed && (isSubmenuOpen || hasActiveSubmenu);

  // Toggle submenu open/closed
  const toggleSubmenu = (e: React.MouseEvent) => {
    if (hasSubmenu && !collapsed) {
      e.preventDefault();
      setIsSubmenuOpen(!isSubmenuOpen);
    }
  };

  return (
    <div key={navItem.title} className="mb-1">
      <div
        className={cn(
          "relative flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          isActive || hasActiveSubmenu
            ? "bg-white/15 text-white font-semibold shadow-sm"
            : "text-white/80 hover:bg-white/10",
          navItem.disabled && "cursor-not-allowed opacity-60"
        )}
        onClick={hasSubmenu ? toggleSubmenu : undefined}
      >
        {hasSubmenu ? (
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{navItem.icon}</span>
              {!collapsed && <span>{navItem.title}</span>}
            </div>
            {!collapsed && (
              showSubmenu ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )
            )}
          </div>
        ) : (
          <Link to={navItem.href} className="flex items-center gap-2.5 w-full">
            <span className="text-xl">{navItem.icon}</span>
            {!collapsed && <span>{navItem.title}</span>}
          </Link>
        )}
      </div>

      {hasSubmenu && showSubmenu && (
        <div className="mt-1 ml-3 pl-3 border-l border-white/20">
          {navItem.submenu.map((subItem) => (
            <Link
              key={subItem.title}
              to={subItem.href}
              className={cn(
                "flex items-center gap-2 py-2 px-3 my-1 text-sm rounded-md transition-colors",
                location.pathname === subItem.href || location.pathname.startsWith(subItem.href)
                  ? "bg-white/15 text-white font-medium"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              {subItem.icon && (
                <span className="text-sm">{subItem.icon}</span>
              )}
              <span>{subItem.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
