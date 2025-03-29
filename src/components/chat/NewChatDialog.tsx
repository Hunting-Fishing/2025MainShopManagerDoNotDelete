
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Search } from 'lucide-react';
import { TeamMember } from '@/types/team';
import { teamMembers } from '@/data/teamData';

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
  const [chatName, setChatName] = useState('');
  const [chatType, setChatType] = useState<'direct' | 'group'>('direct');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [availableMembers, setAvailableMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);

  // Load team members
  useEffect(() => {
    // In a real app, this would be fetched from an API
    setAvailableMembers(teamMembers.filter(member => member.status === 'Active'));
  }, []);

  // Filter members based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMembers(availableMembers);
      return;
    }

    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = availableMembers.filter(
      member =>
        member.name.toLowerCase().includes(lowercaseQuery) ||
        member.email.toLowerCase().includes(lowercaseQuery) ||
        member.jobTitle.toLowerCase().includes(lowercaseQuery)
    );
    
    setFilteredMembers(filtered);
  }, [searchQuery, availableMembers]);

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return chatType === 'direct' ? [userId] : [...prev, userId];
      }
    });

    // If it's a direct chat, set the chat name to the user's name
    if (chatType === 'direct') {
      const user = availableMembers.find(member => member.id === userId);
      if (user) {
        setChatName(user.name);
      }
    }
  };

  const handleCreate = () => {
    if (!chatName.trim() || selectedUsers.length === 0) return;
    onCreate(chatName, chatType, selectedUsers);
    resetForm();
  };

  const resetForm = () => {
    setChatName('');
    setChatType('direct');
    setSearchQuery('');
    setSelectedUsers([]);
    onClose();
  };

  const handleTypeChange = (value: 'direct' | 'group') => {
    setChatType(value);
    setSelectedUsers([]);
    if (value === 'group') {
      setChatName('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Conversation Type</Label>
            <RadioGroup
              value={chatType}
              onValueChange={(value) => handleTypeChange(value as 'direct' | 'group')}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="direct" id="direct" />
                <Label htmlFor="direct" className="cursor-pointer">Direct Message</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="group" id="group" />
                <Label htmlFor="group" className="cursor-pointer">Group Chat</Label>
              </div>
            </RadioGroup>
          </div>

          {chatType === 'group' && (
            <div className="space-y-2">
              <Label htmlFor="chat-name">Group Name</Label>
              <Input
                id="chat-name"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                placeholder="Enter group name"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Select Members</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search team members..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="border rounded-md max-h-[200px] overflow-y-auto">
              {filteredMembers.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  No members found
                </div>
              ) : (
                <div className="divide-y">
                  {filteredMembers.map(member => (
                    <div
                      key={member.id}
                      className="flex items-center space-x-3 p-3 hover:bg-slate-50"
                    >
                      <Checkbox
                        id={`member-${member.id}`}
                        checked={selectedUsers.includes(member.id)}
                        onCheckedChange={() => handleUserToggle(member.id)}
                      />
                      <div className="flex-grow">
                        <Label
                          htmlFor={`member-${member.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {member.name}
                        </Label>
                        <p className="text-sm text-slate-500">{member.jobTitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={resetForm}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={
              !chatName.trim() || 
              selectedUsers.length === 0 ||
              (chatType === 'group' && !chatName.trim())
            }
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
