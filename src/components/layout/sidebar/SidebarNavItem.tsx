
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

export function SidebarNavItem({ item }: { item: NavItem }) {
  const location = useLocation();
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  
  const isActive = location.pathname === item.href || 
                  (item.href !== '/' && location.pathname.startsWith(item.href));
  
  const hasSubmenu = item.submenu && item.submenu.length > 0;
  const hasActiveSubmenu = hasSubmenu && item.submenu.some(subItem => 
    location.pathname === subItem.href || location.pathname.startsWith(subItem.href)
  );
  
  const showSubmenu = hasSubmenu && (isSubmenuOpen || hasActiveSubmenu);

  const toggleSubmenu = (e: React.MouseEvent) => {
    if (hasSubmenu) {
      e.preventDefault();
      setIsSubmenuOpen(!isSubmenuOpen);
    }
  };

  return (
    <div>
      <Button
        asChild={!hasSubmenu}
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 rounded-md px-2.5 py-2 transition-all hover:bg-secondary/20",
          (isActive || hasActiveSubmenu)
            ? "bg-primary/10 text-primary-foreground font-semibold"
            : "text-muted-foreground",
          "hover:text-foreground group"
        )}
        disabled={item.disabled}
        onClick={hasSubmenu ? toggleSubmenu : undefined}
      >
        {hasSubmenu ? (
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-muted-foreground group-hover:text-foreground",
                (isActive || hasActiveSubmenu) && "text-primary"
              )}>
                {item.icon}
              </span>
              <span>{item.title}</span>
            </div>
            {showSubmenu ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        ) : (
          <Link to={item.href} className="flex items-center gap-2 w-full">
            <span className={cn(
              "text-muted-foreground group-hover:text-foreground",
              isActive && "text-primary"
            )}>
              {item.icon}
            </span>
            <span>{item.title}</span>
          </Link>
        )}
      </Button>
      {hasSubmenu && showSubmenu && (
        <div className="ml-4 mt-1 flex flex-col space-y-1">
          {item.submenu?.map((subItem) => (
            <Button
              key={subItem.title}
              asChild
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 rounded-md px-2.5 py-2 text-sm transition-all hover:bg-secondary/20",
                location.pathname === subItem.href || location.pathname.startsWith(subItem.href)
                  ? "bg-primary/10 text-primary-foreground font-semibold"
                  : "text-muted-foreground",
                "hover:text-foreground"
              )}
              disabled={subItem.disabled}
            >
              <Link to={subItem.href} className="flex items-center gap-2 w-full">
                {subItem.icon && (
                  <span className="mr-2 text-muted-foreground">{subItem.icon}</span>
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
