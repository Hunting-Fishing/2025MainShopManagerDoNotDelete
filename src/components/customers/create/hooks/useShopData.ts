
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getAllShops, getDefaultShop } from "@/services/shops/shopService";

export const useShopData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [availableShops, setAvailableShops] = useState<Array<{id: string, name: string}>>([]);
  const [currentUserShopId, setCurrentUserShopId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUserAndShopData() {
      try {
        setIsLoading(true);
        
        // Get the current authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "Authentication Required",
            description: "Please log in to continue.",
            variant: "destructive"
          });
          navigate('/login');
          return;
        }
        
        console.log("Fetching user profile for shop_id:", user.id);
        
        // Get the user's profile to find their shop_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('shop_id')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          console.log("Trying to get all shops instead");
          
          // Fall back to fetching all shops
          const shops = await getAllShops();
          console.log("Available shops from getAllShops:", shops);
          setAvailableShops(shops.map(shop => ({ id: shop.id, name: shop.name })));
          
          // Get default shop if no shops are available, show helpful message
          if (shops.length === 0) {
            toast({
              title: "No Shops Found",
              description: "Please create a shop first before adding customers.",
              variant: "destructive"
            });
            return;
          }
          
          setCurrentUserShopId(shops[0].id);
          return;
        }
        
        console.log("User profile shop_id:", profile?.shop_id);
        
        // Set the current user's shop ID
        setCurrentUserShopId(profile.shop_id);
        
        // Get all shops for dropdown (may be limited by RLS)
        console.log("Fetching all shops");
        const shops = await getAllShops();
        console.log("All shops:", shops);
        
        if (shops.length === 0) {
          toast({
            title: "No Shops Available",
            description: "Please contact your administrator to set up shops.",
            variant: "destructive"
          });
          return;
        }
        
        setAvailableShops(shops.map(shop => ({ id: shop.id, name: shop.name })));
      } catch (error) {
        console.error("Error fetching shop data:", error);
        toast({
          title: "Error",
          description: "Failed to load shop data. Please refresh the page and try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserAndShopData();
  }, [toast, navigate]);

  return {
    isLoading,
    availableShops,
    currentUserShopId
  };
};
