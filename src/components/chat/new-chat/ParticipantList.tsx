
import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { TeamMember } from "@/types/team";
import { getInitials } from "@/data/teamData";

interface ParticipantListProps {
  participants: string[];
  teamMembers: TeamMember[];
  onRemoveParticipant: (userId: string) => void;
}

export const ParticipantList: React.FC<ParticipantListProps> = ({
  participants,
  teamMembers,
  onRemoveParticipant
}) => {
  if (participants.length === 0) {
    return null;
  }

  // Get selected participants' details
  const selectedParticipantDetails = participants.map(
    id => teamMembers.find(member => member.id === id)
  ).filter(Boolean);

  return (
    <div className="flex flex-wrap gap-2 mb-3 max-h-24 overflow-y-auto p-1">
      {selectedParticipantDetails.map(member => member && (
        <Badge 
          key={member.id} 
          variant="secondary"
          className="flex items-center gap-1 pl-1 pr-2 py-1 hover:bg-secondary"
        >
          <Avatar className="h-5 w-5 mr-1">
            <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
          </Avatar>
          <span className="text-xs">{member.name}</span>
          <X 
            className="h-3 w-3 ml-1 cursor-pointer opacity-70 hover:opacity-100" 
            onClick={() => onRemoveParticipant(member.id)}
          />
        </Badge>
      ))}
    </div>
  );
};
