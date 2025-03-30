
import { useState, useEffect } from "react";
import { emailService } from "@/services/email/emailService";
import { EmailCampaign, EmailCampaignPreview } from "@/types/email";
import { useToast } from "@/hooks/use-toast";

export const useEmailCampaigns = () => {
  const [campaigns, setCampaigns] = useState<EmailCampaignPreview[]>([]);
  const [currentCampaign, setCurrentCampaign] = useState<EmailCampaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const data = await emailService.getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error("Error fetching email campaigns:", error);
      toast({
        title: "Error",
        description: "Failed to load email campaigns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignById = async (id: string) => {
    setCampaignLoading(true);
    try {
      const campaign = await emailService.getCampaignById(id);
      setCurrentCampaign(campaign);
      return campaign;
    } catch (error) {
      console.error("Error fetching email campaign:", error);
      toast({
        title: "Error",
        description: "Failed to load email campaign",
        variant: "destructive",
      });
      return null;
    } finally {
      setCampaignLoading(false);
    }
  };

  const createCampaign = async (campaign: Partial<EmailCampaign>) => {
    try {
      const newCampaign = await emailService.createCampaign(campaign);
      setCampaigns((prev) => [newCampaign, ...prev]);
      toast({
        title: "Success",
        description: "Email campaign created successfully",
      });
      return newCampaign;
    } catch (error) {
      console.error("Error creating email campaign:", error);
      toast({
        title: "Error",
        description: "Failed to create email campaign",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateCampaign = async (id: string, campaign: Partial<EmailCampaign>) => {
    try {
      const updatedCampaign = await emailService.updateCampaign(id, campaign);
      setCampaigns((prev) => 
        prev.map((c) => c.id === id ? { ...c, ...updatedCampaign } : c)
      );
      if (currentCampaign && currentCampaign.id === id) {
        setCurrentCampaign(updatedCampaign);
      }
      toast({
        title: "Success",
        description: "Email campaign updated successfully",
      });
      return updatedCampaign;
    } catch (error) {
      console.error("Error updating email campaign:", error);
      toast({
        title: "Error",
        description: "Failed to update email campaign",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      await emailService.deleteCampaign(id);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      if (currentCampaign && currentCampaign.id === id) {
        setCurrentCampaign(null);
      }
      toast({
        title: "Success",
        description: "Email campaign deleted successfully",
      });
      return true;
    } catch (error) {
      console.error("Error deleting email campaign:", error);
      toast({
        title: "Error",
        description: "Failed to delete email campaign",
        variant: "destructive",
      });
      return false;
    }
  };

  const scheduleCampaign = async (id: string, date: string) => {
    try {
      await emailService.scheduleEmailCampaign(id, date);
      fetchCampaigns(); // Refresh list to get updated status
      toast({
        title: "Success",
        description: "Email campaign scheduled successfully",
      });
      return true;
    } catch (error) {
      console.error("Error scheduling email campaign:", error);
      toast({
        title: "Error",
        description: "Failed to schedule email campaign",
        variant: "destructive",
      });
      return false;
    }
  };

  const sendCampaignNow = async (id: string) => {
    try {
      await emailService.sendEmailCampaignNow(id);
      fetchCampaigns(); // Refresh list to get updated status
      toast({
        title: "Success",
        description: "Email campaign started successfully",
      });
      return true;
    } catch (error) {
      console.error("Error sending email campaign:", error);
      toast({
        title: "Error",
        description: "Failed to send email campaign",
        variant: "destructive",
      });
      return false;
    }
  };

  const pauseCampaign = async (id: string) => {
    try {
      await emailService.pauseEmailCampaign(id);
      fetchCampaigns(); // Refresh list to get updated status
      toast({
        title: "Success",
        description: "Email campaign paused successfully",
      });
      return true;
    } catch (error) {
      console.error("Error pausing email campaign:", error);
      toast({
        title: "Error",
        description: "Failed to pause email campaign",
        variant: "destructive",
      });
      return false;
    }
  };

  const cancelCampaign = async (id: string) => {
    try {
      await emailService.cancelEmailCampaign(id);
      fetchCampaigns(); // Refresh list to get updated status
      toast({
        title: "Success",
        description: "Email campaign cancelled successfully",
      });
      return true;
    } catch (error) {
      console.error("Error cancelling email campaign:", error);
      toast({
        title: "Error",
        description: "Failed to cancel email campaign",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    campaigns,
    currentCampaign,
    loading,
    campaignLoading,
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
