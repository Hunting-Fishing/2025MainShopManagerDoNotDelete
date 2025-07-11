
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChatRoom, ChatMessage } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';
import * as chatService from '@/services/chat/chatService';
import { MessageCircle, Send, Users, Pin, Archive, Plus } from 'lucide-react';

export default function Chat() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    loadChatRooms();
  }, []);

  useEffect(() => {
    if (roomId && chatRooms.length > 0) {
      const room = chatRooms.find(r => r.id === roomId);
      if (room) {
        setCurrentRoom(room);
        loadMessages(roomId);
      }
    } else if (chatRooms.length > 0 && !roomId) {
      setCurrentRoom(chatRooms[0]);
      navigate(`/chat/${chatRooms[0].id}`, { replace: true });
    }
  }, [roomId, chatRooms, navigate]);

  const loadChatRooms = async () => {
    try {
      setLoading(true);
      const rooms = await chatService.getChatRooms();
      setChatRooms(rooms);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      toast({
        title: "Error",
        description: "Failed to load chat rooms.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const roomMessages = await chatService.getChatMessages(roomId);
      setMessages(roomMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error", 
        description: "Failed to load messages.",
        variant: "destructive",
      });
    }
  };

  const handleSelectRoom = (room: ChatRoom) => {
    setCurrentRoom(room);
    navigate(`/chat/${room.id}`);
  };

  const handleSendMessage = async () => {
    if (!currentRoom || !newMessage.trim()) return;

    try {
      await chatService.sendMessage(currentRoom.id, newMessage, 'current-user', 'You');
      setNewMessage('');
      // Reload messages to show the new one
      loadMessages(currentRoom.id);
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNewChat = async () => {
    try {
      const newRoom = await chatService.createChatRoom('New Chat Room', 'group');
      setChatRooms(prev => [...prev, newRoom]);
      navigate(`/chat/${newRoom.id}`);
      
      toast({
        title: "Chat created",
        description: "New chat room has been created.",
      });
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: "Error",
        description: "Failed to create chat room.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading chat rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar - Chat Rooms */}
      <div className="w-80 border-r bg-muted/10">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Chat Rooms</h2>
            <Button size="sm" onClick={handleNewChat}>
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="p-2 space-y-2">
            {chatRooms.map((room) => (
              <Card 
                key={room.id} 
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  currentRoom?.id === room.id ? 'bg-muted border-primary' : ''
                }`}
                onClick={() => handleSelectRoom(room)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      <span className="font-medium truncate">{room.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {room.is_pinned && <Pin className="h-3 w-3 text-primary" />}
                      {room.is_archived && <Archive className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="text-xs">
                      {room.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(room.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {chatRooms.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No chat rooms yet</p>
                <Button variant="outline" onClick={handleNewChat}>
                  Create First Chat Room
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-muted/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{currentRoom.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{currentRoom.type}</Badge>
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {message.sender_name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{message.sender_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="mx-auto h-12 w-12 opacity-50 mb-4" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Welcome to Chat</h3>
              <p className="text-muted-foreground mb-6">
                Select a chat room from the sidebar to start messaging
              </p>
              <Button onClick={handleNewChat}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Chat Room
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
