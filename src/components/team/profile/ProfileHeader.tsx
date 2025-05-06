
import { Link } from "react-router-dom";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TeamMember } from "@/types/team";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { DeleteMemberDialog } from "./DeleteMemberDialog";

interface ProfileHeaderProps {
  member: TeamMember;
}

export function ProfileHeader({ member }: ProfileHeaderProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Get initials for avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };
  
  // Determine badge variant based on status
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      case 'on leave':
        return 'warning';
      case 'terminated':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/team" className="flex items-center gap-1 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Team
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`} />
            <AvatarFallback className="bg-esm-blue-100 text-esm-blue-700">
              {getInitials(member.name)}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{member.name}</h1>
              <Badge variant={getStatusVariant(member.status)}>
                {member.status}
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 text-sm text-muted-foreground mt-1">
              <p>{member.jobTitle || "No Job Title"}</p>
              <p>•</p>
              <p>{member.department}</p>
              <p>•</p>
              <p>{member.role}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/team/${member.id}/edit`}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive border-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
      
      <DeleteMemberDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        member={member}
      />
    </div>
  );
}
