
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export function HeaderSidebarToggle() {
  const { collapsed, toggleCollapsed } = useSidebar();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Button variant="ghost" size="icon" onClick={toggleCollapsed}>
        <Menu className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleCollapsed}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {collapsed ? 
        <ChevronRight className="h-5 w-5" /> : 
        <ChevronLeft className="h-5 w-5" />
      }
    </Button>
  );
}
