
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CheckCheck, Play, Pause } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
  isCurrentUser: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isCurrentUser }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const isAudioMessage = message.content.startsWith('audio:');
  const audioUrl = isAudioMessage ? message.content.substring(6) : null;

  return (
    <div className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-900'} px-4 py-2 rounded-lg`}>
        {!isCurrentUser && (
          <div className="text-xs font-medium mb-1">{message.sender_name}</div>
        )}
        
        {isAudioMessage ? (
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAudio}
              className={`p-2 rounded-full ${isCurrentUser ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300 hover:bg-slate-400'}`}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>
            <div className="text-sm">Voice Message</div>
            <audio 
              ref={audioRef} 
              src={audioUrl} 
              onEnded={handleAudioEnded} 
              className="hidden"
            />
          </div>
        ) : (
          <div className="text-sm break-words">{message.content}</div>
        )}
        
        <div className={`flex justify-end items-center gap-1 text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-slate-500'}`}>
          <span>{formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}</span>
          {isCurrentUser && message.is_read && (
            <CheckCheck className="h-3 w-3" />
          )}
        </div>
      </div>
    </div>
  );
};
