
import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Import, FileDown } from "lucide-react";
import { Role } from "@/types/team";

interface RolesPageHeaderProps {
  onAddRoleClick: () => void;
  onExportRoles: () => void;
  onImportRoles: (roles: Role[]) => void;
}

export function RolesPageHeader({ 
  onAddRoleClick, 
  onExportRoles, 
  onImportRoles 
}: RolesPageHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedRoles = JSON.parse(e.target?.result as string) as Role[];
        onImportRoles(importedRoles);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error("Error parsing imported roles:", error);
        // Error handling would be done in the parent component
      }
    };
    reader.readAsText(file);
  };

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
      <div className="flex items-center gap-2">
        <Button 
          variant="outline"
          onClick={handleImportClick}
          className="flex items-center gap-2"
        >
          <Import className="h-4 w-4" />
          Import Roles
        </Button>
        <Button 
          variant="outline"
          onClick={onExportRoles}
          className="flex items-center gap-2"
        >
          <FileDown className="h-4 w-4" />
          Export Roles
        </Button>
        <Button 
          onClick={onAddRoleClick}
          className="bg-esm-blue-600 hover:bg-esm-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Role
        </Button>
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".json"
          className="hidden"
        />
      </div>
    </div>
  );
}
