import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChatNameInput } from './new-chat/ChatNameInput';
import { SearchBar } from './new-chat/SearchBar';
import { TeamMembersList } from './new-chat/TeamMembersList';
import { ParticipantList } from './new-chat/ParticipantList';
import { TeamMember } from '@/types/team';
import { ShiftChatSettings } from './new-chat/ShiftChatSettings';
import { useChatDialogState } from './new-chat/hooks/useChatDialogState';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

interface NewChatDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (
    name: string, 
    type: "direct" | "group" | "work_order", 
    participants: string[],
    shiftMetadata?: {
      isShiftChat: boolean;
      shiftDate?: Date;
      shiftName: string;
      shiftTimeStart: string;
      shiftTimeEnd: string;
    }
  ) => void;
}

export const NewChatDialog = ({ open, onClose, onCreate }: NewChatDialogProps) => {
  const {
    chatName,
    setChatName,
    chatType,
    setChatType,
    searchQuery,
    setSearchQuery,
    selectedParticipants,
    addParticipant,
    removeParticipant,
    toggleParticipant,
    isShiftChat,
    setIsShiftChat,
    shiftDate,
    setShiftDate,
    shiftName,
    setShiftName,
    shiftTimeStart,
    setShiftTimeStart,
    shiftTimeEnd,
    setShiftTimeEnd,
    resetState
  } = useChatDialogState();

  // Fetch team members from Supabase
  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone, job_title, department, roles:user_roles(role:roles(name))')
        .order('last_name');

      if (error) throw error;

      return data.map(profile => {
        // Extract role name safely with proper type checking
        let roleName = 'No Role';
        
        if (profile.roles && 
            Array.isArray(profile.roles) && 
            profile.roles.length > 0 && 
            profile.roles[0]?.role && 
            typeof profile.roles[0].role === 'object' &&
            profile.roles[0].role !== null &&
            'name' in profile.roles[0].role &&
            typeof profile.roles[0].role.name === 'string') {
          roleName = profile.roles[0].role.name;
        }
        
        return {
          id: profile.id,
          name: `${profile.first_name} ${profile.last_name}`,
          email: profile.email,
          phone: profile.phone || '',
          jobTitle: profile.job_title || '',
          department: profile.department || '',
          role: roleName
        };
      }) as TeamMember[];
    }
  });

  // Filter team members based on search query
  const filteredTeamMembers = teamMembers.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = () => {
    // Create the chat with the selected participants
    const shiftMetadata = isShiftChat ? {
      isShiftChat,
      shiftDate,
      shiftName,
      shiftTimeStart,
      shiftTimeEnd
    } : undefined;

    onCreate(
      chatName || getDefaultChatName(),
      chatType,
      selectedParticipants,
      shiftMetadata
    );
    
    // Reset the form
    resetState();
  };

  const getDefaultChatName = () => {
    if (isShiftChat) {
      return `${shiftName} - ${shiftDate ? new Date(shiftDate).toLocaleDateString() : 'Shift Chat'}`;
    }

    if (selectedParticipants.length === 1) {
      const member = teamMembers.find(m => m.id === selectedParticipants[0]);
      return member ? member.name : 'New Chat';
    } else if (selectedParticipants.length > 1) {
      return 'Group Chat';
    }
    return 'New Chat';
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="direct" onValueChange={(value) => setChatType(value as "direct" | "group")}>
          <TabsList className="w-full">
            <TabsTrigger value="direct" className="flex-1">Direct Message</TabsTrigger>
            <TabsTrigger value="group" className="flex-1">Group Chat</TabsTrigger>
          </TabsList>
          
          <div className="my-4">
            <ChatNameInput 
              chatName={chatName}
              setChatName={setChatName}
              chatType={chatType}
              participants={selectedParticipants}
            />
          </div>
          
          {chatType === "group" && (
            <ShiftChatSettings
              isShiftChat={isShiftChat}
              setIsShiftChat={setIsShiftChat}
              shiftDate={shiftDate}
              setShiftDate={setShiftDate}
              shiftName={shiftName}
              setShiftName={setShiftName}
              shiftTimeStart={shiftTimeStart}
              setShiftTimeStart={setShiftTimeStart}
              shiftTimeEnd={shiftTimeEnd}
              setShiftTimeEnd={setShiftTimeEnd}
            />
          )}
          
          <div className="my-4">
            <SearchBar 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
          
          <div className="my-4">
            {selectedParticipants.length > 0 && (
              <div className="mb-4">
                <Label className="text-sm font-medium">Selected members</Label>
                <ParticipantList 
                  participants={selectedParticipants}
                  teamMembers={teamMembers}
                  onRemoveParticipant={removeParticipant}
                />
              </div>
            )}
            
            <Label className="text-sm font-medium">Team members</Label>
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading team members...
              </div>
            ) : (
              <TeamMembersList 
                teamMembers={filteredTeamMembers}
                selectedParticipants={selectedParticipants}
                onToggleParticipant={toggleParticipant}
              />
            )}
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button 
              onClick={handleSubmit}
              disabled={selectedParticipants.length === 0}
            >
              Create
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
