
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  MessageCircle, 
  Users2, 
  Search,
  X 
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
  const [chatType, setChatType] = useState<"direct" | "group">("direct");
  const [searchQuery, setSearchQuery] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [filteredTeamMembers, setFilteredTeamMembers] = useState(teamMembers);
  
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

  const handleAddParticipant = (userId: string) => {
    if (!participants.includes(userId)) {
      setParticipants([...participants, userId]);
      
      // If it's a direct chat and we just added the second participant, 
      // auto-generate a chat name if none exists
      if (chatType === "direct" && participants.length === 0 && !chatName.trim()) {
        const member = teamMembers.find(m => m.id === userId);
        if (member) {
          setChatName(`Chat with ${member.name}`);
        }
      }
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
    setChatType("direct");
    setSearchQuery("");
    setParticipants([]);
  };

  const handleChatTypeChange = (value: "direct" | "group") => {
    setChatType(value);
    
    // If switching to direct chat and we have more than 1 participant, reset participants
    if (value === "direct" && participants.length > 1) {
      setParticipants([]);
    }
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
            Create a New Chat
          </DialogTitle>
          <DialogDescription>
            Start a conversation with your team members
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 py-4 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="chat-type" className="text-sm font-medium">Chat Type</Label>
            <Select
              value={chatType}
              onValueChange={(value: "direct" | "group") => handleChatTypeChange(value)}
            >
              <SelectTrigger id="chat-type" className="w-full">
                <SelectValue placeholder="Select chat type" />
              </SelectTrigger>
              <SelectContent position="popper" className="w-full">
                <SelectItem value="direct" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>Direct Message</span>
                </SelectItem>
                <SelectItem value="group" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Group Chat</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="chat-name" className="text-sm font-medium">Chat Name</Label>
            <Input
              id="chat-name"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              placeholder={chatType === "direct" ? "Direct Message" : "Enter a group name"}
              className="w-full"
            />
          </div>
          
          <div className="space-y-4">
            <Label className="text-sm font-medium">Participants</Label>
            
            {selectedParticipantDetails.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
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
                {chatType === "direct" && selectedParticipantDetails.length === 1 && (
                  <p className="text-xs text-muted-foreground pl-2 pt-1">
                    Direct message with {selectedParticipantDetails[0]?.name}
                  </p>
                )}
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
                  {filteredTeamMembers.map(member => (
                    <li 
                      key={member.id}
                      className={`flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer ${
                        participants.includes(member.id) ? 'bg-muted' : ''
                      }`}
                      onClick={() => {
                        if (chatType === 'direct' && participants.length >= 1 && !participants.includes(member.id)) {
                          setParticipants([member.id]);
                        } else {
                          participants.includes(member.id) 
                            ? handleRemoveParticipant(member.id) 
                            : handleAddParticipant(member.id);
                        }
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
                        variant={participants.includes(member.id) ? "default" : "outline"} 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          participants.includes(member.id) 
                            ? handleRemoveParticipant(member.id) 
                            : handleAddParticipant(member.id);
                        }}
                      >
                        {participants.includes(member.id) ? 'Selected' : 'Select'}
                      </Button>
                    </li>
                  ))}
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
            Create Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
