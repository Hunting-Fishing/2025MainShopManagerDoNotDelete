
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch all shops from the database that the user has access to
 */
export const getAllShops = async () => {
  const { data, error } = await supabase
    .from("shops")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching shops:", error);
    throw error;
  }

  return data || [];
};

/**
 * Fetch a specific shop by ID
 */
export const getShopById = async (shopId: string) => {
  const { data, error } = await supabase
    .from("shops")
    .select("*")
    .eq("id", shopId)
    .single();

  if (error) {
    console.error(`Error fetching shop with ID ${shopId}:`, error);
    throw error;
  }

  return data;
};

/**
 * Get the default shop for the system based on the current user
 */
export const getDefaultShop = async () => {
  // First try to get the user's shop from their profile
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', user.id)
        .single();
      
      if (!profileError && profile?.shop_id) {
        return await getShopById(profile.shop_id);
      }
    }
  } catch (error) {
    console.warn("Could not determine shop from user profile:", error);
  }
  
  // Try to get the default shop from settings
  try {
    const { data: settings, error: settingsError } = await supabase
      .from("shop_settings")
      .select("shop_id")
      .single();

    if (!settingsError && settings?.shop_id) {
      return await getShopById(settings.shop_id);
    }
  } catch (error) {
    console.warn("Could not determine default shop from settings:", error);
  }

  // Fall back to getting the first shop
  const { data, error } = await supabase
    .from("shops")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching default shop:", error);
    // As a last resort, return a placeholder shop with zero UUID
    return {
      id: "00000000-0000-0000-0000-000000000000",
      name: "Main Shop",
      organization_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      address: null,
      phone: null,
      email: null
    };
  }

  return data;
};
