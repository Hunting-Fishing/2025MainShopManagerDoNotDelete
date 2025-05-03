
import React from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarLogo } from "./SidebarLogo";
import { SidebarNavList } from "./SidebarNavList";
import { useSidebar } from "@/components/ui/sidebar";

export function SidebarContent() {
  const { collapsed } = useSidebar();
  
  return (
    <>
      <div className={cn("px-3 py-4 transition-all", collapsed ? "flex justify-center" : "px-5")}>
        <SidebarLogo />
        {!collapsed && <Separator className="my-4 bg-white/20" />}
      </div>
      <nav className="px-2">
        <SidebarNavList />
      </nav>
    </>
  );
}

// Import cn utility
import { cn } from "@/lib/utils";
