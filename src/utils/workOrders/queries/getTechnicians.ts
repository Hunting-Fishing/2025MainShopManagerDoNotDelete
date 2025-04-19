
import { supabase } from "@/integrations/supabase/client";

// Function to get unique technicians from work orders
export async function getUniqueTechnicians(): Promise<string[]> {
  try {
    // Fetch technician data from profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .order('last_name');
    
    if (error) {
      console.error("Error fetching technicians:", error);
      return [];
    }

    // Format names as "First Last" and return the array
    const techNames = data.map(tech => 
      `${tech.first_name || ''} ${tech.last_name || ''}`.trim()
    ).filter(name => name.length > 0);
    
    return techNames;
  } catch (err) {
    console.error("Error in getUniqueTechnicians:", err);
    return [];
  }
}
