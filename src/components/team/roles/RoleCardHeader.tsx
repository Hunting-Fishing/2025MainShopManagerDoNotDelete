
import React from "react";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Edit, Trash, Shield, Copy, ArrowUp, ArrowDown } from "lucide-react";
import { Role } from "@/types/team";

interface RoleCardHeaderProps {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onDuplicate: (role: Role) => void;
  onReorder: (roleId: string, direction: 'up' | 'down') => boolean;
  isFirst: boolean;
  isLast: boolean;
}

export function RoleCardHeader({
  role,
  onEdit,
  onDelete,
  onDuplicate,
  onReorder,
  isFirst,
  isLast
}: RoleCardHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-esm-blue-500" />
        <CardTitle>{role.name}</CardTitle>
      </div>
      <div className="flex items-center">
        {/* Reordering buttons */}
        <div className="mr-2 flex flex-col">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onReorder(role.id, 'up')}
            disabled={isFirst}
            className="h-6 w-6"
            title="Move Up"
          >
            <ArrowUp className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onReorder(role.id, 'down')}
            disabled={isLast}
            className="h-6 w-6"
            title="Move Down"
          >
            <ArrowDown className="h-3 w-3" />
          </Button>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onDuplicate(role)}
          title="Duplicate Role"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onEdit(role)}
          title="Edit Role"
        >
          <Edit className="h-4 w-4" />
        </Button>
        {!role.isDefault && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onDelete(role)}
            title="Delete Role"
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
