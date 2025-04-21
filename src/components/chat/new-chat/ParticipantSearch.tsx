
import React from 'react';
import { SearchBar } from './SearchBar';
import { TeamMembersList } from './TeamMembersList';
import { ParticipantList } from './ParticipantList';
import { Label } from '@/components/ui/label';
import { TeamMember } from '@/types/team';

interface ParticipantSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedParticipants: string[];
  teamMembers: TeamMember[];
  onToggleParticipant: (userId: string) => void;
  onRemoveParticipant: (userId: string) => void;
  isLoading: boolean;
}

export const ParticipantSearch: React.FC<ParticipantSearchProps> = ({
  searchQuery,
  setSearchQuery,
  selectedParticipants,
  teamMembers,
  onToggleParticipant,
  onRemoveParticipant,
  isLoading
}) => {
  const filteredTeamMembers = teamMembers.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <SearchBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      {selectedParticipants.length > 0 && (
        <div>
          <Label className="text-sm font-medium">Selected members</Label>
          <ParticipantList 
            participants={selectedParticipants}
            teamMembers={teamMembers}
            onRemoveParticipant={onRemoveParticipant}
          />
        </div>
      )}
      
      <div>
        <Label className="text-sm font-medium">Team members</Label>
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading team members...
          </div>
        ) : (
          <TeamMembersList 
            teamMembers={filteredTeamMembers}
            selectedParticipants={selectedParticipants}
            onToggleParticipant={onToggleParticipant}
          />
        )}
      </div>
    </div>
  );
};
