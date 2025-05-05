
import React from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarLogo } from "./SidebarLogo";
import { SidebarNavList } from "./SidebarNavList";
import { useSidebarContext } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";

export function SidebarContent() {
  const { collapsed } = useSidebarContext();
  
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
