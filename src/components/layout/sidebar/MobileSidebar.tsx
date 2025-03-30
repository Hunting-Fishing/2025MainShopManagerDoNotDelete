
import React from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useSidebar } from "@/hooks/use-sidebar";
import { SidebarContent } from "./SidebarContent";

export function MobileSidebar() {
  const { isOpen, onOpen, onClose } = useSidebar();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpen}
          className="md:hidden"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 pt-8">
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
}
