
import React from "react";
import { SidebarContent } from "./SidebarContent";

export function DesktopSidebar() {
  return (
    <div className="hidden h-full border-r md:block">
      <SidebarContent />
    </div>
  );
}
