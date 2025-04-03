
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users2, UserPlus } from "lucide-react";
import { teamMembers } from "@/data/teamData";
import { ParticipantList } from "./new-chat/ParticipantList";
import { SearchBar } from "./new-chat/SearchBar";
import { TeamMembersList } from "./new-chat/TeamMembersList";
import { ChatNameInput } from "./new-chat/ChatNameInput";
import { useChatDialogState } from "./new-chat/hooks/useChatDialogState";

interface NewChatDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, type: "direct" | "group", participants: string[]) => void;
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
    handleToggleParticipant,
    handleRemoveParticipant,
    resetState
  } = useChatDialogState(teamMembers);

  const handleCreate = () => {
    if (!chatName.trim()) {
      alert("Please enter a chat name");
      return;
    }

    if (participants.length === 0) {
      alert("Please add at least one participant");
      return;
    }

    onCreate(chatName, chatType, participants);
    resetState();
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl flex items-center gap-2">
            {chatType === "direct" ? <MessageCircle className="h-5 w-5" /> : <Users2 className="h-5 w-5" />}
            {chatType === "direct" ? "New Direct Message" : "New Group Chat"}
          </DialogTitle>
          <DialogDescription>
            {chatType === "direct" 
              ? "Start a conversation with a team member" 
              : "Create a group chat with multiple team members"
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 py-4 space-y-6">
          <ChatNameInput 
            chatName={chatName}
            chatType={chatType}
            participants={participants}
            setChatName={setChatName}
          />
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Participants</label>
              <Badge variant="outline" className="font-normal">
                {participants.length} selected
              </Badge>
            </div>
            
            <ParticipantList 
              participants={participants}
              teamMembers={teamMembers}
              onRemoveParticipant={handleRemoveParticipant}
            />
            
            <SearchBar 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
            
            <div className="border rounded-md max-h-60 overflow-y-auto">
              <TeamMembersList 
                filteredTeamMembers={filteredTeamMembers}
                participants={participants}
                onToggleParticipant={handleToggleParticipant}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter className="px-6 py-4 bg-muted/50">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={participants.length === 0 || !chatName.trim()}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            {chatType === "direct" ? "Start Chat" : "Create Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
