
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";

interface RolesPageHeaderProps {
  onAddRoleClick: () => void;
}

export function RolesPageHeader({ onAddRoleClick }: RolesPageHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/team">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Team Roles & Permissions</h1>
        </div>
        <p className="text-muted-foreground">
          Manage role definitions and permission sets for team members
        </p>
      </div>
      <Button 
        onClick={onAddRoleClick}
        className="bg-esm-blue-600 hover:bg-esm-blue-700 flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Add New Role
      </Button>
    </div>
  );
}
