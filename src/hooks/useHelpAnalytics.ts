import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HelpMetrics {
  totalViews: number;
  activeUsers: number;
  supportTickets: number;
  avgResolutionTime: string;
  viewsChange: number;
  usersChange: number;
  ticketsChange: number;
  resolutionChange: number;
}

export interface PopularArticle {
  id: string;
  title: string;
  category: string;
  views: number;
  rating: number;
  helpfulness: number;
}

export interface SearchTrend {
  query: string;
  count: number;
}

export interface FeedbackStat {
  rating: string;
  count: number;
  percentage: number;
}

const toPercentChange = (current: number, previous: number) => {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

const formatHours = (hours: number) => `${Math.round(hours * 10) / 10}h`;

const calculateAvgResolutionHours = (tickets: { created_at?: string; updated_at?: string }[]) => {
  if (!tickets.length) return 0;
  const totalMs = tickets.reduce((sum, ticket) => {
    if (!ticket.created_at || !ticket.updated_at) return sum;
    const created = new Date(ticket.created_at).getTime();
    const updated = new Date(ticket.updated_at).getTime();
    if (Number.isNaN(created) || Number.isNaN(updated)) return sum;
    return sum + Math.max(0, updated - created);
  }, 0);
  return totalMs / tickets.length / (1000 * 60 * 60);
};

// Fetch real help metrics from analytics
export const useHelpMetrics = () => {
  return useQuery({
    queryKey: ['help-metrics'],
    queryFn: async () => {
      try {
        // Get page views from last 30 days
        const now = new Date();
        const currentStart = new Date(now);
        currentStart.setDate(currentStart.getDate() - 30);
        const previousStart = new Date(now);
        previousStart.setDate(previousStart.getDate() - 60);

        const { data: currentViewsData, error: currentViewsError } = await supabase
          .from('help_analytics')
          .select('user_id, created_at')
          .eq('event_type', 'page_view')
          .gte('created_at', currentStart.toISOString());

        if (currentViewsError) throw currentViewsError;

        const { data: previousViewsData, error: previousViewsError } = await supabase
          .from('help_analytics')
          .select('user_id, created_at')
          .eq('event_type', 'page_view')
          .gte('created_at', previousStart.toISOString())
          .lt('created_at', currentStart.toISOString());

        if (previousViewsError) throw previousViewsError;

        const currentViews = currentViewsData?.length || 0;
        const previousViews = previousViewsData?.length || 0;
        const currentUsers = new Set((currentViewsData || []).map(view => view.user_id).filter(Boolean)).size;
        const previousUsers = new Set((previousViewsData || []).map(view => view.user_id).filter(Boolean)).size;

        const { data: currentTicketsData, error: currentTicketsError } = await supabase
          .from('support_tickets')
          .select('id, created_at')
          .gte('created_at', currentStart.toISOString());

        if (currentTicketsError) throw currentTicketsError;

        const { data: previousTicketsData, error: previousTicketsError } = await supabase
          .from('support_tickets')
          .select('id, created_at')
          .gte('created_at', previousStart.toISOString())
          .lt('created_at', currentStart.toISOString());

        if (previousTicketsError) throw previousTicketsError;

        const { data: currentResolvedTickets } = await supabase
          .from('support_tickets')
          .select('created_at, updated_at')
          .in('status', ['resolved', 'closed'])
          .gte('updated_at', currentStart.toISOString());

        const { data: previousResolvedTickets } = await supabase
          .from('support_tickets')
          .select('created_at, updated_at')
          .in('status', ['resolved', 'closed'])
          .gte('updated_at', previousStart.toISOString())
          .lt('updated_at', currentStart.toISOString());

        const currentAvgResolution = calculateAvgResolutionHours(currentResolvedTickets || []);
        const previousAvgResolution = calculateAvgResolutionHours(previousResolvedTickets || []);

        const metrics: HelpMetrics = {
          totalViews: currentViews,
          activeUsers: currentUsers,
          supportTickets: currentTicketsData?.length || 0,
          avgResolutionTime: formatHours(currentAvgResolution),
          viewsChange: toPercentChange(currentViews, previousViews),
          usersChange: toPercentChange(currentUsers, previousUsers),
          ticketsChange: toPercentChange(currentTicketsData?.length || 0, previousTicketsData?.length || 0),
          resolutionChange: toPercentChange(currentAvgResolution, previousAvgResolution)
        };

        return metrics;
      } catch (error) {
        console.error('Error fetching help metrics:', error);
        return {
          totalViews: 0,
          activeUsers: 0,
          supportTickets: 0,
          avgResolutionTime: '0h',
          viewsChange: 0,
          usersChange: 0,
          ticketsChange: 0,
          resolutionChange: 0
        };
      }
    },
  });
};

// Fetch popular articles based on real analytics
export const usePopularArticles = () => {
  return useQuery({
    queryKey: ['popular-articles'],
    queryFn: async () => {
      try {
        // Get article views from analytics
        const { data: analyticsData, error } = await supabase
          .from('help_analytics')
          .select('resource_id, resource_type')
          .eq('event_type', 'article_view')
          .eq('resource_type', 'article')
          .not('resource_id', 'is', null);

        if (error) throw error;

        // Count views per article
        const viewCounts = analyticsData?.reduce((acc: any, item) => {
          acc[item.resource_id] = (acc[item.resource_id] || 0) + 1;
          return acc;
        }, {}) || {};

        // Get top articles with their details
        const topArticleIds = Object.keys(viewCounts)
          .sort((a, b) => viewCounts[b] - viewCounts[a])
          .slice(0, 5);

        if (topArticleIds.length === 0) {
          return [];
        }

        const { data: articlesData } = await supabase
          .from('help_articles')
          .select('*')
          .in('id', topArticleIds);

        // Fetch feedback data for these articles using help_feedback table (resource_id, resource_type)
        const { data: feedbackData } = await supabase
          .from('help_feedback')
          .select('resource_id, rating, is_helpful')
          .eq('resource_type', 'article')
          .in('resource_id', topArticleIds);

        // Calculate ratings and helpfulness per article
        const articleFeedback = feedbackData?.reduce((acc: any, item) => {
          const resourceId = item.resource_id;
          if (!resourceId) return acc;
          if (!acc[resourceId]) {
            acc[resourceId] = { ratings: [], helpful: 0, total: 0 };
          }
          if (item.rating) acc[resourceId].ratings.push(item.rating);
          if (item.is_helpful !== null) {
            acc[resourceId].total++;
            if (item.is_helpful) acc[resourceId].helpful++;
          }
          return acc;
        }, {}) || {};

        return (articlesData || []).map((article) => {
          const feedback = articleFeedback[article.id] || { ratings: [], helpful: 0, total: 0 };
          const avgRating = feedback.ratings.length > 0 
            ? feedback.ratings.reduce((a: number, b: number) => a + b, 0) / feedback.ratings.length 
            : 0;
          const helpfulness = feedback.total > 0 
            ? (feedback.helpful / feedback.total) * 100 
            : 0;

          return {
            id: article.id,
            title: article.title,
            category: article.category || 'general',
            views: viewCounts[article.id] || 0,
            rating: Math.round(avgRating * 10) / 10,
            helpfulness: Math.round(helpfulness)
          };
        });
      } catch (error) {
        console.error('Error fetching popular articles:', error);
        return [];
      }
    },
  });
};

// Fetch real search trends
export const useSearchTrends = () => {
  return useQuery({
    queryKey: ['search-trends'],
    queryFn: async () => {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data, error } = await supabase
          .from('help_search_analytics')
          .select('search_query')
          .gte('created_at', thirtyDaysAgo.toISOString());

        if (error) throw error;

        // Count query frequencies
        const queryCounts = (data || []).reduce((acc: any, item) => {
          const query = item.search_query?.toLowerCase() || '';
          acc[query] = (acc[query] || 0) + 1;
          return acc;
        }, {});

        // Get top 5 search queries
        return Object.entries(queryCounts)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 5)
          .map(([query, count]) => ({
            query,
            count: count as number
          }));
      } catch (error) {
        console.error('Error fetching search trends:', error);
        return [];
      }
    },
  });
};

// Fetch feedback statistics
export const useFeedbackStats = () => {
  return useQuery({
    queryKey: ['feedback-stats'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('help_feedback')
          .select('rating, is_helpful');

        if (error) throw error;

        const total = data?.length || 0;
        if (total === 0) return [];

        // Calculate rating distribution
        const ratingCounts = {
          'Very Helpful': 0,
          'Helpful': 0,
          'Somewhat Helpful': 0,
          'Not Helpful': 0
        };

        data?.forEach(feedback => {
          if (feedback.rating) {
            if (feedback.rating >= 5) ratingCounts['Very Helpful']++;
            else if (feedback.rating >= 4) ratingCounts['Helpful']++;
            else if (feedback.rating >= 3) ratingCounts['Somewhat Helpful']++;
            else ratingCounts['Not Helpful']++;
          } else if (feedback.is_helpful !== null) {
            if (feedback.is_helpful) ratingCounts['Helpful']++;
            else ratingCounts['Not Helpful']++;
          }
        });

        return Object.entries(ratingCounts).map(([rating, count]) => ({
          rating,
          count,
          percentage: Math.round((count / total) * 100)
        }));
      } catch (error) {
        console.error('Error fetching feedback stats:', error);
        return [];
      }
    },
  });
};

// Track analytics event
export const useTrackAnalytics = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      eventType, 
      resourceType, 
      resourceId, 
      metadata = {} 
    }: {
      eventType: string;
      resourceType?: string;
      resourceId?: string;
      metadata?: Record<string, any>;
    }) => {
      const { data, error } = await supabase.rpc('track_help_analytics', {
        p_event_type: eventType,
        p_resource_type: resourceType,
        p_resource_id: resourceId,
        p_metadata: metadata
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate analytics queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['help-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['popular-articles'] });
      queryClient.invalidateQueries({ queryKey: ['search-trends'] });
    }
  });
};
