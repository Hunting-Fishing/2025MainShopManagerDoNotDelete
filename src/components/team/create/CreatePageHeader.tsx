
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function CreatePageHeader() {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        asChild
      >
        <Link to="/team">
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>
      <h1 className="text-2xl font-bold tracking-tight">Add Team Member</h1>
    </div>
  );
}
