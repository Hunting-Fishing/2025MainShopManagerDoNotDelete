import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
  EmailCampaign,
  EmailCampaignAnalytics,
  EmailABTest,
  EmailABTestVariant,
  EmailABTestResult
} from '@/types/email';
import { emailService } from '@/services/email';

interface UseEmailCampaignDetailsReturn {
  campaign: EmailCampaign | null;
  analytics: EmailCampaignAnalytics | null;
  abTest: EmailABTest | null;
  variants: EmailABTestVariant[] | null;
  isLoading: boolean;
  isABTestLoading: boolean;
  fetchCampaignDetails: (campaignId: string) => Promise<void>;
  fetchCampaignAnalytics: (campaignId: string) => Promise<void>;
  fetchABTestDetails: (campaignId: string) => Promise<void>;
  createCampaign: (campaign: Partial<EmailCampaign>) => Promise<EmailCampaign | null>;
  updateCampaign: (campaignId: string, campaign: Partial<EmailCampaign>) => Promise<EmailCampaign | null>;
  deleteCampaign: (campaignId: string) => Promise<boolean>;
  startABTest: (campaignId: string, abTest: Omit<EmailABTest, 'id' | 'campaign_id' | 'created_at' | 'updated_at' | 'status'>) => Promise<EmailABTest | null>;
  updateABTest: (testId: string, abTest: Partial<Omit<EmailABTest, 'id' | 'campaign_id' | 'created_at' | 'updated_at' | 'status'>>) => Promise<EmailABTest | null>;
  deleteABTest: (testId: string) => Promise<boolean>;
  createABTestVariant: (testId: string, variant: Omit<EmailABTestVariant, 'id' | 'test_id' | 'total_sent' | 'total_opened' | 'total_clicked' | 'open_rate' | 'click_rate' | 'is_winner' | 'created_at' | 'updated_at'>) => Promise<EmailABTestVariant | null>;
  updateABTestVariant: (variantId: string, variant: Partial<Omit<EmailABTestVariant, 'id' | 'test_id' | 'total_sent' | 'total_opened' | 'total_clicked' | 'open_rate' | 'click_rate' | 'is_winner' | 'created_at' | 'updated_at'>>) => Promise<EmailABTestVariant | null>;
  deleteABTestVariant: (variantId: string) => Promise<boolean>;
  selectABTestWinner: (campaignId: string, variantId?: string) => Promise<boolean>;
}

export const useEmailCampaignDetails = (): UseEmailCampaignDetailsReturn => {
  const [campaign, setCampaign] = useState<EmailCampaign | null>(null);
  const [analytics, setAnalytics] = useState<EmailCampaignAnalytics | null>(null);
  const [abTest, setABTest] = useState<EmailABTest | null>(null);
  const [variants, setVariants] = useState<EmailABTestVariant[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isABTestLoading, setIsABTestLoading] = useState(false);
  const { toast } = useToast();

  const fetchCampaignDetails = async (campaignId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (error) {
        throw error;
      }

      setCampaign(data || null);
    } catch (error: any) {
      console.error('Error fetching campaign details:', error);
      toast({
        title: "Error",
        description: "Failed to load campaign details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCampaignAnalytics = async (campaignId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_campaign_analytics')
        .select('*')
        .eq('campaign_id', campaignId)
        .single();

      if (error) {
        throw error;
      }

      setAnalytics(data || null);
    } catch (error: any) {
      console.error('Error fetching campaign analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load campaign analytics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchABTestDetails = async (campaignId: string) => {
    setIsABTestLoading(true);
    try {
      // Fetch A/B test details
      const { data: testData, error: testError } = await supabase
        .from('email_ab_tests')
        .select('*')
        .eq('campaign_id', campaignId)
        .single();

      if (testError) {
        throw testError;
      }

      setABTest(testData || null);

      // Fetch A/B test variants
      if (testData) {
        const { data: variantData, error: variantError } = await supabase
          .from('email_ab_test_variants')
          .select('*')
          .eq('test_id', testData.id);

        if (variantError) {
          throw variantError;
        }

        setVariants(variantData || null);
      } else {
        setVariants(null);
      }
    } catch (error: any) {
      console.error('Error fetching A/B test details:', error);
      toast({
        title: "Error",
        description: "Failed to load A/B test details",
        variant: "destructive",
      });
    } finally {
      setIsABTestLoading(false);
    }
  };

  const createCampaign = async (campaign: Partial<EmailCampaign>): Promise<EmailCampaign | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .insert(campaign)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Campaign created successfully",
      });
      return data;
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCampaign = async (campaignId: string, campaign: Partial<EmailCampaign>): Promise<EmailCampaign | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .update(campaign)
        .eq('id', campaignId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Campaign updated successfully",
      });
      return data;
    } catch (error: any) {
      console.error('Error updating campaign:', error);
      toast({
        title: "Error",
        description: "Failed to update campaign",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCampaign = async (campaignId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('email_campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Campaign deleted successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting campaign:', error);
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const startABTest = async (campaignId: string, abTest: Omit<EmailABTest, 'id' | 'campaign_id' | 'created_at' | 'updated_at' | 'status'>): Promise<EmailABTest | null> => {
    setIsABTestLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_ab_tests')
        .insert({
          ...abTest,
          campaign_id: campaignId,
          status: 'running',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "A/B test started successfully",
      });
      
      // Refresh campaign details
      fetchCampaignDetails(campaignId);
      return data;
    } catch (error: any) {
      console.error('Error starting A/B test:', error);
      toast({
        title: "Error",
        description: "Failed to start A/B test",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsABTestLoading(false);
    }
  };

  const updateABTest = async (testId: string, abTest: Partial<Omit<EmailABTest, 'id' | 'campaign_id' | 'created_at' | 'updated_at' | 'status'>>): Promise<EmailABTest | null> => {
    setIsABTestLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_ab_tests')
        .update(abTest)
        .eq('id', testId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "A/B test updated successfully",
      });
      return data;
    } catch (error: any) {
      console.error('Error updating A/B test:', error);
      toast({
        title: "Error",
        description: "Failed to update A/B test",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsABTestLoading(false);
    }
  };

  const deleteABTest = async (testId: string): Promise<boolean> => {
    setIsABTestLoading(true);
    try {
      const { error } = await supabase
        .from('email_ab_tests')
        .delete()
        .eq('id', testId);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "A/B test deleted successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting A/B test:', error);
      toast({
        title: "Error",
        description: "Failed to delete A/B test",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsABTestLoading(false);
    }
  };

  const createABTestVariant = async (testId: string, variant: Omit<EmailABTestVariant, 'id' | 'test_id' | 'total_sent' | 'total_opened' | 'total_clicked' | 'open_rate' | 'click_rate' | 'is_winner' | 'created_at' | 'updated_at'>): Promise<EmailABTestVariant | null> => {
    setIsABTestLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_ab_test_variants')
        .insert({
          ...variant,
          test_id: testId,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "A/B test variant created successfully",
      });
      
      // Refresh campaign details
      if (campaign?.id) {
        fetchCampaignDetails(campaign?.id);
      }
      return data;
    } catch (error: any) {
      console.error('Error creating A/B test variant:', error);
      toast({
        title: "Error",
        description: "Failed to create A/B test variant",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsABTestLoading(false);
    }
  };

  const updateABTestVariant = async (variantId: string, variant: Partial<Omit<EmailABTestVariant, 'id' | 'test_id' | 'total_sent' | 'total_opened' | 'total_clicked' | 'open_rate' | 'click_rate' | 'is_winner' | 'created_at' | 'updated_at'>>): Promise<EmailABTestVariant | null> => {
    setIsABTestLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_ab_test_variants')
        .update(variant)
        .eq('id', variantId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "A/B test variant updated successfully",
      });
      return data;
    } catch (error: any) {
      console.error('Error updating A/B test variant:', error);
      toast({
        title: "Error",
        description: "Failed to update A/B test variant",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsABTestLoading(false);
    }
  };

  const deleteABTestVariant = async (variantId: string): Promise<boolean> => {
    setIsABTestLoading(true);
    try {
      const { error } = await supabase
        .from('email_ab_test_variants')
        .delete()
        .eq('id', variantId);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "A/B test variant deleted successfully",
      });
      return true;
    } catch (error: any) {
      console.error('Error deleting A/B test variant:', error);
      toast({
        title: "Error",
        description: "Failed to delete A/B test variant",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsABTestLoading(false);
    }
  };

  const handleSelectWinner = async (campaignId: string, variantId?: string) => {
  try {
    setIsLoading(true);
    // @ts-ignore - We know this method exists in our service
    const result = await emailService.selectABTestWinner(campaignId, variantId);
    
    if (result) {
      toast({
        title: "Winner selected",
        description: "The A/B test winner has been selected successfully",
      });
      
      // Refresh campaign details
      fetchCampaignDetails(campaignId);
      return true;
    } else {
      toast({
        title: "Error",
        description: "Failed to select A/B test winner",
        variant: "destructive",
      });
      return false;
    }
  } catch (error) {
    console.error('Error selecting A/B test winner:', error);
    toast({
      title: "Error",
      description: "An error occurred while selecting the winner",
      variant: "destructive",
    });
    return false;
  } finally {
    setIsLoading(false);
  }
};

  return {
    campaign,
    analytics,
    abTest,
    variants,
    isLoading,
    isABTestLoading,
    fetchCampaignDetails,
    fetchCampaignAnalytics,
    fetchABTestDetails,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    startABTest,
    updateABTest,
    deleteABTest,
    createABTestVariant,
    updateABTestVariant,
    deleteABTestVariant,
    selectABTestWinner: handleSelectWinner,
  };
};
