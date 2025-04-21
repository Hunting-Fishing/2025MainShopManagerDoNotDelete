
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Phone, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';

const Messages = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const { customer } = useCustomerAuth();

  // Fetch chat rooms for this customer
  useEffect(() => {
    const fetchChatRooms = async () => {
      if (!customer?.id) return;
      
      try {
        setLoading(true);
        
        const { data: participants, error: participantsError } = await supabase
          .from('chat_participants')
          .select('room_id')
          .eq('user_id', customer.id);
          
        if (participantsError) throw participantsError;
        
        if (participants && participants.length > 0) {
          const roomIds = participants.map(p => p.room_id);
          
          const { data: rooms, error: roomsError } = await supabase
            .from('chat_rooms')
            .select('*')
            .in('id', roomIds)
            .order('updated_at', { ascending: false });
            
          if (roomsError) throw roomsError;
          
          if (rooms && rooms.length > 0) {
            setChatRooms(rooms);
            setActiveRoom(rooms[0].id);
          } else {
            // If no rooms exist, create a default room
            await createDefaultChatRoom();
          }
        } else {
          // If no participation records exist, create a default room
          await createDefaultChatRoom();
        }
      } catch (error) {
        console.error("Error fetching chat rooms:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChatRooms();
  }, [customer?.id]);
  
  // Create a default chat room for the customer
  const createDefaultChatRoom = async () => {
    if (!customer?.id) return;
    
    try {
      // Create a new chat room
      const { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          name: `Support - ${customer.first_name || ''} ${customer.last_name || ''}`,
          type: 'support',
          metadata: { customer_id: customer.id }
        })
        .select()
        .single();
        
      if (roomError) throw roomError;
      
      // Add customer as participant
      if (roomData) {
        const { error: participantError } = await supabase
          .from('chat_participants')
          .insert({
            room_id: roomData.id,
            user_id: customer.id
          });
          
        if (participantError) throw participantError;
        
        setChatRooms([roomData]);
        setActiveRoom(roomData.id);
        
        // Send an automatic welcome message
        await supabase
          .from('chat_messages')
          .insert({
            room_id: roomData.id,
            sender_id: 'system',
            sender_name: 'System',
            content: 'Welcome! How can we help you today?',
            message_type: 'system'
          });
      }
    } catch (error) {
      console.error("Error creating chat room:", error);
    }
  };

  // Fetch messages for the active room
  useEffect(() => {
    if (!activeRoom) return;
    
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('room_id', activeRoom)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        if (data) {
          setMessages(data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    
    fetchMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`room-${activeRoom}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${activeRoom}`
        },
        (payload) => {
          setMessages(current => [...current, payload.new]);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeRoom]);

  // Send a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeRoom || !customer?.id) return;
    
    try {
      await supabase
        .from('chat_messages')
        .insert({
          room_id: activeRoom,
          sender_id: customer.id,
          sender_name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || customer.id,
          content: newMessage.trim(),
          message_type: 'text'
        });
        
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex h-[70vh]">
            {/* Chat rooms sidebar */}
            <div className="w-1/4 border-r">
              {loading ? (
                <div className="p-4 text-center">Loading...</div>
              ) : (
                <div>
                  {chatRooms.map(room => (
                    <div 
                      key={room.id}
                      className={`p-4 cursor-pointer hover:bg-slate-100 ${activeRoom === room.id ? 'bg-slate-100 border-l-4 border-indigo-500' : ''}`}
                      onClick={() => setActiveRoom(room.id)}
                    >
                      <div className="font-medium">{room.name}</div>
                      <div className="text-sm text-slate-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {room.updated_at && formatDistanceToNow(new Date(room.updated_at), { addSuffix: true })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Chat messages */}
            <div className="w-3/4 flex flex-col">
              {activeRoom ? (
                <>
                  <div className="flex-1 p-4 overflow-y-auto">
                    {messages.length === 0 ? (
                      <div className="text-center text-slate-400 mt-10">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map(message => (
                          <div 
                            key={message.id}
                            className={`p-3 rounded-lg max-w-[80%] ${
                              message.sender_id === customer?.id 
                                ? 'ml-auto bg-blue-100 text-blue-800' 
                                : message.message_type === 'system'
                                  ? 'bg-slate-100 text-slate-600 italic text-center mx-auto'
                                  : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            <div className="text-xs text-slate-500 mb-1">
                              {message.sender_id !== customer?.id && message.message_type !== 'system' && (
                                <span className="font-medium">{message.sender_name}: </span>
                              )}
                              {message.created_at && (
                                <span>{new Date(message.created_at).toLocaleTimeString()}</span>
                              )}
                            </div>
                            <div>{message.content}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t p-3">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1"
                      />
                      <Button type="submit" className="bg-blue-600">
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button type="button" variant="outline">
                        <Phone className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-400">Select a conversation to start chatting</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;
