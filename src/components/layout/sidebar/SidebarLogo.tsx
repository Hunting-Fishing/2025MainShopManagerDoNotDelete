
import React from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSidebar } from "@/components/ui/sidebar";

export function SidebarLogo() {
  const { collapsed } = useSidebar();
  
  return (
    <Link to="/">
      <div className="flex items-center gap-2 font-semibold">
        <Avatar className={`${collapsed ? "h-9 w-9" : "h-8 w-8"} transition-all duration-300`}>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback className="bg-purple-600 text-white">SC</AvatarFallback>
        </Avatar>
        {!collapsed && <span className="text-white">Acme Co.</span>}
      </div>
    </Link>
  );
}
