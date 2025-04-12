
import { supabase } from "@/lib/supabase";
import { CompanyInfo } from "./companyService";

export const companyInfoService = {
  async getShopInfo() {
    try {
      // First get the shop settings to see if we have a shop configured
      const { data: settings, error: settingsError } = await supabase
        .from("shop_settings")
        .select("*")
        .single();
      
      if (settingsError && settingsError.code !== "PGRST116") {
        throw settingsError;
      }
      
      let shopData;
      let shopId = null;
      
      if (settings?.shop_id) {
        // If we have a shop ID in settings, fetch that shop
        shopId = settings.shop_id;
        
        const { data: shop, error: shopError } = await supabase
          .from("shops")
          .select("*")
          .eq("id", settings.shop_id)
          .single();
          
        if (shopError) {
          throw shopError;
        }
        
        shopData = shop;
      } else {
        // Otherwise get the first shop
        const { data: shops, error: shopsError } = await supabase
          .from("shops")
          .select("*")
          .limit(1);
          
        if (shopsError) {
          throw shopsError;
        }
        
        if (shops && shops.length > 0) {
          shopData = shops[0];
          shopId = shopData.id;
        }
      }
      
      if (!shopData) {
        throw new Error("No shop found");
      }
      
      // Get additional company settings
      const { data: companySettings } = await supabase
        .from("company_settings")
        .select("*")
        .eq("shop_id", shopId)
        .eq("settings_key", "business_profile")
        .maybeSingle();
      
      const addressParts = (shopData.address || "").split(",").map(p => p.trim());
      
      const companyInfo: CompanyInfo = {
        name: shopData.name || "",
        address: addressParts[0] || "",
        city: addressParts[1] || "",
        state: addressParts[2]?.split(" ")[0] || "",
        zip: addressParts[2]?.split(" ")[1] || "",
        phone: shopData.phone || "",
        email: shopData.email || "",
        taxId: companySettings?.settings_value?.taxId || "",
        businessType: companySettings?.settings_value?.businessType || "",
        industry: companySettings?.settings_value?.industry || "",
        otherIndustry: companySettings?.settings_value?.otherIndustry || "",
        logoUrl: shopData.logo_url || ""
      };
      
      return { shopId, companyInfo };
    } catch (error) {
      console.error("Error fetching shop info:", error);
      throw error;
    }
  },

  async updateCompanyInfo(shopId: string, companyInfo: CompanyInfo, businessHours: any[]) {
    try {
      // Check if we're authenticated first
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        throw new Error("User must be authenticated to update company information");
      }
      
      // Format the address
      const formattedAddress = [
        companyInfo.address,
        companyInfo.city,
        `${companyInfo.state} ${companyInfo.zip}`
      ].filter(Boolean).join(", ");
      
      // Update the shop - Make this more resilient by only updating fields we know exist
      const shopUpdateData: any = {
        name: companyInfo.name,
        address: formattedAddress,
        phone: companyInfo.phone,
        email: companyInfo.email,
        updated_at: new Date().toISOString()
      };
      
      // Only include logo_url if it's provided
      if (companyInfo.logoUrl) {
        shopUpdateData.logo_url = companyInfo.logoUrl;
      }
      
      const { error: shopError } = await supabase
        .from("shops")
        .update(shopUpdateData)
        .eq("id", shopId);
        
      if (shopError) {
        console.error("Shop update error:", shopError);
        // If the error is about the logo_url column, we can ignore it for now
        if (!shopError.message.includes('logo_url')) {
          throw shopError;
        }
      }
      
      // Save additional company settings
      const settingsValue = {
        taxId: companyInfo.taxId,
        businessType: companyInfo.businessType,
        industry: companyInfo.industry,
        otherIndustry: companyInfo.industry === "other" ? companyInfo.otherIndustry : ""
      };
      
      // Check if company settings exist first
      const { data: existingSettings } = await supabase
        .from("company_settings")
        .select("id")
        .eq("shop_id", shopId)
        .eq("settings_key", "business_profile")
        .maybeSingle();
      
      let settingsError;
      
      if (existingSettings) {
        // Update existing settings
        const { error } = await supabase
          .from("company_settings")
          .update({
            settings_value: settingsValue,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingSettings.id);
          
        settingsError = error;
      } else {
        // Insert new settings
        const { error } = await supabase
          .from("company_settings")
          .insert({
            shop_id: shopId,
            settings_key: "business_profile",
            settings_value: settingsValue,
            updated_at: new Date().toISOString()
          });
          
        settingsError = error;
      }
      
      if (settingsError) {
        throw settingsError;
      }
      
      // Ensure we have a shop_settings entry
      const { error: upsertError } = await supabase
        .from("shop_settings")
        .upsert({
          shop_id: shopId,
          name: companyInfo.name,
          address: formattedAddress,
          phone: companyInfo.phone,
          email: companyInfo.email,
          updated_at: new Date().toISOString()
        });
        
      if (upsertError) {
        throw upsertError;
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error updating company information:", error);
      throw error;
    }
  },

  async uploadLogo(shopId: string, file: File) {
    try {
      // Check if storage bucket exists and create if needed
      const { data: buckets } = await supabase.storage.listBuckets();
      const shopBucket = buckets?.find(b => b.name === 'shop_logos');
      
      if (!shopBucket) {
        await supabase.storage.createBucket('shop_logos', {
          public: true
        });
      }
      
      // Upload file
      const fileName = `${shopId}_${Date.now()}`;
      const { data, error } = await supabase.storage
        .from('shop_logos')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });
        
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('shop_logos')
        .getPublicUrl(fileName);
        
      return urlData?.publicUrl;
    } catch (error) {
      console.error("Error uploading logo:", error);
      throw error;
    }
  }
};
