
import React from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function SidebarLogo() {
  return (
    <Link to="/">
      <div className="flex items-center gap-2 font-semibold">
        <Avatar className="h-8 w-8">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
        <span>Acme Co.</span>
      </div>
    </Link>
  );
}
