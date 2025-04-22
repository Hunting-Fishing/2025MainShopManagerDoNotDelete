
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatNameInput } from './new-chat/ChatNameInput';
import { ParticipantSearch } from './new-chat/ParticipantSearch';
import { ShiftChatSettings } from './new-chat/ShiftChatSettings';
import { useChatDialogState } from './new-chat/hooks/useChatDialogState';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { TeamMember } from '@/types/team';

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

  const { data: teamMembers = [], isLoading } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone, job_title, department, roles:user_roles(role:roles(name))')
        .order('last_name');

      if (error) throw error;

      return data.map(profile => ({
        id: profile.id,
        name: `${profile.first_name} ${profile.last_name}`,
        email: profile.email || '',
        phone: profile.phone || '',
        jobTitle: profile.job_title || '',
        department: profile.department || '',
        role: profile.roles?.[0]?.role?.name || 'No Role',
        status: 'Active' as const,
        workOrders: {
          assigned: 0,
          completed: 0
        }
      })) as TeamMember[];
    }
  });

  const getDefaultChatName = () => {
    if (isShiftChat) {
      return `${shiftName} - ${shiftDate ? new Date(shiftDate).toLocaleDateString() : 'Shift Chat'}`;
    }
    if (selectedParticipants.length === 1) {
      // Safely find the member and access name
      const member = teamMembers.find(m => m.id === selectedParticipants[0]);
      return member?.name || 'New Chat';
    }
    return selectedParticipants.length > 1 ? 'Group Chat' : 'New Chat';
  };

  const handleSubmit = () => {
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
    
    resetState();
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
          
          <div className="space-y-4">
            <ChatNameInput 
              chatName={chatName}
              setChatName={setChatName}
              chatType={chatType}
              participants={selectedParticipants}
            />
            
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
            
            <ParticipantSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedParticipants={selectedParticipants}
              teamMembers={teamMembers}
              onToggleParticipant={toggleParticipant}
              onRemoveParticipant={removeParticipant}
              isLoading={isLoading}
            />
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button 
                onClick={handleSubmit}
                disabled={selectedParticipants.length === 0}
              >
                Create
              </Button>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
