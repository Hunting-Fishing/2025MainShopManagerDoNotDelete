
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash, Shield } from "lucide-react";
import { Role } from "@/types/team";

interface RoleCardProps {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export function RoleCard({ role, onEdit, onDelete }: RoleCardProps) {
  return (
    <Card key={role.id} className={role.isDefault ? "border-slate-200" : "border-esm-blue-200"}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-esm-blue-500" />
            <CardTitle>{role.name}</CardTitle>
          </div>
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onEdit(role)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            {!role.isDefault && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onDelete(role)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-500 mb-2">{role.description}</p>
        {role.isDefault ? (
          <div className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded inline-block">
            Default Role
          </div>
        ) : (
          <div className="text-xs bg-esm-blue-50 text-esm-blue-700 px-2 py-1 rounded inline-block">
            Custom Role
          </div>
        )}
      </CardContent>
    </Card>
  );
}
