
import { supabase } from "@/lib/supabase";
import { CompanyInfo } from "./companyService";

async function uploadLogo(shopId: string, file: File) {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Generate a unique filename
    const fileName = `${shopId}_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const filePath = `${shopId}/${fileName}`;

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
    const { error: updateError } = await supabase
      .from('shops')
      .update({ logo_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', shopId);

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
      throw userError;
    }
    
    if (!user) {
      throw new Error("No authenticated user found");
    }
    
    // Get the profile with shop_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('shop_id')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      throw profileError;
    }
    
    const shopId = profile?.shop_id;
    
    if (!shopId) {
      throw new Error("No shop associated with this user");
    }
    
    // Get shop details
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('*')
      .eq('id', shopId)
      .single();
      
    if (shopError) {
      throw shopError;
    }
    
    console.log("Shop data from DB:", shop);
    
    // Format shop data to match CompanyInfo structure
    const companyInfo: CompanyInfo = {
      name: shop?.name || "",
      address: shop?.address || "",
      city: shop?.city || "",
      state: shop?.state || "",
      zip: shop?.postal_code || "",
      phone: shop?.phone || "",
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
    console.log("Updating company info for shop", shopId, "with data:", companyInfo);
    
    // Update shop record
    const { data, error } = await supabase
      .from('shops')
      .update({
        name: companyInfo.name,
        address: companyInfo.address,
        city: companyInfo.city,
        state: companyInfo.state,
        postal_code: companyInfo.zip,
        phone: companyInfo.phone,
        email: companyInfo.email,
        tax_id: companyInfo.taxId,
        business_type: companyInfo.businessType,
        industry: companyInfo.industry,
        other_industry: companyInfo.otherIndustry,
        updated_at: new Date().toISOString()
      })
      .eq('id', shopId)
      .select('*'); // Select all fields to return updated record
      
    if (error) {
      console.error("Error updating shop info:", error);
      throw error;
    }
    
    console.log("Company info updated successfully:", data);
    return { success: true, data };
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
