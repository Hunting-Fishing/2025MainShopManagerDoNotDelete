
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CreatePageHeader() {
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
          <h1 className="text-2xl font-bold tracking-tight">Add Team Member</h1>
          <p className="text-muted-foreground">
            Create a new team member and assign their role and permissions
          </p>
        </div>
      </div>
    </div>
  );
}
