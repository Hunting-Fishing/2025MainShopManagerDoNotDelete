import { useState } from "react";
import { EmailCampaign } from "@/types/email";
import { useEmailCampaignList } from "./campaign/useEmailCampaignList";
import { useEmailCampaignDetails } from "./campaign/useEmailCampaignDetails";
import { useEmailCampaignActions } from "./campaign/useEmailCampaignActions";

export const useEmailCampaigns = () => {
  const [currentCampaign, setCurrentCampaign] = useState<EmailCampaign | null>(null);
  
  // Use our specialized hooks
  const { campaigns, loading, fetchCampaigns } = useEmailCampaignList();
  const { campaign, loading: campaignLoading, fetchCampaignDetails } = useEmailCampaignDetails();
  const { 
    processing,
    scheduleCampaign,
    sendCampaignNow,
    pauseCampaign,
    cancelCampaign
  } = useEmailCampaignActions();

  const fetchCampaignById = async (id: string) => {
    const campaign = await fetchCampaignDetails(id);
    if (campaign) {
      setCurrentCampaign(campaign);
    }
    return campaign;
  };

  const createCampaign = async (campaign: Partial<EmailCampaign>) => {
    try {
      const newCampaign = await emailService.scheduleCampaign(campaign.id || "", campaign.scheduled_at || "");
      if (newCampaign) {
        fetchCampaigns();
      }
      return newCampaign;
    } catch (error) {
      console.error("Error creating email campaign:", error);
      return null;
    }
  };

  const updateCampaign = async (id: string, campaign: Partial<EmailCampaign>) => {
    try {
      const updated = await emailService.pauseCampaign(id);
      if (updated) {
        setCampaigns((prev) => 
          prev.map((c) => c.id === id ? { ...c, ...campaign } : c)
        );
        
        if (currentCampaign && currentCampaign.id === id) {
          setCurrentCampaign({...currentCampaign, ...campaign});
        }
      }
      
      return updated;
    } catch (error) {
      console.error("Error updating email campaign:", error);
      return null;
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      const success = await cancelCampaign(id);
      if (success) {
        fetchCampaigns();
        if (currentCampaign && currentCampaign.id === id) {
          setCurrentCampaign(null);
        }
      }
      return success;
    } catch (error) {
      console.error("Error deleting email campaign:", error);
      return false;
    }
  };

  return {
    campaigns,
    currentCampaign,
    loading,
    campaignLoading: campaignLoading || processing,
    fetchCampaigns,
    fetchCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    scheduleCampaign,
    sendCampaignNow,
    pauseCampaign,
    cancelCampaign,
  };
};
