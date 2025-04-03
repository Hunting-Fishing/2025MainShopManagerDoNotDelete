
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Search,
  X,
  MessageCircle, 
  Users2, 
  UserPlus 
} from "lucide-react";
import { getInitials } from "@/data/teamData";
import { teamMembers } from "@/data/teamData";

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
  }, [searchQuery]);

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
  }, [participants, chatName]);

  const handleAddParticipant = (userId: string) => {
    if (!participants.includes(userId)) {
      setParticipants([...participants, userId]);
    }
  };

  const handleRemoveParticipant = (userId: string) => {
    setParticipants(participants.filter(id => id !== userId));
  };

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
    
    // Reset form
    setChatName("");
    setSearchQuery("");
    setParticipants([]);
  };

  // Get selected participants' details
  const selectedParticipantDetails = participants.map(
    id => teamMembers.find(member => member.id === id)
  ).filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
          <div className="space-y-2">
            <Label htmlFor="chat-name" className="text-sm font-medium flex items-center justify-between">
              <span>Chat Name</span>
              <span className="text-xs text-muted-foreground">
                {chatType === "direct" ? "Automatically named based on participant" : 
                 participants.length > 0 ? "You can customize the group name" : ""}
              </span>
            </Label>
            <Input
              id="chat-name"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              placeholder={chatType === "direct" ? "Direct Message" : "Enter a group name"}
              className="w-full"
              disabled={chatType === "direct" && participants.length === 1}
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Participants</Label>
              <Badge variant="outline" className="font-normal">
                {participants.length} selected
              </Badge>
            </div>
            
            {selectedParticipantDetails.length > 0 && (
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
                      onClick={() => handleRemoveParticipant(member.id)}
                    />
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            
            <div className="border rounded-md max-h-60 overflow-y-auto">
              {filteredTeamMembers.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No users found
                </div>
              ) : (
                <ul className="divide-y">
                  {filteredTeamMembers.map(member => {
                    const isSelected = participants.includes(member.id);
                    return (
                      <li 
                        key={member.id}
                        className={`flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer ${
                          isSelected ? 'bg-muted' : ''
                        }`}
                        onClick={() => {
                          isSelected 
                            ? handleRemoveParticipant(member.id) 
                            : handleAddParticipant(member.id);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.role}</p>
                          </div>
                        </div>
                        <Button 
                          variant={isSelected ? "default" : "outline"} 
                          size="sm"
                          className={isSelected ? "bg-primary" : ""}
                          onClick={(e) => {
                            e.stopPropagation();
                            isSelected 
                              ? handleRemoveParticipant(member.id) 
                              : handleAddParticipant(member.id);
                          }}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter className="px-6 py-4 bg-muted/50">
          <Button variant="outline" onClick={onClose}>
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
