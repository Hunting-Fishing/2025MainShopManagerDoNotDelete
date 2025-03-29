
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Shield } from "lucide-react";

export function TeamHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
        <p className="text-muted-foreground">
          Manage your team members, roles and permissions.
        </p>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          asChild 
          className="flex items-center gap-2"
        >
          <Link to="/team/roles">
            <Shield className="h-4 w-4" />
            Manage Roles
          </Link>
        </Button>
        <Button 
          asChild 
          className="flex items-center gap-2 bg-esm-blue-600 hover:bg-esm-blue-700"
        >
          <Link to="/team/new">
            <Plus className="h-4 w-4" />
            Add Team Member
          </Link>
        </Button>
      </div>
    </div>
  );
}
