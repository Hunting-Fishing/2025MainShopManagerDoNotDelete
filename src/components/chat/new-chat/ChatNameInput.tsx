
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ChatNameInputProps {
  chatName: string;
  chatType: "direct" | "group";
  participants: string[];
  setChatName: (name: string) => void;
}

export const ChatNameInput: React.FC<ChatNameInputProps> = ({
  chatName,
  chatType,
  participants,
  setChatName
}) => {
  return (
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
  );
};
