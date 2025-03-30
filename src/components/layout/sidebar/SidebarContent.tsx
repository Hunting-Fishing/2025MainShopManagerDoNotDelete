
import React from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarLogo } from "./SidebarLogo";
import { SidebarNavList } from "./SidebarNavList";

export function SidebarContent() {
  return (
    <>
      <div className="px-7 py-6">
        <SidebarLogo />
        <Separator className="my-6" />
      </div>
      <SidebarNavList />
    </>
  );
}
