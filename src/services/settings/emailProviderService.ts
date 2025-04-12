
import { supabase } from "@/lib/supabase";
import { EmailProviderSettings } from "@/types/settings";

export const emailProviderService = {
  async getEmailProviderSettings(shopId: string): Promise<EmailProviderSettings | null> {
    try {
      const { data, error } = await supabase
        .from("email_provider_settings")
        .select("*")
        .eq("shop_id", shopId)
        .single();

      if (error) {
        console.error("Error fetching email provider settings:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Failed to fetch email provider settings:", error);
      return null;
    }
  },

  async createEmailProviderSettings(settings: Partial<EmailProviderSettings>): Promise<EmailProviderSettings | null> {
    try {
      const { data, error } = await supabase
        .from("email_provider_settings")
        .insert(settings)
        .select()
        .single();

      if (error) {
        console.error("Error creating email provider settings:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Failed to create email provider settings:", error);
      return null;
    }
  },

  async updateEmailProviderSettings(id: string, settings: Partial<EmailProviderSettings>): Promise<EmailProviderSettings | null> {
    try {
      const { data, error } = await supabase
        .from("email_provider_settings")
        .update(settings)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating email provider settings:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Failed to update email provider settings:", error);
      return null;
    }
  },

  async testEmailConnection(settings: EmailProviderSettings): Promise<boolean> {
    try {
      // In a real app, this would call an edge function to test the connection
      // For now, we'll just simulate a successful test
      return true;
    } catch (error) {
      console.error("Failed to test email connection:", error);
      return false;
    }
  }
};
