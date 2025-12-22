import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category_id: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_read_time: number;
  tags: string[];
  video_url?: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  author_id?: string;
  view_count?: number;
  rating?: number;
}

export interface HelpLearningPath {
  id: string;
  title: string;
  description: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration: string;
  target_role: string;
  articles: string[];
  prerequisites: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HelpResource {
  id: string;
  title: string;
  description: string;
  resource_type: 'template' | 'tool' | 'video' | 'document' | 'calculator';
  file_url?: string;
  download_url?: string;
  category_id: string;
  tags: string[];
  is_active: boolean;
  download_count: number;
  created_at: string;
  updated_at: string;
}

// Fetch help categories
export const useHelpCategories = () => {
  return useQuery({
    queryKey: ['help-categories'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('help_categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching help categories:', error);
        return [];
      }
    },
  });
};

// Fetch help articles from enhanced help_articles table
export const useHelpArticles = (categoryId?: string, featured?: boolean) => {
  return useQuery({
    queryKey: ['help-articles', categoryId, featured],
    queryFn: async () => {
      try {
        let query = supabase
          .from('help_articles')
          .select(`
            *,
            help_categories (
              id,
              name,
              icon
            )
          `);
        
        if (categoryId && categoryId !== 'all') {
          query = query.eq('category_id', categoryId);
        }
        
        if (featured) {
          query = query.eq('is_featured', true);
        }
        
        query = query.order('is_featured', { ascending: false })
          .order('created_at', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        return data || [];
      } catch (error) {
        console.error('Error fetching help articles:', error);
        return [];
      }
    },
  });
};

// Fetch learning paths
export const useHelpLearningPaths = () => {
  return useQuery({
    queryKey: ['help-learning-paths'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('help_learning_paths')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching learning paths:', error);
        return [];
      }
    },
  });
};

// Fetch help resources
export const useHelpResources = (categoryId?: string, resourceType?: string) => {
  return useQuery({
    queryKey: ['help-resources', categoryId, resourceType],
    queryFn: async () => {
      try {
        let query = supabase
          .from('help_resources')
          .select(`
            *,
            help_categories (
              id,
              name,
              icon
            )
          `)
          .eq('is_active', true);
        
        if (categoryId && categoryId !== 'all') {
          query = query.eq('category_id', categoryId);
        }
        
        if (resourceType && resourceType !== 'all') {
          query = query.eq('resource_type', resourceType);
        }
        
        query = query.order('download_count', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching help resources:', error);
        return [];
      }
    },
  });
};

// Fetch single help article
export const useHelpArticle = (id: string) => {
  return useQuery({
    queryKey: ['help-article', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('help_articles')
          .select(`
            *,
            help_categories (
              id,
              name,
              icon
            )
          `)
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        // Increment view count
        await supabase
          .from('help_articles')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', id);
        
        return data;
      } catch (error) {
        console.error('Error fetching help article:', error);
        throw error;
      }
    },
  });
};

// Search help articles
export const useSearchHelpArticles = (searchTerm: string) => {
  return useQuery({
    queryKey: ['search-help-articles', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      
      try {
        const { data, error } = await supabase
          .from('help_articles')
          .select(`
            *,
            help_categories (
              id,
              name,
              icon
            )
          `)
          .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
          .order('is_featured', { ascending: false })
          .order('view_count', { ascending: false });
        
        if (error) throw error;
        
        // Record search analytics
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          await supabase
            .from('help_search_analytics')
            .insert({
              search_query: searchTerm,
              results_count: data?.length || 0,
              search_time_ms: 200,
              user_id: user.user.id
            });
        }
        
        return data || [];
      } catch (error) {
        console.error('Error searching help articles:', error);
        return [];
      }
    },
    enabled: searchTerm.length > 2,
  });
};
