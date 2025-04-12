
import { supabase } from "@/lib/supabase";

export const businessIndustryService = {
  async addCustomIndustry(industryName: string): Promise<string | undefined> {
    try {
      if (!industryName.trim()) {
        console.error("Cannot add empty industry name");
        return undefined;
      }
      
      // Check if we're authenticated first
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        throw new Error("User must be authenticated to add custom industries");
      }
      
      // First check if the industry already exists to avoid duplicates
      const { data: existingIndustry } = await supabase
        .from("business_industries")
        .select("id")
        .eq("label", industryName)
        .maybeSingle();
        
      if (existingIndustry) {
        // Industry already exists, return its ID
        console.log("Industry already exists:", existingIndustry);
        return existingIndustry.id;
      }
      
      // Format the value (lowercase, replace spaces with underscores)
      const industryValue = industryName.toLowerCase().replace(/\s+/g, '_');
      
      // Add the new industry to the business_industries table
      const { data, error } = await supabase
        .from("business_industries")
        .insert({
          label: industryName,
          value: industryValue
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error adding industry:", error);
        throw error;
      }
      
      console.log("Successfully added new industry:", data);
      return data.id;
    } catch (error) {
      console.error("Error adding custom industry:", error);
      throw error;
    }
  }
};
