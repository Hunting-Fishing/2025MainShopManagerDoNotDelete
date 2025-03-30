
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

export function SidebarNavItem({ item }: SidebarNavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === item.href;
  const hasActiveSubmenu = item.submenu && item.submenu.some(subItem => location.pathname === subItem.href);
  const showSubmenu = item.submenu && (location.pathname.startsWith(item.href) || hasActiveSubmenu);

  return (
    <div key={item.title}>
      <Button
        asChild
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 rounded-md px-2.5 py-2 font-medium transition-all hover:bg-secondary/50",
          isActive
            ? "bg-secondary/50 font-semibold"
            : "font-medium"
        )}
        disabled={item.disabled}
      >
        <Link to={item.href}>
          {item.icon}
          <span>{item.title}</span>
        </Link>
      </Button>
      {item.submenu && showSubmenu && (
        <div className="ml-4 mt-1 flex flex-col space-y-1">
          {item.submenu.map((subItem) => (
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
