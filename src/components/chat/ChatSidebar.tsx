
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { ChatRoom } from '@/types/chat';
import { OnlineStatusIndicator } from './dialog/OnlineStatusIndicator';
import { StatusBadge } from './dialog/StatusBadge';

interface ChatSidebarProps {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  onSelectRoom: (room: ChatRoom) => void;
  onNewChat: () => void;
  userId: string;
  getRoomStatus: (room: ChatRoom) => 'online' | 'away' | 'do_not_disturb' | 'offline';
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  rooms,
  currentRoom,
  onSelectRoom,
  onNewChat,
  userId,
  getRoomStatus
}) => {
  const [search, setSearch] = useState('');
  const [showCategories, setShowCategories] = useState<Record<string, boolean>>({
    pinned: true,
    direct: true,
    group: true,
    work_order: true
  });

  // Filter and group rooms
  const pinnedRooms = rooms.filter(room => room.is_pinned);
  
  const filteredRooms = rooms.filter(room => {
    if (room.is_archived) return false;
    if (search) {
      return room.name.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const directRooms = filteredRooms.filter(room => room.type === 'direct' && !room.is_pinned);
  const groupRooms = filteredRooms.filter(room => room.type === 'group' && !room.is_pinned);
  const workOrderRooms = filteredRooms.filter(room => room.type === 'work_order' && !room.is_pinned);

  const toggleCategory = (category: string) => {
    setShowCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const renderRoomList = (title: string, roomsList: ChatRoom[], category: string) => {
    if (roomsList.length === 0) return null;

    return (
      <div className="mb-4">
        <div 
          className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
          onClick={() => toggleCategory(category)}
        >
          <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">{title} ({roomsList.length})</h3>
          <Button variant="ghost" size="icon" className="h-5 w-5">
            {showCategories[category] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        {showCategories[category] && (
          <ul className="space-y-1 mt-1">
            {roomsList.map(room => {
              const isActive = currentRoom?.id === room.id;
              const status = getRoomStatus(room);
              
              return (
                <li 
                  key={room.id}
                  onClick={() => onSelectRoom(room)}
                  className={`px-3 py-2 rounded-md cursor-pointer flex items-center ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/20'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="relative">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-8 w-8 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {room.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <OnlineStatusIndicator 
                      status={status}
                      size="sm"
                      className="absolute -bottom-1 -right-1 border-2 border-white dark:border-gray-800"
                    />
                  </div>
                  <div className="ml-2 flex-1 overflow-hidden">
                    <div className="flex justify-between">
                      <span className={`font-medium text-sm truncate ${isActive ? 'text-blue-700 dark:text-blue-400' : ''}`}>
                        {room.name}
                      </span>
                      {room.unread_count && room.unread_count > 0 ? (
                        <span className="text-xs bg-red-500 text-white px-2 rounded-full ml-1">
                          {room.unread_count}
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {room.last_message ? (
                        <span>
                          {room.last_message.sender_id === userId ? 'You: ' : ''}
                          {room.last_message.content || 'Shared a file'}
                        </span>
                      ) : (
                        <span>No messages yet</span>
                      )}
                    </div>
                    {room.type === 'work_order' && (
                      <div className="mt-1">
                        <StatusBadge 
                          status="info" 
                          text={room.metadata?.work_order?.status || 'Work Order'} 
                          size="sm" 
                        />
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="w-80 border-r bg-gray-50 dark:bg-gray-900 flex flex-col h-full">
      <div className="p-3 border-b">
        <div className="mb-3">
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm flex items-center justify-center gap-2 py-2" 
            onClick={onNewChat}
          >
            <Plus className="h-4 w-4" /> New Chat
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-8"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {renderRoomList('Pinned', pinnedRooms, 'pinned')}
        {renderRoomList('Direct Messages', directRooms, 'direct')}
        {renderRoomList('Groups', groupRooms, 'group')}
        {renderRoomList('Work Orders', workOrderRooms, 'work_order')}
        
        {filteredRooms.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            {search ? 'No chats match your search' : 'No conversations yet'}
          </div>
        )}
      </div>
    </div>
  );
};
