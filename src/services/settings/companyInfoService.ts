
import { supabase } from "@/lib/supabase";
import { CompanyInfo } from "./companyService.types";
import { cleanPhoneNumber, formatPhoneNumber } from "@/utils/formatters";

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

export const companyInfoService = {
  getShopInfo,
  updateCompanyInfo,
  uploadLogo
};
