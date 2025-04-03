
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShiftChatSettings } from './new-chat/ShiftChatSettings';
import { SearchBar } from './new-chat/SearchBar';
import { ParticipantList } from './new-chat/ParticipantList';
import { TeamMembersList } from './new-chat/TeamMembersList';
import { ChatNameInput } from './new-chat/ChatNameInput';
import { useChatDialogState } from './new-chat/hooks/useChatDialogState';
import { teamMembers } from '@/data/teamData';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface NewChatDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, type: 'direct' | 'group', participants: string[]) => void;
}

export const NewChatDialog: React.FC<NewChatDialogProps> = ({
  open,
  onClose,
  onCreate
}) => {
  const {
    chatName,
    setChatName,
    searchQuery,
    setSearchQuery,
    participants,
    filteredTeamMembers,
    chatType,
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
    handleToggleParticipant,
    handleRemoveParticipant,
    resetState
  } = useChatDialogState(teamMembers);

  // Handle dialog close
  const handleClose = () => {
    resetState();
    onClose();
  };

  // Handle create chat
  const handleCreate = () => {
    let finalChatName = chatName;
    if (isShiftChat) {
      // Format shift chat name if not manually set
      const formattedDate = shiftDate ? format(shiftDate, 'yyyy-MM-dd') : 'unscheduled';
      if (!chatName) {
        finalChatName = `${shiftName || 'Shift'} - ${formattedDate}`;
      }
    }
    
    // Pass additional metadata for shift chats
    const metadata = isShiftChat ? {
      is_shift_chat: true,
      shift_date: shiftDate ? format(shiftDate, 'yyyy-MM-dd') : undefined,
      shift_name: shiftName,
      shift_time: {
        start: shiftTimeStart,
        end: shiftTimeEnd
      },
      shift_participants: participants
    } : undefined;
    
    onCreate(finalChatName, chatType, participants);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Create New Chat</span>
            {participants.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {participants.length} {participants.length === 1 ? 'participant' : 'participants'}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Shift Chat Settings */}
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

          {/* Chat Name Input */}
          <ChatNameInput 
            chatName={chatName} 
            chatType={chatType} 
            participants={participants}
            setChatName={setChatName}
          />

          {/* Selected Participants */}
          <ParticipantList 
            participants={participants} 
            teamMembers={teamMembers} 
            onRemoveParticipant={handleRemoveParticipant}
          />

          <Separator />

          {/* Search Bar */}
          <SearchBar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery}
          />

          {/* Team Members List */}
          <div className="h-[250px] overflow-y-auto border rounded-md">
            <TeamMembersList 
              teamMembers={filteredTeamMembers} 
              selectedParticipants={participants} 
              onToggleParticipant={handleToggleParticipant}
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={participants.length === 0}
          >
            {participants.length === 1 ? 'Start Chat' : 'Create Group'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
