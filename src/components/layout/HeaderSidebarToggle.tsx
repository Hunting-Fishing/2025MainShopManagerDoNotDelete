
import React from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export function HeaderSidebarToggle() {
  const { toggle } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <Button
      variant="ghost"
      size={isMobile ? "sm" : "icon"}
      className="md:hover:bg-accent"
      onClick={toggle}
      aria-label="Toggle sidebar"
    >
      <Menu className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
      {isMobile && <span className="ml-2">Menu</span>}
    </Button>
  );
}
