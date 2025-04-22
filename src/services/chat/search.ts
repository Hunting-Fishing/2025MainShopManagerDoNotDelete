
import React from 'react';
import { supabase } from '@/lib/supabase';
import { ChatMessage, ChatSearchQuery } from '@/types/chat';

export const searchChatMessages = async (
  roomId: string,
  query: ChatSearchQuery
): Promise<ChatMessage[]> => {
  try {
    let supabaseQuery = supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    // Add text search if provided
    if (query.text && query.text.trim()) {
      supabaseQuery = supabaseQuery.ilike('content', `%${query.text.trim()}%`);
    }
    
    // Filter by sender if needed
    if (query.user_id) {
      supabaseQuery = supabaseQuery.eq('sender_id', query.user_id);
    }
    
    // Filter by date range
    if (query.date_from) {
      supabaseQuery = supabaseQuery.gte('created_at', query.date_from);
    }
    
    if (query.date_to) {
      supabaseQuery = supabaseQuery.lte('created_at', query.date_to);
    }
    
    // Filter by flags
    if (query.is_flagged !== undefined) {
      supabaseQuery = supabaseQuery.eq('is_flagged', query.is_flagged);
    }
    
    // Filter by files
    if (query.has_files) {
      supabaseQuery = supabaseQuery.not('file_url', 'is', null);
    }

    const { data, error } = await supabaseQuery;
    
    if (error) throw error;
    
    return data as ChatMessage[];
  } catch (error) {
    console.error('Error searching messages:', error);
    throw new Error('Failed to search messages');
  }
};

export const highlightSearchTerm = (text: string, searchTerm: string): React.ReactNode => {
  if (!searchTerm || !text) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    regex.test(part) ? <span key={i} className="bg-yellow-200 dark:bg-yellow-700">{part}</span> : part
  );
};
