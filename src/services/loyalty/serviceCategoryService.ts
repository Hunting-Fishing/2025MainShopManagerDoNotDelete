
import { supabase } from "@/lib/supabase";

// Fetch all service categories
export const getAllServiceCategories = async () => {
  try {
    const { data, error } = await supabase
      .from("service_categories")
      .select("*")
      .order("name");
      
    if (error) {
      console.error("Error fetching service categories:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getAllServiceCategories:", error);
    return [];
  }
};

// Get a service category by ID
export const getServiceCategoryById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("service_categories")
      .select("*")
      .eq("id", id)
      .single();
      
    if (error) {
      console.error("Error fetching service category:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in getServiceCategoryById:", error);
    return null;
  }
};
