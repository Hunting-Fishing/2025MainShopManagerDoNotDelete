
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";

interface RolesPageHeaderProps {
  onAddRoleClick: () => void;
}

export function RolesPageHeader({ onAddRoleClick }: RolesPageHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/team" className="flex items-center gap-1 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Team
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">
            Create and manage roles and permissions for team members
          </p>
        </div>
        
        <Button
          onClick={onAddRoleClick}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Role
        </Button>
      </div>
    </div>
  );
}
