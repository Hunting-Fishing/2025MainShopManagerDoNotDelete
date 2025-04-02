import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function CompanyTab() {
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function loadCompanyInfo() {
      try {
        setLoading(true);
        
        // First get the shop settings to see if we have a shop configured
        const { data: settings, error: settingsError } = await supabase
          .from("shop_settings")
          .select("*")
          .single();
        
        if (settingsError && settingsError.code !== "PGRST116") {
          console.error("Error fetching shop settings:", settingsError);
          throw settingsError;
        }
        
        let shopData;
        
        if (settings?.shop_id) {
          // If we have a shop ID in settings, fetch that shop
          setShopId(settings.shop_id);
          
          const { data: shop, error: shopError } = await supabase
            .from("shops")
            .select("*")
            .eq("id", settings.shop_id)
            .single();
            
          if (shopError) {
            console.error("Error fetching shop:", shopError);
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
            console.error("Error fetching shops:", shopsError);
            throw shopsError;
          }
          
          if (shops && shops.length > 0) {
            shopData = shops[0];
            setShopId(shopData.id);
          }
        }
        
        // If we have shop data, use it to populate the form
        if (shopData) {
          const addressParts = (shopData.address || "").split(",").map(p => p.trim());
          
          setCompanyInfo({
            name: shopData.name || "",
            address: addressParts[0] || "",
            city: addressParts[1] || "",
            state: addressParts[2]?.split(" ")[0] || "",
            zip: addressParts[2]?.split(" ")[1] || "",
            phone: shopData.phone || "",
            email: shopData.email || ""
          });
        }
      } catch (error) {
        console.error("Failed to load company information:", error);
        toast({
          title: "Error",
          description: "Failed to load company information",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadCompanyInfo();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCompanyInfo(prev => ({
      ...prev,
      [id.replace("company-", "")]: value
    }));
  };

  const handleSave = async () => {
    if (!shopId) return;
    
    try {
      setSaving(true);
      
      // Format the address
      const formattedAddress = [
        companyInfo.address,
        companyInfo.city,
        `${companyInfo.state} ${companyInfo.zip}`
      ].filter(Boolean).join(", ");
      
      // Update the shop
      const { error: shopError } = await supabase
        .from("shops")
        .update({
          name: companyInfo.name,
          address: formattedAddress,
          phone: companyInfo.phone,
          email: companyInfo.email,
          updated_at: new Date().toISOString()
        })
        .eq("id", shopId);
        
      if (shopError) {
        console.error("Error updating shop:", shopError);
        throw shopError;
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
        console.error("Error updating shop settings:", upsertError);
        throw upsertError;
      }
      
      toast({
        title: "Success",
        description: "Company information saved successfully",
        variant: "success"
      });
    } catch (error) {
      console.error("Failed to save company information:", error);
      toast({
        title: "Error",
        description: "Failed to save company information",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input 
                    id="company-name" 
                    value={companyInfo.name} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-address">Address</Label>
                  <Input 
                    id="company-address" 
                    value={companyInfo.address} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-city">City</Label>
                  <Input 
                    id="company-city" 
                    value={companyInfo.city} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-state">State</Label>
                  <Input 
                    id="company-state" 
                    value={companyInfo.state} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-zip">Zip Code</Label>
                  <Input 
                    id="company-zip" 
                    value={companyInfo.zip} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Phone</Label>
                  <Input 
                    id="company-phone" 
                    value={companyInfo.phone} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">Email</Label>
                  <Input 
                    id="company-email" 
                    value={companyInfo.email} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  className="bg-esm-blue-600 hover:bg-esm-blue-700"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
