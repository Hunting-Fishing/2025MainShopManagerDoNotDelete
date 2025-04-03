
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { CustomerFormValues } from "../schemas/customerSchema";
import { saveDraftCustomer, getDraftCustomer } from "@/services/customers";
import { useToast } from "@/hooks/use-toast";

interface UseDraftCustomerProps {
  form: UseFormReturn<CustomerFormValues>;
  singleShopMode: boolean;
  availableShops: Array<{id: string, name: string}>;
}

export const useDraftCustomer = ({ form, singleShopMode, availableShops }: UseDraftCustomerProps) => {
  const { toast } = useToast();
  
  // Load draft data on hook initialization
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draft = await getDraftCustomer();
        if (draft) {
          // If we're in single shop mode, ensure we use the current shop
          if (singleShopMode && availableShops.length === 1) {
            draft.shop_id = availableShops[0].id;
          }
          form.reset(draft);
          toast({
            title: "Draft Loaded",
            description: "Your previously saved draft has been loaded.",
            variant: "default",
          });
        }
      } catch (error) {
        console.error("Failed to load draft:", error);
      }
    };
    
    loadDraft();
  }, [form, toast, singleShopMode, availableShops]);

  // Save draft function
  const handleSaveDraft = async () => {
    try {
      const formData = form.getValues();
      await saveDraftCustomer(formData);
      toast({
        title: "Draft Saved",
        description: "Your customer information has been saved as a draft.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to save draft:", error);
    }
  };

  return { handleSaveDraft };
};
