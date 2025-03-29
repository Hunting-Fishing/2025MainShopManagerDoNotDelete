
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileHeaderProps {
  memberName: string;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export function ProfileHeader({ memberName, onEditClick, onDeleteClick }: ProfileHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/team")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Team Member Profile</h1>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={onEditClick}
        >
          <Edit className="h-4 w-4" />
          Edit Profile
        </Button>
        
        <Button 
          variant="destructive" 
          className="flex items-center gap-2"
          onClick={onDeleteClick}
        >
          <Trash className="h-4 w-4" />
          Remove
        </Button>
      </div>
    </div>
  );
}
