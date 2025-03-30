
import React from "react";
import { MobileSidebar } from "./sidebar/MobileSidebar";
import { DesktopSidebar } from "./sidebar/DesktopSidebar";

export function AppSidebar() {
  return (
    <>
      <MobileSidebar />
      <DesktopSidebar />
    </>
  );
}
