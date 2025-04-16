import { supabase } from "@/lib/supabase";
import { cleanPhoneNumber, formatPhoneNumber } from "@/utils/formatters";

// Types
export interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  taxId: string;
  businessType: string;
  industry: string;
  otherIndustry?: string;  
  logoUrl: string;
}

export interface BusinessHours {
  id?: string;
  shop_id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

// Company Info Methods
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
    
    // Get shop details
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
    
    console.log("Loaded company info:", companyInfo);
    
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
    
    // Clean phone number before saving
    const cleanedPhone = cleanPhoneNumber(companyInfo.phone || '');
    console.log("Original phone:", companyInfo.phone, "Cleaned phone:", cleanedPhone);

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
      updated_at: new Date().toISOString()
    };
    
    console.log("Updating company with data:", updateData);
    
    const { data, error } = await supabase
      .from('shops')
      .update(updateData)
      .eq('id', shopId)
      .select('*');
      
    if (error) {
      console.error("Error updating shop info:", error);
      throw error;
    }
    
    console.log("Company info updated successfully:", data);
    
    // Make sure we're returning consistent data format even if the response is empty
    let updatedInfo: CompanyInfo;
    
    if (data && data.length > 0) {
      const shopData = data[0];
      updatedInfo = {
        name: shopData?.name || companyInfo.name,
        address: shopData?.address || companyInfo.address,
        city: shopData?.city || companyInfo.city,
        state: shopData?.state || companyInfo.state,
        zip: shopData?.postal_code || companyInfo.zip,
        phone: shopData?.phone ? formatPhoneNumber(shopData.phone) : companyInfo.phone,
        email: shopData?.email || companyInfo.email,
        taxId: shopData?.tax_id || companyInfo.taxId,
        businessType: shopData?.business_type || companyInfo.businessType,
        industry: shopData?.industry || companyInfo.industry,
        otherIndustry: shopData?.other_industry || companyInfo.otherIndustry,
        logoUrl: shopData?.logo_url || companyInfo.logoUrl
      };
    } else {
      // If no data returned, use the input data as the result
      updatedInfo = { ...companyInfo };
    }
    
    return { success: true, data: updatedInfo };
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

export const companyService = {
  // Company Info Methods
  getShopInfo,
  updateCompanyInfo,
  uploadLogo,
  
  // Business Hours Methods
  getBusinessHours,
  updateBusinessHours,
  
  // Business Industry Methods
  addCustomIndustry
};
