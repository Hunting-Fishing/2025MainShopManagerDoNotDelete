
import { supabase } from "@/lib/supabase";

async function addCustomIndustry(industryName: string) {
  try {
    // First check if this industry already exists
    const { data: existingIndustry, error: checkError } = await supabase
      .from('business_industries')
      .select('id')
      .ilike('label', industryName)
      .single();
      
    if (existingIndustry) {
      console.log("Industry already exists:", existingIndustry);
      return existingIndustry.id;
    }
    
    // Use the RPC function to add a new industry
    const { data, error } = await supabase.rpc('addcustomindustry', {
      industry_name: industryName
    });
    
    if (error) {
      console.error("Error adding custom industry:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in addCustomIndustry:", error);
    throw error;
  }
}

export const businessIndustryService = {
  addCustomIndustry
};
