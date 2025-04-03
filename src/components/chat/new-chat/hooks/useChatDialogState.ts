
import { useState, useEffect } from 'react';
import { TeamMember } from '@/types/team';

export const useChatDialogState = (teamMembers: TeamMember[]) => {
  const [chatName, setChatName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [filteredTeamMembers, setFilteredTeamMembers] = useState(teamMembers);
  
  // Determine chat type based on number of participants
  const chatType = participants.length > 1 ? "group" : "direct";
  
  // Filter team members based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTeamMembers(teamMembers);
    } else {
      const filtered = teamMembers.filter(member => 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTeamMembers(filtered);
    }
  }, [searchQuery, teamMembers]);

  // Generate chat name suggestions based on participants
  useEffect(() => {
    if (participants.length === 0) {
      setChatName("");
      return;
    }
    
    if (participants.length === 1) {
      // Direct chat - name based on the participant
      const member = teamMembers.find(m => m.id === participants[0]);
      if (member) {
        setChatName(`Chat with ${member.name}`);
      }
    } else if (!chatName.trim() || chatName.startsWith('Chat with ')) {
      // Group chat - if no custom name or it was auto-generated for direct chat
      if (participants.length <= 3) {
        // For small groups, use names
        const names = participants
          .map(id => teamMembers.find(m => m.id === id)?.name.split(' ')[0])
          .filter(Boolean)
          .join(', ');
        setChatName(`Group: ${names}`);
      } else {
        // For larger groups, just use count
        setChatName(`Group Chat (${participants.length} members)`);
      }
    }
  }, [participants, chatName, teamMembers]);

  const handleAddParticipant = (userId: string) => {
    if (!participants.includes(userId)) {
      setParticipants([...participants, userId]);
    }
  };

  const handleRemoveParticipant = (userId: string) => {
    setParticipants(participants.filter(id => id !== userId));
  };
  
  const handleToggleParticipant = (userId: string) => {
    if (participants.includes(userId)) {
      handleRemoveParticipant(userId);
    } else {
      handleAddParticipant(userId);
    }
  };

  const resetState = () => {
    setChatName("");
    setSearchQuery("");
    setParticipants([]);
  };

  return {
    chatName,
    setChatName,
    searchQuery,
    setSearchQuery,
    participants,
    setParticipants,
    filteredTeamMembers,
    chatType,
    handleAddParticipant,
    handleRemoveParticipant,
    handleToggleParticipant,
    resetState
  };
};
