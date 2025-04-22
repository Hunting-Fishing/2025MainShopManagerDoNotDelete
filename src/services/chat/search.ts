
import { supabase } from '@/integrations/supabase/client';
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

interface TextSegment {
  text: string;
  highlight: boolean;
}

export const prepareHighlightedText = (text: string, searchTerm: string): TextSegment[] => {
  if (!searchTerm || !text) return [{ text, highlight: false }];
  
  try {
    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map(part => ({
      text: part,
      highlight: part.toLowerCase() === searchTerm.toLowerCase()
    }));
  } catch (error) {
    console.error('Error preparing highlighted text:', error);
    return [{ text, highlight: false }];
  }
};
