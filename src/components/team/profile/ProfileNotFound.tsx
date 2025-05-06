
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ProfileNotFoundProps {
  error?: string | null;
}

export function ProfileNotFound({ error }: ProfileNotFoundProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <h2 className="text-2xl font-bold mb-2">Team Member Not Found</h2>
      <p className="text-muted-foreground mb-6">{error || "The team member you're looking for doesn't exist."}</p>
      
      <div className="flex gap-4">
        <Button asChild>
          <Link to="/team">Return to Team List</Link>
        </Button>
        
        <Button variant="outline" asChild>
          <Link to="/team/create">Add New Team Member</Link>
        </Button>
      </div>
    </div>
  );
}
