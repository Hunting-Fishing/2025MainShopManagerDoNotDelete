
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function TeamHeader() {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
        <p className="text-muted-foreground">
          Manage your team members, roles and permissions.
        </p>
      </div>
      <div>
        <Button asChild className="flex items-center gap-2 bg-esm-blue-600 hover:bg-esm-blue-700">
          <Link to="/team/new">
            <Plus className="h-4 w-4" />
            Add Team Member
          </Link>
        </Button>
      </div>
    </div>
  );
}
