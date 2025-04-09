
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
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
            title: "Authentication Error",
            description: "You must be logged in to create customers.",
            variant: "destructive"
          });
          navigate('/login');
          return;
        }
        
        // Get the user's profile to find their shop_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('shop_id')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          toast({
            title: "Error",
            description: "Failed to load user profile. Using default shop.",
            variant: "destructive"
          });
          
          // Fall back to fetching all shops
          const shops = await getAllShops();
          setAvailableShops(shops.map(shop => ({ id: shop.id, name: shop.name })));
          
          // Get default shop
          const defaultShop = await getDefaultShop();
          setCurrentUserShopId(defaultShop.id);
          
          return;
        }
        
        // Set the current user's shop ID
        setCurrentUserShopId(profile.shop_id);
        
        // Get all shops for dropdown (may be limited by RLS)
        const shops = await getAllShops();
        setAvailableShops(shops.map(shop => ({ id: shop.id, name: shop.name })));
      } catch (error) {
        console.error("Error fetching shop data:", error);
        toast({
          title: "Error",
          description: "Failed to load shop data. Using default values.",
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
