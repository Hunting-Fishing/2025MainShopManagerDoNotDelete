import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FeatureRequest, CreateFeatureRequestPayload, FeatureRequestVote } from '@/types/feature-requests';

export function useFeatureRequests() {
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadFeatureRequests = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('feature_requests')
        .select('*')
        .order('vote_count', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeatureRequests((data || []) as FeatureRequest[]);
    } catch (error) {
      console.error('Error loading feature requests:', error);
      toast({
        title: "Error",
        description: "Failed to load feature requests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createFeatureRequest = async (payload: CreateFeatureRequestPayload): Promise<FeatureRequest | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('feature_requests')
        .insert({
          ...payload,
          submitted_by: user?.id,
          is_public: true,
          is_featured: false,
          vote_count: 0,
          upvotes: 0,
          downvotes: 0,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Feature Request Submitted",
        description: "Thank you for your suggestion! We'll review it and get back to you.",
      });

      // Reload feature requests to show the new one
      loadFeatureRequests();
      
      return data as FeatureRequest;
    } catch (error) {
      console.error('Error creating feature request:', error);
      toast({
        title: "Error",
        description: "Failed to submit feature request. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateFeatureRequestStatus = async (id: string, status: FeatureRequest['status'], changeReason?: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('feature_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Feature request status changed to ${status.replace('_', ' ')}`,
      });

      loadFeatureRequests();
      return true;
    } catch (error) {
      console.error('Error updating feature request status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
      return false;
    }
  };

  const voteOnFeatureRequest = async (featureRequestId: string, voteType: 'upvote' | 'downvote'): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to vote on feature requests",
          variant: "destructive",
        });
        return false;
      }

      // Check if user has already voted
      const { data: existingVote } = await supabase
        .from('feature_request_votes')
        .select('*')
        .eq('feature_request_id', featureRequestId)
        .eq('user_id', user.id)
        .single();

      if (existingVote) {
        // Update existing vote
        if (existingVote.vote_type === voteType) {
          // Remove vote if clicking the same vote type
          const { error } = await supabase
            .from('feature_request_votes')
            .delete()
            .eq('id', existingVote.id);

          if (error) throw error;
        } else {
          // Change vote type
          const { error } = await supabase
            .from('feature_request_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);

          if (error) throw error;
        }
      } else {
        // Create new vote
        const { error } = await supabase
          .from('feature_request_votes')
          .insert({
            feature_request_id: featureRequestId,
            user_id: user.id,
            vote_type: voteType,
          });

        if (error) throw error;
      }

      // Reload to get updated vote counts
      loadFeatureRequests();
      return true;
    } catch (error) {
      console.error('Error voting on feature request:', error);
      toast({
        title: "Error",
        description: "Failed to register vote",
        variant: "destructive",
      });
      return false;
    }
  };

  const getUserVote = async (featureRequestId: string): Promise<FeatureRequestVote | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data, error } = await supabase
        .from('feature_request_votes')
        .select('*')
        .eq('feature_request_id', featureRequestId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      return data as FeatureRequestVote;
    } catch (error) {
      console.error('Error getting user vote:', error);
      return null;
    }
  };

  useEffect(() => {
    loadFeatureRequests();
  }, []);

  return {
    featureRequests,
    isLoading,
    loadFeatureRequests,
    createFeatureRequest,
    updateFeatureRequestStatus,
    voteOnFeatureRequest,
    getUserVote,
  };
}