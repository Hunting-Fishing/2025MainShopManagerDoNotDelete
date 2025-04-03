
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  const [participant, setParticipant] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);

  const handleAddParticipant = () => {
    if (participant && !participants.includes(participant)) {
      setParticipants([...participants, participant]);
      setParticipant("");
    }
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
    setParticipant("");
    setParticipants([]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New Chat</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="chat-name" className="text-right">
              Chat Name
            </Label>
            <Input
              id="chat-name"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              className="col-span-3"
              placeholder="Enter chat name"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="chat-type" className="text-right">
              Chat Type
            </Label>
            <Select
              value={chatType}
              onValueChange={(value: "direct" | "group") => setChatType(value)}
            >
              <SelectTrigger id="chat-type" className="col-span-3">
                <SelectValue placeholder="Select chat type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">Direct</SelectItem>
                <SelectItem value="group">Group</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="participant" className="text-right">
              Add User
            </Label>
            <div className="col-span-3 flex gap-2">
              <Input
                id="participant"
                value={participant}
                onChange={(e) => setParticipant(e.target.value)}
                placeholder="Enter user ID"
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={handleAddParticipant}>
                Add
              </Button>
            </div>
          </div>
          
          {participants.length > 0 && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">Participants</Label>
              <div className="col-span-3 flex flex-wrap gap-2">
                {participants.map((p, i) => (
                  <div key={i} className="bg-slate-100 px-2 py-1 rounded-md text-sm flex items-center">
                    {p}
                    <button
                      type="button"
                      className="ml-1 text-slate-500 hover:text-slate-700"
                      onClick={() => setParticipants(participants.filter((_, idx) => idx !== i))}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>
            Create Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
