import { supabase } from "@/lib/supabase";
import { CompanyInfo, BusinessHours } from "./companyService.types";
import { cleanPhoneNumber, formatPhoneNumber } from "@/utils/formatters";

// Re-export the types
export type { CompanyInfo, BusinessHours };

// Helper function to get company info from either shops table or company_settings
async function getShopInfo() {
  try {
    // Get the current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("User auth error:", userError);
      throw userError;
    }
    
    if (!user) {
      throw new Error("No authenticated user found");
    }
    
    console.log("Fetching shop info for user:", user.id);
    
    // Get the profile with shop_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('shop_id')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      console.error("Profile fetch error:", profileError);
      throw profileError;
    }
    
    const shopId = profile?.shop_id;
    
    if (!shopId) {
      console.error("No shop associated with this user");
      throw new Error("No shop associated with this user");
    }
    
    console.log("Found shop ID:", shopId);
    
    // First try to get company info from company_settings table
    const { data: settingsData, error: settingsError } = await supabase
      .from('company_settings')
      .select('settings_value')
      .eq('shop_id', shopId)
      .eq('settings_key', 'business_profile')
      .single();
    
    // If company_settings has data, use it
    if (!settingsError && settingsData) {
      console.log("Found company info in company_settings:", settingsData);
      
      // Extract values from settings_value JSONB
      const settings = settingsData.settings_value;
      
      // Map settings to CompanyInfo structure
      const companyInfo: CompanyInfo = {
        name: settings.name || "",
        address: settings.address || "",
        city: settings.city || "",
        state: settings.state || "",
        zip: settings.postal_code || settings.zip || "",
        phone: settings.phone ? formatPhoneNumber(settings.phone) : "",
        email: settings.email || "",
        taxId: settings.tax_id || settings.taxId || "",
        businessType: settings.business_type || settings.businessType || "",
        industry: settings.industry || "",
        otherIndustry: settings.other_industry || settings.otherIndustry || "",
        logoUrl: settings.logo_url || settings.logoUrl || ""
      };
      
      return { shopId, companyInfo };
    }
    
    // Fallback to getting info directly from shops table
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('*')
      .eq('id', shopId)
      .single();
      
    if (shopError) {
      console.error("Shop fetch error:", shopError);
      throw shopError;
    }
    
    console.log("Shop data from DB:", shop);
    
    if (!shop) {
      console.error("Shop not found");
      throw new Error("Shop not found");
    }
    
    // Format shop data to match CompanyInfo structure
    const companyInfo: CompanyInfo = {
      name: shop?.name || "",
      address: shop?.address || "",
      city: shop?.city || "",
      state: shop?.state || "",
      zip: shop?.postal_code || "",
      phone: shop?.phone ? formatPhoneNumber(shop.phone) : "",
      email: shop?.email || "",
      taxId: shop?.tax_id || "",
      businessType: shop?.business_type || "",
      industry: shop?.industry || "",
      otherIndustry: shop?.other_industry || "",
      logoUrl: shop?.logo_url || ""
    };
    
    return { shopId, companyInfo };
  } catch (error) {
    console.error("Error fetching shop info:", error);
    throw error;
  }
}

async function updateCompanyInfo(shopId: string, companyInfo: CompanyInfo) {
  try {
    if (!shopId) {
      throw new Error("Shop ID is required for updating company information");
    }
    
    console.log("Updating company info:", companyInfo);
    
    // Clean phone number before saving
    const cleanedPhone = cleanPhoneNumber(companyInfo.phone || '');
    
    // First, check if we have an entry in company_settings
    const { data: existingSettings } = await supabase
      .from('company_settings')
      .select('*')
      .eq('shop_id', shopId)
      .eq('settings_key', 'business_profile');
    
    // Prepare the business profile data for JSONB storage
    const businessProfileData = {
      name: companyInfo.name,
      address: companyInfo.address,
      city: companyInfo.city,
      state: companyInfo.state,
      postal_code: companyInfo.zip,
      phone: cleanedPhone,
      email: companyInfo.email,
      tax_id: companyInfo.taxId,
      business_type: companyInfo.businessType,
      industry: companyInfo.industry,
      other_industry: companyInfo.otherIndustry,
      logo_url: companyInfo.logoUrl,
      updated_at: new Date().toISOString()
    };
    
    // Use upsert to either update or insert into company_settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('company_settings')
      .upsert({
        id: existingSettings && existingSettings.length > 0 ? existingSettings[0].id : undefined,
        shop_id: shopId,
        settings_key: 'business_profile',
        settings_value: businessProfileData,
        updated_at: new Date().toISOString(),
        created_at: existingSettings && existingSettings.length > 0 ? existingSettings[0].created_at : new Date().toISOString()
      })
      .select();
    
    if (settingsError) {
      console.error("Error updating company_settings:", settingsError);
    } else {
      console.log("Updated company_settings successfully:", settingsData);
    }
    
    // Also update the shops table for backward compatibility
    const updateData = {
      name: companyInfo.name,
      address: companyInfo.address,
      city: companyInfo.city,
      state: companyInfo.state,
      postal_code: companyInfo.zip,
      phone: cleanedPhone,
      email: companyInfo.email,
      tax_id: companyInfo.taxId,
      business_type: companyInfo.businessType,
      industry: companyInfo.industry,
      other_industry: companyInfo.otherIndustry,
      logo_url: companyInfo.logoUrl,
      updated_at: new Date().toISOString()
    };
    
    console.log("Also updating shops table with:", updateData);
    
    const { data, error } = await supabase
      .from('shops')
      .update(updateData)
      .eq('id', shopId)
      .select('*');
      
    if (error) {
      console.error("Error updating shop info:", error);
      // We won't throw here since we've already updated company_settings
      console.warn("Failed to update shops table, but company_settings was updated");
    }
    
    console.log("Company info updated successfully in both tables");
    
    // Return the updated company info
    return { success: true, data: companyInfo };
  } catch (error) {
    console.error("Error updating company info:", error);
    throw error;
  }
}

async function uploadLogo(shopId: string, file: File) {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Generate a unique filename
    const fileName = `${shopId}_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const filePath = `${shopId}/${fileName}`;

    console.log("Uploading logo:", fileName);
    
    // Create shop_logos bucket if it doesn't exist
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('shop_logos');
    
    if (bucketError && bucketError.message.includes('not found')) {
      console.log("Creating shop_logos bucket");
      const { error: createBucketError } = await supabase.storage.createBucket('shop_logos', { public: true });
      
      if (createBucketError) {
        console.error('Error creating bucket:', createBucketError);
        throw createBucketError;
      }
    }
    
    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from('shop_logos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('shop_logos')
      .getPublicUrl(filePath);

    console.log('Logo uploaded, public URL:', publicUrl);

    // Update shop record with logo URL
    const { data: updatedShop, error: updateError } = await supabase
      .from('shops')
      .update({ logo_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', shopId)
      .select('*');

    if (updateError) {
      console.error('Shop update error:', updateError);
      throw updateError;
    }

    return publicUrl;
  } catch (error) {
    console.error('Logo upload failed:', error);
    throw error;
  }
}

// Business Hours Methods
async function getBusinessHours(shopId: string): Promise<BusinessHours[]> {
  try {
    console.log("Fetching business hours for shop:", shopId);
    
    if (!shopId) {
      console.error("No shop ID provided to getBusinessHours");
      throw new Error("Shop ID is required");
    }
    
    const { data, error } = await supabase
      .from('shop_hours')
      .select('*')
      .eq('shop_id', shopId)
      .order('day_of_week', { ascending: true });
      
    if (error) {
      console.error("Error fetching business hours:", error);
      throw error;
    }
    
    console.log("Raw business hours data:", data);
    
    // If no business hours exist yet, create default business hours
    if (!data || data.length === 0) {
      const defaultHours = [];
      for (let i = 0; i < 7; i++) {
        defaultHours.push({
          day_of_week: i,
          open_time: '09:00:00',
          close_time: '17:00:00',
          is_closed: i === 0 || i === 6, // Default closed on weekends
          shop_id: shopId
        });
      }
      return defaultHours;
    }
    
    // Filter out duplicate entries - keep only unique day_of_week values
    const uniqueHours = [];
    const dayMap = new Map();
    
    for (const hour of data) {
      if (!dayMap.has(hour.day_of_week)) {
        dayMap.set(hour.day_of_week, true);
        uniqueHours.push(hour);
      }
    }
    
    // Ensure all 7 days are represented
    const daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
    const existingDays = uniqueHours.map(h => h.day_of_week);
    
    for (const day of daysOfWeek) {
      if (!existingDays.includes(day)) {
        uniqueHours.push({
          day_of_week: day,
          open_time: '09:00:00',
          close_time: '17:00:00',
          is_closed: day === 0 || day === 6, // Default closed on weekends
          shop_id: shopId
        });
      }
    }
    
    // Sort by day of week
    uniqueHours.sort((a, b) => a.day_of_week - b.day_of_week);
    
    console.log("Processed business hours:", uniqueHours);
    
    return uniqueHours;
  } catch (error) {
    console.error("Error in getBusinessHours:", error);
    throw error;
  }
}

async function updateBusinessHours(shopId: string, businessHours: BusinessHours[]) {
  try {
    console.log("Updating business hours for shop", shopId);
    
    if (!shopId) {
      console.error("No shop ID provided to updateBusinessHours");
      throw new Error("Shop ID is required");
    }
    
    if (!businessHours || !Array.isArray(businessHours) || businessHours.length === 0) {
      console.error("Invalid business hours data:", businessHours);
      throw new Error("Valid business hours data is required");
    }
    
    // First, delete existing business hours
    const { error: deleteError } = await supabase
      .from('shop_hours')
      .delete()
      .eq('shop_id', shopId);
      
    if (deleteError) {
      console.error("Error deleting existing business hours:", deleteError);
      throw deleteError;
    }
    
    // Then insert new business hours
    const hoursToInsert = businessHours.map(hour => ({
      shop_id: shopId,
      day_of_week: hour.day_of_week,
      open_time: hour.open_time,
      close_time: hour.close_time,
      is_closed: hour.is_closed
    }));
    
    console.log("Inserting new business hours:", hoursToInsert);
    
    const { data, error } = await supabase
      .from('shop_hours')
      .insert(hoursToInsert)
      .select('*');
      
    if (error) {
      console.error("Error inserting business hours:", error);
      throw error;
    }
    
    console.log("Business hours updated successfully, returned data:", data);
    
    // Return the newly inserted hours to ensure state is up-to-date
    return data || hoursToInsert;
  } catch (error) {
    console.error("Error in updateBusinessHours:", error);
    throw error;
  }
}

// Business Industry Methods
async function addCustomIndustry(industryName: string) {
  try {
    const { data, error } = await supabase
      .from('business_industries')
      .insert({
        value: industryName.toLowerCase().replace(/\s+/g, '_'),
        label: industryName
      })
      .select();
      
    if (error) {
      console.error("Error adding custom industry:", error);
      throw error;
    }
    
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("Error in addCustomIndustry:", error);
    throw error;
  }
}

// Check if required tables exist
async function checkTablesExist() {
  try {
    // Check if shops table exists
    const { error: shopsError } = await supabase
      .from('shops')
      .select('id')
      .limit(1);
      
    if (shopsError && shopsError.message.includes('does not exist')) {
      console.error("Shops table does not exist!");
      return {
        shopsTableExists: false,
        businessHoursTableExists: false,
        error: "Database setup incomplete: shops table missing"
      };
    }
    
    // Check if shop_hours table exists
    const { error: hoursError } = await supabase
      .from('shop_hours')
      .select('id')
      .limit(1);
    
    if (hoursError && hoursError.message.includes('does not exist')) {
      console.error("Shop_hours table does not exist!");
      return {
        shopsTableExists: true,
        businessHoursTableExists: false,
        error: "Database setup incomplete: shop_hours table missing"
      };
    }
    
    return {
      shopsTableExists: true,
      businessHoursTableExists: true,
      error: null
    };
  } catch (error) {
    console.error("Error checking tables:", error);
    return {
      shopsTableExists: false,
      businessHoursTableExists: false,
      error: "Failed to check database tables"
    };
  }
}

export const companyService = {
  getShopInfo,
  updateCompanyInfo,
  uploadLogo,
  getBusinessHours,
  updateBusinessHours,
  addCustomIndustry,
  checkTablesExist
};
