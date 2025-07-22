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

// Mock data for categories since they might not be in the current database
const mockCategories: HelpCategory[] = [
  { id: '1', name: 'Getting Started', description: 'Essential guides for new users', icon: 'Rocket', sort_order: 1, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '2', name: 'Work Orders', description: 'Work order management system', icon: 'Wrench', sort_order: 2, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '3', name: 'Customer Management', description: 'Customer relationship tools', icon: 'Users', sort_order: 3, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '4', name: 'Inventory Management', description: 'Parts and inventory control', icon: 'Package', sort_order: 4, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '5', name: 'Financial Management', description: 'Billing and financial tools', icon: 'DollarSign', sort_order: 5, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: '6', name: 'Reporting & Analytics', description: 'Business intelligence', icon: 'BarChart3', sort_order: 6, is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
];

// Mock data for learning paths
const mockLearningPaths: HelpLearningPath[] = [
  {
    id: '1',
    title: 'Complete Beginner Onboarding',
    description: 'Everything you need to know to get started with ServicePro in your first 30 days',
    difficulty_level: 'beginner',
    estimated_duration: '4-6 weeks',
    target_role: 'All Users',
    articles: ['Complete Setup Guide', 'First Week Checklist'],
    prerequisites: [],
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '2',
    title: 'Service Manager Mastery',
    description: 'Advanced path for service managers focusing on operations and analytics',
    difficulty_level: 'intermediate',
    estimated_duration: '6-8 weeks',
    target_role: 'Manager',
    articles: ['Advanced Work Order Workflows', 'Custom Report Creation'],
    prerequisites: ['Complete Setup Guide'],
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  }
];

// Mock data for resources
const mockResources: HelpResource[] = [
  {
    id: '1',
    title: 'Work Order Template Library',
    description: 'Collection of professional work order templates for different service types',
    resource_type: 'template',
    category_id: '2',
    tags: ['templates', 'work-orders'],
    is_active: true,
    download_count: 3456,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '2',
    title: 'ROI Calculator Tool',
    description: 'Calculate return on investment for ServicePro implementation',
    resource_type: 'calculator',
    category_id: '6',
    tags: ['calculator', 'roi'],
    is_active: true,
    download_count: 1876,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  }
];

// Fetch help categories
export const useHelpCategories = () => {
  return useQuery({
    queryKey: ['help-categories'],
    queryFn: async () => {
      // Try to fetch from database first, fall back to mock data
      try {
        const { data, error } = await supabase
          .from('help_articles')
          .select('category')
          .limit(1);
        
        // If table exists but no categories table, return mock categories
        return mockCategories;
      } catch (error) {
        // Return mock data if database query fails
        return mockCategories;
      }
    },
  });
};

// Fetch help articles from existing help_articles table
export const useHelpArticles = (categoryId?: string, featured?: boolean) => {
  return useQuery({
    queryKey: ['help-articles', categoryId, featured],
    queryFn: async () => {
      try {
        let query = supabase.from('help_articles').select('*');
        
        if (featured) {
          query = query.eq('featured', true);
        }
        
        query = query.order('created_at', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Transform existing data to match our interface
        return (data || []).map((article: any) => ({
          id: article.id,
          title: article.title,
          content: article.content,
          category_id: categoryId || '1',
          difficulty_level: 'beginner' as const,
          estimated_read_time: 5,
          tags: article.search_keywords || [],
          video_url: undefined,
          is_featured: article.featured || false,
          created_at: article.created_at,
          updated_at: article.updated_at,
          view_count: 0,
          rating: 4.5,
          help_categories: { name: 'General', icon: 'FileText' }
        }));
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
      // Return mock data for now
      return mockLearningPaths;
    },
  });
};

// Fetch help resources
export const useHelpResources = (categoryId?: string, resourceType?: string) => {
  return useQuery({
    queryKey: ['help-resources', categoryId, resourceType],
    queryFn: async () => {
      // Return mock data for now
      let filtered = mockResources;
      
      if (categoryId && categoryId !== 'all') {
        filtered = filtered.filter(resource => resource.category_id === categoryId);
      }
      
      if (resourceType && resourceType !== 'all') {
        filtered = filtered.filter(resource => resource.resource_type === resourceType);
      }
      
      return filtered.map(resource => ({
        ...resource,
        help_categories: { name: 'General', icon: 'FileText' }
      }));
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
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        return {
          id: data.id,
          title: data.title,
          content: data.content,
          category_id: '1',
          difficulty_level: 'beginner' as const,
          estimated_read_time: 5,
          tags: data.search_keywords || [],
          video_url: undefined,
          is_featured: data.featured || false,
          created_at: data.created_at,
          updated_at: data.updated_at,
          view_count: 0,
          rating: 4.5,
          help_categories: { name: 'General', icon: 'FileText' }
        };
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
          .select('*')
          .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
          .order('featured', { ascending: false })
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return (data || []).map((article: any) => ({
          id: article.id,
          title: article.title,
          content: article.content,
          category_id: '1',
          difficulty_level: 'beginner' as const,
          estimated_read_time: 5,
          tags: article.search_keywords || [],
          video_url: undefined,
          is_featured: article.featured || false,
          created_at: article.created_at,
          updated_at: article.updated_at,
          view_count: 0,
          rating: 4.5,
          help_categories: { name: 'General', icon: 'FileText' }
        }));
      } catch (error) {
        console.error('Error searching help articles:', error);
        return [];
      }
    },
    enabled: searchTerm.length > 2,
  });
};